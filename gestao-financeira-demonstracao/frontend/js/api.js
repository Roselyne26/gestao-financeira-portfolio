const isLocalFile = window.location.protocol === 'file:';
const isLiveServerLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname) && window.location.port !== '3000';
const API_ORIGIN = (isLocalFile || isLiveServerLocal) ? 'http://localhost:3000' : window.location.origin;
const API_BASE = `${API_ORIGIN}/api`;
const TOKEN_KEY = 'gestao_financeira_demo_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.erro || 'Falha na requisicao.');
  }

  return data;
}

export const api = {
  getToken,
  setToken,
  login(payload) {
    return fetch(`${API_ORIGIN}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.erro || 'Falha no login.');
      }

      setToken(data.token);
      return data;
    });
  },
  logout() {
    return request('/auth/logout', { method: 'POST' }).finally(() => setToken(null));
  },
  me() {
    return fetch(`${API_ORIGIN}/api/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    }).then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.erro || 'Sessao invalida.');
      }
      return data;
    });
  },
  getResumoInicial(params = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value != null)
    );
    return request(`/resumo-inicial${query.toString() ? `?${query.toString()}` : ''}`);
  },
  getLancamentos(params = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value != null)
    );
    return request(`/lancamentos${query.toString() ? `?${query.toString()}` : ''}`);
  },
  createLancamento(payload) {
    return request('/lancamentos', { method: 'POST', body: JSON.stringify(payload) });
  },
  updateLancamento(id, payload) {
    return request(`/lancamentos/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  deleteLancamento(id) {
    return request(`/lancamentos/${id}`, { method: 'DELETE' });
  },
  createCategoria(payload) {
    return request('/categorias', { method: 'POST', body: JSON.stringify(payload) });
  },
  updateCategoria(id, payload) {
    return request(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  deleteCategoria(id) {
    return request(`/categorias/${id}`, { method: 'DELETE' });
  },
  createConta(payload) {
    return request('/contas', { method: 'POST', body: JSON.stringify(payload) });
  },
  updateConta(id, payload) {
    return request(`/contas/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  deleteConta(id) {
    return request(`/contas/${id}`, { method: 'DELETE' });
  },
  getContaMovimentacoes(id, params = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value != null)
    );
    return request(`/contas/${id}/movimentacoes${query.toString() ? `?${query.toString()}` : ''}`);
  },
  createCliente(payload) {
    return request('/clientes', { method: 'POST', body: JSON.stringify(payload) });
  },
  createFornecedor(payload) {
    return request('/fornecedores', { method: 'POST', body: JSON.stringify(payload) });
  },
  updateCliente(id, payload) {
    return request(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  updateFornecedor(id, payload) {
    return request(`/fornecedores/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  deleteCliente(id) {
    return request(`/clientes/${id}`, { method: 'DELETE' });
  },
  deleteFornecedor(id) {
    return request(`/fornecedores/${id}`, { method: 'DELETE' });
  },
  getAsos() {
    return request('/asos');
  },
  createAso(payload) {
    return request('/asos', { method: 'POST', body: JSON.stringify(payload) });
  },
  updateAso(id, payload) {
    return request(`/asos/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  deleteAso(id) {
    return request(`/asos/${id}`, { method: 'DELETE' });
  },
  createTransferencia(payload) {
    return request('/transferencias', { method: 'POST', body: JSON.stringify(payload) });
  },
  createContaPagar(payload) {
    return request('/contas-pagar', { method: 'POST', body: JSON.stringify(payload) });
  },
  updateContaPagar(id, payload) {
    return request(`/contas-pagar/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  deleteContaPagar(id) {
    return request(`/contas-pagar/${id}`, { method: 'DELETE' });
  },
  createCobranca(payload) {
    return request('/cobrancas', { method: 'POST', body: JSON.stringify(payload) });
  },
  updateCobranca(id, payload) {
    return request(`/cobrancas/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  deleteCobranca(id) {
    return request(`/cobrancas/${id}`, { method: 'DELETE' });
  },
  getPendencias() {
    return request('/compensacoes/pendencias');
  },
  compensarLancamento(id, payload = {}) {
    return request(`/compensacoes/lancamentos/${id}`, { method: 'POST', body: JSON.stringify(payload) });
  },
  compensarAso(id, payload = {}) {
    return request(`/compensacoes/asos/${id}`, { method: 'POST', body: JSON.stringify(payload) });
  },
  compensarContaPagar(id, payload = {}) {
    return request(`/compensacoes/contas-pagar/${id}`, { method: 'POST', body: JSON.stringify(payload) });
  },
  compensarCobranca(id, payload = {}) {
    return request(`/compensacoes/cobrancas/${id}`, { method: 'POST', body: JSON.stringify(payload) });
  },
  getDashboard(dataInicio, dataFim) {
    const query = new URLSearchParams(
      Object.entries({ dataInicio, dataFim }).filter(([, value]) => value)
    );
    return request(`/dashboard${query.toString() ? `?${query.toString()}` : ''}`);
  },
  getFluxo(dataInicio, dataFim) {
    const query = new URLSearchParams(
      Object.entries({ dataInicio, dataFim }).filter(([, value]) => value)
    );
    return request(`/relatorios/fluxo${query.toString() ? `?${query.toString()}` : ''}`);
  },
  getDespesasCategoria(dataInicio, dataFim) {
    const query = new URLSearchParams(
      Object.entries({ dataInicio, dataFim }).filter(([, value]) => value)
    );
    return request(`/relatorios/despesas-categoria${query.toString() ? `?${query.toString()}` : ''}`);
  },
  resetSistema() {
    return request('/admin/reset-sistema', { method: 'POST' });
  },
};
