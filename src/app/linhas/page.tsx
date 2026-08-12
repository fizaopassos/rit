"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { NovaLinhaDialog } from "@/components/nova-linha-dialog";
import { AlterarResponsavelLinhaDialog } from "@/components/alterar-responsavel-linha-dialog";

type Linha = {
  id: string;
  numero: string;
  operadora: string | null;
  plano: string | null;
  valorMensal: string | null;
  franquiaDadosGb: string | null;
  status: "ATIVA" | "CANCELADA" | "SEM_USO";
  colaborador: { id: string; nome: string; status: string } | null;
};

const STATUS_LABEL: Record<string, string> = {
  ATIVA: "Ativa",
  CANCELADA: "Cancelada",
  SEM_USO: "Sem uso",
};

export default function LinhasPage() {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch("/api/linhas");
      setLinhas(await res.json());
    } catch {
      toast.error("Não foi possível carregar as linhas");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function cancelar(id: string) {
    if (!confirm("Cancelar esta linha?")) return;
    try {
      const res = await fetch(`/api/linhas/${id}/cancelar`, { method: "POST" });
      if (!res.ok) {
        toast.error("Erro ao cancelar linha");
        return;
      }
      toast.success("Linha cancelada");
      carregar();
    } catch {
      toast.error("Erro de conexão com o servidor");
    }
  }

  const semVinculoAtivo = linhas.filter(
    (l) => l.status === "ATIVA" && (!l.colaborador || l.colaborador.status !== "ATIVO"),
  );

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Linhas móveis</h1>
          <p className="text-muted-foreground text-sm">
            Chips vinculados a colaboradores, com controle de cobrança.
          </p>
        </div>
        <NovaLinhaDialog onCriada={carregar} />
      </div>

      {semVinculoAtivo.length > 0 && (
        <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/5 p-4">
          <p className="font-medium text-destructive">
            {semVinculoAtivo.length} linha(s) ativa(s) sem colaborador ativo vinculado
          </p>
          <p className="text-muted-foreground text-xs">
            Provável cobrança sendo feita sem uso real — revise antes do próximo fechamento.
          </p>
        </div>
      )}

      {carregando ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : linhas.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhuma linha cadastrada ainda.</p>
      ) : (
        <ul className="divide-y rounded-md border">
          {linhas.map((l) => {
            const alerta = l.status === "ATIVA" && (!l.colaborador || l.colaborador.status !== "ATIVO");
            return (
              <li key={l.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium">
                    {l.numero} {l.operadora && <span className="text-muted-foreground font-normal">· {l.operadora}</span>}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {l.colaborador ? l.colaborador.nome : "Sem vínculo"}
                    {l.valorMensal && ` · R$ ${l.valorMensal}/mês`}
                    {l.franquiaDadosGb && ` · ${l.franquiaDadosGb}GB`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      alerta ? "bg-destructive/10 text-destructive" : "bg-muted"
                    }`}
                  >
                    {STATUS_LABEL[l.status]}
                  </span>
                  {l.status !== "CANCELADA" && (
                    <>
                      <AlterarResponsavelLinhaDialog
                        linhaId={l.id}
                        colaboradorAtualId={l.colaborador?.id ?? null}
                        onAlterado={carregar}
                      />
                      <Button variant="ghost" size="sm" onClick={() => cancelar(l.id)}>
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}