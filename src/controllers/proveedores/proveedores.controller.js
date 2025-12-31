const {
  getAllProveedores,
  getProveedorById,
  getDireccionesByProveedorId,
  createProveedor,
  updateProveedor,
  deleteProveedor,
  createDireccion,
  updateDireccion,
  deleteDireccion
} = require('@models/proveedores/proveedores.model');

const fetchAllProveedores = async (req, res) => {
  try {
    const { itipo_proveedor } = req.query;
    const proveedores = await getAllProveedores(itipo_proveedor);
    res.status(200).json({ success: true, data: proveedores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener proveedores' });
  }
};

const getProveedorByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const proveedor = await getProveedorById(id);
    if (!proveedor) return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
    res.status(200).json({ success: true, data: proveedor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener proveedor' });
  }
};

const getDireccionesProveedorController = async (req, res) => {
  try {
    const { id } = req.params;
    const direcciones = await getDireccionesByProveedorId(id);
    res.status(200).json({ success: true, data: direcciones });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener direcciones del proveedor' });
  }
};

const createProveedorController = async (req, res) => {
  try {
    const { vnombre, iid_pais, vruc } = req.body;

    if (!vnombre || !iid_pais) {
      return res.status(400).json({ success: false, message: 'Nombre y País son obligatorios' });
    }

    if (vruc && vruc.length !== 13) {
      return res.status(400).json({ success: false, message: 'El RUC debe tener 13 dígitos' });
    }

    const nuevoProveedor = await createProveedor(req.body, req);
    res.status(201).json({ success: true, data: nuevoProveedor });
  } catch (err) {
    console.error('Error creando proveedor:', err);
    if (err.code === '23505') {
      return res.status(400).json({ success: false, message: 'El RUC ya está registrado' });
    }
    if (err.message && err.message.includes('Usuario no identificado')) {
      return res.status(403).json({ success: false, message: 'No se pudo identificar el usuario para auditoría' });
    }
    res.status(500).json({ success: false, message: 'Error al crear proveedor' });
  }
};

const updateProveedorController = async (req, res) => {
  try {
    const { id } = req.params;
    const proveedorActualizado = await updateProveedor(parseInt(id), req.body, req);
    res.status(200).json({ success: true, data: proveedorActualizado });
  } catch (err) {
    console.error('Error actualizando proveedor:', err);
    if (err.message === 'Proveedor no encontrado') {
      return res.status(404).json({ success: false, message: err.message });
    }
    if (err.code === '23505') {
      return res.status(400).json({ success: false, message: 'El RUC ya está registrado' });
    }
    res.status(500).json({ success: false, message: 'Error al actualizar proveedor' });
  }
};

const deleteProveedorController = async (req, res) => {
  try {
    const { id } = req.params;
    const proveedorEliminado = await deleteProveedor(parseInt(id), req);
    res.status(200).json({ success: true, message: 'Proveedor desactivado correctamente', data: proveedorEliminado });
  } catch (err) {
    console.error('Error eliminando proveedor:', err);
    if (err.message === 'Proveedor no encontrado') {
      return res.status(404).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Error al eliminar proveedor' });
  }
};

const createDireccionController = async (req, res) => {
  try {
    const { iid_proveedor, v_direccion, v_tipo_direccion } = req.body;

    if (!iid_proveedor || !v_direccion) {
      return res.status(400).json({ success: false, message: 'Proveedor y dirección son obligatorios' });
    }

    const nuevaDireccion = await createDireccion(req.body, req);
    res.status(201).json({ success: true, data: nuevaDireccion });
  } catch (err) {
    console.error('Error creando dirección:', err);
    if (err.message && err.message.includes('Usuario no identificado')) {
      return res.status(403).json({ success: false, message: 'No se pudo identificar el usuario para auditoría' });
    }
    res.status(500).json({ success: false, message: 'Error al crear dirección' });
  }
};

const updateDireccionController = async (req, res) => {
  try {
    const { id } = req.params;
    const direccionActualizada = await updateDireccion(parseInt(id), req.body, req);
    res.status(200).json({ success: true, data: direccionActualizada });
  } catch (err) {
    console.error('Error actualizando dirección:', err);
    if (err.message === 'Dirección no encontrada') {
      return res.status(404).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Error al actualizar dirección' });
  }
};

const deleteDireccionController = async (req, res) => {
  try {
    const { id } = req.params;
    const direccionEliminada = await deleteDireccion(parseInt(id), req);
    res.status(200).json({ success: true, message: 'Dirección desactivada correctamente', data: direccionEliminada });
  } catch (err) {
    console.error('Error eliminando dirección:', err);
    if (err.message === 'Dirección no encontrada') {
      return res.status(404).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Error al eliminar dirección' });
  }
};

module.exports = {
  fetchAllProveedores,
  getProveedorByIdController,
  getDireccionesProveedorController,
  createProveedorController,
  updateProveedorController,
  deleteProveedorController,
  createDireccionController,
  updateDireccionController,
  deleteDireccionController
};