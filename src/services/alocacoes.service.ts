import { prisma } from "@/lib/prisma";
import { MotivoDevolucao } from "@prisma/client";

export async function buscarEquipamento(id: string) {
  return prisma.equipamento.findUnique({
    where: { id },
    include: {
      modelo: { include: { marca: true } },
      condominio: true,
      alocacoes: {
        orderBy: { dataInicio: "desc" },
        include: { colaborador: true },
      },
      manutencoes: { orderBy: { data: "desc" } },
      anexos: { orderBy: { criadoEm: "desc" } },
    },
  });
}

export async function vincularEquipamento(
  equipamentoId: string,
  colaboradorId: string,
) {
  const equipamento = await prisma.equipamento.findUniqueOrThrow({
    where: { id: equipamentoId },
  });

  if (equipamento.status === "EM_USO") {
    throw new Error("Equipamento já está em uso — devolva antes de vincular a outro colaborador");
  }

  return prisma.$transaction([
    prisma.alocacao.create({
      data: {
        equipamentoId,
        colaboradorId,
        tipo: "COMODATO",
        dataInicio: new Date(),
      },
    }),
    prisma.equipamento.update({
      where: { id: equipamentoId },
      data: { status: "EM_USO" },
    }),
  ]);
}

export async function devolverEquipamento(
  equipamentoId: string,
  motivoDevolucao: MotivoDevolucao,
) {
  const alocacaoAberta = await prisma.alocacao.findFirst({
    where: { equipamentoId, dataFim: null },
  });

  if (!alocacaoAberta) {
    throw new Error("Nenhuma alocação em aberto para este equipamento");
  }

  return prisma.$transaction([
    prisma.alocacao.update({
      where: { id: alocacaoAberta.id },
      data: { dataFim: new Date(), motivoDevolucao },
    }),
    prisma.equipamento.update({
      where: { id: equipamentoId },
      data: { status: "EM_ESTOQUE" },
    }),
  ]);
}