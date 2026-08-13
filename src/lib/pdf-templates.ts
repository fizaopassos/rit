type AlocacaoComDados = {
  dataInicio: Date;
  dataFim: Date | null;
  motivoDevolucao: string | null;
  colaborador: { nome: string; rg: string | null; cargo: string | null };
  equipamento: {
    numeroSerie: string | null;
    itensInclusos: string | null;
    notaFiscalNumero: string | null;
    notaFiscalValor: unknown;
    tipoEquipamento: string;
    condominio: { nome: string };
    modelo: { nome: string; marca: { nome: string } };
    linha?: { numero: string; operadora: string | null; valorMensal: unknown } | null;
  };
};

function formatarData(data: Date) {
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatarValor(valor: unknown) {
  if (valor === null || valor === undefined) return "";
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const ESTILO_BASE = `
  <style>
    body { font-family: 'Helvetica', Arial, sans-serif; font-size: 12px; color: #1a1a1a; padding: 40px; }
    h1 { font-size: 15px; text-align: center; margin-bottom: 24px; }
    .cabecalho { margin-bottom: 20px; }
    .cabecalho strong { display: block; font-size: 13px; }
    p { line-height: 1.5; margin: 8px 0; }
    ol { padding-left: 18px; }
    li { margin-bottom: 6px; }
    .campos { margin-top: 24px; }
    .campos p { margin: 4px 0; }
    .assinaturas { margin-top: 60px; display: flex; justify-content: space-between; }
    .assinatura { width: 45%; text-align: center; border-top: 1px solid #000; padding-top: 6px; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    td, th { border: 1px solid #999; padding: 4px 8px; font-size: 11px; }
  </style>
`;

export function buildComodatoHtml(alocacao: AlocacaoComDados) {
  const eq = alocacao.equipamento;
  const linhaTexto = eq.linha
    ? `<li>Em caso de utilização de linha telefônica fornecida pelo empregador (${eq.linha.numero}, operadora ${eq.linha.operadora ?? "—"}, valor mensal ${formatarValor(eq.linha.valorMensal)}), os valores excedentes na fatura do mês vigente serão cobrados e descontados em folha de pagamento do empregado.</li>`
    : "";

  return `
    <html><head>${ESTILO_BASE}</head><body>
      <div class="cabecalho">
        <strong>RETHA IMÓVEIS LTDA.</strong>
        CNPJ 01.675.074/0001-90 — Av. José Giorgi 301, São Paulo II, Cotia - SP
      </div>
      <h1>TERMO DE COMPROMISSO — Equipamentos Corporativos</h1>

      <p><strong>EMPREGADOR:</strong> Retha Imóveis Ltda., acima qualificada.</p>
      <p><strong>FUNCIONÁRIO:</strong> Eu, ${alocacao.colaborador.nome}, RG nº ${alocacao.colaborador.rg ?? "____________"}, declaro ter recebido do empregador o equipamento descrito abaixo, o qual deverá ser usado nas seguintes condições:</p>

      <p><strong>a) Condições de uso:</strong></p>
      <ol>
        <li>O equipamento corporativo deverá ser usado para fins de desenvolvimento das atividades do colaborador da Retha Imóveis Ltda.</li>
        <li>O colaborador não pode emprestar o equipamento a outros, inclusive colaboradores.</li>
        <li>O colaborador não pode instalar nenhum aplicativo sem autorização expressa do Coordenador de TI.</li>
      </ol>

      <p><strong>b) Responsabilidades:</strong></p>
      <ol>
        <li>É de responsabilidade do colaborador zelar pelo bom uso do equipamento, evitando quebra e outros procedimentos que inibam seu bom funcionamento.</li>
        <li>Em caso de furto ou roubo, o colaborador deverá informar ao Coordenador de TI imediatamente, apresentando o Boletim de Ocorrência.</li>
        <li>Para reposição do equipamento por mau uso ou perda, o valor de pagamento será o mesmo constante na nota fiscal de aquisição do bem.</li>
        ${linhaTexto}
      </ol>

      <p><strong>c) Tempo de duração:</strong> o contrato terá validade durante todo o tempo empregatício do colaborador, enquanto houver necessidade de uso deste equipamento.</p>

      <div class="campos">
        <p><strong>Número de série do equipamento:</strong> ${eq.numeroSerie ?? "—"}</p>
        <p><strong>Marca/Modelo:</strong> ${eq.modelo.marca.nome} ${eq.modelo.nome}</p>
        <p><strong>Nota fiscal:</strong> ${eq.notaFiscalNumero ?? "—"}</p>
        <p><strong>Valor do equipamento:</strong> ${formatarValor(eq.notaFiscalValor)}</p>
        <p><strong>Descrição de itens inclusos:</strong> ${eq.itensInclusos ?? "—"}</p>
      </div>

      <p style="margin-top:24px">Cotia, ${formatarData(alocacao.dataInicio)}.</p>

      <div class="assinaturas">
        <div class="assinatura">Assinatura do Responsável de TI</div>
        <div class="assinatura">Assinatura do Colaborador</div>
      </div>
    </body></html>
  `;
}

const MOTIVO_LABEL: Record<string, string> = {
  SAIDA_FUNCIONARIO: "Saída de funcionário da empresa",
  TROCA_APARELHO: "Troca de aparelho",
  FERIAS_LICENCA: "Férias ou licença",
  OUTROS: "Outros",
};

export function buildChecklistHtml(alocacao: AlocacaoComDados) {
  const eq = alocacao.equipamento;
  const itens = (eq.itensInclusos ?? "")
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);

  return `
    <html><head>${ESTILO_BASE}</head><body>
      <div class="cabecalho"><strong>RETHA</strong></div>
      <h1>Devolução de Equipamentos Corporativos</h1>

      <p><strong>1. Informações do Colaborador/Prestador</strong></p>
      <table>
        <tr><td><strong>Nome completo</strong></td><td>${alocacao.colaborador.nome}</td></tr>
        <tr><td><strong>Localidade</strong></td><td>${eq.condominio.nome}</td></tr>
        <tr><td><strong>Setor</strong></td><td>${alocacao.colaborador.cargo ?? "—"}</td></tr>
      </table>

      <p><strong>2. Descrição do(s) bem(ns) devolvido(s)</strong></p>
      <table>
        <tr><td><strong>Item</strong></td><td>${eq.tipoEquipamento}</td></tr>
        <tr><td><strong>Marca e modelo</strong></td><td>${eq.modelo.marca.nome} ${eq.modelo.nome}</td></tr>
        <tr><td><strong>S/N</strong></td><td>${eq.numeroSerie ?? "—"}</td></tr>
        <tr><td><strong>Itens inclusos</strong></td><td>${itens.length ? itens.join(", ") : "—"}</td></tr>
      </table>

      <p><strong>3. Motivo da devolução</strong></p>
      <p>${alocacao.motivoDevolucao ? MOTIVO_LABEL[alocacao.motivoDevolucao] : "—"}</p>

      <p><strong>4. Declaração</strong></p>
      <p>A Retha declara ter recebido os itens descritos no item 2 deste termo do profissional acima citado, ciente do motivo da devolução descrito no item 3.</p>

      <p style="margin-top:24px">Cotia, ${formatarData(alocacao.dataFim ?? new Date())}.</p>

      <div class="assinaturas">
        <div class="assinatura">Assinatura do Responsável de TI</div>
        <div class="assinatura">Assinatura do Colaborador</div>
      </div>
    </body></html>
  `;
}

// Versão em lote — vários equipamentos devolvidos juntos no mesmo documento,
// exatamente como o checklist em papel costuma ser preenchido na prática.
export function buildChecklistHtmlLote(alocacoes: AlocacaoComDados[]) {
  const primeira = alocacoes[0];
  const linhasItens = alocacoes
    .map((a) => {
      const eq = a.equipamento;
      const itens = (eq.itensInclusos ?? "")
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);
      return `
        <tr>
          <td>${eq.tipoEquipamento}</td>
          <td>${eq.modelo.marca.nome} ${eq.modelo.nome}</td>
          <td>${eq.numeroSerie ?? "—"}</td>
          <td>${itens.length ? itens.join(", ") : "—"}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <html><head>${ESTILO_BASE}</head><body>
      <div class="cabecalho"><strong>RETHA</strong></div>
      <h1>Devolução de Equipamentos Corporativos</h1>

      <p><strong>1. Informações do Colaborador/Prestador</strong></p>
      <table>
        <tr><td><strong>Nome completo</strong></td><td>${primeira.colaborador.nome}</td></tr>
        <tr><td><strong>Localidade</strong></td><td>${primeira.equipamento.condominio.nome}</td></tr>
        <tr><td><strong>Setor</strong></td><td>${primeira.colaborador.cargo ?? "—"}</td></tr>
      </table>

      <p><strong>2. Descrição do(s) bem(ns) devolvido(s)</strong></p>
      <table>
        <tr><th>Item</th><th>Marca e modelo</th><th>S/N</th><th>Itens inclusos</th></tr>
        ${linhasItens}
      </table>

      <p><strong>3. Motivo da devolução</strong></p>
      <p>${primeira.motivoDevolucao ? MOTIVO_LABEL[primeira.motivoDevolucao] : "—"}</p>

      <p><strong>4. Declaração</strong></p>
      <p>A Retha declara ter recebido os itens descritos no item 2 deste termo do profissional acima citado, ciente do motivo da devolução descrito no item 3.</p>

      <p style="margin-top:24px">Cotia, ${formatarData(primeira.dataFim ?? new Date())}.</p>

      <div class="assinaturas">
        <div class="assinatura">Assinatura do Responsável de TI</div>
        <div class="assinatura">Assinatura do Colaborador</div>
      </div>
    </body></html>
  `;
}