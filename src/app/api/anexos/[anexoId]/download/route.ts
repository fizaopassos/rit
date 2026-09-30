import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gerarUrlAssinada } from "@/lib/storage";
import { autorizarApi } from "@/lib/sessao";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ anexoId: string }> },
) {
  const acesso = await autorizarApi("ADMIN");
  if (!acesso.ok) return acesso.resposta;

  const { anexoId } = await params;
  const anexo = await prisma.anexo.findUnique({ where: { id: anexoId } });

  if (!anexo) {
    return NextResponse.json({ erro: "Anexo não encontrado" }, { status: 404 });
  }

  const url = await gerarUrlAssinada(anexo.arquivoUrl);
  return NextResponse.redirect(url);
}