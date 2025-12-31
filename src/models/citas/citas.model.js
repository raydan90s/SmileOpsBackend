const pool = require('@config/dbSupabase');
const { executeWithAudit } = require('@middlewares/auditoria.middleware');

const getAllCitas = async () => {
  const query = `
    SELECT 
      c.iidcita,
      c.iidpaciente,
      c.iiddoctor,
      c.iidconsultorio,
      c.iidespecialidad,
      c.dfechacita,
      c.choracita,
      c.itiempo,
      c.cestado,
      TRIM(CONCAT(p.vnombres, ' ', p.vprimerapellido, ' ', COALESCE(p.vsegundoapellido, ''))) AS paciente_nombre,
      p.vcedula AS paciente_cedula,
      TRIM(CONCAT(d.vnombres, ' ', d.vapellidos)) AS doctor_nombre,
      consultorio.vnombre AS consultorio_nombre,
      esp.vnombre AS especialidad_nombre
    FROM public.odontblcitamedica c
    LEFT JOIN public.odontblpacientes p ON c.iidpaciente = p.iidpaciente
    LEFT JOIN public.odontbldoctores d ON c.iiddoctor = d.iiddoctor
    LEFT JOIN public.tblconsultorios consultorio ON c.iidconsultorio = consultorio.iidconsultorio
    LEFT JOIN public.tblespecialidades esp ON c.iidespecialidad = esp.iidespecialidad
    ORDER BY c.dfechacita DESC, c.choracita ASC;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getCitaById = async (iidcita) => {
  const query = `
    SELECT 
      c.*,
      TRIM(CONCAT(p.vnombres, ' ', p.vprimerapellido, ' ', COALESCE(p.vsegundoapellido, ''))) AS paciente_nombre,
      p.vcedula AS paciente_cedula,
      TRIM(CONCAT(d.vnombres, ' ', d.vapellidos)) AS doctor_nombre
    FROM public.odontblcitamedica c
    LEFT JOIN public.odontblpacientes p ON c.iidpaciente = p.iidpaciente
    LEFT JOIN public.odontbldoctores d ON c.iiddoctor = d.iiddoctor
    WHERE c.iidcita = $1;
  `;
  const { rows } = await pool.query(query, [iidcita]);
  return rows[0] || null;
};

const createCita = async (cita, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      INSERT INTO public.odontblcitamedica (
        iidpaciente, iiddoctor, iidconsultorio, iidespecialidad, 
        dfechacita, choracita, itiempo, cestado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      cita.iidpaciente,
      cita.iiddoctor,
      cita.iidconsultorio,
      cita.iidespecialidad,
      cita.dfechacita,
      cita.choracita,
      cita.itiempo,
      cita.cestado || 'P'
    ];
    const { rows } = await client.query(query, values);
    return rows[0];
  });
};

const updateEstadoCita = async (iidcita, cestado, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const checkQuery = 'SELECT iidcita FROM public.odontblcitamedica WHERE iidcita = $1';
    const checkRes = await client.query(checkQuery, [iidcita]);
    
    if (checkRes.rowCount === 0) throw new Error('Cita no encontrada');

    const query = `
      UPDATE public.odontblcitamedica
      SET cestado = $2
      WHERE iidcita = $1
      RETURNING *;
    `;
    const { rows } = await client.query(query, [iidcita, cestado]);
    return rows[0];
  });
};

const deleteCita = async (iidcita, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      DELETE FROM public.odontblcitamedica
      WHERE iidcita = $1
      RETURNING *;
    `;
    const { rows } = await client.query(query, [iidcita]);
    
    if (rows.length === 0) throw new Error('Cita no encontrada');

    return rows[0];
  });
};

module.exports = {
  getAllCitas,
  getCitaById,
  createCita,
  updateEstadoCita,
  deleteCita
};