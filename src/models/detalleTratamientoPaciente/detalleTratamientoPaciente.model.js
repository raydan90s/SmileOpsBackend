const pool = require('@config/dbSupabase');

const getAllDetallesCompleto = async () => {
  const query = `
    SELECT 
      TO_CHAR(dp.dfecha, 'DD/MM/YYYY') AS fecha,
      COALESCE(dp.vdatopieza, 'N/D') AS color,
      COALESCE(dp.vpieza, 'N/D') AS pieza,
      TRIM(CONCAT(d.vnombres, ' ', d.vapellidos)) AS doctor,
      CONCAT(td.vcodigo, ' - ', td.vdescripcion) AS tratamiento,
      COALESCE(dp.vobservacion, 'N/D') AS realizado,
      COALESCE(dp.vobservacion1, 'N/D') AS por_realizar,
      p.iidpaciente AS ficha,
      TRIM(CONCAT(p.vnombres, ' ', p.vprimerapellido, ' ', COALESCE(p.vsegundoapellido, ' '), ' ', COALESCE(p.votrosapellidos, ''))) AS nombre,
      COALESCE(p.vcedula, 'N/D') AS vcedula
    FROM public.odontbldetalletratamientopaciente dp
    JOIN public.odontblpacientes p ON p.iidpaciente = dp.iidpaciente
    JOIN public.odontbltratamientodetalle td ON td.iidtratamientodetalle = dp.iidtratamientodetalle
    JOIN public.odontbldoctores d ON d.iiddoctor = dp.iiddoctor
    ORDER BY dp.iiddetalle ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getDetallesPorPaciente = async (idPaciente) => {
  const query = `
    SELECT 
      TO_CHAR(dp.dfecha, 'DD/MM/YYYY') AS fecha,
      COALESCE(dp.vdatopieza, 'N/D') AS color,
      COALESCE(dp.vpieza, 'N/D') AS pieza, 
      TRIM(CONCAT(d.vnombres, ' ', d.vapellidos)) AS doctor,
      CONCAT(td.vcodigo, ' - ', td.vdescripcion) AS tratamiento,
      COALESCE(dp.vobservacion, 'N/D') AS realizado,
      COALESCE(dp.vobservacion1, 'N/D') AS por_realizar
    FROM public.odontbldetalletratamientopaciente dp
    JOIN public.odontbltratamientodetalle td ON td.iidtratamientodetalle = dp.iidtratamientodetalle
    JOIN public.odontbldoctores d ON d.iiddoctor = dp.iiddoctor
    WHERE dp.iidpaciente = $1
    ORDER BY dp.iiddetalle ASC
  `;
  const { rows } = await pool.query(query, [idPaciente]);
  return rows;
};

module.exports = {
  getAllDetallesCompleto,
  getDetallesPorPaciente
};