const express = require('express');
const router = express.Router();
const {
    fetchAllTiposProveedor,
    getTipoProveedorByIdController,
    createTipoProveedorController,
    updateTipoProveedorController,
    deleteTipoProveedorController
} = require('@controllers/proveedores/tiposProveedor.controller');

router.get('/', fetchAllTiposProveedor);
router.get('/:id', getTipoProveedorByIdController);
router.post('/', createTipoProveedorController);
router.put('/:id', updateTipoProveedorController);
router.delete('/:id', deleteTipoProveedorController);

module.exports = router;