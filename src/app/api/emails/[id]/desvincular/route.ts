import { NextRequest, NextResponse } from "next/server";
import { desvincularEmail } from "@/services/emails.service";
import { autorizarApi } from "@/lib/sessao";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const acesso = await autorizarApi("ADMIN");
  if (!acesso.ok) return acesso.resposta;

  const { id } = await params;
  await desvincularEmail(id);
  return NextResponse.json({ ok: true });
}