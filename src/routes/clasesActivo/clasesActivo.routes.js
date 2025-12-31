const express = require('express');
const router = express.Router();
const {
  fetchAllClasesActivo,
  getClaseActivoByIdController,
  obtenerClaseActivoPorNombre,
  fetchClasesActivoActivas,
  crearClaseActivoController,
  actualizarClaseActivoController,
  eliminarClaseActivoController
} = require('@controllers/clases-activo/clases-activo.controller');

router.get('/', fetchAllClasesActivo);
router.get('/activas', fetchClasesActivoActivas);
router.get('/nombre/:nombre', obtenerClaseActivoPorNombre);
router.get('/:id', getClaseActivoByIdController);
router.post('/', crearClaseActivoController);
router.put('/:id', actualizarClaseActivoController);
router.delete('/:id', eliminarClaseActivoController);

module.exports = router;