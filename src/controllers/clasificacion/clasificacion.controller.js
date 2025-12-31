const {
  getAllClasificaciones,
  getClasificacionById,
  getClasificacionByDescripcion,
  getClasificacionesActivas,
  createClasificacion,
  updateClasificacion,
  deleteClasificacion
} = require('@models/clasificacion/clasificacion.model');

const fetchAllClasificaciones = async (req, res) => {
  try {
    const clasificaciones = await getAllClasificaciones();
    res.status(200).json({
      success: true,
      data: clasificaciones
    });
  } catch (err) {
    console.error('Error fetching clasificaciones:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clasificaciones'
    });
  }
};

const getClasificacionByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const clasificacion = await getClasificacionById(id);

    if (!clasificacion) {
      return res.status(404).json({
        success: false,
        message: 'Clasificación no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: clasificacion
    });
  } catch (err) {
    console.error('Error fetching clasificacion by ID:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clasificación'
    });
  }
};

const obtenerClasificacionPorDescripcion = async (req, res) => {
  try {
    const { descripcion } = req.params;
    const clasificaciones = await getClasificacionByDescripcion(descripcion);

    if (!clasificaciones || clasificaciones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron clasificaciones con esa descripción'
      });
    }

    res.json({
      success: true,
      data: clasificaciones
    });
  } catch (error) {
    console.error('Error obteniendo clasificacion por descripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

const fetchClasificacionesActivas = async (req, res) => {
  try {
    const clasificaciones = await getClasificacionesActivas();
    res.status(200).json({
      success: true,
      data: clasificaciones
    });
  } catch (err) {
    console.error('Error fetching clasificaciones activas:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clasificaciones activas'
    });
  }
};

const crearClasificacionController = async (req, res) => {
  try {
    const clasificacionData = req.body;

    if (!clasificacionData.v_descripcion ||
        clasificacionData.v_descripcion.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'La descripción es requerida'
      });
    }

    const nuevaClasificacion = await createClasificacion(clasificacionData);

    res.status(201).json({
      success: true,
      message: nuevaClasificacion.b_activo ? 'Clasificación creada exitosamente' : 'Clasificación reactivada exitosamente',
      data: nuevaClasificacion
    });
  } catch (error) {
    console.error('Error al crear clasificación:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una clasificación activa con esa descripción'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear clasificación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const actualizarClasificacionController = async (req, res) => {
  try {
    const { id } = req.params;
    const clasificacionData = req.body;

    const clasificacionActualizada = await updateClasificacion(id, clasificacionData);

    if (!clasificacionActualizada) {
      return res.status(404).json({
        success: false,
        message: 'Clasificación no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Clasificación actualizada exitosamente',
      data: clasificacionActualizada
    });
  } catch (error) {
    console.error('Error al actualizar clasificación:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una clasificación con esa descripción'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar clasificación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const eliminarClasificacionController = async (req, res) => {
  try {
    const { id } = req.params;
    const clasificacionEliminada = await deleteClasificacion(id);

    if (!clasificacionEliminada) {
      return res.status(404).json({
        success: false,
        message: 'Clasificación no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Clasificación desactivada exitosamente',
      data: clasificacionEliminada
    });
  } catch (error) {
    console.error('Error al eliminar clasificación:', error);

    res.status(500).json({
      success: false,
      message: 'Error al eliminar clasificación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  fetchAllClasificaciones,
  getClasificacionByIdController,
  obtenerClasificacionPorDescripcion,
  fetchClasificacionesActivas,
  crearClasificacionController,
  actualizarClasificacionController,
  eliminarClasificacionController
};