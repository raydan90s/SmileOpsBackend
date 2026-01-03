const pool = require('@config/dbSupabase');

const getAllProveedores = async (itipo_proveedor) => {
  let query = `
    SELECT 
      p.iid_proveedor,
      p.vnombre,
      p.vruc,
      p.vtelefono,
      p.vfax,
      p.vemail,
      p.itipo_proveedor,
      p.iid_pais,
      p.bactivo,
      tp.vnombre AS nombre_tipo_proveedor,
      pa.vnombre AS nombre_pais,
      COUNT(DISTINCT pd.iid_direccion) AS total_direcciones
    FROM public.tbl_proveedores p
    LEFT JOIN public.tbl_tipos_proveedor tp ON p.itipo_proveedor = tp.iid_tipo_proveedor
    LEFT JOIN public.tblpaises pa ON p.iid_pais = pa.iidpais
    LEFT JOIN public.tbl_proveedores_direcciones pd ON p.iid_proveedor = pd.iid_proveedor AND pd.b_activo = true
  `;

  const params = [];

  if (itipo_proveedor) {
    query += ` AND p.itipo_proveedor = $1`;
    params.push(itipo_proveedor);
  }

  query += ` GROUP BY p.iid_proveedor, p.vnombre, p.vruc, p.vtelefono, p.vfax, 
             p.vemail, p.itipo_proveedor, p.iid_pais, p.bactivo, 
             tp.vnombre, pa.vnombre
             ORDER BY p.vnombre ASC`;

  const { rows } = await pool.query(query, params);
  return rows;
};

const getProveedorById = async (iid_proveedor) => {
  const query = `
    SELECT 
      p.*,
      tp.vnombre AS nombre_tipo_proveedor,
      pa.vnombre AS nombre_pais
    FROM public.tbl_proveedores p
    LEFT JOIN public.tbl_tipos_proveedor tp ON p.itipo_proveedor = tp.iid_tipo_proveedor
    LEFT JOIN public.tblpaises pa ON p.iid_pais = pa.iidpais
    WHERE p.iid_proveedor = $1
  `;
  const { rows } = await pool.query(query, [iid_proveedor]);
  return rows[0] || null;
};

const getDireccionesByProveedorId = async (iid_proveedor) => {
  const query = `
    SELECT 
      iid_direccion,
      iid_proveedor,
      v_direccion,
      v_tipo_direccion,
      b_activo
    FROM public.tbl_proveedores_direcciones
    WHERE iid_proveedor = $1 AND b_activo = true
    ORDER BY 
      CASE v_tipo_direccion 
        WHEN 'Matriz' THEN 1 
        WHEN 'Sucursal' THEN 2 
        ELSE 3 
      END,
      iid_direccion ASC
  `;
  const { rows } = await pool.query(query, [iid_proveedor]);
  return rows;
};

const createProveedor = async (proveedor) => {
  const queryProveedor = `
    INSERT INTO public.tbl_proveedores (
      vnombre, vruc, vtelefono, vfax, vemail, 
      itipo_proveedor, iid_pais, bactivo
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  const valuesProveedor = [
    proveedor.vnombre,
    proveedor.vruc,
    proveedor.vtelefono || null,
    proveedor.vfax || null,
    proveedor.vemail || null,
    proveedor.itipo_proveedor || 1,
    proveedor.iid_pais,
    proveedor.bactivo !== undefined ? proveedor.bactivo : true
  ];

  const { rows: [proveedorCreado] } = await pool.query(queryProveedor, valuesProveedor);

  if (proveedor.establecimientos && proveedor.establecimientos.length > 0) {
    const queryDireccion = `
      INSERT INTO public.tbl_proveedores_direcciones (
        iid_proveedor, v_direccion, v_tipo_direccion, b_activo
      )
      VALUES ($1, $2, $3, $4)
    `;

    for (const establecimiento of proveedor.establecimientos) {
      await pool.query(queryDireccion, [
        proveedorCreado.iid_proveedor,
        establecimiento.direccion,
        establecimiento.tipo,
        true
      ]);
    }
  }

  return proveedorCreado;
};

const updateProveedor = async (iid_proveedor, proveedor) => {
  const query = `
    UPDATE public.tbl_proveedores
    SET 
      vnombre = COALESCE($2, vnombre),
      vruc = COALESCE($3, vruc),
      vtelefono = COALESCE($4, vtelefono),
      vfax = COALESCE($5, vfax),
      vemail = COALESCE($6, vemail),
      itipo_proveedor = COALESCE($7, itipo_proveedor),
      iid_pais = COALESCE($8, iid_pais),
      bactivo = COALESCE($9, bactivo)
    WHERE iid_proveedor = $1
    RETURNING *;
  `;
  const values = [
    iid_proveedor,
    proveedor.vnombre,
    proveedor.vruc,
    proveedor.vtelefono,
    proveedor.vfax,
    proveedor.vemail,
    proveedor.itipo_proveedor,
    proveedor.iid_pais,
    proveedor.bactivo
  ];
  const { rows } = await pool.query(query, values);

  if (rows.length === 0) throw new Error('Proveedor no encontrado');

  return rows[0];
};

const deleteProveedor = async (iid_proveedor) => {
  const query = `
    UPDATE public.tbl_proveedores 
    SET bactivo = false 
    WHERE iid_proveedor = $1 
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [iid_proveedor]);

  if (rows.length === 0) throw new Error('Proveedor no encontrado');

  const queryDirecciones = `
    UPDATE public.tbl_proveedores_direcciones 
    SET b_activo = false 
    WHERE iid_proveedor = $1
  `;
  await pool.query(queryDirecciones, [iid_proveedor]);

  return rows[0];
};

const createDireccion = async (direccion) => {
  const query = `
    INSERT INTO public.tbl_proveedores_direcciones (
      iid_proveedor, v_direccion, v_tipo_direccion, b_activo
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [
    direccion.iid_proveedor,
    direccion.v_direccion,
    direccion.v_tipo_direccion,
    direccion.b_activo !== undefined ? direccion.b_activo : true
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const updateDireccion = async (iid_direccion, direccion) => {
  const query = `
    UPDATE public.tbl_proveedores_direcciones
    SET 
      v_direccion = COALESCE($2, v_direccion),
      v_tipo_direccion = COALESCE($3, v_tipo_direccion),
      b_activo = COALESCE($4, b_activo)
    WHERE iid_direccion = $1
    RETURNING *;
  `;
  const values = [
    iid_direccion,
    direccion.v_direccion,
    direccion.v_tipo_direccion,
    direccion.b_activo
  ];
  const { rows } = await pool.query(query, values);

  if (rows.length === 0) throw new Error('Dirección no encontrada');

  return rows[0];
};

const deleteDireccion = async (iid_direccion) => {
  const query = `
    UPDATE public.tbl_proveedores_direcciones 
    SET b_activo = false 
    WHERE iid_direccion = $1 
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [iid_direccion]);

  if (rows.length === 0) throw new Error('Dirección no encontrada');

  return rows[0];
};

const activateProveedor = async (iid_proveedor) => {
  const query = `
    UPDATE public.tbl_proveedores 
    SET bactivo = true 
    WHERE iid_proveedor = $1 
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [iid_proveedor]);

  if (rows.length === 0) throw new Error('Proveedor no encontrado');

  const queryDirecciones = `
    UPDATE public.tbl_proveedores_direcciones 
    SET b_activo = true 
    WHERE iid_proveedor = $1
  `;
  await pool.query(queryDirecciones, [iid_proveedor]);

  return rows[0];
};


module.exports = {
  getAllProveedores,
  getProveedorById,
  getDireccionesByProveedorId,
  createProveedor,
  updateProveedor,
  deleteProveedor,
  createDireccion,
  updateDireccion,
  deleteDireccion,
  activateProveedor
};