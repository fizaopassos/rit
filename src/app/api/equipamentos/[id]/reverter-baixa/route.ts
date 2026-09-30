import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { reverterBaixa } from "@/services/baixa.service";
import { verificarSessao } from "@/services/auth.service";

const schema = z.object({
  justificativa: z.string().trim().min(5),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // O proxy.ts já restringe /api/equipamentos ao Admin; a sessão aqui é
  // pra saber quem reverteu e registrar no LogAuditoria.
  const token = req.cookies.get("rit_session")?.value;
  const sessao = token ? await verificarSessao(token) : null;
  if (!sessao || sessao.perfil !== "ADMIN") {
    return NextResponse.json({ erro: "Acesso restrito" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { erro: "Informe a justificativa (mínimo 5 caracteres)" },
      { status: 400 },
    );
  }

  try {
    await reverterBaixa(id, parsed.data.justificativa, sessao.sub);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : "Erro ao reverter baixa";
    return NextResponse.json({ erro: mensagem }, { status: 409 });
  }
}
