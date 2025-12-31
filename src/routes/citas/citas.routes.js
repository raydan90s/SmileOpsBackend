const express = require('express');
const router = express.Router();
const { 
  fetchAllCitas,
  getCitaByIdController,
  createCitaController, 
  updateEstadoCitaController,
  deleteCitaController
} = require('@controllers/citas/citas.controller');

router.get('/', fetchAllCitas);
router.get('/:id', getCitaByIdController);
router.post('/', createCitaController);
router.patch('/:id/estado', updateEstadoCitaController);
router.delete('/:id', deleteCitaController);

module.exports = router;