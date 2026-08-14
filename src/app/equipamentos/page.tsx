"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { EmptyState, LoadingState } from "@/components/empty-loading-states";
import { StatusBadge } from "@/components/status-badge";
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
  responsavel: { id: string; nome: string } | null;
};

const STATUS_LABEL: Record<string, string> = {
  EM_ESTOQUE: "Em estoque",
  EM_USO: "Em uso",
  EM_MANUTENCAO: "Em manutenção",
  BAIXADO: "Baixado",
};

const STATUS_TOM: Record<string, "neutro" | "sucesso" | "aviso" | "perigo"> = {
  EM_ESTOQUE: "neutro",
  EM_USO: "sucesso",
  EM_MANUTENCAO: "aviso",
  BAIXADO: "perigo",
};

export default function EquipamentosPage() {
  const router = useRouter();
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");

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

  const indicadores = useMemo(() => {
    return {
      total: equipamentos.length,
      emUso: equipamentos.filter((e) => e.status === "EM_USO").length,
      emEstoque: equipamentos.filter((e) => e.status === "EM_ESTOQUE").length,
      emManutencao: equipamentos.filter((e) => e.status === "EM_MANUTENCAO").length,
      baixados: equipamentos.filter((e) => e.status === "BAIXADO").length,
    };
  }, [equipamentos]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return equipamentos.filter((eq) => {
      if (filtroStatus !== "TODOS" && eq.status !== filtroStatus) return false;
      if (filtroTipo !== "TODOS" && eq.tipoEquipamento !== filtroTipo) return false;
      if (!termo) return true;
      const alvo = `${eq.numeroPatrimonio} ${eq.modelo.marca.nome} ${eq.modelo.nome} ${eq.numeroSerie ?? ""}`.toLowerCase();
      return alvo.includes(termo);
    });
  }, [equipamentos, busca, filtroStatus, filtroTipo]);

  return (
    <div className="mx-auto max-w-6xl p-8">
      <PageHeader
        title="Equipamentos"
        description="Parque de equipamentos de tecnologia da Retha."
        action={<NovoEquipamentoDialog onCriado={carregar} />}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Total", valor: indicadores.total },
          { label: "Em uso", valor: indicadores.emUso },
          { label: "Em estoque", valor: indicadores.emEstoque },
          { label: "Em manutenção", valor: indicadores.emManutencao },
          { label: "Baixados", valor: indicadores.baixados },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="px-4 py-3">
              <p className="text-muted-foreground text-xs">{item.label}</p>
              <p className="text-2xl font-semibold tabular-nums">{item.valor}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por patrimônio, modelo ou série..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filtroStatus} onValueChange={(v) => v && setFiltroStatus(v)}>
          <SelectTrigger className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos os status</SelectItem>
            {Object.entries(STATUS_LABEL).map(([valor, label]) => (
              <SelectItem key={valor} value={valor}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroTipo} onValueChange={(v) => v && setFiltroTipo(v)}>
          <SelectTrigger className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos os tipos</SelectItem>
            {Object.entries(TIPO_EQUIPAMENTO_LABEL).map(([valor, label]) => (
              <SelectItem key={valor} value={valor}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {carregando ? (
        <LoadingState rows={6} />
      ) : filtrados.length === 0 ? (
        <EmptyState
          message={
            equipamentos.length === 0
              ? "Nenhum equipamento cadastrado ainda."
              : "Nenhum equipamento encontrado com esses filtros."
          }
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patrimônio</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Condomínio</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((eq) => (
                <TableRow
                  key={eq.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/equipamentos/${eq.id}`)}
                >
                  <TableCell className="font-mono text-xs">{eq.numeroPatrimonio}</TableCell>
                  <TableCell>
                    <div className="font-medium">{eq.modelo.marca.nome} {eq.modelo.nome}</div>
                    {eq.numeroSerie && (
                      <div className="text-muted-foreground text-xs">S/N {eq.numeroSerie}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {TIPO_EQUIPAMENTO_LABEL[eq.tipoEquipamento]}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {eq.responsavel?.nome ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{eq.condominio.nome}</TableCell>
                  <TableCell>
                    <StatusBadge label={STATUS_LABEL[eq.status]} tom={STATUS_TOM[eq.status]} />
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
