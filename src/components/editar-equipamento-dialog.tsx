"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { IdCard, Receipt, Network, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/money-input";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Modelo = { id: string; nome: string; tipoEquipamento: string; marca: { nome: string } };

function TituloSecao({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2 text-sm font-medium">
      <Icon className="text-muted-foreground size-4" />
      {children}
    </span>
  );
}

export function EditarEquipamentoDialog({
  equipamentoId,
  dadosAtuais,
  onEditado,
}: {
  equipamentoId: string;
  dadosAtuais: {
    modeloId: string;
    numeroSerie: string | null;
    notaFiscalNumero: string | null;
    notaFiscalValor: string | null;
    dataAquisicao: string | null;
    ipLocal: string | null;
    macAddress: string | null;
    numeroRamal: string | null;
    observacoes: string | null;
  };
  onEditado: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [modeloId, setModeloId] = useState<string>();
  const [numeroSerie, setNumeroSerie] = useState(dadosAtuais.numeroSerie ?? "");
  const [notaFiscalNumero, setNotaFiscalNumero] = useState(dadosAtuais.notaFiscalNumero ?? "");
  const [notaFiscalValor, setNotaFiscalValor] = useState(dadosAtuais.notaFiscalValor ?? "");
  const [dataAquisicao, setDataAquisicao] = useState(dadosAtuais.dataAquisicao?.slice(0, 10) ?? "");
  const [ipLocal, setIpLocal] = useState(dadosAtuais.ipLocal ?? "");
  const [macAddress, setMacAddress] = useState(dadosAtuais.macAddress ?? "");
  const [numeroRamal, setNumeroRamal] = useState(dadosAtuais.numeroRamal ?? "");
  const [observacoes, setObservacoes] = useState(dadosAtuais.observacoes ?? "");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/modelos")
        .then((r) => r.json())
        .then((lista) => {
          setModelos(lista);
          setModeloId(dadosAtuais.modeloId);
        })
        .catch(() => toast.error("Não foi possível carregar os modelos"));
    }
  }, [open, dadosAtuais.modeloId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const modelo = modelos.find((m) => m.id === modeloId);
    if (!modelo) {
      toast.error("Selecione o modelo");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(`/api/equipamentos/${equipamentoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modeloId,
          tipoEquipamento: modelo.tipoEquipamento,
          numeroSerie: numeroSerie || undefined,
          notaFiscalNumero: notaFiscalNumero || undefined,
          notaFiscalValor: notaFiscalValor ? Number(notaFiscalValor) : undefined,
          dataAquisicao: dataAquisicao || undefined,
          ipLocal: ipLocal || undefined,
          macAddress: macAddress || undefined,
          numeroRamal: numeroRamal || undefined,
          observacoes: observacoes || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.erro ?? "Erro ao editar equipamento");
        return;
      }

      toast.success("Equipamento atualizado");
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
      <DialogTrigger render={<Button variant="outline" size="sm">Editar</Button>} />

      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar equipamento</DialogTitle>
          <DialogDescription>
            Proprietário, condomínio e número de patrimônio não são editáveis
            aqui — já podem estar impressos numa etiqueta física.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Accordion defaultValue={["identificacao"]}>
            <AccordionItem value="identificacao">
              <AccordionTrigger>
                <TituloSecao icon={IdCard}>Identificação</TituloSecao>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-1">
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Select value={modeloId} onValueChange={(v) => v && setModeloId(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(valor: string | null) => {
                          const m = modelos.find((x) => x.id === valor);
                          return m ? `${m.marca.nome} ${m.nome}` : "";
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {modelos.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.marca.nome} {m.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroSerie">Nº de série / service tag</Label>
                  <Input id="numeroSerie" value={numeroSerie} onChange={(e) => setNumeroSerie(e.target.value)} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="aquisicao">
              <AccordionTrigger>
                <TituloSecao icon={Receipt}>Aquisição</TituloSecao>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="nfNumero">Nº da NF</Label>
                    <Input id="nfNumero" value={notaFiscalNumero} onChange={(e) => setNotaFiscalNumero(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nfValor">Valor (R$)</Label>
                    <MoneyInput id="nfValor" value={notaFiscalValor} onChange={setNotaFiscalValor} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataAquisicao">Data de aquisição</Label>
                  <Input id="dataAquisicao" type="date" value={dataAquisicao} onChange={(e) => setDataAquisicao(e.target.value)} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="rede">
              <AccordionTrigger>
                <TituloSecao icon={Network}>Rede (opcional)</TituloSecao>
              </AccordionTrigger>
              <AccordionContent className="pt-1">
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
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="adicionais">
              <AccordionTrigger>
                <TituloSecao icon={FileText}>Informações adicionais</TituloSecao>
              </AccordionTrigger>
              <AccordionContent className="pt-1">
                <div className="space-y-2">
                  <Label htmlFor="obs">Observações</Label>
                  <Input id="obs" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <DialogFooter className="mt-4">
            <Button type="submit" disabled={enviando}>
              {enviando ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
