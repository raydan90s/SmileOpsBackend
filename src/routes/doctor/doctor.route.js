const express = require('express');
const router = express.Router();
const { 
  fetchAllDoctores, 
  getDoctorByIdController,
  createDoctorController,
  updateDoctorController,
  deleteDoctorController
} = require('@controllers/doctor/doctor.controller');

router.get('/', fetchAllDoctores);
router.get('/:id', getDoctorByIdController);
router.post('/', createDoctorController);
router.put('/:id', updateDoctorController);
router.delete('/:id', deleteDoctorController);

module.exports = router;