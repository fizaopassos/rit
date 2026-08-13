"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { NovoColaboradorDialog } from "@/components/novo-colaborador-dialog";

type Colaborador = {
  id: string;
  nome: string;
  cargo: string | null;
  status: "ATIVO" | "INATIVO";
  cpfMascarado: string | null;
  condominio: { nome: string } | null;
};

export default function ColaboradoresPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [carregando, setCarregando] = useState(true);

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

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Colaboradores</h1>
          <p className="text-muted-foreground text-sm">
            Quem recebe equipamento — CPF sempre mascarado por padrão.
          </p>
        </div>
        <NovoColaboradorDialog onCriado={carregar} />
      </div>

      {carregando ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : colaboradores.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhum colaborador cadastrado ainda.
        </p>
      ) : (
        <ul className="divide-y rounded-md border">
          {colaboradores.map((c) => (
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
                <span className="text-muted-foreground font-mono text-sm">
                  {c.cpfMascarado ?? "—"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
