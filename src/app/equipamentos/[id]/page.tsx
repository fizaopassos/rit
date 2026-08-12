
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { VincularEquipamentoDialog } from "@/components/vincular-equipamento-dialog";
import { DevolverEquipamentoDialog } from "@/components/devolver-equipamento-dialog";
import { TIPO_EQUIPAMENTO_LABEL, TipoEquipamentoValue } from "@/lib/tipos-equipamento";

const STATUS_LABEL: Record<string, string> = {
  EM_ESTOQUE: "Em estoque",
  EM_USO: "Em uso",
  EM_MANUTENCAO: "Em manutenção",
  BAIXADO: "Baixado",
};

const MOTIVO_LABEL: Record<string, string> = {
  SAIDA_FUNCIONARIO: "Saída de funcionário",
  TROCA_APARELHO: "Troca de aparelho",
  FERIAS_LICENCA: "Férias ou licença",
  OUTROS: "Outros",
};

type Alocacao = {
  id: string;
  dataInicio: string;
  dataFim: string | null;
  motivoDevolucao: string | null;
  colaborador: { nome: string };
};

type Equipamento = {
  id: string;
  numeroPatrimonio: string;
  numeroSerie: string | null;
  tipoEquipamento: TipoEquipamentoValue;
  status: string;
  proprietarioTipo: string;
  notaFiscalNumero: string | null;
  notaFiscalValor: string | null;
  ipLocal: string | null;
  macAddress: string | null;
  numeroRamal: string | null;
  observacoes: string | null;
  modelo: { nome: string; marca: { nome: string } };
  condominio: { nome: string };
  alocacoes: Alocacao[];
};

export default function EquipamentoPage() {
  const { id } = useParams<{ id: string }>();
  const [equipamento, setEquipamento] = useState<Equipamento | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch(`/api/equipamentos/${id}`);
      if (!res.ok) {
        toast.error("Equipamento não encontrado");
        return;
      }
      setEquipamento(await res.json());
    } catch {
      toast.error("Não foi possível carregar o equipamento");
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (carregando) {
    return <p className="text-muted-foreground p-8 text-sm">Carregando...</p>;
  }

  if (!equipamento) {
    return <p className="text-muted-foreground p-8 text-sm">Equipamento não encontrado.</p>;
  }

  const alocacaoAtual = equipamento.alocacoes.find((a) => !a.dataFim);

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <span className="font-mono text-muted-foreground text-xs">
            {equipamento.numeroPatrimonio}
          </span>
          <h1 className="text-2xl font-semibold">
            {equipamento.modelo.marca.nome} {equipamento.modelo.nome}
          </h1>
          <p className="text-muted-foreground text-sm">
            {TIPO_EQUIPAMENTO_LABEL[equipamento.tipoEquipamento]} ·{" "}
            {equipamento.condominio.nome} ·{" "}
            {equipamento.proprietarioTipo === "ADMINISTRADORA" ? "Administradora" : "Associação"}
          </p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
          {STATUS_LABEL[equipamento.status]}
        </span>
      </div>

      <div className="mb-6 flex items-center justify-between rounded-md border p-4">
        <div>
          <p className="text-muted-foreground text-xs">Responsável atual</p>
          <p className="font-medium">
            {alocacaoAtual ? alocacaoAtual.colaborador.nome : "Ninguém — em estoque"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {alocacaoAtual && (
            <a
              href={`/api/alocacoes/${alocacaoAtual.id}/comodato`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary underline underline-offset-2"
            >
              Gerar comodato
            </a>
          )}
          {alocacaoAtual ? (
            <DevolverEquipamentoDialog equipamentoId={equipamento.id} onDevolvido={carregar} />
          ) : (
            equipamento.status !== "BAIXADO" && (
              <VincularEquipamentoDialog equipamentoId={equipamento.id} onVinculado={carregar} />
            )
          )}
        </div>
      </div>

      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados">Dados gerais</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="space-y-2 pt-4 text-sm">
          <p><span className="text-muted-foreground">Nº de série:</span> {equipamento.numeroSerie ?? "—"}</p>
          <p><span className="text-muted-foreground">Nota fiscal:</span> {equipamento.notaFiscalNumero ?? "—"} {equipamento.notaFiscalValor ? `· R$ ${equipamento.notaFiscalValor}` : ""}</p>
          <p><span className="text-muted-foreground">IP local:</span> {equipamento.ipLocal ?? "—"}</p>
          <p><span className="text-muted-foreground">MAC:</span> {equipamento.macAddress ?? "—"}</p>
          <p><span className="text-muted-foreground">Ramal:</span> {equipamento.numeroRamal ?? "—"}</p>
          <p><span className="text-muted-foreground">Observações:</span> {equipamento.observacoes ?? "—"}</p>
        </TabsContent>

        <TabsContent value="historico" className="pt-4">
          {equipamento.alocacoes.length === 0 ? (
            <p className="text-muted-foreground text-sm">Sem histórico ainda.</p>
          ) : (
            <ul className="space-y-3">
              {equipamento.alocacoes.map((a) => (
                <li key={a.id} className="border-l-2 pl-3 text-sm">
                  <p className="font-medium">{a.colaborador.nome}</p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(a.dataInicio).toLocaleDateString("pt-BR")}
                    {" → "}
                    {a.dataFim ? new Date(a.dataFim).toLocaleDateString("pt-BR") : "atual"}
                    {a.motivoDevolucao && ` · ${MOTIVO_LABEL[a.motivoDevolucao]}`}
                  </p>
                  {a.dataFim && (
                    <a
                      href={`/api/alocacoes/${a.id}/checklist`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary text-xs underline underline-offset-2"
                    >
                      Ver checklist de devolução
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}