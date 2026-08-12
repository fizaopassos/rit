import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { devolverEquipamento } from "@/services/alocacoes.service";

const MOTIVOS = [
  "SAIDA_FUNCIONARIO",
  "TROCA_APARELHO",
  "FERIAS_LICENCA",
  "OUTROS",
] as const;

const schema = z.object({ motivoDevolucao: z.enum(MOTIVOS) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ erro: "Selecione o motivo da devolução" }, { status: 400 });
  }

  try {
    await devolverEquipamento(id, parsed.data.motivoDevolucao);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : "Erro ao devolver";
    return NextResponse.json({ erro: mensagem }, { status: 409 });
  }
}