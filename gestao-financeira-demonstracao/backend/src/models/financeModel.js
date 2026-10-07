const crypto = require('crypto');
const { all, get, run } = require('../database/db');

const referenceCache = {
  contaCaixa: null,
  contaSicoob: null,
  contaCresol: null,
  contaBancoDoBrasil: null,
  categoriaReceitaAso: null,
  categoriaOutrosRecebimentos: null,
};

function invalidateContaCache() {
  referenceCache.contaCaixa = null;
  referenceCache.contaSicoob = null;
  referenceCache.contaCresol = null;
  referenceCache.contaBancoDoBrasil = null;
}

function invalidateCategoriaCache() {
  referenceCache.categoriaReceitaAso = null;
  referenceCache.categoriaOutrosRecebimentos = null;
}

function addFrequency(dateText, frequency) {
  const [year, month, day] = dateText.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  switch (frequency) {
    case 'diaria':
      date.setDate(date.getDate() + 1);
      break;
    case 'semanal':
      date.setDate(date.getDate() + 7);
      break;
    case 'quinzenal':
      date.setDate(date.getDate() + 15);
      break;
    case 'mensal':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'anual':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      break;
  }

  return date.toISOString().slice(0, 10);
}

function addMonths(dateText, monthsToAdd) {
  const [year, month, day] = dateText.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setMonth(date.getMonth() + monthsToAdd);
  return date.toISOString().slice(0, 10);
}

async function findUserByCredentials(login, senha) {
  return get(
    `
      SELECT id, nome, login, perfil
      FROM usuarios
      WHERE login = ?
        AND senha = ?
    `,
    [login, senha]
  );
}

async function createSessionToken(userId) {
  const token = crypto.randomUUID();

  await run(
    `
      UPDATE usuarios
      SET token = ?
      WHERE id = ?
    `,
    [token, userId]
  );

  return token;
}

async function findUserByToken(token) {
  if (!token) {
    return null;
  }

  return get(
    `
      SELECT id, nome, login, perfil
      FROM usuarios
      WHERE token = ?
    `,
    [token]
  );
}

async function clearSessionToken(token) {
  await run('UPDATE usuarios SET token = NULL WHERE token = ?', [token]);
}

async function getContaById(id) {
  return get('SELECT * FROM contas WHERE id = ?', [id]);
}

async function getContaCaixa() {
  if (referenceCache.contaCaixa) {
    return referenceCache.contaCaixa;
  }

  referenceCache.contaCaixa = await get(
    `
      SELECT id, nome, saldo_atual
      FROM contas
      WHERE LOWER(nome) = 'caixa'
      LIMIT 1
    `
  );

  return referenceCache.contaCaixa;
}

async function getContaSicoob() {
  if (referenceCache.contaSicoob) {
    return referenceCache.contaSicoob;
  }

  referenceCache.contaSicoob = await get(
    `
      SELECT id, nome, saldo_atual
      FROM contas
      WHERE LOWER(nome) IN ('sicoob', 'conta bancaria')
        AND ativo = 1
      ORDER BY CASE WHEN LOWER(nome) = 'sicoob' THEN 0 ELSE 1 END
      LIMIT 1
    `
  );

  return referenceCache.contaSicoob;
}

async function getContaCresol() {
  if (referenceCache.contaCresol) {
    return referenceCache.contaCresol;
  }

  referenceCache.contaCresol = await get(
    `
      SELECT id, nome, saldo_atual
      FROM contas
      WHERE LOWER(nome) = 'cresol'
        AND ativo = 1
      LIMIT 1
    `
  );

  return referenceCache.contaCresol;
}

async function getContaBancoDoBrasil() {
  if (referenceCache.contaBancoDoBrasil) {
    return referenceCache.contaBancoDoBrasil;
  }

  referenceCache.contaBancoDoBrasil = await get(
    `
      SELECT id, nome, saldo_atual
      FROM contas
      WHERE LOWER(nome) = 'banco do brasil'
        AND ativo = 1
      LIMIT 1
    `
  );

  return referenceCache.contaBancoDoBrasil;
}

async function getCategoriaById(id) {
  return get('SELECT * FROM categorias WHERE id = ?', [id]);
}

async function getCategoriaReceitaAso() {
  if (referenceCache.categoriaReceitaAso) {
    return referenceCache.categoriaReceitaAso;
  }

  referenceCache.categoriaReceitaAso = await get(
    `
      SELECT id, nome, tipo
      FROM categorias
      WHERE nome = 'Receita ASO'
        AND tipo = 'entrada'
      LIMIT 1
    `
  );

  return referenceCache.categoriaReceitaAso;
}

async function getCategoriaOutrosRecebimentos() {
  if (referenceCache.categoriaOutrosRecebimentos) {
    return referenceCache.categoriaOutrosRecebimentos;
  }

  referenceCache.categoriaOutrosRecebimentos = await get(
    `
      SELECT id, nome, tipo
      FROM categorias
      WHERE nome = 'Outros recebimentos'
        AND tipo = 'entrada'
      LIMIT 1
    `
  );

  return referenceCache.categoriaOutrosRecebimentos;
}

async function ajustarSaldoConta(contaId, delta) {
  await run(
    `
      UPDATE contas
      SET saldo_atual = ROUND(saldo_atual + ?, 2)
      WHERE id = ?
    `,
    [delta, contaId]
  );
}

async function resolveContaId(payloadContaId, formaPagamento) {
  if (formaPagamento === 'dinheiro') {
    const caixa = await getContaCaixa();
    return caixa?.id || payloadContaId;
  }

  if (formaPagamento === 'pix') {
    const sicoob = await getContaSicoob();
    return sicoob?.id || payloadContaId;
  }

  if (formaPagamento === 'sicoob') {
    const sicoob = await getContaSicoob();
    return sicoob?.id || payloadContaId;
  }

  if (formaPagamento === 'cresol') {
    const cresol = await getContaCresol();
    return cresol?.id || payloadContaId;
  }

  if (formaPagamento === 'banco_brasil') {
    const bancoDoBrasil = await getContaBancoDoBrasil();
    return bancoDoBrasil?.id || payloadContaId;
  }

  return payloadContaId;
}

function buildLimitOffsetClause(filters = {}, params = []) {
  const limit = Math.min(Math.max(Number(filters.limit || 0), 0), 500);
  const offset = Math.max(Number(filters.offset || 0), 0);

  if (!limit) {
    return '';
  }

  params.push(limit);

  if (offset) {
    params.push(offset);
    return ' LIMIT ? OFFSET ?';
  }

  return ' LIMIT ?';
}

async function findUserByCredentials(login, senha) {
  return get(
    `
      SELECT id, nome, login, perfil
      FROM usuarios
      WHERE login = ?
        AND senha = ?
    `,
    [login, senha]
  );
}

function buildLancamentosWhere(filters = {}) {
  const clauses = [];
  const params = [];

  if (!filters.includeOrigins) {
    clauses.push("COALESCE(l.origem_tipo, 'manual') = 'manual'");
  }

  if (filters.tipo) {
    clauses.push('l.tipo = ?');
    params.push(filters.tipo);
  }

  if (filters.contaId) {
    clauses.push('l.conta_id = ?');
    params.push(Number(filters.contaId));
  }

  if (filters.categoriaId) {
    clauses.push('l.categoria_id = ?');
    params.push(Number(filters.categoriaId));
  }

  if (filters.status) {
    clauses.push('l.status = ?');
    params.push(filters.status);
  }

  if (filters.dataInicio) {
    clauses.push('l.data >= ?');
    params.push(filters.dataInicio);
  }

  if (filters.dataFim) {
    clauses.push('l.data <= ?');
    params.push(filters.dataFim);
  }

  return {
    where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    params,
  };
}

async function listLancamentos(filters) {
  const { where, params } = buildLancamentosWhere(filters);
  const paginationClause = buildLimitOffsetClause(filters, params);

  return all(
    `
      SELECT
        l.id,
        l.tipo,
        l.valor,
        l.data,
        l.forma_pagamento,
        l.conta_id,
        c.nome AS conta_nome,
        l.categoria_id,
        cat.nome AS categoria_nome,
        l.descricao,
        l.recorrente,
        l.status,
        COALESCE(l.origem_tipo, 'manual') AS origem_tipo,
        l.origem_id
      FROM lancamentos l
      INNER JOIN contas c ON c.id = l.conta_id
      INNER JOIN categorias cat ON cat.id = l.categoria_id
      ${where}
      ORDER BY l.data DESC, l.id DESC
      ${paginationClause}
    `,
    params
  );
}

async function getLancamentoById(id) {
  return get(
    `
      SELECT
        l.id,
        l.tipo,
        l.valor,
        l.data,
        l.forma_pagamento,
        l.conta_id,
        c.nome AS conta_nome,
        l.categoria_id,
        cat.nome AS categoria_nome,
        l.descricao,
        l.recorrente,
        l.status,
        COALESCE(l.origem_tipo, 'manual') AS origem_tipo,
        l.origem_id
      FROM lancamentos l
      INNER JOIN contas c ON c.id = l.conta_id
      INNER JOIN categorias cat ON cat.id = l.categoria_id
      WHERE l.id = ?
    `,
    [id]
  );
}

async function createLancamento(payload) {
  const contaId = await resolveContaId(payload.conta_id, payload.forma_pagamento);
  const valor = Number(payload.valor);
  const recorrente = payload.recorrente ? 1 : 0;
  const result = await run(
    `
      INSERT INTO lancamentos (
        tipo,
        valor,
        data,
        forma_pagamento,
        conta_id,
        categoria_id,
        descricao,
        recorrente,
        status,
        conta_fixa_id,
        origem_tipo,
        origem_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.tipo,
      valor,
      payload.data,
      payload.forma_pagamento,
      contaId,
      payload.categoria_id,
      payload.descricao || null,
      recorrente,
      payload.status,
      payload.conta_fixa_id || null,
      payload.origem_tipo || 'manual',
      payload.origem_id || null,
    ]
  );

  if (payload.status === 'pago') {
    const delta = payload.tipo === 'entrada' ? valor : -valor;
    await ajustarSaldoConta(contaId, delta);
  }

  return getLancamentoById(result.lastID);
}

async function updateLancamento(id, payload) {
  const atual = await get('SELECT * FROM lancamentos WHERE id = ?', [id]);

  if (!atual) {
    return null;
  }

  if (atual.status === 'pago') {
    const deltaAnterior = atual.tipo === 'entrada' ? -Number(atual.valor) : Number(atual.valor);
    await ajustarSaldoConta(atual.conta_id, deltaAnterior);
  }

  const contaId = await resolveContaId(payload.conta_id, payload.forma_pagamento);

  await run(
    `
      UPDATE lancamentos
      SET tipo = ?,
          valor = ?,
          data = ?,
          forma_pagamento = ?,
          conta_id = ?,
          categoria_id = ?,
          descricao = ?,
          recorrente = ?,
          status = ?
      WHERE id = ?
    `,
    [
      payload.tipo,
      Number(payload.valor),
      payload.data,
      payload.forma_pagamento,
      contaId,
      payload.categoria_id,
      payload.descricao || null,
      payload.recorrente ? 1 : 0,
      payload.status,
      id,
    ]
  );

  if (payload.status === 'pago') {
    const deltaNovo = payload.tipo === 'entrada' ? Number(payload.valor) : -Number(payload.valor);
    await ajustarSaldoConta(contaId, deltaNovo);
  }

  return getLancamentoById(id);
}

async function deleteLancamento(id) {
  const lancamento = await get('SELECT * FROM lancamentos WHERE id = ?', [id]);

  if (!lancamento) {
    return false;
  }

  if (lancamento.status === 'pago') {
    const delta = lancamento.tipo === 'entrada' ? -Number(lancamento.valor) : Number(lancamento.valor);
    await ajustarSaldoConta(lancamento.conta_id, delta);
  }

  await run('DELETE FROM lancamentos WHERE id = ?', [id]);
  return true;
}

async function listCategorias(tipo) {
  if (tipo) {
    return all('SELECT * FROM categorias WHERE tipo = ? ORDER BY nome', [tipo]);
  }

  return all('SELECT * FROM categorias ORDER BY tipo, nome');
}

async function createCategoria(payload) {
  const result = await run(
    'INSERT INTO categorias (nome, tipo) VALUES (?, ?)',
    [payload.nome, payload.tipo]
  );
  invalidateCategoriaCache();

  return get('SELECT * FROM categorias WHERE id = ?', [result.lastID]);
}

async function updateCategoria(id, payload) {
  const result = await run(
    'UPDATE categorias SET nome = ?, tipo = ? WHERE id = ?',
    [payload.nome, payload.tipo, id]
  );

  if (!result.changes) {
    return null;
  }
  invalidateCategoriaCache();

  return get('SELECT * FROM categorias WHERE id = ?', [id]);
}

async function deleteCategoria(id) {
  const result = await run('DELETE FROM categorias WHERE id = ?', [id]);
  if (result.changes) {
    invalidateCategoriaCache();
  }
  return result.changes > 0;
}

async function listContas() {
  return all(`
    SELECT id, nome, saldo_atual, ativo
    FROM contas
    WHERE ativo = 1
    ORDER BY
      CASE LOWER(nome)
        WHEN 'caixa' THEN 1
        WHEN 'sicoob' THEN 2
        WHEN 'cresol' THEN 3
        WHEN 'banco do brasil' THEN 4
        ELSE 99
      END,
      nome
  `);
}

async function createConta(payload) {
  const result = await run(
    'INSERT INTO contas (nome, saldo_atual) VALUES (?, ?)',
    [payload.nome, Number(payload.saldo_atual || 0)]
  );
  invalidateContaCache();

  return get('SELECT * FROM contas WHERE id = ?', [result.lastID]);
}

async function updateConta(id, payload) {
  const atual = await get('SELECT id, nome, saldo_atual FROM contas WHERE id = ?', [id]);

  if (!atual) {
    return null;
  }

  const nome = payload.nome || atual.nome;
  const novoSaldo = Number(payload.saldo_atual);
  const saldoInformado = Number.isFinite(novoSaldo);

  await run(
    `
      UPDATE contas
      SET nome = ?,
          saldo_atual = ?
      WHERE id = ?
    `,
    [nome, saldoInformado ? novoSaldo : Number(atual.saldo_atual || 0), id]
  );

  if (saldoInformado && Number(atual.saldo_atual || 0) !== novoSaldo) {
    await run(
      `
        INSERT INTO conta_ajustes (conta_id, valor_anterior, valor_novo, observacao)
        VALUES (?, ?, ?, ?)
      `,
      [
        id,
        Number(atual.saldo_atual || 0),
        novoSaldo,
        payload.observacao || `Ajuste de saldo: de ${Number(atual.saldo_atual || 0).toFixed(2)} para ${novoSaldo.toFixed(2)}`,
      ]
    );
  }

  invalidateContaCache();
  return getContaById(id);
}

async function deleteConta(id) {
  const conta = await get('SELECT id, nome FROM contas WHERE id = ?', [id]);
  if (!conta) {
    return false;
  }

  const dependencias = await get(
    `
      SELECT
        (
          (SELECT COUNT(1) FROM lancamentos WHERE conta_id = ?)
          + (SELECT COUNT(1) FROM transferencias WHERE conta_origem_id = ? OR conta_destino_id = ?)
          + (SELECT COUNT(1) FROM contas_pagar WHERE conta_id = ?)
          + (SELECT COUNT(1) FROM aso_atendimentos WHERE conta_id = ?)
          + (SELECT COUNT(1) FROM conta_ajustes WHERE conta_id = ?)
          + (SELECT COUNT(1) FROM contas_fixas WHERE conta_id = ?)
        ) AS total
    `,
    [id, id, id, id, id, id, id]
  );

  if (Number(dependencias?.total || 0) > 0) {
    await run('UPDATE contas SET ativo = 0 WHERE id = ?', [id]);
    invalidateContaCache();
    return true;
  }

  const result = await run('DELETE FROM contas WHERE id = ?', [id]);
  if (result.changes) {
    invalidateContaCache();
  }
  return result.changes > 0;
}

async function listFornecedores() {
  return all(`
    SELECT id, razao_social, cnpj, contato_nome, telefone, categoria, ativo
    FROM fornecedores
    WHERE ativo = 1
    ORDER BY razao_social
  `);
}

async function getFornecedorById(id) {
  return get('SELECT * FROM fornecedores WHERE id = ?', [id]);
}

async function createFornecedor(payload) {
  const result = await run(
    `
      INSERT INTO fornecedores (razao_social, cnpj, contato_nome, telefone, categoria)
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      payload.razao_social,
      payload.cnpj || null,
      payload.contato_nome || null,
      payload.telefone || null,
      payload.categoria || null,
    ]
  );

  return getFornecedorById(result.lastID);
}

async function updateFornecedor(id, payload) {
  const result = await run(
    `
      UPDATE fornecedores
      SET razao_social = ?,
          cnpj = ?,
          contato_nome = ?,
          telefone = ?,
          categoria = ?
      WHERE id = ?
    `,
    [
      payload.razao_social,
      payload.cnpj || null,
      payload.contato_nome || null,
      payload.telefone || null,
      payload.categoria || null,
      id,
    ]
  );

  if (!result.changes) {
    return null;
  }

  return getFornecedorById(id);
}

async function deleteFornecedor(id) {
  const result = await run('UPDATE fornecedores SET ativo = 0 WHERE id = ?', [id]);
  return result.changes > 0;
}

async function listClientes() {
  return all('SELECT * FROM clientes ORDER BY nome');
}

async function getClienteById(id) {
  return get('SELECT * FROM clientes WHERE id = ?', [id]);
}

async function createCliente(payload) {
  const examesInclusosJson = payload.exames_inclusos_json ? JSON.stringify(payload.exames_inclusos_json) : null;
  const result = await run(
    `
      INSERT INTO clientes (nome, telefone, email, documento, aso_incluso, exames_incluso, exames_inclusos_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.nome,
      payload.telefone || null,
      payload.email || null,
      payload.documento || null,
      payload.aso_incluso ? 1 : 0,
      payload.exames_incluso ? 1 : 0,
      examesInclusosJson,
    ]
  );

  return get('SELECT * FROM clientes WHERE id = ?', [result.lastID]);
}

async function updateCliente(id, payload) {
  const examesInclusosJson = payload.exames_inclusos_json ? JSON.stringify(payload.exames_inclusos_json) : null;
  const result = await run(
    `
      UPDATE clientes
      SET nome = ?,
          telefone = ?,
          email = ?,
          documento = ?,
          aso_incluso = ?,
          exames_incluso = ?,
          exames_inclusos_json = ?
      WHERE id = ?
    `,
    [
      payload.nome,
      payload.telefone || null,
      payload.email || null,
      payload.documento || null,
      payload.aso_incluso ? 1 : 0,
      payload.exames_incluso ? 1 : 0,
      examesInclusosJson,
      id,
    ]
  );

  if (!result.changes) {
    return null;
  }

  return get('SELECT * FROM clientes WHERE id = ?', [id]);
}

async function deleteCliente(id) {
  const result = await run('DELETE FROM clientes WHERE id = ?', [id]);
  return result.changes > 0;
}

async function listAsoAtendimentos() {
  return all(
    `
      SELECT
        aso.*,
        cli.nome AS cliente_nome,
        conta.nome AS conta_nome
      FROM aso_atendimentos aso
      INNER JOIN clientes cli ON cli.id = aso.cliente_id
      LEFT JOIN contas conta ON conta.id = aso.conta_id
      ORDER BY aso.data DESC, aso.id DESC
    `
  );
}

async function getAsoById(id) {
  return get(
    `
      SELECT
        aso.*,
        cli.nome AS cliente_nome,
        conta.nome AS conta_nome
      FROM aso_atendimentos aso
      INNER JOIN clientes cli ON cli.id = aso.cliente_id
      LEFT JOIN contas conta ON conta.id = aso.conta_id
      WHERE aso.id = ?
    `,
    [id]
  );
}

function parseExamesJson(examesJson) {
  if (!examesJson) {
    return [];
  }

  if (Array.isArray(examesJson)) {
    return examesJson;
  }

  try {
    return JSON.parse(examesJson);
  } catch (error) {
    return [];
  }
}

function groupPaidExames(exames = []) {
  const grouped = new Map();

  exames
    .filter((item) => item.realizado && item.pago && Number(item.valor || 0) > 0)
    .forEach((item) => {
      const key = `${item.forma_pagamento || ''}:${item.conta_id || ''}`;
      const current = grouped.get(key) || {
        valor: 0,
        forma_pagamento: item.forma_pagamento || null,
        conta_id: item.conta_id ? Number(item.conta_id) : null,
        nomes: [],
      };

      current.valor += Number(item.valor || 0);
      current.nomes.push(item.nome);
      grouped.set(key, current);
    });

  return [...grouped.values()];
}

function getOutstandingExamTotal(exames = []) {
  return exames
    .filter((item) => item.realizado && !item.incluso && !item.pago && Number(item.valor || 0) > 0)
    .reduce((sum, item) => sum + Number(item.valor || 0), 0);
}

async function deleteAsoLinkedLancamentos(asoId) {
  const relacionados = await all(
    `
      SELECT id, conta_id, tipo, valor, status
      FROM lancamentos
      WHERE origem_id = ?
        AND origem_tipo IN ('aso', 'aso_exame')
    `,
    [asoId]
  );

  if (!relacionados.length) {
    return;
  }

  const saldoPorConta = new Map();

  for (const item of relacionados) {
    if (item.status !== 'pago') {
      continue;
    }

    const delta = item.tipo === 'entrada' ? -Number(item.valor) : Number(item.valor);
    saldoPorConta.set(item.conta_id, (saldoPorConta.get(item.conta_id) || 0) + delta);
  }

  const ids = relacionados.map((item) => item.id);
  await run(`DELETE FROM lancamentos WHERE id IN (${ids.map(() => '?').join(', ')})`, ids);

  for (const [contaId, delta] of saldoPorConta.entries()) {
    await ajustarSaldoConta(contaId, delta);
  }
}

async function recreateAsoPaidLancamentos(asoId, payload) {
  const categoria = await getCategoriaReceitaAso();
  const contaPrincipal = payload.forma_pagamento
    ? await resolveContaId(payload.conta_id || null, payload.forma_pagamento)
    : null;
  let principalLancamentoId = null;

  if (!payload.aso_incluso && payload.status === 'pago' && Number(payload.valor_aso || 0) > 0 && payload.forma_pagamento && contaPrincipal) {
    const principal = await createLancamento({
      tipo: 'entrada',
      valor: Number(payload.valor_aso),
      data: payload.compensado_em || payload.data,
      forma_pagamento: payload.forma_pagamento,
      conta_id: contaPrincipal,
      categoria_id: categoria.id,
      descricao: `ASO - ${payload.funcionario_nome}`,
      recorrente: false,
      status: 'pago',
      origem_tipo: 'aso',
      origem_id: asoId,
    });
    principalLancamentoId = principal.id;
  }

  const gruposExames = groupPaidExames(payload.exames_json || []);

  for (const grupo of gruposExames) {
    const contaGrupoId = grupo.forma_pagamento
      ? await resolveContaId(grupo.conta_id || null, grupo.forma_pagamento)
      : null;

    if (!grupo.forma_pagamento || !contaGrupoId || !grupo.valor) {
      continue;
    }

    await createLancamento({
      tipo: 'entrada',
      valor: grupo.valor,
      data: payload.compensado_em || payload.data,
      forma_pagamento: grupo.forma_pagamento,
      conta_id: contaGrupoId,
      categoria_id: categoria.id,
      descricao: `Exames ASO - ${payload.funcionario_nome} (${grupo.nomes.join(', ')})`,
      recorrente: false,
      status: 'pago',
      origem_tipo: 'aso_exame',
      origem_id: asoId,
    });
  }

  return principalLancamentoId;
}

async function createAsoAtendimento(payload) {
  const examesJsonList = parseExamesJson(payload.exames_json);
  const examesJson = examesJsonList.length ? JSON.stringify(examesJsonList) : null;
  const hasPendingPrincipal = !payload.aso_incluso && payload.status !== 'pago' && Number(payload.valor_aso || 0) > 0;
  const hasPendingExams = getOutstandingExamTotal(examesJsonList) > 0;
  const status = hasPendingPrincipal || hasPendingExams ? 'pendente' : 'pago';
  const valorAso = payload.aso_incluso ? null : Number(payload.valor_aso || 0);
  const valorExames = Number(payload.valor_exames || 0);

  const result = await run(
    `
      INSERT INTO aso_atendimentos (
        data,
        cidade,
        cliente_id,
        funcionario_nome,
        tipo_aso,
        exames_complementares,
        exames_json,
        valor_aso,
        valor_exames,
        categoria_cobranca,
        forma_pagamento,
        conta_id,
        status,
        aso_incluso,
        exames_incluso
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.data,
      payload.cidade,
      payload.cliente_id,
      payload.funcionario_nome,
      payload.tipo_aso,
      payload.exames_complementares ? 1 : 0,
      examesJson,
      valorAso,
      valorExames,
      payload.categoria_cobranca || null,
      payload.forma_pagamento || null,
      payload.conta_id || null,
      status,
      payload.aso_incluso ? 1 : 0,
      payload.exames_incluso ? 1 : 0,
    ]
  );

  const asoId = result.lastID;
  const lancamentoId = await recreateAsoPaidLancamentos(asoId, {
    ...payload,
    id: asoId,
    status,
    valor_aso: Number(valorAso || 0),
    exames_json: examesJsonList,
  });

  if (lancamentoId) {
    await run('UPDATE aso_atendimentos SET lancamento_id = ? WHERE id = ?', [lancamentoId, asoId]);
  }

  return getAsoById(asoId);
}

async function updateAsoAtendimento(id, payload) {
  const atual = await get('SELECT * FROM aso_atendimentos WHERE id = ?', [id]);

  if (!atual) {
    return null;
  }

  const examesJsonList = parseExamesJson(payload.exames_json);
  const examesJson = examesJsonList.length ? JSON.stringify(examesJsonList) : null;
  const hasPendingPrincipal = !payload.aso_incluso && payload.status !== 'pago' && Number(payload.valor_aso || 0) > 0;
  const hasPendingExams = getOutstandingExamTotal(examesJsonList) > 0;
  const status = hasPendingPrincipal || hasPendingExams ? 'pendente' : 'pago';
  const valorAso = payload.aso_incluso ? null : Number(payload.valor_aso || 0);
  const valorExames = Number(payload.valor_exames || 0);
  await run('UPDATE aso_atendimentos SET lancamento_id = NULL WHERE id = ?', [id]);
  await deleteAsoLinkedLancamentos(id);
  const lancamentoId = await recreateAsoPaidLancamentos(id, {
    ...payload,
    id,
    status,
    valor_aso: Number(valorAso || 0),
    exames_json: examesJsonList,
  });

  await run(
    `
      UPDATE aso_atendimentos
      SET data = ?,
          cidade = ?,
          cliente_id = ?,
          funcionario_nome = ?,
          tipo_aso = ?,
          exames_complementares = ?,
          exames_json = ?,
          valor_aso = ?,
          valor_exames = ?,
          categoria_cobranca = ?,
          forma_pagamento = ?,
          conta_id = ?,
          status = ?,
          aso_incluso = ?,
          exames_incluso = ?,
          lancamento_id = ?
      WHERE id = ?
    `,
    [
      payload.data,
      payload.cidade,
      payload.cliente_id,
      payload.funcionario_nome,
      payload.tipo_aso,
      payload.exames_complementares ? 1 : 0,
      examesJson,
      valorAso,
      valorExames,
      payload.categoria_cobranca || null,
      payload.forma_pagamento || null,
      payload.conta_id || null,
      status,
      payload.aso_incluso ? 1 : 0,
      payload.exames_incluso ? 1 : 0,
      lancamentoId,
      id,
    ]
  );

  return getAsoById(id);
}

async function deleteAsoAtendimento(id) {
  const aso = await get('SELECT * FROM aso_atendimentos WHERE id = ?', [id]);

  if (!aso) {
    return false;
  }

  const result = await run('DELETE FROM aso_atendimentos WHERE id = ?', [id]);
  await deleteAsoLinkedLancamentos(id);
  return result.changes > 0;
}

async function listTransferencias() {
  return all(
    `
      SELECT
        t.id,
        t.valor,
        t.data,
        t.descricao,
        t.conta_origem_id,
        origem.nome AS conta_origem_nome,
        t.conta_destino_id,
        destino.nome AS conta_destino_nome
      FROM transferencias t
      INNER JOIN contas origem ON origem.id = t.conta_origem_id
      INNER JOIN contas destino ON destino.id = t.conta_destino_id
      ORDER BY t.data DESC, t.id DESC
    `
  );
}

async function createTransferencia(payload) {
  const valor = Number(payload.valor);
  const result = await run(
    `
      INSERT INTO transferencias (
        conta_origem_id,
        conta_destino_id,
        valor,
        data,
        descricao
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      payload.conta_origem_id,
      payload.conta_destino_id,
      valor,
      payload.data,
      payload.descricao || null,
    ]
  );

  await ajustarSaldoConta(payload.conta_origem_id, -valor);
  await ajustarSaldoConta(payload.conta_destino_id, valor);

  return get(
    `
      SELECT
        t.id,
        t.valor,
        t.data,
        t.descricao,
        t.conta_origem_id,
        origem.nome AS conta_origem_nome,
        t.conta_destino_id,
        destino.nome AS conta_destino_nome
      FROM transferencias t
      INNER JOIN contas origem ON origem.id = t.conta_origem_id
      INNER JOIN contas destino ON destino.id = t.conta_destino_id
      WHERE t.id = ?
    `,
    [result.lastID]
  );
}

async function listContasFixas() {
  return all(
    `
      SELECT
        cf.id,
        cf.descricao,
        cf.valor,
        cf.tipo,
        cf.forma_pagamento,
        cf.frequencia,
        cf.proxima_data,
        cf.status,
        cf.ativo,
        cf.categoria_id,
        cat.nome AS categoria_nome,
        cf.conta_id,
        conta.nome AS conta_nome
      FROM contas_fixas cf
      INNER JOIN categorias cat ON cat.id = cf.categoria_id
      INNER JOIN contas conta ON conta.id = cf.conta_id
      ORDER BY cf.proxima_data ASC, cf.id DESC
    `
  );
}

async function createContaFixa(payload) {
  const result = await run(
    `
      INSERT INTO contas_fixas (
        descricao,
        valor,
        tipo,
        categoria_id,
        conta_id,
        forma_pagamento,
        frequencia,
        proxima_data,
        status,
        ativo
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `,
    [
      payload.descricao,
      Number(payload.valor),
      payload.tipo,
      payload.categoria_id,
      payload.conta_id,
      payload.forma_pagamento,
      payload.frequencia,
      payload.proxima_data,
      payload.status,
    ]
  );

  return get(
    `
      SELECT
        cf.*,
        cat.nome AS categoria_nome,
        conta.nome AS conta_nome
      FROM contas_fixas cf
      INNER JOIN categorias cat ON cat.id = cf.categoria_id
      INNER JOIN contas conta ON conta.id = cf.conta_id
      WHERE cf.id = ?
    `,
    [result.lastID]
  );
}

async function listContasPagar() {
  return all(
    `
      SELECT
        cp.id,
        cp.descricao,
        cp.tipo,
        cp.valor,
        cp.total_parcelas,
        cp.parcela_atual,
        cp.forma_pagamento,
        cp.fornecedor,
        cp.fornecedor_id,
        cp.data_vencimento,
        cp.status,
        cp.categoria_id,
        cat.nome AS categoria_nome,
        cp.conta_id,
        conta.nome AS conta_nome,
        forn.razao_social AS fornecedor_nome
      FROM contas_pagar cp
      INNER JOIN categorias cat ON cat.id = cp.categoria_id
      LEFT JOIN contas conta ON conta.id = cp.conta_id
      LEFT JOIN fornecedores forn ON forn.id = cp.fornecedor_id
      ORDER BY cp.data_vencimento ASC, cp.id DESC
    `
  );
}

async function getContaPagarById(id) {
  return get(
    `
      SELECT
        cp.*,
        cat.nome AS categoria_nome,
        conta.nome AS conta_nome,
        forn.razao_social AS fornecedor_nome
      FROM contas_pagar cp
      INNER JOIN categorias cat ON cat.id = cp.categoria_id
      LEFT JOIN contas conta ON conta.id = cp.conta_id
      LEFT JOIN fornecedores forn ON forn.id = cp.fornecedor_id
      WHERE cp.id = ?
    `,
    [id]
  );
}

async function createContaPagar(payload) {
  const totalParcelas = Math.max(Number(payload.total_parcelas || 1), 1);
  const parcelaInicial = Math.min(Math.max(Number(payload.parcela_atual || 1), 1), totalParcelas);
  const registros = [];

  for (let parcela = parcelaInicial; parcela <= totalParcelas; parcela += 1) {
    const dataVencimento = payload.tipo === 'parcelada'
      ? addMonths(payload.data_vencimento, parcela - parcelaInicial)
      : payload.data_vencimento;

    const result = await run(
      `
        INSERT INTO contas_pagar (
          descricao,
          tipo,
          valor,
          total_parcelas,
          parcela_atual,
          categoria_id,
          conta_id,
          cliente_id,
          forma_pagamento,
          fornecedor_id,
          fornecedor,
          data_vencimento,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payload.descricao,
        payload.tipo,
        Number(payload.valor),
        totalParcelas,
        parcela,
        payload.categoria_id,
        null,
        null,
        null,
        payload.fornecedor_id || null,
        payload.fornecedor || null,
        dataVencimento,
        payload.status || 'pendente',
      ]
    );

    registros.push(result.lastID);
  }

  return all(
    `
      SELECT
        cp.*,
        cat.nome AS categoria_nome,
        conta.nome AS conta_nome,
        forn.razao_social AS fornecedor_nome
      FROM contas_pagar cp
      INNER JOIN categorias cat ON cat.id = cp.categoria_id
      LEFT JOIN contas conta ON conta.id = cp.conta_id
      LEFT JOIN fornecedores forn ON forn.id = cp.fornecedor_id
      WHERE cp.id IN (${registros.map(() => '?').join(', ')})
      ORDER BY cp.parcela_atual ASC
    `,
    registros
  );
}

async function updateContaPagar(id, payload) {
  const atual = await get('SELECT * FROM contas_pagar WHERE id = ?', [id]);

  if (!atual) {
    return null;
  }

  const contaId = payload.forma_pagamento ? await resolveContaId(payload.conta_id || null, payload.forma_pagamento) : null;
  let lancamentoId = atual.lancamento_id || null;

  if (lancamentoId && payload.status === 'pago') {
    await updateLancamento(lancamentoId, {
      tipo: 'saida',
      valor: Number(payload.valor),
      data: payload.data_vencimento,
      forma_pagamento: payload.forma_pagamento,
      conta_id: contaId,
      categoria_id: payload.categoria_id,
      descricao: payload.descricao,
      recorrente: false,
      status: 'pago',
    });
  } else if (lancamentoId && payload.status !== 'pago') {
    await deleteLancamento(lancamentoId);
    lancamentoId = null;
  } else if (!lancamentoId && payload.status === 'pago') {
    const novoLancamento = await createLancamento({
      tipo: 'saida',
      valor: Number(payload.valor),
      data: payload.data_vencimento,
      forma_pagamento: payload.forma_pagamento,
      conta_id: contaId,
      categoria_id: payload.categoria_id,
      descricao: payload.descricao,
      recorrente: false,
      status: 'pago',
    });
    lancamentoId = novoLancamento.id;
  }

  await run(
    `
      UPDATE contas_pagar
      SET descricao = ?,
          tipo = ?,
          valor = ?,
          total_parcelas = ?,
          parcela_atual = ?,
          categoria_id = ?,
          conta_id = ?,
          cliente_id = ?,
          forma_pagamento = ?,
          fornecedor_id = ?,
          fornecedor = ?,
          data_vencimento = ?,
          status = ?,
          lancamento_id = ?
      WHERE id = ?
    `,
    [
      payload.descricao,
      payload.tipo,
      Number(payload.valor),
      Number(payload.total_parcelas || 1),
      Number(payload.parcela_atual || 1),
      payload.categoria_id,
      contaId,
      null,
      payload.forma_pagamento || null,
      payload.fornecedor_id || null,
      payload.fornecedor || null,
      payload.data_vencimento,
      payload.status || 'pendente',
      lancamentoId,
      id,
    ]
  );

  return getContaPagarById(id);
}

async function deleteContaPagar(id) {
  const contaPagar = await get('SELECT lancamento_id FROM contas_pagar WHERE id = ?', [id]);

  if (contaPagar?.lancamento_id) {
    await deleteLancamento(contaPagar.lancamento_id);
  }

  const result = await run('DELETE FROM contas_pagar WHERE id = ?', [id]);
  return result.changes > 0;
}

async function listCobrancas() {
  return all(
    `
      SELECT
        c.id,
        c.cliente_id,
        cli.nome AS cliente_nome,
        c.descricao,
        c.valor,
        c.data_emissao,
        c.data_vencimento,
        c.status,
        c.compensado_em,
        c.observacao,
        c.lancamento_id
      FROM cobrancas c
      INNER JOIN clientes cli ON cli.id = c.cliente_id
      ORDER BY c.data_vencimento ASC, c.id DESC
    `
  );
}

async function getCobrancaById(id) {
  return get(
    `
      SELECT
        c.*,
        cli.nome AS cliente_nome
      FROM cobrancas c
      INNER JOIN clientes cli ON cli.id = c.cliente_id
      WHERE c.id = ?
    `,
    [id]
  );
}

async function createCobranca(payload) {
  const result = await run(
    `
      INSERT INTO cobrancas (
        cliente_id,
        descricao,
        valor,
        data_emissao,
        data_vencimento,
        status,
        compensado_em,
        observacao,
        lancamento_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.cliente_id,
      payload.descricao,
      Number(payload.valor),
      payload.data_emissao,
      payload.data_vencimento,
      payload.status || 'pendente',
      payload.compensado_em || null,
      payload.observacao || null,
      payload.lancamento_id || null,
    ]
  );

  return getCobrancaById(result.lastID);
}

async function updateCobranca(id, payload) {
  const atual = await get('SELECT * FROM cobrancas WHERE id = ?', [id]);

  if (!atual) {
    return null;
  }

  await run(
    `
      UPDATE cobrancas
      SET cliente_id = ?,
          descricao = ?,
          valor = ?,
          data_emissao = ?,
          data_vencimento = ?,
          observacao = ?
      WHERE id = ?
    `,
    [
      payload.cliente_id,
      payload.descricao,
      Number(payload.valor),
      payload.data_emissao,
      payload.data_vencimento,
      payload.observacao || null,
      id,
    ]
  );

  return getCobrancaById(id);
}

async function deleteCobranca(id) {
  const cobranca = await get('SELECT lancamento_id FROM cobrancas WHERE id = ?', [id]);

  if (cobranca?.lancamento_id) {
    await deleteLancamento(cobranca.lancamento_id);
  }

  const result = await run('DELETE FROM cobrancas WHERE id = ?', [id]);
  return result.changes > 0;
}

async function compensateCobranca(id, payload = {}) {
  const cobranca = await get('SELECT * FROM cobrancas WHERE id = ?', [id]);

  if (!cobranca) {
    return null;
  }

  if (cobranca.status === 'pago') {
    return getCobrancaById(id);
  }

  const categoria = await getCategoriaOutrosRecebimentos();
  const dataCompensacao = payload.data_compensacao || cobranca.data_vencimento;
  const contaFinalId = payload.conta_id ? Number(payload.conta_id) : (await getContaSicoob())?.id || null;

  const lancamento = await createLancamento({
    tipo: 'entrada',
    valor: Number(cobranca.valor),
    data: dataCompensacao,
    forma_pagamento: 'boleto',
    conta_id: contaFinalId,
    categoria_id: categoria.id,
    descricao: `Boleto compensado - ${cobranca.descricao}`,
    recorrente: false,
    status: 'pago',
    origem_tipo: 'cobranca',
    origem_id: id,
  });

  await run(
    `
      UPDATE cobrancas
      SET status = 'pago',
          compensado_em = ?,
          lancamento_id = ?
      WHERE id = ?
    `,
    [dataCompensacao, lancamento.id, id]
  );

  return getCobrancaById(id);
}

async function generateRecurringLaunches(referenceDate) {
  const dueItems = await all(
    `
      SELECT *
      FROM contas_fixas
      WHERE ativo = 1
        AND proxima_data <= ?
      ORDER BY proxima_data ASC
    `,
    [referenceDate]
  );

  let generated = 0;

  for (const item of dueItems) {
    let nextDate = item.proxima_data;

    while (nextDate <= referenceDate) {
      await createLancamento({
        tipo: item.tipo,
        valor: item.valor,
        data: nextDate,
        forma_pagamento: item.forma_pagamento,
        conta_id: item.conta_id,
        categoria_id: item.categoria_id,
        descricao: item.descricao,
        recorrente: true,
        status: item.status,
        conta_fixa_id: item.id,
      });

      generated += 1;
      nextDate = addFrequency(nextDate, item.frequencia);
    }

    await run(
      `
        UPDATE contas_fixas
        SET proxima_data = ?
        WHERE id = ?
      `,
      [nextDate, item.id]
    );
  }

  return { generated };
}

async function compensateLancamento(id, dataCompensacao, formaPagamento, contaId) {
  const lancamento = await get('SELECT * FROM lancamentos WHERE id = ?', [id]);

  if (!lancamento) {
    return null;
  }

  if (lancamento.status === 'pago') {
    return getLancamentoById(id);
  }

  const formaPagamentoFinal = formaPagamento || lancamento.forma_pagamento;
  const contaBaseId = contaId || lancamento.conta_id || null;
  const contaFinalId = formaPagamentoFinal
    ? await resolveContaId(contaBaseId, formaPagamentoFinal)
    : contaBaseId;
  const delta = lancamento.tipo === 'entrada' ? Number(lancamento.valor) : -Number(lancamento.valor);

  await ajustarSaldoConta(contaFinalId, delta);
  await run(
    `
      UPDATE lancamentos
      SET status = 'pago',
          compensado_em = ?,
          forma_pagamento = ?,
          conta_id = ?
      WHERE id = ?
    `,
    [dataCompensacao || lancamento.data, formaPagamentoFinal, contaFinalId, id]
  );

  return getLancamentoById(id);
}

async function compensateContaPagar(id, payload = {}) {
  const contaPagar = await get('SELECT * FROM contas_pagar WHERE id = ?', [id]);

  if (!contaPagar) {
    return null;
  }

  if (contaPagar.status === 'pago') {
    return get(
      `
        SELECT cp.*, cat.nome AS categoria_nome, conta.nome AS conta_nome
        FROM contas_pagar cp
        INNER JOIN categorias cat ON cat.id = cp.categoria_id
        INNER JOIN contas conta ON conta.id = cp.conta_id
        WHERE cp.id = ?
      `,
      [id]
    );
  }

  const formaPagamento = payload.forma_pagamento || contaPagar.forma_pagamento;
  const contaFinalId = await resolveContaId(payload.conta_id || contaPagar.conta_id, formaPagamento);
  const lancamento = await createLancamento({
    tipo: 'saida',
    valor: contaPagar.valor,
    data: payload.data_compensacao || contaPagar.data_vencimento,
    forma_pagamento: formaPagamento,
    conta_id: contaFinalId,
    categoria_id: contaPagar.categoria_id,
    descricao: contaPagar.descricao,
    recorrente: false,
    status: 'pago',
  });

  await run(
    `
      UPDATE contas_pagar
      SET status = 'pago',
          compensado_em = ?,
          forma_pagamento = ?,
          conta_id = ?,
          lancamento_id = ?
      WHERE id = ?
    `,
    [payload.data_compensacao || contaPagar.data_vencimento, formaPagamento, contaFinalId, lancamento.id, id]
  );

  return get(
    `
      SELECT cp.*, cat.nome AS categoria_nome, conta.nome AS conta_nome
      FROM contas_pagar cp
      INNER JOIN categorias cat ON cat.id = cp.categoria_id
      INNER JOIN contas conta ON conta.id = cp.conta_id
      WHERE cp.id = ?
    `,
    [id]
  );
}

async function compensateAsoAtendimento(id, payload = {}) {
  const aso = await get('SELECT * FROM aso_atendimentos WHERE id = ?', [id]);

  if (!aso) {
    return null;
  }

  const exames = parseExamesJson(aso.exames_json);
  const formaPagamento = payload.forma_pagamento || null;
  const contaId = payload.conta_id ? Number(payload.conta_id) : null;
  const compensadoEm = payload.data_compensacao || aso.data;

  const unpaidPrincipal = !aso.aso_incluso && aso.status !== 'pago' ? Number(aso.valor_aso || 0) : 0;
  const updatedExames = exames.map((item) => {
    if (item.realizado && !item.incluso && !item.pago && Number(item.valor || 0) > 0) {
      return {
        ...item,
        pago: true,
        forma_pagamento: formaPagamento,
        conta_id: formaPagamento === 'dinheiro' ? null : contaId,
      };
    }

    return item;
  });

  await run('UPDATE aso_atendimentos SET lancamento_id = NULL WHERE id = ?', [id]);
  await deleteAsoLinkedLancamentos(id);

  const lancamentoId = await recreateAsoPaidLancamentos(id, {
    ...aso,
    forma_pagamento: unpaidPrincipal > 0 ? formaPagamento : aso.forma_pagamento,
    conta_id: unpaidPrincipal > 0 ? contaId : aso.conta_id,
    valor_aso: Number(aso.valor_aso || 0),
    status: 'pago',
    compensado_em: compensadoEm,
    exames_json: updatedExames,
  });

  await run(
    `
      UPDATE aso_atendimentos
      SET status = 'pago',
          compensado_em = ?,
          forma_pagamento = ?,
          conta_id = ?,
          exames_json = ?,
          lancamento_id = ?
      WHERE id = ?
    `,
    [
      compensadoEm,
      unpaidPrincipal > 0 ? formaPagamento : aso.forma_pagamento,
      unpaidPrincipal > 0 ? contaId : aso.conta_id,
      JSON.stringify(updatedExames),
      lancamentoId,
      id,
    ]
  );

  return getAsoById(id);
}

async function listPendenciasCompensacao() {
  const [lancamentos, contasPagar, asos, cobrancas] = await Promise.all([
    all(
      `
        SELECT
          l.id,
          CASE
            WHEN COALESCE(l.origem_tipo, 'manual') = 'manual' THEN 'lancamento'
            ELSE COALESCE(l.origem_tipo, 'manual')
          END AS origem,
          l.tipo,
          l.valor,
          l.data,
          l.descricao,
          l.status,
          NULL AS cliente_nome,
          NULL AS categoria_referencia
        FROM lancamentos l
        WHERE l.status = 'pendente'
          AND COALESCE(l.origem_tipo, 'manual') = 'manual'
        ORDER BY l.data ASC, l.id DESC
      `
    ),
    all(
      `
        SELECT
          cp.id,
          'conta_pagar' AS origem,
          'saida' AS tipo,
          cp.valor,
          cp.data_vencimento AS data,
          cp.descricao,
          cp.status,
          cli.nome AS cliente_nome,
          cat.nome AS categoria_referencia
        FROM contas_pagar cp
        LEFT JOIN clientes cli ON cli.id = cp.cliente_id
        INNER JOIN categorias cat ON cat.id = cp.categoria_id
        WHERE cp.status = 'pendente'
        ORDER BY cp.data_vencimento ASC, cp.id DESC
      `
    ),
    all(
      `
        SELECT
          aso.id,
          aso.data,
          aso.funcionario_nome,
          aso.valor_aso,
          aso.exames_json,
          aso.aso_incluso,
          aso.status,
          cli.nome AS cliente_nome,
          aso.categoria_cobranca AS categoria_referencia
        FROM aso_atendimentos aso
        INNER JOIN clientes cli ON cli.id = aso.cliente_id
        WHERE aso.status = 'pendente'
        ORDER BY aso.data ASC, aso.id DESC
      `
    ),
    all(
      `
        SELECT
          c.id,
          'cobranca' AS origem,
          'entrada' AS tipo,
          c.valor,
          c.data_vencimento AS data,
          c.descricao,
          c.status,
          cli.nome AS cliente_nome,
          'Boleto' AS categoria_referencia
        FROM cobrancas c
        INNER JOIN clientes cli ON cli.id = c.cliente_id
        WHERE c.status = 'pendente'
        ORDER BY c.data_vencimento ASC, c.id DESC
      `
    ),
  ]);

  const pendenciasAsos = asos
    .map((item) => {
      const exames = parseExamesJson(item.exames_json);
      const valorPendente = (!item.aso_incluso ? Number(item.valor_aso || 0) : 0) + getOutstandingExamTotal(exames);

      if (valorPendente <= 0) {
        return null;
      }

      return {
        id: item.id,
        origem: 'aso',
        tipo: 'entrada',
        valor: valorPendente,
        data: item.data,
        descricao: `ASO - ${item.funcionario_nome}`,
        status: item.status,
        cliente_nome: item.cliente_nome,
        categoria_referencia: item.categoria_referencia,
      };
    })
    .filter(Boolean);

  return [...lancamentos, ...contasPagar, ...pendenciasAsos, ...cobrancas].sort((a, b) => a.data.localeCompare(b.data));
}

async function getMovimentacoesConta(contaId) {
  const [lancamentos, transferenciasSaida, transferenciasEntrada, ajustes] = await Promise.all([
    all(
      `
        SELECT
          id,
          COALESCE(compensado_em, data) AS data_movimento,
          descricao,
          tipo,
          valor,
          status,
          'lancamento' AS origem
        FROM lancamentos
        WHERE conta_id = ?
        ORDER BY COALESCE(compensado_em, data) DESC, id DESC
      `,
      [contaId]
    ),
    all(
      `
        SELECT
          id,
          data AS data_movimento,
          COALESCE(descricao, 'Transferencia enviada') AS descricao,
          'saida' AS tipo,
          valor,
          'pago' AS status,
          'transferencia' AS origem
        FROM transferencias
        WHERE conta_origem_id = ?
      `,
      [contaId]
    ),
    all(
      `
        SELECT
          id,
          data AS data_movimento,
          COALESCE(descricao, 'Transferencia recebida') AS descricao,
          'entrada' AS tipo,
          valor,
          'pago' AS status,
          'transferencia' AS origem
        FROM transferencias
        WHERE conta_destino_id = ?
      `,
      [contaId]
    ),
    all(
      `
        SELECT
          id,
          criado_em AS data_movimento,
          COALESCE(observacao, 'Ajuste de caixa') AS descricao,
          CASE WHEN valor_novo >= valor_anterior THEN 'entrada' ELSE 'saida' END AS tipo,
          ABS(valor_novo - valor_anterior) AS valor,
          'pago' AS status,
          'ajuste de caixa' AS origem
        FROM conta_ajustes
        WHERE conta_id = ?
      `,
      [contaId]
    ),
  ]);

  return [...lancamentos, ...transferenciasSaida, ...transferenciasEntrada, ...ajustes]
    .sort((a, b) => String(b.data_movimento).localeCompare(String(a.data_movimento)) || b.id - a.id);
}

async function getMovimentacoesContaPaginadas(contaId, filters = {}) {
  const params = [
    contaId,
    ...(filters.dataInicio ? [filters.dataInicio] : []),
    ...(filters.dataFim ? [filters.dataFim] : []),
    contaId,
    ...(filters.dataInicio ? [filters.dataInicio] : []),
    ...(filters.dataFim ? [filters.dataFim] : []),
    contaId,
    ...(filters.dataInicio ? [filters.dataInicio] : []),
    ...(filters.dataFim ? [filters.dataFim] : []),
    contaId,
    ...(filters.dataInicio ? [filters.dataInicio] : []),
    ...(filters.dataFim ? [filters.dataFim] : []),
  ];
  const limit = Math.min(Math.max(Number(filters.limit || 0), 0), 500);
  const offset = Math.max(Number(filters.offset || 0), 0);

  if (limit) {
    params.push(limit);
    if (offset) {
      params.push(offset);
    }
  }

  return all(
    `
      SELECT *
      FROM (
        SELECT
          id,
          COALESCE(compensado_em, data) AS data_movimento,
          descricao,
          tipo,
          valor,
          status,
          'lancamento' AS origem
        FROM lancamentos
        WHERE conta_id = ?
          ${filters.dataInicio ? 'AND COALESCE(compensado_em, data) >= ?' : ''}
          ${filters.dataFim ? 'AND COALESCE(compensado_em, data) <= ?' : ''}

        UNION ALL

        SELECT
          id,
          data AS data_movimento,
          COALESCE(descricao, 'Transferencia enviada') AS descricao,
          'saida' AS tipo,
          valor,
          'pago' AS status,
          'transferencia' AS origem
        FROM transferencias
        WHERE conta_origem_id = ?
          ${filters.dataInicio ? 'AND data >= ?' : ''}
          ${filters.dataFim ? 'AND data <= ?' : ''}

        UNION ALL

        SELECT
          id,
          data AS data_movimento,
          COALESCE(descricao, 'Transferencia recebida') AS descricao,
          'entrada' AS tipo,
          valor,
          'pago' AS status,
          'transferencia' AS origem
        FROM transferencias
        WHERE conta_destino_id = ?
          ${filters.dataInicio ? 'AND data >= ?' : ''}
          ${filters.dataFim ? 'AND data <= ?' : ''}

        UNION ALL

        SELECT
          id,
          criado_em AS data_movimento,
          COALESCE(observacao, 'Ajuste de caixa') AS descricao,
          CASE WHEN valor_novo >= valor_anterior THEN 'entrada' ELSE 'saida' END AS tipo,
          ABS(valor_novo - valor_anterior) AS valor,
          'pago' AS status,
          'ajuste de caixa' AS origem
        FROM conta_ajustes
        WHERE conta_id = ?
          ${filters.dataInicio ? 'AND substr(criado_em, 1, 10) >= ?' : ''}
          ${filters.dataFim ? 'AND substr(criado_em, 1, 10) <= ?' : ''}
      ) movimentos
      ORDER BY data_movimento DESC, id DESC
      ${limit ? (offset ? 'LIMIT ? OFFSET ?' : 'LIMIT ?') : ''}
    `,
    params
  );
}

async function getDashboard(periodoInicio, periodoFim) {
  const [resumoContas, totais, pendentes, saldosPorConta, ultimosLancamentos] = await Promise.all([
    get(
      `
        SELECT
          ROUND(COALESCE(SUM(saldo_atual), 0), 2) AS saldo_total
        FROM contas
        WHERE ativo = 1
      `
    ),
    get(
      `
        SELECT
          ROUND(COALESCE(SUM(CASE WHEN tipo = 'entrada' AND status = 'pago' THEN valor ELSE 0 END), 0), 2) AS entradas_mes,
          ROUND(COALESCE(SUM(CASE WHEN tipo = 'saida' AND status = 'pago' THEN valor ELSE 0 END), 0), 2) AS saidas_mes
        FROM lancamentos
        WHERE COALESCE(compensado_em, data) BETWEEN ? AND ?
      `,
      [periodoInicio, periodoFim]
    ),
    get(
      `
        SELECT
          ROUND(COALESCE(SUM(valor), 0), 2) AS total_pendente
        FROM lancamentos
        WHERE status = 'pendente'
      `
    ),
    listContas(),
    all(
      `
        SELECT
          l.id,
          l.tipo,
          l.valor,
          l.data,
          l.status,
          l.descricao,
          c.nome AS conta_nome,
          cat.nome AS categoria_nome
        FROM lancamentos l
        INNER JOIN contas c ON c.id = l.conta_id
        INNER JOIN categorias cat ON cat.id = l.categoria_id
        ORDER BY l.data DESC, l.id DESC
        LIMIT 6
      `
    ),
  ]);

  return {
    saldo_total: resumoContas?.saldo_total || 0,
    entradas_mes: totais?.entradas_mes || 0,
    saidas_mes: totais?.saidas_mes || 0,
    lucro_prejuizo: Number((totais?.entradas_mes || 0) - (totais?.saidas_mes || 0)).toFixed(2),
    total_pendente: pendentes?.total_pendente || 0,
    saldos_por_conta: saldosPorConta,
    ultimos_lancamentos: ultimosLancamentos,
  };
}

async function resetSystemData() {
  await run('DELETE FROM transferencias');
  await run('DELETE FROM contas_pagar');
  await run('DELETE FROM aso_atendimentos');
  await run('DELETE FROM lancamentos');
  await run('DELETE FROM contas_fixas');
  await run('UPDATE contas SET saldo_atual = 0');

  return getDashboard('2000-01-01', '2100-12-31');
}

async function getFluxoRelatorio(dataInicio, dataFim) {
  return all(
    `
      SELECT
        COALESCE(compensado_em, data) AS data,
        ROUND(COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END), 0), 2) AS entradas,
        ROUND(COALESCE(SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END), 0), 2) AS saidas
      FROM lancamentos
      WHERE COALESCE(compensado_em, data) BETWEEN ? AND ?
      GROUP BY COALESCE(compensado_em, data)
      ORDER BY COALESCE(compensado_em, data) ASC
    `,
    [dataInicio, dataFim]
  );
}

async function getDespesasPorCategoria(dataInicio, dataFim) {
  return all(
    `
      SELECT
        cat.nome AS categoria,
        ROUND(COALESCE(SUM(l.valor), 0), 2) AS total
      FROM lancamentos l
      INNER JOIN categorias cat ON cat.id = l.categoria_id
      WHERE l.tipo = 'saida'
        AND COALESCE(l.compensado_em, l.data) BETWEEN ? AND ?
      GROUP BY cat.nome
      ORDER BY total DESC
    `,
    [dataInicio, dataFim]
  );
}

module.exports = {
  findUserByCredentials,
  createSessionToken,
  findUserByToken,
  clearSessionToken,
  getContaById,
  getContaCaixa,
  getCategoriaById,
  listLancamentos,
  getLancamentoById,
  createLancamento,
  updateLancamento,
  deleteLancamento,
  listCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  listContas,
  createConta,
  updateConta,
  deleteConta,
  listFornecedores,
  getFornecedorById,
  createFornecedor,
  updateFornecedor,
  deleteFornecedor,
  listClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  listAsoAtendimentos,
  getAsoById,
  createAsoAtendimento,
  updateAsoAtendimento,
  deleteAsoAtendimento,
  listTransferencias,
  createTransferencia,
  listContasFixas,
  createContaFixa,
  listContasPagar,
  getContaPagarById,
  createContaPagar,
  updateContaPagar,
  deleteContaPagar,
  listCobrancas,
  getCobrancaById,
  createCobranca,
  updateCobranca,
  deleteCobranca,
  compensateCobranca,
  generateRecurringLaunches,
  compensateLancamento,
  compensateAsoAtendimento,
  compensateContaPagar,
  listPendenciasCompensacao,
  getMovimentacoesConta,
  getMovimentacoesContaPaginadas,
  getDashboard,
  getFluxoRelatorio,
  getDespesasPorCategoria,
  resetSystemData,
};
