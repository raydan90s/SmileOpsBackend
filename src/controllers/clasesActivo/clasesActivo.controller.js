const {
  getAllClasesActivo,
  getClaseActivoById,
  getClaseActivoByNombre,
  getClasesActivoActivas,
  createClaseActivo,
  updateClaseActivo,
  deleteClaseActivo
} = require('@models/clases-activo/clases-activo.model');

// ============================================
// CONTROLADORES DE SOLO LECTURA
// ============================================

const fetchAllClasesActivo = async (req, res) => {
  try {
    const clases = await getAllClasesActivo();
    res.status(200).json({
      success: true,
      data: clases
    });
  } catch (err) {
    console.error('Error fetching clases de activo:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clases de activo'
    });
  }
};

const getClaseActivoByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const clase = await getClaseActivoById(id);

    if (!clase) {
      return res.status(404).json({
        success: false,
        message: 'Clase de activo no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: clase
    });
  } catch (err) {
    console.error('Error fetching clase de activo by ID:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clase de activo'
    });
  }
};

const obtenerClaseActivoPorNombre = async (req, res) => {
  try {
    const { nombre } = req.params;
    const clases = await getClaseActivoByNombre(nombre);

    if (!clases || clases.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron clases de activo con ese nombre'
      });
    }

    res.json({
      success: true,
      data: clases
    });
  } catch (error) {
    console.error('Error obteniendo clase de activo por nombre:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

const fetchClasesActivoActivas = async (req, res) => {
  try {
    const clases = await getClasesActivoActivas();
    res.status(200).json({
      success: true,
      data: clases
    });
  } catch (err) {
    console.error('Error fetching clases de activo activas:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clases de activo activas'
    });
  }
};

// ============================================
// CONTROLADORES DE ESCRITURA
// ============================================

const crearClaseActivoController = async (req, res) => {
  try {
    const claseData = req.body;
    const userId = req.user?.id; // Obtener el ID del usuario autenticado

    // Validación básica
    if (!claseData.vnombre_clase || claseData.vnombre_clase.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la clase de activo es requerido'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const nuevaClase = await createClaseActivo(claseData, userId);

    res.status(201).json({
      success: true,
      message: 'Clase de activo creada exitosamente',
      data: nuevaClase
    });
  } catch (error) {
    console.error('Error al crear clase de activo:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una clase de activo con ese nombre'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear clase de activo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const actualizarClaseActivoController = async (req, res) => {
  try {
    const { id } = req.params;
    const claseData = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const claseActualizada = await updateClaseActivo(id, claseData, userId);

    if (!claseActualizada) {
      return res.status(404).json({
        success: false,
        message: 'Clase de activo no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Clase de activo actualizada exitosamente',
      data: claseActualizada
    });
  } catch (error) {
    console.error('Error al actualizar clase de activo:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una clase de activo con ese nombre'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar clase de activo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const eliminarClaseActivoController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const claseEliminada = await deleteClaseActivo(id, userId);

    if (!claseEliminada) {
      return res.status(404).json({
        success: false,
        message: 'Clase de activo no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Clase de activo desactivada exitosamente',
      data: claseEliminada
    });
  } catch (error) {
    console.error('Error al eliminar clase de activo:', error);

    res.status(500).json({
      success: false,
      message: 'Error al eliminar clase de activo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  fetchAllClasesActivo,
  getClaseActivoByIdController,
  obtenerClaseActivoPorNombre,
  fetchClasesActivoActivas,
  crearClaseActivoController,
  actualizarClaseActivoController,
  eliminarClaseActivoController
};