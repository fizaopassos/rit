import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { criarManutencao } from "@/services/manutencoes.service";

const TIPOS = ["PREVENTIVA", "CORRETIVA", "TROCA_PECA"] as const;

const schema = z.object({
  data: z.string().min(1),
  tipo: z.enum(TIPOS),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  pecaTrocada: z.string().optional(),
  custo: z.number().positive().optional(),
  fornecedor: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { erro: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const manutencao = await criarManutencao({ equipamentoId: id, ...parsed.data });
  return NextResponse.json(manutencao, { status: 201 });
}