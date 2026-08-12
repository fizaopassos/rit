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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MOTIVO_LABEL: Record<string, string> = {
  FURTO_ROUBO: "Furto ou roubo",
  PERDA: "Perda",
  OBSOLESCENCIA: "Obsolescência",
  DOACAO: "Doação",
  VENDA: "Venda",
  QUEBRA_IRREPARAVEL: "Quebra irreparável",
  OUTRO: "Outro",
};

export function BaixarEquipamentoDialog({
  equipamentoId,
  onBaixado,
}: {
  equipamentoId: string;
  onBaixado: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState<string>();
  const [observacao, setObservacao] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!motivo) {
      toast.error("Selecione o motivo da baixa");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(`/api/equipamentos/${equipamentoId}/baixa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivoBaixa: motivo, observacaoBaixa: observacao || undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.erro ?? "Erro ao dar baixa");
        return;
      }

      toast.success("Baixa registrada");
      setOpen(false);
      onBaixado();
    } catch {
      toast.error("Erro de conexão com o servidor");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive">Dar baixa</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dar baixa no equipamento</DialogTitle>
          <DialogDescription>
            Essa ação remove o equipamento do parque ativo. Ele continua
            consultável no histórico, mas sai dos relatórios de valor e
            depreciação do parque ativo.
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

          <div className="space-y-2">
            <Label htmlFor="observacao">Observações (opcional)</Label>
            <Input id="observacao" value={observacao} onChange={(e) => setObservacao(e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={enviando}>
              {enviando ? "Salvando..." : "Confirmar baixa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}