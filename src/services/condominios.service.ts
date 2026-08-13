import { prisma } from "@/lib/prisma";

export async function listarCondominios() {
  return prisma.condominio.findMany({ orderBy: { nome: "asc" } });
}

export async function criarCondominio(dados: {
  nome: string;
  codigo: string;
  endereco?: string;
}) {
  return prisma.condominio.create({ data: dados });
}

export async function atualizarCondominio(
  id: string,
  dados: { nome: string; codigo: string; endereco?: string },
) {
  return prisma.condominio.update({ where: { id }, data: dados });
}