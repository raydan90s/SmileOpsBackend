const pool = require('@config/dbSupabase');
const { executeWithAudit } = require('@middlewares/auditoria.middleware');

// ✅ Obtener todos los tipos activos
const getAllTiposInstrumental = async () => {
  const query = `
    SELECT * FROM tbl_tipos_instrumental
    WHERE bactivo = true
    ORDER BY vnombre_tipo ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// ✅ Obtener todos los tipos (incluyendo inactivos)
const getAllTiposInstrumentalCompleto = async () => {
  const query = `
    SELECT * FROM tbl_tipos_instrumental
    ORDER BY vnombre_tipo ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// ✅ Obtener tipo por ID
const getTipoInstrumentalById = async (iid_tipo_instrumental) => {
  const query = `
    SELECT * FROM tbl_tipos_instrumental
    WHERE iid_tipo_instrumental = $1
  `;
  const { rows } = await pool.query(query, [iid_tipo_instrumental]);
  return rows[0] || null;
};

// ✅ Crear nuevo tipo
const createTipoInstrumental = async (tipoData, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      INSERT INTO tbl_tipos_instrumental (vnombre_tipo, bactivo)
      VALUES ($1, $2)
      RETURNING *;
    `;

    const values = [
      tipoData.vnombre_tipo,
      tipoData.bactivo !== undefined ? tipoData.bactivo : true
    ];

    const { rows } = await client.query(query, values);
    return rows[0];
  });
};

// ✅ Actualizar tipo
const updateTipoInstrumental = async (iid_tipo_instrumental, tipoData, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      UPDATE tbl_tipos_instrumental
      SET 
        vnombre_tipo = $2,
        bactivo = $3
      WHERE iid_tipo_instrumental = $1
      RETURNING *;
    `;

    const values = [
      iid_tipo_instrumental,
      tipoData.vnombre_tipo,
      tipoData.bactivo
    ];

    const { rows } = await client.query(query, values);
    return rows[0];
  });
};

// ✅ Eliminar tipo (borrado lógico)
const deleteTipoInstrumental = async (iid_tipo_instrumental, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      UPDATE tbl_tipos_instrumental
      SET bactivo = false
      WHERE iid_tipo_instrumental = $1
      RETURNING *;
    `;

    const { rows } = await client.query(query, [iid_tipo_instrumental]);
    return rows[0];
  });
};

module.exports = {
  getAllTiposInstrumental,
  getAllTiposInstrumentalCompleto,
  getTipoInstrumentalById,
  createTipoInstrumental,
  updateTipoInstrumental,
  deleteTipoInstrumental
};