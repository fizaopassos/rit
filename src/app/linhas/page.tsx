"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { EmptyState, LoadingState } from "@/components/empty-loading-states";
import { StatusBadge } from "@/components/status-badge";
import { NovaLinhaDialog } from "@/components/nova-linha-dialog";
import { AlterarResponsavelLinhaDialog } from "@/components/alterar-responsavel-linha-dialog";
import { EditarLinhaDialog } from "@/components/editar-linha-dialog";

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
    <div className="mx-auto max-w-4xl p-8">
      <PageHeader
        title="Linhas móveis"
        description="Chips vinculados a colaboradores, com controle de cobrança."
        action={<NovaLinhaDialog onCriada={carregar} />}
      />

      {semVinculoAtivo.length > 0 && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="font-medium text-destructive">
            {semVinculoAtivo.length} linha(s) ativa(s) sem colaborador ativo vinculado
          </p>
          <p className="text-muted-foreground text-xs">
            Provável cobrança sendo feita sem uso real — revise antes do próximo fechamento.
          </p>
        </div>
      )}

      {carregando ? (
        <LoadingState rows={4} />
      ) : linhas.length === 0 ? (
        <EmptyState message="Nenhuma linha cadastrada ainda." />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Linha</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-px" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((l) => {
                const alerta = l.status === "ATIVA" && (!l.colaborador || l.colaborador.status !== "ATIVO");
                return (
                  <TableRow key={l.id}>
                    <TableCell>
                      <div className="font-medium">{l.numero}</div>
                      {l.operadora && <div className="text-muted-foreground text-xs">{l.operadora}</div>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {l.colaborador ? l.colaborador.nome : "Sem vínculo"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {l.valorMensal ? `R$ ${l.valorMensal}/mês` : "—"}
                      {l.franquiaDadosGb && ` · ${l.franquiaDadosGb}GB`}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={STATUS_LABEL[l.status]}
                        tom={alerta ? "perigo" : l.status === "ATIVA" ? "sucesso" : "neutro"}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {l.status !== "CANCELADA" && (
                          <>
                            <EditarLinhaDialog linhaId={l.id} dadosAtuais={l} onEditado={carregar} />
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
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
