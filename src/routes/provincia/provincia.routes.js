const express = require('express');
const router = express.Router();
const {
  fetchAllProvincias,
  getProvinciaByIdController,
  createProvinciaController,
  updateProvinciaController,
  deleteProvinciaController
} = require('@controllers/provincia/provincia.controller');

router.get('/', fetchAllProvincias);
router.get('/:id', getProvinciaByIdController);
router.post('/', createProvinciaController);
router.put('/:id', updateProvinciaController);
router.delete('/:id', deleteProvinciaController);

module.exports = router;