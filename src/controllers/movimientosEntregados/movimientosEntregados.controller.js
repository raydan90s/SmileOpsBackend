const {
    getPedidosRecibidosParaReporte,
    getRequisicionesEntregadasParaReporte
} = require('@models/movimientosEntregados/movimientosEntregados.model');

const getMovimientosEntregados = async (req, res) => {
    try {
        const {
            bodegaId,
            fechaDesde,
            fechaHasta,
            tipoMovimiento
        } = req.query;

        const movimientos = [];

        if (tipoMovimiento === 'pedido' || tipoMovimiento === 'todos') {
            const pedidos = await getPedidosRecibidosParaReporte({
                iid_bodega_destino: bodegaId,
                fecha_desde: fechaDesde,
                fecha_hasta: fechaHasta
            });

            pedidos.forEach(pedido => {
                if (!pedido.detalles || pedido.detalles.length === 0) return;

                pedido.detalles.forEach(detalle => {
                    movimientos.push({
                        iid_movimiento: pedido.iid_pedido,
                        tipo_movimiento: 'PEDIDO',
                        d_fecha_entrega: pedido.d_fecha_entrega,
                        codigo_producto: detalle.codigo_producto || '',
                        nombre_producto: detalle.nombre_producto || 'Producto sin nombre',
                        cantidad_entregada: detalle.cantidad_recibida || detalle.cantidad_solicitada,
                        unidad_consumo: detalle.unidad_compra_abreviatura || 'UND',
                        bodega_origen: 'PROVEEDOR EXTERNO',
                        bodega_destino: pedido.bodega_destino_nombre || 'Sin bodega',
                        iid_bodega_destino: pedido.iid_bodega_destino,
                        usuario_entrego: pedido.usuario_recibio_nombre || pedido.usuario_solicita_nombre || 'Sin usuario',
                        iid_usuario_entrego: pedido.iid_usuario_recibio || pedido.iid_usuario_solicita,
                        proveedor: pedido.proveedor_nombre || undefined,
                        iid_proveedor: pedido.iid_proveedor || undefined,
                        numero_factura: pedido.numero_factura || undefined,
                        iid_factura: pedido.iid_factura || undefined,
                        observaciones: pedido.v_observaciones || undefined
                    });
                });
            });
        }

        if (tipoMovimiento === 'requisicion' || tipoMovimiento === 'todos') {
            const requisiciones = await getRequisicionesEntregadasParaReporte({
                iid_bodega: bodegaId,
                fecha_desde: fechaDesde,
                fecha_hasta: fechaHasta
            });

            requisiciones.forEach(requisicion => {
                if (!requisicion.detalles || requisicion.detalles.length === 0) return;

                requisicion.detalles.forEach(detalle => {
                    movimientos.push({
                        iid_movimiento: requisicion.iid_requisicion,
                        tipo_movimiento: 'REQUISICION',
                        d_fecha_entrega: requisicion.d_fecha_entrega || requisicion.d_fecha_solicitud,
                        codigo_producto: detalle.codigo_producto || '',
                        nombre_producto: detalle.nombre_producto || 'Producto sin nombre',
                        cantidad_entregada: detalle.cantidad_aprobada || detalle.cantidad_solicitada,
                        unidad_consumo: detalle.unidad_consumo_abreviatura || 'UND',
                        bodega_origen: requisicion.bodega_origen_nombre || 'Sin bodega origen',
                        bodega_destino: requisicion.bodega_solicita_nombre || 'Sin bodega destino',
                        iid_bodega_origen: requisicion.iid_bodega_origen,
                        iid_bodega_destino: requisicion.iid_bodega_solicita,
                        usuario_entrego: requisicion.usuario_entrega_nombre || 'Sin usuario',
                        iid_usuario_entrego: requisicion.iid_usuario_entrega || 0,
                        observaciones: requisicion.v_observaciones || undefined
                    });
                });
            });
        }

        movimientos.sort((a, b) => {
            const fechaA = new Date(a.d_fecha_entrega).getTime();
            const fechaB = new Date(b.d_fecha_entrega).getTime();
            return fechaB - fechaA;
        });

        res.status(200).json({
            success: true,
            data: movimientos,
            summary: {
                total: movimientos.length,
                pedidos: movimientos.filter(m => m.tipo_movimiento === 'PEDIDO').length,
                requisiciones: movimientos.filter(m => m.tipo_movimiento === 'REQUISICION').length,
                con_factura: movimientos.filter(m => m.numero_factura).length
            }
        });

    } catch (err) {
        console.error('❌ Error obteniendo movimientos entregados:', err);
        res.status(500).json({
            success: false,
            message: 'Error al obtener movimientos entregados',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

module.exports = {
    getMovimientosEntregados
};