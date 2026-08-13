import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { devolverEquipamentosEmLote } from "@/services/alocacoes.service";

const MOTIVOS = [
  "SAIDA_FUNCIONARIO",
  "TROCA_APARELHO",
  "FERIAS_LICENCA",
  "OUTROS",
] as const;

const schema = z.object({
  equipamentoIds: z.array(z.string()).min(1, "Selecione ao menos um equipamento"),
  motivoDevolucao: z.enum(MOTIVOS),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { erro: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  try {
    const alocacaoIds = await devolverEquipamentosEmLote(
      id,
      parsed.data.equipamentoIds,
      parsed.data.motivoDevolucao,
    );
    return NextResponse.json({ alocacaoIds });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : "Erro ao devolver";
    return NextResponse.json({ erro: mensagem }, { status: 409 });
  }
}