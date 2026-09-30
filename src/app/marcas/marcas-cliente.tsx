"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useMemo } from "react";
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
import { EmptyState } from "@/components/empty-loading-states";
import { NovaMarcaDialog } from "@/components/nova-marca-dialog";
import { EditarMarcaDialog } from "@/components/editar-marca-dialog";

type Marca = {
  id: string;
  nome: string;
  _count: { modelos: number };
};

export function MarcasCliente({ marcas }: { marcas: Marca[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");

  // Depois de criar/editar, refaz a página no servidor com os dados novos
  const carregar = useCallback(() => router.refresh(), [router]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return marcas;
    return marcas.filter((m) => m.nome.toLowerCase().includes(termo));
  }, [marcas, busca]);

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8">
      <PageHeader
        title="Marcas"
        description="Cadastro reutilizável de marcas de equipamento."
        action={<NovaMarcaDialog onCriada={carregar} />}
      />

      <div className="relative mb-4">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Buscar marca..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="max-w-sm pl-9"
        />
      </div>

      {filtradas.length === 0 ? (
        <EmptyState
          message={
            marcas.length === 0
              ? "Nenhuma marca cadastrada ainda."
              : "Nenhuma marca encontrada com essa busca."
          }
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marca</TableHead>
                <TableHead>Modelos</TableHead>
                <TableHead className="w-px" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtradas.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{m._count.modelos}</TableCell>
                  <TableCell>
                    <EditarMarcaDialog marcaId={m.id} nomeAtual={m.nome} onEditado={carregar} />
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
