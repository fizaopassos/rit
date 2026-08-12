import { NextRequest, NextResponse } from "next/server";
import { gerarChecklistPdf } from "@/services/documentos.service";
import { paraArrayBuffer } from "@/lib/pdf-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ alocacaoId: string }> },
) {
  const { alocacaoId } = await params;

  try {
    const pdf = await gerarChecklistPdf(alocacaoId);
    return new NextResponse(paraArrayBuffer(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="checklist-${alocacaoId}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ erro: "Não foi possível gerar o checklist" }, { status: 500 });
  }
}