  const pool = require('@config/dbSupabase');

  const getAllMarcas = async () => {
    const query = `
      SELECT 
        iid_marca,
        vnombre_marca,
        bactivo
      FROM public.tbl_marcas
      ORDER BY vnombre_marca ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  };

  const getMarcaById = async (id) => {
    const query = `
      SELECT 
        iid_marca,
        vnombre_marca,
        bactivo
      FROM public.tbl_marcas
      WHERE iid_marca = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  };

  const getMarcaByNombre = async (nombre) => {
    const query = `
      SELECT 
        iid_marca,
        vnombre_marca,
        bactivo
      FROM public.tbl_marcas
      WHERE vnombre_marca ILIKE $1
      ORDER BY iid_marca ASC
    `;
    const { rows } = await pool.query(query, [`%${nombre}%`]);
    return rows;
  };

  const getMarcasActivas = async () => {
    const query = `
      SELECT 
        iid_marca,
        vnombre_marca,
        bactivo
      FROM public.tbl_marcas
      WHERE bactivo = true
      ORDER BY vnombre_marca ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  };

  const createMarca = async (marcaData) => {
    // Verificar si existe una marca inactiva con el mismo nombre
    const checkQuery = `
      SELECT iid_marca, bactivo 
      FROM public.tbl_marcas 
      WHERE vnombre_marca = $1
    `;
    
    console.log('🔍 Buscando marca:', marcaData.vnombre_marca);
    const checkResult = await pool.query(checkQuery, [marcaData.vnombre_marca]);
    console.log('🔍 Resultado búsqueda:', checkResult.rows);

    // Si existe y está inactiva, reactivarla
    if (checkResult.rows.length > 0 && !checkResult.rows[0].bactivo) {
      const updateQuery = `
        UPDATE public.tbl_marcas
        SET bactivo = true
        WHERE iid_marca = $1
        RETURNING *;
      `;
      const { rows } = await pool.query(updateQuery, [checkResult.rows[0].iid_marca]);
      return rows[0];
    }

    // Si existe y está activa, lanzar error
    if (checkResult.rows.length > 0 && checkResult.rows[0].bactivo) {
      const error = new Error('Ya existe una marca activa con ese nombre');
      error.code = '23505';
      throw error;
    }

    // Si no existe, crear nueva
    const query = `
      INSERT INTO public.tbl_marcas (
        vnombre_marca,
        bactivo
      )
      VALUES ($1, $2)
      RETURNING *;
    `;

    const values = [
      marcaData.vnombre_marca,
      marcaData.bactivo !== undefined ? marcaData.bactivo : true
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  };

  const updateMarca = async (id, marcaData) => {
    const query = `
      UPDATE public.tbl_marcas
      SET 
        vnombre_marca = COALESCE($2, vnombre_marca),
        bactivo = COALESCE($3, bactivo)
      WHERE iid_marca = $1
      RETURNING *;
    `;

    const values = [
      id,
      marcaData.vnombre_marca,
      marcaData.bactivo
    ];

    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  };

  const deleteMarca = async (id) => {
    const query = `
      UPDATE public.tbl_marcas
      SET bactivo = false
      WHERE iid_marca = $1
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  };

  module.exports = {
    getAllMarcas,
    getMarcaById,
    getMarcaByNombre,
    getMarcasActivas,
    createMarca,
    updateMarca,
    deleteMarca
  };