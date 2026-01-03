const express = require('express');
const cors = require('cors');
const pool = require('./config/dbSupabase');
const morgan = require('morgan');
const { authMiddleware } = require('@middlewares/auth.middleware');
const pacienteRoutes = require('@routes/paciente/paciente.route');
const usuarioRoutes = require('@routes/usuario/usuario.route');
const doctorRoutes = require('@routes/doctor/doctor.route');
const paisRoutes = require('@routes/paises/paises.route');
const provinciaRoutes = require('@routes/provincia/provincia.routes');
const ciudadRoutes = require('@routes/ciudades/ciudades.route');
const citasRoutes = require('@routes/citas/citas.routes');
const consultoriosRoutes = require('@routes/consultorios/consultorios.routes');
const proveedoresRoutes = require('@routes/proveedores/proveedores.routes');
const bodegasRoutes = require('@routes/bodegas/bodegas.routes');
const tipoProveedorRoutes = require('@routes/proveedores/tiposProveedor.route');
const inventarioProductosRoutes = require('@routes/inventarioProductos/inventarioProductos.routes');
const sriRoutes = require('@routes/proveedores/sri.routes');
const pedidosRoutes = require('@routes/pedidos/pedidos.routes');
const productoNombreRoutes = require('@routes/productos/productoNombre.routes');
const entidadesFacturadorasRoutes = require('@routes/entidadesFacturadoras/entidadesFacturadoras.routes');
const movimientosEntregadosRoutes = require('@routes/movimientosEntregados/movimientosEntregados.routes');
const caracteristicasRoutes = require('@routes/caracteristicas/caracteristicas.route');
const marcasRoutes = require('@routes/marcas/marcas.route');
const clasificacionRoutes = require('@routes/clasificacion/clasificacion.routes');
const subclasificacionRoutes = require('@routes/subclasificacion/subclasificacion.routes');
const unidadesRoutes = require('@routes/unidades/unidades.routes');

const app = express();

app.use(morgan('dev'));

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://192.168.1.10:8081',
    'exp://192.168.1.10:8081',
    'http://192.168.1.10:3000',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.pool = pool;
  next();
});

app.use(authMiddleware);

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      server_time: result.rows[0],
      user: req.user
    });
  } catch (error) {
    console.error('Error consultando la BD:', error);
    res.status(500).json({ message: 'Error al conectar con la base de datos' });
  }
});

app.use('/login', usuarioRoutes);
app.use('/pacientes', pacienteRoutes);
app.use('/doctores', doctorRoutes);
app.use('/paises', paisRoutes);
app.use('/provincias', provinciaRoutes);
app.use('/ciudades', ciudadRoutes);
app.use('/citas', citasRoutes);
app.use('/consultorios', consultoriosRoutes);
app.use('/proveedores', proveedoresRoutes);
app.use('/bodegas', bodegasRoutes);
app.use('/tipoProveedor', tipoProveedorRoutes);
app.use('/inventario-productos', inventarioProductosRoutes);
app.use('/sri', sriRoutes);
app.use('/pedidos', pedidosRoutes);
app.use('/producto/nombres', productoNombreRoutes);
app.use('/entidades/facturadoras', entidadesFacturadorasRoutes);
app.use('/movimientos/entregados', movimientosEntregadosRoutes);
app.use('/caracteristicas', caracteristicasRoutes);
app.use('/marcas', marcasRoutes);
app.use('/clasificaciones', clasificacionRoutes);
app.use('/subclasificaciones', subclasificacionRoutes);
app.use('/unidades', unidadesRoutes);

app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;