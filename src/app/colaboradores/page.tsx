"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { StatusBadge } from "@/components/status-badge";
import { NovoColaboradorDialog } from "@/components/novo-colaborador-dialog";
import { usePerfil } from "@/lib/use-perfil";

type Colaborador = {
  id: string;
  nome: string;
  cargo?: string | null;
  status?: string;
  condominio?: { nome: string } | null;
  cpfMascarado?: string | null;
  telefone: string | null;
  email: string | null;
};

export default function ColaboradoresPage() {
  const router = useRouter();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const perfil = usePerfil();
  const isConsulta = perfil === "CONSULTA";

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch("/api/colaboradores");
      setColaboradores(await res.json());
    } catch {
      toast.error("Não foi possível carregar os colaboradores");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const termo = busca.trim().toLowerCase();
  const bate = useCallback(
    (c: Colaborador) =>
      !termo ||
      c.nome.toLowerCase().includes(termo) ||
      (c.cargo ?? "").toLowerCase().includes(termo),
    [termo],
  );

  const ativos = useMemo(
    () => colaboradores.filter((c) => (isConsulta || c.status !== "INATIVO") && bate(c)),
    [colaboradores, isConsulta, bate],
  );
  const inativos = useMemo(
    () => (isConsulta ? [] : colaboradores.filter((c) => c.status === "INATIVO" && bate(c))),
    [colaboradores, isConsulta, bate],
  );

  return (
    <div className="mx-auto max-w-5xl p-8">
      <PageHeader
        title="Colaboradores"
        description={
          isConsulta
            ? "Nome, telefone e email de cada colaborador."
            : "Quem recebe equipamento — CPF sempre mascarado por padrão."
        }
        action={!isConsulta && <NovoColaboradorDialog onCriado={carregar} />}
      />

      <div className="relative mb-4">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Buscar por nome ou cargo..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="max-w-sm pl-9"
        />
      </div>

      {carregando ? (
        <LoadingState rows={5} />
      ) : ativos.length === 0 && inativos.length === 0 ? (
        <EmptyState
          message={
            colaboradores.length === 0
              ? "Nenhum colaborador cadastrado ainda."
              : "Nenhum colaborador encontrado com essa busca."
          }
        />
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  {isConsulta ? (
                    <>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Email</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Condomínio</TableHead>
                      <TableHead>CPF</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {ativos.map((c) => (
                  <TableRow
                    key={c.id}
                    className={isConsulta ? "" : "cursor-pointer"}
                    onClick={() => !isConsulta && router.push(`/colaboradores/${c.id}`)}
                  >
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    {isConsulta ? (
                      <>
                        <TableCell className="text-muted-foreground font-mono text-sm">
                          {c.telefone ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{c.email ?? "—"}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="text-muted-foreground">{c.cargo ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{c.condominio?.nome ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">
                          {c.cpfMascarado ?? "—"}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {!isConsulta && inativos.length > 0 && (
            <div className="mt-6">
              <button
                onClick={() => setMostrarInativos((v) => !v)}
                className="text-muted-foreground mb-2 text-sm underline underline-offset-2"
              >
                {mostrarInativos ? "Ocultar" : "Mostrar"} inativos ({inativos.length})
              </button>
              {mostrarInativos && (
                <div className="rounded-lg border opacity-70">
                  <Table>
                    <TableBody>
                      {inativos.map((c) => (
                        <TableRow
                          key={c.id}
                          className="cursor-pointer"
                          onClick={() => router.push(`/colaboradores/${c.id}`)}
                        >
                          <TableCell className="font-medium">{c.nome}</TableCell>
                          <TableCell className="text-muted-foreground">{c.cargo ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{c.condominio?.nome ?? "—"}</TableCell>
                          <TableCell>
                            <StatusBadge label="Inativo" tom="perigo" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
