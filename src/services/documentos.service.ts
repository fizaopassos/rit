import puppeteer from "puppeteer";
import { prisma } from "@/lib/prisma";
import { decifrarCpf } from "@/lib/cpf";
import { buildComodatoHtml, buildChecklistHtml, buildChecklistHtmlLote } from "@/lib/pdf-templates";
import { ErroNegocio } from "@/lib/erros";

// O CPF fica cifrado no banco o tempo todo — só é decifrado aqui, no momento
// exato de montar o documento, nunca fica em texto puro em nenhum outro lugar.
function comCpfDecifrado<T extends { colaborador: { cpfCifrado: Buffer | null } }>(
  registro: T,
) {
  return {
    ...registro,
    colaborador: {
      ...registro.colaborador,
      cpf: registro.colaborador.cpfCifrado
        ? decifrarCpf(registro.colaborador.cpfCifrado)
        : null,
    },
  };
}

async function buscarAlocacaoParaDocumento(alocacaoId: string) {
  const alocacao = await prisma.alocacao.findUniqueOrThrow({
    where: { id: alocacaoId },
    include: {
      colaborador: true,
      equipamento: {
        include: {
          modelo: { include: { marca: true } },
          condominio: true,
          linha: true,
        },
      },
    },
  });
  return comCpfDecifrado(alocacao);
}

async function buscarAlocacoesParaDocumento(alocacaoIds: string[]) {
  const alocacoes = await prisma.alocacao.findMany({
    where: { id: { in: alocacaoIds } },
    include: {
      colaborador: true,
      equipamento: {
        include: {
          modelo: { include: { marca: true } },
          condominio: true,
          linha: true,
        },
      },
    },
  });
  return alocacoes.map(comCpfDecifrado);
}

async function renderizarPdf(html: string): Promise<Buffer> {
  // --no-sandbox é necessário rodando como usuário não-root no servidor
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({ format: "A4", printBackground: true });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

// Comodato e checklist imprimem o CPF completo — então gerar o documento é
// registrado igual ao "Ver CPF" (mesma entidade/id), pra auditoria por
// colaborador mostrar os dois caminhos até o dado.
async function registrarDocumento(
  appUsuarioId: string,
  acao: "GEROU_COMODATO" | "GEROU_CHECKLIST",
  colaboradores: { id: string; cpf: string | null }[],
) {
  const unicos = new Map(colaboradores.map((c) => [c.id, c]));
  await prisma.logAuditoria.createMany({
    data: [...unicos.values()].map((c) => ({
      appUsuarioId,
      acao,
      entidade: "Colaborador",
      entidadeId: c.id,
      campoSensivel: c.cpf !== null,
    })),
  });
}

export async function gerarComodatoPdf(alocacaoId: string, appUsuarioId: string) {
  const alocacao = await buscarAlocacaoParaDocumento(alocacaoId);
  const pdf = await renderizarPdf(buildComodatoHtml(alocacao));
  await registrarDocumento(appUsuarioId, "GEROU_COMODATO", [alocacao.colaborador]);
  return pdf;
}

export async function gerarChecklistPdf(alocacaoId: string, appUsuarioId: string) {
  const alocacao = await buscarAlocacaoParaDocumento(alocacaoId);
  const pdf = await renderizarPdf(buildChecklistHtml(alocacao));
  await registrarDocumento(appUsuarioId, "GEROU_CHECKLIST", [alocacao.colaborador]);
  return pdf;
}

export async function gerarChecklistPdfLote(alocacaoIds: string[], appUsuarioId: string) {
  const alocacoes = await buscarAlocacoesParaDocumento(alocacaoIds);
  if (alocacoes.length === 0) {
    throw new ErroNegocio("Nenhuma alocação encontrada para os IDs informados");
  }
  const pdf = await renderizarPdf(buildChecklistHtmlLote(alocacoes));
  await registrarDocumento(appUsuarioId, "GEROU_CHECKLIST", alocacoes.map((a) => a.colaborador));
  return pdf;
}
