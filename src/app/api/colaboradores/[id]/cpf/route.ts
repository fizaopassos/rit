import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revelarCpf } from "@/services/colaboradores.service";
import { verificarSessao } from "@/services/auth.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const token = req.cookies.get("rit_session")?.value;
  const sessao = token ? await verificarSessao(token) : null;

  // Redundante com o proxy.ts (que já bloqueia perfil Consulta nesse
  // caminho), mas mantido aqui porque é dado sensível — nunca confia
  // só numa camada de proteção pra CPF.
  if (!sessao || sessao.perfil !== "ADMIN") {
    return NextResponse.json({ erro: "Acesso restrito" }, { status: 403 });
  }

  const cpf = await revelarCpf(id);

  if (!cpf) {
    return NextResponse.json({ erro: "CPF não cadastrado" }, { status: 404 });
  }

  await prisma.logAuditoria.create({
    data: {
      appUsuarioId: sessao.sub,
      acao: "VISUALIZOU_CPF",
      entidade: "Colaborador",
      entidadeId: id,
      campoSensivel: true,
    },
  });

  return NextResponse.json({ cpf });
}