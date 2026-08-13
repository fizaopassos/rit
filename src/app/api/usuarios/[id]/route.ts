import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { atualizarUsuario } from "@/services/usuarios.service";

const schema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  perfil: z.enum(["ADMIN", "CONSULTA"]),
  ativo: z.boolean(),
  novaSenha: z.string().min(6).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ erro: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    const usuario = await atualizarUsuario(id, parsed.data);
    return NextResponse.json(usuario);
  } catch {
    return NextResponse.json({ erro: "Já existe um usuário com esse email" }, { status: 409 });
  }
}