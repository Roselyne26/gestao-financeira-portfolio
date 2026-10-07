const { authenticate, requireMaster } = require('../middleware/auth');

module.exports = {
  requireAuth: authenticate,
  requireMaster,
};
