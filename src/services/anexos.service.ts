import { prisma } from "@/lib/prisma";
import { enviarArquivo } from "@/lib/storage";
import { TipoAnexo } from "@prisma/client";

export async function criarAnexo(dados: {
  equipamentoId: string;
  alocacaoId?: string;
  manutencaoId?: string;
  tipo: TipoAnexo;
  arquivoBuffer: Buffer;
  nomeArquivo: string;
  contentType: string;
  numeroDocumento?: string;
  valor?: number;
  data?: string;
}) {
  // Caminho único: equipamentos/{id}/{timestamp}-{nome original}
  const caminho = `equipamentos/${dados.equipamentoId}/${Date.now()}-${dados.nomeArquivo}`;
  await enviarArquivo(caminho, dados.arquivoBuffer, dados.contentType);

  return prisma.anexo.create({
    data: {
      equipamentoId: dados.equipamentoId,
      alocacaoId: dados.alocacaoId,
      manutencaoId: dados.manutencaoId,
      tipo: dados.tipo,
      arquivoUrl: caminho, // guardamos o caminho, não uma URL — a URL assinada é gerada sob demanda
      numeroDocumento: dados.numeroDocumento,
      valor: dados.valor,
      data: dados.data ? new Date(dados.data) : undefined,
    },
  });
}