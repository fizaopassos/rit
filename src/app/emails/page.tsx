"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Emails Workspace</h1>
          <p className="text-muted-foreground text-sm">
            Pessoal (colaborador) ou genérico (condomínio, com responsável atual).
          </p>
        </div>
        <NovoEmailDialog onCriado={carregar} />
      </div>

      {semVinculoAtivo.length > 0 && (
        <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/5 p-4">
          <p className="font-medium text-destructive">
            {semVinculoAtivo.length} email(s) com responsável inativo
          </p>
          <p className="text-muted-foreground text-xs">
            Revise antes que alguém desligado continue com acesso ativo.
          </p>
        </div>
      )}

      {carregando ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : emails.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum email cadastrado ainda.</p>
      ) : (
        <ul className="divide-y rounded-md border">
          {emails.map((e) => {
            const alerta = e.status === "EM_USO" && e.colaborador && e.colaborador.status !== "ATIVO";
            return (
              <li key={e.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium">{e.email}</p>
                  <p className="text-muted-foreground text-xs">
                    {e.condominio && `Condomínio: ${e.condominio.nome}`}
                    {e.condominio && e.colaborador && " · "}
                    {e.colaborador && `Responsável: ${e.colaborador.nome}`}
                    {!e.condominio && !e.colaborador && "Sem vínculo"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${alerta ? "bg-destructive/10 text-destructive" : e.status === "EM_USO" ? "bg-muted" : "bg-destructive/10 text-destructive"}`}>
                    {e.status === "EM_USO" ? "Em uso" : "Sem uso"}
                  </span>
                  <AlterarResponsavelEmailDialog
                    emailId={e.id}
                    colaboradorAtualId={e.colaborador?.id ?? null}
                    onAlterado={carregar}
                  />
                  {e.status === "EM_USO" && (
                    <Button variant="ghost" size="sm" onClick={() => desvincular(e.id)}>Desvincular</Button>
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