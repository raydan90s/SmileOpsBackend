const { 
  getReporteCompleto,
  getAllTratamientos,
  getTratamientoById,
  createTratamiento,
  updateTratamiento,
  deleteTratamiento
} = require('@models/tratamientos/tratamientos.model');

// Reporte original (Vista de precios y servicios)
const fetchReporteCompleto = async (req, res) => {
  try {
    const data = await getReporteCompleto();
    res.status(200).json({ success: true, total: data.length, data: data });
  } catch (error) {
    console.error('Error obteniendo reporte de tratamientos:', error);
    res.status(500).json({ success: false, message: 'Error interno al obtener reporte' });
  }
};

// CRUD: Obtener lista base
const fetchAllTratamientos = async (req, res) => {
  try {
    const data = await getAllTratamientos();
    res.status(200).json({ success: true, data: data });
  } catch (error) {
    console.error('Error obteniendo tratamientos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener tratamientos' });
  }
};

const getTratamientoByIdController = async (req, res) => {
  try {
    // Espera dos parámetros en la URL debido a la llave compuesta
    const { idEsp, idTrat } = req.params;
    const tratamiento = await getTratamientoById(idEsp, idTrat);
    
    if (!tratamiento) {
      return res.status(404).json({ success: false, message: 'Tratamiento no encontrado' });
    }
    
    res.status(200).json({ success: true, data: tratamiento });
  } catch (error) {
    console.error('Error obteniendo tratamiento:', error);
    res.status(500).json({ success: false, message: 'Error al obtener tratamiento' });
  }
};

const createTratamientoController = async (req, res) => {
  try {
    const { iidespecialidad, sitratamiento, vdesctratamiento } = req.body;
    
    if (!iidespecialidad || !sitratamiento || !vdesctratamiento) {
      return res.status(400).json({ success: false, message: 'Especialidad, ID Tratamiento y Descripción son obligatorios' });
    }

    const nuevo = await createTratamiento(req.body, req);
    res.status(201).json({ success: true, data: nuevo });
  } catch (error) {
    console.error('Error creando tratamiento:', error);
    if (error.message && error.message.includes('Usuario no identificado')) {
      return res.status(403).json({ success: false, message: 'No se pudo identificar el usuario para auditoría' });
    }
    res.status(500).json({ success: false, message: 'Error al crear tratamiento' });
  }
};

const updateTratamientoController = async (req, res) => {
  try {
    const { idEsp, idTrat } = req.params;
    const actualizado = await updateTratamiento(parseInt(idEsp), parseInt(idTrat), req.body, req);
    res.status(200).json({ success: true, data: actualizado });
  } catch (error) {
    console.error('Error actualizando tratamiento:', error);
    if (error.message === 'Tratamiento no encontrado') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Error al actualizar tratamiento' });
  }
};

const deleteTratamientoController = async (req, res) => {
  try {
    const { idEsp, idTrat } = req.params;
    const eliminado = await deleteTratamiento(parseInt(idEsp), parseInt(idTrat), req);
    res.status(200).json({ success: true, message: 'Tratamiento eliminado', data: eliminado });
  } catch (error) {
    console.error('Error eliminando tratamiento:', error);
    if (error.message === 'Tratamiento no encontrado') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Error al eliminar tratamiento' });
  }
};

module.exports = {
  fetchReporteCompleto,
  fetchAllTratamientos,
  getTratamientoByIdController,
  createTratamientoController,
  updateTratamientoController,
  deleteTratamientoController
};