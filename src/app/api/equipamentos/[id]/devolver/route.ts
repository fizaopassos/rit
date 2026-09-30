import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { devolverEquipamento } from "@/services/alocacoes.service";
import { autorizarApi } from "@/lib/sessao";
import { respostaDeErro } from "@/lib/erros";

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
  const acesso = await autorizarApi("ADMIN");
  if (!acesso.ok) return acesso.resposta;

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
    return respostaDeErro(err, "Erro ao devolver");
  }
}