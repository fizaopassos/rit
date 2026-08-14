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
import { NovoEmailDialog } from "@/components/novo-email-dialog";
import { AlterarResponsavelEmailDialog } from "@/components/alterar-responsavel-email-dialog";

type EmailWorkspace = {
  id: string;
  email: string;
  status: "EM_USO" | "SEM_USO";
  colaborador: { id: string; nome: string; status: string } | null;
  condominio: { id: string; nome: string } | null;
};

export default function EmailsPage() {
  const [emails, setEmails] = useState<EmailWorkspace[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch("/api/emails");
      setEmails(await res.json());
    } catch {
      toast.error("Não foi possível carregar os emails");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function desvincular(id: string) {
    try {
      const res = await fetch(`/api/emails/${id}/desvincular`, { method: "POST" });
      if (!res.ok) {
        toast.error("Erro ao desvincular email");
        return;
      }
      toast.success("Responsável removido");
      carregar();
    } catch {
      toast.error("Erro de conexão com o servidor");
    }
  }

  const semVinculoAtivo = emails.filter(
    (e) => e.status === "EM_USO" && e.colaborador && e.colaborador.status !== "ATIVO",
  );

  return (
    <div className="mx-auto max-w-3xl p-8">
      <PageHeader
        title="Emails Workspace"
        description="Pessoal (colaborador) ou genérico (condomínio, com responsável atual)."
        action={<NovoEmailDialog onCriado={carregar} />}
      />

      {semVinculoAtivo.length > 0 && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="font-medium text-destructive">
            {semVinculoAtivo.length} email(s) com responsável inativo
          </p>
          <p className="text-muted-foreground text-xs">
            Revise antes que alguém desligado continue com acesso ativo.
          </p>
        </div>
      )}

      {carregando ? (
        <LoadingState rows={4} />
      ) : emails.length === 0 ? (
        <EmptyState message="Nenhum email cadastrado ainda." />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Vínculo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-px" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {emails.map((e) => {
                const alerta = e.status === "EM_USO" && e.colaborador && e.colaborador.status !== "ATIVO";
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.email}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {e.condominio && `Condomínio: ${e.condominio.nome}`}
                      {e.condominio && e.colaborador && " · "}
                      {e.colaborador && `Responsável: ${e.colaborador.nome}`}
                      {!e.condominio && !e.colaborador && "Sem vínculo"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={e.status === "EM_USO" ? "Em uso" : "Sem uso"}
                        tom={alerta ? "perigo" : e.status === "EM_USO" ? "sucesso" : "neutro"}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <AlterarResponsavelEmailDialog
                          emailId={e.id}
                          colaboradorAtualId={e.colaborador?.id ?? null}
                          onAlterado={carregar}
                        />
                        {e.status === "EM_USO" && (
                          <Button variant="ghost" size="sm" onClick={() => desvincular(e.id)}>
                            Desvincular
                          </Button>
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
