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

type Condominio = { id: string; nome: string };

export function NovoColaboradorDialog({ onCriado }: { onCriado: () => void }) {
  const [open, setOpen] = useState(false);
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [nome, setNome] = useState("");
  const [rg, setRg] = useState("");
  const [cpf, setCpf] = useState("");
  const [cargo, setCargo] = useState("");
  const [condominioId, setCondominioId] = useState<string | undefined>();
  const [enviando, setEnviando] = useState(false);

  // Carrega a lista de condomínios só quando o modal abre — evita
  // uma requisição desnecessária toda vez que a página de colaboradores carrega
  useEffect(() => {
    if (open) {
      fetch("/api/condominios")
        .then((res) => res.json())
        .then(setCondominios)
        .catch(() => toast.error("Não foi possível carregar os condomínios"));
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);

    try {
      const res = await fetch("/api/colaboradores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          rg: rg || undefined,
          cpf: cpf || undefined,
          cargo: cargo || undefined,
          condominioId,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.erro ?? "Erro ao criar colaborador");
        return;
      }

      toast.success(`Colaborador "${data.nome}" criado`);
      setNome("");
      setRg("");
      setCpf("");
      setCargo("");
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
      <DialogTrigger render={<Button>Novo colaborador</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo colaborador</DialogTitle>
          <DialogDescription>
            O CPF é criptografado e nunca exibido por completo, exceto para o
            perfil Admin — cada visualização fica registrada em log.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="rg">RG</Label>
              <Input id="rg" value={rg} onChange={(e) => setRg(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo</Label>
            <Input id="cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Condomínio / setor</Label>
            <Select
  value={condominioId}
  onValueChange={(value) => setCondominioId(value ?? undefined)}
>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {condominios.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
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