const express = require('express');
const router = express.Router();
const {
    fetchAllProductosNombre,
    getProductoNombreByIdController,
    createProductoNombreController,
    updateProductoNombreController,
    deleteProductoNombreController
} = require('@controllers/producto/productoNombre.controller');

router.get('/', fetchAllProductosNombre);
router.get('/:id', getProductoNombreByIdController);
router.post('/', createProductoNombreController);
router.put('/:id', updateProductoNombreController);
router.delete('/:id', deleteProductoNombreController);

module.exports = router;