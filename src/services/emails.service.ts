import { prisma } from "@/lib/prisma";

export async function listarEmails() {
  return prisma.emailWorkspace.findMany({
    orderBy: { email: "asc" },
    include: { colaborador: true, condominio: true },
  });
}

export async function criarEmail(dados: {
  email: string;
  condominioId?: string;
  colaboradorId?: string;
}) {
  return prisma.emailWorkspace.create({
    data: {
      email: dados.email,
      condominioId: dados.condominioId || null,
      colaboradorId: dados.colaboradorId || null,
      status: dados.colaboradorId ? "EM_USO" : "SEM_USO",
    },
  });
}

// Define quem está usando o email agora — não mexe no vínculo com o
// condomínio, que é a "identidade" fixa do endereço genérico.
export async function alterarResponsavelEmail(id: string, colaboradorId: string | null) {
  return prisma.emailWorkspace.update({
    where: { id },
    data: {
      colaboradorId,
      status: colaboradorId ? "EM_USO" : "SEM_USO",
    },
  });
}

export async function desvincularEmail(id: string) {
  return prisma.emailWorkspace.update({
    where: { id },
    data: { colaboradorId: null, status: "SEM_USO" },
  });
}
