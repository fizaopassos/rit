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

const TIPO_LABEL: Record<string, string> = {
  PREVENTIVA: "Preventiva",
  CORRETIVA: "Corretiva",
  TROCA_PECA: "Troca de peça",
};

export function NovaManutencaoDialog({
  equipamentoId,
  onCriada,
}: {
  equipamentoId: string;
  onCriada: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<string>();
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [descricao, setDescricao] = useState("");
  const [pecaTrocada, setPecaTrocada] = useState("");
  const [custo, setCusto] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tipo || !descricao) {
      toast.error("Preencha o tipo e a descrição");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(`/api/equipamentos/${equipamentoId}/manutencoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          data,
          descricao,
          pecaTrocada: pecaTrocada || undefined,
          custo: custo ? Number(custo) : undefined,
          fornecedor: fornecedor || undefined,
        }),
      });
      const responseData = await res.json();

      if (!res.ok) {
        toast.error(responseData.erro ?? "Erro ao registrar manutenção");
        return;
      }

      toast.success("Manutenção registrada");
      setTipo(undefined);
      setDescricao("");
      setPecaTrocada("");
      setCusto("");
      setFornecedor("");
      setOpen(false);
      onCriada();
    } catch {
      toast.error("Erro de conexão com o servidor");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline">Registrar manutenção</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar manutenção</DialogTitle>
          <DialogDescription>
            Registre mesmo quando for feita internamente pelo TI, sem custo —
            fica valendo para o relatório de manutenções por equipamento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v ?? undefined)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_LABEL).map(([valor, label]) => (
                    <SelectItem key={valor} value={valor}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input id="data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="O que foi feito" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pecaTrocada">Peça trocada (opcional)</Label>
            <Input id="pecaTrocada" value={pecaTrocada} onChange={(e) => setPecaTrocada(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="custo">Custo (R$, opcional)</Label>
              <Input id="custo" type="number" step="0.01" value={custo} onChange={(e) => setCusto(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor/Responsável</Label>
              <Input id="fornecedor" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} placeholder="TI Interno" />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}