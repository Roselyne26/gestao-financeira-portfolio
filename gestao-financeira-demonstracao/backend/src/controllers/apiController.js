const financeModel = require('../models/financeModel');

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function sendError(res, error, fallbackMessage) {
  res.status(500).json({
    erro: fallbackMessage,
    detalhe: error.message,
  });
}

async function getResumoInicial(req, res) {
  try {
    const { start, end } = getCurrentMonthRange();
    const dataInicio = req.query.dataInicio || start;
    const dataFim = req.query.dataFim || end;
    const includeCatalogs = req.query.includeCatalogs !== 'false';

    const [dashboard, lancamentos, transferencias, contasFixas, contasPagar, pendencias, asos, fluxo, despesas, categorias, clientes, cobrancas, fornecedores] = await Promise.all([
      financeModel.getDashboard(dataInicio, dataFim),
      financeModel.listLancamentos({
        tipo: req.query.tipo,
        contaId: req.query.contaId,
        categoriaId: req.query.categoriaId,
        status: req.query.status,
        dataInicio: req.query.lancamentosDataInicio || req.query.dataInicio,
        dataFim: req.query.lancamentosDataFim || req.query.dataFim,
        includeOrigins: req.query.includeOrigins === 'true',
        limit: req.query.limit,
        offset: req.query.offset,
      }),
      financeModel.listTransferencias(),
      financeModel.listContasFixas(),
      financeModel.listContasPagar(),
      financeModel.listPendenciasCompensacao(),
      financeModel.listAsoAtendimentos(),
      financeModel.getFluxoRelatorio(dataInicio, dataFim),
      financeModel.getDespesasPorCategoria(dataInicio, dataFim),
      includeCatalogs ? financeModel.listCategorias() : Promise.resolve(undefined),
      includeCatalogs ? financeModel.listClientes() : Promise.resolve(undefined),
      includeCatalogs ? financeModel.listCobrancas() : Promise.resolve(undefined),
      includeCatalogs ? financeModel.listFornecedores() : Promise.resolve(undefined),
    ]);

    res.json({
      user: req.user,
      dashboard,
      categorias,
      contas: dashboard.saldos_por_conta,
      clientes,
      cobrancas,
      fornecedores,
      lancamentos,
      transferencias,
      contas_fixas: contasFixas,
      contas_pagar: contasPagar,
      pendencias,
      asos,
      relatorio_fluxo: fluxo,
      relatorio_despesas: despesas,
    });
  } catch (error) {
    sendError(res, error, 'Erro ao carregar dados iniciais.');
  }
}

async function listarLancamentos(req, res) {
  try {
    const lancamentos = await financeModel.listLancamentos({
      tipo: req.query.tipo,
      contaId: req.query.contaId,
      categoriaId: req.query.categoriaId,
      status: req.query.status,
      dataInicio: req.query.dataInicio,
      dataFim: req.query.dataFim,
      includeOrigins: req.query.includeOrigins === 'true',
      limit: req.query.limit,
      offset: req.query.offset,
    });

    res.json(lancamentos);
  } catch (error) {
    sendError(res, error, 'Erro ao listar lancamentos.');
  }
}

async function criarLancamento(req, res) {
  const payload = req.body;

  if (!payload.tipo || !payload.valor || !payload.data || !payload.forma_pagamento || !payload.conta_id || !payload.categoria_id) {
    res.status(400).json({ erro: 'Preencha tipo, valor, data, forma de pagamento, conta e categoria.' });
    return;
  }

  try {
    const [conta, categoria] = await Promise.all([
      financeModel.getContaById(Number(payload.conta_id)),
      financeModel.getCategoriaById(Number(payload.categoria_id)),
    ]);

    if (!conta) {
      res.status(400).json({ erro: 'Conta invalida.' });
      return;
    }

    if (!categoria) {
      res.status(400).json({ erro: 'Categoria invalida.' });
      return;
    }

    const lancamento = await financeModel.createLancamento({
      tipo: payload.tipo,
      valor: Number(payload.valor),
      data: payload.data,
      forma_pagamento: payload.forma_pagamento,
      conta_id: Number(payload.conta_id),
      categoria_id: Number(payload.categoria_id),
      descricao: payload.descricao,
      recorrente: Boolean(payload.recorrente),
      status: payload.status || 'pago',
    });

    res.status(201).json(lancamento);
  } catch (error) {
    sendError(res, error, 'Erro ao criar lancamento.');
  }
}

async function atualizarLancamento(req, res) {
  const payload = req.body;

  if (!payload.tipo || !payload.valor || !payload.data || !payload.forma_pagamento || !payload.conta_id || !payload.categoria_id) {
    res.status(400).json({ erro: 'Preencha tipo, valor, data, forma de pagamento, conta e categoria.' });
    return;
  }

  try {
    const [conta, categoria] = await Promise.all([
      financeModel.getContaById(Number(payload.conta_id)),
      financeModel.getCategoriaById(Number(payload.categoria_id)),
    ]);

    if (!conta) {
      res.status(400).json({ erro: 'Conta invalida.' });
      return;
    }

    if (!categoria) {
      res.status(400).json({ erro: 'Categoria invalida.' });
      return;
    }

    const lancamento = await financeModel.updateLancamento(Number(req.params.id), {
      tipo: payload.tipo,
      valor: Number(payload.valor),
      data: payload.data,
      forma_pagamento: payload.forma_pagamento,
      conta_id: Number(payload.conta_id),
      categoria_id: Number(payload.categoria_id),
      descricao: payload.descricao,
      recorrente: Boolean(payload.recorrente),
      status: payload.status || 'pago',
    });

    if (!lancamento) {
      res.status(404).json({ erro: 'Lancamento nao encontrado.' });
      return;
    }

    res.json(lancamento);
  } catch (error) {
    sendError(res, error, 'Erro ao atualizar lancamento.');
  }
}

async function excluirLancamento(req, res) {
  try {
    const removido = await financeModel.deleteLancamento(Number(req.params.id));

    if (!removido) {
      res.status(404).json({ erro: 'Lancamento nao encontrado.' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    sendError(res, error, 'Erro ao excluir lancamento.');
  }
}

async function listarCategorias(req, res) {
  try {
    const categorias = await financeModel.listCategorias(req.query.tipo);
    res.json(categorias);
  } catch (error) {
    sendError(res, error, 'Erro ao listar categorias.');
  }
}

async function criarCategoria(req, res) {
  if (!req.body.nome || !req.body.tipo) {
    res.status(400).json({ erro: 'Informe nome e tipo da categoria.' });
    return;
  }

  try {
    const categoria = await financeModel.createCategoria({
      nome: req.body.nome,
      tipo: req.body.tipo,
    });

    res.status(201).json(categoria);
  } catch (error) {
    sendError(res, error, 'Erro ao criar categoria.');
  }
}

async function atualizarCategoria(req, res) {
  if (!req.body.nome || !req.body.tipo) {
    res.status(400).json({ erro: 'Informe nome e tipo da categoria.' });
    return;
  }

  try {
    const categoria = await financeModel.updateCategoria(Number(req.params.id), {
      nome: req.body.nome,
      tipo: req.body.tipo,
    });

    if (!categoria) {
      res.status(404).json({ erro: 'Categoria nao encontrada.' });
      return;
    }

    res.json(categoria);
  } catch (error) {
    sendError(res, error, 'Erro ao atualizar categoria.');
  }
}

async function excluirCategoria(req, res) {
  try {
    const removido = await financeModel.deleteCategoria(Number(req.params.id));

    if (!removido) {
      res.status(404).json({ erro: 'Categoria nao encontrada.' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    sendError(res, error, 'Erro ao excluir categoria.');
  }
}

async function listarContas(req, res) {
  try {
    const contas = await financeModel.listContas();
    res.json(contas);
  } catch (error) {
    sendError(res, error, 'Erro ao listar contas.');
  }
}

async function movimentacoesConta(req, res) {
  try {
    const conta = await financeModel.getContaById(Number(req.params.id));

    if (!conta) {
      res.status(404).json({ erro: 'Conta nao encontrada.' });
      return;
    }

    const movimentacoes = req.query.limit || req.query.offset || req.query.dataInicio || req.query.dataFim
      ? await financeModel.getMovimentacoesContaPaginadas(Number(req.params.id), {
        limit: req.query.limit,
        offset: req.query.offset,
        dataInicio: req.query.dataInicio,
        dataFim: req.query.dataFim,
      })
      : await financeModel.getMovimentacoesConta(Number(req.params.id));
    res.json({ conta, movimentacoes });
  } catch (error) {
    sendError(res, error, 'Erro ao listar movimentacoes da conta.');
  }
}

async function criarConta(req, res) {
  if (!req.body.nome) {
    res.status(400).json({ erro: 'Informe o nome da conta.' });
    return;
  }

  try {
    const conta = await financeModel.createConta({
      nome: req.body.nome,
      saldo_atual: Number(req.body.saldo_atual || 0),
    });

    res.status(201).json(conta);
  } catch (error) {
    sendError(res, error, 'Erro ao criar conta.');
  }
}

async function atualizarConta(req, res) {
  if (!req.body.nome) {
    res.status(400).json({ erro: 'Informe o nome da conta.' });
    return;
  }

  try {
    const conta = await financeModel.updateConta(Number(req.params.id), {
      nome: req.body.nome,
      saldo_atual: Number(req.body.saldo_atual || 0),
      observacao: req.body.observacao,
    });

    if (!conta) {
      res.status(404).json({ erro: 'Conta nao encontrada.' });
      return;
    }

    res.json(conta);
  } catch (error) {
    sendError(res, error, 'Erro ao atualizar conta.');
  }
}

async function excluirConta(req, res) {
  try {
    const removido = await financeModel.deleteConta(Number(req.params.id));

    if (!removido) {
      res.status(404).json({ erro: 'Conta nao encontrada.' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    sendError(res, error, error.message || 'Erro ao excluir conta.');
  }
}

async function listarClientes(req, res) {
  try {
    const clientes = await financeModel.listClientes();
    res.json(clientes);
  } catch (error) {
    sendError(res, error, 'Erro ao listar clientes.');
  }
}

async function listarFornecedores(req, res) {
  try {
    const fornecedores = await financeModel.listFornecedores();
    res.json(fornecedores);
  } catch (error) {
    sendError(res, error, 'Erro ao listar fornecedores.');
  }
}

async function criarFornecedor(req, res) {
  if (!req.body.razao_social) {
    res.status(400).json({ erro: 'Informe a razao social do fornecedor.' });
    return;
  }

  try {
    const fornecedor = await financeModel.createFornecedor(req.body);
    res.status(201).json(fornecedor);
  } catch (error) {
    sendError(res, error, 'Erro ao criar fornecedor.');
  }
}

async function atualizarFornecedor(req, res) {
  if (!req.body.razao_social) {
    res.status(400).json({ erro: 'Informe a razao social do fornecedor.' });
    return;
  }

  try {
    const fornecedor = await financeModel.updateFornecedor(Number(req.params.id), req.body);
    if (!fornecedor) {
      res.status(404).json({ erro: 'Fornecedor nao encontrado.' });
      return;
    }
    res.json(fornecedor);
  } catch (error) {
    sendError(res, error, 'Erro ao atualizar fornecedor.');
  }
}

async function excluirFornecedor(req, res) {
  try {
    const removido = await financeModel.deleteFornecedor(Number(req.params.id));
    if (!removido) {
      res.status(404).json({ erro: 'Fornecedor nao encontrado.' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    sendError(res, error, 'Erro ao excluir fornecedor.');
  }
}

async function criarCliente(req, res) {
  if (!req.body.nome) {
    res.status(400).json({ erro: 'Informe o nome do cliente.' });
    return;
  }

  try {
    const cliente = await financeModel.createCliente({
      ...req.body,
      aso_incluso: Boolean(req.body.aso_incluso),
      exames_incluso: Boolean(req.body.exames_incluso),
      exames_inclusos_json: req.body.exames_inclusos_json || [],
    });
    res.status(201).json(cliente);
  } catch (error) {
    sendError(res, error, 'Erro ao criar cliente.');
  }
}

async function atualizarCliente(req, res) {
  if (!req.body.nome) {
    res.status(400).json({ erro: 'Informe o nome do cliente.' });
    return;
  }

  try {
    const cliente = await financeModel.updateCliente(Number(req.params.id), {
      ...req.body,
      aso_incluso: Boolean(req.body.aso_incluso),
      exames_incluso: Boolean(req.body.exames_incluso),
      exames_inclusos_json: req.body.exames_inclusos_json || [],
    });

    if (!cliente) {
      res.status(404).json({ erro: 'Cliente nao encontrado.' });
      return;
    }

    res.json(cliente);
  } catch (error) {
    sendError(res, error, 'Erro ao atualizar cliente.');
  }
}

async function excluirCliente(req, res) {
  try {
    const removido = await financeModel.deleteCliente(Number(req.params.id));

    if (!removido) {
      res.status(404).json({ erro: 'Cliente nao encontrado.' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    sendError(res, error, 'Erro ao excluir cliente.');
  }
}

async function listarAsos(req, res) {
  try {
    const asos = await financeModel.listAsoAtendimentos();
    res.json(asos);
  } catch (error) {
    sendError(res, error, 'Erro ao listar ASOs.');
  }
}

async function criarAso(req, res) {
  const payload = req.body;

  if (!payload.data || !payload.cidade || !payload.cliente_id || !payload.funcionario_nome || !payload.tipo_aso) {
    res.status(400).json({ erro: 'Preencha data, cidade, empresa, funcionario e tipo de ASO.' });
    return;
  }

  try {
    const cliente = await financeModel.getClienteById(Number(payload.cliente_id));

    if (!cliente) {
      res.status(400).json({ erro: 'Empresa invalida.' });
      return;
    }

    const exames = payload.exames_json || [];
    const paidExamesInvalid = exames.some((item) => item.pago && Number(item.valor || 0) > 0 && (!item.forma_pagamento || (item.forma_pagamento !== 'dinheiro' && !item.conta_id)));
    const principalPaidInvalid = !Boolean(payload.aso_incluso)
      && payload.status === 'pago'
      && Number(payload.valor_aso || 0) > 0
      && (!payload.forma_pagamento || (payload.forma_pagamento !== 'dinheiro' && !payload.conta_id));

    if (principalPaidInvalid) {
      res.status(400).json({ erro: 'Informe a forma de pagamento e a conta de recebimento do ASO.' });
      return;
    }

    if (paidExamesInvalid) {
      res.status(400).json({ erro: 'Informe a forma de pagamento dos exames pagos.' });
      return;
    }

    const aso = await financeModel.createAsoAtendimento({
      ...payload,
      cliente_id: Number(payload.cliente_id),
      conta_id: payload.conta_id ? Number(payload.conta_id) : null,
      exames_complementares: Boolean(payload.exames_complementares),
      aso_incluso: Boolean(payload.aso_incluso),
      exames_incluso: Boolean(payload.exames_incluso),
      exames_json: payload.exames_json || [],
      valor_aso: payload.valor_aso ? Number(payload.valor_aso) : 0,
      valor_exames: payload.valor_exames ? Number(payload.valor_exames) : 0,
      status: payload.status || 'pendente',
    });
    res.status(201).json(aso);
  } catch (error) {
    sendError(res, error, 'Erro ao criar ASO.');
  }
}

async function atualizarAso(req, res) {
  const payload = req.body;

  if (!payload.data || !payload.cidade || !payload.cliente_id || !payload.funcionario_nome || !payload.tipo_aso) {
    res.status(400).json({ erro: 'Preencha data, cidade, empresa, funcionario e tipo de ASO.' });
    return;
  }

  try {
    const cliente = await financeModel.getClienteById(Number(payload.cliente_id));

    if (!cliente) {
      res.status(400).json({ erro: 'Empresa invalida.' });
      return;
    }

    const exames = payload.exames_json || [];
    const paidExamesInvalid = exames.some((item) => item.pago && Number(item.valor || 0) > 0 && (!item.forma_pagamento || (item.forma_pagamento !== 'dinheiro' && !item.conta_id)));
    const principalPaidInvalid = !Boolean(payload.aso_incluso)
      && payload.status === 'pago'
      && Number(payload.valor_aso || 0) > 0
      && (!payload.forma_pagamento || (payload.forma_pagamento !== 'dinheiro' && !payload.conta_id));

    if (principalPaidInvalid) {
      res.status(400).json({ erro: 'Informe a forma de pagamento e a conta de recebimento do ASO.' });
      return;
    }

    if (paidExamesInvalid) {
      res.status(400).json({ erro: 'Informe a forma de pagamento dos exames pagos.' });
      return;
    }

    const aso = await financeModel.updateAsoAtendimento(Number(req.params.id), {
      ...payload,
      cliente_id: Number(payload.cliente_id),
      conta_id: payload.conta_id ? Number(payload.conta_id) : null,
      exames_complementares: Boolean(payload.exames_complementares),
      aso_incluso: Boolean(payload.aso_incluso),
      exames_incluso: Boolean(payload.exames_incluso),
      exames_json: payload.exames_json || [],
      valor_aso: payload.valor_aso ? Number(payload.valor_aso) : 0,
      valor_exames: payload.valor_exames ? Number(payload.valor_exames) : 0,
      status: payload.status || 'pendente',
    });

    if (!aso) {
      res.status(404).json({ erro: 'ASO nao encontrado.' });
      return;
    }

    res.json(aso);
  } catch (error) {
    sendError(res, error, 'Erro ao atualizar ASO.');
  }
}

async function excluirAso(req, res) {
  try {
    const removido = await financeModel.deleteAsoAtendimento(Number(req.params.id));

    if (!removido) {
      res.status(404).json({ erro: 'ASO nao encontrado.' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    sendError(res, error, 'Erro ao excluir ASO.');
  }
}

async function listarTransferencias(req, res) {
  try {
    const transferencias = await financeModel.listTransferencias();
    res.json(transferencias);
  } catch (error) {
    sendError(res, error, 'Erro ao listar transferencias.');
  }
}

async function criarTransferencia(req, res) {
  const payload = req.body;

  if (!payload.conta_origem_id || !payload.conta_destino_id || !payload.valor || !payload.data) {
    res.status(400).json({ erro: 'Informe origem, destino, valor e data da transferencia.' });
    return;
  }

  if (Number(payload.conta_origem_id) === Number(payload.conta_destino_id)) {
    res.status(400).json({ erro: 'Origem e destino precisam ser diferentes.' });
    return;
  }

  try {
    const transferencia = await financeModel.createTransferencia({
      conta_origem_id: Number(payload.conta_origem_id),
      conta_destino_id: Number(payload.conta_destino_id),
      valor: Number(payload.valor),
      data: payload.data,
      descricao: payload.descricao,
    });

    res.status(201).json(transferencia);
  } catch (error) {
    sendError(res, error, 'Erro ao criar transferencia.');
  }
}

async function listarContasFixas(req, res) {
  try {
    const contasFixas = await financeModel.listContasFixas();
    res.json(contasFixas);
  } catch (error) {
    sendError(res, error, 'Erro ao listar contas fixas.');
  }
}

async function criarContaFixa(req, res) {
  const payload = req.body;

  if (!payload.descricao || !payload.valor || !payload.tipo || !payload.categoria_id || !payload.conta_id || !payload.forma_pagamento || !payload.frequencia || !payload.proxima_data) {
    res.status(400).json({ erro: 'Preencha todos os dados da conta fixa.' });
    return;
  }

  try {
    const contaFixa = await financeModel.createContaFixa({
      descricao: payload.descricao,
      valor: Number(payload.valor),
      tipo: payload.tipo,
      categoria_id: Number(payload.categoria_id),
      conta_id: Number(payload.conta_id),
      forma_pagamento: payload.forma_pagamento,
      frequencia: payload.frequencia,
      proxima_data: payload.proxima_data,
      status: payload.status || 'pendente',
    });

    res.status(201).json(contaFixa);
  } catch (error) {
    sendError(res, error, 'Erro ao criar conta fixa.');
  }
}

async function listarContasPagar(req, res) {
  try {
    const contasPagar = await financeModel.listContasPagar();
    res.json(contasPagar);
  } catch (error) {
    sendError(res, error, 'Erro ao listar contas a pagar.');
  }
}

async function criarContaPagar(req, res) {
  const payload = req.body;

  if (!payload.descricao || !payload.tipo || !payload.valor || !payload.categoria_id || !payload.data_vencimento) {
    res.status(400).json({ erro: 'Preencha os campos principais da conta a pagar.' });
    return;
  }

  try {
    const registros = await financeModel.createContaPagar({
      ...payload,
      categoria_id: Number(payload.categoria_id),
      conta_id: null,
      cliente_id: null,
      total_parcelas: Number(payload.total_parcelas || 1),
      parcela_atual: Number(payload.parcela_atual || 1),
      valor: Number(payload.valor),
      fornecedor_id: payload.fornecedor_id ? Number(payload.fornecedor_id) : null,
    });

    res.status(201).json(registros);
  } catch (error) {
    sendError(res, error, 'Erro ao criar conta a pagar.');
  }
}

async function atualizarContaPagar(req, res) {
  const payload = req.body;

  if (!payload.descricao || !payload.tipo || !payload.valor || !payload.categoria_id || !payload.data_vencimento) {
    res.status(400).json({ erro: 'Preencha os campos principais da conta a pagar.' });
    return;
  }

  try {
    const contaPagar = await financeModel.updateContaPagar(Number(req.params.id), {
      ...payload,
      categoria_id: Number(payload.categoria_id),
      conta_id: payload.conta_id ? Number(payload.conta_id) : null,
      cliente_id: null,
      total_parcelas: Number(payload.total_parcelas || 1),
      parcela_atual: Number(payload.parcela_atual || 1),
      valor: Number(payload.valor),
      fornecedor_id: payload.fornecedor_id ? Number(payload.fornecedor_id) : null,
    });

    if (!contaPagar) {
      res.status(404).json({ erro: 'Conta a pagar nao encontrada.' });
      return;
    }

    res.json(contaPagar);
  } catch (error) {
    sendError(res, error, 'Erro ao atualizar conta a pagar.');
  }
}

async function excluirContaPagar(req, res) {
  try {
    const removido = await financeModel.deleteContaPagar(Number(req.params.id));

    if (!removido) {
      res.status(404).json({ erro: 'Conta a pagar nao encontrada.' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    sendError(res, error, 'Erro ao excluir conta a pagar.');
  }
}

async function gerarRecorrencias(req, res) {
  const data = req.body.data || new Date().toISOString().slice(0, 10);

  try {
    const resultado = await financeModel.generateRecurringLaunches(data);
    res.json(resultado);
  } catch (error) {
    sendError(res, error, 'Erro ao gerar lancamentos recorrentes.');
  }
}

async function listarPendencias(req, res) {
  try {
    const pendencias = await financeModel.listPendenciasCompensacao();
    res.json(pendencias);
  } catch (error) {
    sendError(res, error, 'Erro ao listar pendencias.');
  }
}

async function compensarLancamento(req, res) {
  try {
    const lancamento = await financeModel.compensateLancamento(
      Number(req.params.id),
      req.body?.data_compensacao,
      req.body?.forma_pagamento,
      req.body?.conta_id ? Number(req.body.conta_id) : null
    );

    if (!lancamento) {
      res.status(404).json({ erro: 'Lancamento nao encontrado.' });
      return;
    }

    res.json(lancamento);
  } catch (error) {
    sendError(res, error, 'Erro ao compensar lancamento.');
  }
}

async function compensarAso(req, res) {
  if (!req.body?.data_compensacao || !req.body?.forma_pagamento) {
    res.status(400).json({ erro: 'Informe a data e a forma de pagamento da compensacao.' });
    return;
  }

  if (req.body.forma_pagamento !== 'dinheiro' && !req.body?.conta_id) {
    res.status(400).json({ erro: 'Informe a conta de recebimento da compensacao.' });
    return;
  }

  try {
    const aso = await financeModel.compensateAsoAtendimento(Number(req.params.id), {
      data_compensacao: req.body.data_compensacao,
      forma_pagamento: req.body.forma_pagamento,
      conta_id: req.body.conta_id ? Number(req.body.conta_id) : null,
    });

    if (!aso) {
      res.status(404).json({ erro: 'ASO nao encontrado.' });
      return;
    }

    res.json(aso);
  } catch (error) {
    sendError(res, error, 'Erro ao compensar ASO.');
  }
}

async function compensarContaPagar(req, res) {
  if (!req.body?.data_compensacao || !req.body?.forma_pagamento) {
    res.status(400).json({ erro: 'Informe a data e a forma de pagamento.' });
    return;
  }

  try {
    const contaPagar = await financeModel.compensateContaPagar(Number(req.params.id), {
      data_compensacao: req.body?.data_compensacao,
      forma_pagamento: req.body?.forma_pagamento,
      conta_id: req.body?.conta_id ? Number(req.body.conta_id) : null,
    });

    if (!contaPagar) {
      res.status(404).json({ erro: 'Conta a pagar nao encontrada.' });
      return;
    }

    res.json(contaPagar);
  } catch (error) {
    sendError(res, error, 'Erro ao compensar conta a pagar.');
  }
}

async function listarCobrancas(req, res) {
  try {
    const cobrancas = await financeModel.listCobrancas();
    res.json(cobrancas);
  } catch (error) {
    sendError(res, error, 'Erro ao listar cobrancas.');
  }
}

async function criarCobranca(req, res) {
  if (!req.body.cliente_id || !req.body.descricao || !req.body.valor || !req.body.data_emissao || !req.body.data_vencimento) {
    res.status(400).json({ erro: 'Preencha cliente, descricao, valor, emissao e vencimento.' });
    return;
  }

  try {
    const cobranca = await financeModel.createCobranca({
      cliente_id: Number(req.body.cliente_id),
      descricao: req.body.descricao,
      valor: Number(req.body.valor),
      data_emissao: req.body.data_emissao,
      data_vencimento: req.body.data_vencimento,
      observacao: req.body.observacao,
    });
    res.status(201).json(cobranca);
  } catch (error) {
    sendError(res, error, 'Erro ao criar cobranca.');
  }
}

async function atualizarCobranca(req, res) {
  if (!req.body.cliente_id || !req.body.descricao || !req.body.valor || !req.body.data_emissao || !req.body.data_vencimento) {
    res.status(400).json({ erro: 'Preencha cliente, descricao, valor, emissao e vencimento.' });
    return;
  }

  try {
    const cobranca = await financeModel.updateCobranca(Number(req.params.id), {
      cliente_id: Number(req.body.cliente_id),
      descricao: req.body.descricao,
      valor: Number(req.body.valor),
      data_emissao: req.body.data_emissao,
      data_vencimento: req.body.data_vencimento,
      observacao: req.body.observacao,
    });

    if (!cobranca) {
      res.status(404).json({ erro: 'Cobranca nao encontrada.' });
      return;
    }

    res.json(cobranca);
  } catch (error) {
    sendError(res, error, 'Erro ao atualizar cobranca.');
  }
}

async function excluirCobranca(req, res) {
  try {
    const removido = await financeModel.deleteCobranca(Number(req.params.id));

    if (!removido) {
      res.status(404).json({ erro: 'Cobranca nao encontrada.' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    sendError(res, error, 'Erro ao excluir cobranca.');
  }
}

async function compensarCobranca(req, res) {
  if (!req.body?.data_compensacao) {
    res.status(400).json({ erro: 'Informe a data da compensacao.' });
    return;
  }

  try {
    const cobranca = await financeModel.compensateCobranca(Number(req.params.id), {
      data_compensacao: req.body.data_compensacao,
      conta_id: req.body.conta_id ? Number(req.body.conta_id) : null,
    });

    if (!cobranca) {
      res.status(404).json({ erro: 'Cobranca nao encontrada.' });
      return;
    }

    res.json(cobranca);
  } catch (error) {
    sendError(res, error, 'Erro ao compensar cobranca.');
  }
}

async function dashboard(req, res) {
  const range = getCurrentMonthRange();

  try {
    const dados = await financeModel.getDashboard(
      req.query.dataInicio || range.start,
      req.query.dataFim || range.end
    );

    res.json(dados);
  } catch (error) {
    sendError(res, error, 'Erro ao carregar dashboard.');
  }
}

async function relatorioFluxo(req, res) {
  const range = getCurrentMonthRange();

  try {
    const dados = await financeModel.getFluxoRelatorio(
      req.query.dataInicio || range.start,
      req.query.dataFim || range.end
    );

    res.json(dados);
  } catch (error) {
    sendError(res, error, 'Erro ao carregar relatorio de fluxo.');
  }
}

async function relatorioDespesas(req, res) {
  const range = getCurrentMonthRange();

  try {
    const dados = await financeModel.getDespesasPorCategoria(
      req.query.dataInicio || range.start,
      req.query.dataFim || range.end
    );

    res.json(dados);
  } catch (error) {
    sendError(res, error, 'Erro ao carregar relatorio de despesas.');
  }
}

async function resetarSistema(req, res) {
  try {
    const dashboard = await financeModel.resetSystemData();
    res.json({
      mensagem: 'Dados financeiros apagados e saldos zerados.',
      dashboard,
    });
  } catch (error) {
    sendError(res, error, 'Erro ao resetar os dados do sistema.');
  }
}

module.exports = {
  getResumoInicial,
  listarLancamentos,
  criarLancamento,
  atualizarLancamento,
  excluirLancamento,
  listarCategorias,
  criarCategoria,
  atualizarCategoria,
  excluirCategoria,
  listarContas,
  criarConta,
  atualizarConta,
  excluirConta,
  movimentacoesConta,
  listarClientes,
  listarFornecedores,
  criarCliente,
  criarFornecedor,
  atualizarCliente,
  atualizarFornecedor,
  excluirCliente,
  excluirFornecedor,
  listarAsos,
  criarAso,
  atualizarAso,
  excluirAso,
  listarTransferencias,
  criarTransferencia,
  listarContasFixas,
  criarContaFixa,
  listarContasPagar,
  criarContaPagar,
  atualizarContaPagar,
  excluirContaPagar,
  listarCobrancas,
  criarCobranca,
  atualizarCobranca,
  excluirCobranca,
  gerarRecorrencias,
  listarPendencias,
  compensarLancamento,
  compensarAso,
  compensarContaPagar,
  compensarCobranca,
  dashboard,
  relatorioFluxo,
  relatorioDespesas,
  resetarSistema,
};
