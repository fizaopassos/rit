"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { VincularEquipamentoColaboradorDialog } from "@/components/vincular-equipamento-colaborador-dialog";
import { DevolverEmLoteDialog } from "@/components/devolver-em-lote-dialog";
import { TIPO_EQUIPAMENTO_LABEL, TipoEquipamentoValue } from "@/lib/tipos-equipamento";

type EquipamentoVinculado = {
  id: string;
  equipamento: {
    id: string;
    numeroPatrimonio: string;
    tipoEquipamento: TipoEquipamentoValue;
    modelo: { nome: string; marca: { nome: string } };
  };
};

type Colaborador = {
  id: string;
  nome: string;
  cargo: string | null;
  cpfMascarado: string | null;
  condominio: { nome: string } | null;
  alocacoes: EquipamentoVinculado[];
};

export default function ColaboradorPage() {
  const { id } = useParams<{ id: string }>();
  const [colaborador, setColaborador] = useState<Colaborador | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [cpfRevelado, setCpfRevelado] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch(`/api/colaboradores/${id}`);
      if (!res.ok) {
        toast.error("Colaborador não encontrado");
        return;
      }
      setColaborador(await res.json());
      setSelecionados([]);
    } catch {
      toast.error("Não foi possível carregar o colaborador");
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function revelarCpf() {
    try {
      const res = await fetch(`/api/colaboradores/${id}/cpf`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.erro ?? "Não foi possível ver o CPF");
        return;
      }
      setCpfRevelado(data.cpf);
    } catch {
      toast.error("Erro de conexão com o servidor");
    }
  }

  function toggleSelecionado(equipamentoId: string) {
    setSelecionados((prev) =>
      prev.includes(equipamentoId) ? prev.filter((e) => e !== equipamentoId) : [...prev, equipamentoId],
    );
  }

  if (carregando) {
    return <p className="text-muted-foreground p-8 text-sm">Carregando...</p>;
  }

  if (!colaborador) {
    return <p className="text-muted-foreground p-8 text-sm">Colaborador não encontrado.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{colaborador.nome}</h1>
        <p className="text-muted-foreground text-sm">
          {colaborador.cargo ?? "—"} {colaborador.condominio ? `· ${colaborador.condominio.nome}` : ""}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-muted-foreground font-mono text-sm">
            {cpfRevelado ?? colaborador.cpfMascarado ?? "—"}
          </span>
          {colaborador.cpfMascarado && !cpfRevelado && (
            <Button variant="ghost" size="sm" onClick={revelarCpf}>Ver CPF</Button>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-medium">Equipamentos vinculados</h2>
        <div className="flex gap-2">
          <VincularEquipamentoColaboradorDialog colaboradorId={colaborador.id} onVinculado={carregar} />
          <DevolverEmLoteDialog
            colaboradorId={colaborador.id}
            equipamentoIds={selecionados}
            onDevolvido={carregar}
          />
        </div>
      </div>

      {colaborador.alocacoes.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum equipamento vinculado no momento.</p>
      ) : (
        <ul className="divide-y rounded-md border">
          {colaborador.alocacoes.map((a) => (
            <li key={a.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={selecionados.includes(a.equipamento.id)}
                onChange={() => toggleSelecionado(a.equipamento.id)}
                className="size-4"
              />
              <div className="flex-1">
                <p className="font-medium">
                  {a.equipamento.modelo.marca.nome} {a.equipamento.modelo.nome}
                </p>
                <p className="text-muted-foreground text-xs">
                  {a.equipamento.numeroPatrimonio} · {TIPO_EQUIPAMENTO_LABEL[a.equipamento.tipoEquipamento]}
                </p>
              </div>
              <a href={`/api/alocacoes/${a.id}/comodato`} target="_blank" rel="noreferrer" className="text-primary text-xs underline underline-offset-2">
                Gerar comodato
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}