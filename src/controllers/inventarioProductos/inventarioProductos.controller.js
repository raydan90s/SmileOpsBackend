const {
  getAllProductos,
  getProductoById,
  getProductoByCodigo,
  getProductosBySubclasificacion,
  getProductosByMarca,
  getProductosByNombre,
  createProducto,
  updateProducto,
  deleteProducto,
  getNextCodigoProducto
} = require('@models/inventarioProductos/inventarioProductos.model');

const fetchAllProductos = async (req, res) => {
  try {
    const productos = await getAllProductos();
    res.status(200).json({
      success: true,
      data: productos,
    });
  } catch (err) {
    console.error('Error fetching productos:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
    });
  }
};

const getProductoByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await getProductoById(id);

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: producto
    });
  } catch (err) {
    console.error('Error fetching producto by ID:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto'
    });
  }
};

const getProductoByCodigoController = async (req, res) => {
  try {
    const { codigo } = req.params;
    const producto = await getProductoByCodigo(codigo);

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: producto
    });
  } catch (err) {
    console.error('Error fetching producto by codigo:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto'
    });
  }
};

const getProductosBySubclasificacionController = async (req, res) => {
  try {
    const { id } = req.params;
    const productos = await getProductosBySubclasificacion(id);

    if (!productos || productos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron productos para esta subclasificación'
      });
    }

    res.json({
      success: true,
      data: productos
    });
  } catch (error) {
    console.error('Error obteniendo productos por subclasificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

const getProductosByMarcaController = async (req, res) => {
  try {
    const { id } = req.params;
    const productos = await getProductosByMarca(id);

    if (!productos || productos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron productos para esta marca'
      });
    }

    res.json({
      success: true,
      data: productos
    });
  } catch (error) {
    console.error('Error obteniendo productos por marca:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

const getProductosByNombreController = async (req, res) => {
  try {
    const { nombre } = req.params;
    const productos = await getProductosByNombre(nombre);

    if (!productos || productos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron productos con ese nombre'
      });
    }

    res.json({
      success: true,
      data: productos
    });
  } catch (error) {
    console.error('Error obteniendo productos por nombre:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

const crearProductoController = async (req, res) => {
  try {
    const productoData = req.body;
    const nuevoProducto = await createProducto(productoData, req);

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: nuevoProducto
    });
  } catch (error) {
    console.error('Error al crear producto:', error);

    if (error.message && error.message.includes('No se puede auditar')) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo identificar el usuario para auditoría'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const actualizarProductoController = async (req, res) => {
  try {
    const { id } = req.params;
    const productoData = req.body;
    const productoActualizado = await updateProducto(id, productoData, req);

    if (!productoActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: productoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);

    if (error.message && error.message.includes('No se puede auditar')) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo identificar el usuario para auditoría'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const eliminarProductoController = async (req, res) => {
  try {
    const { id } = req.params;
    const productoEliminado = await deleteProducto(id, req);

    if (!productoEliminado) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Producto eliminado exitosamente',
      data: productoEliminado
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);

    if (error.message && error.message.includes('No se puede auditar')) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo identificar el usuario para auditoría'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getNextCodigoProductoController = async (req, res) => {
  try {
    const { iid_subclasificacion } = req.params;
    
    if (!iid_subclasificacion) {
      return res.status(400).json({
        success: false,
        message: 'El ID de subclasificación es requerido'
      });
    }
    
    const nuevoCodigo = await getNextCodigoProducto(parseInt(iid_subclasificacion));
    
    res.status(200).json({
      success: true,
      codigo: nuevoCodigo
    });
  } catch (error) {
    console.error('Error obteniendo siguiente código:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar código de producto'
    });
  }
};

module.exports = {
  fetchAllProductos,
  getProductoByIdController,
  getProductoByCodigoController,
  getProductosBySubclasificacionController,
  getProductosByMarcaController,
  getProductosByNombreController,
  crearProductoController,
  actualizarProductoController,
  eliminarProductoController,
  getNextCodigoProductoController
};