const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// A demonstração nunca abre bancos externos ou caminhos herdados de produção.
const demoDir = path.join(__dirname, '..', '..', 'data');
fs.mkdirSync(demoDir, { recursive: true });
const dbPath = path.join(demoDir, 'demonstracao.sqlite');
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve({
        lastID: this.lastID,
        changes: this.changes,
      });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(rows);
    });
  });
}

module.exports = {
  db,
  dbPath,
  run,
  get,
  all,
};
