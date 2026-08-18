import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listarColaboradores, criarColaborador } from "@/services/colaboradores.service";
import { verificarSessao } from "@/services/auth.service";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("rit_session")?.value;
  const sessao = token ? await verificarSessao(token) : null;
  const colaboradores = await listarColaboradores();

  // Consulta só recebe o essencial — nunca cargo, condomínio, CPF etc. —
  // e só colaboradores ativos (contato de quem já saiu não serve pra recepção).
  if (sessao?.perfil === "CONSULTA") {
    const enxuto = colaboradores
      .filter((c) => c.status === "ATIVO")
      .map((c) => ({
        id: c.id,
        nome: c.nome,
        telefone: c.telefone,
        email: c.email,
      }));
    return NextResponse.json(enxuto);
  }

  return NextResponse.json(colaboradores);
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