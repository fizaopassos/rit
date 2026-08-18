import puppeteer from "puppeteer";
import { prisma } from "@/lib/prisma";
import { decifrarCpf } from "@/lib/cpf";
import { buildComodatoHtml, buildChecklistHtml, buildChecklistHtmlLote } from "@/lib/pdf-templates";

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

export async function gerarComodatoPdf(alocacaoId: string) {
  const alocacao = await buscarAlocacaoParaDocumento(alocacaoId);
  const html = buildComodatoHtml(alocacao);
  return renderizarPdf(html);
}

export async function gerarChecklistPdf(alocacaoId: string) {
  const alocacao = await buscarAlocacaoParaDocumento(alocacaoId);
  const html = buildChecklistHtml(alocacao);
  return renderizarPdf(html);
}

export async function gerarChecklistPdfLote(alocacaoIds: string[]) {
  const alocacoes = await buscarAlocacoesParaDocumento(alocacaoIds);
  if (alocacoes.length === 0) {
    throw new Error("Nenhuma alocação encontrada para os IDs informados");
  }
  const html = buildChecklistHtmlLote(alocacoes);
  return renderizarPdf(html);
}
