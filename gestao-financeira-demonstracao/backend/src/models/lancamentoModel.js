const db = require('../database/db');

function listarTodos() {
  return new Promise((resolve, reject) => {
    db.all(
      `
        SELECT id, tipo, valor, data, conta, categoria, descricao
        FROM lancamentos
        ORDER BY date(data) DESC, id DESC
      `,
      [],
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(rows);
      }
    );
  });
}

function criar(lancamento) {
  const { tipo, valor, data, conta, categoria, descricao } = lancamento;

  return new Promise((resolve, reject) => {
    db.run(
      `
        INSERT INTO lancamentos (tipo, valor, data, conta, categoria, descricao)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [tipo, valor, data, conta, categoria, descricao],
      function onInsert(err) {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          id: this.lastID,
          tipo,
          valor,
          data,
          conta,
          categoria,
          descricao,
        });
      }
    );
  });
}

function remover(id) {
  return new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM lancamentos WHERE id = ?',
      [id],
      function onDelete(err) {
        if (err) {
          reject(err);
          return;
        }

        resolve(this.changes > 0);
      }
    );
  });
}

module.exports = {
  listarTodos,
  criar,
  remover,
};
