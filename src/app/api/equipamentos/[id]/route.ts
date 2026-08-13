import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buscarEquipamento } from "@/services/alocacoes.service";
import { atualizarEquipamento } from "@/services/equipamentos.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const equipamento = await buscarEquipamento(id);

  if (!equipamento) {
    return NextResponse.json({ erro: "Equipamento não encontrado" }, { status: 404 });
  }

  return NextResponse.json(equipamento);
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

const schema = z.object({
  modeloId: z.string().min(1),
  tipoEquipamento: z.enum(TIPOS),
  numeroSerie: z.string().optional(),
  notaFiscalNumero: z.string().optional(),
  notaFiscalValor: z.number().positive().optional(),
  notaFiscalData: z.string().optional(),
  dataAquisicao: z.string().optional(),
  ipLocal: z.string().optional(),
  macAddress: z.string().optional(),
  numeroRamal: z.string().optional(),
  itensInclusos: z.string().optional(),
  observacoes: z.string().optional(),
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

  const equipamento = await atualizarEquipamento(id, parsed.data);
  return NextResponse.json({ id: equipamento.id });
}
