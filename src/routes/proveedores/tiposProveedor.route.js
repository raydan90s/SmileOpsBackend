const express = require('express');
const router = express.Router();
const {
    fetchAllTiposProveedor,
    getTipoProveedorByIdController,
    createTipoProveedorController,
    updateTipoProveedorController,
    deleteTipoProveedorController
} = require('@controllers/proveedores/tiposProveedor.controller');

// GET /tipos-proveedor → obtener todos los tipos de proveedor activos
router.get('/', fetchAllTiposProveedor);

// GET /tipos-proveedor/:id → obtener tipo de proveedor por ID
router.get('/:id', getTipoProveedorByIdController);

// POST /tipos-proveedor → crear nuevo tipo de proveedor
router.post('/', createTipoProveedorController);

// PUT /tipos-proveedor/:id → actualizar tipo de proveedor
router.put('/:id', updateTipoProveedorController);

// DELETE /tipos-proveedor/:id → desactivar tipo de proveedor
router.delete('/:id', deleteTipoProveedorController);

module.exports = router;