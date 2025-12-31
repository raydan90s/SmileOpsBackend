const { 
  createCita, 
  getAllCitas, 
  getCitaById, 
  updateEstadoCita, 
  deleteCita 
} = require('@models/citas/citas.model');

const fetchAllCitas = async (req, res) => {
  try {
    const citas = await getAllCitas();
    res.status(200).json({ success: true, data: citas });
  } catch (err) {
    console.error('Error al obtener citas:', err);
    res.status(500).json({ success: false, message: 'Error al obtener citas' });
  }
};

const getCitaByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await getCitaById(id);

    if (!cita) {
      return res.status(404).json({ success: false, message: 'Cita no encontrada' });
    }

    res.status(200).json({ success: true, data: cita });
  } catch (err) {
    console.error('Error al obtener cita:', err);
    res.status(500).json({ success: false, message: 'Error al obtener cita' });
  }
};

const createCitaController = async (req, res) => {
  try {
    const cita = req.body;

    if (!cita.iidpaciente || !cita.iiddoctor || !cita.iidespecialidad || !cita.dfechacita || !cita.choracita) {
      return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
    }

    const nuevaCita = await createCita(cita, req);
    res.status(201).json({ success: true, data: nuevaCita });
  } catch (err) {
    console.error('Error al crear cita:', err);
    if (err.message && err.message.includes('Usuario no identificado')) {
      return res.status(403).json({ success: false, message: 'No se pudo identificar el usuario para auditoría' });
    }
    res.status(500).json({ success: false, message: 'Error al crear la cita' });
  }
};

const updateEstadoCitaController = async (req, res) => {
  try {
    const { id } = req.params;
    const { cestado } = req.body;

    if (!cestado || !['P', 'A', 'C'].includes(cestado)) {
      return res.status(400).json({ success: false, message: 'Estado inválido' });
    }

    const citaActualizada = await updateEstadoCita(parseInt(id), cestado, req);
    res.status(200).json({ success: true, data: citaActualizada });
  } catch (err) {
    console.error('Error al actualizar estado:', err);
    if (err.message === 'Cita no encontrada') {
      return res.status(404).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Error al actualizar estado' });
  }
};

const deleteCitaController = async (req, res) => {
  try {
    const { id } = req.params;
    const citaEliminada = await deleteCita(parseInt(id), req);
    res.status(200).json({ success: true, message: 'Cita eliminada', data: citaEliminada });
  } catch (err) {
    console.error('Error al eliminar cita:', err);
    if (err.message === 'Cita no encontrada') {
      return res.status(404).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Error al eliminar la cita' });
  }
};

module.exports = {
  fetchAllCitas,
  getCitaByIdController,
  createCitaController,
  updateEstadoCitaController,
  deleteCitaController
};