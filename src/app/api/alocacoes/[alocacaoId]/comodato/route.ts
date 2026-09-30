import { NextRequest, NextResponse } from "next/server";
import { gerarComodatoPdf } from "@/services/documentos.service";
import { paraArrayBuffer } from "@/lib/pdf-utils";
import { autorizarApi } from "@/lib/sessao";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ alocacaoId: string }> },
) {
  const acesso = await autorizarApi("ADMIN");
  if (!acesso.ok) return acesso.resposta;

  const { alocacaoId } = await params;

  try {
    const pdf = await gerarComodatoPdf(alocacaoId, acesso.sessao.sub);
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