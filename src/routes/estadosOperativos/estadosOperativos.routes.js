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

router.get('/', fetchAllEstadosOperativos);
router.get('/activos', fetchEstadosOperativosActivos);
router.get('/nombre/:nombre', obtenerEstadoOperativoPorNombre);
router.get('/:id', getEstadoOperativoByIdController);
router.post('/', crearEstadoOperativoController);
router.put('/:id', actualizarEstadoOperativoController);
router.delete('/:id', eliminarEstadoOperativoController);

module.exports = router;