const express = require('express');
const router = express.Router();
const { 
  fetchReporteCompleto,
  fetchAllTratamientos,
  getTratamientoByIdController,
  createTratamientoController,
  updateTratamientoController,
  deleteTratamientoController
} = require('@controllers/tratamientos/tratamientos.controller');

// GET /tratamientos/reporte → Tu reporte original de precios/servicios
router.get('/reporte', fetchReporteCompleto);

// GET /tratamientos → Listado simple CRUD
router.get('/', fetchAllTratamientos);

// GET /tratamientos/:idEsp/:idTrat → Obtener uno específico (Llave compuesta)
router.get('/:idEsp/:idTrat', getTratamientoByIdController);

// POST /tratamientos
router.post('/', createTratamientoController);

// PUT /tratamientos/:idEsp/:idTrat
router.put('/:idEsp/:idTrat', updateTratamientoController);

// DELETE /tratamientos/:idEsp/:idTrat
router.delete('/:idEsp/:idTrat', deleteTratamientoController);

module.exports = router;