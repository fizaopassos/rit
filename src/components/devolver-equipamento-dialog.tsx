"use client";

import { useState } from "react";
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

const MOTIVO_LABEL: Record<string, string> = {
  SAIDA_FUNCIONARIO: "Saída de funcionário da empresa",
  TROCA_APARELHO: "Troca de aparelho",
  FERIAS_LICENCA: "Férias ou licença",
  OUTROS: "Outros",
};

export function DevolverEquipamentoDialog({
  equipamentoId,
  onDevolvido,
}: {
  equipamentoId: string;
  onDevolvido: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!motivo) {
      toast.error("Selecione o motivo da devolução");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(`/api/equipamentos/${equipamentoId}/devolver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivoDevolucao: motivo }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.erro ?? "Erro ao devolver");
        return;
      }

      toast.success("Devolução registrada");
      setOpen(false);
      onDevolvido();
    } catch {
      toast.error("Erro de conexão com o servidor");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline">Devolver</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar devolução</DialogTitle>
          <DialogDescription>
            Mesma lista de motivos do checklist de devolução em papel.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Motivo</Label>
            <Select value={motivo} onValueChange={(v) => setMotivo(v ?? undefined)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MOTIVO_LABEL).map(([valor, label]) => (
                  <SelectItem key={valor} value={valor}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Salvando..." : "Confirmar devolução"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}