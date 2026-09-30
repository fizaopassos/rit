import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { sessaoValida, type SessionPayload } from "@/services/auth.service";

type Perfil = SessionPayload["perfil"];

// Sessão do usuário logado, já conferida no banco (ativo + perfil atual).
export async function sessaoAtual(): Promise<SessionPayload | null> {
  const token = (await cookies()).get("rit_session")?.value;
  return token ? sessaoValida(token) : null;
}

// Usado pelas páginas (Server Components). O proxy.ts já barra quem não tem
// sessão ou perfil, mas a página confere de novo antes de tocar no banco —
// e ler o cookie é o que torna a página dinâmica (sem isso o Next geraria a
// página uma vez no build com os dados congelados).
export async function exigirSessao(perfil?: Perfil): Promise<SessionPayload> {
  const sessao = await sessaoAtual();

  if (!sessao) redirect("/login");
  if (perfil && sessao.perfil !== perfil) redirect("/colaboradores");

  return sessao;
}

// Usado no início de toda rota /api. Não depende só do proxy.ts: o matcher
// dele ignora caminhos com extensão de imagem, e uma rota nova esquecida na
// lista de prefixos ficaria aberta.
//
//   const acesso = await autorizarApi("ADMIN");
//   if (!acesso.ok) return acesso.resposta;
export async function autorizarApi(
  perfil?: Perfil,
): Promise<{ ok: true; sessao: SessionPayload } | { ok: false; resposta: NextResponse }> {
  const sessao = await sessaoAtual();

  if (!sessao) {
    return { ok: false, resposta: NextResponse.json({ erro: "Não autenticado" }, { status: 401 }) };
  }
  if (perfil && sessao.perfil !== perfil) {
    return {
      ok: false,
      resposta: NextResponse.json({ erro: "Acesso restrito ao perfil Admin" }, { status: 403 }),
    };
  }

  return { ok: true, sessao };
}
