const {
  getAllSubclasificaciones,
  getSubclasificacionById,
  getSubclasificacionByDescripcion,
  getSubclasificacionesActivas,
  getSubclasificacionesByClasificacion,
  createSubclasificacion,
  updateSubclasificacion,
  deleteSubclasificacion
} = require('@models/subclasificacion/subclasificacion.model');

const fetchAllSubclasificaciones = async (req, res) => {
  try {
    const subclasificaciones = await getAllSubclasificaciones();
    res.status(200).json({
      success: true,
      data: subclasificaciones
    });
  } catch (err) {
    console.error('Error fetching subclasificaciones:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener subclasificaciones'
    });
  }
};

const getSubclasificacionByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const subclasificacion = await getSubclasificacionById(id);

    if (!subclasificacion) {
      return res.status(404).json({
        success: false,
        message: 'Subclasificación no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: subclasificacion
    });
  } catch (err) {
    console.error('Error fetching subclasificacion by ID:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener subclasificación'
    });
  }
};

const obtenerSubclasificacionPorDescripcion = async (req, res) => {
  try {
    const { descripcion } = req.params;
    const subclasificaciones = await getSubclasificacionByDescripcion(descripcion);

    if (!subclasificaciones || subclasificaciones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron subclasificaciones con esa descripción'
      });
    }

    res.json({
      success: true,
      data: subclasificaciones
    });
  } catch (error) {
    console.error('Error obteniendo subclasificacion por descripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

const fetchSubclasificacionesActivas = async (req, res) => {
  try {
    const subclasificaciones = await getSubclasificacionesActivas();
    res.status(200).json({
      success: true,
      data: subclasificaciones
    });
  } catch (err) {
    console.error('Error fetching subclasificaciones activas:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener subclasificaciones activas'
    });
  }
};

const fetchSubclasificacionesByClasificacion = async (req, res) => {
  try {
    const { idClasificacion } = req.params;
    const subclasificaciones = await getSubclasificacionesByClasificacion(idClasificacion);
    
    res.status(200).json({
      success: true,
      data: subclasificaciones
    });
  } catch (err) {
    console.error('Error fetching subclasificaciones by clasificacion:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener subclasificaciones'
    });
  }
};

const crearSubclasificacionController = async (req, res) => {
  try {
    const subclasificacionData = req.body;

    if (!subclasificacionData.iid_clasificacion ||
        !subclasificacionData.v_codigo || 
        subclasificacionData.v_codigo.trim() === '' ||
        !subclasificacionData.v_descripcion ||
        subclasificacionData.v_descripcion.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'La clasificación, código y descripción son requeridos'
      });
    }

    const nuevaSubclasificacion = await createSubclasificacion(subclasificacionData);

    res.status(201).json({
      success: true,
      message: nuevaSubclasificacion.b_activo ? 'Subclasificación creada exitosamente' : 'Subclasificación reactivada exitosamente',
      data: nuevaSubclasificacion
    });
  } catch (error) {
    console.error('Error al crear subclasificación:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una subclasificación activa con ese código'
      });
    }

    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'La clasificación especificada no existe'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear subclasificación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const actualizarSubclasificacionController = async (req, res) => {
  try {
    const { id } = req.params;
    const subclasificacionData = req.body;

    const subclasificacionActualizada = await updateSubclasificacion(id, subclasificacionData);

    if (!subclasificacionActualizada) {
      return res.status(404).json({
        success: false,
        message: 'Subclasificación no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subclasificación actualizada exitosamente',
      data: subclasificacionActualizada
    });
  } catch (error) {
    console.error('Error al actualizar subclasificación:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una subclasificación con ese código'
      });
    }

    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'La clasificación especificada no existe'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar subclasificación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const eliminarSubclasificacionController = async (req, res) => {
  try {
    const { id } = req.params;
    const subclasificacionEliminada = await deleteSubclasificacion(id);

    if (!subclasificacionEliminada) {
      return res.status(404).json({
        success: false,
        message: 'Subclasificación no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subclasificación desactivada exitosamente',
      data: subclasificacionEliminada
    });
  } catch (error) {
    console.error('Error al eliminar subclasificación:', error);

    res.status(500).json({
      success: false,
      message: 'Error al eliminar subclasificación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  fetchAllSubclasificaciones,
  getSubclasificacionByIdController,
  obtenerSubclasificacionPorDescripcion,
  fetchSubclasificacionesActivas,
  fetchSubclasificacionesByClasificacion,
  crearSubclasificacionController,
  actualizarSubclasificacionController,
  eliminarSubclasificacionController
};