const express = require('express');
const router = express.Router();
const {
  fetchAllEstadosOperativos,
  getEstadoOperativoByIdController,
  obtenerEstadoOperativoPorNombre,
  fetchEstadosOperativosActivos,
  crearEstadoOperativoController,
  actualizarEstadoOperativoController,
  eliminarEstadoOperativoController
} = require('@controllers/estados-operativos/estados-operativos.controller');

// ============================================
// RUTAS (Sin autenticación requerida)
// ============================================

// GET /estados-operativos - Obtener todos los estados operativos
router.get('/', fetchAllEstadosOperativos);

// GET /estados-operativos/activos - Obtener solo estados operativos activos
router.get('/activos', fetchEstadosOperativosActivos);

// GET /estados-operativos/nombre/:nombre - Buscar por nombre
router.get('/nombre/:nombre', obtenerEstadoOperativoPorNombre);

// GET /estados-operativos/:id - Obtener estado operativo por ID
router.get('/:id', getEstadoOperativoByIdController);

// POST /estados-operativos - Crear nuevo estado operativo
router.post('/', crearEstadoOperativoController);

// PUT /estados-operativos/:id - Actualizar estado operativo
router.put('/:id', actualizarEstadoOperativoController);

// DELETE /estados-operativos/:id - Desactivar estado operativo (soft delete)
router.delete('/:id', eliminarEstadoOperativoController);

module.exports = router;