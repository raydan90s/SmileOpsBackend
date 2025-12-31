const express = require('express');
const router = express.Router();
const {
  fetchAllSubclasificaciones,
  getSubclasificacionByIdController,
  obtenerSubclasificacionPorDescripcion,
  fetchSubclasificacionesActivas,
  fetchSubclasificacionesByClasificacion,
  crearSubclasificacionController,
  actualizarSubclasificacionController,
  eliminarSubclasificacionController
} = require('@controllers/subclasificacion/subclasificacion.controller');

router.get('/', fetchAllSubclasificaciones);
router.get('/activas', fetchSubclasificacionesActivas);
router.get('/clasificacion/:idClasificacion', fetchSubclasificacionesByClasificacion);
router.get('/descripcion/:descripcion', obtenerSubclasificacionPorDescripcion);
router.get('/:id', getSubclasificacionByIdController);
router.post('/', crearSubclasificacionController);
router.put('/:id', actualizarSubclasificacionController);
router.delete('/:id', eliminarSubclasificacionController);

module.exports = router;