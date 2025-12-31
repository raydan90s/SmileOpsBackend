const express = require('express');
const router = express.Router();
const {
    getAllEntidadesController,
    getEntidadByIdController,
    getEntidadByRucController,
    createEntidadController,
    updateEntidadController
} = require('@controllers/entidadesFacturadoras/entidadesFacturadoras.controller');

router.get('/', getAllEntidadesController);
router.get('/ruc/:ruc', getEntidadByRucController);
router.get('/:id', getEntidadByIdController);
router.post('/', createEntidadController);
router.put('/:id', updateEntidadController);

module.exports = router;