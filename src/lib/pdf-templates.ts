import fs from "fs";
import path from "path";

type AlocacaoComDados = {
  dataInicio: Date;
  dataFim: Date | null;
  motivoDevolucao: string | null;
  itensEntrega: string | null;
  itensDevolucao: string | null;
  colaborador: {
    nome: string;
    cpf: string | null;
    cnpj: string | null;
    tipoPessoa: string;
    cargo: string | null;
  };
  equipamento: {
    numeroSerie: string | null;
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

// PF usa "colaborador"/CPF; PJ usa "prestador"/CNPJ — em todo o documento.
function termosPessoa(colaborador: { tipoPessoa: string; cpf: string | null; cnpj: string | null }) {
  const pj = colaborador.tipoPessoa === "PESSOA_JURIDICA";
  return {
    pj,
    tratamento: pj ? "prestador" : "colaborador",
    tratamentoCap: pj ? "Prestador" : "Colaborador",
    rotuloDocumento: pj ? "CNPJ" : "CPF",
    numeroDocumento: pj ? (colaborador.cnpj ?? "____________") : (colaborador.cpf ?? "____________"),
  };
}

// Lê a logo do disco uma única vez e reaproveita em base64 — o Puppeteer
// não tem acesso à rede/servidor Next, então precisa do arquivo embutido
// diretamente no HTML, não como um <img src="/logo.png">.
let logoBase64Cache: string | null = null;
function obterLogoBase64(): string {
  if (logoBase64Cache !== null) return logoBase64Cache;
  try {
    const caminho = path.join(process.cwd(), "public", "logo.png");
    const buffer = fs.readFileSync(caminho);
    logoBase64Cache = `data:image/png;base64,${buffer.toString("base64")}`;
  } catch {
    logoBase64Cache = "";
  }
  return logoBase64Cache;
}

const ESTILO_BASE = `
  <style>
    body { font-family: 'Helvetica', Arial, sans-serif; font-size: 12px; color: #1a1a1a; padding: 40px; }
    h1 { font-size: 15px; text-align: center; margin-bottom: 24px; }
    .cabecalho { margin-bottom: 20px; }
    .cabecalho img { height: 110px; margin-bottom: 14px; display: block; }
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
  const t = termosPessoa(alocacao.colaborador);

  const linhaTexto = eq.linha
    ? `<li>Em caso de utilização de linha telefônica fornecida pelo empregador (${eq.linha.numero}, operadora ${eq.linha.operadora ?? "—"}, valor mensal ${formatarValor(eq.linha.valorMensal)}), os valores excedentes na fatura do mês vigente serão cobrados e descontados em folha de pagamento do ${t.tratamento}.</li>`
    : "";

  const declaracaoInicial = t.pj
    ? `A empresa ${alocacao.colaborador.nome}, ${t.rotuloDocumento} nº ${t.numeroDocumento}, doravante denominada PRESTADOR, declara ter recebido da Retha Imóveis Ltda. o equipamento descrito abaixo`
    : `Eu, ${alocacao.colaborador.nome}, ${t.rotuloDocumento} nº ${t.numeroDocumento}, declaro ter recebido do empregador o equipamento descrito abaixo`;

  return `
    <html><head>${ESTILO_BASE}</head><body>
      <div class="cabecalho">
        <img src="${obterLogoBase64()}" alt="Retha" />
        <strong>RETHA IMÓVEIS LTDA.</strong>
        CNPJ 01.675.074/0001-90 — Av. José Giorgi 301, São Paulo II, Cotia - SP
      </div>
      <h1>TERMO DE COMPROMISSO — Equipamentos Corporativos</h1>

      <p><strong>CONTRATANTE:</strong> Retha Imóveis Ltda., acima qualificada.</p>
      <p><strong>${t.pj ? "PRESTADOR" : "FUNCIONÁRIO"}:</strong> ${declaracaoInicial}, o qual deverá ser usado nas seguintes condições:</p>

      <p><strong>a) Condições de uso:</strong></p>
      <ol>
        <li>O equipamento corporativo deverá ser usado para fins de desenvolvimento das atividades do ${t.tratamento} junto à Retha Imóveis Ltda.</li>
        <li>O ${t.tratamentoCap} não pode emprestar o equipamento a outros, inclusive ${t.pj ? "outros prestadores" : "outros colaboradores"}.</li>
        <li>O ${t.tratamentoCap} não pode instalar nenhum aplicativo sem autorização expressa do Coordenador de TI.</li>
      </ol>

      <p><strong>b) Responsabilidades:</strong></p>
      <ol>
        <li>É de responsabilidade do ${t.tratamento} zelar pelo bom uso do equipamento, evitando quebra e outros procedimentos que inibam seu bom funcionamento.</li>
        <li>Em caso de furto ou roubo, o ${t.tratamento} deverá informar ao Coordenador de TI imediatamente, apresentando o Boletim de Ocorrência.</li>
        <li>Para reposição do equipamento por mau uso ou perda, o valor de pagamento será o mesmo constante na nota fiscal de aquisição do bem.</li>
        ${linhaTexto}
      </ol>

      <p><strong>c) Tempo de duração:</strong> o contrato terá validade durante todo o tempo ${t.pj ? "de vigência da prestação de serviço" : "empregatício do colaborador"}, enquanto houver necessidade de uso deste equipamento.</p>

      <div class="campos">
        <p><strong>Número de série do equipamento:</strong> ${eq.numeroSerie ?? "—"}</p>
        <p><strong>Marca/Modelo:</strong> ${eq.modelo.marca.nome} ${eq.modelo.nome}</p>
        <p><strong>Nota fiscal:</strong> ${eq.notaFiscalNumero ?? "—"}</p>
        <p><strong>Valor do equipamento:</strong> ${formatarValor(eq.notaFiscalValor)}</p>
        <p><strong>Descrição de itens inclusos:</strong> ${alocacao.itensEntrega ?? "—"}</p>
      </div>

      <p style="margin-top:24px">Cotia, ${formatarData(alocacao.dataInicio)}.</p>

      <div class="assinaturas">
        <div class="assinatura">Assinatura do Responsável de TI</div>
        <div class="assinatura">Assinatura do ${t.pj ? "Representante Legal do Prestador" : "Colaborador"}</div>
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
  const t = termosPessoa(alocacao.colaborador);

  return `
    <html><head>${ESTILO_BASE}</head><body>
      <div class="cabecalho"><img src="${obterLogoBase64()}" alt="Retha" /></div>
      <h1>Devolução de Equipamentos Corporativos</h1>

      <p><strong>1. Informações do Colaborador/Prestador</strong></p>
      <table>
        <tr><td><strong>${t.pj ? "Razão Social" : "Nome completo"}</strong></td><td>${alocacao.colaborador.nome}</td></tr>
        <tr><td><strong>${t.rotuloDocumento}</strong></td><td>${t.numeroDocumento}</td></tr>
        <tr><td><strong>Localidade</strong></td><td>${eq.condominio.nome}</td></tr>
        <tr><td><strong>Setor</strong></td><td>${alocacao.colaborador.cargo ?? "—"}</td></tr>
      </table>

      <p><strong>2. Descrição do(s) bem(ns) devolvido(s)</strong></p>
      <table>
        <tr><td><strong>Item</strong></td><td>${eq.tipoEquipamento}</td></tr>
        <tr><td><strong>Marca e modelo</strong></td><td>${eq.modelo.marca.nome} ${eq.modelo.nome}</td></tr>
        <tr><td><strong>S/N</strong></td><td>${eq.numeroSerie ?? "—"}</td></tr>
        <tr><td><strong>Itens inclusos</strong></td><td>${alocacao.itensDevolucao ?? "—"}</td></tr>
      </table>

      <p><strong>3. Motivo da devolução</strong></p>
      <p>${alocacao.motivoDevolucao ? MOTIVO_LABEL[alocacao.motivoDevolucao] : "—"}</p>

      <p><strong>4. Declaração</strong></p>
      <p>A Retha declara ter recebido os itens descritos no item 2 deste termo do ${t.tratamento} acima citado, ciente do motivo da devolução descrito no item 3.</p>

      <p style="margin-top:24px">Cotia, ${formatarData(alocacao.dataFim ?? new Date())}.</p>

      <div class="assinaturas">
        <div class="assinatura">Assinatura do Responsável de TI</div>
        <div class="assinatura">Assinatura do ${t.pj ? "Representante Legal do Prestador" : "Colaborador"}</div>
      </div>
    </body></html>
  `;
}

// Versão em lote — vários equipamentos devolvidos juntos no mesmo documento,
// exatamente como o checklist em papel costuma ser preenchido na prática.
export function buildChecklistHtmlLote(alocacoes: AlocacaoComDados[]) {
  const primeira = alocacoes[0];
  const t = termosPessoa(primeira.colaborador);

  const linhasItens = alocacoes
    .map((a) => {
      const eq = a.equipamento;
      return `
        <tr>
          <td>${eq.tipoEquipamento}</td>
          <td>${eq.modelo.marca.nome} ${eq.modelo.nome}</td>
          <td>${eq.numeroSerie ?? "—"}</td>
          <td>${a.itensDevolucao ?? "—"}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <html><head>${ESTILO_BASE}</head><body>
      <div class="cabecalho"><img src="${obterLogoBase64()}" alt="Retha" /></div>
      <h1>Devolução de Equipamentos Corporativos</h1>

      <p><strong>1. Informações do Colaborador/Prestador</strong></p>
      <table>
        <tr><td><strong>${t.pj ? "Razão Social" : "Nome completo"}</strong></td><td>${primeira.colaborador.nome}</td></tr>
        <tr><td><strong>${t.rotuloDocumento}</strong></td><td>${t.numeroDocumento}</td></tr>
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
      <p>A Retha declara ter recebido os itens descritos no item 2 deste termo do ${t.tratamento} acima citado, ciente do motivo da devolução descrito no item 3.</p>

      <p style="margin-top:24px">Cotia, ${formatarData(primeira.dataFim ?? new Date())}.</p>

      <div class="assinaturas">
        <div class="assinatura">Assinatura do Responsável de TI</div>
        <div class="assinatura">Assinatura do ${t.pj ? "Representante Legal do Prestador" : "Colaborador"}</div>
      </div>
    </body></html>
  `;
}
