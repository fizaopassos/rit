import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listarCondominios, criarCondominio } from "@/services/condominios.service";

export async function GET() {
  const condominios = await listarCondominios();
  return NextResponse.json(condominios);
}

const criarSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  codigo: z.string().min(1, "Código é obrigatório"),
  endereco: z.string().optional(),
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
    const condominio = await criarCondominio(parsed.data);
    return NextResponse.json(condominio, { status: 201 });
  } catch {
    return NextResponse.json(
      { erro: "Já existe um condomínio com esse código" },
      { status: 409 },
    );
  }
}