const pool = require('@config/dbSupabase');
const { executeWithAudit } = require('@middlewares/auditoria.middleware');

const getAllTratamientosDetalle = async () => {
  const query = `
    SELECT 
      td.iidtratamientodetalle,
      td.sitratamiento,
      td.vcodigo,
      td.vdescripcion,
      td.dvalortratamiento,
      td.bestado,
      -- Traer información del tratamiento y categoría
      t.vcodigo as codigo_tratamiento,
      t.vdesctratamiento as nombre_tratamiento,
      c.iidcategoria,
      c.vcodigo as codigo_categoria,
      c.vnombre as nombre_categoria
    FROM public.odontbltratamientodetalle td
    LEFT JOIN public.odontbltratamientos t ON td.sitratamiento = t.sitratamiento
    LEFT JOIN public.odontblcategorias c ON t.iidcategoria = c.iidcategoria
    WHERE td.bestado = true
    ORDER BY td.vcodigo ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getTratamientoDetalleById = async (id) => {
  const query = `
    SELECT 
      td.*,
      t.vcodigo as codigo_tratamiento,
      t.vdesctratamiento as nombre_tratamiento,
      c.iidcategoria,
      c.vcodigo as codigo_categoria,
      c.vnombre as nombre_categoria
    FROM public.odontbltratamientodetalle td
    LEFT JOIN public.odontbltratamientos t ON td.sitratamiento = t.sitratamiento
    LEFT JOIN public.odontblcategorias c ON t.iidcategoria = c.iidcategoria
    WHERE td.iidtratamientodetalle = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

const createTratamientoDetalle = async (data, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      INSERT INTO public.odontbltratamientodetalle (
        sitratamiento, vcodigo, vdescripcion, dvalortratamiento, bestado
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      data.sitratamiento,
      data.vcodigo,
      data.vdescripcion,
      data.dvalortratamiento,
      data.bestado !== undefined ? data.bestado : true
    ];
    const { rows } = await client.query(query, values);
    return rows[0];
  });
};

const updateTratamientoDetalle = async (id, data, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      UPDATE public.odontbltratamientodetalle
      SET 
        sitratamiento = COALESCE($2, sitratamiento),
        vcodigo = COALESCE($3, vcodigo),
        vdescripcion = COALESCE($4, vdescripcion),
        dvalortratamiento = COALESCE($5, dvalortratamiento),
        bestado = COALESCE($6, bestado)
      WHERE iidtratamientodetalle = $1
      RETURNING *;
    `;
    const values = [
      id,
      data.sitratamiento,
      data.vcodigo,
      data.vdescripcion,
      data.dvalortratamiento,
      data.bestado
    ];
    const { rows } = await client.query(query, values);
    
    if (rows.length === 0) throw new Error('Detalle de tratamiento no encontrado');
    
    return rows[0];
  });
};

const deleteTratamientoDetalle = async (id, req) => {
  return executeWithAudit(pool, req, async (client) => {
    // Soft delete - cambiar bestado a false
    const query = `
      UPDATE public.odontbltratamientodetalle 
      SET bestado = false
      WHERE iidtratamientodetalle = $1 
      RETURNING *;
    `;
    const { rows } = await client.query(query, [id]);
    
    if (rows.length === 0) throw new Error('Detalle de tratamiento no encontrado');
    
    return rows[0];
  });
};

module.exports = {
  getAllTratamientosDetalle,
  getTratamientoDetalleById,
  createTratamientoDetalle,
  updateTratamientoDetalle,
  deleteTratamientoDetalle
};