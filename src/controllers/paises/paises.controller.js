const { 
  getAllPaises, 
  getPaisById, 
  createPais, 
  updatePais, 
  deletePais 
} = require('@models/paises/paises.model');

const fetchAllPaises = async (req, res) => {
  try {
    const paises = await getAllPaises();
    res.status(200).json({ success: true, data: paises });
  } catch (err) {
    console.error('Error fetching paises:', err);
    res.status(500).json({ success: false, message: 'Error al obtener países' });
  }
};

const getPaisByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const pais = await getPaisById(id);
    if (!pais) return res.status(404).json({ success: false, message: 'País no encontrado' });
    res.status(200).json({ success: true, data: pais });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener país' });
  }
};

const createPaisController = async (req, res) => {
  try {
    const { vcodigo, vnombre, bactivo } = req.body;
    const nuevoPais = await createPais({ vcodigo, vnombre, bactivo });
    res.status(201).json({ success: true, data: nuevoPais });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al crear país' });
  }
};

const updatePaisController = async (req, res) => {
  try {
    const { id } = req.params;
    const { vcodigo, vnombre, bactivo } = req.body;
    const paisActualizado = await updatePais(id, { vcodigo, vnombre, bactivo });
    if (!paisActualizado) return res.status(404).json({ success: false, message: 'País no encontrado' });
    res.status(200).json({ success: true, data: paisActualizado });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al actualizar país' });
  }
};

const deletePaisController = async (req, res) => {
  try {
    const { id } = req.params;
    const paisEliminado = await deletePais(id);
    if (!paisEliminado) return res.status(404).json({ success: false, message: 'País no encontrado' });
    res.status(200).json({ success: true, data: paisEliminado });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al eliminar país' });
  }
};

module.exports = {
  fetchAllPaises,
  getPaisByIdController,
  createPaisController,
  updatePaisController,
  deletePaisController
};
