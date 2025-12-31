const express = require('express');
const router = express.Router();
const { 
  fetchAllTratamientosDetalle,
  getTratamientoDetalleByIdController,
  createTratamientoDetalleController,
  updateTratamientoDetalleController,
  deleteTratamientoDetalleController
} = require('@controllers/tratamientoDetalle/tratamientoDetalle.controller');

router.get('/', fetchAllTratamientosDetalle);
router.get('/:id', getTratamientoDetalleByIdController);
router.post('/', createTratamientoDetalleController);
router.put('/:id', updateTratamientoDetalleController);
router.delete('/:id', deleteTratamientoDetalleController);

module.exports = router;