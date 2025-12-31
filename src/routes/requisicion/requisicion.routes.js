const express = require('express');
const router = express.Router();
const {
    fetchAllRequisiciones,
    getRequisicionByIdController,
    createRequisicionController,
    updateRequisicionController,
    aprobarRequisicionController,
    rechazarRequisicionController,
    entregarRequisicionController,
    fetchEstadosRequisicion,
    fetchNextRequisicionId
} = require('@controllers/requisicion/requisicion.controller');

// Rutas de utilidad
router.get('/estados', fetchEstadosRequisicion);
router.get('/next-id', fetchNextRequisicionId);

// CRUD básico
router.get('/', fetchAllRequisiciones);
router.get('/:id', getRequisicionByIdController);
router.post('/', createRequisicionController);
router.put('/:id', updateRequisicionController);

// Acciones de estado
router.patch('/:id/aprobar', aprobarRequisicionController);
router.patch('/:id/rechazar', rechazarRequisicionController);
router.patch('/:id/entregar', entregarRequisicionController);

module.exports = router;