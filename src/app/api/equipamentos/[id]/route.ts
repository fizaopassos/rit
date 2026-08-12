import { NextRequest, NextResponse } from "next/server";
import { buscarEquipamento } from "@/services/alocacoes.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const equipamento = await buscarEquipamento(id);

  if (!equipamento) {
    return NextResponse.json({ erro: "Equipamento não encontrado" }, { status: 404 });
  }

  return NextResponse.json(equipamento);
}