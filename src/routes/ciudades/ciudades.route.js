const express = require('express');
const router = express.Router();
const {
  fetchAllCiudades,
  getCiudadByIdController
} = require('@controllers/ciudades/ciudades.controller');

router.get('/', fetchAllCiudades);
router.get('/:id', getCiudadByIdController);

module.exports = router;