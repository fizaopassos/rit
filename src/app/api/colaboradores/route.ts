import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listarColaboradoresParaPerfil, criarColaborador } from "@/services/colaboradores.service";
import { verificarSessao } from "@/services/auth.service";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("rit_session")?.value;
  const sessao = token ? await verificarSessao(token) : null;
  return NextResponse.json(await listarColaboradoresParaPerfil(sessao?.perfil ?? "CONSULTA"));
}

const criarSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().optional(),
  cargo: z.string().optional(),
  condominioId: z.string().optional(),
  vinculoTipo: z.enum(["ADMINISTRADORA", "ASSOCIACAO_CONDOMINIO"]),
  tipoPessoa: z.enum(["PESSOA_FISICA", "PESSOA_JURIDICA"]),
  cnpj: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = criarSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { erro: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const colaborador = await criarColaborador(parsed.data);
  return NextResponse.json(colaborador, { status: 201 });
}