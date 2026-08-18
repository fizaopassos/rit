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
import { Input } from "@/components/ui/input";

type Equipamento = {
  id: string;
  numeroPatrimonio: string;
  status: string;
  modelo: { nome: string; marca: { nome: string } };
};

export function VincularEquipamentoColaboradorDialog({
  colaboradorId,
  onVinculado,
}: {
  colaboradorId: string;
  onVinculado: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [equipamentoId, setEquipamentoId] = useState<string>();
  const [itensEntrega, setItensEntrega] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/equipamentos")
        .then((r) => r.json())
        .then((lista: Equipamento[]) => setEquipamentos(lista.filter((e) => e.status === "EM_ESTOQUE")))
        .catch(() => toast.error("Não foi possível carregar os equipamentos"));
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!equipamentoId) {
      toast.error("Selecione um equipamento");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(`/api/equipamentos/${equipamentoId}/vincular`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colaboradorId, itensEntrega: itensEntrega || undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.erro ?? "Erro ao vincular");
        return;
      }

      toast.success("Equipamento vinculado");
      setEquipamentoId(undefined);
      setItensEntrega("");
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
      <DialogTrigger render={<Button>Vincular equipamento</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vincular equipamento</DialogTitle>
          <DialogDescription>
            Só aparecem equipamentos que estão em estoque.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Equipamento</Label>
            <Select value={equipamentoId} onValueChange={(v) => setEquipamentoId(v ?? undefined)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione...">
                  {(valor: string | null) => {
                    const eq = equipamentos.find((e) => e.id === valor);
                    return eq ? `${eq.numeroPatrimonio} — ${eq.modelo.marca.nome} ${eq.modelo.nome}` : "Selecione...";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {equipamentos.map((eq) => (
                  <SelectItem key={eq.id} value={eq.id}>
                    {eq.numeroPatrimonio} — {eq.modelo.marca.nome} {eq.modelo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="itensEntrega">Itens inclusos na entrega (opcional)</Label>
            <Input
              id="itensEntrega"
              value={itensEntrega}
              onChange={(e) => setItensEntrega(e.target.value)}
              placeholder="Fonte carregadora, Cabo USB-C, Capa protetora"
            />
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
