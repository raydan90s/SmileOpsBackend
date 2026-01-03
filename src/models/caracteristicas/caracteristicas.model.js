const pool = require('@config/dbSupabase');

const getAllCaracteristicas = async () => {
  const query = `
    SELECT 
      iid_caracteristica,
      vnombre_caracteristica,
      bactivo
    FROM public.tbl_caracteristicas
    ORDER BY vnombre_caracteristica ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getCaracteristicaById = async (id) => {
  const query = `
    SELECT 
      iid_caracteristica,
      vnombre_caracteristica,
      bactivo
    FROM public.tbl_caracteristicas
    WHERE iid_caracteristica = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

const getCaracteristicaByNombre = async (nombre) => {
  const query = `
    SELECT 
      iid_caracteristica,
      vnombre_caracteristica,
      bactivo
    FROM public.tbl_caracteristicas
    WHERE vnombre_caracteristica ILIKE $1
    ORDER BY iid_caracteristica ASC
  `;
  const { rows } = await pool.query(query, [`%${nombre}%`]);
  return rows;
};

const getCaracteristicasActivas = async () => {
  const query = `
    SELECT 
      iid_caracteristica,
      vnombre_caracteristica,
      bactivo
    FROM public.tbl_caracteristicas
    WHERE bactivo = true
    ORDER BY vnombre_caracteristica ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const createCaracteristica = async (caracteristicaData) => {
  const checkQuery = `
    SELECT iid_caracteristica, bactivo 
    FROM public.tbl_caracteristicas 
    WHERE vnombre_caracteristica = $1
  `;
  const checkResult = await pool.query(checkQuery, [caracteristicaData.vnombre_caracteristica]);

  if (checkResult.rows.length > 0 && !checkResult.rows[0].bactivo) {
    const updateQuery = `
      UPDATE public.tbl_caracteristicas
      SET bactivo = true
      WHERE iid_caracteristica = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(updateQuery, [checkResult.rows[0].iid_caracteristica]);
    return rows[0];
  }

  if (checkResult.rows.length > 0 && checkResult.rows[0].bactivo) {
    const error = new Error('Ya existe una característica activa con ese nombre');
    error.code = '23505';
    throw error;
  }

  const query = `
    INSERT INTO public.tbl_caracteristicas (
      vnombre_caracteristica,
      bactivo
    )
    VALUES ($1, $2)
    RETURNING *;
  `;

  const values = [
    caracteristicaData.vnombre_caracteristica,
    caracteristicaData.bactivo !== undefined ? caracteristicaData.bactivo : true
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

const updateCaracteristica = async (id, caracteristicaData) => {
  const query = `
    UPDATE public.tbl_caracteristicas
    SET 
      vnombre_caracteristica = COALESCE($2, vnombre_caracteristica),
      bactivo = COALESCE($3, bactivo)
    WHERE iid_caracteristica = $1
    RETURNING *;
  `;

  const values = [
    id,
    caracteristicaData.vnombre_caracteristica,
    caracteristicaData.bactivo
  ];

  const { rows } = await pool.query(query, values);
  return rows[0] || null;
};

const deleteCaracteristica = async (id) => {
  const query = `
    UPDATE public.tbl_caracteristicas
    SET bactivo = false
    WHERE iid_caracteristica = $1
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

module.exports = {
  getAllCaracteristicas,
  getCaracteristicaById,
  getCaracteristicaByNombre,
  getCaracteristicasActivas,
  createCaracteristica,
  updateCaracteristica,
  deleteCaracteristica
};