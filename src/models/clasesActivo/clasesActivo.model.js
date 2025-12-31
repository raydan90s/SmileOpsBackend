const pool = require('@config/dbSupabase');
const { executeWithAudit } = require('@middlewares/auditoria.middleware');

// ============================================
// OPERACIONES DE SOLO LECTURA (Sin auditoría)
// ============================================

const getAllClasesActivo = async () => {
  const query = `
    SELECT 
      iid_clase,
      vnombre_clase,
      vdescripcion,
      bactivo
    FROM public.tbl_clases_activo
    ORDER BY vnombre_clase ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getClaseActivoById = async (id) => {
  const query = `
    SELECT 
      iid_clase,
      vnombre_clase,
      vdescripcion,
      bactivo
    FROM public.tbl_clases_activo
    WHERE iid_clase = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

const getClaseActivoByNombre = async (nombre) => {
  const query = `
    SELECT 
      iid_clase,
      vnombre_clase,
      vdescripcion,
      bactivo
    FROM public.tbl_clases_activo
    WHERE vnombre_clase ILIKE $1
    ORDER BY iid_clase ASC
  `;
  const { rows } = await pool.query(query, [`%${nombre}%`]);
  return rows;
};

const getClasesActivoActivas = async () => {
  const query = `
    SELECT 
      iid_clase,
      vnombre_clase,
      vdescripcion,
      bactivo
    FROM public.tbl_clases_activo
    WHERE bactivo = true
    ORDER BY vnombre_clase ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// ============================================
// OPERACIONES DE ESCRITURA (Con auditoría)
// ============================================

const createClaseActivo = async (claseData, userId) => {
  // Verificar si existe una clase inactiva con el mismo nombre
  const checkQuery = `
    SELECT iid_clase, bactivo 
    FROM public.tbl_clases_activo 
    WHERE vnombre_clase = $1
  `;
  const checkResult = await pool.query(checkQuery, [claseData.vnombre_clase]);

  // Si existe y está inactiva, reactivarla con auditoría
  if (checkResult.rows.length > 0 && !checkResult.rows[0].bactivo) {
    const updateQuery = `
      UPDATE public.tbl_clases_activo
      SET 
        bactivo = true,
        vdescripcion = COALESCE($2, vdescripcion)
      WHERE iid_clase = $1
      RETURNING *;
    `;
    
    return await executeWithAudit(
      updateQuery,
      [checkResult.rows[0].iid_clase, claseData.vdescripcion],
      'tbl_clases_activo',
      'UPDATE',
      userId
    );
  }

  // Si existe y está activa, lanzar error
  if (checkResult.rows.length > 0 && checkResult.rows[0].bactivo) {
    const error = new Error('Ya existe una clase de activo activa con ese nombre');
    error.code = '23505';
    throw error;
  }

  // Si no existe, crear nueva con auditoría
  const query = `
    INSERT INTO public.tbl_clases_activo (
      vnombre_clase,
      vdescripcion,
      bactivo
    )
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const values = [
    claseData.vnombre_clase,
    claseData.vdescripcion || null,
    claseData.bactivo !== undefined ? claseData.bactivo : true
  ];

  return await executeWithAudit(
    query,
    values,
    'tbl_clases_activo',
    'INSERT',
    userId
  );
};

const updateClaseActivo = async (id, claseData, userId) => {
  const query = `
    UPDATE public.tbl_clases_activo
    SET 
      vnombre_clase = COALESCE($2, vnombre_clase),
      vdescripcion = COALESCE($3, vdescripcion),
      bactivo = COALESCE($4, bactivo)
    WHERE iid_clase = $1
    RETURNING *;
  `;

  const values = [
    id,
    claseData.vnombre_clase,
    claseData.vdescripcion,
    claseData.bactivo
  ];

  return await executeWithAudit(
    query,
    values,
    'tbl_clases_activo',
    'UPDATE',
    userId
  );
};

const deleteClaseActivo = async (id, userId) => {
  const query = `
    UPDATE public.tbl_clases_activo
    SET bactivo = false
    WHERE iid_clase = $1
    RETURNING *;
  `;

  return await executeWithAudit(
    query,
    [id],
    'tbl_clases_activo',
    'DELETE',
    userId
  );
};

module.exports = {
  getAllClasesActivo,
  getClaseActivoById,
  getClaseActivoByNombre,
  getClasesActivoActivas,
  createClaseActivo,
  updateClaseActivo,
  deleteClaseActivo
};