"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { NovaMarcaDialog } from "@/components/nova-marca-dialog";

type Marca = {
  id: string;
  nome: string;
  _count: { modelos: number };
};

export default function MarcasPage() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch("/api/marcas");
      const data = await res.json();
      setMarcas(data);
    } catch {
      toast.error("Não foi possível carregar as marcas");
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
          <h1 className="text-2xl font-semibold">Marcas</h1>
          <p className="text-muted-foreground text-sm">
            Cadastro reutilizável de marcas de equipamento.
          </p>
        </div>
        <NovaMarcaDialog onCriada={carregar} />
      </div>

      {carregando ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : marcas.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhuma marca cadastrada ainda.
        </p>
      ) : (
        <ul className="divide-y rounded-md border">
          {marcas.map((marca) => (
            <li
              key={marca.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="font-medium">{marca.nome}</span>
              <span className="text-muted-foreground text-sm">
                {marca._count.modelos} modelo(s)
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}