const express = require('express');
const router = express.Router();
const { 
  fetchAllConsultorios, 
  getConsultorioByIdController,
  createConsultorioController,
  updateConsultorioController,
  deleteConsultorioController
} = require('@controllers/consultorios/consultorios.controller');

router.get('/', fetchAllConsultorios);
router.get('/:id', getConsultorioByIdController);
router.post('/', createConsultorioController);
router.put('/:id', updateConsultorioController);
router.delete('/:id', deleteConsultorioController);

module.exports = router;