const pool = require('@config/dbSupabase');
const { executeWithAudit } = require('@middlewares/auditoria.middleware');

const getAllProvincias = async (iidpais) => {
  let query = `
    SELECT 
      pr.iidprovincia,
      pr.iidpais,
      pr.vnombre,
      pr.codprov,
      pr.bactivo,
      pr.vdescripcion,
      pa.vnombre AS nombre_pais
    FROM public.tblprovincias pr
    LEFT JOIN public.tblpaises pa ON pr.iidpais = pa.iidpais
    WHERE pr.bactivo = true
  `;
  
  const params = [];
  
  if (iidpais) {
    query += ` AND pr.iidpais = $1`;
    params.push(iidpais);
  }
  
  query += ` ORDER BY pr.vnombre ASC`;
  
  const { rows } = await pool.query(query, params);
  return rows;
};

const getProvinciaById = async (iidprovincia) => {
  const query = `
    SELECT 
      pr.*,
      pa.vnombre AS nombre_pais
    FROM public.tblprovincias pr
    LEFT JOIN public.tblpaises pa ON pr.iidpais = pa.iidpais
    WHERE pr.iidprovincia = $1
  `;
  const { rows } = await pool.query(query, [iidprovincia]);
  return rows[0] || null;
};

const createProvincia = async (provincia, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      INSERT INTO public.tblprovincias (
        iidpais, vnombre, codprov, vdescripcion, bactivo
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      provincia.iidpais,
      provincia.vnombre,
      provincia.codprov,
      provincia.vdescripcion,
      provincia.bactivo !== undefined ? provincia.bactivo : true
    ];
    const { rows } = await client.query(query, values);
    return rows[0];
  });
};

const updateProvincia = async (iidprovincia, provincia, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      UPDATE public.tblprovincias
      SET 
        iidpais = COALESCE($2, iidpais),
        vnombre = COALESCE($3, vnombre),
        codprov = COALESCE($4, codprov),
        vdescripcion = COALESCE($5, vdescripcion),
        bactivo = COALESCE($6, bactivo)
      WHERE iidprovincia = $1
      RETURNING *;
    `;
    const values = [
      iidprovincia,
      provincia.iidpais,
      provincia.vnombre,
      provincia.codprov,
      provincia.vdescripcion,
      provincia.bactivo
    ];
    const { rows } = await client.query(query, values);
    
    if (rows.length === 0) throw new Error('Provincia no encontrada');
    
    return rows[0];
  });
};

const deleteProvincia = async (iidprovincia, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `DELETE FROM public.tblprovincias WHERE iidprovincia = $1 RETURNING *;`;
    const { rows } = await client.query(query, [iidprovincia]);
    
    if (rows.length === 0) throw new Error('Provincia no encontrada');
    
    return rows[0];
  });
};

module.exports = {
  getAllProvincias,
  getProvinciaById,
  createProvincia,
  updateProvincia,
  deleteProvincia
};