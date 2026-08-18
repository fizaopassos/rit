"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function DevolverEmLoteDialog({
  colaboradorId,
  equipamentoIds,
  onDevolvido,
}: {
  colaboradorId: string;
  equipamentoIds: string[];
  onDevolvido: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState<string>();
  const [itensDevolucao, setItensDevolucao] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!motivo) {
      toast.error("Selecione o motivo da devolução");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(`/api/colaboradores/${colaboradorId}/devolver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipamentoIds,
          motivoDevolucao: motivo,
          itensDevolucao: itensDevolucao || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.erro ?? "Erro ao devolver");
        return;
      }

      toast.success(`${data.alocacaoIds.length} equipamento(s) devolvido(s)`);
      window.open(`/api/alocacoes/checklist-lote?ids=${data.alocacaoIds.join(",")}`, "_blank");

      setMotivo(undefined);
      setItensDevolucao("");
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
      <DialogTrigger
        render={
          <Button variant="outline" disabled={equipamentoIds.length === 0}>
            Devolver selecionados ({equipamentoIds.length})
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar devolução</DialogTitle>
          <DialogDescription>
            {equipamentoIds.length} equipamento(s) selecionado(s) — todos vão
            para o mesmo checklist de devolução, com o mesmo motivo e os
            mesmos itens.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Motivo</Label>
            <Select value={motivo} onValueChange={(v) => setMotivo(v ?? undefined)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione...">
                  {(valor: string | null) => (valor ? MOTIVO_LABEL[valor] : "Selecione...")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MOTIVO_LABEL).map(([valor, label]) => (
                  <SelectItem key={valor} value={valor}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="itensDevolucao">Itens inclusos na devolução (opcional)</Label>
            <Input
              id="itensDevolucao"
              value={itensDevolucao}
              onChange={(e) => setItensDevolucao(e.target.value)}
              placeholder="Fonte carregadora, Cabo USB-C, Capa protetora"
            />
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
