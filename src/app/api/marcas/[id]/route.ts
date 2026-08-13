import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { atualizarMarca } from "@/services/marcas.service";

const schema = z.object({ nome: z.string().min(1, "Nome é obrigatório") });

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
    const marca = await atualizarMarca(id, parsed.data.nome);
    return NextResponse.json(marca);
  } catch {
    return NextResponse.json({ erro: "Já existe uma marca com esse nome" }, { status: 409 });
  }
}