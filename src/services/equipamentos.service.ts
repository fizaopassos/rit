import { prisma } from "@/lib/prisma";
import { ProprietarioTipo, TipoEquipamento } from "@prisma/client";

export async function listarEquipamentos() {
  const equipamentos = await prisma.equipamento.findMany({
    orderBy: { criadoEm: "desc" },
    include: {
      modelo: { include: { marca: true } },
      condominio: true,
      alocacoes: {
        where: { dataFim: null },
        take: 1,
        include: { colaborador: { select: { id: true, nome: true } } },
      },
    },
  });

  return equipamentos.map((eq) => ({
    ...eq,
    responsavel: eq.alocacoes[0]?.colaborador ?? null,
  }));
}

// ADM-0001 (administradora) ou COND-{codigo}-0001 (associação/condomínio)
async function gerarNumeroPatrimonio(
  proprietarioTipo: ProprietarioTipo,
  condominioId: string,
) {
  const condominio = await prisma.condominio.findUniqueOrThrow({
    where: { id: condominioId },
  });

  const prefixo =
    proprietarioTipo === "ADMINISTRADORA"
      ? "ADM"
      : `COND-${condominio.codigo}`;

  const quantidadeExistente = await prisma.equipamento.count({
    where: { numeroPatrimonio: { startsWith: `${prefixo}-` } },
  });

  const proximoNumero = String(quantidadeExistente + 1).padStart(4, "0");
  return `${prefixo}-${proximoNumero}`;
}

export async function criarEquipamento(dados: {
  modeloId: string;
  tipoEquipamento: TipoEquipamento;
  numeroSerie?: string;
  proprietarioTipo: ProprietarioTipo;
  condominioId: string;
  notaFiscalNumero?: string;
  notaFiscalValor?: number;
  notaFiscalData?: string;
  dataAquisicao?: string;
  ipLocal?: string;
  macAddress?: string;
  numeroRamal?: string;
  observacoes?: string;
}) {
  const numeroPatrimonio = await gerarNumeroPatrimonio(
    dados.proprietarioTipo,
    dados.condominioId,
  );

  return prisma.equipamento.create({
    data: {
      modeloId: dados.modeloId,
      tipoEquipamento: dados.tipoEquipamento,
      numeroSerie: dados.numeroSerie,
      numeroPatrimonio,
      proprietarioTipo: dados.proprietarioTipo,
      condominioId: dados.condominioId,
      notaFiscalNumero: dados.notaFiscalNumero,
      notaFiscalValor: dados.notaFiscalValor,
      notaFiscalData: dados.notaFiscalData ? new Date(dados.notaFiscalData) : undefined,
      dataAquisicao: dados.dataAquisicao ? new Date(dados.dataAquisicao) : undefined,
      ipLocal: dados.ipLocal,
      macAddress: dados.macAddress,
      numeroRamal: dados.numeroRamal,
      observacoes: dados.observacoes,
    },
    include: { modelo: { include: { marca: true } }, condominio: true },
  });
}

// Proprietário, condomínio e número de patrimônio ficam de fora — já
// podem estar impressos numa etiqueta física, então não são editáveis.
export async function atualizarEquipamento(
  id: string,
  dados: {
    modeloId: string;
    tipoEquipamento: TipoEquipamento;
    numeroSerie?: string;
    notaFiscalNumero?: string;
    notaFiscalValor?: number;
    notaFiscalData?: string;
    dataAquisicao?: string;
    ipLocal?: string;
    macAddress?: string;
    numeroRamal?: string;
    observacoes?: string;
  },
) {
  return prisma.equipamento.update({
    where: { id },
    data: {
      modeloId: dados.modeloId,
      tipoEquipamento: dados.tipoEquipamento,
      numeroSerie: dados.numeroSerie,
      notaFiscalNumero: dados.notaFiscalNumero,
      notaFiscalValor: dados.notaFiscalValor,
      notaFiscalData: dados.notaFiscalData ? new Date(dados.notaFiscalData) : undefined,
      dataAquisicao: dados.dataAquisicao ? new Date(dados.dataAquisicao) : undefined,
      ipLocal: dados.ipLocal,
      macAddress: dados.macAddress,
      numeroRamal: dados.numeroRamal,
      observacoes: dados.observacoes,
    },
  });
}