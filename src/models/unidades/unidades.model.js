const pool = require('@config/dbSupabase');

const getAllUnidades = async () => {
  const query = `
    SELECT 
      iidunidad,
      vnombreunidad,
      vabreviatura,
      bactivo
    FROM public.unidades_medida
    ORDER BY vnombreunidad ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getUnidadById = async (id) => {
  const query = `
    SELECT 
      iidunidad,
      vnombreunidad,
      vabreviatura,
      bactivo
    FROM public.unidades_medida
    WHERE iidunidad = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

const getUnidadByNombre = async (nombre) => {
  const query = `
    SELECT 
      iidunidad,
      vnombreunidad,
      vabreviatura,
      bactivo
    FROM public.unidades_medida
    WHERE vnombreunidad ILIKE $1
    ORDER BY iidunidad ASC
  `;
  const { rows } = await pool.query(query, [`%${nombre}%`]);
  return rows;
};

const getUnidadesActivas = async () => {
  const query = `
    SELECT 
      iidunidad,
      vnombreunidad,
      vabreviatura,
      bactivo
    FROM public.unidades_medida
    WHERE bactivo = true
    ORDER BY vnombreunidad ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const createUnidad = async (unidadData) => {
  const checkQuery = `
    SELECT iidunidad, bactivo 
    FROM public.unidades_medida 
    WHERE vnombreunidad = $1
  `;

  const checkResult = await pool.query(checkQuery, [unidadData.vnombreunidad]);

  if (checkResult.rows.length > 0 && !checkResult.rows[0].bactivo) {
    const updateQuery = `
      UPDATE public.unidades_medida
      SET 
        bactivo = true,
        vabreviatura = COALESCE($2, vabreviatura)
      WHERE iidunidad = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(updateQuery, [
      checkResult.rows[0].iidunidad,
      unidadData.vabreviatura
    ]);
    return rows[0];
  }

  if (checkResult.rows.length > 0 && checkResult.rows[0].bactivo) {
    const error = new Error('Ya existe una unidad activa con ese nombre');
    error.code = '23505';
    throw error;
  }
  const query = `
    INSERT INTO public.unidades_medida (
      vnombreunidad,
      vabreviatura,
      bactivo
    )
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const values = [
    unidadData.vnombreunidad,
    unidadData.vabreviatura || null,
    unidadData.bactivo !== undefined ? unidadData.bactivo : true
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

const updateUnidad = async (id, unidadData) => {
  const query = `
    UPDATE public.unidades_medida
    SET 
      vnombreunidad = COALESCE($2, vnombreunidad),
      vabreviatura = COALESCE($3, vabreviatura),
      bactivo = COALESCE($4, bactivo)
    WHERE iidunidad = $1
    RETURNING *;
  `;

  const values = [
    id,
    unidadData.vnombreunidad,
    unidadData.vabreviatura,
    unidadData.bactivo
  ];

  const { rows } = await pool.query(query, values);
  return rows[0] || null;
};

const deleteUnidad = async (id) => {
  const query = `
    UPDATE public.unidades_medida
    SET bactivo = false
    WHERE iidunidad = $1
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

module.exports = {
  getAllUnidades,
  getUnidadById,
  getUnidadByNombre,
  getUnidadesActivas,
  createUnidad,
  updateUnidad,
  deleteUnidad
};