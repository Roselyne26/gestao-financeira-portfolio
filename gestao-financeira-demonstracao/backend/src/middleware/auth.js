const financeModel = require('../models/financeModel');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ erro: 'Sessao expirada. Faca login novamente.' });
    return;
  }

  try {
    const user = await financeModel.findUserByToken(token);

    if (!user) {
      res.status(401).json({ erro: 'Sessao invalida. Faca login novamente.' });
      return;
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao validar sessao.', detalhe: error.message });
  }
}

function requireMaster(req, res, next) {
  if (req.user?.perfil !== 'master') {
    res.status(403).json({ erro: 'Apenas o usuario master pode executar esta acao.' });
    return;
  }

  next();
}

module.exports = {
  authenticate,
  requireMaster,
};
