export const TIPOS_EQUIPAMENTO = [
  "NOTEBOOK",
  "DESKTOP",
  "TELEFONE_VOIP",
  "SMARTPHONE",
  "MONITOR",
  "IMPRESSORA",
  "OUTRO",
] as const;

export type TipoEquipamentoValue = (typeof TIPOS_EQUIPAMENTO)[number];

export const TIPO_EQUIPAMENTO_LABEL: Record<TipoEquipamentoValue, string> = {
  NOTEBOOK: "Notebook",
  DESKTOP: "Desktop",
  TELEFONE_VOIP: "Telefone VoIP",
  SMARTPHONE: "Smartphone",
  MONITOR: "Monitor",
  IMPRESSORA: "Impressora",
  OUTRO: "Outro",
};