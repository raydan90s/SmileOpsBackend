const {
    getAllTiposProveedor,
    getTipoProveedorById,
    createTipoProveedor,
    updateTipoProveedor,
    deleteTipoProveedor
} = require('@models/proveedores/tiposProveedor.model');

const fetchAllTiposProveedor = async (req, res) => {
    try {
        const tiposProveedor = await getAllTiposProveedor();
        res.status(200).json({ success: true, data: tiposProveedor });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al obtener tipos de proveedor' });
    }
};

const getTipoProveedorByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const tipoProveedor = await getTipoProveedorById(id);

        if (!tipoProveedor) {
            return res.status(404).json({ success: false, message: 'Tipo de proveedor no encontrado' });
        }

        res.status(200).json({ success: true, data: tipoProveedor });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al obtener tipo de proveedor' });
    }
};

const createTipoProveedorController = async (req, res) => {
    try {
        const { vnombre } = req.body;

        if (!vnombre || vnombre.trim() === '') {
            return res.status(400).json({ success: false, message: 'El nombre es requerido' });
        }

        const nuevoTipoProveedor = await createTipoProveedor(req.body, req);
        res.status(201).json({ success: true, data: nuevoTipoProveedor });
    } catch (err) {
        console.error('Error creando tipo de proveedor:', err);
        if (err.message && err.message.includes('Usuario no identificado')) {
            return res.status(403).json({ success: false, message: 'No se pudo identificar el usuario para auditoría' });
        }
        res.status(500).json({ success: false, message: 'Error al crear tipo de proveedor' });
    }
};

const updateTipoProveedorController = async (req, res) => {
    try {
        const { id } = req.params;
        const tipoProveedorActualizado = await updateTipoProveedor(parseInt(id), req.body, req);
        res.status(200).json({ success: true, data: tipoProveedorActualizado });
    } catch (err) {
        console.error('Error actualizando tipo de proveedor:', err);
        if (err.message === 'Tipo de proveedor no encontrado') {
            return res.status(404).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: 'Error al actualizar tipo de proveedor' });
    }
};

const deleteTipoProveedorController = async (req, res) => {
    try {
        const { id } = req.params;
        const tipoProveedorEliminado = await deleteTipoProveedor(parseInt(id), req);
        res.status(200).json({ success: true, message: 'Tipo de proveedor desactivado correctamente', data: tipoProveedorEliminado });
    } catch (err) {
        console.error('Error eliminando tipo de proveedor:', err);
        if (err.message === 'Tipo de proveedor no encontrado') {
            return res.status(404).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: 'Error al eliminar tipo de proveedor' });
    }
};

module.exports = {
    fetchAllTiposProveedor,
    getTipoProveedorByIdController,
    createTipoProveedorController,
    updateTipoProveedorController,
    deleteTipoProveedorController
};