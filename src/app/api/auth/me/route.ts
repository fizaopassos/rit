import { NextResponse } from "next/server";
import { autorizarApi } from "@/lib/sessao";

export async function GET() {
  const acesso = await autorizarApi();
  if (!acesso.ok) return acesso.resposta;

  return NextResponse.json({ nome: acesso.sessao.nome, perfil: acesso.sessao.perfil });
}