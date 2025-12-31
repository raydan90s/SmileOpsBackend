const pool = require('@config/dbSupabase');

const getAllCiudades = async (iidprovincia, iidpais) => {
  let query = `
    SELECT 
      c.iidciudad, 
      c.vnombre, 
      c.vcodigo, 
      c.bactivo, 
      c.iidprovincia,
      c.iidpais,
      p.vnombre AS nombre_provincia,
      pa.vnombre AS nombre_pais
    FROM public.tblciudades c
    LEFT JOIN public.tblprovincias p ON c.iidprovincia = p.iidprovincia
    LEFT JOIN public.tblpaises pa ON c.iidpais = pa.iidpais
    WHERE c.bactivo = true
  `;

  const params = [];
  let paramCount = 0;

  if (iidprovincia) {
    paramCount++;
    query += ` AND c.iidprovincia = $${paramCount}`;
    params.push(iidprovincia);
  }

  if (iidpais) {
    paramCount++;
    query += ` AND c.iidpais = $${paramCount}`;
    params.push(iidpais);
  }

  query += ` ORDER BY c.vnombre ASC`;

  const { rows } = await pool.query(query, params);
  return rows;
};

const getCiudadById = async (iidciudad) => {
  const query = `
    SELECT 
      c.iidciudad, 
      c.vnombre, 
      c.vcodigo, 
      c.bactivo, 
      c.iidprovincia,
      c.iidpais,
      p.vnombre AS nombre_provincia,
      pa.vnombre AS nombre_pais
    FROM public.tblciudades c
    LEFT JOIN public.tblprovincias p ON c.iidprovincia = p.iidprovincia
    LEFT JOIN public.tblpaises pa ON c.iidpais = pa.iidpais
    WHERE c.iidciudad = $1
  `;
  const { rows } = await pool.query(query, [iidciudad]);
  return rows[0] || null;
};

module.exports = {
  getAllCiudades,
  getCiudadById
};