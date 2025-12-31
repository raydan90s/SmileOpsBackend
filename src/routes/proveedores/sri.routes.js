const express = require('express');
const router = express.Router();
const { consultarSRIController } = require('@controllers/proveedores/sri.controller');

router.post('/consultar', consultarSRIController);

module.exports = router;