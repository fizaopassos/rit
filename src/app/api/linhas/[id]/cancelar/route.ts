import { NextRequest, NextResponse } from "next/server";
import { cancelarLinha } from "@/services/linhas.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await cancelarLinha(id);
  return NextResponse.json({ ok: true });
}