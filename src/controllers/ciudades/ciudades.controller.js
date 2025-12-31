const { getAllCiudades, getCiudadById } = require('@models/ciudades/ciudades.model');

const fetchAllCiudades = async (req, res) => {
  try {
    const { iidprovincia, iidpais } = req.query;
    const ciudades = await getAllCiudades(iidprovincia, iidpais);
    res.status(200).json({ success: true, data: ciudades });
  } catch (err) {
    console.error('Error al obtener ciudades:', err);
    res.status(500).json({ success: false, message: 'Error al obtener ciudades' });
  }
};

const getCiudadByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const ciudad = await getCiudadById(id);

    if (!ciudad) {
      return res.status(404).json({ success: false, message: 'Ciudad no encontrada' });
    }

    res.status(200).json({ success: true, data: ciudad });
  } catch (err) {
    console.error('Error al obtener ciudad:', err);
    res.status(500).json({ success: false, message: 'Error al obtener ciudad' });
  }
};

module.exports = {
  fetchAllCiudades,
  getCiudadByIdController
};