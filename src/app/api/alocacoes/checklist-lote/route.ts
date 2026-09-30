import { NextRequest, NextResponse } from "next/server";
import { gerarChecklistPdfLote } from "@/services/documentos.service";
import { paraArrayBuffer } from "@/lib/pdf-utils";
import { autorizarApi } from "@/lib/sessao";

export async function GET(req: NextRequest) {
  const acesso = await autorizarApi("ADMIN");
  if (!acesso.ok) return acesso.resposta;

  const ids = req.nextUrl.searchParams.get("ids");

  if (!ids) {
    return NextResponse.json({ erro: "Nenhum ID informado" }, { status: 400 });
  }

  const alocacaoIds = ids.split(",").filter(Boolean);

  // Um checklist por devolução costuma ter poucos itens; o teto evita que um
  // pedido gigante prenda o Chrome do Puppeteer
  if (alocacaoIds.length > 50) {
    return NextResponse.json({ erro: "Máximo de 50 itens por checklist" }, { status: 400 });
  }

  try {
    const pdf = await gerarChecklistPdfLote(alocacaoIds, acesso.sessao.sub);
    return new NextResponse(paraArrayBuffer(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="checklist-lote.pdf"`,
      },
    });
  } catch (err) {
    console.error("Falha ao gerar checklist em lote:", err);
    return NextResponse.json({ erro: "Não foi possível gerar o checklist" }, { status: 500 });
  }
}