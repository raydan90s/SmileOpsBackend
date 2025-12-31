const { getAllDetallesCompleto, getDetallesPorPaciente } = require('@models/detalleTratamientoPaciente/detalleTratamientoPaciente.model');

const fetchAllDetallesCompleto = async (req, res) => {
  try {
    const detalles = await getAllDetallesCompleto();
    res.status(200).json({ success: true, data: detalles });
  } catch (err) {
    console.error('Error fetching detalles:', err);
    res.status(500).json({ success: false, message: 'Error al obtener detalles' });
  }
};

const fetchDetallesPorPaciente = async (req, res) => {
  try {
    const { idPaciente } = req.params;
    const detalles = await getDetallesPorPaciente(idPaciente);
    
    if (!detalles || detalles.length === 0) {
      return res.status(404).json({ success: false, message: 'Detalles no encontrados para el paciente' });
    }
    
    res.status(200).json({ success: true, data: detalles });
  } catch (err) {
    console.error('Error fetching detalles por paciente:', err);
    res.status(500).json({ success: false, message: 'Error al obtener detalles del paciente' });
  }
};

module.exports = {
  fetchAllDetallesCompleto,
  fetchDetallesPorPaciente
};