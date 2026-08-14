"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/empty-loading-states";
import { TIPO_EQUIPAMENTO_LABEL, TipoEquipamentoValue } from "@/lib/tipos-equipamento";

type Equipamento = {
  status: string;
  tipoEquipamento: TipoEquipamentoValue;
  condominio: { nome: string };
};

export default function Home() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch("/api/equipamentos")
      .then((r) => r.json())
      .then(setEquipamentos)
      .catch(() => toast.error("Não foi possível carregar os indicadores"))
      .finally(() => setCarregando(false));
  }, []);

  const indicadores = useMemo(() => ({
    total: equipamentos.length,
    emUso: equipamentos.filter((e) => e.status === "EM_USO").length,
    emEstoque: equipamentos.filter((e) => e.status === "EM_ESTOQUE").length,
    emManutencao: equipamentos.filter((e) => e.status === "EM_MANUTENCAO").length,
    baixados: equipamentos.filter((e) => e.status === "BAIXADO").length,
  }), [equipamentos]);

  const porCondominio = useMemo(() => {
    const mapa = new Map<string, number>();
    equipamentos.forEach((e) => mapa.set(e.condominio.nome, (mapa.get(e.condominio.nome) ?? 0) + 1));
    return Array.from(mapa.entries()).sort((a, b) => b[1] - a[1]);
  }, [equipamentos]);

  const porTipo = useMemo(() => {
    const mapa = new Map<string, number>();
    equipamentos.forEach((e) => {
      const label = TIPO_EQUIPAMENTO_LABEL[e.tipoEquipamento] ?? e.tipoEquipamento;
      mapa.set(label, (mapa.get(label) ?? 0) + 1);
    });
    return Array.from(mapa.entries()).sort((a, b) => b[1] - a[1]);
  }, [equipamentos]);

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">RIT — Retha Ativos</h1>
        <p className="text-muted-foreground mt-1 text-sm">Controle de ativos de tecnologia.</p>
      </div>

      {carregando ? (
        <LoadingState rows={2} />
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { label: "Total", valor: indicadores.total },
              { label: "Em uso", valor: indicadores.emUso },
              { label: "Em estoque", valor: indicadores.emEstoque },
              { label: "Em manutenção", valor: indicadores.emManutencao },
              { label: "Baixados", valor: indicadores.baixados },
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="px-4 py-3">
                  <p className="text-muted-foreground text-xs">{item.label}</p>
                  <p className="text-2xl font-semibold tabular-nums">{item.valor}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {equipamentos.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="px-5 py-4">
                  <p className="mb-3 text-sm font-medium">Por condomínio</p>
                  <ul className="space-y-2">
                    {porCondominio.map(([nome, qtd]) => (
                      <li key={nome} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{nome}</span>
                        <span className="font-medium tabular-nums">{qtd}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="px-5 py-4">
                  <p className="mb-3 text-sm font-medium">Por tipo</p>
                  <ul className="space-y-2">
                    {porTipo.map(([nome, qtd]) => (
                      <li key={nome} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{nome}</span>
                        <span className="font-medium tabular-nums">{qtd}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
