import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listarColaboradores, criarColaborador } from "@/services/colaboradores.service";

export async function GET() {
  const colaboradores = await listarColaboradores();
  return NextResponse.json(colaboradores);
}

const criarSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  rg: z.string().optional(),
  cpf: z.string().optional(),
  cargo: z.string().optional(),
  condominioId: z.string().optional(),
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

  const colaborador = await criarColaborador(parsed.data);
  return NextResponse.json(colaborador, { status: 201 });
}