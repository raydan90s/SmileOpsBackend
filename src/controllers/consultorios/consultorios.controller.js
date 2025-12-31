const {
  getAllConsultorios,
  getConsultorioById,
  createConsultorio,
  updateConsultorio,
  deleteConsultorio
} = require('@models/consultorios/consultorios.model');

const fetchAllConsultorios = async (req, res) => {
  try {
    const consultorios = await getAllConsultorios();
    res.status(200).json({ success: true, data: consultorios });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener consultorios' });
  }
};

const getConsultorioByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const consultorio = await getConsultorioById(id);
    if (!consultorio) return res.status(404).json({ success: false, message: 'Consultorio no encontrado' });
    res.status(200).json({ success: true, data: consultorio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener consultorio' });
  }
};

const createConsultorioController = async (req, res) => {
  try {
    const { vnombre, icapacidadpacientes } = req.body;

    if (!vnombre || !icapacidadpacientes) {
      return res.status(400).json({ success: false, message: 'Nombre y capacidad son obligatorios' });
    }

    if (icapacidadpacientes <= 0) {
      return res.status(400).json({ success: false, message: 'La capacidad debe ser mayor a 0' });
    }

    const nuevoConsultorio = await createConsultorio(req.body, req);
    res.status(201).json({ success: true, data: nuevoConsultorio });
  } catch (err) {
    console.error('Error creando consultorio:', err);
    if (err.message && err.message.includes('Usuario no identificado')) {
      return res.status(403).json({ success: false, message: 'No se pudo identificar el usuario para auditoría' });
    }
    res.status(500).json({ success: false, message: 'Error al crear consultorio' });
  }
};

const updateConsultorioController = async (req, res) => {
  try {
    const { id } = req.params;
    const consultorioActualizado = await updateConsultorio(parseInt(id), req.body, req);
    res.status(200).json({ success: true, data: consultorioActualizado });
  } catch (err) {
    console.error('Error actualizando consultorio:', err);
    if (err.message === 'Consultorio no encontrado') {
      return res.status(404).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Error al actualizar consultorio' });
  }
};

const deleteConsultorioController = async (req, res) => {
  try {
    const { id } = req.params;
    const consultorioEliminado = await deleteConsultorio(parseInt(id), req);
    res.status(200).json({ success: true, message: 'Consultorio eliminado', data: consultorioEliminado });
  } catch (err) {
    console.error('Error eliminando consultorio:', err);
    if (err.message === 'Consultorio no encontrado') {
      return res.status(404).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Error al eliminar consultorio' });
  }
};

module.exports = {
  fetchAllConsultorios,
  getConsultorioByIdController,
  createConsultorioController,
  updateConsultorioController,
  deleteConsultorioController
};