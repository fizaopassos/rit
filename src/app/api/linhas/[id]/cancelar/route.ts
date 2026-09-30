import { NextRequest, NextResponse } from "next/server";
import { cancelarLinha } from "@/services/linhas.service";
import { autorizarApi } from "@/lib/sessao";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const acesso = await autorizarApi("ADMIN");
  if (!acesso.ok) return acesso.resposta;

  const { id } = await params;
  await cancelarLinha(id);
  return NextResponse.json({ ok: true });
}