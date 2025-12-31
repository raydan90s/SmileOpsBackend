const express = require('express');
const router = express.Router();
const {
    crearPacienteController,
    obtenerPacientePorNombre,
    fetchAllPacientes,
    getPacienteByIdController,
    obtenerPacientePorCedula,
    obtenerSiguienteFicha,
    actualizarPacienteController,
    getPacienteCompletoController,
    desactivarPacienteController,
    activarPacienteController
} = require('@controllers/paciente/paciente.controller');

router.get('/', fetchAllPacientes);
router.get('/next-ficha', obtenerSiguienteFicha);
router.get('/cedula/:cedula', obtenerPacientePorCedula);
router.get('/nombre/:nombre', obtenerPacientePorNombre);
router.get('/completo/:id', getPacienteCompletoController);
router.post('/', crearPacienteController);
router.put('/:id', actualizarPacienteController);
router.patch('/:id/desactivar', desactivarPacienteController);
router.patch('/:id/activar', activarPacienteController);
router.get('/:id', getPacienteByIdController);

module.exports = router;
