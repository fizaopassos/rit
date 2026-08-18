"use client";

import { Input } from "@/components/ui/input";

function paraCentavos(valorDecimal: string): number {
  const numero = Number(valorDecimal);
  return Number.isFinite(numero) ? Math.round(numero * 100) : 0;
}

function formatarExibicao(centavos: number): string {
  if (!centavos) return "";
  return (centavos / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Input mascarado de moeda: o usuário digita só números, os 2 últimos
// dígitos sempre viram centavos (padrão de caixa eletrônico/maquininha).
// value/onChange trabalham com string decimal simples ("4569.80"), pra
// ser substituto direto de um <Input type="number"> sem mudar a lógica
// de envio pro backend.
export function MoneyInput({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: string;
  onChange: (valorDecimal: string) => void;
}) {
  const centavosAtual = paraCentavos(value);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digitos = e.target.value.replace(/\D/g, "");
    const centavos = Number(digitos || "0");
    onChange(centavos ? (centavos / 100).toFixed(2) : "");
  }

  return (
    <div className="relative">
      <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
        R$
      </span>
      <Input
        id={id}
        inputMode="numeric"
        value={formatarExibicao(centavosAtual)}
        onChange={handleChange}
        placeholder="0,00"
        className="pl-9"
      />
    </div>
  );
}
