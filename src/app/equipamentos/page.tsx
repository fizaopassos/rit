"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { NovoEquipamentoDialog } from "@/components/novo-equipamento-dialog";
import { TIPO_EQUIPAMENTO_LABEL, TipoEquipamentoValue } from "@/lib/tipos-equipamento";

type Equipamento = {
  id: string;
  numeroPatrimonio: string;
  numeroSerie: string | null;
  tipoEquipamento: TipoEquipamentoValue;
  status: string;
  proprietarioTipo: string;
  modelo: { nome: string; marca: { nome: string } };
  condominio: { nome: string };
};

const STATUS_LABEL: Record<string, string> = {
  EM_ESTOQUE: "Em estoque",
  EM_USO: "Em uso",
  EM_MANUTENCAO: "Em manutenção",
  BAIXADO: "Baixado",
};

export default function EquipamentosPage() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch("/api/equipamentos");
      setEquipamentos(await res.json());
    } catch {
      toast.error("Não foi possível carregar os equipamentos");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Equipamentos</h1>
          <p className="text-muted-foreground text-sm">
            Parque de equipamentos de tecnologia.
          </p>
        </div>
        <NovoEquipamentoDialog onCriado={carregar} />
      </div>

      {carregando ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : equipamentos.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhum equipamento cadastrado ainda.
        </p>
      ) : (
        <ul className="divide-y rounded-md border">
          {equipamentos.map((eq) => (
            <li key={eq.id}>
              <Link
                href={`/equipamentos/${eq.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/50"
              >
                <div>
                  <span className="font-mono text-xs text-muted-foreground">{eq.numeroPatrimonio}</span>
                  <p className="font-medium">
                    {eq.modelo.marca.nome} {eq.modelo.nome}
                    {eq.numeroSerie && (
                      <span className="text-muted-foreground font-normal"> · S/N {eq.numeroSerie}</span>
                    )}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {TIPO_EQUIPAMENTO_LABEL[eq.tipoEquipamento]} · {eq.condominio.nome} ·{" "}
                    {eq.proprietarioTipo === "ADMINISTRADORA" ? "Administradora" : "Associação"}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  {STATUS_LABEL[eq.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}