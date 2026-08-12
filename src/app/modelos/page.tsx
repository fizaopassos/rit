"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { NovoModeloDialog } from "@/components/novo-modelo-dialog";
import { TIPO_EQUIPAMENTO_LABEL, TipoEquipamentoValue } from "@/lib/tipos-equipamento";

type Modelo = {
  id: string;
  nome: string;
  tipoEquipamento: TipoEquipamentoValue;
  vidaUtilAnos: number | null;
  marca: { nome: string };
  _count: { equipamentos: number };
};

export default function ModelosPage() {
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [carregando, setCarregando] = useState(true);

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

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Modelos</h1>
          <p className="text-muted-foreground text-sm">
            Modelos vinculados a uma marca, reutilizados no cadastro de
            equipamento.
          </p>
        </div>
        <NovoModeloDialog onCriado={carregar} />
      </div>

      {carregando ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : modelos.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhum modelo cadastrado ainda.
        </p>
      ) : (
        <ul className="divide-y rounded-md border">
          {modelos.map((m) => (
            <li key={m.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="font-medium">
                  {m.marca.nome} {m.nome}
                </span>
                <p className="text-muted-foreground text-xs">
                  {TIPO_EQUIPAMENTO_LABEL[m.tipoEquipamento]} · vida útil {m.vidaUtilAnos ?? "—"} anos
                </p>
              </div>
              <span className="text-muted-foreground text-sm">
                {m._count.equipamentos} equipamento(s)
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}