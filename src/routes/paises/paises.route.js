const express = require('express');
const router = express.Router();
const { 
  fetchAllPaises, 
  getPaisByIdController, 
  createPaisController, 
  updatePaisController, 
  deletePaisController 
} = require('@controllers/paises/paises.controller');

router.get('/', fetchAllPaises);

router.get('/:id', getPaisByIdController);

router.post('/', createPaisController);

router.put('/:id', updatePaisController);

router.delete('/:id', deletePaisController);

module.exports = router;
