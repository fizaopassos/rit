import { NextRequest, NextResponse } from "next/server";
import { verificarSessao } from "@/services/auth.service";

const ROTAS_PUBLICAS = ["/login", "/api/auth/login"];

const PREFIXOS_ADMIN = [
  "/equipamentos/novo",
  "/api/equipamentos",
  "/api/colaboradores/cpf",
  "/api/usuarios",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (ROTAS_PUBLICAS.some((rota) => pathname.startsWith(rota))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("rit_session")?.value;
  const sessao = token ? await verificarSessao(token) : null;

  if (!sessao) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const exigeAdmin = PREFIXOS_ADMIN.some((p) => pathname.startsWith(p));
  if (exigeAdmin && sessao.perfil !== "ADMIN") {
    return NextResponse.json({ erro: "Acesso restrito ao perfil Admin" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};