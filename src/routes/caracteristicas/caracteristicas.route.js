const express = require('express');
const router = express.Router();
const {
  fetchAllCaracteristicas,
  getCaracteristicaByIdController,
  obtenerCaracteristicaPorNombre,
  fetchCaracteristicasActivas,
  crearCaracteristicaController,
  actualizarCaracteristicaController,
  eliminarCaracteristicaController
} = require('@controllers/caracteristicas/caracteristicas.controller');

// ============================================
// RUTAS (Sin autenticación requerida)
// ============================================

// GET /caracteristicas - Obtener todas las características
router.get('/', fetchAllCaracteristicas);

// GET /caracteristicas/activas - Obtener solo características activas
router.get('/activas', fetchCaracteristicasActivas);

// GET /caracteristicas/nombre/:nombre - Buscar por nombre
router.get('/nombre/:nombre', obtenerCaracteristicaPorNombre);

// GET /caracteristicas/:id - Obtener característica por ID
router.get('/:id', getCaracteristicaByIdController);

// POST /caracteristicas - Crear nueva característica
router.post('/', crearCaracteristicaController);

// PUT /caracteristicas/:id - Actualizar característica
router.put('/:id', actualizarCaracteristicaController);

// DELETE /caracteristicas/:id - Desactivar característica (soft delete)
router.delete('/:id', eliminarCaracteristicaController);

module.exports = router;