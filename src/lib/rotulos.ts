import type { Tom } from "@/components/status-badge";

// Textos de exibição dos enums do Prisma, num lugar só — telas, diálogos e
// PDFs importam daqui em vez de manter cópias próprias.

export const STATUS_EQUIPAMENTO_LABEL: Record<string, string> = {
  EM_ESTOQUE: "Em estoque",
  EM_USO: "Em uso",
  EM_MANUTENCAO: "Em manutenção",
  BAIXADO: "Baixado",
};

export const STATUS_EQUIPAMENTO_TOM: Record<string, Tom> = {
  EM_ESTOQUE: "neutro",
  EM_USO: "sucesso",
  EM_MANUTENCAO: "aviso",
  BAIXADO: "perigo",
};

export const MOTIVO_BAIXA_LABEL: Record<string, string> = {
  FURTO_ROUBO: "Furto ou roubo",
  PERDA: "Perda",
  OBSOLESCENCIA: "Obsolescência",
  DOACAO: "Doação",
  VENDA: "Venda",
  QUEBRA_IRREPARAVEL: "Quebra irreparável",
  OUTRO: "Outro",
};

export const MOTIVO_DEVOLUCAO_LABEL: Record<string, string> = {
  SAIDA_FUNCIONARIO: "Saída de funcionário da empresa",
  TROCA_APARELHO: "Troca de aparelho",
  FERIAS_LICENCA: "Férias ou licença",
  OUTROS: "Outros",
};

export const TIPO_MANUTENCAO_LABEL: Record<string, string> = {
  PREVENTIVA: "Preventiva",
  CORRETIVA: "Corretiva",
  TROCA_PECA: "Troca de peça",
};

export const TIPO_ANEXO_LABEL: Record<string, string> = {
  NOTA_FISCAL: "Nota fiscal",
  TERMO_COMODATO: "Termo de comodato",
  CHECKLIST_DEVOLUCAO: "Checklist de devolução",
  OUTRO: "Outro",
};

// Usado tanto pro proprietário do equipamento quanto pro vínculo do colaborador
export const PROPRIETARIO_LABEL: Record<string, string> = {
  ADMINISTRADORA: "Administradora (Retha)",
  ASSOCIACAO_CONDOMINIO: "Associação / Condomínio",
};

export const STATUS_LINHA_LABEL: Record<string, string> = {
  ATIVA: "Ativa",
  CANCELADA: "Cancelada",
  SEM_USO: "Sem uso",
};

export const PERFIL_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  CONSULTA: "Consulta",
};
