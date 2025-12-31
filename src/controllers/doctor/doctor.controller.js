const { 
  getAllDoctores, 
  getDoctorById, 
  createDoctor, 
  updateDoctor, 
  deleteDoctor 
} = require('@models/doctor/doctor.model');

const fetchAllDoctores = async (req, res) => {
  try {
    const doctores = await getAllDoctores();
    res.status(200).json({ success: true, data: doctores });
  } catch (err) {
    console.error('Error fetching doctores:', err);
    res.status(500).json({ success: false, message: 'Error al obtener doctores' });
  }
};

const getDoctorByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await getDoctorById(id);
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor no encontrado' });
    }
    
    res.status(200).json({ success: true, data: doctor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener doctor' });
  }
};

const createDoctorController = async (req, res) => {
  try {
    const { vnombres, vapellidos } = req.body;

    if (!vnombres || !vapellidos) {
      return res.status(400).json({ success: false, message: 'Nombres y Apellidos son obligatorios' });
    }

    const nuevoDoctor = await createDoctor(req.body, req);
    res.status(201).json({ success: true, data: nuevoDoctor });
  } catch (err) {
    console.error('Error creando doctor:', err);
    if (err.message && err.message.includes('Usuario no identificado')) {
      return res.status(403).json({ success: false, message: 'No se pudo identificar el usuario para auditoría' });
    }
    res.status(500).json({ success: false, message: 'Error al crear doctor' });
  }
};

const updateDoctorController = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorActualizado = await updateDoctor(parseInt(id), req.body, req);
    res.status(200).json({ success: true, data: doctorActualizado });
  } catch (err) {
    console.error('Error actualizando doctor:', err);
    if (err.message === 'Doctor no encontrado') {
      return res.status(404).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Error al actualizar doctor' });
  }
};

const deleteDoctorController = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorEliminado = await deleteDoctor(parseInt(id), req);
    res.status(200).json({ success: true, message: 'Doctor eliminado', data: doctorEliminado });
  } catch (err) {
    console.error('Error eliminando doctor:', err);
    if (err.message === 'Doctor no encontrado') {
      return res.status(404).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Error al eliminar doctor' });
  }
};

module.exports = {
  fetchAllDoctores,
  getDoctorByIdController,
  createDoctorController,
  updateDoctorController,
  deleteDoctorController
};