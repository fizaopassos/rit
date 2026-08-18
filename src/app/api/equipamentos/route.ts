import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listarEquipamentos, criarEquipamento } from "@/services/equipamentos.service";

export async function GET() {
  const equipamentos = await listarEquipamentos();
  return NextResponse.json(equipamentos);
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
  modeloId: z.string().min(1, "Modelo é obrigatório"),
  tipoEquipamento: z.enum(TIPOS),
  numeroSerie: z.string().optional(),
  proprietarioTipo: z.enum(["ADMINISTRADORA", "ASSOCIACAO_CONDOMINIO"]),
  condominioId: z.string().min(1, "Condomínio é obrigatório"),
  notaFiscalNumero: z.string().optional(),
  notaFiscalValor: z.number().positive().optional(),
  notaFiscalData: z.string().optional(),
  dataAquisicao: z.string().optional(),
  ipLocal: z.string().optional(),
  macAddress: z.string().optional(),
  numeroRamal: z.string().optional(),
  observacoes: z.string().optional(),
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

  const equipamento = await criarEquipamento(parsed.data);
  return NextResponse.json(equipamento, { status: 201 });
}