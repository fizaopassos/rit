"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingState } from "@/components/empty-loading-states";
import { NovoEquipamentoDialog } from "@/components/novo-equipamento-dialog";
import { NovoColaboradorDialog } from "@/components/novo-colaborador-dialog";
import { NovaLinhaDialog } from "@/components/nova-linha-dialog";
import { NovoEmailDialog } from "@/components/novo-email-dialog";
import {
  Wallet,
  Users,
  Phone,
  AlertTriangle,
  Laptop,
  Mail,
  Search,
} from "lucide-react";
import { TIPO_EQUIPAMENTO_LABEL, TipoEquipamentoValue } from "@/lib/tipos-equipamento";

type Equipamento = {
  status: string;
  tipoEquipamento: TipoEquipamentoValue;
  notaFiscalValor: string | null;
  condominio: { id: string; nome: string };
};

type Colaborador = {
  id: string;
  nome: string;
  status: string;
  condominioId: string | null;
};

type Linha = {
  status: string;
  valorMensal: string | null;
  colaborador: { status: string } | null;
};

type EmailWorkspace = {
  status: string;
  colaborador: { status: string } | null;
};

type Condominio = { id: string; nome: string };

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function BuscaColaboradorRapida({ colaboradores }: { colaboradores: Colaborador[] }) {
  const [termo, setTermo] = useState("");

  const resultados = useMemo(() => {
    const t = termo.trim().toLowerCase();
    if (!t) return [];
    return colaboradores
      .filter((c) => c.status === "ATIVO" && c.nome.toLowerCase().includes(t))
      .slice(0, 6);
  }, [colaboradores, termo]);

  return (
    <div className="relative">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        placeholder="Buscar colaborador para vincular ou devolver..."
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        className="pl-9"
      />
      {resultados.length > 0 && (
        <div className="bg-popover absolute z-10 mt-1 w-full rounded-md border shadow-md">
          {resultados.map((c) => (
            <Link
              key={c.id}
              href={`/colaboradores/${c.id}`}
              className="hover:bg-muted block px-3 py-2 text-sm"
            >
              {c.nome}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [emails, setEmails] = useState<EmailWorkspace[]>([]);
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [condominioFiltro, setCondominioFiltro] = useState("TODOS");

  const carregar = useCallback(() => {
    setCarregando(true);
    return Promise.all([
      fetch("/api/equipamentos").then((r) => r.json()),
      fetch("/api/colaboradores").then((r) => r.json()),
      fetch("/api/linhas").then((r) => r.json()),
      fetch("/api/emails").then((r) => r.json()),
      fetch("/api/condominios").then((r) => r.json()),
    ])
      .then(([eq, col, lin, ema, cond]) => {
        setEquipamentos(eq);
        setColaboradores(col);
        setLinhas(lin);
        setEmails(ema);
        setCondominios(cond);
      })
      .catch(() => toast.error("Não foi possível carregar os indicadores"))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const equipamentosFiltrados = useMemo(() => {
    if (condominioFiltro === "TODOS") return equipamentos;
    return equipamentos.filter((e) => e.condominio.id === condominioFiltro);
  }, [equipamentos, condominioFiltro]);

  const indicadoresEquipamentos = useMemo(() => ({
    total: equipamentosFiltrados.length,
    emUso: equipamentosFiltrados.filter((e) => e.status === "EM_USO").length,
    emEstoque: equipamentosFiltrados.filter((e) => e.status === "EM_ESTOQUE").length,
    emManutencao: equipamentosFiltrados.filter((e) => e.status === "EM_MANUTENCAO").length,
    baixados: equipamentosFiltrados.filter((e) => e.status === "BAIXADO").length,
  }), [equipamentosFiltrados]);

  const valorParque = useMemo(() => {
    return equipamentosFiltrados
      .filter((e) => e.status !== "BAIXADO")
      .reduce((soma, e) => soma + (e.notaFiscalValor ? Number(e.notaFiscalValor) : 0), 0);
  }, [equipamentosFiltrados]);

  const colaboradoresAtivos = useMemo(() => {
    if (condominioFiltro === "TODOS") return colaboradores.filter((c) => c.status === "ATIVO").length;
    return colaboradores.filter((c) => c.status === "ATIVO" && c.condominioId === condominioFiltro).length;
  }, [colaboradores, condominioFiltro]);

  const linhasAtivas = useMemo(() => linhas.filter((l) => l.status === "ATIVA"), [linhas]);
  const custoMensalLinhas = useMemo(
    () => linhasAtivas.reduce((soma, l) => soma + (l.valorMensal ? Number(l.valorMensal) : 0), 0),
    [linhasAtivas],
  );

  const pendencias = useMemo(() => {
    const linhasOrfas = linhas.filter(
      (l) => l.status === "ATIVA" && (!l.colaborador || l.colaborador.status !== "ATIVO"),
    ).length;
    const emailsOrfaos = emails.filter(
      (e) => e.status === "EM_USO" && e.colaborador && e.colaborador.status !== "ATIVO",
    ).length;
    return linhasOrfas + emailsOrfaos;
  }, [linhas, emails]);

  const porCondominio = useMemo(() => {
    const mapa = new Map<string, number>();
    equipamentos.forEach((e) => mapa.set(e.condominio.nome, (mapa.get(e.condominio.nome) ?? 0) + 1));
    return Array.from(mapa.entries()).sort((a, b) => b[1] - a[1]);
  }, [equipamentos]);

  const porTipo = useMemo(() => {
    const mapa = new Map<string, number>();
    equipamentosFiltrados.forEach((e) => {
      const label = TIPO_EQUIPAMENTO_LABEL[e.tipoEquipamento] ?? e.tipoEquipamento;
      mapa.set(label, (mapa.get(label) ?? 0) + 1);
    });
    return Array.from(mapa.entries()).sort((a, b) => b[1] - a[1]);
  }, [equipamentosFiltrados]);

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">RIT — Retha Ativos</h1>
          <p className="text-muted-foreground mt-1 text-sm">Controle de ativos de tecnologia.</p>
        </div>
        <Select value={condominioFiltro} onValueChange={(v) => v && setCondominioFiltro(v)}>
          <SelectTrigger className="w-56">
            <SelectValue>
              {(valor: string | null) =>
                valor === "TODOS" || !valor
                  ? "Todos os condomínios"
                  : (condominios.find((c) => c.id === valor)?.nome ?? "Todos os condomínios")
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos os condomínios</SelectItem>
            {condominios.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {carregando ? (
        <LoadingState rows={3} />
      ) : (
        <>
          <div className="mb-8">
            <p className="mb-3 text-sm font-medium">Acessos rápidos</p>
            <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Card className="flex flex-col items-center gap-2 p-4 text-center">
                <Laptop className="text-primary size-5" />
                <span className="text-sm font-medium">Equipamento</span>
                <NovoEquipamentoDialog onCriado={carregar} />
              </Card>
              <Card className="flex flex-col items-center gap-2 p-4 text-center">
                <Users className="text-primary size-5" />
                <span className="text-sm font-medium">Colaborador</span>
                <NovoColaboradorDialog onCriado={carregar} />
              </Card>
              <Card className="flex flex-col items-center gap-2 p-4 text-center">
                <Phone className="text-primary size-5" />
                <span className="text-sm font-medium">Linha</span>
                <NovaLinhaDialog onCriada={carregar} />
              </Card>
              <Card className="flex flex-col items-center gap-2 p-4 text-center">
                <Mail className="text-primary size-5" />
                <span className="text-sm font-medium">Email</span>
                <NovoEmailDialog onCriado={carregar} />
              </Card>
            </div>
            <BuscaColaboradorRapida colaboradores={colaboradores} />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="bg-brand-gradient relative overflow-hidden border-0 text-white">
              <Wallet className="absolute -top-2 -right-2 size-16 text-white/10" />
              <CardContent className="relative px-4 py-3">
                <p className="text-xs text-white/70">Valor do parque</p>
                <p className="text-xl font-semibold tabular-nums">{formatarMoeda(valorParque)}</p>
              </CardContent>
            </Card>
            <Card className="bg-brand-gradient relative overflow-hidden border-0 text-white">
              <Users className="absolute -top-2 -right-2 size-16 text-white/10" />
              <CardContent className="relative px-4 py-3">
                <p className="text-xs text-white/70">Colaboradores ativos</p>
                <p className="text-2xl font-semibold tabular-nums">{colaboradoresAtivos}</p>
              </CardContent>
            </Card>
            <Card className="bg-brand-gradient relative overflow-hidden border-0 text-white">
              <Phone className="absolute -top-2 -right-2 size-16 text-white/10" />
              <CardContent className="relative px-4 py-3">
                <p className="text-xs text-white/70">Custo mensal de linhas</p>
                <p className="text-xl font-semibold tabular-nums">{formatarMoeda(custoMensalLinhas)}</p>
                <p className="text-xs text-white/70">{linhasAtivas.length} ativa(s)</p>
              </CardContent>
            </Card>
            <Card className={`relative overflow-hidden border-0 text-white ${pendencias > 0 ? "bg-alert-gradient" : "bg-brand-gradient"}`}>
              <AlertTriangle className="absolute -top-2 -right-2 size-16 text-white/10" />
              <CardContent className="relative px-4 py-3">
                <p className="text-xs text-white/70">Pendências</p>
                <p className="text-2xl font-semibold tabular-nums">{pendencias}</p>
                <p className="text-xs text-white/70">Linha/email de colaborador inativo</p>
              </CardContent>
            </Card>
          </div>
          {condominioFiltro !== "TODOS" && (
            <p className="text-muted-foreground mb-4 text-xs">
              "Custo mensal de linhas" e "Pendências" mostram o total geral — Linha não tem vínculo direto com condomínio.
            </p>
          )}

          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { label: "Total", valor: indicadoresEquipamentos.total },
              { label: "Em uso", valor: indicadoresEquipamentos.emUso },
              { label: "Em estoque", valor: indicadoresEquipamentos.emEstoque },
              { label: "Em manutenção", valor: indicadoresEquipamentos.emManutencao },
              { label: "Baixados", valor: indicadoresEquipamentos.baixados },
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="px-4 py-3">
                  <p className="text-muted-foreground text-xs">{item.label}</p>
                  <p className="text-2xl font-semibold tabular-nums">{item.valor}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {equipamentosFiltrados.length > 0 && (
            <div className={`grid grid-cols-1 gap-4 ${condominioFiltro === "TODOS" ? "sm:grid-cols-2" : ""}`}>
              {condominioFiltro === "TODOS" && (
                <Card>
                  <CardContent className="px-5 py-4">
                    <p className="mb-3 text-sm font-medium">Por condomínio</p>
                    <ul className="space-y-2">
                      {porCondominio.map(([nome, qtd]) => (
                        <li key={nome} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{nome}</span>
                          <span className="font-medium tabular-nums">{qtd}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardContent className="px-5 py-4">
                  <p className="mb-3 text-sm font-medium">Por tipo</p>
                  <ul className="space-y-2">
                    {porTipo.map(([nome, qtd]) => (
                      <li key={nome} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{nome}</span>
                        <span className="font-medium tabular-nums">{qtd}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
