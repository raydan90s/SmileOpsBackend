const express = require('express');
const router = express.Router();
const {
  fetchAllProveedores,
  getProveedorByIdController,
  getDireccionesProveedorController,
  createProveedorController,
  updateProveedorController,
  deleteProveedorController,
  createDireccionController,
  updateDireccionController,
  deleteDireccionController
} = require('@controllers/proveedores/proveedores.controller');

router.get('/', fetchAllProveedores);
router.get('/:id', getProveedorByIdController);
router.post('/', createProveedorController);
router.put('/:id', updateProveedorController);
router.delete('/:id', deleteProveedorController);

router.get('/:id/direcciones', getDireccionesProveedorController);
router.post('/direcciones', createDireccionController);
router.put('/direcciones/:id', updateDireccionController);
router.delete('/direcciones/:id', deleteDireccionController);

module.exports = router;