const {
  getAllTiposInstrumental,
  getAllTiposInstrumentalCompleto,
  getTipoInstrumentalById,
  createTipoInstrumental,
  updateTipoInstrumental,
  deleteTipoInstrumental
} = require('@models/tipoInstrumental/tipoInstrumental.model');

// ✅ Obtener todos los tipos activos
const fetchAllTiposInstrumental = async (req, res) => {
  try {
    const tipos = await getAllTiposInstrumental();
    res.status(200).json({
      success: true,
      data: tipos
    });
  } catch (err) {
    console.error('Error fetching tipos instrumental:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tipos de instrumental'
    });
  }
};

// ✅ Obtener todos los tipos (incluyendo inactivos)
const fetchAllTiposInstrumentalCompleto = async (req, res) => {
  try {
    const tipos = await getAllTiposInstrumentalCompleto();
    res.status(200).json({
      success: true,
      data: tipos
    });
  } catch (err) {
    console.error('Error fetching tipos instrumental completo:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tipos de instrumental'
    });
  }
};

// ✅ Obtener tipo por ID
const getTipoInstrumentalByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const tipo = await getTipoInstrumentalById(id);

    if (!tipo) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de instrumental no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: tipo
    });
  } catch (err) {
    console.error('Error fetching tipo by ID:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tipo de instrumental'
    });
  }
};

// ✅ Crear nuevo tipo
const crearTipoInstrumentalController = async (req, res) => {
  try {
    const tipoData = req.body;

    if (!tipoData.vnombre_tipo) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del tipo es requerido'
      });
    }

    const nuevoTipo = await createTipoInstrumental(tipoData, req);

    res.status(201).json({
      success: true,
      message: 'Tipo de instrumental creado exitosamente',
      data: nuevoTipo
    });
  } catch (error) {
    console.error('Error al crear tipo instrumental:', error);

    if (error.message && error.message.includes('No se puede auditar')) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo identificar el usuario para auditoría'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear tipo de instrumental',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ Actualizar tipo
const actualizarTipoInstrumentalController = async (req, res) => {
  try {
    const { id } = req.params;
    const tipoData = req.body;

    if (!tipoData.vnombre_tipo) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del tipo es requerido'
      });
    }

    const tipoActualizado = await updateTipoInstrumental(id, tipoData, req);

    if (!tipoActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de instrumental no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tipo de instrumental actualizado exitosamente',
      data: tipoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar tipo instrumental:', error);

    if (error.message && error.message.includes('No se puede auditar')) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo identificar el usuario para auditoría'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar tipo de instrumental',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ Eliminar tipo (borrado lógico)
const eliminarTipoInstrumentalController = async (req, res) => {
  try {
    const { id } = req.params;
    const tipoEliminado = await deleteTipoInstrumental(id, req);

    if (!tipoEliminado) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de instrumental no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tipo de instrumental eliminado exitosamente',
      data: tipoEliminado
    });
  } catch (error) {
    console.error('Error al eliminar tipo instrumental:', error);

    if (error.message && error.message.includes('No se puede auditar')) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo identificar el usuario para auditoría'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al eliminar tipo de instrumental',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  fetchAllTiposInstrumental,
  fetchAllTiposInstrumentalCompleto,
  getTipoInstrumentalByIdController,
  crearTipoInstrumentalController,
  actualizarTipoInstrumentalController,
  eliminarTipoInstrumentalController
};