import { NextRequest, NextResponse } from "next/server";
import { criarAnexo } from "@/services/anexos.service";

const TIPOS = ["NOTA_FISCAL", "TERMO_COMODATO", "CHECKLIST_DEVOLUCAO", "OUTRO"] as const;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const formData = await req.formData();

  const arquivo = formData.get("arquivo") as File | null;
  const tipo = formData.get("tipo") as string | null;
  const numeroDocumento = formData.get("numeroDocumento") as string | null;
  const valor = formData.get("valor") as string | null;
  const data = formData.get("data") as string | null;

  if (!arquivo || !tipo || !TIPOS.includes(tipo as (typeof TIPOS)[number])) {
    return NextResponse.json({ erro: "Arquivo e tipo são obrigatórios" }, { status: 400 });
  }

  const buffer = Buffer.from(await arquivo.arrayBuffer());

  try {
    const anexo = await criarAnexo({
      equipamentoId: id,
      tipo: tipo as (typeof TIPOS)[number],
      arquivoBuffer: buffer,
      nomeArquivo: arquivo.name,
      contentType: arquivo.type || "application/octet-stream",
      numeroDocumento: numeroDocumento || undefined,
      valor: valor ? Number(valor) : undefined,
      data: data || undefined,
    });

    return NextResponse.json(anexo, { status: 201 });
  } catch {
    return NextResponse.json({ erro: "Falha ao enviar o arquivo" }, { status: 500 });
  }
}