import { prisma } from "@/lib/prisma";
import { TipoManutencao } from "@prisma/client";

export async function criarManutencao(dados: {
  equipamentoId: string;
  data: string;
  tipo: TipoManutencao;
  descricao: string;
  pecaTrocada?: string;
  custo?: number;
  fornecedor?: string;
}) {
  return prisma.manutencao.create({
    data: {
      equipamentoId: dados.equipamentoId,
      data: new Date(dados.data),
      tipo: dados.tipo,
      descricao: dados.descricao,
      pecaTrocada: dados.pecaTrocada,
      custo: dados.custo,
      fornecedor: dados.fornecedor,
    },
  });
}