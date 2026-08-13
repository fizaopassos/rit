import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { atualizarCondominio } from "@/services/condominios.service";

const schema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  codigo: z.string().min(1, "Código é obrigatório"),
  endereco: z.string().optional(),
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
    const condominio = await atualizarCondominio(id, parsed.data);
    return NextResponse.json(condominio);
  } catch {
    return NextResponse.json({ erro: "Já existe um condomínio com esse código" }, { status: 409 });
  }
}