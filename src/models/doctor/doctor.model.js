const pool = require('@config/dbSupabase');
const { executeWithAudit } = require('@middlewares/auditoria.middleware');

const getAllDoctores = async () => {
  const query = `
    SELECT 
      d.*,
      TRIM(CONCAT(d.vnombres, ' ', d.vapellidos)) AS "nombreCompleto",
      d.cestado
    FROM public.odontbldoctores d
    ORDER BY d.iiddoctor ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getDoctorById = async (iiddoctor) => {
  const query = `
    SELECT 
      d.*,
      TRIM(CONCAT(d.vnombres, ' ', d.vapellidos)) AS "nombreCompleto"
    FROM public.odontbldoctores d
    WHERE d.iiddoctor = $1
  `;
  const { rows } = await pool.query(query, [iiddoctor]);
  return rows[0] || null;
};

// ============================================
// OPERACIONES DE ESCRITURA (Con Auditoría)
// ============================================

const createDoctor = async (doctor, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      INSERT INTO public.odontbldoctores (
        vcedula, vnombres, vapellidos, iidcargo, iidespecialidad,
        vtelefono, vcelular, vemail, dfechanacimiento, dfechacontratacion,
        btemporal, cestado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
    const values = [
      doctor.vcedula,
      doctor.vnombres,
      doctor.vapellidos,
      doctor.iidcargo,
      doctor.iidespecialidad,
      doctor.vtelefono,
      doctor.vcelular,
      doctor.vemail,
      doctor.dfechanacimiento,
      doctor.dfechacontratacion,
      doctor.btemporal !== undefined ? doctor.btemporal : false,
      doctor.cestado || 'A'
    ];
    const { rows } = await client.query(query, values);
    return rows[0];
  });
};

const updateDoctor = async (iiddoctor, doctor, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      UPDATE public.odontbldoctores
      SET 
        vcedula = COALESCE($2, vcedula),
        vnombres = COALESCE($3, vnombres),
        vapellidos = COALESCE($4, vapellidos),
        iidcargo = COALESCE($5, iidcargo),
        iidespecialidad = COALESCE($6, iidespecialidad),
        vtelefono = COALESCE($7, vtelefono),
        vcelular = COALESCE($8, vcelular),
        vemail = COALESCE($9, vemail),
        dfechanacimiento = COALESCE($10, dfechanacimiento),
        dfechacontratacion = COALESCE($11, dfechacontratacion),
        btemporal = COALESCE($12, btemporal),
        cestado = COALESCE($13, cestado)
      WHERE iiddoctor = $1
      RETURNING *;
    `;
    const values = [
      iiddoctor,
      doctor.vcedula,
      doctor.vnombres,
      doctor.vapellidos,
      doctor.iidcargo,
      doctor.iidespecialidad,
      doctor.vtelefono,
      doctor.vcelular,
      doctor.vemail,
      doctor.dfechanacimiento,
      doctor.dfechacontratacion,
      doctor.btemporal,
      doctor.cestado
    ];
    const { rows } = await client.query(query, values);
    
    if (rows.length === 0) throw new Error('Doctor no encontrado');
    
    return rows[0];
  });
};

const deleteDoctor = async (iiddoctor, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `DELETE FROM public.odontbldoctores WHERE iiddoctor = $1 RETURNING *;`;
    const { rows } = await client.query(query, [iiddoctor]);
    
    if (rows.length === 0) throw new Error('Doctor no encontrado');
    
    return rows[0];
  });
};

module.exports = {
  getAllDoctores,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
};