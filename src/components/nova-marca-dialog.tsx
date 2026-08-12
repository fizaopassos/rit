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

export function NovaMarcaDialog({ onCriada }: { onCriada: () => void }) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);

    try {
      const res = await fetch("/api/marcas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.erro ?? "Erro ao criar marca");
        return;
      }

      toast.success(`Marca "${data.nome}" criada`);
      setNome("");
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
      <DialogTrigger render={<Button>Nova marca</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova marca</DialogTitle>
          <DialogDescription>
            Cadastre uma marca reutilizável (ex.: Dell, Motorola). Os modelos
            entram depois, vinculados a ela.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Dell"
              required
              autoFocus
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