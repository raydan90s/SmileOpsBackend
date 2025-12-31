const express = require('express');
const router = express.Router();

const {
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
} = require('@controllers/activosFijos/activosFijos.controller');

// ============================================
// RUTAS DE CONSULTA (GET)
// ============================================

// Obtener todos los activos fijos
router.get('/', fetchAllActivosFijos);

// Buscar activos (motor de búsqueda) - DEBE IR ANTES de /:id
router.get('/search', searchActivosFijosController);

// Obtener activos con garantía vigente
router.get('/garantia', getActivosConGarantiaController);

// Obtener activos egresados (dados de baja)
router.get('/egresados', getActivosEgresadosController);

// Obtener activo por código
router.get('/codigo/:codigo', getActivoFijoByCodigoController);

// Obtener activos por categoría
router.get('/categoria/:id', getActivosFijosByCategoriaController);

// Obtener activos por ubicación
router.get('/ubicacion/:id', getActivosFijosByUbicacionController);

// Obtener activos por estado operativo
router.get('/estado/:id', getActivosFijosByEstadoController);

// Obtener activos por doctor asignado
router.get('/doctor/:id', getActivosFijosByDoctorController);

// Obtener activos por tipo de instrumental
router.get('/tipo/:id', getActivosFijosByTipoController);

// Obtener activos por marca
router.get('/marca/:id', getActivosFijosByMarcaController);

// Obtener activo por ID - DEBE IR AL FINAL de los GET
router.get('/:id', getActivoFijoByIdController);

// ============================================
// RUTAS DE CREACIÓN (POST)
// ============================================

// Crear nuevo activo fijo
router.post('/', crearActivoFijoController);

// ============================================
// RUTAS DE ACTUALIZACIÓN (PUT/PATCH)
// ============================================

// Actualizar activo fijo completo
router.put('/:id', actualizarActivoFijoController);

// Egresar (dar de baja) activo fijo
router.patch('/:id/egresar', egresarActivoFijoController);

// Cambiar estado operativo
router.patch('/:id/estado', cambiarEstadoOperativoController);

// Asignar activo a doctor
router.patch('/:id/asignar-doctor', asignarActivoDoctorController);

// Cambiar ubicación
router.patch('/:id/ubicacion', cambiarUbicacionController);

// ============================================
// RUTAS DE ELIMINACIÓN (DELETE)
// ============================================

// Eliminar activo fijo (borrado lógico)
router.delete('/:id', eliminarActivoFijoController);

module.exports = router;