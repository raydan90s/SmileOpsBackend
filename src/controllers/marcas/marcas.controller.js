const {
  getAllMarcas,
  getMarcaById,
  getMarcaByNombre,
  getMarcasActivas,
  createMarca,
  updateMarca,
  deleteMarca,
  activateMarca
} = require('@models/marcas/marcas.model');

const fetchAllMarcas = async (req, res) => {
  try {
    const marcas = await getAllMarcas();
    res.status(200).json({
      success: true,
      data: marcas
    });
  } catch (err) {
    console.error('Error fetching marcas:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener marcas'
    });
  }
};

const getMarcaByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const marca = await getMarcaById(id);

    if (!marca) {
      return res.status(404).json({
        success: false,
        message: 'Marca no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: marca
    });
  } catch (err) {
    console.error('Error fetching marca by ID:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener marca'
    });
  }
};

const obtenerMarcaPorNombre = async (req, res) => {
  try {
    const { nombre } = req.params;
    const marcas = await getMarcaByNombre(nombre);

    if (!marcas || marcas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron marcas con ese nombre'
      });
    }

    res.json({
      success: true,
      data: marcas
    });
  } catch (error) {
    console.error('Error obteniendo marca por nombre:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

const fetchMarcasActivas = async (req, res) => {
  try {
    const marcas = await getMarcasActivas();
    res.status(200).json({
      success: true,
      data: marcas
    });
  } catch (err) {
    console.error('Error fetching marcas activas:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener marcas activas'
    });
  }
};

const crearMarcaController = async (req, res) => {
  try {
    const marcaData = req.body;

    if (!marcaData.vnombre_marca ||
      marcaData.vnombre_marca.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la marca es requerido'
      });
    }

    const nuevaMarca = await createMarca(marcaData);

    res.status(201).json({
      success: true,
      message: nuevaMarca.bactivo ? 'Marca creada exitosamente' : 'Marca reactivada exitosamente',
      data: nuevaMarca
    });
  } catch (error) {
    console.error('Error al crear marca:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una marca activa con ese nombre'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear marca',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const actualizarMarcaController = async (req, res) => {
  try {
    const { id } = req.params;
    const marcaData = req.body;

    const marcaActualizada = await updateMarca(id, marcaData);

    if (!marcaActualizada) {
      return res.status(404).json({
        success: false,
        message: 'Marca no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Marca actualizada exitosamente',
      data: marcaActualizada
    });
  } catch (error) {
    console.error('Error al actualizar marca:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una marca con ese nombre'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar marca',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const eliminarMarcaController = async (req, res) => {
  try {
    const { id } = req.params;
    const marcaEliminada = await deleteMarca(id);

    if (!marcaEliminada) {
      return res.status(404).json({
        success: false,
        message: 'Marca no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Marca desactivada exitosamente',
      data: marcaEliminada
    });
  } catch (error) {
    console.error('Error al eliminar marca:', error);

    res.status(500).json({
      success: false,
      message: 'Error al eliminar marca',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const activarMarcaController = async (req, res) => {
  try {
    const { id } = req.params;
    const marcaActivada = await activateMarca(id);

    if (!marcaActivada) {
      return res.status(404).json({
        success: false,
        message: 'Marca no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Marca activada exitosamente',
      data: marcaActivada
    });
  } catch (error) {
    console.error('Error al activar marca:', error);

    res.status(500).json({
      success: false,
      message: 'Error al activar marca',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  fetchAllMarcas,
  getMarcaByIdController,
  obtenerMarcaPorNombre,
  fetchMarcasActivas,
  crearMarcaController,
  actualizarMarcaController,
  eliminarMarcaController,
  activarMarcaController
};