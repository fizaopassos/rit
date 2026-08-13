"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { BaixarEquipamentoDialog } from "@/components/baixar-equipamento-dialog";
import { UploadAnexoDialog } from "@/components/upload-anexo-dialog";
import { NovaManutencaoDialog } from "@/components/nova-manutencao-dialog";
import { EditarEquipamentoDialog } from "@/components/editar-equipamento-dialog";
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

const TIPO_MANUTENCAO_LABEL: Record<string, string> = {
  PREVENTIVA: "Preventiva",
  CORRETIVA: "Corretiva",
  TROCA_PECA: "Troca de peça",
};

type Alocacao = {
  id: string;
  dataInicio: string;
  dataFim: string | null;
  motivoDevolucao: string | null;
  colaborador: { id: string; nome: string };
};

type Anexo = {
  id: string;
  tipo: string;
  numeroDocumento: string | null;
  valor: string | null;
  data: string | null;
  criadoEm: string;
};

type Manutencao = {
  id: string;
  data: string;
  tipo: string;
  descricao: string;
  pecaTrocada: string | null;
  custo: string | null;
  fornecedor: string | null;
};

type Equipamento = {
  id: string;
  modeloId: string;
  numeroPatrimonio: string;
  numeroSerie: string | null;
  tipoEquipamento: TipoEquipamentoValue;
  status: string;
  proprietarioTipo: string;
  notaFiscalNumero: string | null;
  notaFiscalValor: string | null;
  dataAquisicao: string | null;
  ipLocal: string | null;
  macAddress: string | null;
  numeroRamal: string | null;
  itensInclusos: string | null;
  observacoes: string | null;
  motivoBaixa: string | null;
  dataBaixa: string | null;
  observacaoBaixa: string | null;
  modelo: { nome: string; marca: { nome: string } };
  condominio: { nome: string };
  alocacoes: Alocacao[];
  anexos: Anexo[];
  manutencoes: Manutencao[];
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
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
            {STATUS_LABEL[equipamento.status]}
          </span>
          <EditarEquipamentoDialog equipamentoId={equipamento.id} dadosAtuais={equipamento} onEditado={carregar} />
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between rounded-md border p-4">
        <div>
          <p className="text-muted-foreground text-xs">Responsável atual</p>
          <p className="font-medium">
            {alocacaoAtual ? (
              <Link href={`/colaboradores/${alocacaoAtual.colaborador.id}`} className="text-primary underline underline-offset-2">
                {alocacaoAtual.colaborador.nome}
              </Link>
            ) : (
              "Ninguém — em estoque"
            )}
          </p>
          {alocacaoAtual && (
            <p className="text-muted-foreground text-xs">
              Vincular, devolver e gerar comodato acontecem na ficha do colaborador.
            </p>
          )}
        </div>
        {!alocacaoAtual && equipamento.status !== "BAIXADO" && (
          <BaixarEquipamentoDialog equipamentoId={equipamento.id} onBaixado={carregar} />
        )}
      </div>

      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados">Dados gerais</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="manutencoes">Manutenções</TabsTrigger>
          <TabsTrigger value="anexos">Anexos</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="space-y-2 pt-4 text-sm">
          <p><span className="text-muted-foreground">Nº de série:</span> {equipamento.numeroSerie ?? "—"}</p>
          <p><span className="text-muted-foreground">Nota fiscal:</span> {equipamento.notaFiscalNumero ?? "—"} {equipamento.notaFiscalValor ? `· R$ ${equipamento.notaFiscalValor}` : ""}</p>
          <p><span className="text-muted-foreground">Data de aquisição:</span> {equipamento.dataAquisicao ? new Date(equipamento.dataAquisicao).toLocaleDateString("pt-BR") : "—"}</p>
          <p><span className="text-muted-foreground">IP local:</span> {equipamento.ipLocal ?? "—"}</p>
          <p><span className="text-muted-foreground">MAC:</span> {equipamento.macAddress ?? "—"}</p>
          <p><span className="text-muted-foreground">Ramal:</span> {equipamento.numeroRamal ?? "—"}</p>
          <p><span className="text-muted-foreground">Itens inclusos:</span> {equipamento.itensInclusos ?? "—"}</p>
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
                  <Link href={`/colaboradores/${a.colaborador.id}`} className="font-medium text-primary underline underline-offset-2">
                    {a.colaborador.nome}
                  </Link>
                  <p className="text-muted-foreground text-xs">
                    {new Date(a.dataInicio).toLocaleDateString("pt-BR")}
                    {" → "}
                    {a.dataFim ? new Date(a.dataFim).toLocaleDateString("pt-BR") : "atual"}
                    {a.motivoDevolucao && ` · ${MOTIVO_LABEL[a.motivoDevolucao]}`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="manutencoes" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <NovaManutencaoDialog equipamentoId={equipamento.id} onCriada={carregar} />
          </div>
          {equipamento.manutencoes.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhuma manutenção registrada ainda.</p>
          ) : (
            <ul className="space-y-3">
              {equipamento.manutencoes.map((m) => (
                <li key={m.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{TIPO_MANUTENCAO_LABEL[m.tipo] ?? m.tipo}</p>
                    <span className="text-muted-foreground text-xs">
                      {new Date(m.data).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">{m.descricao}</p>
                  <p className="text-muted-foreground text-xs">
                    {m.pecaTrocada && `Peça: ${m.pecaTrocada} · `}
                    {m.custo ? `R$ ${m.custo}` : "Sem custo"}
                    {m.fornecedor && ` · ${m.fornecedor}`}
                  </p>
                  <div className="mt-2">
                    <UploadAnexoDialog equipamentoId={equipamento.id} manutencaoId={m.id} onEnviado={carregar} />
                  </div>
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
