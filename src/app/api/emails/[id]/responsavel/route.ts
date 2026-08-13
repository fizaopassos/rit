import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { alterarResponsavelEmail } from "@/services/emails.service";

const schema = z.object({
  colaboradorId: z.string().optional(),
  condominioId: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  await alterarResponsavelEmail(id, parsed.data);
  return NextResponse.json({ ok: true });
}