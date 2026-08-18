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

export function AlterarResponsavelEmailDialog({
  emailId,
  colaboradorAtualId,
  onAlterado,
}: {
  emailId: string;
  colaboradorAtualId: string | null;
  onAlterado: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [colaboradorId, setColaboradorId] = useState<string | undefined>();
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/colaboradores")
        .then((r) => r.json())
        .then((lista: Colaborador[]) => {
          setColaboradores(lista);
          setColaboradorId(colaboradorAtualId ?? undefined);
        })
        .catch(() => toast.error("Não foi possível carregar os colaboradores"));
    }
  }, [open, colaboradorAtualId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      const res = await fetch(`/api/emails/${emailId}/responsavel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colaboradorId: colaboradorId ?? null }),
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
          <DialogDescription>
            Deixar em branco marca como Sem uso. O vínculo com o condomínio
            (se houver) não muda aqui.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Colaborador</Label>
                        <Select value={colaboradorId} onValueChange={(v) => setColaboradorId(v ?? undefined)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sem vínculo">
                  {(valor: string | null) => colaboradores.find((c) => c.id === valor)?.nome ?? "Sem vínculo"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {colaboradores.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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