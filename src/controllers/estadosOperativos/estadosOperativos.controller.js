const {
  getAllEstadosOperativos,
  getEstadoOperativoById,
  getEstadoOperativoByNombre,
  getEstadosOperativosActivos,
  createEstadoOperativo,
  updateEstadoOperativo,
  deleteEstadoOperativo
} = require('@models/estados-operativos/estados-operativos.model');

// ============================================
// CONTROLADORES DE SOLO LECTURA
// ============================================

const fetchAllEstadosOperativos = async (req, res) => {
  try {
    const estados = await getAllEstadosOperativos();
    res.status(200).json({
      success: true,
      data: estados
    });
  } catch (err) {
    console.error('Error fetching estados operativos:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estados operativos'
    });
  }
};

const getEstadoOperativoByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const estado = await getEstadoOperativoById(id);

    if (!estado) {
      return res.status(404).json({
        success: false,
        message: 'Estado operativo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: estado
    });
  } catch (err) {
    console.error('Error fetching estado operativo by ID:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado operativo'
    });
  }
};

const obtenerEstadoOperativoPorNombre = async (req, res) => {
  try {
    const { nombre } = req.params;
    const estados = await getEstadoOperativoByNombre(nombre);

    if (!estados || estados.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron estados operativos con ese nombre'
      });
    }

    res.json({
      success: true,
      data: estados
    });
  } catch (error) {
    console.error('Error obteniendo estado operativo por nombre:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

const fetchEstadosOperativosActivos = async (req, res) => {
  try {
    const estados = await getEstadosOperativosActivos();
    res.status(200).json({
      success: true,
      data: estados
    });
  } catch (err) {
    console.error('Error fetching estados operativos activos:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estados operativos activos'
    });
  }
};

// ============================================
// CONTROLADORES DE ESCRITURA
// ============================================

const crearEstadoOperativoController = async (req, res) => {
  try {
    const estadoData = req.body;

    // Validación básica
    if (!estadoData.vnombre_estado || estadoData.vnombre_estado.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El nombre del estado operativo es requerido'
      });
    }

    const nuevoEstado = await createEstadoOperativo(estadoData);

    res.status(201).json({
      success: true,
      message: 'Estado operativo creado exitosamente',
      data: nuevoEstado
    });
  } catch (error) {
    console.error('Error al crear estado operativo:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un estado operativo con ese nombre'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear estado operativo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const actualizarEstadoOperativoController = async (req, res) => {
  try {
    const { id } = req.params;
    const estadoData = req.body;

    const estadoActualizado = await updateEstadoOperativo(id, estadoData);

    if (!estadoActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Estado operativo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Estado operativo actualizado exitosamente',
      data: estadoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar estado operativo:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un estado operativo con ese nombre'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado operativo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const eliminarEstadoOperativoController = async (req, res) => {
  try {
    const { id } = req.params;
    const estadoEliminado = await deleteEstadoOperativo(id);

    if (!estadoEliminado) {
      return res.status(404).json({
        success: false,
        message: 'Estado operativo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Estado operativo desactivado exitosamente',
      data: estadoEliminado
    });
  } catch (error) {
    console.error('Error al eliminar estado operativo:', error);

    res.status(500).json({
      success: false,
      message: 'Error al eliminar estado operativo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  fetchAllEstadosOperativos,
  getEstadoOperativoByIdController,
  obtenerEstadoOperativoPorNombre,
  fetchEstadosOperativosActivos,
  crearEstadoOperativoController,
  actualizarEstadoOperativoController,
  eliminarEstadoOperativoController
};