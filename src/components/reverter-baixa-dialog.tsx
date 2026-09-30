"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ReverterBaixaDialog({
  equipamentoId,
  onRevertido,
}: {
  equipamentoId: string;
  onRevertido: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [justificativa, setJustificativa] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (justificativa.trim().length < 5) {
      toast.error("Informe a justificativa (mínimo 5 caracteres)");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(`/api/equipamentos/${equipamentoId}/reverter-baixa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ justificativa }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.erro ?? "Erro ao reverter baixa");
        return;
      }

      toast.success("Baixa revertida — equipamento voltou para o estoque");
      setOpen(false);
      setJustificativa("");
      onRevertido();
    } catch {
      toast.error("Erro de conexão com o servidor");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm">Reverter baixa</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reverter baixa</DialogTitle>
          <DialogDescription>
            Use quando a baixa foi feita por engano. O equipamento volta para o
            estoque; o motivo e a data da baixa original ficam registrados nas
            observações do equipamento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="justificativa">Justificativa</Label>
            <Input
              id="justificativa"
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Ex.: baixa lançada no equipamento errado"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Salvando..." : "Confirmar reversão"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
