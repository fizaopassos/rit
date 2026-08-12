import { prisma } from "@/lib/prisma";

export async function listarMarcas() {
  return prisma.marca.findMany({
    orderBy: { nome: "asc" },
    include: { _count: { select: { modelos: true } } },
  });
}

export async function criarMarca(nome: string) {
  return prisma.marca.create({ data: { nome } });
}

export async function excluirMarca(id: string) {
  return prisma.marca.delete({ where: { id } });
}