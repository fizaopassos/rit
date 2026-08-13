import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listarEmails, criarEmail } from "@/services/emails.service";

export async function GET() {
  const emails = await listarEmails();
  return NextResponse.json(emails);
}

const schema = z.object({
  email: z.string().email("Email inválido"),
  colaboradorId: z.string().optional(),
  condominioId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ erro: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    const email = await criarEmail(parsed.data);
    return NextResponse.json(email, { status: 201 });
  } catch {
    return NextResponse.json({ erro: "Esse email já está cadastrado" }, { status: 409 });
  }
}