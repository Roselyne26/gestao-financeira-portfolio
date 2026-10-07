const express = require('express');
const controller = require('../controllers/apiController');
const { requireMaster } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/resumo-inicial', controller.getResumoInicial);

router.get('/lancamentos', controller.listarLancamentos);
router.post('/lancamentos', controller.criarLancamento);
router.put('/lancamentos/:id', requireMaster, controller.atualizarLancamento);
router.delete('/lancamentos/:id', requireMaster, controller.excluirLancamento);

router.get('/categorias', controller.listarCategorias);
router.post('/categorias', controller.criarCategoria);
router.put('/categorias/:id', requireMaster, controller.atualizarCategoria);
router.delete('/categorias/:id', requireMaster, controller.excluirCategoria);

router.get('/contas', controller.listarContas);
router.post('/contas', controller.criarConta);
router.put('/contas/:id', requireMaster, controller.atualizarConta);
router.delete('/contas/:id', requireMaster, controller.excluirConta);
router.get('/contas/:id/movimentacoes', controller.movimentacoesConta);

router.get('/clientes', controller.listarClientes);
router.get('/fornecedores', controller.listarFornecedores);
router.post('/clientes', controller.criarCliente);
router.post('/fornecedores', controller.criarFornecedor);
router.put('/clientes/:id', controller.atualizarCliente);
router.put('/fornecedores/:id', controller.atualizarFornecedor);
router.delete('/clientes/:id', requireMaster, controller.excluirCliente);
router.delete('/fornecedores/:id', requireMaster, controller.excluirFornecedor);

router.get('/asos', controller.listarAsos);
router.post('/asos', controller.criarAso);
router.put('/asos/:id', requireMaster, controller.atualizarAso);
router.delete('/asos/:id', requireMaster, controller.excluirAso);

router.get('/transferencias', controller.listarTransferencias);
router.post('/transferencias', controller.criarTransferencia);

router.get('/contas-fixas', controller.listarContasFixas);
router.post('/contas-fixas', controller.criarContaFixa);
router.post('/contas-fixas/gerar', requireMaster, controller.gerarRecorrencias);

router.get('/contas-pagar', controller.listarContasPagar);
router.post('/contas-pagar', controller.criarContaPagar);
router.put('/contas-pagar/:id', requireMaster, controller.atualizarContaPagar);
router.delete('/contas-pagar/:id', requireMaster, controller.excluirContaPagar);

router.get('/cobrancas', controller.listarCobrancas);
router.post('/cobrancas', controller.criarCobranca);
router.put('/cobrancas/:id', requireMaster, controller.atualizarCobranca);
router.delete('/cobrancas/:id', requireMaster, controller.excluirCobranca);

router.get('/compensacoes/pendencias', controller.listarPendencias);
router.post('/compensacoes/lancamentos/:id', controller.compensarLancamento);
router.post('/compensacoes/asos/:id', controller.compensarAso);
router.post('/compensacoes/contas-pagar/:id', controller.compensarContaPagar);
router.post('/compensacoes/cobrancas/:id', controller.compensarCobranca);

router.get('/dashboard', controller.dashboard);
router.get('/relatorios/fluxo', controller.relatorioFluxo);
router.get('/relatorios/despesas-categoria', controller.relatorioDespesas);
router.post('/admin/reset-sistema', requireMaster, controller.resetarSistema);

module.exports = router;
