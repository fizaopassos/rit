import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listarColaboradoresParaPerfil, criarColaborador } from "@/services/colaboradores.service";
import { autorizarApi } from "@/lib/sessao";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const acesso = await autorizarApi();
  if (!acesso.ok) return acesso.resposta;

  return NextResponse.json(await listarColaboradoresParaPerfil(acesso.sessao.perfil));
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
  const acesso = await autorizarApi("ADMIN");
  if (!acesso.ok) return acesso.resposta;

  const body = await req.json();
  const parsed = criarSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { erro: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const colaborador = await criarColaborador(parsed.data);

  if (parsed.data.cpf) {
    await prisma.logAuditoria.create({
      data: {
        appUsuarioId: acesso.sessao.sub,
        acao: "DEFINIU_CPF",
        entidade: "Colaborador",
        entidadeId: colaborador.id,
        campoSensivel: true,
      },
    });
  }

  // Só o necessário — o registro completo traz o CPF cifrado
  return NextResponse.json({ id: colaborador.id, nome: colaborador.nome }, { status: 201 });
}