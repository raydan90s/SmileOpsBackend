const {
    getAllProductosNombre,
    getProductoNombreById,
    createProductoNombre,
    updateProductoNombre,
    deleteProductoNombre,
    activateProductoNombre
} = require('@models/producto/productoNombre.model');

const fetchAllProductosNombre = async (req, res) => {
    try {
        const productosNombre = await getAllProductosNombre();
        res.status(200).json({ success: true, data: productosNombre });
    } catch (err) {
        console.error('Error fetching productos nombre:', err);
        res.status(500).json({ success: false, message: 'Error al obtener nombres de productos' });
    }
};

const getProductoNombreByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const productoNombre = await getProductoNombreById(id);
        if (!productoNombre) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        res.status(200).json({ success: true, data: productoNombre });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al obtener producto' });
    }
};

const createProductoNombreController = async (req, res) => {
    try {
        const { vnombre_producto, bactivo } = req.body;

        if (!vnombre_producto) {
            return res.status(400).json({
                success: false,
                message: 'El nombre del producto es requerido'
            });
        }

        const nuevoProducto = await createProductoNombre({
            vnombre_producto,
            bactivo
        });

        res.status(201).json({
            success: true,
            data: nuevoProducto,
            message: 'Producto nombre creado exitosamente'
        });

    } catch (error) {
        console.error('Error creando producto nombre:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al crear nombre de producto'
        });
    }
};

const updateProductoNombreController = async (req, res) => {
    try {
        const { id } = req.params;
        const productoNombreActualizado = await updateProductoNombre(parseInt(id), req.body, req);
        res.status(200).json({ success: true, data: productoNombreActualizado });
    } catch (err) {
        console.error('Error actualizando producto nombre:', err);
        if (err.message === 'Producto no encontrado') {
            return res.status(404).json({ success: false, message: err.message });
        }
        if (err.code === '23505') {
            return res.status(409).json({ success: false, message: 'Ya existe un producto con ese nombre' });
        }
        res.status(500).json({ success: false, message: 'Error al actualizar nombre de producto' });
    }
};

const deleteProductoNombreController = async (req, res) => {
    try {
        const { id } = req.params;
        const productoNombreEliminado = await deleteProductoNombre(parseInt(id), req);
        res.status(200).json({
            success: true,
            message: 'Producto eliminado lógicamente',
            data: productoNombreEliminado
        });
    } catch (err) {
        console.error('Error eliminando producto nombre:', err);
        if (err.message === 'Producto no encontrado') {
            return res.status(404).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: 'Error al eliminar nombre de producto' });
    }
};

const activateProductoNombreController = async (req, res) => {
    try {
        const { id } = req.params;
        const productoActivado = await activateProductoNombre(parseInt(id));

        res.status(200).json({
            success: true,
            message: 'Producto activado exitosamente',
            data: productoActivado
        });
    } catch (err) {
        console.error('Error activando producto nombre:', err);
        if (err.message === 'Producto no encontrado') {
            return res.status(404).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: 'Error al activar nombre de producto' });
    }
};
module.exports = {
    fetchAllProductosNombre,
    getProductoNombreByIdController,
    createProductoNombreController,
    updateProductoNombreController,
    deleteProductoNombreController,
    activateProductoNombreController
};