import { NextRequest, NextResponse } from "next/server";
import { verificarSessao } from "@/services/auth.service";

const ROTAS_PUBLICAS = ["/login", "/api/auth/login"];

const PREFIXOS_ADMIN = [
  "/equipamentos/novo",
  "/usuarios",
  "/api/equipamentos",
  "/api/usuarios",
  "/api/alocacoes",
  "/api/anexos",
];

// Rotas que exigem Admin mas não são só prefixo fixo (têm :id no meio)
const PADROES_ADMIN = [
  /^\/api\/colaboradores\/.+\/cpf$/,
  /^\/api\/colaboradores\/.+\/devolver$/,
];

// Prefixos onde GET é livre pra qualquer perfil autenticado, mas
// criar/editar/cancelar exige Admin.
const PREFIXOS_LEITURA_LIVRE = ["/api/linhas", "/api/emails", "/api/colaboradores"];

// Perfil Consulta só enxerga a lista de colaboradores (nome/telefone/email)
// — o resto do sistema é restrito ao TI.
function permitidoParaConsulta(pathname: string): boolean {
  if (pathname === "/colaboradores") return true;
  if (pathname === "/api/colaboradores") return true;
  if (pathname.startsWith("/api/auth/")) return true;
  return false;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (ROTAS_PUBLICAS.some((rota) => pathname.startsWith(rota))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("rit_session")?.value;
  const sessao = token ? await verificarSessao(token) : null;

  if (!sessao) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (sessao.perfil === "CONSULTA" && !permitidoParaConsulta(pathname)) {
    if (!pathname.startsWith("/api/")) {
      return NextResponse.redirect(new URL("/colaboradores", req.url));
    }
    return NextResponse.json({ erro: "Acesso restrito" }, { status: 403 });
  }

  const exigeAdminEscrita =
    PREFIXOS_LEITURA_LIVRE.some((p) => pathname.startsWith(p)) && req.method !== "GET";

  const exigeAdmin =
    PREFIXOS_ADMIN.some((prefixo) => pathname.startsWith(prefixo)) ||
    PADROES_ADMIN.some((padrao) => padrao.test(pathname)) ||
    exigeAdminEscrita;

  if (exigeAdmin && sessao.perfil !== "ADMIN") {
    return NextResponse.json(
      { erro: "Acesso restrito ao perfil Admin" },
      { status: 403 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};