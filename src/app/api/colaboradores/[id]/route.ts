import { NextRequest, NextResponse } from "next/server";
import { buscarColaborador } from "@/services/colaboradores.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const colaborador = await buscarColaborador(id);

  if (!colaborador) {
    return NextResponse.json({ erro: "Colaborador não encontrado" }, { status: 404 });
  }

  return NextResponse.json(colaborador);
}