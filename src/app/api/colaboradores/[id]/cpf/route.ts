import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revelarCpf } from "@/services/colaboradores.service";
import { autorizarApi } from "@/lib/sessao";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const acesso = await autorizarApi("ADMIN");
  if (!acesso.ok) return acesso.resposta;

  const { id } = await params;

  const cpf = await revelarCpf(id);

  if (!cpf) {
    return NextResponse.json({ erro: "CPF não cadastrado" }, { status: 404 });
  }

  await prisma.logAuditoria.create({
    data: {
      appUsuarioId: acesso.sessao.sub,
      acao: "VISUALIZOU_CPF",
      entidade: "Colaborador",
      entidadeId: id,
      campoSensivel: true,
    },
  });

  return NextResponse.json({ cpf });
}