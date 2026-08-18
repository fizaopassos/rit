"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { VincularEquipamentoColaboradorDialog } from "@/components/vincular-equipamento-colaborador-dialog";
import { DevolverEmLoteDialog } from "@/components/devolver-em-lote-dialog";
import { EditarColaboradorDialog } from "@/components/editar-colaborador-dialog";
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
  status: string;
  cpfMascarado: string | null;
  vinculoTipo: string;
  tipoPessoa: string;
  cnpj: string | null;
  condominioId: string | null;
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
      <Card className="mb-6">
        <CardContent className="flex items-start justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{colaborador.nome}</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {colaborador.cargo ?? "—"} {colaborador.condominio ? `· ${colaborador.condominio.nome}` : ""}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <StatusBadge
                label={colaborador.status === "ATIVO" ? "Ativo" : "Inativo"}
                tom={colaborador.status === "ATIVO" ? "sucesso" : "perigo"}
              />
              <span className="text-muted-foreground font-mono text-sm">
                {cpfRevelado ?? colaborador.cpfMascarado ?? "—"}
              </span>
              {colaborador.cpfMascarado && !cpfRevelado && (
                <Button variant="ghost" size="sm" onClick={revelarCpf}>Ver CPF</Button>
              )}
            </div>
          </div>
          <EditarColaboradorDialog colaboradorId={colaborador.id} dadosAtuais={colaborador} onEditado={carregar} />
        </CardContent>
      </Card>

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
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-muted-foreground text-sm">Nenhum equipamento vinculado no momento.</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Equipamento</TableHead>
                <TableHead>Patrimônio</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="w-px" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {colaborador.alocacoes.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selecionados.includes(a.equipamento.id)}
                      onChange={() => toggleSelecionado(a.equipamento.id)}
                      className="size-4"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {a.equipamento.modelo.marca.nome} {a.equipamento.modelo.nome}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {a.equipamento.numeroPatrimonio}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {TIPO_EQUIPAMENTO_LABEL[a.equipamento.tipoEquipamento]}
                  </TableCell>
                  <TableCell>
                    <a
                      href={`/api/alocacoes/${a.id}/comodato`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary text-xs underline underline-offset-2"
                    >
                      Gerar comodato
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
