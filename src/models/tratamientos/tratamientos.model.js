const pool = require('@config/dbSupabase');
const { executeWithAudit } = require('@middlewares/auditoria.middleware');

// ============================================
// LECTURAS (Reportes y Selects)
// ============================================

// Reporte completo con la nueva estructura
const getReporteCompleto = async () => {
  const query = `
    SELECT 
      CONCAT(c.vcodigo, ' - ', c.vnombre) AS clasificacion,
      CONCAT(t.vcodigo, ' - ', t.vdesctratamiento) AS subclasificacion,
      CONCAT(d.vcodigo, ' - ', d.vdescripcion) AS servicio,
      d.dvalortratamiento::money AS precio
    FROM public.odontbltratamientodetalle d
    JOIN public.odontbltratamientos t ON d.sitratamiento = t.sitratamiento
    JOIN public.odontblcategorias c ON t.iidcategoria = c.iidcategoria
    WHERE d.bestado = TRUE
      AND t.bactivo = TRUE
      AND c.bestado = TRUE
    ORDER BY c.vcodigo, t.vcodigo, d.vcodigo;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// Obtiene el listado CRUD de tratamientos
const getAllTratamientos = async () => {
  const query = `
    SELECT 
      t.sitratamiento,
      t.iidcategoria,
      t.vcodigo,
      t.vdesctratamiento,
      t.dvalortratamiento,
      t.bactivo,
      c.vcodigo AS codigo_categoria,
      c.vnombre AS nombre_categoria
    FROM public.odontbltratamientos t
    LEFT JOIN public.odontblcategorias c ON t.iidcategoria = c.iidcategoria
    WHERE t.bactivo = TRUE
    ORDER BY t.vcodigo ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// Busca por primary key (ahora es solo sitratamiento)
const getTratamientoById = async (sitratamiento) => {
  const query = `
    SELECT 
      t.*,
      c.vcodigo AS codigo_categoria,
      c.vnombre AS nombre_categoria
    FROM public.odontbltratamientos t
    LEFT JOIN public.odontblcategorias c ON t.iidcategoria = c.iidcategoria
    WHERE t.sitratamiento = $1
  `;
  const { rows } = await pool.query(query, [sitratamiento]);
  return rows[0] || null;
};

// Obtener tratamientos por categoría
const getTratamientosByCategoria = async (iidcategoria) => {
  const query = `
    SELECT 
      t.*,
      c.vnombre AS nombre_categoria
    FROM public.odontbltratamientos t
    LEFT JOIN public.odontblcategorias c ON t.iidcategoria = c.iidcategoria
    WHERE t.iidcategoria = $1 AND t.bactivo = TRUE
    ORDER BY t.vcodigo ASC
  `;
  const { rows } = await pool.query(query, [iidcategoria]);
  return rows;
};

// ============================================
// ESCRITURA (Con Auditoría)
// ============================================

const createTratamiento = async (data, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      INSERT INTO public.odontbltratamientos (
        iidcategoria, vcodigo, vdesctratamiento, dvalortratamiento, bactivo
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      data.iidcategoria,
      data.vcodigo,
      data.vdesctratamiento,
      data.dvalortratamiento || 0,
      data.bactivo !== undefined ? data.bactivo : true
    ];
    const { rows } = await client.query(query, values);
    return rows[0];
  });
};

const updateTratamiento = async (sitratamiento, data, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      UPDATE public.odontbltratamientos
      SET 
        iidcategoria = COALESCE($2, iidcategoria),
        vcodigo = COALESCE($3, vcodigo),
        vdesctratamiento = COALESCE($4, vdesctratamiento),
        dvalortratamiento = COALESCE($5, dvalortratamiento),
        bactivo = COALESCE($6, bactivo)
      WHERE sitratamiento = $1
      RETURNING *;
    `;
    const values = [
      sitratamiento,
      data.iidcategoria,
      data.vcodigo,
      data.vdesctratamiento,
      data.dvalortratamiento,
      data.bactivo
    ];
    const { rows } = await client.query(query, values);
    
    if (rows.length === 0) throw new Error('Tratamiento no encontrado');
    
    return rows[0];
  });
};

const deleteTratamiento = async (sitratamiento, req) => {
  return executeWithAudit(pool, req, async (client) => {
    // Soft delete - cambiar bactivo a false
    const query = `
      UPDATE public.odontbltratamientos 
      SET bactivo = false
      WHERE sitratamiento = $1
      RETURNING *;
    `;
    const { rows } = await client.query(query, [sitratamiento]);
    
    if (rows.length === 0) throw new Error('Tratamiento no encontrado');
    
    return rows[0];
  });
};

module.exports = {
  getReporteCompleto,
  getAllTratamientos,
  getTratamientoById,
  getTratamientosByCategoria,
  createTratamiento,
  updateTratamiento,
  deleteTratamiento
};