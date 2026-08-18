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
  itensEntrega?: string,
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
        itensEntrega,
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
  itensDevolucao?: string,
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
      data: { dataFim: new Date(), motivoDevolucao, itensDevolucao },
    }),
    prisma.equipamento.update({
      where: { id: equipamentoId },
      data: { status: "EM_ESTOQUE" },
    }),
  ]);
}

// Devolução em lote — fecha várias alocações do mesmo colaborador de uma
// vez (mesmo motivo e mesmos itens devolvidos pra todas) e devolve os IDs
// fechados, usados depois para gerar um único PDF de checklist.
export async function devolverEquipamentosEmLote(
  colaboradorId: string,
  equipamentoIds: string[],
  motivoDevolucao: MotivoDevolucao,
  itensDevolucao?: string,
) {
  const alocacoesAbertas = await prisma.alocacao.findMany({
    where: { colaboradorId, equipamentoId: { in: equipamentoIds }, dataFim: null },
  });

  if (alocacoesAbertas.length === 0) {
    throw new Error("Nenhuma alocação em aberto encontrada para os equipamentos selecionados");
  }

  const agora = new Date();
  const alocacaoIds = alocacoesAbertas.map((a) => a.id);
  const equipIds = alocacoesAbertas.map((a) => a.equipamentoId);

  await prisma.$transaction([
    prisma.alocacao.updateMany({
      where: { id: { in: alocacaoIds } },
      data: { dataFim: agora, motivoDevolucao, itensDevolucao },
    }),
    prisma.equipamento.updateMany({
      where: { id: { in: equipIds } },
      data: { status: "EM_ESTOQUE" },
    }),
  ]);

  return alocacaoIds;
}
