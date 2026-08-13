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

export function EditarCondominioDialog({
  condominioId,
  dadosAtuais,
  onEditado,
}: {
  condominioId: string;
  dadosAtuais: { nome: string; codigo: string; endereco: string | null };
  onEditado: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState(dadosAtuais.nome);
  const [codigo, setCodigo] = useState(dadosAtuais.codigo);
  const [endereco, setEndereco] = useState(dadosAtuais.endereco ?? "");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      const res = await fetch(`/api/condominios/${condominioId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, codigo, endereco: endereco || undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.erro ?? "Erro ao editar condomínio");
        return;
      }

      toast.success("Condomínio atualizado");
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
          <DialogTitle>Editar condomínio</DialogTitle>
          <DialogDescription>
            Cuidado ao mudar o código — ele já pode estar sendo usado em
            números de patrimônio existentes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="codigo">Código</Label>
            <Input id="codigo" value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço (opcional)</Label>
            <Input id="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
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