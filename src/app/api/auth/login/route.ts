import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { autenticar } from "@/services/auth.service";

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

  const resultado = await autenticar(parsed.data.email, parsed.data.senha);

  if (!resultado) {
    return NextResponse.json({ erro: "Credenciais inválidas" }, { status: 401 });
  }

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