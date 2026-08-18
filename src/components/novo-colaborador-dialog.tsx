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

const VINCULO_LABEL: Record<string, string> = {
  ADMINISTRADORA: "Administradora (Retha)",
  ASSOCIACAO_CONDOMINIO: "Associação / Condomínio",
};

export function NovoColaboradorDialog({ onCriado }: { onCriado: () => void }) {
  const [open, setOpen] = useState(false);
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [nome, setNome] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState("PESSOA_FISICA");
  const [cpf, setCpf] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cargo, setCargo] = useState("");
  const [vinculoTipo, setVinculoTipo] = useState("ADMINISTRADORA");
  const [condominioId, setCondominioId] = useState<string | undefined>();
  const [enviando, setEnviando] = useState(false);

  const isPj = tipoPessoa === "PESSOA_JURIDICA";

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
          tipoPessoa,
          cpf: isPj ? undefined : cpf || undefined,
          cnpj: isPj ? cnpj || undefined : undefined,
          cargo: cargo || undefined,
          vinculoTipo,
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
      setTipoPessoa("PESSOA_FISICA");
      setCpf("");
      setCnpj("");
      setCargo("");
      setVinculoTipo("ADMINISTRADORA");
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
            Pessoa Jurídica (PJ) aparece nos documentos como "Prestador",
            usando CNPJ no lugar de CPF.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={tipoPessoa} onValueChange={(v) => v && setTipoPessoa(v)}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(valor: string | null) => (valor === "PESSOA_JURIDICA" ? "Pessoa Jurídica (PJ)" : "Pessoa Física")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PESSOA_FISICA">Pessoa Física</SelectItem>
                <SelectItem value="PESSOA_JURIDICA">Pessoa Jurídica (PJ)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">{isPj ? "Razão Social" : "Nome"}</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required autoFocus />
          </div>

          {isPj ? (
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo</Label>
            <Input id="cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Vínculo</Label>
              <Select value={vinculoTipo} onValueChange={(v) => v && setVinculoTipo(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(valor: string | null) => (valor ? VINCULO_LABEL[valor] : "")}
                    </SelectValue>
                  </SelectTrigger>
                <SelectContent>
                  {Object.entries(VINCULO_LABEL).map(([valor, label]) => (
                    <SelectItem key={valor} value={valor}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Local de trabalho (opcional)</Label>
              <Select value={condominioId} onValueChange={(v) => setCondominioId(v ?? undefined)}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione...">
                      {(valor: string | null) => condominios.find((c) => c.id === valor)?.nome ?? "Selecione..."}
                    </SelectValue>
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
