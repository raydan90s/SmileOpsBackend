const pool = require('@config/dbSupabase');

const getAllSubclasificaciones = async () => {
  const query = `
    SELECT 
      s.iid_subclasificacion,
      s.iid_clasificacion,
      s.v_codigo,
      s.v_descripcion,
      s.b_activo,
      c.v_descripcion AS clasificacion_nombre
    FROM public.tbl_inv_subclasificacion s
    LEFT JOIN public.tbl_inv_clasificacion c ON s.iid_clasificacion = c.iid_clasificacion
    ORDER BY s.v_codigo ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getSubclasificacionById = async (id) => {
  const query = `
    SELECT 
      s.iid_subclasificacion,
      s.iid_clasificacion,
      s.v_codigo,
      s.v_descripcion,
      s.b_activo,
      c.v_descripcion AS clasificacion_nombre
    FROM public.tbl_inv_subclasificacion s
    LEFT JOIN public.tbl_inv_clasificacion c ON s.iid_clasificacion = c.iid_clasificacion
    WHERE s.iid_subclasificacion = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

const getSubclasificacionByDescripcion = async (descripcion) => {
  const query = `
    SELECT 
      s.iid_subclasificacion,
      s.iid_clasificacion,
      s.v_codigo,
      s.v_descripcion,
      s.b_activo,
      c.v_descripcion AS clasificacion_nombre
    FROM public.tbl_inv_subclasificacion s
    LEFT JOIN public.tbl_inv_clasificacion c ON s.iid_clasificacion = c.iid_clasificacion
    WHERE s.v_descripcion ILIKE $1
    ORDER BY s.v_codigo ASC
  `;
  const { rows } = await pool.query(query, [`%${descripcion}%`]);
  return rows;
};

const getSubclasificacionesActivas = async () => {
  const query = `
    SELECT 
      s.iid_subclasificacion,
      s.iid_clasificacion,
      s.v_codigo,
      s.v_descripcion,
      s.b_activo,
      c.v_descripcion AS clasificacion_nombre
    FROM public.tbl_inv_subclasificacion s
    LEFT JOIN public.tbl_inv_clasificacion c ON s.iid_clasificacion = c.iid_clasificacion
    WHERE s.b_activo = true
    ORDER BY s.v_codigo ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getSubclasificacionesByClasificacion = async (iid_clasificacion) => {
  const query = `
    SELECT 
      iid_subclasificacion,
      iid_clasificacion,
      v_codigo,
      v_descripcion,
      b_activo
    FROM public.tbl_inv_subclasificacion
    WHERE iid_clasificacion = $1 AND b_activo = true
    ORDER BY v_codigo ASC
  `;
  const { rows } = await pool.query(query, [iid_clasificacion]);
  return rows;
};

const createSubclasificacion = async (subclasificacionData) => {
  // Verificar si existe una subclasificación inactiva con el mismo código
  const checkQuery = `
    SELECT iid_subclasificacion, b_activo 
    FROM public.tbl_inv_subclasificacion 
    WHERE v_codigo = $1 AND iid_clasificacion = $2
  `;
  
  const checkResult = await pool.query(checkQuery, [
    subclasificacionData.v_codigo,
    subclasificacionData.iid_clasificacion
  ]);

  // Si existe y está inactiva, reactivarla
  if (checkResult.rows.length > 0 && !checkResult.rows[0].b_activo) {
    const updateQuery = `
      UPDATE public.tbl_inv_subclasificacion
      SET 
        v_descripcion = $2,
        b_activo = true
      WHERE iid_subclasificacion = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(updateQuery, [
      checkResult.rows[0].iid_subclasificacion,
      subclasificacionData.v_descripcion
    ]);
    return rows[0];
  }

  // Si existe y está activa, lanzar error
  if (checkResult.rows.length > 0 && checkResult.rows[0].b_activo) {
    const error = new Error('Ya existe una subclasificación activa con ese código');
    error.code = '23505';
    throw error;
  }

  // Si no existe, crear nueva
  const query = `
    INSERT INTO public.tbl_inv_subclasificacion (
      iid_clasificacion,
      v_codigo,
      v_descripcion,
      b_activo
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [
    subclasificacionData.iid_clasificacion,
    subclasificacionData.v_codigo,
    subclasificacionData.v_descripcion,
    subclasificacionData.b_activo !== undefined ? subclasificacionData.b_activo : true
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

const updateSubclasificacion = async (id, subclasificacionData) => {
  const query = `
    UPDATE public.tbl_inv_subclasificacion
    SET 
      iid_clasificacion = COALESCE($2, iid_clasificacion),
      v_codigo = COALESCE($3, v_codigo),
      v_descripcion = COALESCE($4, v_descripcion),
      b_activo = COALESCE($5, b_activo)
    WHERE iid_subclasificacion = $1
    RETURNING *;
  `;

  const values = [
    id,
    subclasificacionData.iid_clasificacion,
    subclasificacionData.v_codigo,
    subclasificacionData.v_descripcion,
    subclasificacionData.b_activo
  ];

  const { rows } = await pool.query(query, values);
  return rows[0] || null;
};

const deleteSubclasificacion = async (id) => {
  const query = `
    UPDATE public.tbl_inv_subclasificacion
    SET b_activo = false
    WHERE iid_subclasificacion = $1
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

module.exports = {
  getAllSubclasificaciones,
  getSubclasificacionById,
  getSubclasificacionByDescripcion,
  getSubclasificacionesActivas,
  getSubclasificacionesByClasificacion,
  createSubclasificacion,
  updateSubclasificacion,
  deleteSubclasificacion
};