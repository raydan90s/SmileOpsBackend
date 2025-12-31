const {
  getAllActivosFijos,
  getActivoFijoById,
  getActivoFijoByCodigo,
  getActivosFijosByCategoria,
  getActivosFijosByUbicacion,
  getActivosFijosByEstado,
  getActivosFijosByDoctor,
  getActivosFijosByTipo,
  getActivosFijosByMarca,
  searchActivosFijos,
  getActivosConGarantia,
  getActivosEgresados,
  createActivoFijo,
  updateActivoFijo,
  deleteActivoFijo,
  egresarActivoFijo,
  cambiarEstadoOperativo,
  asignarActivoDoctor,
  cambiarUbicacion
} = require('@models/activosFijos/activosFijos.model');

// ✅ Obtener todos los activos fijos
const fetchAllActivosFijos = async (req, res) => {
  try {
    const activos = await getAllActivosFijos();
    res.status(200).json({
      success: true,
      data: activos,
    });
  } catch (err) {
    console.error('Error fetching activos fijos:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener activos fijos',
    });
  }
};

// ✅ Obtener activo por ID
const getActivoFijoByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const activo = await getActivoFijoById(id);

    if (!activo) {
      return res.status(404).json({
        success: false,
        message: 'Activo fijo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: activo
    });
  } catch (err) {
    console.error('Error fetching activo fijo by ID:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener activo fijo'
    });
  }
};

// ✅ Obtener activo por código
const getActivoFijoByCodigoController = async (req, res) => {
  try {
    const { codigo } = req.params;
    const activo = await getActivoFijoByCodigo(codigo);

    if (!activo) {
      return res.status(404).json({
        success: false,
        message: 'Activo fijo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: activo
    });
  } catch (err) {
    console.error('Error fetching activo fijo by codigo:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener activo fijo'
    });
  }
};

// ✅ Obtener activos por categoría
const getActivosFijosByCategoriaController = async (req, res) => {
  try {
    const { id } = req.params;
    const activos = await getActivosFijosByCategoria(id);

    res.json({
      success: true,
      data: activos
    });
  } catch (error) {
    console.error('Error obteniendo activos por categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// ✅ Obtener activos por ubicación
const getActivosFijosByUbicacionController = async (req, res) => {
  try {
    const { id } = req.params;
    const activos = await getActivosFijosByUbicacion(id);

    res.json({
      success: true,
      data: activos
    });
  } catch (error) {
    console.error('Error obteniendo activos por ubicación:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// ✅ Obtener activos por estado operativo
const getActivosFijosByEstadoController = async (req, res) => {
  try {
    const { id } = req.params;
    const activos = await getActivosFijosByEstado(id);

    res.json({
      success: true,
      data: activos
    });
  } catch (error) {
    console.error('Error obteniendo activos por estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// ✅ Obtener activos por doctor
const getActivosFijosByDoctorController = async (req, res) => {
  try {
    const { id } = req.params;
    const activos = await getActivosFijosByDoctor(id);

    res.json({
      success: true,
      data: activos
    });
  } catch (error) {
    console.error('Error obteniendo activos por doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// ✅ Obtener activos por tipo
const getActivosFijosByTipoController = async (req, res) => {
  try {
    const { id } = req.params;
    const activos = await getActivosFijosByTipo(id);

    res.json({
      success: true,
      data: activos
    });
  } catch (error) {
    console.error('Error obteniendo activos por tipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// ✅ Obtener activos por marca
const getActivosFijosByMarcaController = async (req, res) => {
  try {
    const { id } = req.params;
    const activos = await getActivosFijosByMarca(id);

    res.json({
      success: true,
      data: activos
    });
  } catch (error) {
    console.error('Error obteniendo activos por marca:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// ✅ Buscar activos (motor de búsqueda)
const searchActivosFijosController = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Parámetro de búsqueda "q" es requerido'
      });
    }

    const activos = await searchActivosFijos(q);

    res.json({
      success: true,
      data: activos
    });
  } catch (error) {
    console.error('Error buscando activos:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// ✅ Obtener activos con garantía vigente
const getActivosConGarantiaController = async (req, res) => {
  try {
    const activos = await getActivosConGarantia();

    res.json({
      success: true,
      data: activos
    });
  } catch (error) {
    console.error('Error obteniendo activos con garantía:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// ✅ Obtener activos egresados
const getActivosEgresadosController = async (req, res) => {
  try {
    const activos = await getActivosEgresados();

    res.json({
      success: true,
      data: activos
    });
  } catch (error) {
    console.error('Error obteniendo activos egresados:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor'
    });
  }
};

// ✅ Crear activo fijo
const crearActivoFijoController = async (req, res) => {
  try {
    const activoData = req.body;
    const nuevoActivo = await createActivoFijo(activoData, req);

    res.status(201).json({
      success: true,
      message: 'Activo fijo creado exitosamente',
      data: nuevoActivo
    });
  } catch (error) {
    console.error('Error al crear activo fijo:', error);

    if (error.message && error.message.includes('No se puede auditar')) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo identificar el usuario para auditoría'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear activo fijo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ Actualizar activo fijo
const actualizarActivoFijoController = async (req, res) => {
  try {
    const { id } = req.params;
    const activoData = req.body;
    const activoActualizado = await updateActivoFijo(id, activoData, req);

    if (!activoActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Activo fijo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Activo fijo actualizado exitosamente',
      data: activoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar activo fijo:', error);

    if (error.message && error.message.includes('No se puede auditar')) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo identificar el usuario para auditoría'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar activo fijo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ Eliminar activo fijo (borrado lógico)
const eliminarActivoFijoController = async (req, res) => {
  try {
    const { id } = req.params;
    const activoEliminado = await deleteActivoFijo(id, req);

    if (!activoEliminado) {
      return res.status(404).json({
        success: false,
        message: 'Activo fijo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Activo fijo eliminado exitosamente',
      data: activoEliminado
    });
  } catch (error) {
    console.error('Error al eliminar activo fijo:', error);

    if (error.message && error.message.includes('No se puede auditar')) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo identificar el usuario para auditoría'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al eliminar activo fijo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ Egresar (dar de baja) activo fijo
const egresarActivoFijoController = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo_egreso, usuario_autoriza } = req.body;

    if (!motivo_egreso || !usuario_autoriza) {
      return res.status(400).json({
        success: false,
        message: 'Motivo de egreso y usuario que autoriza son requeridos'
      });
    }

    const activoEgresado = await egresarActivoFijo(id, motivo_egreso, usuario_autoriza, req);

    if (!activoEgresado) {
      return res.status(404).json({
        success: false,
        message: 'Activo fijo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Activo fijo dado de baja exitosamente',
      data: activoEgresado
    });
  } catch (error) {
    console.error('Error al egresar activo fijo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al dar de baja activo fijo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ Cambiar estado operativo
const cambiarEstadoOperativoController = async (req, res) => {
  try {
    const { id } = req.params;
    const { iid_estado_operativo } = req.body;

    if (!iid_estado_operativo) {
      return res.status(400).json({
        success: false,
        message: 'ID de estado operativo es requerido'
      });
    }

    const activoActualizado = await cambiarEstadoOperativo(id, iid_estado_operativo, req);

    if (!activoActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Activo fijo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Estado operativo actualizado exitosamente',
      data: activoActualizado
    });
  } catch (error) {
    console.error('Error al cambiar estado operativo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado operativo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ Asignar activo a doctor
const asignarActivoDoctorController = async (req, res) => {
  try {
    const { id } = req.params;
    const { iid_doctor_asignado } = req.body;

    const activoActualizado = await asignarActivoDoctor(id, iid_doctor_asignado, req);

    if (!activoActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Activo fijo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Activo asignado exitosamente',
      data: activoActualizado
    });
  } catch (error) {
    console.error('Error al asignar activo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar activo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ Cambiar ubicación
const cambiarUbicacionController = async (req, res) => {
  try {
    const { id } = req.params;
    const { iid_ubicacion } = req.body;

    const activoActualizado = await cambiarUbicacion(id, iid_ubicacion, req);

    if (!activoActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Activo fijo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ubicación actualizada exitosamente',
      data: activoActualizado
    });
  } catch (error) {
    console.error('Error al cambiar ubicación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar ubicación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  fetchAllActivosFijos,
  getActivoFijoByIdController,
  getActivoFijoByCodigoController,
  getActivosFijosByCategoriaController,
  getActivosFijosByUbicacionController,
  getActivosFijosByEstadoController,
  getActivosFijosByDoctorController,
  getActivosFijosByTipoController,
  getActivosFijosByMarcaController,
  searchActivosFijosController,
  getActivosConGarantiaController,
  getActivosEgresadosController,
  crearActivoFijoController,
  actualizarActivoFijoController,
  eliminarActivoFijoController,
  egresarActivoFijoController,
  cambiarEstadoOperativoController,
  asignarActivoDoctorController,
  cambiarUbicacionController
};