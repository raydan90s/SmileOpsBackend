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

router.get('/', fetchAllMarcas);
router.get('/activas', fetchMarcasActivas);
router.get('/nombre/:nombre', obtenerMarcaPorNombre);
router.get('/:id', getMarcaByIdController);
router.post('/', crearMarcaController);
router.put('/:id', actualizarMarcaController);
router.delete('/:id', eliminarMarcaController);

module.exports = router;