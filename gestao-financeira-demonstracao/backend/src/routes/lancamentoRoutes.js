const express = require('express');
const controller = require('../controllers/lancamentoController');

const router = express.Router();

router.get('/', controller.listar);
router.get('/resumo', controller.resumo);
router.post('/', controller.criar);
router.delete('/:id', controller.remover);

module.exports = router;
