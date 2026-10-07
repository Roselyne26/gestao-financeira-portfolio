const { run, get } = require('./db');
async function seedDemo() {
  await run('CREATE TABLE IF NOT EXISTS demo_metadata (id INTEGER PRIMARY KEY, version INTEGER NOT NULL)');
  if (await get('SELECT id FROM demo_metadata WHERE id = 1')) return;
  const model = require('../models/financeModel');
  const month = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 7);
  const date = (day) => `${month}-${String(day).padStart(2, '0')}`;
  await run('BEGIN TRANSACTION');
  try {
    const cliente = await model.createCliente({ nome: 'Cliente Exemplo Aurora (ficticio)', email: 'aurora@example.invalid', exames_inclusos_json: [] });
    await model.createCliente({ nome: 'Cliente Exemplo Horizonte (ficticio)', email: 'horizonte@example.invalid', exames_inclusos_json: [] });
    const fornecedor = await model.createFornecedor({ razao_social: 'Fornecedor Exemplo Papelaria (ficticio)', contato_nome: 'Contato ficticio', categoria: 'Materiais' });
    await model.createFornecedor({ razao_social: 'Fornecedor Exemplo Tecnologia (ficticio)', categoria: 'Informatica' });
    const caixa = await get("SELECT id FROM contas WHERE nome = 'Caixa'");
    const banco = await get("SELECT id FROM contas WHERE nome = 'SICOOB'");
    const receita = await get("SELECT id FROM categorias WHERE nome = 'Outros recebimentos'");
    const despesa = await get("SELECT id FROM categorias WHERE nome = 'Fornecedores'");
    await model.createLancamento({ tipo: 'entrada', valor: 2400, data: date(1), forma_pagamento: 'dinheiro', conta_id: caixa.id, categoria_id: receita.id, descricao: 'Recebimento ficticio de demonstracao', status: 'pago' });
    await model.createLancamento({ tipo: 'saida', valor: 180, data: date(2), forma_pagamento: 'dinheiro', conta_id: caixa.id, categoria_id: despesa.id, descricao: 'Compra ficticia de materiais', status: 'pago' });
    await model.createLancamento({ tipo: 'entrada', valor: 850, data: date(15), forma_pagamento: 'pix', conta_id: banco.id, categoria_id: receita.id, descricao: 'Recebimento ficticio pendente', status: 'pendente' });
    await model.createTransferencia({ conta_origem_id: caixa.id, conta_destino_id: banco.id, valor: 500, data: date(3), descricao: 'Transferencia ficticia de demonstracao' });
    await model.createContaPagar({ descricao: 'Materiais ficticios de demonstracao', tipo: 'fixa', valor: 320, categoria_id: despesa.id, fornecedor_id: fornecedor.id, data_vencimento: date(20), status: 'pendente' });
    await model.createCobranca({ cliente_id: cliente.id, descricao: 'Servico ficticio de demonstracao', valor: 650, data_emissao: date(1), data_vencimento: date(18), observacao: 'Sem validade comercial' });
    await model.createAsoAtendimento({ cliente_id: cliente.id, funcionario_nome: 'Pessoa Exemplo (ficticia)', cidade: 'Cidade Exemplo', data: date(4), tipo_aso: 'periodico', valor_aso: 120, valor_exames: 0, status: 'pendente', categoria_cobranca: 'cliente', exames_json: [] });
    await run('INSERT INTO demo_metadata (id, version) VALUES (1, 1)');
    await run('COMMIT');
  } catch (error) {
    await run('ROLLBACK');
    throw error;
  }
}
module.exports = { seedDemo };
