const express = require('express');
const router = express.Router();
const {
  fetchAllClasificaciones,
  getClasificacionByIdController,
  obtenerClasificacionPorDescripcion,
  fetchClasificacionesActivas,
  crearClasificacionController,
  actualizarClasificacionController,
  eliminarClasificacionController
} = require('@controllers/clasificacion/clasificacion.controller');

router.get('/', fetchAllClasificaciones);
router.get('/activas', fetchClasificacionesActivas);
router.get('/descripcion/:descripcion', obtenerClasificacionPorDescripcion);
router.get('/:id', getClasificacionByIdController);
router.post('/', crearClasificacionController);
router.put('/:id', actualizarClasificacionController);
router.delete('/:id', eliminarClasificacionController);

module.exports = router;