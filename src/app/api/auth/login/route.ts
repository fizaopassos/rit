import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { autenticar } from "@/services/auth.service";
import { loginBloqueado, registrarFalhaLogin, limparFalhasLogin } from "@/lib/limite-login";

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { erro: "Email e senha são obrigatórios" },
      { status: 400 },
    );
  }

  const { email, senha } = parsed.data;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || null;

  const minutos = loginBloqueado(email, ip);
  if (minutos !== null) {
    return NextResponse.json(
      { erro: `Muitas tentativas de login. Tente de novo em ${minutos} min.` },
      { status: 429 },
    );
  }

  const resultado = await autenticar(email, senha);

  if (!resultado) {
    registrarFalhaLogin(email, ip);
    return NextResponse.json({ erro: "Credenciais inválidas" }, { status: 401 });
  }

  limparFalhasLogin(email);

  const response = NextResponse.json({
    nome: resultado.usuario.nome,
    perfil: resultado.usuario.perfil,
  });

  response.cookies.set("rit_session", resultado.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });

  return response;
}