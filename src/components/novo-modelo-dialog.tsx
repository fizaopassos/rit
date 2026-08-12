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
import { TIPOS_EQUIPAMENTO, TIPO_EQUIPAMENTO_LABEL } from "@/lib/tipos-equipamento";

type Marca = { id: string; nome: string };

export function NovoModeloDialog({ onCriado }: { onCriado: () => void }) {
  const [open, setOpen] = useState(false);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [marcaId, setMarcaId] = useState<string | undefined>();
  const [nome, setNome] = useState("");
  const [tipoEquipamento, setTipoEquipamento] = useState<string | undefined>();
  const [vidaUtilAnos, setVidaUtilAnos] = useState("5");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/marcas")
        .then((res) => res.json())
        .then(setMarcas)
        .catch(() => toast.error("Não foi possível carregar as marcas"));
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!marcaId || !tipoEquipamento) {
      toast.error("Selecione a marca e o tipo de equipamento");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/modelos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marcaId,
          nome,
          tipoEquipamento,
          vidaUtilAnos: Number(vidaUtilAnos),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.erro ?? "Erro ao criar modelo");
        return;
      }

      toast.success(`Modelo "${data.nome}" criado`);
      setNome("");
      setMarcaId(undefined);
      setTipoEquipamento(undefined);
      setVidaUtilAnos("5");
      setOpen(false);
      onCriado();
    } catch {
      toast.error("Erro de conexão com o servidor");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Novo modelo</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo modelo</DialogTitle>
          <DialogDescription>
            Ex.: Latitude 5420 (Dell). A vida útil é usada como sugestão no
            cálculo de depreciação, editável por equipamento depois.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Marca</Label>
            <Select value={marcaId} onValueChange={(v) => setMarcaId(v ?? undefined)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a marca..." />
              </SelectTrigger>
              <SelectContent>
                {marcas.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome do modelo</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Latitude 5420"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de equipamento</Label>
            <Select
              value={tipoEquipamento}
              onValueChange={(v) => setTipoEquipamento(v ?? undefined)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o tipo..." />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_EQUIPAMENTO.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {TIPO_EQUIPAMENTO_LABEL[tipo]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vidaUtil">Vida útil (anos)</Label>
            <Input
              id="vidaUtil"
              type="number"
              min={1}
              value={vidaUtilAnos}
              onChange={(e) => setVidaUtilAnos(e.target.value)}
            />
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