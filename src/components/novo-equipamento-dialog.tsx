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

type Modelo = {
  id: string;
  nome: string;
  tipoEquipamento: string;
  marca: { nome: string };
};
type Condominio = { id: string; nome: string; codigo: string };

const PROPRIETARIO_LABEL: Record<string, string> = {
  ADMINISTRADORA: "Administradora (Retha)",
  ASSOCIACAO_CONDOMINIO: "Associação / Condomínio",
};

export function NovoEquipamentoDialog({ onCriado }: { onCriado: () => void }) {
  const [open, setOpen] = useState(false);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [enviando, setEnviando] = useState(false);

  const [modeloId, setModeloId] = useState<string>();
  const [proprietarioTipo, setProprietarioTipo] = useState<string>();
  const [condominioId, setCondominioId] = useState<string>();
  const [numeroSerie, setNumeroSerie] = useState("");

  const [notaFiscalNumero, setNotaFiscalNumero] = useState("");
  const [notaFiscalValor, setNotaFiscalValor] = useState("");
  const [notaFiscalData, setNotaFiscalData] = useState("");
  const [dataAquisicao, setDataAquisicao] = useState("");

  const [ipLocal, setIpLocal] = useState("");
  const [macAddress, setMacAddress] = useState("");
  const [numeroRamal, setNumeroRamal] = useState("");

  const [observacoes, setObservacoes] = useState("");
  const [itensInclusos, setItensInclusos] = useState("");

  useEffect(() => {
    if (open) {
      fetch("/api/modelos").then((r) => r.json()).then(setModelos)
        .catch(() => toast.error("Não foi possível carregar os modelos"));
      fetch("/api/condominios").then((r) => r.json()).then(setCondominios)
        .catch(() => toast.error("Não foi possível carregar os condomínios"));
    }
  }, [open]);

  function limpar() {
    setModeloId(undefined);
    setProprietarioTipo(undefined);
    setCondominioId(undefined);
    setNumeroSerie("");
    setNotaFiscalNumero("");
    setNotaFiscalValor("");
    setNotaFiscalData("");
    setDataAquisicao("");
    setIpLocal("");
    setMacAddress("");
    setNumeroRamal("");
    setObservacoes("");
    setItensInclusos("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const modelo = modelos.find((m) => m.id === modeloId);
    if (!modelo || !proprietarioTipo || !condominioId) {
      toast.error("Preencha modelo, proprietário e condomínio");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/equipamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modeloId,
          tipoEquipamento: modelo.tipoEquipamento,
          numeroSerie: numeroSerie || undefined,
          proprietarioTipo,
          condominioId,
          notaFiscalNumero: notaFiscalNumero || undefined,
          notaFiscalValor: notaFiscalValor ? Number(notaFiscalValor) : undefined,
          notaFiscalData: notaFiscalData || undefined,
          dataAquisicao: dataAquisicao || undefined,
          ipLocal: ipLocal || undefined,
          macAddress: macAddress || undefined,
          numeroRamal: numeroRamal || undefined,
          itensInclusos: itensInclusos || undefined,
          observacoes: observacoes || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.erro ?? "Erro ao criar equipamento");
        return;
      }

      toast.success(`Equipamento ${data.numeroPatrimonio} cadastrado`);
      limpar();
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
      <DialogTrigger render={<Button>Novo equipamento</Button>} />

      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo equipamento</DialogTitle>
          <DialogDescription>
            O número de patrimônio é gerado automaticamente a partir do
            proprietário e do condomínio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Modelo</Label>
              <Select value={modeloId} onValueChange={(v) => setModeloId(v ?? undefined)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o modelo..." />
                </SelectTrigger>
                <SelectContent>
                  {modelos.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.marca.nome} {m.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroSerie">Nº de série / service tag</Label>
              <Input id="numeroSerie" value={numeroSerie} onChange={(e) => setNumeroSerie(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Proprietário</Label>
                <Select value={proprietarioTipo} onValueChange={(v) => setProprietarioTipo(v ?? undefined)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROPRIETARIO_LABEL).map(([valor, label]) => (
                      <SelectItem key={valor} value={valor}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Nota fiscal
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="nfNumero">Número</Label>
                <Input id="nfNumero" value={notaFiscalNumero} onChange={(e) => setNotaFiscalNumero(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nfValor">Valor (R$)</Label>
                <Input id="nfValor" type="number" step="0.01" value={notaFiscalValor} onChange={(e) => setNotaFiscalValor(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="nfData">Data da NF</Label>
                <Input id="nfData" type="date" value={notaFiscalData} onChange={(e) => setNotaFiscalData(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataAquisicao">Data de aquisição</Label>
                <Input id="dataAquisicao" type="date" value={dataAquisicao} onChange={(e) => setDataAquisicao(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Rede (opcional)
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ip">IP local</Label>
                <Input id="ip" value={ipLocal} onChange={(e) => setIpLocal(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mac">MAC</Label>
                <Input id="mac" value={macAddress} onChange={(e) => setMacAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ramal">Ramal</Label>
                <Input id="ramal" value={numeroRamal} onChange={(e) => setNumeroRamal(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="itensInclusos">Itens inclusos (separados por vírgula)</Label>
            <Input id="itensInclusos" value={itensInclusos} onChange={(e) => setItensInclusos(e.target.value)} placeholder="Fonte carregadora, Cabo USB-C, Capa protetora" />
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="obs">Observações</Label>
            <Input id="obs" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
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