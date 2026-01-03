const pool = require('@config/dbSupabase');

const getAllProductos = async () => {
  const query = `
    SELECT 
      ip.iid_inventario,
      ip.codigo_producto,
      ip.iid_subclasificacion,
      ip.iid_nombre,
      ip.iid_caracteristica,
      ip.iid_marca,
      ip.unidad_compra,
      ip.unidad_consumo,
      ip.cantidad_minima,
      ip.estado,
      ip.es_de_conteo,
      ip.iid_iva,
      p.vnombre_producto,
      c.vnombre_caracteristica,
      m.vnombre_marca,
      uc.vnombreunidad as unidad_compra_nombre,
      ucon.vnombreunidad as unidad_consumo_nombre,
      -- Información del IVA
      iva.n_porcentaje as iva_porcentaje,
      iva.d_fecha_vigencia_desde as iva_vigencia_desde,
      iva.d_fecha_vigencia_hasta as iva_vigencia_hasta,
      iva.b_activo as iva_activo
    FROM public.tbl_inventario_productos ip
    LEFT JOIN public.tbl_productos p ON ip.iid_nombre = p.iid_nombre
    LEFT JOIN public.tbl_caracteristicas c ON ip.iid_caracteristica = c.iid_caracteristica
    LEFT JOIN public.tbl_marcas m ON ip.iid_marca = m.iid_marca
    LEFT JOIN public.unidades_medida uc ON ip.unidad_compra = uc.iidunidad
    LEFT JOIN public.unidades_medida ucon ON ip.unidad_consumo = ucon.iidunidad
    LEFT JOIN public.tbl_iva iva ON ip.iid_iva = iva.iid_iva
    WHERE ip.estado = true
    ORDER BY ip.codigo_producto ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getProductoById = async (iid_inventario) => {
  const query = `
    SELECT 
      ip.iid_inventario,
      ip.codigo_producto,
      ip.iid_subclasificacion,
      ip.iid_nombre,
      ip.iid_caracteristica,
      ip.iid_marca,
      ip.unidad_compra,
      ip.unidad_consumo,
      ip.cantidad_minima,
      ip.estado,
      ip.es_de_conteo,
      ip.iid_iva,
      p.vnombre_producto,
      c.vnombre_caracteristica,
      m.vnombre_marca,
      uc.vnombreunidad as unidad_compra_nombre,
      ucon.vnombreunidad as unidad_consumo_nombre,
      -- Información del IVA
      iva.n_porcentaje as iva_porcentaje,
      iva.d_fecha_vigencia_desde as iva_vigencia_desde,
      iva.d_fecha_vigencia_hasta as iva_vigencia_hasta,
      iva.b_activo as iva_activo
    FROM public.tbl_inventario_productos ip
    LEFT JOIN public.tbl_productos p ON ip.iid_nombre = p.iid_nombre
    LEFT JOIN public.tbl_caracteristicas c ON ip.iid_caracteristica = c.iid_caracteristica
    LEFT JOIN public.tbl_marcas m ON ip.iid_marca = m.iid_marca
    LEFT JOIN public.unidades_medida uc ON ip.unidad_compra = uc.iidunidad
    LEFT JOIN public.unidades_medida ucon ON ip.unidad_consumo = ucon.iidunidad
    LEFT JOIN public.tbl_iva iva ON ip.iid_iva = iva.iid_iva
    WHERE ip.iid_inventario = $1
  `;
  const { rows } = await pool.query(query, [iid_inventario]);
  return rows[0] || null;
};

const getProductoByCodigo = async (codigo) => {
  const query = `
    SELECT 
      ip.iid_inventario,
      ip.codigo_producto,
      ip.iid_subclasificacion,
      ip.iid_nombre,
      ip.iid_caracteristica,
      ip.iid_marca,
      ip.unidad_compra,
      ip.unidad_consumo,
      ip.cantidad_minima,
      ip.estado,
      ip.es_de_conteo,
      ip.iid_iva,
      p.vnombre_producto,
      c.vnombre_caracteristica,
      m.vnombre_marca,
      uc.vnombreunidad as unidad_compra_nombre,
      ucon.vnombreunidad as unidad_consumo_nombre,
      -- Información del IVA
      iva.n_porcentaje as iva_porcentaje,
      iva.d_fecha_vigencia_desde as iva_vigencia_desde,
      iva.d_fecha_vigencia_hasta as iva_vigencia_hasta,
      iva.b_activo as iva_activo
    FROM public.tbl_inventario_productos ip
    LEFT JOIN public.tbl_productos p ON ip.iid_nombre = p.iid_nombre
    LEFT JOIN public.tbl_caracteristicas c ON ip.iid_caracteristica = c.iid_caracteristica
    LEFT JOIN public.tbl_marcas m ON ip.iid_marca = m.iid_marca
    LEFT JOIN public.unidades_medida uc ON ip.unidad_compra = uc.iidunidad
    LEFT JOIN public.unidades_medida ucon ON ip.unidad_consumo = ucon.iidunidad
    LEFT JOIN public.tbl_iva iva ON ip.iid_iva = iva.iid_iva
    WHERE ip.codigo_producto = $1
  `;
  const { rows } = await pool.query(query, [codigo]);
  return rows[0] || null;
};

const getProductosBySubclasificacion = async (iid_subclasificacion) => {
  const query = `
    SELECT 
      ip.iid_inventario,
      ip.codigo_producto,
      ip.iid_subclasificacion,
      ip.iid_nombre,
      ip.iid_caracteristica,
      ip.iid_marca,
      ip.unidad_compra,
      ip.unidad_consumo,
      ip.cantidad_minima,
      ip.estado,
      ip.es_de_conteo,
      ip.iid_iva,
      p.vnombre_producto,
      c.vnombre_caracteristica,
      m.vnombre_marca,
      uc.vnombreunidad as unidad_compra_nombre,
      ucon.vnombreunidad as unidad_consumo_nombre,
      iva.n_porcentaje as iva_porcentaje,
      iva.d_fecha_vigencia_desde as iva_vigencia_desde,
      iva.d_fecha_vigencia_hasta as iva_vigencia_hasta,
      iva.b_activo as iva_activo
    FROM public.tbl_inventario_productos ip
    LEFT JOIN public.tbl_productos p ON ip.iid_nombre = p.iid_nombre
    LEFT JOIN public.tbl_caracteristicas c ON ip.iid_caracteristica = c.iid_caracteristica
    LEFT JOIN public.tbl_marcas m ON ip.iid_marca = m.iid_marca
    LEFT JOIN public.unidades_medida uc ON ip.unidad_compra = uc.iidunidad
    LEFT JOIN public.unidades_medida ucon ON ip.unidad_consumo = ucon.iidunidad
    LEFT JOIN public.tbl_iva iva ON ip.iid_iva = iva.iid_iva
    WHERE ip.iid_subclasificacion = $1 AND ip.estado = true
    ORDER BY ip.codigo_producto ASC
  `;
  const { rows } = await pool.query(query, [iid_subclasificacion]);
  return rows;
};

const getProductosByMarca = async (iid_marca) => {
  const query = `
    SELECT 
      ip.iid_inventario,
      ip.codigo_producto,
      ip.iid_subclasificacion,
      ip.iid_nombre,
      ip.iid_caracteristica,
      ip.iid_marca,
      ip.unidad_compra,
      ip.unidad_consumo,
      ip.cantidad_minima,
      ip.estado,
      ip.es_de_conteo,
      ip.iid_iva,
      p.vnombre_producto,
      c.vnombre_caracteristica,
      m.vnombre_marca,
      uc.vnombreunidad as unidad_compra_nombre,
      ucon.vnombreunidad as unidad_consumo_nombre,
      iva.n_porcentaje as iva_porcentaje,
      iva.d_fecha_vigencia_desde as iva_vigencia_desde,
      iva.d_fecha_vigencia_hasta as iva_vigencia_hasta,
      iva.b_activo as iva_activo
    FROM public.tbl_inventario_productos ip
    LEFT JOIN public.tbl_productos p ON ip.iid_nombre = p.iid_nombre
    LEFT JOIN public.tbl_caracteristicas c ON ip.iid_caracteristica = c.iid_caracteristica
    LEFT JOIN public.tbl_marcas m ON ip.iid_marca = m.iid_marca
    LEFT JOIN public.unidades_medida uc ON ip.unidad_compra = uc.iidunidad
    LEFT JOIN public.unidades_medida ucon ON ip.unidad_consumo = ucon.iidunidad
    LEFT JOIN public.tbl_iva iva ON ip.iid_iva = iva.iid_iva
    WHERE ip.iid_marca = $1 AND ip.estado = true
    ORDER BY ip.codigo_producto ASC
  `;
  const { rows } = await pool.query(query, [iid_marca]);
  return rows;
};

const getProductosByNombre = async (termino) => {
  const query = `
    SELECT 
      ip.iid_inventario,
      ip.codigo_producto,
      ip.iid_subclasificacion,
      ip.iid_nombre,
      ip.iid_caracteristica,
      ip.iid_marca,
      ip.unidad_compra,
      ip.unidad_consumo,
      ip.cantidad_minima,
      ip.estado,
      ip.es_de_conteo,
      ip.iid_iva,
      p.vnombre_producto,
      c.vnombre_caracteristica,
      m.vnombre_marca,
      uc.vnombreunidad as unidad_compra_nombre,
      ucon.vnombreunidad as unidad_consumo_nombre,
      iva.n_porcentaje as iva_porcentaje,
      iva.d_fecha_vigencia_desde as iva_vigencia_desde,
      iva.d_fecha_vigencia_hasta as iva_vigencia_hasta,
      iva.b_activo as iva_activo
    FROM public.tbl_inventario_productos ip
    LEFT JOIN public.tbl_productos p ON ip.iid_nombre = p.iid_nombre
    LEFT JOIN public.tbl_caracteristicas c ON ip.iid_caracteristica = c.iid_caracteristica
    LEFT JOIN public.tbl_marcas m ON ip.iid_marca = m.iid_marca
    LEFT JOIN public.unidades_medida uc ON ip.unidad_compra = uc.iidunidad
    LEFT JOIN public.unidades_medida ucon ON ip.unidad_consumo = ucon.iidunidad
    LEFT JOIN public.tbl_iva iva ON ip.iid_iva = iva.iid_iva
    WHERE p.vnombre_producto ILIKE $1 AND ip.estado = true
    ORDER BY ip.codigo_producto ASC
  `;
  const { rows } = await pool.query(query, [`%${termino}%`]);
  return rows;
};

const createProducto = async (productoData) => {
  const query = `
    INSERT INTO public.tbl_inventario_productos (
      codigo_producto,
      iid_subclasificacion,
      iid_nombre,
      iid_caracteristica,
      iid_marca,
      unidad_compra,
      unidad_consumo,
      cantidad_minima,
      estado,
      es_de_conteo,
      iid_iva
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *;
  `;

  const values = [
    productoData.codigo_producto,
    productoData.iid_subclasificacion,
    productoData.iid_nombre,
    productoData.iid_caracteristica,
    productoData.iid_marca,
    productoData.unidad_compra,
    productoData.unidad_consumo,
    productoData.cantidad_minima,
    productoData.estado !== undefined ? productoData.estado : true,
    productoData.es_de_conteo !== undefined ? productoData.es_de_conteo : true,
    productoData.iid_iva || null
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

const updateProducto = async (iid_inventario, productoData) => {
  const query = `
    UPDATE public.tbl_inventario_productos
    SET 
      codigo_producto = $2,
      iid_subclasificacion = $3,
      iid_nombre = $4,
      iid_caracteristica = $5,
      iid_marca = $6,
      unidad_compra = $7,
      unidad_consumo = $8,
      cantidad_minima = $9,
      estado = $10,
      es_de_conteo = $11,
      iid_iva = $12
    WHERE iid_inventario = $1
    RETURNING *;
  `;

  const values = [
    iid_inventario,
    productoData.codigo_producto,
    productoData.iid_subclasificacion,
    productoData.iid_nombre,
    productoData.iid_caracteristica,
    productoData.iid_marca,
    productoData.unidad_compra,
    productoData.unidad_consumo,
    productoData.cantidad_minima,
    productoData.estado,
    productoData.es_de_conteo,
    productoData.iid_iva || null
  ];

  const { rows } = await pool.query(query, values);

  if (rows.length === 0) throw new Error('Producto no encontrado');

  return rows[0];
};

const deleteProducto = async (iid_inventario) => {
  const query = `
    UPDATE public.tbl_inventario_productos
    SET estado = false
    WHERE iid_inventario = $1
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [iid_inventario]);

  if (rows.length === 0) throw new Error('Producto no encontrado');

  return rows[0];
};

const getNextCodigoProducto = async (iid_subclasificacion) => {
  try {
    const subclasQuery = `
      SELECT v_codigo 
      FROM public.tbl_inv_subclasificacion 
      WHERE iid_subclasificacion = $1
    `;
    const subclasResult = await pool.query(subclasQuery, [iid_subclasificacion]);

    if (subclasResult.rows.length === 0) {
      throw new Error('Subclasificación no encontrada');
    }

    const codigoSubclasificacion = subclasResult.rows[0].v_codigo;

    const query = `
      SELECT codigo_producto 
      FROM public.tbl_inventario_productos 
      WHERE codigo_producto LIKE $1
      ORDER BY codigo_producto DESC 
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [`${codigoSubclasificacion}.%`]);

    let nuevoNumero = 1;

    if (rows.length > 0) {
      const ultimoCodigo = rows[0].codigo_producto;
      const partes = ultimoCodigo.split('.');
      const ultimoNumero = parseInt(partes[partes.length - 1]) || 0;
      nuevoNumero = ultimoNumero + 1;
    }

    const numeroFormateado = nuevoNumero.toString().padStart(4, '0');
    const nuevoCodigo = `${codigoSubclasificacion}.${numeroFormateado}`;

    return nuevoCodigo;
  } catch (error) {
    console.error('Error generando código de producto:', error);
    throw error;
  }
};

module.exports = {
  getAllProductos,
  getProductoById,
  getProductoByCodigo,
  getProductosBySubclasificacion,
  getProductosByMarca,
  getProductosByNombre,
  createProducto,
  updateProducto,
  deleteProducto,
  getNextCodigoProducto
};