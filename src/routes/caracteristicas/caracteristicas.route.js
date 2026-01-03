const express = require('express');
const router = express.Router();
const {
  fetchAllCaracteristicas,
  getCaracteristicaByIdController,
  obtenerCaracteristicaPorNombre,
  fetchCaracteristicasActivas,
  crearCaracteristicaController,
  actualizarCaracteristicaController,
  eliminarCaracteristicaController,
  activarCaracteristicaController
} = require('@controllers/caracteristicas/caracteristicas.controller');

router.get('/', fetchAllCaracteristicas);
router.get('/activas', fetchCaracteristicasActivas);
router.get('/nombre/:nombre', obtenerCaracteristicaPorNombre);
router.get('/:id', getCaracteristicaByIdController);
router.post('/', crearCaracteristicaController);
router.put('/:id', actualizarCaracteristicaController);
router.delete('/:id', eliminarCaracteristicaController);
router.put('/:id/activar', activarCaracteristicaController);
module.exports = router;