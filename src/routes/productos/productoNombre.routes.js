const express = require('express');
const router = express.Router();
const {
    fetchAllProductosNombre,
    getProductoNombreByIdController,
    createProductoNombreController,
    updateProductoNombreController,
    deleteProductoNombreController,
    activateProductoNombreController
} = require('@controllers/producto/productoNombre.controller');

router.get('/', fetchAllProductosNombre);
router.get('/:id', getProductoNombreByIdController);
router.post('/', createProductoNombreController);
router.put('/:id', updateProductoNombreController);
router.delete('/:id', deleteProductoNombreController);
router.put('/:id/activar', activateProductoNombreController);
module.exports = router;