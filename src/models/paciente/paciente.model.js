const pool = require('@config/dbSupabase');

const getAllPacientes = async () => {
  const query = `
    SELECT *
    FROM "odontblpacientes"
    ORDER BY "iidpaciente" ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getPacienteById = async (id) => {
  const query = `
    SELECT 
      "iidpaciente",
      "vnombres",
      "vprimerapellido",
      "vsegundoapellido",
      "votrosapellidos",
      "vcedula",
      "vrutafoto"
    FROM "odontblpacientes"
    WHERE "iidpaciente" = $1
  `;
  const { rows } = await pool.query(query, [id]);
  if (!rows[0]) return null;

  const p = rows[0];
  const nombreCompleto = [p.vprimerapellido, p.vsegundoapellido, p.votrosapellidos, p.vnombres]
    .filter(Boolean)
    .join(' ');

  return {
    iidpaciente: p.iidpaciente,
    vcedula: p.vcedula,
    nombreCompleto,
    vrutafoto: p.vrutafoto
  };
};

const getPacienteByCedula = async (cedula) => {
  const query = `
    SELECT 
      "iidpaciente",
      "vnombres",
      "vprimerapellido",
      "vsegundoapellido",
      "votrosapellidos",
      "vcedula"
    FROM "odontblpacientes"
    WHERE "vcedula" = $1
  `;
  const { rows } = await pool.query(query, [cedula]);
  if (!rows[0]) return null;

  const p = rows[0];
  const nombreCompleto = [p.vprimerapellido, p.vsegundoapellido, p.votrosapellidos, p.vnombres]
    .filter(Boolean)
    .join(' ');

  return {
    iidpaciente: p.iidpaciente,
    vcedula: p.vcedula,
    nombreCompleto
  };
};

const getNextIidPaciente = async () => {
  const query = `SELECT MAX("iidpaciente"::bigint) AS "maxId" FROM public."odontblpacientes"`;
  const { rows } = await pool.query(query);
  const maxId = Number(rows[0].maxId) || 0;
  const nextId = maxId + 1;
  return nextId;
};

const getPacienteByNombre = async (termino) => {
  const palabras = termino.trim().split(/\s+/).filter(Boolean);

  if (palabras.length === 0) return null;

  const condiciones = palabras.map((_, index) => {
    return `(
      "vnombres" ILIKE $${index + 1} OR
      "vprimerapellido" ILIKE $${index + 1} OR
      "vsegundoapellido" ILIKE $${index + 1} OR
      "votrosapellidos" ILIKE $${index + 1}
    )`;
  }).join(' AND ');

  const query = `
    SELECT 
      "iidpaciente",
      "vnombres",
      "vprimerapellido",
      "vsegundoapellido",
      "votrosapellidos",
      "vcedula"
    FROM "odontblpacientes"
    WHERE ${condiciones}
    ORDER BY "iidpaciente" ASC
  `;

  const parametros = palabras.map(palabra => `%${palabra}%`);

  const { rows } = await pool.query(query, parametros);

  if (rows.length === 0) return null;

  return rows.map(p => ({
    iidpaciente: p.iidpaciente,
    vcedula: p.vcedula,
    nombreCompleto: [p.vprimerapellido, p.vsegundoapellido, p.votrosapellidos, p.vnombres]
      .filter(Boolean)
      .join(' ')
  }));
};

const createPaciente = async (pacienteData) => {
  const query = `
    INSERT INTO public."odontblpacientes" (
      "vcedula",
      "vprimerapellido",
      "vsegundoapellido",
      "votrosapellidos",
      "vnombres",
      "dfechanacimiento",
      "csexo",
      "iedad",
      "vdireccion",
      "iidciudad",
      "iidpais",
      "vtelefonocasa",
      "vtelefonotrabajo",
      "vcelular",
      "vfax",
      "vemail",
      "vestadocivil",
      "vocupacion",
      "vlugartrabajo",
      "vdirecciontrabajo",
      "iidciudadtrabajo",
      "iidnacionalidad",
      "vrecomendadopor",
      "vrutafoto",
      "cestado"
    )
    VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15,
      $16, $17, $18, $19, $20,
      $21, $22, $23, $24, $25
    )
    RETURNING *;
  `;

  const values = [
    pacienteData.vcedula,
    pacienteData.vprimerapellido,
    pacienteData.vsegundoapellido,
    pacienteData.votrosapellidos,
    pacienteData.vnombres,
    pacienteData.dfechanacimiento,
    pacienteData.csexo,
    pacienteData.iedad,
    pacienteData.vdireccion,
    pacienteData.iidciudad,
    pacienteData.iidpais,
    pacienteData.vtelefonocasa,
    pacienteData.vtelefonotrabajo,
    pacienteData.vcelular,
    pacienteData.vfax,
    pacienteData.vemail,
    pacienteData.vestadocivil,
    pacienteData.vocupacion,
    pacienteData.vlugartrabajo,
    pacienteData.vdirecciontrabajo,
    pacienteData.iidciudadtrabajo,
    pacienteData.iidnacionalidad,
    pacienteData.vrecomendadopor,
    pacienteData.vrutafoto,
    pacienteData.cestado !== undefined ? pacienteData.cestado : true
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

const updatePaciente = async (id, pacienteData) => {
  const query = `
    UPDATE public."odontblpacientes"
    SET
      "vcedula" = $1,
      "vprimerapellido" = $2,
      "vsegundoapellido" = $3,
      "votrosapellidos" = $4,
      "vnombres" = $5,
      "dfechanacimiento" = $6,
      "csexo" = $7,
      "iedad" = $8,
      "vdireccion" = $9,
      "iidciudad" = $10,
      "iidpais" = $11,
      "vtelefonocasa" = $12,
      "vtelefonotrabajo" = $13,
      "vcelular" = $14,
      "vfax" = $15,
      "vemail" = $16,
      "vestadocivil" = $17,
      "vocupacion" = $18,
      "vlugartrabajo" = $19,
      "vdirecciontrabajo" = $20,
      "iidciudadtrabajo" = $21,
      "iidnacionalidad" = $22,
      "vrecomendadopor" = $23,
      "vrutafoto" = $24,
      "cestado" = $25
    WHERE "iidpaciente" = $26
    RETURNING *;
  `;

  const values = [
    pacienteData.vcedula,
    pacienteData.vprimerapellido,
    pacienteData.vsegundoapellido,
    pacienteData.votrosapellidos,
    pacienteData.vnombres,
    pacienteData.dfechanacimiento,
    pacienteData.csexo,
    pacienteData.iedad,
    pacienteData.vdireccion,
    pacienteData.iidciudad,
    pacienteData.iidpais,
    pacienteData.vtelefonocasa,
    pacienteData.vtelefonotrabajo,
    pacienteData.vcelular,
    pacienteData.vfax,
    pacienteData.vemail,
    pacienteData.vestadocivil,
    pacienteData.vocupacion,
    pacienteData.vlugartrabajo,
    pacienteData.vdirecciontrabajo,
    pacienteData.iidciudadtrabajo,
    pacienteData.iidnacionalidad,
    pacienteData.vrecomendadopor,
    pacienteData.vrutafoto,
    pacienteData.cestado !== undefined ? pacienteData.cestado : true,
    id
  ];

  const { rows } = await pool.query(query, values);

  if (rows.length === 0) {
    throw new Error('Paciente no encontrado');
  }

  return rows[0];
};

const getPacienteCompletoById = async (id) => {
  const query = `
    SELECT *
    FROM "odontblpacientes"
    WHERE "iidpaciente" = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

const deactivatePaciente = async (id) => {
  const query = `
    UPDATE public."odontblpacientes"
    SET "cestado" = false
    WHERE "iidpaciente" = $1
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [id]);

  if (rows.length === 0) {
    throw new Error('Paciente no encontrado');
  }

  return rows[0];
};

const activatePaciente = async (id) => {
  const query = `
    UPDATE public."odontblpacientes"
    SET "cestado" = true
    WHERE "iidpaciente" = $1
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [id]);

  if (rows.length === 0) {
    throw new Error('Paciente no encontrado');
  }

  return rows[0];
};

module.exports = {
  getPacienteById,
  getPacienteByCedula,
  getAllPacientes,
  getNextIidPaciente,
  getPacienteByNombre,
  createPaciente,
  updatePaciente,
  getPacienteCompletoById,
  deactivatePaciente,
  activatePaciente
};