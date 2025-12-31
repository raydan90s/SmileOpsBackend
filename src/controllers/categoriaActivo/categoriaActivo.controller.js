const {
  getAllCategoriasActivos,
  getAllCategoriasActivosCompleto,
  getCategoriaActivoById,
  createCategoriaActivo,
  updateCategoriaActivo,
  deleteCategoriaActivo
} = require('@models/categoriaActivo/categoriaActivo.model');

// ✅ Obtener todas las categorías activas
const fetchAllCategoriasActivos = async (req, res) => {
  try {
    const categorias = await getAllCategoriasActivos();
    res.status(200).json({
      success: true,
      data: categorias
    });
  } catch (err) {
    console.error('Error fetching categorías activos:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías de activos'
    });
  }
};

// ✅ Obtener todas las categorías (incluyendo inactivas)
const fetchAllCategoriasActivosCompleto = async (req, res) => {
  try {
    const categorias = await getAllCategoriasActivosCompleto();
    res.status(200).json({
      success: true,
      data: categorias
    });
  } catch (err) {
    console.error('Error fetching categorías activos completo:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías de activos'
    });
  }
};

// ✅ Obtener categoría por ID
const getCategoriaActivoByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await getCategoriaActivoById(id);

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: categoria
    });
  } catch (err) {
    console.error('Error fetching categoría by ID:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categoría'
    });
  }
};

// ✅ Crear nueva categoría
const crearCategoriaActivoController = async (req, res) => {
  try {
    const categoriaData = req.body;

    if (!categoriaData.vnombre_categoria) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la categoría es requerido'
      });
    }

    const nuevaCategoria = await createCategoriaActivo(categoriaData, req);

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: nuevaCategoria
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);

    if (error.message && error.message.includes('No se puede auditar')) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo identificar el usuario para auditoría'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear categoría',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ Actualizar categoría
const actualizarCategoriaActivoController = async (req, res) => {
  try {
    const { id } = req.params;
    const categoriaData = req.body;

    if (!categoriaData.vnombre_categoria) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la categoría es requerido'
      });
    }

    const categoriaActualizada = await updateCategoriaActivo(id, categoriaData, req);

    if (!categoriaActualizada) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: categoriaActualizada
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);

    if (error.message && error.message.includes('No se puede auditar')) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo identificar el usuario para auditoría'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar categoría',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ Eliminar categoría (borrado lógico)
const eliminarCategoriaActivoController = async (req, res) => {
  try {
    const { id } = req.params;
    const categoriaEliminada = await deleteCategoriaActivo(id, req);

    if (!categoriaEliminada) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Categoría eliminada exitosamente',
      data: categoriaEliminada
    });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);

    if (error.message && error.message.includes('No se puede auditar')) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo identificar el usuario para auditoría'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al eliminar categoría',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  fetchAllCategoriasActivos,
  fetchAllCategoriasActivosCompleto,
  getCategoriaActivoByIdController,
  crearCategoriaActivoController,
  actualizarCategoriaActivoController,
  eliminarCategoriaActivoController
};