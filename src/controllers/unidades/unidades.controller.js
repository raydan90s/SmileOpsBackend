const {
  getAllUnidades,
  getUnidadById,
  getUnidadByNombre,
  getUnidadesActivas,
  createUnidad,
  updateUnidad,
  deleteUnidad
} = require('@models/unidades/unidades.model');

const fetchAllUnidades = async (req, res) => {
  try {
    const unidades = await getAllUnidades();
    res.status(200).json({
      success: true,
      data: unidades
    });
  } catch (err) {
    console.error('Error fetching unidades:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener unidades'
    });
  }
};

const getUnidadByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const unidad = await getUnidadById(id);

    if (!unidad) {
      return res.status(404).json({
        success: false,
        message: 'Unidad no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: unidad
    });
  } catch (err) {
    console.error('Error fetching unidad by ID:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener unidad'
    });
  }
};

const obtenerUnidadPorNombre = async (req, res) => {
  try {
    const { nombre } = req.params;
    const unidades = await getUnidadByNombre(nombre);

    if (!unidades || unidades.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron unidades con ese nombre'
      });
    }

    res.json({
      success: true,
      data: unidades
    });
  } catch (error) {
    console.error('Error obteniendo unidad por nombre:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

const fetchUnidadesActivas = async (req, res) => {
  try {
    const unidades = await getUnidadesActivas();
    res.status(200).json({
      success: true,
      data: unidades
    });
  } catch (err) {
    console.error('Error fetching unidades activas:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener unidades activas'
    });
  }
};

const crearUnidadController = async (req, res) => {
  try {
    const unidadData = req.body;

    if (!unidadData.vnombreunidad || 
        unidadData.vnombreunidad.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la unidad es requerido'
      });
    }

    const nuevaUnidad = await createUnidad(unidadData);

    res.status(201).json({
      success: true,
      message: nuevaUnidad.bactivo ? 'Unidad creada exitosamente' : 'Unidad reactivada exitosamente',
      data: nuevaUnidad
    });
  } catch (error) {
    console.error('Error al crear unidad:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una unidad activa con ese nombre'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear unidad',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const actualizarUnidadController = async (req, res) => {
  try {
    const { id } = req.params;
    const unidadData = req.body;

    const unidadActualizada = await updateUnidad(id, unidadData);

    if (!unidadActualizada) {
      return res.status(404).json({
        success: false,
        message: 'Unidad no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Unidad actualizada exitosamente',
      data: unidadActualizada
    });
  } catch (error) {
    console.error('Error al actualizar unidad:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una unidad con ese nombre'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar unidad',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const eliminarUnidadController = async (req, res) => {
  try {
    const { id } = req.params;
    const unidadEliminada = await deleteUnidad(id);

    if (!unidadEliminada) {
      return res.status(404).json({
        success: false,
        message: 'Unidad no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Unidad desactivada exitosamente',
      data: unidadEliminada
    });
  } catch (error) {
    console.error('Error al eliminar unidad:', error);

    res.status(500).json({
      success: false,
      message: 'Error al eliminar unidad',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  fetchAllUnidades,
  getUnidadByIdController,
  obtenerUnidadPorNombre,
  fetchUnidadesActivas,
  crearUnidadController,
  actualizarUnidadController,
  eliminarUnidadController
};