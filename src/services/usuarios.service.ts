import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { PerfilAcesso } from "@prisma/client";

export async function listarUsuarios() {
  return prisma.appUsuario.findMany({
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, email: true, perfil: true, ativo: true, criadoEm: true },
  });
}

export async function atualizarUsuario(
  id: string,
  dados: {
    nome: string;
    email: string;
    perfil: PerfilAcesso;
    ativo: boolean;
    novaSenha?: string;
  },
) {
  return prisma.appUsuario.update({
    where: { id },
    data: {
      nome: dados.nome,
      email: dados.email,
      perfil: dados.perfil,
      ativo: dados.ativo,
      ...(dados.novaSenha ? { senhaHash: await bcrypt.hash(dados.novaSenha, 10) } : {}),
    },
    select: { id: true, nome: true, email: true, perfil: true, ativo: true },
  });
}