import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { baixarEquipamento } from "@/services/baixa.service";

const MOTIVOS = [
  "FURTO_ROUBO",
  "PERDA",
  "OBSOLESCENCIA",
  "DOACAO",
  "VENDA",
  "QUEBRA_IRREPARAVEL",
  "OUTRO",
] as const;

const schema = z.object({
  motivoBaixa: z.enum(MOTIVOS),
  observacaoBaixa: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ erro: "Selecione o motivo da baixa" }, { status: 400 });
  }

  try {
    await baixarEquipamento(id, parsed.data.motivoBaixa, parsed.data.observacaoBaixa);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : "Erro ao dar baixa";
    return NextResponse.json({ erro: mensagem }, { status: 409 });
  }
}