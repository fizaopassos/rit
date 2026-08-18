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

export function EditarModeloDialog({
  modeloId,
  dadosAtuais,
  onEditado,
}: {
  modeloId: string;
  dadosAtuais: {
    marcaId: string;
    nome: string;
    tipoEquipamento: string;
    vidaUtilAnos: number | null;
  };
  onEditado: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [marcaId, setMarcaId] = useState<string | undefined>();
  const [nome, setNome] = useState(dadosAtuais.nome);
  const [tipoEquipamento, setTipoEquipamento] = useState(dadosAtuais.tipoEquipamento);
  const [vidaUtilAnos, setVidaUtilAnos] = useState(String(dadosAtuais.vidaUtilAnos ?? 5));
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/marcas")
        .then((r) => r.json())
        .then((lista) => {
          setMarcas(lista);
          // só define o selecionado depois que a lista existe — evita o
          // Select mostrar o ID bruto antes de achar o rótulo correspondente
          setMarcaId(dadosAtuais.marcaId);
        })
        .catch(() => toast.error("Não foi possível carregar as marcas"));
    }
  }, [open, dadosAtuais.marcaId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      const res = await fetch(`/api/modelos/${modeloId}`, {
        method: "PATCH",
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
        toast.error(data.erro ?? "Erro ao editar modelo");
        return;
      }

      toast.success("Modelo atualizado");
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
          <DialogTitle>Editar modelo</DialogTitle>
          <DialogDescription>
            Mudar o tipo de equipamento não altera equipamentos já cadastrados
            com esse modelo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Marca</Label>
                        <Select value={marcaId} onValueChange={(v) => v && setMarcaId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(valor: string | null) => marcas.find((m) => m.id === valor)?.nome ?? ""}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {marcas.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome do modelo</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Tipo de equipamento</Label>
            <Select value={tipoEquipamento} onValueChange={(v) => v && setTipoEquipamento(v)}>
              <SelectTrigger className="w-full">
              <SelectValue>
  {(valor: string | null) => (valor ? TIPO_EQUIPAMENTO_LABEL[valor as keyof typeof TIPO_EQUIPAMENTO_LABEL] : "")}
</SelectValue>
              </SelectTrigger>
              </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vidaUtil">Vida útil (anos)</Label>
            <Input id="vidaUtil" type="number" min={1} value={vidaUtilAnos} onChange={(e) => setVidaUtilAnos(e.target.value)} />
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