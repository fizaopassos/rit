"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
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

function ListaColaboradores({
  colaboradores,
  isConsulta,
}: {
  colaboradores: Colaborador[];
  isConsulta: boolean;
}) {
  return (
    <ul className="divide-y rounded-md border">
      {colaboradores.map((c) => {
        const conteudo = (
          <>
            <div>
              <span className="font-medium">{c.nome}</span>
              <p className="text-muted-foreground text-xs">
                {isConsulta
                  ? (c.email ?? "sem email")
                  : `${c.cargo ?? "—"} ${c.condominio ? `· ${c.condominio.nome}` : ""}`}
              </p>
            </div>
            <span className="text-muted-foreground font-mono text-sm">
              {isConsulta ? (c.telefone ?? "—") : (c.cpfMascarado ?? "—")}
            </span>
          </>
        );

        if (isConsulta) {
          return (
            <li key={c.id} className="flex items-center justify-between px-4 py-3">
              {conteudo}
            </li>
          );
        }

        return (
          <li key={c.id}>
            <Link
              href={`/colaboradores/${c.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/50"
            >
              {conteudo}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function ColaboradoresPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [carregando, setCarregando] = useState(true);
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

  const ativos = colaboradores.filter((c) => isConsulta || c.status !== "INATIVO");
  const inativos = colaboradores.filter((c) => !isConsulta && c.status === "INATIVO");

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Colaboradores</h1>
          <p className="text-muted-foreground text-sm">
            {isConsulta
              ? "Nome, telefone e email de cada colaborador."
              : "Quem recebe equipamento — CPF sempre mascarado por padrão."}
          </p>
        </div>
        {!isConsulta && <NovoColaboradorDialog onCriado={carregar} />}
      </div>

      {carregando ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : colaboradores.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhum colaborador cadastrado ainda.
        </p>
      ) : (
        <>
          <ListaColaboradores colaboradores={ativos} isConsulta={isConsulta} />

          {!isConsulta && inativos.length > 0 && (
            <div className="mt-6">
              <button
                onClick={() => setMostrarInativos((v) => !v)}
                className="text-muted-foreground mb-2 text-sm underline underline-offset-2"
              >
                {mostrarInativos ? "Ocultar" : "Mostrar"} inativos ({inativos.length})
              </button>
              {mostrarInativos && (
                <ul className="divide-y rounded-md border opacity-70">
                  {inativos.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/colaboradores/${c.id}`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-muted/50"
                      >
                        <div>
                          <span className="font-medium">{c.nome}</span>
                          <p className="text-muted-foreground text-xs">
                            {c.cargo ?? "—"} {c.condominio ? `· ${c.condominio.nome}` : ""}
                          </p>
                        </div>
                        <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                          Inativo
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
