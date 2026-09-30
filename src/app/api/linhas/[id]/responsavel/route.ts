import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { alterarResponsavelLinha } from "@/services/linhas.service";
import { autorizarApi } from "@/lib/sessao";

const schema = z.object({ colaboradorId: z.string().nullable() });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const acesso = await autorizarApi("ADMIN");
  if (!acesso.ok) return acesso.resposta;

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  await alterarResponsavelLinha(id, parsed.data.colaboradorId);
  return NextResponse.json({ ok: true });
}