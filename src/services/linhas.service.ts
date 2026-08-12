import { prisma } from "@/lib/prisma";

export async function listarLinhas() {
  return prisma.linha.findMany({
    orderBy: { criadoEm: "desc" },
    include: { colaborador: true },
  });
}

export async function criarLinha(dados: {
  numero: string;
  operadora?: string;
  plano?: string;
  valorMensal?: number;
  franquiaDadosGb?: number;
  colaboradorId?: string;
}) {
  return prisma.linha.create({
    data: {
      numero: dados.numero,
      operadora: dados.operadora,
      plano: dados.plano,
      valorMensal: dados.valorMensal,
      franquiaDadosGb: dados.franquiaDadosGb,
      colaboradorId: dados.colaboradorId || null,
      status: dados.colaboradorId ? "ATIVA" : "SEM_USO",
      dataAtivacao: dados.colaboradorId ? new Date() : undefined,
    },
  });
}

export async function alterarResponsavelLinha(
  linhaId: string,
  colaboradorId: string | null,
) {
  return prisma.linha.update({
    where: { id: linhaId },
    data: {
      colaboradorId,
      status: colaboradorId ? "ATIVA" : "SEM_USO",
      dataAtivacao: colaboradorId ? new Date() : undefined,
    },
  });
}

export async function cancelarLinha(linhaId: string) {
  return prisma.linha.update({
    where: { id: linhaId },
    data: { status: "CANCELADA", dataCancelamento: new Date() },
  });
}