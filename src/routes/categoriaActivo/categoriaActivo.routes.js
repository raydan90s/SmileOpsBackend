const express = require('express');
const router = express.Router();

const {
  fetchAllCategoriasActivos,
  fetchAllCategoriasActivosCompleto,
  getCategoriaActivoByIdController,
  crearCategoriaActivoController,
  actualizarCategoriaActivoController,
  eliminarCategoriaActivoController
} = require('@controllers/categoriaActivo/categoriaActivo.controller');

// ============================================
// RUTAS DE CONSULTA (GET)
// ============================================

// Obtener todas las categorías activas
router.get('/', fetchAllCategoriasActivos);

// Obtener todas las categorías (incluyendo inactivas)
router.get('/completo', fetchAllCategoriasActivosCompleto);

// Obtener categoría por ID
router.get('/:id', getCategoriaActivoByIdController);

// ============================================
// RUTAS DE CREACIÓN (POST)
// ============================================

// Crear nueva categoría
router.post('/', crearCategoriaActivoController);

// ============================================
// RUTAS DE ACTUALIZACIÓN (PUT)
// ============================================

// Actualizar categoría
router.put('/:id', actualizarCategoriaActivoController);

// ============================================
// RUTAS DE ELIMINACIÓN (DELETE)
// ============================================

// Eliminar categoría (borrado lógico)
router.delete('/:id', eliminarCategoriaActivoController);

module.exports = router;