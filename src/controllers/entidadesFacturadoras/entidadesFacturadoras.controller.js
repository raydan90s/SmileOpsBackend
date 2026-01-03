const {
    getAllEntidadesFacturadoras,
    getEntidadFacturadoraById,
    getEntidadFacturadoraByRuc,
    createEntidadFacturadora,
    updateEntidadFacturadora
} = require('@models/entidadesFacturadoras/entidadesFacturadoras.models');

const getAllEntidadesController = async (req, res) => {
    try {
        const { activo } = req.query;

        const filters = {};
        if (activo !== undefined) {
            filters.activo = activo === 'true';
        }

        const entidades = await getAllEntidadesFacturadoras(filters);

        res.status(200).json({
            success: true,
            data: entidades
        });
    } catch (err) {
        console.error('Error obteniendo entidades facturadoras:', err);
        res.status(500).json({
            success: false,
            message: 'Error al obtener entidades facturadoras',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const getEntidadByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const entidad = await getEntidadFacturadoraById(parseInt(id));

        if (!entidad) {
            return res.status(404).json({
                success: false,
                message: 'Entidad facturadora no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: entidad
        });
    } catch (err) {
        console.error('Error obteniendo entidad facturadora:', err);
        res.status(500).json({
            success: false,
            message: 'Error al obtener entidad facturadora',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const getEntidadByRucController = async (req, res) => {
    try {
        const { ruc } = req.params;

        if (ruc.length !== 13) {
            return res.status(400).json({
                success: false,
                message: 'El RUC debe tener 13 dígitos'
            });
        }

        const entidad = await getEntidadFacturadoraByRuc(ruc);

        if (!entidad) {
            return res.status(404).json({
                success: false,
                message: 'Entidad facturadora no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: entidad
        });
    } catch (err) {
        console.error('Error buscando entidad por RUC:', err);
        res.status(500).json({
            success: false,
            message: 'Error al buscar entidad facturadora',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const createEntidadController = async (req, res) => {
    try {
        const {
            v_ruc,
            v_razon_social,
            v_nombre_comercial,
            v_direccion,
            v_telefono,
            v_email
        } = req.body;

        if (!v_ruc || !v_razon_social) {
            return res.status(400).json({
                success: false,
                message: 'RUC y razón social son obligatorios'
            });
        }

        if (v_ruc.length !== 13) {
            return res.status(400).json({
                success: false,
                message: 'El RUC debe tener 13 dígitos'
            });
        }

        const nuevaEntidad = await createEntidadFacturadora({
            v_ruc,
            v_razon_social,
            v_nombre_comercial: v_nombre_comercial || null,
            v_direccion: v_direccion || null,
            v_telefono: v_telefono || null,
            v_email: v_email || null,
            b_activo: true
        });

        res.status(201).json({
            success: true,
            message: 'Entidad facturadora creada exitosamente',
            data: nuevaEntidad
        });
    } catch (err) {
        console.error('Error creando entidad facturadora:', err);

        if (err.code === '23505') {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una entidad facturadora con ese RUC'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al crear entidad facturadora',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const updateEntidadController = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const entidadActualizada = await updateEntidadFacturadora(parseInt(id), updateData);

        if (!entidadActualizada) {
            return res.status(404).json({
                success: false,
                message: 'Entidad facturadora no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Entidad facturadora actualizada exitosamente',
            data: entidadActualizada
        });
    } catch (err) {
        console.error('Error actualizando entidad facturadora:', err);

        if (err.code === '23505') {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una entidad facturadora con ese RUC'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al actualizar entidad facturadora',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

module.exports = {
    getAllEntidadesController,
    getEntidadByIdController,
    getEntidadByRucController,
    createEntidadController,
    updateEntidadController
};