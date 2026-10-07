const financeModel = require('../models/financeModel');

async function login(req, res) {
  const { login: userLogin, senha } = req.body;

  if (!userLogin || !senha) {
    res.status(400).json({ erro: 'Informe login e senha.' });
    return;
  }

  try {
    const user = await financeModel.findUserByCredentials(userLogin, senha);

    if (!user) {
      res.status(401).json({ erro: 'Login ou senha invalidos.' });
      return;
    }

    const token = await financeModel.createSessionToken(user.id);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao realizar login.', detalhe: error.message });
  }
}

async function me(req, res) {
  res.json({ user: req.user });
}

async function logout(req, res) {
  try {
    await financeModel.clearSessionToken(req.token);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao encerrar sessao.', detalhe: error.message });
  }
}

module.exports = {
  login,
  me,
  logout,
};
