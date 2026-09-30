import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listarMarcas, criarMarca } from "@/services/marcas.service";
import { autorizarApi } from "@/lib/sessao";

export async function GET() {
  const acesso = await autorizarApi("ADMIN");
  if (!acesso.ok) return acesso.resposta;

  const marcas = await listarMarcas();
  return NextResponse.json(marcas);
}

const criarSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
});

export async function POST(req: NextRequest) {
  const acesso = await autorizarApi("ADMIN");
  if (!acesso.ok) return acesso.resposta;

  const body = await req.json();
  const parsed = criarSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { erro: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  try {
    const marca = await criarMarca(parsed.data.nome);
    return NextResponse.json(marca, { status: 201 });
  } catch {
    return NextResponse.json(
      { erro: "Já existe uma marca com esse nome" },
      { status: 409 },
    );
  }
}