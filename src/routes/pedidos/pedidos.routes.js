const express = require('express');
const router = express.Router();
const {
    fetchAllPedidos,
    getPedidoByIdController,
    createPedidoController,
    updatePedidoController,
    cotizarPedidoController,
    aprobarPedidoController,
    rechazarPedidoController,
    recibirPedidoController,
    registrarFacturaController,
    fetchTiposPedido,
    fetchEstadosPedido,
    fetchNextPedidoId,
    aprobarCotizacionFinalController,
    actualizarPedidoCotizadoController
} = require('@controllers/pedidos/pedidos.controller');

router.get('/tipos', fetchTiposPedido);
router.get('/estados', fetchEstadosPedido);
router.get('/next-id', fetchNextPedidoId);

router.get('/', fetchAllPedidos);
router.get('/:id', getPedidoByIdController);
router.post('/', createPedidoController);
router.put('/:id', updatePedidoController);
router.put('/:id/actualizar-cotizacion', actualizarPedidoCotizadoController);

router.patch('/:id/cotizar', cotizarPedidoController);
router.patch('/:id/aprobar', aprobarPedidoController);
router.patch('/:id/rechazar', rechazarPedidoController);
router.patch('/:id/recibir', recibirPedidoController);
router.patch('/:id/aprobar-cotizacion', aprobarCotizacionFinalController);

router.post('/:id/factura', registrarFacturaController);

module.exports = router;