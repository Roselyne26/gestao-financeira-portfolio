const crypto = require('crypto');

const SECRET = crypto.randomBytes(32).toString('hex');

const users = [
  {
    username: process.env.MASTER_USERNAME || 'master',
    password: process.env.MASTER_PASSWORD || 'demo123',
    role: 'master',
    displayName: 'Usuario Master',
  },
  {
    username: process.env.OPERATOR_USERNAME || 'registro',
    password: process.env.OPERATOR_PASSWORD || 'demo123',
    role: 'operator',
    displayName: 'Usuario de Registro',
  },
];

function toPublicUser(user) {
  return {
    username: user.username,
    role: user.role,
    displayName: user.displayName,
  };
}

function signToken(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

function verifyToken(token) {
  if (!token || !token.includes('.')) {
    return null;
  }

  const [encoded, signature] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(encoded).digest('base64url');

  if (signature !== expected) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));

    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

function login(username, password) {
  const user = users.find((item) => item.username === username && item.password === password);

  if (!user) {
    return null;
  }

  const payload = {
    username: user.username,
    role: user.role,
    displayName: user.displayName,
    exp: Date.now() + 1000 * 60 * 60 * 12,
  };

  return {
    token: signToken(payload),
    user: toPublicUser(user),
  };
}

module.exports = {
  login,
  verifyToken,
};
