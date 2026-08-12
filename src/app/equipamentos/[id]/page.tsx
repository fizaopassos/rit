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
import { BaixarEquipamentoDialog } from "@/components/baixar-equipamento-dialog";
import { UploadAnexoDialog } from "@/components/upload-anexo-dialog";
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

const MOTIVO_BAIXA_LABEL: Record<string, string> = {
  FURTO_ROUBO: "Furto ou roubo",
  PERDA: "Perda",
  OBSOLESCENCIA: "Obsolescência",
  DOACAO: "Doação",
  VENDA: "Venda",
  QUEBRA_IRREPARAVEL: "Quebra irreparável",
  OUTRO: "Outro",
};

const TIPO_ANEXO_LABEL: Record<string, string> = {
  NOTA_FISCAL: "Nota fiscal",
  TERMO_COMODATO: "Termo de comodato",
  CHECKLIST_DEVOLUCAO: "Checklist de devolução",
  OUTRO: "Outro",
};

type Alocacao = {
  id: string;
  dataInicio: string;
  dataFim: string | null;
  motivoDevolucao: string | null;
  colaborador: { nome: string };
};

type Anexo = {
  id: string;
  tipo: string;
  numeroDocumento: string | null;
  valor: string | null;
  data: string | null;
  criadoEm: string;
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
  motivoBaixa: string | null;
  dataBaixa: string | null;
  observacaoBaixa: string | null;
  modelo: { nome: string; marca: { nome: string } };
  condominio: { nome: string };
  alocacoes: Alocacao[];
  anexos: Anexo[];
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
            <a href={`/api/alocacoes/${alocacaoAtual.id}/comodato`} target="_blank" rel="noreferrer" className="text-sm text-primary underline underline-offset-2">
              Gerar comodato
            </a>
          )}
          {alocacaoAtual ? (
            <DevolverEquipamentoDialog equipamentoId={equipamento.id} onDevolvido={carregar} />
          ) : equipamento.status !== "BAIXADO" ? (
            <>
              <VincularEquipamentoDialog equipamentoId={equipamento.id} onVinculado={carregar} />
              <BaixarEquipamentoDialog equipamentoId={equipamento.id} onBaixado={carregar} />
            </>
          ) : null}
        </div>
      </div>

      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados">Dados gerais</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="anexos">Anexos</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="space-y-2 pt-4 text-sm">
          <p><span className="text-muted-foreground">Nº de série:</span> {equipamento.numeroSerie ?? "—"}</p>
          <p><span className="text-muted-foreground">Nota fiscal:</span> {equipamento.notaFiscalNumero ?? "—"} {equipamento.notaFiscalValor ? `· R$ ${equipamento.notaFiscalValor}` : ""}</p>
          <p><span className="text-muted-foreground">IP local:</span> {equipamento.ipLocal ?? "—"}</p>
          <p><span className="text-muted-foreground">MAC:</span> {equipamento.macAddress ?? "—"}</p>
          <p><span className="text-muted-foreground">Ramal:</span> {equipamento.numeroRamal ?? "—"}</p>
          <p><span className="text-muted-foreground">Observações:</span> {equipamento.observacoes ?? "—"}</p>
          {equipamento.status === "BAIXADO" && (
            <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <p className="font-medium text-destructive">Equipamento baixado</p>
              <p className="text-muted-foreground text-xs">
                Motivo: {equipamento.motivoBaixa ? MOTIVO_BAIXA_LABEL[equipamento.motivoBaixa] : "—"}
                {equipamento.dataBaixa && ` · ${new Date(equipamento.dataBaixa).toLocaleDateString("pt-BR")}`}
              </p>
              {equipamento.observacaoBaixa && (
                <p className="text-muted-foreground text-xs">{equipamento.observacaoBaixa}</p>
              )}
            </div>
          )}
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
                    <a href={`/api/alocacoes/${a.id}/checklist`} target="_blank" rel="noreferrer" className="text-primary text-xs underline underline-offset-2">
                      Ver checklist de devolução
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="anexos" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <UploadAnexoDialog equipamentoId={equipamento.id} onEnviado={carregar} />
          </div>
          {equipamento.anexos.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum anexo ainda.</p>
          ) : (
            <ul className="divide-y rounded-md border">
              {equipamento.anexos.map((anexo) => (
                <li key={anexo.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{TIPO_ANEXO_LABEL[anexo.tipo] ?? anexo.tipo}</p>
                    <p className="text-muted-foreground text-xs">
                      {anexo.numeroDocumento && `NF ${anexo.numeroDocumento} · `}
                      {anexo.valor && `R$ ${anexo.valor} · `}
                      {new Date(anexo.criadoEm).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <a href={`/api/anexos/${anexo.id}/download`} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
                    Baixar
                  </a>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
