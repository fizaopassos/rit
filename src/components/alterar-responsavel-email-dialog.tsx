"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Colaborador = { id: string; nome: string };
type Condominio = { id: string; nome: string };

export function AlterarResponsavelEmailDialog({
  emailId,
  dadosAtuais,
  onAlterado,
}: {
  emailId: string;
  dadosAtuais: { colaboradorId: string | null; condominioId: string | null };
  onAlterado: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [tipoVinculo, setTipoVinculo] = useState<"colaborador" | "condominio" | "nenhum">();
  const [colaboradorId, setColaboradorId] = useState<string>();
  const [condominioId, setCondominioId] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (open) {
      Promise.all([
        fetch("/api/colaboradores").then((r) => r.json()),
        fetch("/api/condominios").then((r) => r.json()),
      ]).then(([listaColaboradores, listaCondominios]) => {
        setColaboradores(listaColaboradores);
        setCondominios(listaCondominios);
        if (dadosAtuais.colaboradorId) {
          setTipoVinculo("colaborador");
          setColaboradorId(dadosAtuais.colaboradorId);
        } else if (dadosAtuais.condominioId) {
          setTipoVinculo("condominio");
          setCondominioId(dadosAtuais.condominioId);
        } else {
          setTipoVinculo("nenhum");
        }
      }).catch(() => toast.error("Não foi possível carregar os dados"));
    }
  }, [open, dadosAtuais.colaboradorId, dadosAtuais.condominioId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      const res = await fetch(`/api/emails/${emailId}/responsavel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          colaboradorId: tipoVinculo === "colaborador" ? colaboradorId : undefined,
          condominioId: tipoVinculo === "condominio" ? condominioId : undefined,
        }),
      });

      if (!res.ok) {
        toast.error("Erro ao alterar responsável");
        return;
      }

      toast.success("Responsável atualizado");
      setOpen(false);
      onAlterado();
    } catch {
      toast.error("Erro de conexão com o servidor");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm">Alterar responsável</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar responsável do email</DialogTitle>
          <DialogDescription>Escolha "Nenhum" para marcar como Sem uso.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Pertence a</Label>
            <Select value={tipoVinculo} onValueChange={(v) => v && setTipoVinculo(v as typeof tipoVinculo)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="colaborador">Um colaborador</SelectItem>
                <SelectItem value="condominio">Um condomínio (genérico)</SelectItem>
                <SelectItem value="nenhum">Ninguém (sem uso)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipoVinculo === "colaborador" && (
            <div className="space-y-2">
              <Label>Colaborador</Label>
              <Select value={colaboradorId} onValueChange={(v) => setColaboradorId(v ?? undefined)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {colaboradores.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {tipoVinculo === "condominio" && (
            <div className="space-y-2">
              <Label>Condomínio</Label>
              <Select value={condominioId} onValueChange={(v) => setCondominioId(v ?? undefined)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {condominios.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}