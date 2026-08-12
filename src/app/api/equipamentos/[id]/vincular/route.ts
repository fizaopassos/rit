import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { vincularEquipamento } from "@/services/alocacoes.service";

const schema = z.object({ colaboradorId: z.string().min(1) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ erro: "Selecione um colaborador" }, { status: 400 });
  }

  try {
    await vincularEquipamento(id, parsed.data.colaboradorId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : "Erro ao vincular";
    return NextResponse.json({ erro: mensagem }, { status: 409 });
  }
}