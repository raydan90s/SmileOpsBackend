const {
    getAllPedidos,
    getPedidoById,
    createPedido,
    updatePedido,
    cotizarPedido,
    aprobarPedido,
    rechazarPedido,
    recibirPedido,
    registrarFacturaPedido,
    getTiposPedido,
    getEstadosPedido,
    getNextPedidoIdFromSequence,
    aprobarCotizacionFinal,
    actualizarPedidoCotizado
} = require('@models/pedidos/pedidos.model');

const fetchAllPedidos = async (req, res) => {
    try {
        const filters = {
            iid_estado_pedido: req.query.iid_estado_pedido,
            iid_tipo_pedido: req.query.iid_tipo_pedido,
            iid_bodega_destino: req.query.iid_bodega_destino,
            iid_proveedor: req.query.iid_proveedor,
            fecha_desde: req.query.fecha_desde,
            fecha_hasta: req.query.fecha_hasta
        };

        const pedidos = await getAllPedidos(filters);
        res.status(200).json({ success: true, data: pedidos });
    } catch (err) {
        console.error('Error obteniendo pedidos:', err);
        res.status(500).json({
            success: false,
            message: 'Error al obtener pedidos',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const getPedidoByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const pedido = await getPedidoById(id);

        if (!pedido) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        res.status(200).json({ success: true, data: pedido });
    } catch (err) {
        console.error('Error obteniendo pedido:', err);
        res.status(500).json({
            success: false,
            message: 'Error al obtener pedido',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const createPedidoController = async (req, res) => {
    try {
        const usuarioLogueado = req.user;

        if (!usuarioLogueado || !usuarioLogueado.iid) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado. Inicie sesión nuevamente.'
            });
        }

        const {
            iid_tipo_pedido,
            iid_bodega_destino,
            iid_proveedor,
            v_observaciones,
            detalles
        } = req.body;

        if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe incluir al menos un producto en el detalle del pedido'
            });
        }

        const detallesInvalidos = detalles.filter(d => !d.iid_inventario || !d.cantidad_solicitada || d.cantidad_solicitada <= 0);
        if (detallesInvalidos.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Todos los productos deben tener un inventario válido y cantidad mayor a 0'
            });
        }

        const pedidoData = {
            iid_tipo_pedido,
            iid_bodega_destino,
            iid_proveedor,
            v_observaciones: v_observaciones || null,
            iid_usuario_solicita: usuarioLogueado.iid,
            detalles
        };

        const nuevoPedido = await createPedido(pedidoData, req);

        res.status(201).json({
            success: true,
            message: 'Pedido creado exitosamente',
            data: nuevoPedido
        });

    } catch (err) {
        console.error('Error creando pedido:', err);

        if (err.message && err.message.includes('Usuario no identificado')) {
            return res.status(403).json({
                success: false,
                message: 'No se pudo identificar el usuario para auditoría'
            });
        }

        if (err.code === '23503') {
            return res.status(400).json({
                success: false,
                message: 'Error de referencia: Verifique productos, bodegas o proveedores.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al crear pedido',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const updatePedidoController = async (req, res) => {
    try {
        const { id } = req.params;
        const pedidoActualizado = await updatePedido(parseInt(id), req.body, req);

        res.status(200).json({
            success: true,
            message: 'Pedido actualizado exitosamente',
            data: pedidoActualizado
        });
    } catch (err) {
        console.error('Error actualizando pedido:', err);

        if (err.message.includes('no encontrado') || err.message.includes('PENDIENTE')) {
            return res.status(400).json({ success: false, message: err.message });
        }

        res.status(500).json({
            success: false,
            message: 'Error al actualizar pedido',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const cotizarPedidoController = async (req, res) => {
    try {
        const { id } = req.params;
        const { detalles, v_observaciones, iid_proveedor } = req.body;
        const usuarioLogueado = req.user;

        if (!usuarioLogueado || !usuarioLogueado.iid) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado o sesión inválida'
            });
        }

        if (!iid_proveedor) {
            return res.status(400).json({
                success: false,
                message: 'Debe seleccionar un proveedor para guardar la cotización'
            });
        }

        if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe incluir los productos con sus precios de cotización'
            });
        }

        const detallesInvalidos = detalles.filter(d =>
            !d.iid_inventario ||
            d.n_precio_unitario === undefined ||
            d.n_precio_unitario === null ||
            d.n_precio_unitario < 0
        );

        if (detallesInvalidos.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Todos los productos deben tener un precio unitario válido'
            });
        }

        const pedidoCotizado = await cotizarPedido(parseInt(id), {
            detalles,
            iid_proveedor,
            iid_usuario: usuarioLogueado.iid,
            v_observaciones: v_observaciones ? v_observaciones.trim() : null
        });

        res.status(200).json({
            success: true,
            message: 'Pedido cotizado y actualizado exitosamente',
            data: pedidoCotizado
        });

    } catch (err) {
        console.error('Error en cotizarPedidoController:', err);

        if (err.message.includes('no encontrado') || err.message.includes('estado válido')) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Ocurrió un error al procesar la cotización del pedido',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const aprobarPedidoController = async (req, res) => {
    try {
        const { id } = req.params;
        const { v_observaciones } = req.body;
        const usuarioLogueado = req.user;

        if (!usuarioLogueado || !usuarioLogueado.iid) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const pedidoAprobado = await aprobarPedido(
            parseInt(id),
            {
                iid_usuario_aprueba: usuarioLogueado.iid,
                v_observaciones: v_observaciones || undefined
            }
        );

        res.status(200).json({
            success: true,
            message: 'Pedido aprobado exitosamente',
            data: pedidoAprobado
        });
    } catch (err) {
        console.error('Error aprobando pedido:', err);

        if (err.message.includes('no encontrado') || err.message.includes('COTIZADO')) {
            return res.status(400).json({ success: false, message: err.message });
        }

        res.status(500).json({
            success: false,
            message: 'Error al aprobar pedido',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const rechazarPedidoController = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioLogueado = req.user;
        const { v_motivo_rechazo } = req.body;

        if (!usuarioLogueado || !usuarioLogueado.iid) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        if (!v_motivo_rechazo || v_motivo_rechazo.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'El motivo de rechazo es obligatorio'
            });
        }

        const pedidoRechazado = await rechazarPedido(
            parseInt(id),
            {
                iid_usuario_aprueba: usuarioLogueado.iid,
                v_motivo_rechazo
            },
            req
        );

        res.status(200).json({
            success: true,
            message: 'Pedido rechazado',
            data: pedidoRechazado
        });
    } catch (err) {
        console.error('Error rechazando pedido:', err);

        if (err.message.includes('no encontrado') || err.message.includes('rechazado')) {
            return res.status(400).json({ success: false, message: err.message });
        }

        res.status(500).json({
            success: false,
            message: 'Error al rechazar pedido',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const recibirPedidoController = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioLogueado = req.user;
        const { detalles, v_observaciones } = req.body;

        if (!usuarioLogueado || !usuarioLogueado.iid) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe incluir las cantidades recibidas'
            });
        }

        const pedidoRecibido = await recibirPedido(
            parseInt(id),
            {
                iid_usuario_recibe: usuarioLogueado.iid,
                detalles,
                v_observaciones: v_observaciones || null
            },
            req
        );

        res.status(200).json({
            success: true,
            message: 'Pedido recibido exitosamente',
            data: pedidoRecibido
        });
    } catch (err) {
        console.error('Error recibiendo pedido:', err);

        if (err.message.includes('no encontrado') || err.message.includes('APROBADO')) {
            return res.status(400).json({ success: false, message: err.message });
        }

        res.status(500).json({
            success: false,
            message: 'Error al recibir pedido',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const registrarFacturaController = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioLogueado = req.user;

        const {
            iid_entidad_facturadora,
            v_numero_factura,
            v_clave_acceso,
            v_numero_autorizacion,
            d_fecha_factura,
            d_fecha_autorizacion,
            n_subtotal_0,
            n_subtotal_iva,
            n_subtotal,
            n_iva,
            n_total,
            n_descuento,
            v_ruta_xml,
            v_ruta_pdf
        } = req.body;

        if (!usuarioLogueado || !usuarioLogueado.iid) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        }

        if (!iid_entidad_facturadora) {
            return res.status(400).json({ success: false, message: 'La entidad facturadora es obligatoria' });
        }

        if (!v_numero_factura || !d_fecha_factura) {
            return res.status(400).json({ success: false, message: 'Número de factura y fecha son obligatorios' });
        }

        if (n_subtotal_0 === undefined || n_subtotal_iva === undefined ||
            n_subtotal === undefined || n_iva === undefined || n_total === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Todos los valores monetarios (subtotales, iva, total) son obligatorios'
            });
        }

        if (v_clave_acceso && v_clave_acceso.length !== 49) {
            return res.status(400).json({ success: false, message: 'La clave de acceso debe tener exactamente 49 dígitos' });
        }

        if (n_total < 0 || n_subtotal < 0) {
            return res.status(400).json({ success: false, message: 'Los montos no pueden ser negativos' });
        }

        const facturaData = {
            iid_entidad_facturadora: parseInt(iid_entidad_facturadora),
            v_numero_factura,
            v_clave_acceso: v_clave_acceso || null,
            v_numero_autorizacion: v_numero_autorizacion || null,
            d_fecha_factura,
            d_fecha_autorizacion: d_fecha_autorizacion || null,
            n_subtotal_0: parseFloat(n_subtotal_0),
            n_subtotal_iva: parseFloat(n_subtotal_iva),
            n_subtotal: parseFloat(n_subtotal),
            n_iva: parseFloat(n_iva),
            n_descuento: parseFloat(n_descuento || 0),
            n_total: parseFloat(n_total),
            iid_usuario_registra: usuarioLogueado.iid,
            v_ruta_xml: v_ruta_xml || null,
            v_ruta_pdf: v_ruta_pdf || null
        };

        const pedidoActualizado = await registrarFacturaPedido(parseInt(id), facturaData);

        res.status(201).json({
            success: true,
            message: 'Factura registrada y vinculada exitosamente',
            data: pedidoActualizado
        });

    } catch (err) {
        console.error('Error registrando factura:', err);

        if (err.message.includes('no encontrado')) {
            return res.status(404).json({ success: false, message: err.message });
        }
        if (err.code === '23505') {
            if (err.constraint === 'uk_factura_proveedor_numero') {
                return res.status(400).json({
                    success: false,
                    message: 'Este número de factura ya está registrado para este proveedor.'
                });
            }
            if (err.constraint === 'uk_factura_clave_acceso') {
                return res.status(400).json({
                    success: false,
                    message: 'La clave de acceso (SRI) ya existe en el sistema.'
                });
            }
            if (err.constraint === 'uk_pedido_tiene_una_factura') {
                return res.status(400).json({
                    success: false,
                    message: 'Este pedido ya se encuentra vinculado a una factura.'
                });
            }
        }

        if (err.code === '23503') {
            return res.status(400).json({ success: false, message: 'Referencia inválida (Entidad o Usuario no existen).' });
        }

        res.status(500).json({
            success: false,
            message: 'Error al registrar factura',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const fetchTiposPedido = async (req, res) => {
    try {
        const tipos = await getTiposPedido();
        res.status(200).json({ success: true, data: tipos });
    } catch (err) {
        console.error('Error obteniendo tipos de pedido:', err);
        res.status(500).json({
            success: false,
            message: 'Error al obtener tipos de pedido',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const fetchEstadosPedido = async (req, res) => {
    try {
        const estados = await getEstadosPedido();
        res.status(200).json({ success: true, data: estados });
    } catch (err) {
        console.error('Error obteniendo estados de pedido:', err);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estados de pedido',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const fetchNextPedidoId = async (req, res) => {
    try {
        const nextId = await getNextPedidoIdFromSequence();
        res.status(200).json({
            success: true,
            data: { next_id: nextId }
        });
    } catch (err) {
        console.error('Error obteniendo siguiente ID de pedido:', err);
        res.status(500).json({
            success: false,
            message: 'Error al obtener siguiente ID de pedido',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const aprobarCotizacionFinalController = async (req, res) => {
    try {
        const { id } = req.params;
        const { v_observaciones } = req.body;
        const usuarioLogueado = req.user;

        if (!usuarioLogueado || !usuarioLogueado.iid) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const pedidoAprobado = await aprobarCotizacionFinal(
            parseInt(id),
            {
                iid_usuario_aprueba: usuarioLogueado.iid,
                v_observaciones: v_observaciones ? v_observaciones.trim() : null
            }
        );

        res.status(200).json({
            success: true,
            message: 'Cotización aprobada exitosamente. El pedido ahora está APROBADO.',
            data: pedidoAprobado
        });

    } catch (err) {
        console.error('Error aprobando cotización final:', err);

        if (err.message.includes('no encontrado') ||
            err.message.includes('estado') ||
            err.message.includes('sin precio')) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al aprobar la cotización final',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const actualizarPedidoCotizadoController = async (req, res) => {
    try {
        const { id } = req.params;
        const { detalles, iid_proveedor, v_observaciones } = req.body;
        const usuarioLogueado = req.user;

        if (!usuarioLogueado || !usuarioLogueado.iid) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        if (!iid_proveedor) {
            return res.status(400).json({
                success: false,
                message: 'Debe seleccionar un proveedor'
            });
        }

        if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe incluir al menos un producto'
            });
        }

        const productosSinPrecio = detalles.filter(
            d => !d.n_precio_unitario || d.n_precio_unitario <= 0
        );

        if (productosSinPrecio.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Todos los productos deben tener un precio unitario mayor a 0'
            });
        }

        const productosSinCantidad = detalles.filter(
            d => !d.cantidad_cotizada || d.cantidad_cotizada <= 0
        );

        if (productosSinCantidad.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Todos los productos deben tener una cantidad mayor a 0'
            });
        }

        const pedidoActualizado = await actualizarPedidoCotizado(parseInt(id), {
            detalles,
            iid_proveedor,
            iid_usuario: usuarioLogueado.iid,
            v_observaciones: v_observaciones ? v_observaciones.trim() : null
        });

        res.status(200).json({
            success: true,
            message: 'Cotización actualizada exitosamente',
            data: pedidoActualizado
        });

    } catch (err) {
        console.error('Error actualizando pedido cotizado:', err);

        if (err.message.includes('no encontrado')) {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        }

        if (err.message.includes('estado válido')) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al actualizar la cotización del pedido',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

module.exports = {
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
};