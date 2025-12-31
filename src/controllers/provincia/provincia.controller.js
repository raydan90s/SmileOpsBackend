const { 
  getAllProvincias, 
  getProvinciaById,
  createProvincia,
  updateProvincia,
  deleteProvincia
} = require('@models/provincia/provincia.model');

const fetchAllProvincias = async (req, res) => {
  try {
    const { iidpais } = req.query;
    const provincias = await getAllProvincias(iidpais);
    res.status(200).json({ success: true, data: provincias });
  } catch (err) {
    console.error('Error fetching provincias:', err);
    res.status(500).json({ success: false, message: 'Error al obtener provincias' });
  }
};

const getProvinciaByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const provincia = await getProvinciaById(id);
    if (!provincia) {
      return res.status(404).json({ success: false, message: 'Provincia no encontrada' });
    }
    res.status(200).json({ success: true, data: provincia });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener provincia' });
  }
};

const createProvinciaController = async (req, res) => {
  try {
    const { iidpais, vnombre } = req.body;
    
    if (!iidpais || !vnombre) {
      return res.status(400).json({ success: false, message: 'País y Nombre son obligatorios' });
    }

    const nuevaProvincia = await createProvincia(req.body, req);
    res.status(201).json({ success: true, data: nuevaProvincia });
  } catch (err) {
    console.error('Error creando provincia:', err);
    if (err.message && err.message.includes('Usuario no identificado')) {
      return res.status(403).json({ success: false, message: 'No se pudo identificar el usuario para auditoría' });
    }
    res.status(500).json({ success: false, message: 'Error al crear provincia' });
  }
};

const updateProvinciaController = async (req, res) => {
  try {
    const { id } = req.params;
    const provinciaActualizada = await updateProvincia(parseInt(id), req.body, req);
    res.status(200).json({ success: true, data: provinciaActualizada });
  } catch (err) {
    console.error('Error actualizando provincia:', err);
    if (err.message === 'Provincia no encontrada') {
      return res.status(404).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Error al actualizar provincia' });
  }
};

const deleteProvinciaController = async (req, res) => {
  try {
    const { id } = req.params;
    const provinciaEliminada = await deleteProvincia(parseInt(id), req);
    res.status(200).json({ success: true, message: 'Provincia eliminada', data: provinciaEliminada });
  } catch (err) {
    console.error('Error eliminando provincia:', err);
    if (err.message === 'Provincia no encontrada') {
      return res.status(404).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Error al eliminar provincia' });
  }
};

module.exports = {
  fetchAllProvincias,
  getProvinciaByIdController,
  createProvinciaController,
  updateProvinciaController,
  deleteProvinciaController
};