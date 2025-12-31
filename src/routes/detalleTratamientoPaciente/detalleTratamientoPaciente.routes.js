const express = require('express');
const router = express.Router();
const { 
  fetchAllDetallesCompleto, 
  fetchDetallesPorPaciente 
} = require('@controllers/detalleTratamientoPaciente/detalleTratamientoPaciente.controller');

router.get('/', fetchAllDetallesCompleto);
router.get('/:idPaciente', fetchDetallesPorPaciente);

module.exports = router;