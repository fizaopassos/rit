import { NextRequest, NextResponse } from "next/server";
import { desvincularEmail } from "@/services/emails.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await desvincularEmail(id);
  return NextResponse.json({ ok: true });
}