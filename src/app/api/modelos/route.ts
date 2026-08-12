import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listarModelos, criarModelo } from "@/services/modelos.service";

export async function GET() {
  const modelos = await listarModelos();
  return NextResponse.json(modelos);
}

const TIPOS = [
  "NOTEBOOK",
  "DESKTOP",
  "TELEFONE_VOIP",
  "SMARTPHONE",
  "MONITOR",
  "IMPRESSORA",
  "OUTRO",
] as const;

const criarSchema = z.object({
  marcaId: z.string().min(1, "Marca é obrigatória"),
  nome: z.string().min(1, "Nome é obrigatório"),
  tipoEquipamento: z.enum(TIPOS),
  vidaUtilAnos: z.number().int().positive().optional(),
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
    const modelo = await criarModelo(parsed.data);
    return NextResponse.json(modelo, { status: 201 });
  } catch {
    return NextResponse.json(
      { erro: "Já existe um modelo com esse nome para essa marca" },
      { status: 409 },
    );
  }
}