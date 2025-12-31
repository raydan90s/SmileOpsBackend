const express = require('express');
const router = express.Router();

const {
  fetchAllTiposInstrumental,
  fetchAllTiposInstrumentalCompleto,
  getTipoInstrumentalByIdController,
  crearTipoInstrumentalController,
  actualizarTipoInstrumentalController,
  eliminarTipoInstrumentalController
} = require('@controllers/tipoInstrumental/tipoInstrumental.controller');

// ============================================
// RUTAS DE CONSULTA (GET)
// ============================================

// Obtener todos los tipos activos
router.get('/', fetchAllTiposInstrumental);

// Obtener todos los tipos (incluyendo inactivos)
router.get('/completo', fetchAllTiposInstrumentalCompleto);

// Obtener tipo por ID
router.get('/:id', getTipoInstrumentalByIdController);

// ============================================
// RUTAS DE CREACIÓN (POST)
// ============================================

// Crear nuevo tipo
router.post('/', crearTipoInstrumentalController);

// ============================================
// RUTAS DE ACTUALIZACIÓN (PUT)
// ============================================

// Actualizar tipo
router.put('/:id', actualizarTipoInstrumentalController);

// ============================================
// RUTAS DE ELIMINACIÓN (DELETE)
// ============================================

// Eliminar tipo (borrado lógico)
router.delete('/:id', eliminarTipoInstrumentalController);

module.exports = router;