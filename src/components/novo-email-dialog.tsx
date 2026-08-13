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
  const [tipoVinculo, setTipoVinculo] = useState<"colaborador" | "condominio" | "nenhum">("colaborador");
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
          colaboradorId: tipoVinculo === "colaborador" ? colaboradorId : undefined,
          condominioId: tipoVinculo === "condominio" ? condominioId : undefined,
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
            Em condomínio, o email costuma ser genérico (do cargo/local), não
            de uma pessoa — por isso o vínculo pode ser com Colaborador ou
            com Condomínio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={emailAddr} onChange={(e) => setEmailAddr(e.target.value)} required autoFocus />
          </div>

          <div className="space-y-2">
            <Label>Pertence a</Label>
            <Select value={tipoVinculo} onValueChange={(v) => v && setTipoVinculo(v as typeof tipoVinculo)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="colaborador">Um colaborador</SelectItem>
                <SelectItem value="condominio">Um condomínio (genérico)</SelectItem>
                <SelectItem value="nenhum">Ninguém ainda (sem uso)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipoVinculo === "colaborador" && (
            <div className="space-y-2">
              <Label>Colaborador</Label>
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
          )}

          {tipoVinculo === "condominio" && (
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