const lancamentoModel = require('../models/lancamentoModel');
const saldoService = require('../services/saldoService');

async function listar(req, res) {
  try {
    const lancamentos = await lancamentoModel.listarTodos();
    res.json(lancamentos);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar lancamentos.' });
  }
}

async function criar(req, res) {
  const { tipo, valor, data, conta, categoria, descricao } = req.body;

  if (!tipo || valor == null || !data) {
    res.status(400).json({ erro: 'tipo, valor e data sao obrigatorios.' });
    return;
  }

  if (!['entrada', 'saida'].includes(tipo)) {
    res.status(400).json({ erro: "tipo deve ser 'entrada' ou 'saida'." });
    return;
  }

  try {
    const lancamento = await lancamentoModel.criar({
      tipo,
      valor: Number(valor),
      data,
      conta: conta || null,
      categoria: categoria || null,
      descricao: descricao || null,
    });

    res.status(201).json(lancamento);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar lancamento.' });
  }
}

async function remover(req, res) {
  try {
    const removido = await lancamentoModel.remover(Number(req.params.id));

    if (!removido) {
      res.status(404).json({ erro: 'Lancamento nao encontrado.' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover lancamento.' });
  }
}

async function resumo(req, res) {
  try {
    const lancamentos = await lancamentoModel.listarTodos();
    const dados = saldoService.calcularResumo(lancamentos);
    res.json(dados);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao calcular resumo.' });
  }
}

module.exports = {
  listar,
  criar,
  remover,
  resumo,
};
