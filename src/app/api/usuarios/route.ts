import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listarUsuarios } from "@/services/usuarios.service";
import { criarUsuario } from "@/services/auth.service";

export async function GET() {
  const usuarios = await listarUsuarios();
  return NextResponse.json(usuarios);
}

const criarSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha precisa ter ao menos 6 caracteres"),
  perfil: z.enum(["ADMIN", "CONSULTA"]),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = criarSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ erro: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    const usuario = await criarUsuario(parsed.data);
    return NextResponse.json({ id: usuario.id, nome: usuario.nome }, { status: 201 });
  } catch {
    return NextResponse.json({ erro: "Já existe um usuário com esse email" }, { status: 409 });
  }
}