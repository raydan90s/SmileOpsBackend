const express = require('express');
const router = express.Router();
const {
  fetchAllProductos,
  getProductoByIdController,
  getProductoByCodigoController,
  getProductosBySubclasificacionController,
  getProductosByMarcaController,
  getProductosByNombreController,
  crearProductoController,
  actualizarProductoController,
  eliminarProductoController,
  getNextCodigoProductoController
} = require('@controllers/inventarioProductos/inventarioProductos.controller');

router.get('/', fetchAllProductos);
router.get('/:id', getProductoByIdController);
router.get('/codigo/:codigo', getProductoByCodigoController);
router.get('/subclasificacion/:id', getProductosBySubclasificacionController);
router.get('/marca/:id', getProductosByMarcaController);
router.get('/nombre/:nombre', getProductosByNombreController);

router.post('/', crearProductoController);
router.put('/:id', actualizarProductoController);
router.delete('/:id', eliminarProductoController);
router.get('/next-codigo/:iid_subclasificacion', getNextCodigoProductoController);

module.exports = router;