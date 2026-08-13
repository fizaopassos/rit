import { NextRequest, NextResponse } from "next/server";
import { verificarSessao } from "@/services/auth.service";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("rit_session")?.value;
  const sessao = token ? await verificarSessao(token) : null;

  if (!sessao) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }

  return NextResponse.json({ nome: sessao.nome, perfil: sessao.perfil });
}