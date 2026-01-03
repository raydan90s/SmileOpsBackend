const pool = require('@config/dbSupabase');

const getAllBodegas = async (iid_tipo_bodega) => {
  let query = `
    SELECT 
      b.iid_bodega,
      b.vnombre_bodega,
      b.iid_tipo_bodega,
      b.bactivo,
      tb.vnombre_tipo AS nombre_tipo_bodega
    FROM public.tbl_bodegas b
    LEFT JOIN public.tbl_tipos_bodega tb ON b.iid_tipo_bodega = tb.iid_tipo_bodega
    WHERE b.bactivo = true
  `;

  const params = [];

  if (iid_tipo_bodega) {
    query += ` AND b.iid_tipo_bodega = $1`;
    params.push(iid_tipo_bodega);
  }

  query += ` ORDER BY b.vnombre_bodega ASC`;

  const { rows } = await pool.query(query, params);
  return rows;
};

const getBodegaById = async (iid_bodega) => {
  const query = `
    SELECT 
      b.iid_bodega,
      b.vnombre_bodega,
      b.iid_tipo_bodega,
      b.bactivo,
      tb.vnombre_tipo AS nombre_tipo_bodega
    FROM public.tbl_bodegas b
    LEFT JOIN public.tbl_tipos_bodega tb ON b.iid_tipo_bodega = tb.iid_tipo_bodega
    WHERE b.iid_bodega = $1
  `;
  const { rows } = await pool.query(query, [iid_bodega]);
  return rows[0] || null;
};

const getBodegasPrincipales = async () => {
  const query = `
    SELECT 
      b.iid_bodega,
      b.vnombre_bodega,
      b.iid_tipo_bodega,
      b.bactivo,
      tb.vnombre_tipo AS nombre_tipo_bodega
    FROM public.tbl_bodegas b
    LEFT JOIN public.tbl_tipos_bodega tb ON b.iid_tipo_bodega = tb.iid_tipo_bodega
    WHERE b.bactivo = true
    AND b.iid_tipo_bodega = 1 
    ORDER BY b.vnombre_bodega ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const createBodega = async (bodega) => {
  const query = `
    INSERT INTO public.tbl_bodegas (vnombre_bodega, iid_tipo_bodega, bactivo)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [
    bodega.vnombre_bodega,
    bodega.iid_tipo_bodega,
    bodega.bactivo !== undefined ? bodega.bactivo : true
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

const updateBodega = async (iid_bodega, bodega) => {
  const query = `
    UPDATE public.tbl_bodegas
    SET 
      vnombre_bodega = COALESCE($2, vnombre_bodega),
      iid_tipo_bodega = COALESCE($3, iid_tipo_bodega),
      bactivo = COALESCE($4, bactivo)
    WHERE iid_bodega = $1
    RETURNING *;
  `;
  const values = [
    iid_bodega,
    bodega.vnombre_bodega,
    bodega.iid_tipo_bodega,
    bodega.bactivo
  ];

  const { rows } = await pool.query(query, values);

  if (rows.length === 0) throw new Error('Bodega no encontrada');

  return rows[0];
};

const deleteBodega = async (iid_bodega) => {
  const query = `DELETE FROM public.tbl_bodegas WHERE iid_bodega = $1 RETURNING *;`;

  const { rows } = await pool.query(query, [iid_bodega]);

  if (rows.length === 0) throw new Error('Bodega no encontrada');

  return rows[0];
};

module.exports = {
  getAllBodegas,
  getBodegaById,
  createBodega,
  updateBodega,
  deleteBodega,
  getBodegasPrincipales
};