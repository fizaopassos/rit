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

export function EditarColaboradorDialog({
  colaboradorId,
  dadosAtuais,
  onEditado,
}: {
  colaboradorId: string;
  dadosAtuais: {
    nome: string;
    cargo: string | null;
    tipoPessoa: string;
    cnpj: string | null;
    vinculoTipo: string;
    condominioId: string | null;
    status: string;
  };
  onEditado: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [nome, setNome] = useState(dadosAtuais.nome);
  const [tipoPessoa, setTipoPessoa] = useState(dadosAtuais.tipoPessoa);
  const [cnpj, setCnpj] = useState(dadosAtuais.cnpj ?? "");
  const [cargo, setCargo] = useState(dadosAtuais.cargo ?? "");
  const [vinculoTipo, setVinculoTipo] = useState(dadosAtuais.vinculoTipo);
  const [condominioId, setCondominioId] = useState<string | undefined>();
  const [status, setStatus] = useState(dadosAtuais.status);
  const [cpf, setCpf] = useState("");
  const [enviando, setEnviando] = useState(false);

  const isPj = tipoPessoa === "PESSOA_JURIDICA";

  useEffect(() => {
    if (open) {
      fetch("/api/condominios")
        .then((r) => r.json())
        .then((lista) => {
          setCondominios(lista);
          setCondominioId(dadosAtuais.condominioId ?? undefined);
        })
        .catch(() => toast.error("Não foi possível carregar os condomínios"));
    }
  }, [open, dadosAtuais.condominioId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      const res = await fetch(`/api/colaboradores/${colaboradorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          tipoPessoa,
          cnpj: isPj ? cnpj || undefined : undefined,
          cargo: cargo || undefined,
          vinculoTipo,
          condominioId,
          status,
          cpf: isPj ? undefined : cpf || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.erro ?? "Erro ao editar colaborador");
        return;
      }

      toast.success("Colaborador atualizado");
      setCpf("");
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
      <DialogTrigger render={<Button variant="outline" size="sm">Editar dados</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar colaborador</DialogTitle>
          <DialogDescription>
            Marcar como Inativo é o passo certo no desligamento — os alertas
            de linha/email do sistema dependem desse status.
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
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>

          {isPj ? (
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF (deixe em branco para manter)</Label>
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
              <Label>Local de trabalho</Label>
                            <Select value={condominioId} onValueChange={(v) => setCondominioId(v ?? undefined)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione...">
                    {(valor: string | null) => condominios.find((c) => c.id === valor)?.nome ?? "Selecione..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {condominios.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

                    <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v)}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(valor: string | null) => (valor === "INATIVO" ? "Inativo" : "Ativo")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ATIVO">Ativo</SelectItem>
                <SelectItem value="INATIVO">Inativo</SelectItem>
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
