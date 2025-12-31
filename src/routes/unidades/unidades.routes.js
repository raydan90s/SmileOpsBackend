const express = require('express');
const router = express.Router();
const {
  fetchAllUnidades,
  getUnidadByIdController,
  obtenerUnidadPorNombre,
  fetchUnidadesActivas,
  crearUnidadController,
  actualizarUnidadController,
  eliminarUnidadController
} = require('@controllers/unidades/unidades.controller');

router.get('/', fetchAllUnidades);
router.get('/activas', fetchUnidadesActivas);
router.get('/nombre/:nombre', obtenerUnidadPorNombre);
router.get('/:id', getUnidadByIdController);
router.post('/', crearUnidadController);
router.put('/:id', actualizarUnidadController);
router.delete('/:id', eliminarUnidadController);

module.exports = router;