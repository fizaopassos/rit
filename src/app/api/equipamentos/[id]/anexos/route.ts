import { NextRequest, NextResponse } from "next/server";
import { criarAnexo } from "@/services/anexos.service";
import { autorizarApi } from "@/lib/sessao";

const TIPOS = ["NOTA_FISCAL", "TERMO_COMODATO", "CHECKLIST_DEVOLUCAO", "OUTRO"] as const;

// Documentos escaneados e fotos. SVG fica de fora (pode carregar script).
const FORMATOS_ACEITOS = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
// O proxy.ts bufferiza no máximo 10 MB do corpo (padrão do Next); 9 MB de
// arquivo deixa folga pro resto do formulário multipart
const TAMANHO_MAXIMO = 9 * 1024 * 1024;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const acesso = await autorizarApi("ADMIN");
  if (!acesso.ok) return acesso.resposta;

  const { id } = await params;
  const formData = await req.formData();

  const arquivo = formData.get("arquivo") as File | null;
  const tipo = formData.get("tipo") as string | null;
  const numeroDocumento = formData.get("numeroDocumento") as string | null;
  const valor = formData.get("valor") as string | null;
  const data = formData.get("data") as string | null;
  const manutencaoId = formData.get("manutencaoId") as string | null;

  if (!arquivo || !tipo || !TIPOS.includes(tipo as (typeof TIPOS)[number])) {
    return NextResponse.json({ erro: "Arquivo e tipo são obrigatórios" }, { status: 400 });
  }

  if (!FORMATOS_ACEITOS.includes(arquivo.type)) {
    return NextResponse.json({ erro: "Envie um PDF ou uma imagem (JPG, PNG, WebP ou HEIC)" }, { status: 400 });
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    return NextResponse.json({ erro: "Arquivo maior que 9 MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await arquivo.arrayBuffer());

  try {
    const anexo = await criarAnexo({
      equipamentoId: id,
      manutencaoId: manutencaoId || undefined,
      tipo: tipo as (typeof TIPOS)[number],
      arquivoBuffer: buffer,
      // Nome vira parte do caminho no bucket — só letras, números, ponto e hífen
      nomeArquivo: arquivo.name.normalize("NFD").replace(/[^\w.-]+/g, "_").slice(-100),
      contentType: arquivo.type,
      numeroDocumento: numeroDocumento || undefined,
      valor: valor ? Number(valor) : undefined,
      data: data || undefined,
    });

    return NextResponse.json(anexo, { status: 201 });
  } catch {
    return NextResponse.json({ erro: "Falha ao enviar o arquivo" }, { status: 500 });
  }
}