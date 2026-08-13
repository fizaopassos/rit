import { NextRequest, NextResponse } from "next/server";
import { gerarChecklistPdfLote } from "@/services/documentos.service";
import { paraArrayBuffer } from "@/lib/pdf-utils";

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids");

  if (!ids) {
    return NextResponse.json({ erro: "Nenhum ID informado" }, { status: 400 });
  }

  const alocacaoIds = ids.split(",").filter(Boolean);

  try {
    const pdf = await gerarChecklistPdfLote(alocacaoIds);
    return new NextResponse(paraArrayBuffer(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="checklist-lote.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ erro: "Não foi possível gerar o checklist" }, { status: 500 });
  }
}