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
import { NovoCondominioDialog } from "@/components/novo-condominio-dialog";
import { EditarCondominioDialog } from "@/components/editar-condominio-dialog";

type Condominio = {
  id: string;
  nome: string;
  codigo: string;
  endereco: string | null;
};

export default function CondominiosPage() {
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch("/api/condominios");
      setCondominios(await res.json());
    } catch {
      toast.error("Não foi possível carregar os condomínios");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return condominios;
    return condominios.filter(
      (c) => c.nome.toLowerCase().includes(termo) || c.codigo.toLowerCase().includes(termo),
    );
  }, [condominios, busca]);

  return (
    <div className="mx-auto max-w-3xl p-8">
      <PageHeader
        title="Condomínios"
        description="Condomínios administrados pela Retha."
        action={<NovoCondominioDialog onCriado={carregar} />}
      />

      <div className="relative mb-4">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Buscar por nome ou código..."
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
            condominios.length === 0
              ? "Nenhum condomínio cadastrado ainda."
              : "Nenhum condomínio encontrado com essa busca."
          }
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead className="w-px" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.nome}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">{c.codigo}</TableCell>
                  <TableCell className="text-muted-foreground">{c.endereco ?? "—"}</TableCell>
                  <TableCell>
                    <EditarCondominioDialog condominioId={c.id} dadosAtuais={c} onEditado={carregar} />
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
