const {
  getAllBodegas,
  getBodegaById,
  createBodega,
  updateBodega,
  deleteBodega,
  getBodegasPrincipales
} = require('@models/bodegas/bodegas.model');

const fetchAllBodegas = async (req, res) => {
  try {
    const { iid_tipo_bodega } = req.query;
    const bodegas = await getAllBodegas(iid_tipo_bodega);
    res.status(200).json({ success: true, data: bodegas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener bodegas' });
  }
};

const fetchBodegasPrincipales = async (req, res) => {
  try {
    const bodegas = await getBodegasPrincipales();
    res.status(200).json({ success: true, data: bodegas });
  } catch (err) {
    console.error('Error al obtener bodegas principales:', err);
    res.status(500).json({ success: false, message: 'Error al obtener bodegas principales' });
  }
};

const getBodegaByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const bodega = await getBodegaById(id);
    if (!bodega) return res.status(404).json({ success: false, message: 'Bodega no encontrada' });
    res.status(200).json({ success: true, data: bodega });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener bodega' });
  }
};

const createBodegaController = async (req, res) => {
  try {
    const { vnombre_bodega, iid_tipo_bodega } = req.body;

    if (!vnombre_bodega) {
      return res.status(400).json({ success: false, message: 'El nombre de la bodega es obligatorio' });
    }

    const nuevaBodega = await createBodega(req.body, req);
    res.status(201).json({ success: true, data: nuevaBodega });
  } catch (err) {
    console.error('Error creando bodega:', err);
    if (err.code === '23505') { // Código PostgreSQL para Unique Violation
      return res.status(400).json({ success: false, message: 'Ya existe una bodega con ese nombre' });
    }
    if (err.message && err.message.includes('Usuario no identificado')) {
      return res.status(403).json({ success: false, message: 'No se pudo identificar el usuario para auditoría' });
    }
    res.status(500).json({ success: false, message: 'Error al crear bodega' });
  }
};

const updateBodegaController = async (req, res) => {
  try {
    const { id } = req.params;
    const bodegaActualizada = await updateBodega(parseInt(id), req.body, req);
    res.status(200).json({ success: true, data: bodegaActualizada });
  } catch (err) {
    console.error('Error actualizando bodega:', err);
    if (err.message === 'Bodega no encontrada') {
      return res.status(404).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Error al actualizar bodega' });
  }
};

const deleteBodegaController = async (req, res) => {
  try {
    const { id } = req.params;
    const bodegaEliminada = await deleteBodega(parseInt(id), req);
    res.status(200).json({ success: true, message: 'Bodega eliminada', data: bodegaEliminada });
  } catch (err) {
    console.error('Error eliminando bodega:', err);
    if (err.message === 'Bodega no encontrada') {
      return res.status(404).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Error al eliminar bodega' });
  }
};

module.exports = {
  fetchAllBodegas,
  getBodegaByIdController,
  fetchBodegasPrincipales,
  createBodegaController,
  updateBodegaController,
  deleteBodegaController
};