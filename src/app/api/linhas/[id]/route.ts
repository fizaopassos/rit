import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { atualizarLinha } from "@/services/linhas.service";

const schema = z.object({
  numero: z.string().min(1, "Número é obrigatório"),
  operadora: z.string().optional(),
  plano: z.string().optional(),
  valorMensal: z.number().positive().optional(),
  franquiaDadosGb: z.number().positive().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ erro: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    const linha = await atualizarLinha(id, parsed.data);
    return NextResponse.json(linha);
  } catch {
    return NextResponse.json({ erro: "Já existe uma linha com esse número" }, { status: 409 });
  }
}