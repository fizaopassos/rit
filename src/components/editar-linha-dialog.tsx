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

export function EditarLinhaDialog({
  linhaId,
  dadosAtuais,
  onEditado,
}: {
  linhaId: string;
  dadosAtuais: {
    numero: string;
    operadora: string | null;
    plano: string | null;
    valorMensal: string | null;
    franquiaDadosGb: string | null;
  };
  onEditado: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [numero, setNumero] = useState(dadosAtuais.numero);
  const [operadora, setOperadora] = useState(dadosAtuais.operadora ?? "");
  const [plano, setPlano] = useState(dadosAtuais.plano ?? "");
  const [valorMensal, setValorMensal] = useState(dadosAtuais.valorMensal ?? "");
  const [franquiaDadosGb, setFranquiaDadosGb] = useState(dadosAtuais.franquiaDadosGb ?? "");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      const res = await fetch(`/api/linhas/${linhaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero,
          operadora: operadora || undefined,
          plano: plano || undefined,
          valorMensal: valorMensal ? Number(valorMensal) : undefined,
          franquiaDadosGb: franquiaDadosGb ? Number(franquiaDadosGb) : undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.erro ?? "Erro ao editar linha");
        return;
      }

      toast.success("Linha atualizada");
      setOpen(false);
      onEditado();
    } catch {
      toast.error("Erro de conexão com o servidor");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm">Editar</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar linha</DialogTitle>
          <DialogDescription>
            Responsável e status mudam pelos botões dedicados na listagem, não aqui.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numero">Número</Label>
            <Input id="numero" value={numero} onChange={(e) => setNumero(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="operadora">Operadora</Label>
              <Input id="operadora" value={operadora} onChange={(e) => setOperadora(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plano">Plano</Label>
              <Input id="plano" value={plano} onChange={(e) => setPlano(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="valorMensal">Valor mensal (R$)</Label>
              <Input id="valorMensal" type="number" step="0.01" value={valorMensal} onChange={(e) => setValorMensal(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="franquia">Franquia (GB)</Label>
              <Input id="franquia" type="number" step="0.5" value={franquiaDadosGb} onChange={(e) => setFranquiaDadosGb(e.target.value)} />
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