import { api } from './api.js';

const state = {
  user: null,
  dashboard: null,
  categorias: [],
  contas: [],
  clientes: [],
  fornecedores: [],
  cobrancas: [],
  asos: [],
  lancamentos: [],
  transferencias: [],
  contasPagar: [],
  pendencias: [],
  relatorioFluxo: [],
  relatorioDespesas: [],
  contaHistorico: null,
  activeView: 'dashboard',
  editing: {
    lancamentoId: null,
    categoriaId: null,
    clienteId: null,
    fornecedorId: null,
    contaId: null,
    contaPagarId: null,
    cobrancaId: null,
    asoId: null,
  },
};

const elements = {
  loginScreen: document.getElementById('login-screen'),
  appShell: document.getElementById('app-shell'),
  loginForm: document.getElementById('login-form'),
  loginFeedback: document.getElementById('login-feedback'),
  userName: document.getElementById('user-name'),
  userRole: document.getElementById('user-role'),
  logoutButton: document.getElementById('logout-button'),
  apiStatus: document.getElementById('api-status'),
  sidebarDashboardLink: document.getElementById('sidebar-dashboard-link'),
  heroDashboardLink: document.getElementById('hero-dashboard-link'),
  competenciaMes: document.getElementById('competencia-mes'),
  competenciaAno: document.getElementById('competencia-ano'),
  metrics: document.getElementById('metrics'),
  contasGrid: document.getElementById('contas-grid'),
  fluxoReport: document.getElementById('fluxo-report'),
  despesasReport: document.getElementById('despesas-report'),
  lancamentosTable: document.getElementById('lancamentos-table'),
  clientesList: document.getElementById('clientes-list'),
  fornecedoresList: document.getElementById('fornecedores-list'),
  asoList: document.getElementById('aso-list'),
  categoriasList: document.getElementById('categorias-list'),
  contasList: document.getElementById('contas-list'),
  cobrancasList: document.getElementById('cobrancas-list'),
  transferenciasList: document.getElementById('transferencias-list'),
  contasPagarList: document.getElementById('contas-pagar-list'),
  contasPagarHistorico: document.getElementById('contas-pagar-historico'),
  contasPagarFiltroForm: document.getElementById('contas-pagar-filtro-form'),
  contasPagarFiltroDescricao: document.getElementById('contas-pagar-filtro-descricao'),
  contasPagarFiltroDataInicio: document.getElementById('contas-pagar-filtro-data-inicio'),
  contasPagarFiltroDataFim: document.getElementById('contas-pagar-filtro-data-fim'),
  contasPagarFiltroStatus: document.getElementById('contas-pagar-filtro-status'),
  contasPagarLimparFiltro: document.getElementById('contas-pagar-limpar-filtro'),
  pendenciasList: document.getElementById('pendencias-list'),
  compensacaoFiltroForm: document.getElementById('compensacao-filtro-form'),
  compensacaoClienteSelect: document.getElementById('compensacao-cliente-select'),
  compensacaoOrigemSelect: document.getElementById('compensacao-origem-select'),
  toast: document.getElementById('toast'),
  confirmModal: document.getElementById('confirm-modal'),
  confirmMessage: document.getElementById('confirm-message'),
  confirmAccept: document.getElementById('confirm-accept'),
  confirmCancel: document.getElementById('confirm-cancel'),
  compensationModal: document.getElementById('compensation-modal'),
  compensationMessage: document.getElementById('compensation-message'),
  compensationForm: document.getElementById('compensation-form'),
  compensationDate: document.getElementById('compensation-date'),
  compensationPayment: document.getElementById('compensation-payment'),
  compensationAccountLabel: document.getElementById('compensation-account-label'),
  compensationAccount: document.getElementById('compensation-account'),
  compensationAccept: document.getElementById('compensation-accept'),
  compensationCancel: document.getElementById('compensation-cancel'),
  exportarExcel: document.getElementById('exportar-excel'),
  exportarCategorias: document.getElementById('exportar-categorias'),
  exportarContasPagar: document.getElementById('exportar-contas-pagar'),
  lancamentoForm: document.getElementById('lancamento-form'),
  categoriaForm: document.getElementById('categoria-form'),
  contaForm: document.getElementById('conta-form'),
  contaSubmit: document.getElementById('conta-submit'),
  contaCancel: document.getElementById('conta-cancel'),
  cobrancaForm: document.getElementById('cobranca-form'),
  cobrancaCliente: document.getElementById('cobranca-cliente'),
  cobrancaSubmit: document.getElementById('cobranca-submit'),
  cobrancaCancel: document.getElementById('cobranca-cancel'),
  fornecedorForm: document.getElementById('fornecedor-form'),
  fornecedorSubmit: document.getElementById('fornecedor-submit'),
  fornecedorCancel: document.getElementById('fornecedor-cancel'),
  clienteForm: document.getElementById('cliente-form'),
  clienteExamesBox: document.getElementById('cliente-exames-box'),
  clienteBuscaForm: document.getElementById('cliente-busca-form'),
  clienteBuscaInput: document.getElementById('cliente-busca-input'),
  asoForm: document.getElementById('aso-form'),
  asoCliente: document.getElementById('aso-cliente'),
  asoConta: document.getElementById('aso-conta'),
  asoExamesComplementares: document.getElementById('aso-exames-complementares'),
  asoExamesBox: document.getElementById('aso-exames-box'),
  asoFiltroForm: document.getElementById('aso-filtro-form'),
  asoBuscaInput: document.getElementById('aso-busca-input'),
  asoDataInicio: document.getElementById('aso-data-inicio'),
  asoDataFim: document.getElementById('aso-data-fim'),
  asoInclusoAlerta: document.getElementById('aso-incluso-alerta'),
  asoValorLabel: document.getElementById('aso-valor-label'),
  asoFormaLabel: document.getElementById('aso-forma-label'),
  asoContaLabel: document.getElementById('aso-conta-label'),
  asoStatusLabel: document.getElementById('aso-status-label'),
  asoSubmit: document.getElementById('aso-submit'),
  asoCancel: document.getElementById('aso-cancel'),
  exportarAso: document.getElementById('exportar-aso'),
  transferenciaForm: document.getElementById('transferencia-form'),
  contaPagarForm: document.getElementById('conta-pagar-form'),
  contaPagarSubmit: document.getElementById('conta-pagar-submit'),
  contaPagarCancel: document.getElementById('conta-pagar-cancel'),
  filtroForm: document.getElementById('filtro-form'),
  lancamentoTipo: document.getElementById('lancamento-tipo'),
  lancamentoValorLabel: document.getElementById('lancamento-valor-label'),
  lancamentoDataLabel: document.getElementById('lancamento-data-label'),
  lancamentoFormaLabel: document.getElementById('lancamento-forma-label'),
  lancamentoContaLabel: document.getElementById('lancamento-conta-label'),
  lancamentoCategoriaLabel: document.getElementById('lancamento-categoria-label'),
  lancamentoStatusLabel: document.getElementById('lancamento-status-label'),
  lancamentoRecorrenteLabel: document.getElementById('lancamento-recorrente-label'),
  lancamentoBoletoClienteLabel: document.getElementById('lancamento-boleto-cliente-label'),
  lancamentoBoletoItemLabel: document.getElementById('lancamento-boleto-item-label'),
  lancamentoBoletoContaLabel: document.getElementById('lancamento-boleto-conta-label'),
  lancamentoBoletoDataLabel: document.getElementById('lancamento-boleto-data-label'),
  boletoClienteSelect: document.getElementById('boleto-cliente-select'),
  boletoCobrancaSelect: document.getElementById('boleto-cobranca-select'),
  boletoContaSelect: document.getElementById('boleto-conta-select'),
  lancamentoCategoria: document.getElementById('lancamento-categoria'),
  lancamentoConta: document.getElementById('lancamento-conta'),
  contaPagarCategoria: document.getElementById('conta-pagar-categoria'),
  contaPagarFornecedor: document.getElementById('conta-pagar-fornecedor'),
  filtroConta: document.getElementById('filtro-conta'),
  filtroCategoria: document.getElementById('filtro-categoria'),
  transferenciaOrigem: document.getElementById('transferencia-origem'),
  transferenciaDestino: document.getElementById('transferencia-destino'),
  lancamentoSubmit: document.getElementById('lancamento-submit'),
  lancamentoCancel: document.getElementById('lancamento-cancel'),
  categoriaSubmit: document.getElementById('categoria-submit'),
  categoriaCancel: document.getElementById('categoria-cancel'),
  clienteSubmit: document.getElementById('cliente-submit'),
  clienteCancel: document.getElementById('cliente-cancel'),
  accountHistoryModal: document.getElementById('account-history-modal'),
  accountHistoryExport: document.getElementById('account-history-export'),
  accountHistoryClose: document.getElementById('account-history-close'),
  accountHistorySubtitle: document.getElementById('account-history-subtitle'),
  accountHistoryFilterForm: document.getElementById('account-history-filter-form'),
  accountHistoryStart: document.getElementById('account-history-start'),
  accountHistoryEnd: document.getElementById('account-history-end'),
  accountHistoryList: document.getElementById('account-history-list'),
  navButtons: Array.from(document.querySelectorAll('.nav-button')),
  navGroupToggles: Array.from(document.querySelectorAll('.nav-group-toggle')),
  navGroups: Array.from(document.querySelectorAll('.nav-group')),
  contentPanels: Array.from(document.querySelectorAll('[data-view-panel]')),
};

let toastTimer;
const asoExamDefinitions = [
  'Audiometria',
  'Espirometria',
  'Acuidade visual',
  'Eletrocardiograma',
  'Raio-X',
];

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
}

function escapeHtml(text = '') {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function toBrazilDate(dateText) {
  return new Date(`${dateText}T00:00:00`).toLocaleDateString('pt-BR');
}

function formatMovementDate(dateText) {
  if (!dateText) {
    return '-';
  }

  const normalized = String(dateText).includes('T') || String(dateText).includes(' ')
    ? new Date(String(dateText).replace(' ', 'T'))
    : new Date(`${dateText}T00:00:00`);

  if (Number.isNaN(normalized.getTime())) {
    return dateText;
  }

  const hasTime = String(dateText).includes(':');
  return normalized.toLocaleString('pt-BR', hasTime
    ? { dateStyle: 'short', timeStyle: 'short' }
    : { dateStyle: 'short' });
}

function getCurrentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

function toIsoDate(date) {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
}

function getPeriodRange() {
  const month = Number(elements.competenciaMes.value);
  const year = Number(elements.competenciaAno.value);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function populateCompetenciaSelects() {
  const months = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  const current = getCurrentMonthYear();

  elements.competenciaMes.innerHTML = months.map((label, index) => (
    `<option value="${index + 1}">${label}</option>`
  )).join('');

  const years = [];
  for (let year = current.year - 3; year <= current.year + 3; year += 1) {
    years.push(`<option value="${year}">${year}</option>`);
  }
  elements.competenciaAno.innerHTML = years.join('');
  elements.competenciaMes.value = String(current.month);
  elements.competenciaAno.value = String(current.year);
}

function setFormDates() {
  const today = new Date().toISOString().slice(0, 10);
  elements.lancamentoForm.elements.data.value = today;
  elements.asoForm.elements.data.value = today;
  elements.transferenciaForm.elements.data.value = today;
  elements.contaPagarForm.elements.data_vencimento.value = today;
}

function setDefaultDates() {
  setFormDates();
  const range = getPeriodRange();
  elements.filtroForm.elements.dataInicio.value = range.start;
  elements.filtroForm.elements.dataFim.value = range.end;
  elements.asoDataInicio.value = range.start;
  elements.asoDataFim.value = range.end;
}

function setApiStatus(text) {
  elements.apiStatus.textContent = text;
}

function getContaNome(contaId) {
  return state.contas.find((item) => String(item.id) === String(contaId))?.nome || 'Conta nao identificada';
}

function getCaixaConta() {
  return state.contas.find((item) => String(item.nome || '').trim().toLowerCase() === 'caixa');
}

function getSicoobConta() {
  return state.contas.find((item) => {
    const nome = String(item.nome || '').trim().toLowerCase();
    return nome === 'sicoob' || nome === 'conta bancaria';
  });
}

function getOrderedAccounts(accounts = state.contas) {
  const ordem = ['caixa', 'sicoob', 'cresol', 'banco do brasil'];
  return [...accounts].sort((a, b) => {
    const nomeA = String(a.nome || '').trim().toLowerCase();
    const nomeB = String(b.nome || '').trim().toLowerCase();
    const indexA = ordem.indexOf(nomeA);
    const indexB = ordem.indexOf(nomeB);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB) || nomeA.localeCompare(nomeB);
  });
}

function getFormaPagamentoLabel(value) {
  const labels = {
    dinheiro: 'Dinheiro',
    banco: 'SICOOB',
    sicoob: 'SICOOB',
    pix: 'Pix / SICOOB',
    cresol: 'Cresol',
    banco_brasil: 'Banco do Brasil',
    boleto: 'Boleto',
  };

  return labels[value] || (value ? value : 'Incluso');
}

function normalizeContaByFormaPagamento(values) {
  if (values.forma_pagamento === 'dinheiro') {
    const caixa = getCaixaConta();
    if (caixa) {
      return { ...values, conta_id: String(caixa.id) };
    }
  }

  if (values.forma_pagamento === 'pix') {
    const sicoob = getSicoobConta();
    if (sicoob) {
      return { ...values, conta_id: String(sicoob.id) };
    }
  }

  return values;
}

function parseBoolean(value) {
  return value === true || value === 'true' || value === 'on' || value === 1 || value === '1';
}

function parseJsonArray(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return [];
  }
}

function getClientIncludedExams(client = getSelectedClient()) {
  if (!parseBoolean(client?.exames_incluso)) {
    return [];
  }

  return parseJsonArray(client?.exames_inclusos_json);
}

function renderClientIncludedExamChecklist(selected = []) {
  const selectedSet = new Set(selected);
  elements.clienteExamesBox.innerHTML = asoExamDefinitions.map((nome) => `
    <label class="checkbox-row">
      <input type="checkbox" name="cliente_exame_${escapeHtml(nome)}" ${selectedSet.has(nome) ? 'checked' : ''}>
      <span>${escapeHtml(nome)}</span>
    </label>
  `).join('');
}

function collectClientIncludedExams() {
  return asoExamDefinitions.filter((nome) => (
    elements.clienteForm.querySelector(`[name="cliente_exame_${CSS.escape(nome)}"]`)?.checked
  ));
}

function syncClienteExamFields() {
  const enabled = elements.clienteForm.elements.exames_incluso.checked;
  elements.clienteExamesBox.classList.toggle('is-hidden', !enabled);

  if (!enabled) {
    asoExamDefinitions.forEach((nome) => {
      const input = elements.clienteForm.querySelector(`[name="cliente_exame_${CSS.escape(nome)}"]`);
      if (input) {
        input.checked = false;
      }
    });
  }
}

function syncContaFieldWithPayment(form, contaFieldName = 'conta_id') {
  const formaPagamento = form.elements.forma_pagamento?.value;
  const contaField = form.elements[contaFieldName];
  const caixa = getCaixaConta();
  const sicoob = getSicoobConta();

  if (!contaField) {
    return;
  }

  if (formaPagamento === 'dinheiro' && caixa) {
    contaField.value = String(caixa.id);
  }

  if (formaPagamento === 'pix' && sicoob) {
    contaField.value = String(sicoob.id);
  }
}

function syncLancamentoTypeFields() {
  const isBoleto = elements.lancamentoTipo.value === 'boleto';
  const hiddenFields = [
    elements.lancamentoValorLabel,
    elements.lancamentoDataLabel,
    elements.lancamentoFormaLabel,
    elements.lancamentoContaLabel,
    elements.lancamentoCategoriaLabel,
    elements.lancamentoStatusLabel,
    elements.lancamentoRecorrenteLabel,
  ];
  const boletoFields = [
    elements.lancamentoBoletoClienteLabel,
    elements.lancamentoBoletoItemLabel,
    elements.lancamentoBoletoContaLabel,
    elements.lancamentoBoletoDataLabel,
  ];

  hiddenFields.forEach((item) => item?.classList.toggle('is-hidden', isBoleto));
  boletoFields.forEach((item) => item?.classList.toggle('is-hidden', !isBoleto));

  elements.lancamentoCategoria.disabled = isBoleto;
  elements.lancamentoForm.elements.descricao.disabled = isBoleto;
  elements.lancamentoForm.elements.valor.required = !isBoleto;
  elements.lancamentoForm.elements.data.required = !isBoleto;
  elements.lancamentoForm.elements.forma_pagamento.required = !isBoleto;
  elements.lancamentoForm.elements.conta_id.required = !isBoleto;
  elements.lancamentoForm.elements.categoria_id.required = !isBoleto;
  elements.lancamentoForm.elements.status.required = !isBoleto;
  elements.lancamentoForm.elements.cobranca_id.required = isBoleto;
  elements.lancamentoForm.elements.boleto_conta_id.required = isBoleto;
  elements.lancamentoForm.elements.data_compensacao.required = isBoleto;
}

function renderAsoExamChecklist(exames = []) {
  const includedExams = new Set(getClientIncludedExams());
  const accountOptions = state.contas.map((item) => optionMarkup(item.id, item.nome)).join('');
  const items = asoExamDefinitions.map((nome) => {
    const found = exames.find((item) => item.nome === nome) || {};
    const included = includedExams.has(nome) || parseBoolean(found.incluso);
    return `
      <div class="exam-check-item">
        <strong>${escapeHtml(nome)}</strong>
        <label class="checkbox-row"><input type="checkbox" name="exame_realizado_${escapeHtml(nome)}" ${found.realizado ? 'checked' : ''}><span>Realizado</span></label>
        <label class="checkbox-row"><input type="checkbox" name="exame_pago_${escapeHtml(nome)}" ${found.pago ? 'checked' : ''} ${included ? 'disabled' : ''}><span>${included ? 'Incluso no cliente' : 'Pago'}</span></label>
        <label>Valor<input type="number" min="0" step="0.01" name="exame_valor_${escapeHtml(nome)}" value="${found.valor || ''}" ${found.realizado && !included ? '' : 'disabled'}></label>
        <label>Pagamento
          <select name="exame_forma_${escapeHtml(nome)}" ${found.realizado && found.pago && !included ? '' : 'disabled'}>
            <option value="">Selecione</option>
            <option value="dinheiro" ${found.forma_pagamento === 'dinheiro' ? 'selected' : ''}>Dinheiro</option>
            <option value="pix" ${found.forma_pagamento === 'pix' ? 'selected' : ''}>Pix</option>
          </select>
        </label>
        <label>Conta
          <select name="exame_conta_${escapeHtml(nome)}" ${found.realizado && found.pago && found.forma_pagamento === 'pix' && !included ? '' : 'disabled'}>
            <option value="">Selecione</option>
            ${accountOptions}
          </select>
        </label>
      </div>
    `;
  }).join('');

  elements.asoExamesBox.innerHTML = items;

  asoExamDefinitions.forEach((nome) => {
    const currentExam = exames.find((item) => item.nome === nome) || {};
    const realizadoInput = elements.asoForm.querySelector(`[name="exame_realizado_${CSS.escape(nome)}"]`);
    const pagoInput = elements.asoForm.querySelector(`[name="exame_pago_${CSS.escape(nome)}"]`);
    const valorInput = elements.asoForm.querySelector(`[name="exame_valor_${CSS.escape(nome)}"]`);
    const formaInput = elements.asoForm.querySelector(`[name="exame_forma_${CSS.escape(nome)}"]`);
    const contaInput = elements.asoForm.querySelector(`[name="exame_conta_${CSS.escape(nome)}"]`);
    const included = includedExams.has(nome);

    if (!realizadoInput || !pagoInput || !valorInput || !formaInput || !contaInput) {
      return;
    }

    const syncExamFields = () => {
      const allowPayment = realizadoInput.checked && !included;
      valorInput.disabled = !allowPayment;
      pagoInput.disabled = included;
      formaInput.disabled = !allowPayment || !pagoInput.checked;
      contaInput.disabled = !allowPayment || !pagoInput.checked || formaInput.value !== 'pix';

      if (!realizadoInput.checked) {
        valorInput.value = '';
        pagoInput.checked = false;
        formaInput.value = '';
        contaInput.value = '';
      }

      if (included) {
        pagoInput.checked = false;
        valorInput.value = '';
        formaInput.value = '';
        contaInput.value = '';
      }

      if (!pagoInput.checked) {
        formaInput.value = '';
        contaInput.value = '';
      }

      if (formaInput.value === 'dinheiro') {
        contaInput.value = '';
      }

      if (currentExam.conta_id && !contaInput.value) {
        contaInput.value = String(currentExam.conta_id);
      }
    };

    realizadoInput.addEventListener('change', syncExamFields);
    pagoInput.addEventListener('change', syncExamFields);
    formaInput.addEventListener('change', syncExamFields);
    syncExamFields();
  });
}

function collectAsoExames() {
  return asoExamDefinitions.map((nome) => ({
    nome,
    realizado: elements.asoForm.querySelector(`[name="exame_realizado_${CSS.escape(nome)}"]`)?.checked || false,
    pago: elements.asoForm.querySelector(`[name="exame_pago_${CSS.escape(nome)}"]`)?.checked || false,
    valor: Number(elements.asoForm.querySelector(`[name="exame_valor_${CSS.escape(nome)}"]`)?.value || 0),
    forma_pagamento: elements.asoForm.querySelector(`[name="exame_forma_${CSS.escape(nome)}"]`)?.value || '',
    conta_id: elements.asoForm.querySelector(`[name="exame_conta_${CSS.escape(nome)}"]`)?.value || '',
    incluso: getClientIncludedExams().includes(nome),
  })).filter((item) => item.realizado);
}

function getSelectedClient() {
  return state.clientes.find((item) => String(item.id) === String(elements.asoCliente.value));
}

function syncAsoBillingFields() {
  const client = getSelectedClient();
  const asoIncluso = parseBoolean(client?.aso_incluso);
  const hasIncludedExams = parseBoolean(client?.exames_incluso);
  const hasExames = elements.asoExamesComplementares.checked;
  const statusPago = elements.asoForm.elements.status.value === 'pago';

  elements.asoInclusoAlerta.classList.toggle('is-hidden', !asoIncluso);
  elements.asoValorLabel.classList.toggle('is-hidden', asoIncluso);
  elements.asoFormaLabel.classList.toggle('is-hidden', asoIncluso);
  elements.asoContaLabel.classList.toggle('is-hidden', asoIncluso);
  elements.asoStatusLabel.classList.toggle('is-hidden', asoIncluso);
  elements.asoExamesBox.classList.toggle('is-hidden', !hasExames);

  if (asoIncluso) {
    elements.asoForm.elements.valor_aso.value = '';
  }

  if (!statusPago) {
    elements.asoForm.elements.forma_pagamento.value = '';
    elements.asoForm.elements.conta_id.value = '';
  }

  elements.asoForm.elements.forma_pagamento.disabled = asoIncluso || !statusPago;
  elements.asoForm.elements.conta_id.disabled = asoIncluso || !statusPago || !elements.asoForm.elements.forma_pagamento.value;

  if (hasIncludedExams || hasExames) {
    renderAsoExamChecklist(collectAsoExames());
  }
}

function getFilteredAsos() {
  const busca = String(elements.asoBuscaInput?.value || '').trim().toLowerCase();
  const dataInicio = elements.asoDataInicio?.value || '';
  const dataFim = elements.asoDataFim?.value || '';

  return state.asos.filter((item) => {
    const matchesBusca = !busca || [
      item.cliente_nome,
      item.funcionario_nome,
      item.cidade,
      item.tipo_aso,
    ].some((value) => String(value || '').toLowerCase().includes(busca));
    const matchesInicio = !dataInicio || String(item.data) >= dataInicio;
    const matchesFim = !dataFim || String(item.data) <= dataFim;
    return matchesBusca && matchesInicio && matchesFim;
  });
}

function getAsoDetailText(item) {
  const detalhes = [];
  const valorAso = Number(item.valor_aso || 0);
  const exames = Array.isArray(item.exames_json)
    ? item.exames_json
    : item.exames_json
      ? JSON.parse(item.exames_json)
      : [];

  exames
    .filter((exame) => exame.realizado)
    .forEach((exame) => {
      if (exame.pago && Number(exame.valor || 0) > 0) {
        detalhes.push(`${formatCurrency(exame.valor)} ${exame.nome}`);
      } else {
        detalhes.push(`${exame.nome} realizado`);
      }
    });

  if (valorAso > 0) {
    const tipoLabel = String(item.tipo_aso || 'aso').replaceAll('_', ' ');
    detalhes.push(`${formatCurrency(valorAso)} ${tipoLabel.charAt(0).toUpperCase()}${tipoLabel.slice(1)}`);
  }

  return detalhes.join(' | ');
}

function getAsoPaymentText(item) {
  if (item.forma_pagamento) {
    return getFormaPagamentoLabel(item.forma_pagamento);
  }

  const exames = parseJsonArray(item.exames_json);
  const examPayments = [...new Set(
    exames
      .filter((exame) => exame.pago && exame.forma_pagamento)
      .map((exame) => getFormaPagamentoLabel(exame.forma_pagamento))
  )];

  if (!examPayments.length) {
    return 'Em aberto';
  }

  return examPayments.join(', ');
}

function populateCompensacaoFilters() {
  const selectedCliente = elements.compensacaoClienteSelect.value;
  const clientes = [...new Set(
    state.pendencias
      .map((item) => String(item.cliente_nome || '').trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  elements.compensacaoClienteSelect.innerHTML = `
    <option value="">Todos</option>
    ${clientes.map((nome) => optionMarkup(nome, nome)).join('')}
  `;
  elements.compensacaoClienteSelect.value = clientes.includes(selectedCliente) ? selectedCliente : '';
}

function getFilteredPendencias() {
  const clienteNome = String(elements.compensacaoClienteSelect?.value || '').trim().toLowerCase();
  const origem = String(elements.compensacaoOrigemSelect?.value || '').trim().toLowerCase();

  return state.pendencias.filter((item) => {
    const matchesCliente = !clienteNome || String(item.cliente_nome || '').trim().toLowerCase() === clienteNome;
    const matchesOrigem = !origem || String(item.origem || '').trim().toLowerCase() === origem;
    return matchesCliente && matchesOrigem;
  });
}

function getFilteredContasPagarHistorico() {
  const descricao = String(elements.contasPagarFiltroDescricao?.value || '').trim().toLowerCase();
  const dataInicio = elements.contasPagarFiltroDataInicio?.value || '';
  const dataFim = elements.contasPagarFiltroDataFim?.value || '';
  const status = String(elements.contasPagarFiltroStatus?.value || '').trim().toLowerCase();

  return state.contasPagar.filter((item) => {
    const dataVencimento = String(item.data_vencimento || '');
    const matchesDescricao = !descricao || String(item.descricao || '').toLowerCase().includes(descricao);
    const matchesInicio = !dataInicio || dataVencimento >= dataInicio;
    const matchesFim = !dataFim || dataVencimento <= dataFim;
    const matchesStatus = !status || String(item.status || '').toLowerCase() === status;
    return matchesDescricao && matchesInicio && matchesFim && matchesStatus;
  });
}

function getFilteredAccountMovements() {
  return state.contaHistorico?.movimentacoes || [];
}

function renderAccountHistoryMovements() {
  const movimentacoes = getFilteredAccountMovements();

  elements.accountHistoryList.innerHTML = movimentacoes.length ? `
    <table>
      <thead><tr><th>Data</th><th>Origem</th><th>Descricao</th><th>Tipo</th><th>Status</th><th>Valor</th></tr></thead>
      <tbody>
        ${movimentacoes.map((item) => `
          <tr>
            <td>${formatMovementDate(item.data_movimento)}</td>
            <td>${escapeHtml(item.origem)}</td>
            <td>${escapeHtml(item.descricao || '')}</td>
            <td>${escapeHtml(item.tipo)}</td>
            <td>${escapeHtml(item.status)}</td>
            <td class="${item.tipo === 'entrada' ? 'positive' : 'negative'}">${formatCurrency(item.valor)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<div class="empty-state">Nenhuma movimentacao neste periodo.</div>';
}

function openAccountHistoryModal(conta, movimentacoes) {
  state.contaHistorico = { conta, movimentacoes };
  elements.accountHistorySubtitle.textContent = `${conta.nome} - ${formatCurrency(conta.saldo_atual)}`;
  const dates = movimentacoes
    .map((item) => item.data_movimento)
    .filter(Boolean)
    .sort();
  const currentRange = getPeriodRange();
  elements.accountHistoryStart.value = dates[0] || currentRange.start;
  elements.accountHistoryEnd.value = dates[dates.length - 1] || currentRange.end;
  renderAccountHistoryMovements();
  elements.accountHistoryModal.classList.remove('is-hidden');
  elements.accountHistoryModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

async function reloadAccountHistoryMovements() {
  if (!state.contaHistorico?.conta?.id) {
    return;
  }

  const result = await api.getContaMovimentacoes(state.contaHistorico.conta.id, {
    dataInicio: elements.accountHistoryStart.value,
    dataFim: elements.accountHistoryEnd.value,
    limit: 500,
  });

  state.contaHistorico = {
    conta: result.conta,
    movimentacoes: result.movimentacoes || [],
  };
  elements.accountHistorySubtitle.textContent = `${result.conta.nome} - ${formatCurrency(result.conta.saldo_atual)}`;
  renderAccountHistoryMovements();
}

function closeAccountHistoryModal() {
  elements.accountHistoryModal.classList.add('is-hidden');
  elements.accountHistoryModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function resetLancamentoForm() {
  state.editing.lancamentoId = null;
  elements.lancamentoForm.reset();
  elements.lancamentoForm.elements.id.value = '';
  elements.lancamentoSubmit.textContent = 'Salvar lancamento';
  elements.lancamentoCancel.classList.add('is-hidden');
  elements.lancamentoTipo.value = 'entrada';
  populateCategorySelect(elements.lancamentoCategoria, elements.lancamentoTipo.value);
  setFormDates();
  elements.lancamentoForm.elements.data_compensacao.value = new Date().toISOString().slice(0, 10);
  syncContaFieldWithPayment(elements.lancamentoForm);
  syncLancamentoTypeFields();
}

function resetCategoriaForm() {
  state.editing.categoriaId = null;
  elements.categoriaForm.reset();
  elements.categoriaForm.elements.id.value = '';
  elements.categoriaSubmit.textContent = 'Adicionar categoria';
  elements.categoriaCancel.classList.add('is-hidden');
}

function resetClienteForm() {
  state.editing.clienteId = null;
  elements.clienteForm.reset();
  elements.clienteForm.elements.id.value = '';
  elements.clienteSubmit.textContent = 'Adicionar cliente';
  elements.clienteCancel.classList.add('is-hidden');
  renderClientIncludedExamChecklist();
  syncClienteExamFields();
}

function resetAsoForm() {
  state.editing.asoId = null;
  elements.asoForm.reset();
  elements.asoForm.elements.id.value = '';
  elements.asoSubmit.textContent = 'Salvar ASO';
  elements.asoCancel.classList.add('is-hidden');
  elements.asoForm.elements.data.value = new Date().toISOString().slice(0, 10);
  renderAsoExamChecklist();
  syncAsoBillingFields();
  syncContaFieldWithPayment(elements.asoForm);
}

function resetContaPagarForm() {
  state.editing.contaPagarId = null;
  elements.contaPagarForm.reset();
  elements.contaPagarForm.elements.id.value = '';
  elements.contaPagarSubmit.textContent = 'Salvar conta a pagar';
  elements.contaPagarCancel.classList.add('is-hidden');
  setFormDates();
  elements.contaPagarForm.elements.total_parcelas.value = '1';
  elements.contaPagarForm.elements.parcela_atual.value = '1';
  elements.contaPagarForm.elements.status.value = 'pendente';
}

function resetContaForm() {
  state.editing.contaId = null;
  elements.contaForm.reset();
  elements.contaForm.elements.id.value = '';
  elements.contaForm.elements.saldo_atual.value = '0';
  elements.contaSubmit.textContent = 'Adicionar conta';
  elements.contaCancel.classList.add('is-hidden');
}

function resetFornecedorForm() {
  state.editing.fornecedorId = null;
  elements.fornecedorForm.reset();
  elements.fornecedorForm.elements.id.value = '';
  elements.fornecedorSubmit.textContent = 'Salvar fornecedor';
  elements.fornecedorCancel.classList.add('is-hidden');
}

function resetCobrancaForm() {
  state.editing.cobrancaId = null;
  elements.cobrancaForm.reset();
  elements.cobrancaForm.elements.id.value = '';
  elements.cobrancaSubmit.textContent = 'Salvar cobranca';
  elements.cobrancaCancel.classList.add('is-hidden');
  const today = new Date().toISOString().slice(0, 10);
  elements.cobrancaForm.elements.data_emissao.value = today;
  elements.cobrancaForm.elements.data_vencimento.value = today;
}

function startEditLancamento(item) {
  state.editing.lancamentoId = item.id;
  switchView('lancamentos');
  elements.lancamentoForm.elements.id.value = String(item.id);
  elements.lancamentoForm.elements.tipo.value = item.tipo;
  populateCategorySelect(elements.lancamentoCategoria, item.tipo);
  elements.lancamentoForm.elements.valor.value = item.valor;
  elements.lancamentoForm.elements.data.value = item.data;
  elements.lancamentoForm.elements.forma_pagamento.value = item.forma_pagamento;
  elements.lancamentoForm.elements.conta_id.value = String(item.conta_id);
  elements.lancamentoForm.elements.categoria_id.value = String(item.categoria_id);
  elements.lancamentoForm.elements.descricao.value = item.descricao || '';
  elements.lancamentoForm.elements.status.value = item.status;
  elements.lancamentoForm.elements.recorrente.checked = Boolean(item.recorrente);
  elements.lancamentoSubmit.textContent = 'Salvar alteracoes';
  elements.lancamentoCancel.classList.remove('is-hidden');
  syncLancamentoTypeFields();
}

function startEditCategoria(item) {
  state.editing.categoriaId = item.id;
  switchView('cadastro-categorias');
  elements.categoriaForm.elements.id.value = String(item.id);
  elements.categoriaForm.elements.nome.value = item.nome;
  elements.categoriaForm.elements.tipo.value = item.tipo;
  elements.categoriaSubmit.textContent = 'Salvar alteracoes';
  elements.categoriaCancel.classList.remove('is-hidden');
}

function startEditCliente(item) {
  state.editing.clienteId = item.id;
  switchView('cadastro-clientes');
  elements.clienteForm.elements.id.value = String(item.id);
  elements.clienteForm.elements.nome.value = item.nome || '';
  elements.clienteForm.elements.telefone.value = item.telefone || '';
  elements.clienteForm.elements.email.value = item.email || '';
  elements.clienteForm.elements.documento.value = item.documento || '';
  elements.clienteForm.elements.aso_incluso.checked = parseBoolean(item.aso_incluso);
  elements.clienteForm.elements.exames_incluso.checked = parseBoolean(item.exames_incluso);
  renderClientIncludedExamChecklist(parseJsonArray(item.exames_inclusos_json));
  syncClienteExamFields();
  elements.clienteSubmit.textContent = 'Salvar alteracoes';
  elements.clienteCancel.classList.remove('is-hidden');
}

function startEditAso(item) {
  state.editing.asoId = item.id;
  switchView('lancar-aso');
  elements.asoForm.elements.id.value = String(item.id);
  elements.asoForm.elements.data.value = item.data;
  elements.asoForm.elements.cidade.value = item.cidade || '';
  elements.asoForm.elements.cliente_id.value = String(item.cliente_id);
  elements.asoForm.elements.funcionario_nome.value = item.funcionario_nome || '';
  elements.asoForm.elements.tipo_aso.value = item.tipo_aso;
  elements.asoForm.elements.categoria_cobranca.value = item.categoria_cobranca || 'cliente';
  elements.asoForm.elements.exames_complementares.checked = parseBoolean(item.exames_complementares);
  elements.asoForm.elements.valor_aso.value = item.valor_aso || '';
  elements.asoForm.elements.forma_pagamento.value = item.forma_pagamento || '';
  elements.asoForm.elements.conta_id.value = item.conta_id ? String(item.conta_id) : '';
  elements.asoForm.elements.status.value = item.status || 'pendente';
  renderAsoExamChecklist(Array.isArray(item.exames_json) ? item.exames_json : []);
  elements.asoSubmit.textContent = 'Salvar alteracoes';
  elements.asoCancel.classList.remove('is-hidden');
  syncAsoBillingFields();
}

function startEditContaPagar(item) {
  state.editing.contaPagarId = item.id;
  switchView('cadastro-contas-pagar');
  elements.contaPagarForm.elements.id.value = String(item.id);
  elements.contaPagarForm.elements.descricao.value = item.descricao || '';
  elements.contaPagarForm.elements.tipo.value = item.tipo || 'fixa';
  elements.contaPagarForm.elements.valor.value = item.valor;
  elements.contaPagarForm.elements.total_parcelas.value = item.total_parcelas || 1;
  elements.contaPagarForm.elements.parcela_atual.value = item.parcela_atual || 1;
  elements.contaPagarForm.elements.categoria_id.value = String(item.categoria_id);
  elements.contaPagarForm.elements.fornecedor_id.value = item.fornecedor_id ? String(item.fornecedor_id) : '';
  elements.contaPagarForm.elements.data_vencimento.value = item.data_vencimento;
  elements.contaPagarForm.elements.status.value = item.status || 'pendente';
  elements.contaPagarSubmit.textContent = 'Salvar alteracoes';
  elements.contaPagarCancel.classList.remove('is-hidden');
}

function startEditConta(item) {
  state.editing.contaId = item.id;
  switchView('cadastro-contas');
  elements.contaForm.elements.id.value = String(item.id);
  elements.contaForm.elements.nome.value = item.nome || '';
  elements.contaForm.elements.saldo_atual.value = item.saldo_atual || 0;
  elements.contaForm.elements.observacao.value = '';
  elements.contaSubmit.textContent = 'Salvar alteracoes';
  elements.contaCancel.classList.remove('is-hidden');
}

function startEditCobranca(item) {
  state.editing.cobrancaId = item.id;
  switchView('cadastro-cobrancas');
  elements.cobrancaForm.elements.id.value = String(item.id);
  elements.cobrancaForm.elements.cliente_id.value = String(item.cliente_id);
  elements.cobrancaForm.elements.descricao.value = item.descricao || '';
  elements.cobrancaForm.elements.valor.value = item.valor || '';
  elements.cobrancaForm.elements.data_emissao.value = item.data_emissao || '';
  elements.cobrancaForm.elements.data_vencimento.value = item.data_vencimento || '';
  elements.cobrancaForm.elements.observacao.value = item.observacao || '';
  elements.cobrancaSubmit.textContent = 'Salvar alteracoes';
  elements.cobrancaCancel.classList.remove('is-hidden');
}

function startEditFornecedor(item) {
  state.editing.fornecedorId = item.id;
  switchView('cadastro-fornecedores');
  elements.fornecedorForm.elements.id.value = String(item.id);
  elements.fornecedorForm.elements.razao_social.value = item.razao_social || '';
  elements.fornecedorForm.elements.cnpj.value = item.cnpj || '';
  elements.fornecedorForm.elements.contato_nome.value = item.contato_nome || '';
  elements.fornecedorForm.elements.telefone.value = item.telefone || '';
  elements.fornecedorForm.elements.categoria.value = item.categoria || '';
  elements.fornecedorSubmit.textContent = 'Salvar alteracoes';
  elements.fornecedorCancel.classList.remove('is-hidden');
}

function showToast(message, type = 'success') {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.className = `toast toast-${type}`;
  toastTimer = window.setTimeout(() => {
    elements.toast.className = 'toast is-hidden';
    elements.toast.textContent = '';
  }, 2600);
}

function askConfirmation(message) {
  return new Promise((resolve) => {
    elements.confirmMessage.textContent = message;
    elements.confirmModal.classList.remove('is-hidden');
    elements.confirmModal.setAttribute('aria-hidden', 'false');

    const close = (accepted) => {
      elements.confirmModal.classList.add('is-hidden');
      elements.confirmModal.setAttribute('aria-hidden', 'true');
      elements.confirmAccept.removeEventListener('click', onAccept);
      elements.confirmCancel.removeEventListener('click', onCancel);
      elements.confirmModal.removeEventListener('click', onBackdrop);
      resolve(accepted);
    };

    const onAccept = () => close(true);
    const onCancel = () => close(false);
    const onBackdrop = (event) => {
      if (event.target === elements.confirmModal) {
        close(false);
      }
    };

    elements.confirmAccept.addEventListener('click', onAccept);
    elements.confirmCancel.addEventListener('click', onCancel);
    elements.confirmModal.addEventListener('click', onBackdrop);
  });
}

async function askCompensationDate(defaultDate) {
  const answer = window.prompt('Informe a data da compensacao (AAAA-MM-DD):', defaultDate);
  if (!answer) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(answer)) {
    showToast('Informe a data no formato AAAA-MM-DD.', 'warning');
    return null;
  }

  return answer;
}

function syncCompensationFields() {
  const formaPagamento = elements.compensationPayment.value;
  const needsAccount = formaPagamento && formaPagamento !== 'dinheiro';
  elements.compensationAccountLabel.classList.toggle('is-hidden', !needsAccount);
  elements.compensationAccount.disabled = !needsAccount;

  if (!needsAccount) {
    elements.compensationAccount.value = '';
  }
}

function askCompensationDetails({
  defaultDate,
  message,
  requirePayment = false,
  defaultPayment = '',
  defaultContaId = '',
}) {
  return new Promise((resolve) => {
    elements.compensationMessage.textContent = message || 'Informe os dados da compensacao.';
    elements.compensationDate.value = defaultDate;
    elements.compensationPayment.value = defaultPayment;
    elements.compensationAccount.value = defaultContaId ? String(defaultContaId) : '';
    syncCompensationFields();
    elements.compensationModal.classList.remove('is-hidden');
    elements.compensationModal.setAttribute('aria-hidden', 'false');

    const close = (payload) => {
      elements.compensationModal.classList.add('is-hidden');
      elements.compensationModal.setAttribute('aria-hidden', 'true');
      elements.compensationAccept.removeEventListener('click', onAccept);
      elements.compensationCancel.removeEventListener('click', onCancel);
      elements.compensationModal.removeEventListener('click', onBackdrop);
      elements.compensationPayment.removeEventListener('change', syncCompensationFields);
      resolve(payload);
    };

    const onAccept = () => {
      const dataCompensacao = elements.compensationDate.value;
      const formaPagamento = elements.compensationPayment.value;
      const contaId = elements.compensationAccount.value;

      if (!dataCompensacao) {
        showToast('Informe a data da compensacao.', 'warning');
        return;
      }

      if (requirePayment && !formaPagamento) {
        showToast('Selecione a forma de pagamento.', 'warning');
        return;
      }

      if (formaPagamento && formaPagamento !== 'dinheiro' && !contaId) {
        showToast('Selecione a conta de recebimento.', 'warning');
        return;
      }

      close({
        data_compensacao: dataCompensacao,
        forma_pagamento: formaPagamento,
        conta_id: formaPagamento === 'dinheiro' ? '' : contaId,
      });
    };

    const onCancel = () => close(null);
    const onBackdrop = (event) => {
      if (event.target === elements.compensationModal) {
        close(null);
      }
    };

    elements.compensationAccept.addEventListener('click', onAccept);
    elements.compensationCancel.addEventListener('click', onCancel);
    elements.compensationModal.addEventListener('click', onBackdrop);
    elements.compensationPayment.addEventListener('change', syncCompensationFields);
  });
}

function optionMarkup(value, label) {
  return `<option value="${value}">${escapeHtml(label)}</option>`;
}

function populateAccountSelects() {
  const visibleAccounts = getOrderedAccounts(
    state.contas.filter((item) => !['conta bancaria', 'cartao'].includes(String(item.nome || '').trim().toLowerCase()))
  );
  const accounts = visibleAccounts.map((item) => optionMarkup(item.id, item.nome)).join('');
  elements.lancamentoConta.innerHTML = accounts;
  elements.boletoContaSelect.innerHTML = `<option value="">Selecione</option>${accounts}`;
  elements.asoConta.innerHTML = `<option value="">Selecione</option>${accounts}`;
  elements.compensationAccount.innerHTML = `<option value="">Selecione</option>${accounts}`;
  elements.transferenciaOrigem.innerHTML = accounts;
  elements.transferenciaDestino.innerHTML = accounts;
  elements.filtroConta.innerHTML = `<option value="">Todas</option>${accounts}`;
}

function populateCategorySelect(selectElement, tipo, includeEmpty = false) {
  const categories = state.categorias.filter((item) => item.tipo === tipo);
  const prefix = includeEmpty ? '<option value="">Todas</option>' : '';
  selectElement.innerHTML = `${prefix}${categories.map((item) => optionMarkup(item.id, item.nome)).join('')}`;
}

function populateCategoryFilters() {
  elements.filtroCategoria.innerHTML = `<option value="">Todas</option>${state.categorias
    .map((item) => optionMarkup(item.id, `${item.nome} (${item.tipo})`))
    .join('')}`;
}

function populateClientSelect() {
  const options = state.clientes
    .map((item) => optionMarkup(item.id, item.nome))
    .join('');
  elements.asoCliente.innerHTML = `<option value="">Selecione</option>${options}`;
  elements.cobrancaCliente.innerHTML = `<option value="">Selecione</option>${options}`;
  elements.boletoClienteSelect.innerHTML = `<option value="">Selecione</option>${options}`;
}

function populateFornecedorSelect() {
  const options = state.fornecedores
    .map((item) => optionMarkup(item.id, item.razao_social))
    .join('');
  elements.contaPagarFornecedor.innerHTML = `<option value="">Selecione</option>${options}`;
}

function populateBoletoSelect() {
  const clienteId = elements.boletoClienteSelect.value;
  const cobrancas = state.cobrancas.filter((item) => item.status === 'pendente' && (!clienteId || String(item.cliente_id) === String(clienteId)));
  elements.boletoCobrancaSelect.innerHTML = `<option value="">Selecione</option>${cobrancas.map((item) => (
    optionMarkup(item.id, `${item.descricao} - ${formatCurrency(item.valor)} - venc. ${toBrazilDate(item.data_vencimento)}`)
  )).join('')}`;
}

function refreshSelects() {
  populateAccountSelects();
  populateCategorySelect(elements.lancamentoCategoria, elements.lancamentoTipo.value === 'boleto' ? 'entrada' : elements.lancamentoTipo.value);
  populateCategorySelect(elements.contaPagarCategoria, 'saida');
  populateCategoryFilters();
  populateClientSelect();
  populateFornecedorSelect();
  populateBoletoSelect();
  populateCompensacaoFilters();
  if (elements.asoExamesComplementares.checked) {
    renderAsoExamChecklist(collectAsoExames());
  }
  syncAsoBillingFields();
  syncLancamentoTypeFields();
}

function showApp() {
  elements.loginScreen.classList.add('is-hidden');
  elements.appShell.classList.remove('is-hidden');
}

function showLogin() {
  elements.appShell.classList.add('is-hidden');
  elements.loginScreen.classList.remove('is-hidden');
}

function switchView(viewName) {
  state.activeView = viewName;
  elements.navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.view === viewName);
  });
  elements.contentPanels.forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.viewPanel === viewName);
  });

  if (viewName === 'dashboard') {
    closeAccountHistoryModal();
  }
}

function applyUserContext() {
  elements.userName.textContent = state.user?.nome || 'Usuario';
  elements.userRole.textContent = state.user?.perfil === 'master' ? 'Perfil master' : 'Perfil operador';
}

function renderMetrics() {
  if (!state.dashboard) return;

  const contasDashboard = getOrderedAccounts(state.dashboard.saldos_por_conta.filter((conta) => {
    const nome = String(conta.nome || '').trim().toLowerCase();
    return nome !== 'cartao' && nome !== 'conta bancaria';
  }));

  const metrics = [
    ['Saldo atual total', state.dashboard.saldo_total, 'positive'],
    ['Entradas no mes', state.dashboard.entradas_mes, 'positive'],
    ['Saidas no mes', state.dashboard.saidas_mes, 'negative'],
  ];

  elements.metrics.innerHTML = metrics.map(([title, value, className]) => `
    <article class="metric-card">
      <h3>${title}</h3>
      <div class="metric-value ${className}">${formatCurrency(value)}</div>
    </article>
  `).join('');

  elements.contasGrid.innerHTML = contasDashboard.map((conta) => `
    <article class="account-card account-card-button" data-conta-id="${conta.id}">
      <h3>${escapeHtml(conta.nome)}</h3>
      <div class="account-balance ${Number(conta.saldo_atual) >= 0 ? 'positive' : 'negative'}">${formatCurrency(conta.saldo_atual)}</div>
    </article>
  `).join('');

  document.querySelectorAll('.account-card-button').forEach((card) => {
    card.addEventListener('click', async () => {
      try {
        const result = await api.getContaMovimentacoes(card.dataset.contaId, { limit: 500 });
        openAccountHistoryModal(result.conta, result.movimentacoes || []);
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  });
}

function renderContasList() {
  if (!state.contas.length) {
    elements.contasList.innerHTML = '<div class="empty-state">Nenhuma conta cadastrada.</div>';
    return;
  }

  elements.contasList.innerHTML = `
    <table>
      <thead><tr><th>Conta</th><th>Saldo atual</th>${state.user?.perfil === 'master' ? '<th>Acoes</th>' : ''}</tr></thead>
      <tbody>
        ${getOrderedAccounts(state.contas).map((item) => `
          <tr>
            <td>${escapeHtml(item.nome)}</td>
            <td>${formatCurrency(item.saldo_atual)}</td>
            ${state.user?.perfil === 'master' ? `<td><div class="action-row"><button class="edit-button edit-conta" data-id="${item.id}" type="button">Editar</button><button class="ghost-button delete-conta" data-id="${item.id}" type="button">Excluir</button></div></td>` : ''}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  document.querySelectorAll('.edit-conta').forEach((button) => {
    button.addEventListener('click', () => {
      const item = state.contas.find((entry) => String(entry.id) === String(button.dataset.id));
      if (item) {
        startEditConta(item);
      }
    });
  });

  document.querySelectorAll('.delete-conta').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const confirmed = await askConfirmation('Deseja excluir esta conta?');
        if (!confirmed) return;
        await api.deleteConta(button.dataset.id);
        await refreshData();
        showToast('Conta excluida.');
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  });
}

function renderCobrancasList() {
  if (!state.cobrancas.length) {
    elements.cobrancasList.innerHTML = '<div class="empty-state">Nenhuma cobranca cadastrada.</div>';
    return;
  }

  elements.cobrancasList.innerHTML = `
    <table>
      <thead><tr><th>Empresa</th><th>Descricao</th><th>Vencimento</th><th>Status</th><th>Valor</th>${state.user?.perfil === 'master' ? '<th>Acoes</th>' : ''}</tr></thead>
      <tbody>
        ${state.cobrancas.map((item) => `
          <tr>
            <td>${escapeHtml(item.cliente_nome)}</td>
            <td>${escapeHtml(item.descricao)}</td>
            <td>${toBrazilDate(item.data_vencimento)}</td>
            <td>${escapeHtml(item.status)}</td>
            <td>${formatCurrency(item.valor)}</td>
            ${state.user?.perfil === 'master' ? `<td><div class="action-row"><button class="edit-button edit-cobranca" data-id="${item.id}" type="button">Editar</button><button class="ghost-button delete-cobranca" data-id="${item.id}" type="button">Excluir</button></div></td>` : ''}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  document.querySelectorAll('.edit-cobranca').forEach((button) => {
    button.addEventListener('click', () => {
      const item = state.cobrancas.find((entry) => String(entry.id) === String(button.dataset.id));
      if (item) {
        startEditCobranca(item);
      }
    });
  });

  document.querySelectorAll('.delete-cobranca').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const confirmed = await askConfirmation('Deseja excluir esta cobranca?');
        if (!confirmed) return;
        await api.deleteCobranca(button.dataset.id);
        await refreshData();
        showToast('Cobranca excluida.');
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  });
}

function renderFluxoReport() {
  elements.fluxoReport.innerHTML = state.relatorioFluxo.length
    ? state.relatorioFluxo.map((item) => `
      <div class="report-row">
        <strong>${toBrazilDate(item.data)}</strong>
        <span class="positive">${formatCurrency(item.entradas)}</span>
        <span class="negative">${formatCurrency(item.saidas)}</span>
      </div>
    `).join('')
    : '<div class="empty-state">Sem dados no periodo selecionado.</div>';
}

function renderCategoryReports() {
  const targetMarkup = state.relatorioDespesas.length
    ? state.relatorioDespesas.map((item) => `
      <div class="bar-item">
        <strong>${escapeHtml(item.categoria)}</strong>
        <p class="soft-text">${formatCurrency(item.total)}</p>
      </div>
    `).join('')
    : '<div class="empty-state">Sem despesas no periodo.</div>';

  elements.despesasReport.innerHTML = targetMarkup;
}

function renderFornecedores() {
  if (!state.fornecedores.length) {
    elements.fornecedoresList.innerHTML = '<div class="empty-state">Nenhum fornecedor cadastrado.</div>';
    return;
  }

  elements.fornecedoresList.innerHTML = `
    <table>
      <thead><tr><th>Razao social</th><th>CNPJ</th><th>Contato</th><th>Telefone</th><th>Categoria</th>${state.user?.perfil === 'master' ? '<th>Acoes</th>' : ''}</tr></thead>
      <tbody>
        ${state.fornecedores.map((item) => `
          <tr>
            <td>${escapeHtml(item.razao_social)}</td>
            <td>${escapeHtml(item.cnpj || '')}</td>
            <td>${escapeHtml(item.contato_nome || '')}</td>
            <td>${escapeHtml(item.telefone || '')}</td>
            <td>${escapeHtml(item.categoria || '')}</td>
            ${state.user?.perfil === 'master' ? `<td><div class="action-row"><button class="edit-button edit-fornecedor" data-id="${item.id}" type="button">Editar</button><button class="ghost-button delete-fornecedor" data-id="${item.id}" type="button">Excluir</button></div></td>` : ''}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  document.querySelectorAll('.edit-fornecedor').forEach((button) => {
    button.addEventListener('click', () => {
      const item = state.fornecedores.find((entry) => String(entry.id) === String(button.dataset.id));
      if (item) {
        startEditFornecedor(item);
      }
    });
  });

  document.querySelectorAll('.delete-fornecedor').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const confirmed = await askConfirmation('Deseja excluir este fornecedor?');
        if (!confirmed) return;
        await api.deleteFornecedor(button.dataset.id);
        await refreshData();
        showToast('Fornecedor excluido.');
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  });
}

function renderClientes() {
  const busca = String(elements.clienteBuscaInput?.value || '').trim().toLowerCase();
  const filtered = busca
    ? state.clientes.filter((item) => {
      const nome = String(item.nome || '').toLowerCase();
      const documento = String(item.documento || '').toLowerCase();
      return nome.includes(busca) || documento.includes(busca);
    })
    : state.clientes;

  elements.clientesList.innerHTML = filtered.length
    ? filtered.map((item) => `
      <article class="list-card">
        <h3>${escapeHtml(item.nome)}</h3>
        <p>${escapeHtml(item.telefone || '')} ${escapeHtml(item.email || '')}</p>
        <p class="soft-text">${escapeHtml(item.documento || '')}</p>
        <p class="soft-text">ASO incluso: ${parseBoolean(item.aso_incluso) ? 'Sim' : 'Nao'} | Exames inclusos: ${parseBoolean(item.exames_incluso) ? 'Sim' : 'Nao'}</p>
        ${parseBoolean(item.exames_incluso) && parseJsonArray(item.exames_inclusos_json).length ? `<p class="soft-text">Exames incluidos: ${escapeHtml(parseJsonArray(item.exames_inclusos_json).join(', '))}</p>` : ''}
        <div class="action-row">
          <button class="edit-button edit-cliente" data-id="${item.id}" type="button">Editar</button>
          ${state.user?.perfil === 'master' ? `<button class="ghost-button delete-cliente" data-id="${item.id}" type="button">Excluir</button>` : ''}
        </div>
      </article>
    `).join('')
    : '<div class="empty-state">Nenhum cliente cadastrado.</div>';

  document.querySelectorAll('.edit-cliente').forEach((button) => {
    button.addEventListener('click', () => {
      const item = state.clientes.find((entry) => String(entry.id) === String(button.dataset.id));
      if (item) {
        startEditCliente(item);
      }
    });
  });

  document.querySelectorAll('.delete-cliente').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const confirmed = await askConfirmation('Deseja excluir este cliente?');
        if (!confirmed) return;
        await api.deleteCliente(button.dataset.id);
        await refreshData();
        showToast('Cliente excluido.');
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  });
}

function renderAsoList() {
  const filteredAsos = getFilteredAsos();

  if (!filteredAsos.length) {
    elements.asoList.innerHTML = '<div class="empty-state">Nenhum ASO registrado.</div>';
    return;
  }

  elements.asoList.innerHTML = `
    <table>
      <thead><tr><th>Data</th><th>Empresa</th><th>Funcionario</th><th>Tipo</th><th>Pagamento</th><th>Status</th><th>Valor</th>${state.user?.perfil === 'master' ? '<th></th>' : ''}</tr></thead>
      <tbody>
        ${filteredAsos.map((item) => {
          const detalhes = getAsoDetailText(item);
          const totalColspan = state.user?.perfil === 'master' ? 8 : 7;
          return `
          <tr>
            <td>${toBrazilDate(item.data)}</td>
            <td>${escapeHtml(item.cliente_nome)}</td>
            <td>${escapeHtml(item.funcionario_nome)}</td>
            <td>${escapeHtml(item.tipo_aso.replaceAll('_', ' '))}</td>
            <td>${escapeHtml(getAsoPaymentText(item))}</td>
            <td>${escapeHtml(item.status)}</td>
            <td>${Number(item.valor_aso || 0) + Number(item.valor_exames || 0) > 0 ? formatCurrency(Number(item.valor_aso || 0) + Number(item.valor_exames || 0)) : 'Incluso'}</td>
            ${state.user?.perfil === 'master' ? `<td><div class="action-row"><button class="edit-button edit-aso" data-id="${item.id}" type="button">Editar</button><button class="ghost-button delete-aso" data-id="${item.id}" type="button">Excluir</button></div></td>` : ''}
          </tr>
          <tr class="detail-row">
            <td colspan="${totalColspan}"><span class="soft-text">${escapeHtml(detalhes || 'Sem exames complementares registrados.')}</span></td>
          </tr>
        `;
        }).join('')}
      </tbody>
    </table>
  `;

  document.querySelectorAll('.edit-aso').forEach((button) => {
    button.addEventListener('click', () => {
      const item = state.asos.find((entry) => String(entry.id) === String(button.dataset.id));
      if (item) {
        const normalized = {
          ...item,
          exames_json: parseJsonArray(item.exames_json),
        };
        startEditAso(normalized);
      }
    });
  });

  document.querySelectorAll('.delete-aso').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const confirmed = await askConfirmation('Deseja excluir este ASO?');
        if (!confirmed) return;
        await api.deleteAso(button.dataset.id);
        await refreshData({ includeCatalogs: false });
        showToast('ASO excluido.');
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  });
}

function renderTransferencias() {
  elements.transferenciasList.innerHTML = state.transferencias.length
    ? state.transferencias.map((item) => `<article class="list-card"><h3>${escapeHtml(item.conta_origem_nome)} -> ${escapeHtml(item.conta_destino_nome)}</h3><p>${formatCurrency(item.valor)} em ${toBrazilDate(item.data)}</p></article>`).join('')
    : '<div class="empty-state">Nenhuma transferencia registrada.</div>';
}

function renderContasPagar() {
  const filteredHistorico = getFilteredContasPagarHistorico();

  if (!state.contasPagar.length) {
    elements.contasPagarList.innerHTML = '<div class="empty-state">Nenhuma conta a pagar cadastrada.</div>';
    elements.contasPagarHistorico.innerHTML = '<div class="empty-state">Nenhuma conta a pagar cadastrada.</div>';
    return;
  }

  elements.contasPagarList.innerHTML = `
    <table>
      <thead><tr><th>Descricao</th><th>Vencimento</th><th>Categoria</th><th>Fornecedor</th><th>Status</th><th>Valor</th></tr></thead>
      <tbody>
        ${state.contasPagar.map((item) => `
          <tr>
            <td>${escapeHtml(item.descricao)}${item.total_parcelas > 1 ? ` (${item.parcela_atual}/${item.total_parcelas})` : ''}</td>
            <td>${toBrazilDate(item.data_vencimento)}</td>
            <td>${escapeHtml(item.categoria_nome)}</td>
            <td>${escapeHtml(item.fornecedor_nome || item.fornecedor || '-')}</td>
            <td>${escapeHtml(item.status)}</td>
            <td>${formatCurrency(item.valor)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  elements.contasPagarHistorico.innerHTML = `
    <table>
      <thead><tr><th>Descricao</th><th>Tipo</th><th>Vencimento</th><th>Status</th><th>Valor</th>${state.user?.perfil === 'master' ? '<th>Acoes</th>' : ''}</tr></thead>
      <tbody>
        ${filteredHistorico.map((item) => `
          <tr>
            <td>${escapeHtml(item.descricao)}</td>
            <td>${escapeHtml(item.tipo)}</td>
            <td>${toBrazilDate(item.data_vencimento)}</td>
            <td>${escapeHtml(item.status)}</td>
            <td>${formatCurrency(item.valor)}</td>
            ${state.user?.perfil === 'master' ? `<td><div class="action-row"><button class="edit-button edit-conta-pagar" data-id="${item.id}" type="button">Editar</button><button class="ghost-button delete-conta-pagar" data-id="${item.id}" type="button">Excluir</button></div></td>` : ''}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  if (!filteredHistorico.length) {
    elements.contasPagarHistorico.innerHTML = '<div class="empty-state">Nenhuma conta a pagar encontrada com esses filtros.</div>';
  }

  document.querySelectorAll('.edit-conta-pagar').forEach((button) => {
    button.addEventListener('click', () => {
      const item = state.contasPagar.find((entry) => String(entry.id) === String(button.dataset.id));
      if (item) {
        startEditContaPagar(item);
      }
    });
  });

  document.querySelectorAll('.delete-conta-pagar').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const confirmed = await askConfirmation('Deseja excluir esta conta a pagar?');
        if (!confirmed) return;
        await api.deleteContaPagar(button.dataset.id);
        await refreshData({ includeCatalogs: false });
        showToast('Conta a pagar excluida.');
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  });
}

function renderCategoriasList() {
  if (!state.categorias.length) {
    elements.categoriasList.innerHTML = '<div class="empty-state">Nenhuma categoria cadastrada.</div>';
    return;
  }

  elements.categoriasList.innerHTML = `
    <table>
      <thead><tr><th>Nome</th><th>Tipo</th>${state.user?.perfil === 'master' ? '<th></th>' : ''}</tr></thead>
      <tbody>
        ${state.categorias.map((item) => `
          <tr>
            <td>${escapeHtml(item.nome)}</td>
            <td>${escapeHtml(item.tipo)}</td>
            ${state.user?.perfil === 'master' ? `<td><div class="action-row"><button class="edit-button edit-categoria" data-id="${item.id}" type="button">Editar</button><button class="ghost-button delete-categoria" data-id="${item.id}" type="button">Excluir</button></div></td>` : ''}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  document.querySelectorAll('.edit-categoria').forEach((button) => {
    button.addEventListener('click', () => {
      const item = state.categorias.find((entry) => String(entry.id) === String(button.dataset.id));
      if (item) {
        startEditCategoria(item);
      }
    });
  });

  document.querySelectorAll('.delete-categoria').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const confirmed = await askConfirmation('Deseja excluir esta categoria?');
        if (!confirmed) return;
        await api.deleteCategoria(button.dataset.id);
        await refreshData();
        showToast('Categoria excluida.');
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  });
}

function renderPendencias() {
  const filteredPendencias = getFilteredPendencias();

  if (!filteredPendencias.length) {
    elements.pendenciasList.innerHTML = '<div class="empty-state">Nao ha pendencias para compensacao.</div>';
    return;
  }

  elements.pendenciasList.innerHTML = `
    <table>
      <thead><tr><th>Origem</th><th>Empresa/cliente</th><th>Descricao</th><th>Data</th><th>Valor</th><th></th></tr></thead>
      <tbody>
        ${filteredPendencias.map((item) => `
          <tr>
            <td>${escapeHtml(item.origem)}</td>
            <td>${escapeHtml(item.cliente_nome || '-')}</td>
            <td>${escapeHtml(item.descricao || 'Sem descricao')}</td>
            <td>${toBrazilDate(item.data)}</td>
            <td>${formatCurrency(item.valor)}</td>
            <td><button class="primary-button compensate-button" data-id="${item.id}" data-origin="${item.origem}" type="button">Compensar</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  document.querySelectorAll('.compensate-button').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const confirmed = await askConfirmation('Deseja marcar esta pendencia como compensada?');
        if (!confirmed) return;
        const defaultDate = new Date().toISOString().slice(0, 10);
        if (button.dataset.origin === 'aso') {
          const asoPayload = await askCompensationDetails({
            defaultDate,
            requirePayment: true,
            defaultPayment: 'pix',
            message: 'Selecione a data e como este ASO foi recebido.',
          });
          if (!asoPayload) return;
          await api.compensarAso(button.dataset.id, asoPayload);
        } else if (button.dataset.origin === 'cobranca') {
          const cobrancaPayload = await askCompensationDetails({
            defaultDate,
            requirePayment: false,
            defaultPayment: 'sicoob',
            message: 'Selecione a data e a conta onde o boleto compensou.',
          });
          if (!cobrancaPayload?.data_compensacao || !cobrancaPayload?.conta_id) return;
          await api.compensarCobranca(button.dataset.id, {
            data_compensacao: cobrancaPayload.data_compensacao,
            conta_id: cobrancaPayload.conta_id,
          });
        } else {
          if (button.dataset.origin === 'lancamento') {
            const dataCompensacao = await askCompensationDate(defaultDate);
            if (!dataCompensacao) return;
            await api.compensarLancamento(button.dataset.id, { data_compensacao: dataCompensacao });
          } else {
            const contaPagarPayload = await askCompensationDetails({
              defaultDate,
              requirePayment: true,
              defaultPayment: 'pix',
              message: 'Informe a data e como esta conta foi paga.',
            });
            if (!contaPagarPayload) return;
            await api.compensarContaPagar(button.dataset.id, contaPagarPayload);
          }
        }
        await refreshData({ includeCatalogs: false });
        showToast('Compensacao concluida.');
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  });
}

function renderLancamentosTable() {
  const allowDelete = state.user?.perfil === 'master';
  elements.lancamentosTable.innerHTML = state.lancamentos.length ? `
    <table>
      <thead><tr><th>Data</th><th>Tipo</th><th>Descricao</th><th>Categoria</th><th>Conta</th><th>Status</th><th>Valor</th>${allowDelete ? '<th></th>' : ''}</tr></thead>
      <tbody>
        ${state.lancamentos.map((item) => `
          <tr>
            <td>${toBrazilDate(item.data)}</td>
            <td>${escapeHtml(item.tipo)}</td>
            <td>${escapeHtml(item.descricao || 'Sem descricao')}</td>
            <td>${escapeHtml(item.categoria_nome)}</td>
            <td>${escapeHtml(item.conta_nome)}</td>
            <td>${escapeHtml(item.status)}</td>
            <td class="${item.tipo === 'entrada' ? 'positive' : 'negative'}">${formatCurrency(item.valor)}</td>
            ${allowDelete ? `<td><div class="action-row"><button class="edit-button edit-lancamento" data-id="${item.id}" type="button">Editar</button><button class="ghost-button delete-button" data-id="${item.id}" type="button">Excluir</button></div></td>` : ''}
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<div class="empty-state">Nenhum registro encontrado.</div>';

  document.querySelectorAll('.edit-lancamento').forEach((button) => {
    button.addEventListener('click', () => {
      const item = state.lancamentos.find((entry) => String(entry.id) === String(button.dataset.id));
      if (item) {
        startEditLancamento(item);
      }
    });
  });

  document.querySelectorAll('.delete-button').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const confirmed = await askConfirmation('Deseja excluir este lancamento?');
        if (!confirmed) return;
        await api.deleteLancamento(button.dataset.id);
        await refreshData({ includeCatalogs: false });
        showToast('Lancamento excluido.');
      } catch (error) {
        showToast(error.message, 'error');
      }
    });
  });
}

function renderAll() {
  renderMetrics();
  renderFluxoReport();
  renderCategoryReports();
  renderCategoriasList();
  renderContasList();
  renderFornecedores();
  renderCobrancasList();
  renderClientes();
  renderAsoList();
  renderTransferencias();
  renderContasPagar();
  renderPendencias();
  renderLancamentosTable();
  refreshSelects();
}

async function refreshData(options = {}) {
  const range = getPeriodRange();
  const includeCatalogs = options.includeCatalogs !== false;
  const snapshot = await api.getResumoInicial({
    includeCatalogs,
    dataInicio: range.start,
    dataFim: range.end,
    lancamentosDataInicio: elements.filtroForm.elements.dataInicio.value,
    lancamentosDataFim: elements.filtroForm.elements.dataFim.value,
    tipo: elements.filtroForm.elements.tipo.value,
    contaId: elements.filtroForm.elements.contaId.value,
    categoriaId: elements.filtroForm.elements.categoriaId.value,
    status: elements.filtroForm.elements.status.value,
    includeOrigins: true,
  });

  state.user = snapshot.user;
  state.dashboard = snapshot.dashboard;
  state.contas = snapshot.contas || [];
  state.asos = snapshot.asos || [];
  state.transferencias = snapshot.transferencias || [];
  state.contasPagar = snapshot.contas_pagar || [];
  state.pendencias = snapshot.pendencias || [];
  state.lancamentos = snapshot.lancamentos || [];
  state.relatorioFluxo = snapshot.relatorio_fluxo || [];
  state.relatorioDespesas = snapshot.relatorio_despesas || [];

  if (includeCatalogs) {
    state.categorias = snapshot.categorias || [];
    state.clientes = snapshot.clientes || [];
    state.fornecedores = snapshot.fornecedores || [];
    state.cobrancas = snapshot.cobrancas || [];
  }

  applyUserContext();
  renderAll();
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function exportLancamentosExcel() {
  if (!state.lancamentos.length) {
    showToast('Nao ha dados para exportar.', 'warning');
    return;
  }

  const rows = state.lancamentos.map((item) => [
    item.data,
    item.tipo,
    item.descricao || '',
    item.categoria_nome,
    item.conta_nome,
    item.status,
    Number(item.valor || 0).toFixed(2).replace('.', ','),
  ]);

  const csv = [['Data', 'Tipo', 'Descricao', 'Categoria', 'Conta', 'Status', 'Valor'], ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(';'))
    .join('\r\n');

  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Gestão Financeira — Demonstração - Relatório - ${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Exportacao concluida.');
}

function exportRowsToCsv(filename, headers, rows) {
  if (!rows.length) {
    showToast('Nao ha dados para exportar.', 'warning');
    return;
  }

  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(';'))
    .join('\r\n');

  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.startsWith("Gestão Financeira — Demonstração") ? filename : `Gestão Financeira — Demonstração - ${filename}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Exportacao concluida.');
}

function exportAsoExcel() {
  const rows = getFilteredAsos().map((item) => [
    item.data,
    item.cliente_nome,
    item.funcionario_nome,
    item.cidade || '',
    item.tipo_aso,
    getFormaPagamentoLabel(item.forma_pagamento),
    item.status,
    Number(item.valor_aso || 0).toFixed(2).replace('.', ','),
    Number(item.valor_exames || 0).toFixed(2).replace('.', ','),
    (Number(item.valor_aso || 0) + Number(item.valor_exames || 0)).toFixed(2).replace('.', ','),
    getAsoDetailText(item),
  ]);

  exportRowsToCsv(
    `Gestão Financeira — Demonstração - ASOs - ${new Date().toISOString().slice(0, 10)}.csv`,
    ['Data', 'Empresa', 'Funcionario', 'Cidade', 'Tipo ASO', 'Pagamento', 'Status', 'Valor ASO', 'Valor exames', 'Valor total', 'Detalhes'],
    rows
  );
}

function exportAccountHistoryExcel() {
  if (!state.contaHistorico?.conta) {
    showToast('Nenhuma conta selecionada.', 'warning');
    return;
  }

  const rows = getFilteredAccountMovements().map((item) => [
    item.data_movimento,
    item.origem,
    item.descricao || '',
    item.tipo,
    item.status,
    Number(item.valor || 0).toFixed(2).replace('.', ','),
  ]);

  exportRowsToCsv(
    `historico-${String(state.contaHistorico.conta.nome || 'conta').toLowerCase().replaceAll(' ', '-')}-${new Date().toISOString().slice(0, 10)}.csv`,
    ['Data', 'Origem', 'Descricao', 'Tipo', 'Status', 'Valor'],
    rows
  );
}

function wireNavigation() {
  elements.navGroupToggles.forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.closest('.nav-group');
      group.classList.toggle('open');
    });
  });

  elements.navButtons.forEach((button) => {
    button.addEventListener('click', () => switchView(button.dataset.view));
  });

  const goToDashboard = () => switchView('dashboard');

  elements.heroDashboardLink.addEventListener('click', goToDashboard);
  elements.sidebarDashboardLink.addEventListener('click', goToDashboard);
  elements.heroDashboardLink.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      goToDashboard();
    }
  });
  elements.sidebarDashboardLink.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      goToDashboard();
    }
  });
}

function wireForms() {
  elements.loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await api.login(formToObject(elements.loginForm));
      elements.loginFeedback.textContent = '';
      showApp();
      await refreshData();
      showToast('Login realizado com sucesso.');
    } catch (error) {
      elements.loginFeedback.textContent = error.message;
      showToast(error.message, 'error');
    }
  });

  elements.logoutButton.addEventListener('click', async () => {
    try {
      await api.logout();
    } catch (error) {
      api.setToken(null);
    } finally {
      showLogin();
      showToast('Sessao encerrada.', 'warning');
    }
  });

  elements.lancamentoTipo.addEventListener('change', () => {
    populateCategorySelect(elements.lancamentoCategoria, elements.lancamentoTipo.value === 'boleto' ? 'entrada' : elements.lancamentoTipo.value);
    syncLancamentoTypeFields();
  });

  elements.boletoClienteSelect.addEventListener('change', populateBoletoSelect);

  elements.lancamentoForm.elements.forma_pagamento.addEventListener('change', () => {
    syncContaFieldWithPayment(elements.lancamentoForm);
  });

  elements.competenciaMes.addEventListener('change', async () => {
    setDefaultDates();
    await refreshData({ includeCatalogs: false });
  });

  elements.competenciaAno.addEventListener('change', async () => {
    setDefaultDates();
    await refreshData({ includeCatalogs: false });
  });

  elements.lancamentoForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      if (elements.lancamentoTipo.value === 'boleto') {
        const cobrancaId = elements.lancamentoForm.elements.cobranca_id.value;
        const dataCompensacao = elements.lancamentoForm.elements.data_compensacao.value;
        const contaId = elements.lancamentoForm.elements.boleto_conta_id.value;
        if (!cobrancaId || !dataCompensacao || !contaId) {
          showToast('Selecione o boleto, a conta e a data da compensacao.', 'warning');
          return;
        }
        const confirmed = await askConfirmation(`Confirmar a compensacao deste boleto em ${getContaNome(contaId)}?`);
        if (!confirmed) return;
        await api.compensarCobranca(cobrancaId, { data_compensacao: dataCompensacao, conta_id: contaId });
        resetLancamentoForm();
        await refreshData();
        showToast('Boleto compensado.');
        return;
      }

      const values = normalizeContaByFormaPagamento(formToObject(elements.lancamentoForm));
      const isEditing = Boolean(state.editing.lancamentoId);
      const contaNome = getContaNome(values.conta_id);
      const tipoTexto = values.tipo === 'entrada' ? 'entrar' : 'sair';
      const confirmed = await askConfirmation(
        `Confirmar ${values.tipo === 'entrada' ? 'entrada' : 'saida'} de ${formatCurrency(values.valor)}? O valor vai ${tipoTexto} pela conta ${contaNome} com forma de pagamento ${getFormaPagamentoLabel(values.forma_pagamento)}.`
      );
      if (!confirmed) return;

      if (isEditing) {
        await api.updateLancamento(state.editing.lancamentoId, { ...values, recorrente: elements.lancamentoForm.elements.recorrente.checked });
      } else {
        await api.createLancamento({ ...values, recorrente: elements.lancamentoForm.elements.recorrente.checked });
      }

      resetLancamentoForm();
      await refreshData({ includeCatalogs: false });
      showToast(isEditing ? 'Lancamento atualizado.' : 'Lancamento registrado.');
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  elements.categoriaForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const values = formToObject(elements.categoriaForm);
      const isEditing = Boolean(state.editing.categoriaId);
      if (isEditing) {
        await api.updateCategoria(state.editing.categoriaId, values);
      } else {
        await api.createCategoria(values);
      }
      resetCategoriaForm();
      await refreshData();
      showToast(isEditing ? 'Categoria atualizada.' : 'Cadastro realizado.');
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  elements.contaForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const values = formToObject(elements.contaForm);
      const isEditing = Boolean(state.editing.contaId);
      if (isEditing) {
        await api.updateConta(state.editing.contaId, values);
      } else {
        await api.createConta(values);
      }
      resetContaForm();
      await refreshData();
      showToast(isEditing ? 'Conta atualizada.' : 'Conta cadastrada.');
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  elements.fornecedorForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const values = formToObject(elements.fornecedorForm);
      const isEditing = Boolean(state.editing.fornecedorId);
      if (isEditing) {
        await api.updateFornecedor(state.editing.fornecedorId, values);
      } else {
        await api.createFornecedor(values);
      }
      resetFornecedorForm();
      await refreshData();
      showToast(isEditing ? 'Fornecedor atualizado.' : 'Fornecedor cadastrado.');
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  elements.cobrancaForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const values = formToObject(elements.cobrancaForm);
      const isEditing = Boolean(state.editing.cobrancaId);
      if (isEditing) {
        await api.updateCobranca(state.editing.cobrancaId, values);
      } else {
        await api.createCobranca(values);
      }
      resetCobrancaForm();
      await refreshData();
      showToast(isEditing ? 'Cobranca atualizada.' : 'Cobranca cadastrada.');
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  elements.clienteForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const values = {
        ...formToObject(elements.clienteForm),
        aso_incluso: elements.clienteForm.elements.aso_incluso.checked,
        exames_incluso: elements.clienteForm.elements.exames_incluso.checked,
        exames_inclusos_json: elements.clienteForm.elements.exames_incluso.checked ? collectClientIncludedExams() : [],
      };
      const isEditing = Boolean(state.editing.clienteId);
      if (isEditing) {
        await api.updateCliente(state.editing.clienteId, values);
      } else {
        await api.createCliente(values);
      }
      resetClienteForm();
      await refreshData();
      showToast(isEditing ? 'Cliente atualizado.' : 'Cliente cadastrado.');
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
  elements.clienteForm.elements.exames_incluso.addEventListener('change', syncClienteExamFields);

  elements.asoCliente.addEventListener('change', syncAsoBillingFields);
  elements.asoExamesComplementares.addEventListener('change', syncAsoBillingFields);
  elements.asoForm.elements.forma_pagamento?.addEventListener('change', () => {
    syncContaFieldWithPayment(elements.asoForm);
    syncAsoBillingFields();
  });
  elements.asoForm.elements.status?.addEventListener('change', syncAsoBillingFields);

  elements.asoForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const isEditing = Boolean(state.editing.asoId);
      const client = getSelectedClient();
      const asoIncluso = parseBoolean(client?.aso_incluso);
      const examesIncluso = parseBoolean(client?.exames_incluso);
      const values = {
        ...normalizeContaByFormaPagamento(formToObject(elements.asoForm)),
        exames_complementares: elements.asoForm.elements.exames_complementares.checked,
        aso_incluso: asoIncluso,
        exames_incluso: examesIncluso,
        exames_json: collectAsoExames(),
      };
      values.valor_exames = values.exames_json.reduce((sum, item) => sum + Number(item.valor || 0), 0);

      if (values.status !== 'pago') {
        values.forma_pagamento = '';
        values.conta_id = '';
      }

      if (asoIncluso) {
        values.valor_aso = '';
        if (!values.exames_json.some((item) => !item.incluso && !item.pago && Number(item.valor || 0) > 0)) {
          values.status = 'pago';
        }
      }

      const confirmText = asoIncluso
        ? `Confirmar registro do ASO de ${values.funcionario_nome} para ${client?.nome || 'empresa selecionada'}? Este cliente possui ASO incluso.`
        : `Confirmar ASO de ${values.funcionario_nome} para ${client?.nome || 'empresa selecionada'}? ASO: ${formatCurrency(values.valor_aso || 0)}. Exames: ${formatCurrency(values.valor_exames || 0)}. Total: ${formatCurrency(Number(values.valor_aso || 0) + Number(values.valor_exames || 0))}. Pagamento principal: ${getFormaPagamentoLabel(values.forma_pagamento)}${values.conta_id ? ` em ${getContaNome(values.conta_id)}` : ''}.`;
      const confirmed = await askConfirmation(confirmText);
      if (!confirmed) return;

      if (isEditing) {
        await api.updateAso(state.editing.asoId, values);
      } else {
        await api.createAso(values);
      }

      resetAsoForm();
      await refreshData({ includeCatalogs: false });
      showToast(isEditing ? 'ASO atualizado.' : 'ASO registrado.');
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  elements.transferenciaForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await api.createTransferencia(formToObject(elements.transferenciaForm));
      elements.transferenciaForm.reset();
      setDefaultDates();
      await refreshData({ includeCatalogs: false });
      showToast('Movimentacao concluida.');
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  elements.contaPagarForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const values = formToObject(elements.contaPagarForm);
      const isEditing = Boolean(state.editing.contaPagarId);
      const confirmed = await askConfirmation(
        `Confirmar conta a pagar de ${formatCurrency(values.valor)}${values.fornecedor_id ? ` para ${state.fornecedores.find((item) => String(item.id) === String(values.fornecedor_id))?.razao_social || 'fornecedor selecionado'}` : ''}?`
      );
      if (!confirmed) return;

      if (isEditing) {
        await api.updateContaPagar(state.editing.contaPagarId, values);
      } else {
        await api.createContaPagar(values);
      }

      resetContaPagarForm();
      await refreshData({ includeCatalogs: false });
      showToast(isEditing ? 'Conta a pagar atualizada.' : 'Conta a pagar cadastrada.');
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  elements.contasPagarFiltroForm.addEventListener('submit', (event) => {
    event.preventDefault();
    renderContasPagar();
  });
  elements.contasPagarFiltroDescricao.addEventListener('input', renderContasPagar);
  elements.contasPagarFiltroDataInicio.addEventListener('change', renderContasPagar);
  elements.contasPagarFiltroDataFim.addEventListener('change', renderContasPagar);
  elements.contasPagarFiltroStatus.addEventListener('change', renderContasPagar);
  elements.contasPagarLimparFiltro.addEventListener('click', () => {
    elements.contasPagarFiltroDescricao.value = '';
    elements.contasPagarFiltroDataInicio.value = '';
    elements.contasPagarFiltroDataFim.value = '';
    elements.contasPagarFiltroStatus.value = '';
    renderContasPagar();
  });

  elements.filtroForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      state.lancamentos = await api.getLancamentos({ ...formToObject(elements.filtroForm), includeOrigins: true });
      renderLancamentosTable();
      showToast('Filtros aplicados.');
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  elements.compensacaoFiltroForm.addEventListener('submit', (event) => {
    event.preventDefault();
    renderPendencias();
  });
  elements.compensacaoClienteSelect.addEventListener('change', renderPendencias);
  elements.compensacaoOrigemSelect.addEventListener('change', renderPendencias);

  elements.asoFiltroForm.addEventListener('submit', (event) => {
    event.preventDefault();
    renderAsoList();
  });

  elements.asoBuscaInput.addEventListener('input', () => {
    renderAsoList();
  });

  elements.asoDataInicio.addEventListener('change', () => {
    renderAsoList();
  });

  elements.asoDataFim.addEventListener('change', () => {
    renderAsoList();
  });

  elements.exportarExcel.addEventListener('click', exportLancamentosExcel);
  elements.exportarCategorias.addEventListener('click', () => {
    exportRowsToCsv(
      `Gestão Financeira — Demonstração - Categorias - ${new Date().toISOString().slice(0, 10)}.csv`,
      ['Nome', 'Tipo'],
      state.categorias.map((item) => [item.nome, item.tipo])
    );
  });
  elements.exportarContasPagar.addEventListener('click', () => {
    exportRowsToCsv(
      `Gestão Financeira — Demonstração - Contas a pagar - ${new Date().toISOString().slice(0, 10)}.csv`,
      ['Descricao', 'Tipo', 'Vencimento', 'Categoria', 'Fornecedor', 'Status', 'Valor'],
      state.contasPagar.map((item) => [item.descricao, item.tipo, item.data_vencimento, item.categoria_nome, item.fornecedor_nome || item.fornecedor || '', item.status, Number(item.valor || 0).toFixed(2).replace('.', ',')])
    );
  });
  elements.exportarAso.addEventListener('click', exportAsoExcel);
  elements.clienteBuscaInput.addEventListener('input', () => {
    renderClientes();
  });

  elements.lancamentoCancel.addEventListener('click', resetLancamentoForm);
  elements.categoriaCancel.addEventListener('click', resetCategoriaForm);
  elements.contaCancel.addEventListener('click', resetContaForm);
  elements.fornecedorCancel.addEventListener('click', resetFornecedorForm);
  elements.cobrancaCancel.addEventListener('click', resetCobrancaForm);
  elements.clienteCancel.addEventListener('click', resetClienteForm);
  elements.contaPagarCancel.addEventListener('click', resetContaPagarForm);
  elements.asoCancel.addEventListener('click', resetAsoForm);
  elements.accountHistoryExport.addEventListener('click', exportAccountHistoryExcel);
  elements.accountHistoryClose.addEventListener('click', closeAccountHistoryModal);
  elements.accountHistoryFilterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    reloadAccountHistoryMovements().catch((error) => showToast(error.message, 'error'));
  });
  elements.accountHistoryStart.addEventListener('change', () => {
    reloadAccountHistoryMovements().catch((error) => showToast(error.message, 'error'));
  });
  elements.accountHistoryEnd.addEventListener('change', () => {
    reloadAccountHistoryMovements().catch((error) => showToast(error.message, 'error'));
  });
  elements.accountHistoryModal.addEventListener('click', (event) => {
    if (event.target === elements.accountHistoryModal) {
      closeAccountHistoryModal();
    }
  });
}

async function bootstrapSession() {
  if (!api.getToken()) {
    showLogin();
    return;
  }

  try {
    await api.me();
    showApp();
    await refreshData();
  } catch (error) {
    api.setToken(null);
    showLogin();
  }
}

function init() {
  populateCompetenciaSelects();
  renderClientIncludedExamChecklist();
  renderAsoExamChecklist();
  setDefaultDates();
  resetContaForm();
  resetFornecedorForm();
  resetCobrancaForm();
  resetLancamentoForm();
  resetContaPagarForm();
  wireNavigation();
  wireForms();
  setApiStatus('Conectado ao backend');
  bootstrapSession();
}

init();
