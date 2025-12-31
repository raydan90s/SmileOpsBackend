const pool = require('@config/dbSupabase');

// ============================================
// OPERACIONES DE SOLO LECTURA (Sin auditoría)
// ============================================

const getAllEstadosOperativos = async () => {
  const query = `
    SELECT 
      iid_estado_operativo,
      vnombre_estado,
      vdescripcion,
      bactivo,
      dfecha_creacion
    FROM public.tbl_estados_operativos
    ORDER BY vnombre_estado ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getEstadoOperativoById = async (id) => {
  const query = `
    SELECT 
      iid_estado_operativo,
      vnombre_estado,
      vdescripcion,
      bactivo,
      dfecha_creacion
    FROM public.tbl_estados_operativos
    WHERE iid_estado_operativo = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

const getEstadoOperativoByNombre = async (nombre) => {
  const query = `
    SELECT 
      iid_estado_operativo,
      vnombre_estado,
      vdescripcion,
      bactivo,
      dfecha_creacion
    FROM public.tbl_estados_operativos
    WHERE vnombre_estado ILIKE $1
    ORDER BY iid_estado_operativo ASC
  `;
  const { rows } = await pool.query(query, [`%${nombre}%`]);
  return rows;
};

const getEstadosOperativosActivos = async () => {
  const query = `
    SELECT 
      iid_estado_operativo,
      vnombre_estado,
      vdescripcion,
      bactivo,
      dfecha_creacion
    FROM public.tbl_estados_operativos
    WHERE bactivo = true
    ORDER BY vnombre_estado ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// ============================================
// OPERACIONES DE ESCRITURA (Sin auditoría)
// ============================================

const createEstadoOperativo = async (estadoData) => {
  // Verificar si existe un estado inactivo con el mismo nombre
  const checkQuery = `
    SELECT iid_estado_operativo, bactivo 
    FROM public.tbl_estados_operativos 
    WHERE vnombre_estado = $1
  `;
  const checkResult = await pool.query(checkQuery, [estadoData.vnombre_estado]);

  // Si existe y está inactivo, reactivarlo
  if (checkResult.rows.length > 0 && !checkResult.rows[0].bactivo) {
    const updateQuery = `
      UPDATE public.tbl_estados_operativos
      SET 
        bactivo = true,
        vdescripcion = COALESCE($2, vdescripcion)
      WHERE iid_estado_operativo = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(updateQuery, [
      checkResult.rows[0].iid_estado_operativo,
      estadoData.vdescripcion
    ]);
    return rows[0];
  }

  // Si existe y está activo, lanzar error
  if (checkResult.rows.length > 0 && checkResult.rows[0].bactivo) {
    const error = new Error('Ya existe un estado operativo activo con ese nombre');
    error.code = '23505';
    throw error;
  }

  // Si no existe, crear nuevo
  const query = `
    INSERT INTO public.tbl_estados_operativos (
      vnombre_estado,
      vdescripcion,
      bactivo
    )
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const values = [
    estadoData.vnombre_estado,
    estadoData.vdescripcion || null,
    estadoData.bactivo !== undefined ? estadoData.bactivo : true
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

const updateEstadoOperativo = async (id, estadoData) => {
  const query = `
    UPDATE public.tbl_estados_operativos
    SET 
      vnombre_estado = COALESCE($2, vnombre_estado),
      vdescripcion = COALESCE($3, vdescripcion),
      bactivo = COALESCE($4, bactivo)
    WHERE iid_estado_operativo = $1
    RETURNING *;
  `;

  const values = [
    id,
    estadoData.vnombre_estado,
    estadoData.vdescripcion,
    estadoData.bactivo
  ];

  const { rows } = await pool.query(query, values);
  return rows[0] || null;
};

const deleteEstadoOperativo = async (id) => {
  const query = `
    UPDATE public.tbl_estados_operativos
    SET bactivo = false
    WHERE iid_estado_operativo = $1
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

module.exports = {
  getAllEstadosOperativos,
  getEstadoOperativoById,
  getEstadoOperativoByNombre,
  getEstadosOperativosActivos,
  createEstadoOperativo,
  updateEstadoOperativo,
  deleteEstadoOperativo
};