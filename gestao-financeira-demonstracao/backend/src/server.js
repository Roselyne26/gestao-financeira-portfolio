require('dotenv').config();

const app = require('./app');
const { initializeDatabase } = require('./database/init');

const PORT = process.env.PORT || 3000;

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao inicializar o banco:', error.message);
    process.exit(1);
  });
