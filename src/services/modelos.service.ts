import { prisma } from "@/lib/prisma";
import { TipoEquipamento } from "@prisma/client";

export async function listarModelos() {
  return prisma.modelo.findMany({
    orderBy: [{ marca: { nome: "asc" } }, { nome: "asc" }],
    include: { marca: true, _count: { select: { equipamentos: true } } },
  });
}

export async function criarModelo(dados: {
  marcaId: string;
  nome: string;
  tipoEquipamento: TipoEquipamento;
  vidaUtilAnos?: number;
}) {
  return prisma.modelo.create({
    data: {
      marcaId: dados.marcaId,
      nome: dados.nome,
      tipoEquipamento: dados.tipoEquipamento,
      vidaUtilAnos: dados.vidaUtilAnos ?? 5,
    },
  });
}