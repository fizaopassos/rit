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

type Colaborador = { id: string; nome: string };
type Condominio = { id: string; nome: string };

export function NovoEmailDialog({ onCriado }: { onCriado: () => void }) {
  const [open, setOpen] = useState(false);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [emailAddr, setEmailAddr] = useState("");
  const [tipo, setTipo] = useState<"pessoal" | "generico">("pessoal");
  const [colaboradorId, setColaboradorId] = useState<string>();
  const [condominioId, setCondominioId] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/colaboradores").then((r) => r.json()).then(setColaboradores).catch(() => {});
      fetch("/api/condominios").then((r) => r.json()).then(setCondominios).catch(() => {});
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailAddr,
          condominioId: tipo === "generico" ? condominioId : undefined,
          colaboradorId,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.erro ?? "Erro ao criar email");
        return;
      }

      toast.success(`Email ${data.email} cadastrado`);
      setEmailAddr("");
      setColaboradorId(undefined);
      setCondominioId(undefined);
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
      <DialogTrigger render={<Button>Novo email</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo email Workspace</DialogTitle>
          <DialogDescription>
            Genérico de condomínio: o endereço pertence ao condomínio, e você
            também pode dizer quem responde por ele hoje.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={emailAddr} onChange={(e) => setEmailAddr(e.target.value)} required autoFocus />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={(v) => v && setTipo(v as typeof tipo)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pessoal">Pessoal</SelectItem>
                <SelectItem value="generico">Genérico de condomínio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipo === "generico" && (
            <div className="space-y-2">
              <Label>Condomínio</Label>
              <Select value={condominioId} onValueChange={(v) => setCondominioId(v ?? undefined)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {condominios.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>{tipo === "generico" ? "Quem responde hoje (opcional)" : "Colaborador"}</Label>
            <Select value={colaboradorId} onValueChange={(v) => setColaboradorId(v ?? undefined)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione..." />
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
