const { 
  getAllTratamientosDetalle,
  getTratamientoDetalleById,
  createTratamientoDetalle,
  updateTratamientoDetalle,
  deleteTratamientoDetalle
} = require('@models/tratamientoDetalle/tratamientoDetalle.model');

const fetchAllTratamientosDetalle = async (req, res) => {
  try {
    const tratamientos = await getAllTratamientosDetalle();
    res.status(200).json({ success: true, data: tratamientos });
  } catch (err) {
    console.error('Error fetching tratamientos detalle:', err);
    res.status(500).json({ success: false, message: 'Error al obtener los tratamientos detalle' });
  }
};

const getTratamientoDetalleByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const tratamiento = await getTratamientoDetalleById(id);
    if (!tratamiento) {
      return res.status(404).json({ success: false, message: 'Tratamiento no encontrado' });
    }
    res.status(200).json({ success: true, data: tratamiento });
  } catch (err) {
    console.error('Error fetching tratamiento by ID:', err);
    res.status(500).json({ success: false, message: 'Error al obtener el tratamiento' });
  }
};

const createTratamientoDetalleController = async (req, res) => {
  try {
    const { iidespecialidad, sitratamiento, vdescripcion, dvalortratamiento } = req.body;
    
    if (!iidespecialidad || !sitratamiento || !vdescripcion || dvalortratamiento === undefined) {
      return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
    }

    const nuevoTratamiento = await createTratamientoDetalle(req.body, req);
    res.status(201).json({ success: true, data: nuevoTratamiento });
  } catch (err) {
    console.error('Error creating tratamiento detalle:', err);
    if (err.message && err.message.includes('Usuario no identificado')) {
      return res.status(403).json({ success: false, message: 'No se pudo identificar el usuario para auditoría' });
    }
    res.status(500).json({ success: false, message: 'Error al crear el tratamiento' });
  }
};

const updateTratamientoDetalleController = async (req, res) => {
  try {
    const { id } = req.params;
    const tratamientoActualizado = await updateTratamientoDetalle(parseInt(id), req.body, req);
    res.status(200).json({ success: true, data: tratamientoActualizado });
  } catch (err) {
    console.error('Error updating tratamiento detalle:', err);
    if (err.message === 'Detalle de tratamiento no encontrado') {
      return res.status(404).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Error al actualizar el tratamiento' });
  }
};

const deleteTratamientoDetalleController = async (req, res) => {
  try {
    const { id } = req.params;
    const tratamientoEliminado = await deleteTratamientoDetalle(parseInt(id), req);
    res.status(200).json({ success: true, message: 'Tratamiento eliminado', data: tratamientoEliminado });
  } catch (err) {
    console.error('Error deleting tratamiento detalle:', err);
    if (err.message === 'Detalle de tratamiento no encontrado') {
      return res.status(404).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Error al eliminar el tratamiento' });
  }
};

module.exports = {
  fetchAllTratamientosDetalle,
  getTratamientoDetalleByIdController,
  createTratamientoDetalleController,
  updateTratamientoDetalleController,
  deleteTratamientoDetalleController
};