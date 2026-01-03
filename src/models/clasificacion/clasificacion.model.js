const pool = require('@config/dbSupabase');

const getAllClasificaciones = async () => {
  const query = `
    SELECT 
      iid_clasificacion,
      v_descripcion,
      b_activo
    FROM public.tbl_inv_clasificacion
    ORDER BY v_descripcion ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getClasificacionById = async (id) => {
  const query = `
    SELECT 
      iid_clasificacion,
      v_descripcion,
      b_activo
    FROM public.tbl_inv_clasificacion
    WHERE iid_clasificacion = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

const getClasificacionByDescripcion = async (descripcion) => {
  const query = `
    SELECT 
      iid_clasificacion,
      v_descripcion,
      b_activo
    FROM public.tbl_inv_clasificacion
    WHERE v_descripcion ILIKE $1
    ORDER BY v_descripcion ASC
  `;
  const { rows } = await pool.query(query, [`%${descripcion}%`]);
  return rows;
};

const getClasificacionesActivas = async () => {
  const query = `
    SELECT 
      iid_clasificacion,
      v_descripcion,
      b_activo
    FROM public.tbl_inv_clasificacion
    WHERE b_activo = true
    ORDER BY v_descripcion ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const createClasificacion = async (clasificacionData) => {
  const checkQuery = `
    SELECT iid_clasificacion, b_activo 
    FROM public.tbl_inv_clasificacion 
    WHERE v_descripcion = $1
  `;

  const checkResult = await pool.query(checkQuery, [clasificacionData.v_descripcion]);

  if (checkResult.rows.length > 0 && !checkResult.rows[0].b_activo) {
    const updateQuery = `
      UPDATE public.tbl_inv_clasificacion
      SET b_activo = true
      WHERE iid_clasificacion = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(updateQuery, [checkResult.rows[0].iid_clasificacion]);
    return rows[0];
  }

  if (checkResult.rows.length > 0 && checkResult.rows[0].b_activo) {
    const error = new Error('Ya existe una clasificación activa con esa descripción');
    error.code = '23505';
    throw error;
  }

  const query = `
    INSERT INTO public.tbl_inv_clasificacion (
      v_descripcion,
      b_activo
    )
    VALUES ($1, $2)
    RETURNING *;
  `;

  const values = [
    clasificacionData.v_descripcion,
    clasificacionData.b_activo !== undefined ? clasificacionData.b_activo : true
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

const updateClasificacion = async (id, clasificacionData) => {
  const query = `
    UPDATE public.tbl_inv_clasificacion
    SET 
      v_descripcion = COALESCE($2, v_descripcion),
      b_activo = COALESCE($3, b_activo)
    WHERE iid_clasificacion = $1
    RETURNING *;
  `;

  const values = [
    id,
    clasificacionData.v_descripcion,
    clasificacionData.b_activo
  ];

  const { rows } = await pool.query(query, values);
  return rows[0] || null;
};

const deleteClasificacion = async (id) => {
  const query = `
    UPDATE public.tbl_inv_clasificacion
    SET b_activo = false
    WHERE iid_clasificacion = $1
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

module.exports = {
  getAllClasificaciones,
  getClasificacionById,
  getClasificacionByDescripcion,
  getClasificacionesActivas,
  createClasificacion,
  updateClasificacion,
  deleteClasificacion
};