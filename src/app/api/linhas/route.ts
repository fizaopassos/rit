import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listarLinhas, criarLinha } from "@/services/linhas.service";

export async function GET() {
  const linhas = await listarLinhas();
  return NextResponse.json(linhas);
}

const criarSchema = z.object({
  numero: z.string().min(1, "Número é obrigatório"),
  operadora: z.string().optional(),
  plano: z.string().optional(),
  valorMensal: z.number().positive().optional(),
  franquiaDadosGb: z.number().positive().optional(),
  colaboradorId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = criarSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { erro: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  try {
    const linha = await criarLinha(parsed.data);
    return NextResponse.json(linha, { status: 201 });
  } catch {
    return NextResponse.json(
      { erro: "Já existe uma linha com esse número" },
      { status: 409 },
    );
  }
}