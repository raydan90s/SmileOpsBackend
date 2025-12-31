const express = require('express');
const router = express.Router();
const { getMovimientosEntregados } = require('@controllers/movimientosEntregados/movimientosEntregados.controller');

router.get('/', getMovimientosEntregados);

module.exports = router;