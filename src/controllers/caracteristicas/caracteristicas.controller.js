const {
  getAllCaracteristicas,
  getCaracteristicaById,
  getCaracteristicaByNombre,
  getCaracteristicasActivas,
  createCaracteristica,
  updateCaracteristica,
  deleteCaracteristica
} = require('@models/caracteristicas/caracteristicas.model');

const fetchAllCaracteristicas = async (req, res) => {
  try {
    const caracteristicas = await getAllCaracteristicas();
    res.status(200).json({
      success: true,
      data: caracteristicas
    });
  } catch (err) {
    console.error('Error fetching caracteristicas:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener características'
    });
  }
};

const getCaracteristicaByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const caracteristica = await getCaracteristicaById(id);

    if (!caracteristica) {
      return res.status(404).json({
        success: false,
        message: 'Característica no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: caracteristica
    });
  } catch (err) {
    console.error('Error fetching caracteristica by ID:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener característica'
    });
  }
};

const obtenerCaracteristicaPorNombre = async (req, res) => {
  try {
    const { nombre } = req.params;
    const caracteristicas = await getCaracteristicaByNombre(nombre);

    if (!caracteristicas || caracteristicas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron características con ese nombre'
      });
    }

    res.json({
      success: true,
      data: caracteristicas
    });
  } catch (error) {
    console.error('Error obteniendo característica por nombre:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

const fetchCaracteristicasActivas = async (req, res) => {
  try {
    const caracteristicas = await getCaracteristicasActivas();
    res.status(200).json({
      success: true,
      data: caracteristicas
    });
  } catch (err) {
    console.error('Error fetching caracteristicas activas:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener características activas'
    });
  }
};

const crearCaracteristicaController = async (req, res) => {
  try {
    const caracteristicaData = req.body;

    if (!caracteristicaData.vnombre_caracteristica ||
      caracteristicaData.vnombre_caracteristica.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la característica es requerido'
      });
    }

    const nuevaCaracteristica = await createCaracteristica(caracteristicaData);

    res.status(201).json({
      success: true,
      message: 'Característica creada exitosamente',
      data: nuevaCaracteristica
    });
  } catch (error) {
    console.error('Error al crear característica:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una característica con ese nombre'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear característica',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const actualizarCaracteristicaController = async (req, res) => {
  try {
    const { id } = req.params;
    const caracteristicaData = req.body;

    const caracteristicaActualizada = await updateCaracteristica(id, caracteristicaData);

    if (!caracteristicaActualizada) {
      return res.status(404).json({
        success: false,
        message: 'Característica no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Característica actualizada exitosamente',
      data: caracteristicaActualizada
    });
  } catch (error) {
    console.error('Error al actualizar característica:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una característica con ese nombre'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar característica',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const eliminarCaracteristicaController = async (req, res) => {
  try {
    const { id } = req.params;
    const caracteristicaEliminada = await deleteCaracteristica(id);

    if (!caracteristicaEliminada) {
      return res.status(404).json({
        success: false,
        message: 'Característica no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Característica desactivada exitosamente',
      data: caracteristicaEliminada
    });
  } catch (error) {
    console.error('Error al eliminar característica:', error);

    res.status(500).json({
      success: false,
      message: 'Error al eliminar característica',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  fetchAllCaracteristicas,
  getCaracteristicaByIdController,
  obtenerCaracteristicaPorNombre,
  fetchCaracteristicasActivas,
  crearCaracteristicaController,
  actualizarCaracteristicaController,
  eliminarCaracteristicaController
};