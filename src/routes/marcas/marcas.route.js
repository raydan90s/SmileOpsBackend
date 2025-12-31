const express = require('express');
const router = express.Router();
const {
  fetchAllMarcas,
  getMarcaByIdController,
  obtenerMarcaPorNombre,
  fetchMarcasActivas,
  crearMarcaController,
  actualizarMarcaController,
  eliminarMarcaController
} = require('@controllers/marcas/marcas.controller');

// GET /marcas - Obtener todas las marcas
router.get('/', fetchAllMarcas);

// GET /marcas/activas - Obtener solo marcas activas
router.get('/activas', fetchMarcasActivas);

// GET /marcas/nombre/:nombre - Buscar por nombre
router.get('/nombre/:nombre', obtenerMarcaPorNombre);

// GET /marcas/:id - Obtener marca por ID
router.get('/:id', getMarcaByIdController);

// POST /marcas - Crear nueva marca
router.post('/', crearMarcaController);

// PUT /marcas/:id - Actualizar marca
router.put('/:id', actualizarMarcaController);

// DELETE /marcas/:id - Desactivar marca (soft delete)
router.delete('/:id', eliminarMarcaController);

module.exports = router;