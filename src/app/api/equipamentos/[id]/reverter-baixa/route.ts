import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { reverterBaixa } from "@/services/baixa.service";
import { autorizarApi } from "@/lib/sessao";
import { respostaDeErro } from "@/lib/erros";

const schema = z.object({
  justificativa: z.string().trim().min(5),
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
    return NextResponse.json(
      { erro: "Informe a justificativa (mínimo 5 caracteres)" },
      { status: 400 },
    );
  }

  try {
    await reverterBaixa(id, parsed.data.justificativa, acesso.sessao.sub);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return respostaDeErro(err, "Erro ao reverter baixa");
  }
}
