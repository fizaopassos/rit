import { prisma } from "@/lib/prisma";
import { cifrarCpf, decifrarCpf, mascararCpf } from "@/lib/cpf";
import { ProprietarioTipo, TipoPessoa } from "@prisma/client";

export async function listarColaboradores() {
  const colaboradores = await prisma.colaborador.findMany({
    orderBy: { nome: "asc" },
    include: {
      condominio: { select: { nome: true } },
      linhas: { where: { status: "ATIVA" }, take: 1, select: { numero: true } },
      emails: { where: { status: "EM_USO" }, take: 1, select: { email: true } },
    },
  });

  // CPF nunca sai completo daqui — só mascarado. CNPJ não é dado sensível
  // (é público via Receita Federal), então sai normal.
  return colaboradores.map((c) => ({
    ...c,
    cpfMascarado: c.cpfCifrado ? mascararCpf(decifrarCpf(c.cpfCifrado)) : null,
    cpfCifrado: undefined,
    telefone: c.linhas[0]?.numero ?? null,
    email: c.emails[0]?.email ?? null,
  }));
}

export async function criarColaborador(dados: {
  nome: string;
  cpf?: string;
  cnpj?: string;
  tipoPessoa: TipoPessoa;
  cargo?: string;
  vinculoTipo: ProprietarioTipo;
  condominioId?: string;
}) {
  return prisma.colaborador.create({
    data: {
      nome: dados.nome,
      cargo: dados.cargo,
      tipoPessoa: dados.tipoPessoa,
      cnpj: dados.cnpj,
      vinculoTipo: dados.vinculoTipo,
      condominioId: dados.condominioId || null,
      cpfCifrado: dados.cpf ? cifrarCpf(dados.cpf) : undefined,
    },
  });
}

// Só chamado pela rota /api/colaboradores/[id]/cpf, restrita a Admin,
// e sempre acompanhada de um registro em LogAuditoria.
export async function revelarCpf(colaboradorId: string) {
  const colaborador = await prisma.colaborador.findUnique({
    where: { id: colaboradorId },
  });

  if (!colaborador?.cpfCifrado) return null;
  return decifrarCpf(colaborador.cpfCifrado);
}

export async function atualizarColaborador(
  id: string,
  dados: {
    nome: string;
    cargo?: string;
    tipoPessoa: TipoPessoa;
    cnpj?: string;
    vinculoTipo: ProprietarioTipo;
    condominioId?: string;
    status: "ATIVO" | "INATIVO";
    cpf?: string; // opcional — só re-cifra se um valor novo for enviado
  },
) {
  return prisma.colaborador.update({
    where: { id },
    data: {
      nome: dados.nome,
      cargo: dados.cargo,
      tipoPessoa: dados.tipoPessoa,
      cnpj: dados.cnpj,
      vinculoTipo: dados.vinculoTipo,
      condominioId: dados.condominioId || null,
      status: dados.status,
      ...(dados.cpf ? { cpfCifrado: cifrarCpf(dados.cpf) } : {}),
    },
  });
}

// Ficha do colaborador — traz só os equipamentos atualmente vinculados
// (alocações sem dataFim). Histórico completo continua sendo consulta
// da ficha do próprio equipamento.
export async function buscarColaborador(id: string) {
  const colaborador = await prisma.colaborador.findUnique({
    where: { id },
    include: {
      condominio: true,
      alocacoes: {
        where: { dataFim: null },
        include: {
          equipamento: {
            include: { modelo: { include: { marca: true } } },
          },
        },
      },
    },
  });

  if (!colaborador) return null;

  return {
    ...colaborador,
    cpfMascarado: colaborador.cpfCifrado ? mascararCpf(decifrarCpf(colaborador.cpfCifrado)) : null,
    cpfCifrado: undefined,
  };
}
