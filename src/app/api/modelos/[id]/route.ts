import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { atualizarModelo } from "@/services/modelos.service";

const TIPOS = [
  "NOTEBOOK",
  "DESKTOP",
  "TELEFONE_VOIP",
  "SMARTPHONE",
  "MONITOR",
  "IMPRESSORA",
  "OUTRO",
] as const;

const schema = z.object({
  marcaId: z.string().min(1),
  nome: z.string().min(1, "Nome é obrigatório"),
  tipoEquipamento: z.enum(TIPOS),
  vidaUtilAnos: z.number().int().positive().optional(),
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
    const modelo = await atualizarModelo(id, parsed.data);
    return NextResponse.json(modelo);
  } catch {
    return NextResponse.json({ erro: "Já existe um modelo com esse nome para essa marca" }, { status: 409 });
  }
}