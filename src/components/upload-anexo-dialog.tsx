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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIPO_LABEL: Record<string, string> = {
  NOTA_FISCAL: "Nota fiscal",
  TERMO_COMODATO: "Termo de comodato (escaneado)",
  CHECKLIST_DEVOLUCAO: "Checklist de devolução (escaneado)",
  OUTRO: "Outro",
};

export function UploadAnexoDialog({
  equipamentoId,
  onEnviado,
}: {
  equipamentoId: string;
  onEnviado: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<string>();
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!tipo || !arquivo) {
      toast.error("Selecione o tipo e o arquivo");
      return;
    }

    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append("tipo", tipo);
      formData.append("arquivo", arquivo);
      if (numeroDocumento) formData.append("numeroDocumento", numeroDocumento);
      if (valor) formData.append("valor", valor);
      if (data) formData.append("data", data);

      const res = await fetch(`/api/equipamentos/${equipamentoId}/anexos`, {
        method: "POST",
        body: formData, // sem Content-Type manual — o browser define o boundary do multipart sozinho
      });
      const responseData = await res.json();

      if (!res.ok) {
        toast.error(responseData.erro ?? "Erro ao enviar anexo");
        return;
      }

      toast.success("Anexo enviado");
      setTipo(undefined);
      setArquivo(null);
      setNumeroDocumento("");
      setValor("");
      setData("");
      setOpen(false);
      onEnviado();
    } catch {
      toast.error("Erro de conexão com o servidor");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline">Enviar anexo</Button>} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar anexo</DialogTitle>
          <DialogDescription>
            Nota fiscal, comodato ou checklist escaneado após a assinatura em
            papel.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v ?? undefined)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIPO_LABEL).map(([valor, label]) => (
                  <SelectItem key={valor} value={valor}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="arquivo">Arquivo</Label>
            <Input
              id="arquivo"
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
            />
          </div>

          {tipo === "NOTA_FISCAL" && (
            <div className="grid grid-cols-2 gap-3 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="nfNumero">Número da NF</Label>
                <Input id="nfNumero" value={numeroDocumento} onChange={(e) => setNumeroDocumento(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nfValor">Valor (R$)</Label>
                <Input id="nfValor" type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="data">Data do documento</Label>
            <Input id="data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}