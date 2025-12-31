const {
    getAllRequisiciones,
    getRequisicionById,
    createRequisicion,
    updateRequisicion,
    aprobarRequisicion,
    rechazarRequisicion,
    entregarRequisicion,
    getEstadosRequisicion,
    getNextRequisicionIdFromSequence
} = require('@models/requisicion/requisicion.model');

const fetchAllRequisiciones = async (req, res) => {
    try {
        const filters = {
            iid_estado_requisicion: req.query.iid_estado_requisicion,
            iid_bodega_solicita: req.query.iid_bodega_solicita,
            iid_bodega_origen: req.query.iid_bodega_origen,
            fecha_desde: req.query.fecha_desde,
            fecha_hasta: req.query.fecha_hasta
        };

        const requisiciones = await getAllRequisiciones(filters);
        res.status(200).json({ success: true, data: requisiciones });
    } catch (err) {
        console.error('Error obteniendo requisiciones:', err);
        res.status(500).json({
            success: false,
            message: 'Error al obtener requisiciones',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const getRequisicionByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const requisicion = await getRequisicionById(id);

        if (!requisicion) {
            return res.status(404).json({
                success: false,
                message: 'Requisición no encontrada'
            });
        }

        res.status(200).json({ success: true, data: requisicion });
    } catch (err) {
        console.error('Error obteniendo requisición:', err);
        res.status(500).json({
            success: false,
            message: 'Error al obtener requisición',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const createRequisicionController = async (req, res) => {
    try {
        const usuarioLogueado = req.user;

        if (!usuarioLogueado || !usuarioLogueado.iid) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado. Inicie sesión nuevamente.'
            });
        }

        const {
            iid_bodega_solicita,
            iid_bodega_origen,
            v_observaciones,
            detalles
        } = req.body;

        if (!iid_bodega_solicita) {
            return res.status(400).json({
                success: false,
                message: 'Debe seleccionar una bodega solicitante'
            });
        }

        if (!iid_bodega_origen) {
            return res.status(400).json({
                success: false,
                message: 'Debe seleccionar una bodega de origen'
            });
        }

        if (iid_bodega_solicita === iid_bodega_origen) {
            return res.status(400).json({
                success: false,
                message: 'La bodega solicitante y la bodega de origen no pueden ser la misma'
            });
        }

        if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe incluir al menos un producto en el detalle de la requisición'
            });
        }

        const detallesInvalidos = detalles.filter(d => !d.iid_inventario || !d.cantidad_solicitada || d.cantidad_solicitada <= 0);
        if (detallesInvalidos.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Todos los productos deben tener un inventario válido y cantidad mayor a 0'
            });
        }

        const requisicionData = {
            iid_bodega_solicita,
            iid_bodega_origen,
            v_observaciones: v_observaciones || null,
            iid_usuario_solicita: usuarioLogueado.iid,
            detalles
        };

        const nuevaRequisicion = await createRequisicion(requisicionData);

        res.status(201).json({
            success: true,
            message: 'Requisición creada exitosamente',
            data: nuevaRequisicion
        });

    } catch (err) {
        console.error('Error creando requisición:', err);

        if (err.message && err.message.includes('Usuario no identificado')) {
            return res.status(403).json({
                success: false,
                message: 'No se pudo identificar el usuario para auditoría'
            });
        }

        if (err.code === '23503') {
            return res.status(400).json({
                success: false,
                message: 'Error de referencia: Verifique productos y bodegas.'
            });
        }

        if (err.code === '23514' && err.message.includes('chk_req_bodegas_diferentes')) {
            return res.status(400).json({
                success: false,
                message: 'La bodega solicitante y la bodega de origen no pueden ser la misma'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al crear requisición',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const updateRequisicionController = async (req, res) => {
    try {
        const { id } = req.params;
        const requisicionActualizada = await updateRequisicion(parseInt(id), req.body, req);

        res.status(200).json({
            success: true,
            message: 'Requisición actualizada exitosamente',
            data: requisicionActualizada
        });
    } catch (err) {
        console.error('Error actualizando requisición:', err);

        if (err.message.includes('no encontrada') || err.message.includes('SOLICITADA')) {
            return res.status(400).json({ success: false, message: err.message });
        }

        res.status(500).json({
            success: false,
            message: 'Error al actualizar requisición',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const aprobarRequisicionController = async (req, res) => {
    try {
        const { id } = req.params;
        const { v_observaciones, detalles } = req.body;
        const usuarioLogueado = req.user;

        if (!usuarioLogueado || !usuarioLogueado.iid) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe incluir las cantidades aprobadas'
            });
        }

        const detallesInvalidos = detalles.filter(d =>
            !d.iid_inventario ||
            d.cantidad_aprobada === undefined ||
            d.cantidad_aprobada === null ||
            d.cantidad_aprobada < 0
        );

        if (detallesInvalidos.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Todos los productos deben tener una cantidad aprobada válida (mayor o igual a 0)'
            });
        }

        const requisicionAprobada = await aprobarRequisicion(
            parseInt(id),
            {
                iid_usuario_aprueba: usuarioLogueado.iid,
                v_observaciones: v_observaciones || null,
                detalles
            }
        );

        res.status(200).json({
            success: true,
            message: 'Requisición aprobada exitosamente',
            data: requisicionAprobada
        });
    } catch (err) {
        console.error('Error aprobando requisición:', err);

        if (err.message.includes('no encontrada') || err.message.includes('SOLICITADA')) {
            return res.status(400).json({ success: false, message: err.message });
        }

        res.status(500).json({
            success: false,
            message: 'Error al aprobar requisición',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const rechazarRequisicionController = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioLogueado = req.user;
        const { v_observaciones } = req.body;

        if (!usuarioLogueado || !usuarioLogueado.iid) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        if (!v_observaciones || v_observaciones.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'El motivo de rechazo es obligatorio'
            });
        }

        const requisicionRechazada = await rechazarRequisicion(
            parseInt(id),
            {
                iid_usuario_aprueba: usuarioLogueado.iid,
                v_observaciones
            }
        );

        res.status(200).json({
            success: true,
            message: 'Requisición rechazada',
            data: requisicionRechazada
        });
    } catch (err) {
        console.error('Error rechazando requisición:', err);

        if (err.message.includes('no encontrada') || err.message.includes('rechazada')) {
            return res.status(400).json({ success: false, message: err.message });
        }

        res.status(500).json({
            success: false,
            message: 'Error al rechazar requisición',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const entregarRequisicionController = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioLogueado = req.user;
        const { v_observaciones } = req.body;

        if (!usuarioLogueado || !usuarioLogueado.iid) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const requisicionEntregada = await entregarRequisicion(
            parseInt(id),
            {
                iid_usuario_entrega: usuarioLogueado.iid,
                v_observaciones: v_observaciones || null
            }
        );

        res.status(200).json({
            success: true,
            message: 'Requisición entregada exitosamente',
            data: requisicionEntregada
        });
    } catch (err) {
        console.error('Error entregando requisición:', err);

        if (err.message.includes('no encontrada') || err.message.includes('APROBADA')) {
            return res.status(400).json({ success: false, message: err.message });
        }

        res.status(500).json({
            success: false,
            message: 'Error al entregar requisición',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const fetchEstadosRequisicion = async (req, res) => {
    try {
        const estados = await getEstadosRequisicion();
        res.status(200).json({ success: true, data: estados });
    } catch (err) {
        console.error('Error obteniendo estados de requisición:', err);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estados de requisición',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const fetchNextRequisicionId = async (req, res) => {
    try {
        const nextId = await getNextRequisicionIdFromSequence();
        res.status(200).json({
            success: true,
            data: { next_id: nextId }
        });
    } catch (err) {
        console.error('Error obteniendo siguiente ID de requisición:', err);
        res.status(500).json({
            success: false,
            message: 'Error al obtener siguiente ID de requisición',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

module.exports = {
    fetchAllRequisiciones,
    getRequisicionByIdController,
    createRequisicionController,
    updateRequisicionController,
    aprobarRequisicionController,
    rechazarRequisicionController,
    entregarRequisicionController,
    fetchEstadosRequisicion,
    fetchNextRequisicionId
};