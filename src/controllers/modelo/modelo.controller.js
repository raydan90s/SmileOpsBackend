const {
  getAllModelos,
  getAllModelosCompleto,
  getModeloById,
  createModelo,
  updateModelo,
  deleteModelo
} = require('@models/modelo/modelo.model');

// ✅ Obtener todos los modelos activos
const fetchAllModelos = async (req, res) => {
  try {
    const modelos = await getAllModelos();
    res.status(200).json({
      success: true,
      data: modelos
    });
  } catch (err) {
    console.error('Error fetching modelos:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener modelos'
    });
  }
};

// ✅ Obtener todos los modelos (incluyendo inactivos)
const fetchAllModelosCompleto = async (req, res) => {
  try {
    const modelos = await getAllModelosCompleto();
    res.status(200).json({
      success: true,
      data: modelos
    });
  } catch (err) {
    console.error('Error fetching modelos completo:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener modelos'
    });
  }
};

// ✅ Obtener modelo por ID
const getModeloByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const modelo = await getModeloById(id);

    if (!modelo) {
      return res.status(404).json({
        success: false,
        message: 'Modelo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: modelo
    });
  } catch (err) {
    console.error('Error fetching modelo by ID:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener modelo'
    });
  }
};

// ✅ Crear nuevo modelo
const crearModeloController = async (req, res) => {
  try {
    const modeloData = req.body;

    if (!modeloData.vnombre_modelo) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del modelo es requerido'
      });
    }

    const nuevoModelo = await createModelo(modeloData, req);

    res.status(201).json({
      success: true,
      message: 'Modelo creado exitosamente',
      data: nuevoModelo
    });
  } catch (error) {
    console.error('Error al crear modelo:', error);

    if (error.message && error.message.includes('No se puede auditar')) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo identificar el usuario para auditoría'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear modelo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ Actualizar modelo
const actualizarModeloController = async (req, res) => {
  try {
    const { id } = req.params;
    const modeloData = req.body;

    if (!modeloData.vnombre_modelo) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del modelo es requerido'
      });
    }

    const modeloActualizado = await updateModelo(id, modeloData, req);

    if (!modeloActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Modelo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Modelo actualizado exitosamente',
      data: modeloActualizado
    });
  } catch (error) {
    console.error('Error al actualizar modelo:', error);

    if (error.message && error.message.includes('No se puede auditar')) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo identificar el usuario para auditoría'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar modelo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ Eliminar modelo (borrado lógico)
const eliminarModeloController = async (req, res) => {
  try {
    const { id } = req.params;
    const modeloEliminado = await deleteModelo(id, req);

    if (!modeloEliminado) {
      return res.status(404).json({
        success: false,
        message: 'Modelo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Modelo eliminado exitosamente',
      data: modeloEliminado
    });
  } catch (error) {
    console.error('Error al eliminar modelo:', error);

    if (error.message && error.message.includes('No se puede auditar')) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo identificar el usuario para auditoría'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al eliminar modelo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  fetchAllModelos,
  fetchAllModelosCompleto,
  getModeloByIdController,
  crearModeloController,
  actualizarModeloController,
  eliminarModeloController
};