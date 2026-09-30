import { NextRequest, NextResponse } from "next/server";
import { gerarComodatoPdf } from "@/services/documentos.service";
import { paraArrayBuffer } from "@/lib/pdf-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ alocacaoId: string }> },
) {
  const { alocacaoId } = await params;

  try {
    const pdf = await gerarComodatoPdf(alocacaoId);
    return new NextResponse(paraArrayBuffer(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="comodato-${alocacaoId}.pdf"`,
      },
    });
  } catch (err) {
    console.error(`Falha ao gerar comodato da alocação ${alocacaoId}:`, err);
    return NextResponse.json({ erro: "Não foi possível gerar o comodato" }, { status: 500 });
  }
}