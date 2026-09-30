import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { vincularEquipamento } from "@/services/alocacoes.service";
import { autorizarApi } from "@/lib/sessao";
import { respostaDeErro } from "@/lib/erros";

const schema = z.object({
  colaboradorId: z.string().min(1),
  itensEntrega: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const acesso = await autorizarApi("ADMIN");
  if (!acesso.ok) return acesso.resposta;

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ erro: "Selecione um colaborador" }, { status: 400 });
  }

  try {
    await vincularEquipamento(id, parsed.data.colaboradorId, parsed.data.itensEntrega);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return respostaDeErro(err, "Erro ao vincular");
  }
}
