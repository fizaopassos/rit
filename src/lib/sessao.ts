import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verificarSessao, type SessionPayload } from "@/services/auth.service";

// Usado pelas páginas (Server Components). O proxy.ts já barra quem não tem
// sessão ou perfil, mas a página confere de novo antes de tocar no banco —
// e ler o cookie é o que torna a página dinâmica (sem isso o Next geraria a
// página uma vez no build com os dados congelados).
export async function exigirSessao(perfil?: SessionPayload["perfil"]): Promise<SessionPayload> {
  const token = (await cookies()).get("rit_session")?.value;
  const sessao = token ? await verificarSessao(token) : null;

  if (!sessao) redirect("/login");
  if (perfil && sessao.perfil !== perfil) redirect("/colaboradores");

  return sessao;
}
