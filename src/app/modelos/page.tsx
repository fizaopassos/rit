"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { EmptyState, LoadingState } from "@/components/empty-loading-states";
import { NovoModeloDialog } from "@/components/novo-modelo-dialog";
import { EditarModeloDialog } from "@/components/editar-modelo-dialog";
import { TIPO_EQUIPAMENTO_LABEL, TipoEquipamentoValue } from "@/lib/tipos-equipamento";

type Modelo = {
  id: string;
  nome: string;
  tipoEquipamento: TipoEquipamentoValue;
  vidaUtilAnos: number | null;
  marcaId: string;
  marca: { nome: string };
  _count: { equipamentos: number };
};

export default function ModelosPage() {
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch("/api/modelos");
      setModelos(await res.json());
    } catch {
      toast.error("Não foi possível carregar os modelos");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return modelos;
    return modelos.filter(
      (m) => m.nome.toLowerCase().includes(termo) || m.marca.nome.toLowerCase().includes(termo),
    );
  }, [modelos, busca]);

  return (
    <div className="mx-auto max-w-3xl p-8">
      <PageHeader
        title="Modelos"
        description="Modelos vinculados a uma marca, reutilizados no cadastro de equipamento."
        action={<NovoModeloDialog onCriado={carregar} />}
      />

      <div className="relative mb-4">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Buscar por marca ou modelo..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="max-w-sm pl-9"
        />
      </div>

      {carregando ? (
        <LoadingState rows={4} />
      ) : filtrados.length === 0 ? (
        <EmptyState
          message={
            modelos.length === 0
              ? "Nenhum modelo cadastrado ainda."
              : "Nenhum modelo encontrado com essa busca."
          }
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modelo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Vida útil</TableHead>
                <TableHead>Equipamentos</TableHead>
                <TableHead className="w-px" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.marca.nome} {m.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{TIPO_EQUIPAMENTO_LABEL[m.tipoEquipamento]}</TableCell>
                  <TableCell className="text-muted-foreground">{m.vidaUtilAnos ?? "—"} anos</TableCell>
                  <TableCell className="text-muted-foreground">{m._count.equipamentos}</TableCell>
                  <TableCell>
                    <EditarModeloDialog modeloId={m.id} dadosAtuais={m} onEditado={carregar} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
