const express = require('express');
const router = express.Router();

const {
  fetchAllModelos,
  fetchAllModelosCompleto,
  getModeloByIdController,
  crearModeloController,
  actualizarModeloController,
  eliminarModeloController
} = require('@controllers/modelo/modelo.controller');

// ============================================
// RUTAS DE CONSULTA (GET)
// ============================================

// Obtener todos los modelos activos
router.get('/', fetchAllModelos);

// Obtener todos los modelos (incluyendo inactivos)
router.get('/completo', fetchAllModelosCompleto);

// Obtener modelo por ID
router.get('/:id', getModeloByIdController);

// ============================================
// RUTAS DE CREACIÓN (POST)
// ============================================

// Crear nuevo modelo
router.post('/', crearModeloController);

// ============================================
// RUTAS DE ACTUALIZACIÓN (PUT)
// ============================================

// Actualizar modelo
router.put('/:id', actualizarModeloController);

// ============================================
// RUTAS DE ELIMINACIÓN (DELETE)
// ============================================

// Eliminar modelo (borrado lógico)
router.delete('/:id', eliminarModeloController);

module.exports = router;