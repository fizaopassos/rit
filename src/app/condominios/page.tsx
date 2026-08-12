"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { NovoCondominioDialog } from "@/components/novo-condominio-dialog";

type Condominio = {
  id: string;
  nome: string;
  codigo: string;
  endereco: string | null;
};

export default function CondominiosPage() {
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [carregando, setCarregando] = useState(true);

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

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Condomínios</h1>
          <p className="text-muted-foreground text-sm">
            Condomínios administrados pela Retha.
          </p>
        </div>
        <NovoCondominioDialog onCriado={carregar} />
      </div>

      {carregando ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : condominios.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhum condomínio cadastrado ainda.
        </p>
      ) : (
        <ul className="divide-y rounded-md border">
          {condominios.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="font-medium">{c.nome}</span>
                {c.endereco && (
                  <p className="text-muted-foreground text-xs">{c.endereco}</p>
                )}
              </div>
              <span className="text-muted-foreground text-sm">{c.codigo}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}