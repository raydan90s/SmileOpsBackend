const express = require('express');
const router = express.Router();
const {
  fetchAllBodegas,
  getBodegaByIdController,
  createBodegaController,
  updateBodegaController,
  deleteBodegaController,
  fetchBodegasPrincipales
} = require('@controllers/bodegas/bodegas.controller');

router.get('/', fetchAllBodegas);
router.get('/principales', fetchBodegasPrincipales);
router.get('/:id', getBodegaByIdController);
router.post('/', createBodegaController);
router.put('/:id', updateBodegaController);
router.delete('/:id', deleteBodegaController);

module.exports = router;