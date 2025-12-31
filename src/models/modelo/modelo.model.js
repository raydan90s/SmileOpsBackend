const pool = require('@config/dbSupabase');
const { executeWithAudit } = require('@middlewares/auditoria.middleware');

// ✅ Obtener todos los modelos activos
const getAllModelos = async () => {
  const query = `
    SELECT * FROM tbl_modelos
    WHERE bactivo = true
    ORDER BY vnombre_modelo ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// ✅ Obtener todos los modelos (incluyendo inactivos)
const getAllModelosCompleto = async () => {
  const query = `
    SELECT * FROM tbl_modelos
    ORDER BY vnombre_modelo ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// ✅ Obtener modelo por ID
const getModeloById = async (iid_modelo) => {
  const query = `
    SELECT * FROM tbl_modelos
    WHERE iid_modelo = $1
  `;
  const { rows } = await pool.query(query, [iid_modelo]);
  return rows[0] || null;
};

// ✅ Crear nuevo modelo
const createModelo = async (modeloData, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      INSERT INTO tbl_modelos (vnombre_modelo, bactivo)
      VALUES ($1, $2)
      RETURNING *;
    `;

    const values = [
      modeloData.vnombre_modelo,
      modeloData.bactivo !== undefined ? modeloData.bactivo : true
    ];

    const { rows } = await client.query(query, values);
    return rows[0];
  });
};

// ✅ Actualizar modelo
const updateModelo = async (iid_modelo, modeloData, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      UPDATE tbl_modelos
      SET 
        vnombre_modelo = $2,
        bactivo = $3
      WHERE iid_modelo = $1
      RETURNING *;
    `;

    const values = [
      iid_modelo,
      modeloData.vnombre_modelo,
      modeloData.bactivo
    ];

    const { rows } = await client.query(query, values);
    return rows[0];
  });
};

// ✅ Eliminar modelo (borrado lógico)
const deleteModelo = async (iid_modelo, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      UPDATE tbl_modelos
      SET bactivo = false
      WHERE iid_modelo = $1
      RETURNING *;
    `;

    const { rows } = await client.query(query, [iid_modelo]);
    return rows[0];
  });
};

module.exports = {
  getAllModelos,
  getAllModelosCompleto,
  getModeloById,
  createModelo,
  updateModelo,
  deleteModelo
};