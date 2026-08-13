import { prisma } from "@/lib/prisma";

export async function listarEmails() {
  return prisma.emailWorkspace.findMany({
    orderBy: { email: "asc" },
    include: { colaborador: true, condominio: true },
  });
}

export async function criarEmail(dados: {
  email: string;
  colaboradorId?: string;
  condominioId?: string;
}) {
  return prisma.emailWorkspace.create({
    data: {
      email: dados.email,
      colaboradorId: dados.colaboradorId || null,
      condominioId: dados.condominioId || null,
      status: dados.colaboradorId || dados.condominioId ? "EM_USO" : "SEM_USO",
    },
  });
}

export async function desvincularEmail(id: string) {
  return prisma.emailWorkspace.update({
    where: { id },
    data: { colaboradorId: null, condominioId: null, status: "SEM_USO" },
  });
}

export async function alterarResponsavelEmail(
  id: string,
  vinculo: { colaboradorId?: string; condominioId?: string },
) {
  const colaboradorId = vinculo.colaboradorId || null;
  const condominioId = vinculo.condominioId || null;

  return prisma.emailWorkspace.update({
    where: { id },
    data: {
      colaboradorId,
      condominioId,
      status: colaboradorId || condominioId ? "EM_USO" : "SEM_USO",
    },
  });
}