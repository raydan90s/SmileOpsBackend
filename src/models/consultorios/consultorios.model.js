const pool = require('@config/dbSupabase');
const { executeWithAudit } = require('@middlewares/auditoria.middleware');

const getAllConsultorios = async () => {
  const query = `
    SELECT iidconsultorio, vnombre, vubicacion, icapacidadpacientes, bactivo
    FROM public.tblconsultorios
    WHERE bactivo = true
    ORDER BY vnombre ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getConsultorioById = async (iidconsultorio) => {
  const query = `
    SELECT iidconsultorio, vnombre, vubicacion, icapacidadpacientes, bactivo
    FROM public.tblconsultorios
    WHERE iidconsultorio = $1
  `;
  const { rows } = await pool.query(query, [iidconsultorio]);
  return rows[0] || null;
};

const createConsultorio = async (consultorio, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      INSERT INTO public.tblconsultorios (vnombre, vubicacion, icapacidadpacientes, bactivo)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [
      consultorio.vnombre,
      consultorio.vubicacion,
      consultorio.icapacidadpacientes,
      consultorio.bactivo !== undefined ? consultorio.bactivo : true
    ];
    const { rows } = await client.query(query, values);
    return rows[0];
  });
};

const updateConsultorio = async (iidconsultorio, consultorio, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      UPDATE public.tblconsultorios
      SET
        vnombre = COALESCE($2, vnombre),
        vubicacion = COALESCE($3, vubicacion),
        icapacidadpacientes = COALESCE($4, icapacidadpacientes),
        bactivo = COALESCE($5, bactivo)
      WHERE iidconsultorio = $1
      RETURNING *;
    `;
    const values = [
      iidconsultorio,
      consultorio.vnombre,
      consultorio.vubicacion,
      consultorio.icapacidadpacientes,
      consultorio.bactivo
    ];
    const { rows } = await client.query(query, values);

    if (rows.length === 0) throw new Error('Consultorio no encontrado');

    return rows[0];
  });
};

const deleteConsultorio = async (iidconsultorio, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      DELETE FROM public.tblconsultorios
      WHERE iidconsultorio = $1
      RETURNING *;
    `;
    const { rows } = await client.query(query, [iidconsultorio]);

    if (rows.length === 0) throw new Error('Consultorio no encontrado');

    return rows[0];
  });
};

module.exports = {
  getAllConsultorios,
  getConsultorioById,
  createConsultorio,
  updateConsultorio,
  deleteConsultorio
};