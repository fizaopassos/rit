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

export function VincularEquipamentoDialog({
  equipamentoId,
  onVinculado,
}: {
  equipamentoId: string;
  onVinculado: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [colaboradorId, setColaboradorId] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/colaboradores")
        .then((r) => r.json())
        .then(setColaboradores)
        .catch(() => toast.error("Não foi possível carregar os colaboradores"));
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!colaboradorId) {
      toast.error("Selecione um colaborador");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(`/api/equipamentos/${equipamentoId}/vincular`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colaboradorId }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.erro ?? "Erro ao vincular");
        return;
      }

      toast.success("Equipamento vinculado");
      setOpen(false);
      onVinculado();
    } catch {
      toast.error("Erro de conexão com o servidor");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Vincular a usuário</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vincular a colaborador</DialogTitle>
          <DialogDescription>
            Isso registra o início do comodato e muda o status do equipamento
            para "Em uso". A geração do PDF do comodato vem na próxima etapa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <DialogFooter>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Vinculando..." : "Vincular"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}