import { prisma } from "@/lib/prisma";
import { MotivoBaixa } from "@prisma/client";
import { MOTIVO_BAIXA_LABEL } from "@/lib/rotulos";
import { ErroNegocio } from "@/lib/erros";

export async function baixarEquipamento(
  equipamentoId: string,
  motivoBaixa: MotivoBaixa,
  observacaoBaixa?: string,
) {
  const equipamento = await prisma.equipamento.findUniqueOrThrow({
    where: { id: equipamentoId },
  });

  if (equipamento.status === "EM_USO") {
    throw new ErroNegocio("Devolva o equipamento antes de dar baixa");
  }

  if (equipamento.status === "BAIXADO") {
    throw new ErroNegocio("Equipamento já está baixado");
  }

  return prisma.equipamento.update({
    where: { id: equipamentoId },
    data: {
      status: "BAIXADO",
      dataBaixa: new Date(),
      motivoBaixa,
      observacaoBaixa,
    },
  });
}

// Desfaz uma baixa feita por engano. O equipamento volta pro estoque (a baixa
// só é permitida a partir de EM_ESTOQUE/EM_MANUTENCAO, então estoque é o estado
// seguro). Os dados da baixa original não se perdem: vão pras observações do
// equipamento, e a reversão fica registrada no LogAuditoria.
export async function reverterBaixa(
  equipamentoId: string,
  justificativa: string,
  appUsuarioId: string,
) {
  const equipamento = await prisma.equipamento.findUniqueOrThrow({
    where: { id: equipamentoId },
  });

  if (equipamento.status !== "BAIXADO") {
    throw new ErroNegocio("Equipamento não está baixado");
  }

  const hoje = new Date().toLocaleDateString("pt-BR");
  const dataBaixa = equipamento.dataBaixa?.toLocaleDateString("pt-BR") ?? "data desconhecida";
  const motivo = equipamento.motivoBaixa ? MOTIVO_BAIXA_LABEL[equipamento.motivoBaixa] : "—";
  const nota =
    `[${hoje}] Baixa revertida (baixa original em ${dataBaixa}, motivo: ${motivo}` +
    `${equipamento.observacaoBaixa ? ` — ${equipamento.observacaoBaixa}` : ""}). ` +
    `Justificativa: ${justificativa}`;

  return prisma.$transaction([
    prisma.equipamento.update({
      where: { id: equipamentoId },
      data: {
        status: "EM_ESTOQUE",
        dataBaixa: null,
        motivoBaixa: null,
        observacaoBaixa: null,
        observacoes: equipamento.observacoes ? `${equipamento.observacoes}\n${nota}` : nota,
      },
    }),
    prisma.logAuditoria.create({
      data: {
        appUsuarioId,
        acao: "REVERTEU_BAIXA",
        entidade: "Equipamento",
        entidadeId: equipamentoId,
      },
    }),
  ]);
}
