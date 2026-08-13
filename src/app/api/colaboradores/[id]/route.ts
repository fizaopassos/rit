import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buscarColaborador, atualizarColaborador } from "@/services/colaboradores.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const colaborador = await buscarColaborador(id);

  if (!colaborador) {
    return NextResponse.json({ erro: "Colaborador não encontrado" }, { status: 404 });
  }

  return NextResponse.json(colaborador);
}

const schema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  rg: z.string().optional(),
  cargo: z.string().optional(),
  condominioId: z.string().optional(),
  status: z.enum(["ATIVO", "INATIVO"]),
  cpf: z.string().optional(),
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

  const colaborador = await atualizarColaborador(id, parsed.data);
  return NextResponse.json({ id: colaborador.id });
}