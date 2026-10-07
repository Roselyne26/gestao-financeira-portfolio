const { all, run } = require('./db');

const categoriasPadrao = [
  { nome: 'Outros recebimentos', tipo: 'entrada' },
  { nome: 'Receita ASO', tipo: 'entrada' },
  { nome: 'Aluguel', tipo: 'saida' },
  { nome: 'Energia', tipo: 'saida' },
  { nome: 'Internet', tipo: 'saida' },
  { nome: 'Fornecedores', tipo: 'saida' },
  { nome: 'Salarios', tipo: 'saida' },
  { nome: 'Marketing', tipo: 'saida' },
  { nome: 'Manutencao', tipo: 'saida' },
  { nome: 'Despesas diversas', tipo: 'saida' },
];

const contasPadrao = [
  { nome: 'Caixa', saldoAtual: 0 },
  { nome: 'SICOOB', saldoAtual: 0 },
  { nome: 'Cresol', saldoAtual: 0 },
  { nome: 'Banco do Brasil', saldoAtual: 0 },
];

const usuariosPadrao = [
  { nome: 'Administrador Master', login: 'master', senha: 'demo123', perfil: 'master' },
  { nome: 'Operador de Caixa', login: 'operador', senha: 'demo123', perfil: 'operador' },
];

async function ensureColumn(tableName, columnName, definition) {
  const columns = await all(`PRAGMA table_info(${tableName})`);
  const exists = columns.some((column) => column.name === columnName);

  if (!exists) {
    await run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

async function initializeDatabase() {
  await run('PRAGMA foreign_keys = ON');

  await run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      login TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      perfil TEXT NOT NULL CHECK (perfil IN ('master', 'operador')),
      token TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida'))
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS contas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      saldo_atual REAL NOT NULL DEFAULT 0,
      ativo INTEGER NOT NULL DEFAULT 1
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS fornecedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      razao_social TEXT NOT NULL,
      cnpj TEXT,
      contato_nome TEXT,
      telefone TEXT,
      categoria TEXT,
      ativo INTEGER NOT NULL DEFAULT 1
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      telefone TEXT,
      email TEXT,
      documento TEXT,
      aso_incluso INTEGER NOT NULL DEFAULT 0,
      exames_incluso INTEGER NOT NULL DEFAULT 0,
      exames_inclusos_json TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS contas_fixas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao TEXT NOT NULL,
      valor REAL NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
      categoria_id INTEGER NOT NULL,
      conta_id INTEGER NOT NULL,
      forma_pagamento TEXT NOT NULL,
      frequencia TEXT NOT NULL CHECK (frequencia IN ('diaria', 'semanal', 'quinzenal', 'mensal', 'anual')),
      proxima_data TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pago', 'pendente')),
      ativo INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id),
      FOREIGN KEY (conta_id) REFERENCES contas(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS lancamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
      valor REAL NOT NULL,
      data TEXT NOT NULL,
      forma_pagamento TEXT NOT NULL,
      conta_id INTEGER NOT NULL,
      categoria_id INTEGER NOT NULL,
      descricao TEXT,
      recorrente INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pago' CHECK (status IN ('pago', 'pendente')),
      conta_fixa_id INTEGER,
      origem_tipo TEXT NOT NULL DEFAULT 'manual',
      origem_id INTEGER,
      compensado_em TEXT,
      criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conta_id) REFERENCES contas(id),
      FOREIGN KEY (categoria_id) REFERENCES categorias(id),
      FOREIGN KEY (conta_fixa_id) REFERENCES contas_fixas(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS aso_atendimentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL,
      cidade TEXT NOT NULL,
      cliente_id INTEGER NOT NULL,
      funcionario_nome TEXT NOT NULL,
      tipo_aso TEXT NOT NULL CHECK (tipo_aso IN ('admissional', 'periodico', 'retorno_ao_trabalho', 'mudanca_de_risco', 'demissional')),
      exames_complementares INTEGER NOT NULL DEFAULT 0,
      exames_json TEXT,
      valor_aso REAL,
      valor_exames REAL NOT NULL DEFAULT 0,
      categoria_cobranca TEXT CHECK (categoria_cobranca IN ('cliente', 'particular')),
      forma_pagamento TEXT CHECK (forma_pagamento IN ('dinheiro', 'pix')),
      conta_id INTEGER,
      status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pago', 'pendente')),
      compensado_em TEXT,
      aso_incluso INTEGER NOT NULL DEFAULT 0,
      exames_incluso INTEGER NOT NULL DEFAULT 0,
      lancamento_id INTEGER,
      criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id),
      FOREIGN KEY (conta_id) REFERENCES contas(id),
      FOREIGN KEY (lancamento_id) REFERENCES lancamentos(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS contas_pagar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('fixa', 'parcelada')),
      valor REAL NOT NULL,
      total_parcelas INTEGER NOT NULL DEFAULT 1,
      parcela_atual INTEGER NOT NULL DEFAULT 1,
      categoria_id INTEGER NOT NULL,
      conta_id INTEGER,
      cliente_id INTEGER,
      forma_pagamento TEXT,
      fornecedor_id INTEGER,
      fornecedor TEXT,
      data_vencimento TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pago', 'pendente')),
      compensado_em TEXT,
      lancamento_id INTEGER,
      criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id),
      FOREIGN KEY (conta_id) REFERENCES contas(id),
      FOREIGN KEY (cliente_id) REFERENCES clientes(id),
      FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id),
      FOREIGN KEY (lancamento_id) REFERENCES lancamentos(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS transferencias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conta_origem_id INTEGER NOT NULL,
      conta_destino_id INTEGER NOT NULL,
      valor REAL NOT NULL,
      data TEXT NOT NULL,
      descricao TEXT,
      FOREIGN KEY (conta_origem_id) REFERENCES contas(id),
      FOREIGN KEY (conta_destino_id) REFERENCES contas(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS conta_ajustes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conta_id INTEGER NOT NULL,
      valor_anterior REAL NOT NULL,
      valor_novo REAL NOT NULL,
      observacao TEXT,
      criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conta_id) REFERENCES contas(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS cobrancas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      descricao TEXT NOT NULL,
      valor REAL NOT NULL,
      data_emissao TEXT NOT NULL,
      data_vencimento TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago')),
      compensado_em TEXT,
      observacao TEXT,
      lancamento_id INTEGER,
      criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id),
      FOREIGN KEY (lancamento_id) REFERENCES lancamentos(id)
    )
  `);

  await ensureColumn('clientes', 'aso_incluso', 'INTEGER NOT NULL DEFAULT 0');
  await ensureColumn('contas', 'ativo', 'INTEGER NOT NULL DEFAULT 1');
  await ensureColumn('contas_pagar', 'fornecedor_id', 'INTEGER');
  await ensureColumn('clientes', 'exames_incluso', 'INTEGER NOT NULL DEFAULT 0');
  await ensureColumn('clientes', 'exames_inclusos_json', 'TEXT');
  await ensureColumn('lancamentos', 'origem_tipo', "TEXT NOT NULL DEFAULT 'manual'");
  await ensureColumn('lancamentos', 'origem_id', 'INTEGER');
  await ensureColumn('lancamentos', 'compensado_em', 'TEXT');
  await ensureColumn('contas_pagar', 'compensado_em', 'TEXT');
  await ensureColumn('aso_atendimentos', 'valor_exames', 'REAL NOT NULL DEFAULT 0');
  await ensureColumn('aso_atendimentos', 'compensado_em', 'TEXT');
  await ensureColumn('cobrancas', 'observacao', 'TEXT');
  await ensureColumn('cobrancas', 'lancamento_id', 'INTEGER');

  await run('CREATE INDEX IF NOT EXISTS idx_usuarios_token ON usuarios(token)');
  await run('CREATE INDEX IF NOT EXISTS idx_categorias_tipo_nome ON categorias(tipo, nome)');
  await run('CREATE INDEX IF NOT EXISTS idx_fornecedores_razao_social ON fornecedores(razao_social)');
  await run('CREATE INDEX IF NOT EXISTS idx_fornecedores_cnpj ON fornecedores(cnpj)');
  await run('CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome)');
  await run('CREATE INDEX IF NOT EXISTS idx_clientes_documento ON clientes(documento)');
  await run('CREATE INDEX IF NOT EXISTS idx_lancamentos_data_id ON lancamentos(data DESC, id DESC)');
  await run('CREATE INDEX IF NOT EXISTS idx_lancamentos_compensado_data ON lancamentos(compensado_em, data)');
  await run('CREATE INDEX IF NOT EXISTS idx_lancamentos_status_origem_data ON lancamentos(status, origem_tipo, data)');
  await run('CREATE INDEX IF NOT EXISTS idx_lancamentos_conta_data ON lancamentos(conta_id, data DESC)');
  await run('CREATE INDEX IF NOT EXISTS idx_lancamentos_categoria_data ON lancamentos(categoria_id, data DESC)');
  await run('CREATE INDEX IF NOT EXISTS idx_lancamentos_origem_lookup ON lancamentos(origem_tipo, origem_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_aso_cliente_data ON aso_atendimentos(cliente_id, data DESC)');
  await run('CREATE INDEX IF NOT EXISTS idx_aso_status_data ON aso_atendimentos(status, data DESC)');
  await run('CREATE INDEX IF NOT EXISTS idx_contas_pagar_status_vencimento ON contas_pagar(status, data_vencimento ASC)');
  await run('CREATE INDEX IF NOT EXISTS idx_contas_pagar_cliente ON contas_pagar(cliente_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_contas_pagar_fornecedor ON contas_pagar(fornecedor_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_contas_pagar_categoria ON contas_pagar(categoria_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_contas_pagar_conta ON contas_pagar(conta_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_contas_fixas_ativo_proxima_data ON contas_fixas(ativo, proxima_data ASC)');
  await run('CREATE INDEX IF NOT EXISTS idx_transferencias_origem_data ON transferencias(conta_origem_id, data DESC)');
  await run('CREATE INDEX IF NOT EXISTS idx_transferencias_destino_data ON transferencias(conta_destino_id, data DESC)');
  await run('CREATE INDEX IF NOT EXISTS idx_conta_ajustes_conta_data ON conta_ajustes(conta_id, criado_em DESC)');
  await run('CREATE INDEX IF NOT EXISTS idx_cobrancas_cliente_status_vencimento ON cobrancas(cliente_id, status, data_vencimento ASC)');
  await run('CREATE INDEX IF NOT EXISTS idx_cobrancas_status_vencimento ON cobrancas(status, data_vencimento ASC)');

  for (const usuario of usuariosPadrao) {
    await run(
      `
        INSERT OR IGNORE INTO usuarios (nome, login, senha, perfil)
        VALUES (?, ?, ?, ?)
      `,
      [usuario.nome, usuario.login, usuario.senha, usuario.perfil]
    );
  }

  for (const categoria of categoriasPadrao) {
    await run(
      `
        INSERT OR IGNORE INTO categorias (nome, tipo)
        VALUES (?, ?)
      `,
      [categoria.nome, categoria.tipo]
    );
  }

  for (const conta of contasPadrao) {
    await run(
      `
        INSERT OR IGNORE INTO contas (nome, saldo_atual)
        VALUES (?, ?)
      `,
      [conta.nome, conta.saldoAtual]
    );
  }

  const contaBancaria = await all(`SELECT id FROM contas WHERE LOWER(nome) = 'conta bancaria'`);
  const contaSicoob = await all(`SELECT id FROM contas WHERE LOWER(nome) = 'sicoob'`);

  if (contaBancaria.length && !contaSicoob.length) {
    await run(`UPDATE contas SET nome = 'SICOOB' WHERE LOWER(nome) = 'conta bancaria'`);
  }

  await run(`UPDATE contas SET ativo = 0 WHERE LOWER(nome) IN ('cartao', 'conta bancaria')`);
  await require('./demoSeed').seedDemo();
}

module.exports = {
  initializeDatabase,
};
