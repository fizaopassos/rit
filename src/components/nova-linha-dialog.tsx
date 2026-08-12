"use client";

import { useState, useEffect } from "react";
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

type Colaborador = { id: string; nome: string; status: string };

export function NovaLinhaDialog({ onCriada }: { onCriada: () => void }) {
  const [open, setOpen] = useState(false);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [numero, setNumero] = useState("");
  const [operadora, setOperadora] = useState("");
  const [plano, setPlano] = useState("");
  const [valorMensal, setValorMensal] = useState("");
  const [franquiaDadosGb, setFranquiaDadosGb] = useState("");
  const [colaboradorId, setColaboradorId] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/colaboradores")
        .then((r) => r.json())
        .then((lista: Colaborador[]) => setColaboradores(lista.filter((c) => c.status === "ATIVO")))
        .catch(() => toast.error("Não foi possível carregar os colaboradores"));
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!numero) {
      toast.error("Informe o número da linha");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/linhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero,
          operadora: operadora || undefined,
          plano: plano || undefined,
          valorMensal: valorMensal ? Number(valorMensal) : undefined,
          franquiaDadosGb: franquiaDadosGb ? Number(franquiaDadosGb) : undefined,
          colaboradorId,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.erro ?? "Erro ao criar linha");
        return;
      }

      toast.success(`Linha ${data.numero} cadastrada`);
      setNumero("");
      setOperadora("");
      setPlano("");
      setValorMensal("");
      setFranquiaDadosGb("");
      setColaboradorId(undefined);
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
      <DialogTrigger render={<Button>Nova linha</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova linha móvel</DialogTitle>
          <DialogDescription>
            Se vincular a um colaborador agora, a linha já entra como Ativa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numero">Número</Label>
            <Input id="numero" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="(11) 90000-0000" required autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="operadora">Operadora</Label>
              <Input id="operadora" value={operadora} onChange={(e) => setOperadora(e.target.value)} placeholder="Vivo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plano">Plano</Label>
              <Input id="plano" value={plano} onChange={(e) => setPlano(e.target.value)} placeholder="Ilimitado nacional" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="valorMensal">Valor mensal (R$)</Label>
              <Input id="valorMensal" type="number" step="0.01" value={valorMensal} onChange={(e) => setValorMensal(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="franquia">Franquia de dados (GB)</Label>
              <Input id="franquia" type="number" step="0.5" value={franquiaDadosGb} onChange={(e) => setFranquiaDadosGb(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Colaborador responsável (opcional)</Label>
            <Select value={colaboradorId} onValueChange={(v) => setColaboradorId(v ?? undefined)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sem vínculo por enquanto" />
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
              {enviando ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}