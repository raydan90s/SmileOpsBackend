const pool = require('@config/dbSupabase');

const getAllPaises = async () => {
  const query = `
    SELECT *
    FROM "tblpaises"
    ORDER BY "iidpais" ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

const getPaisById = async (id) => {
  const query = `
    SELECT *
    FROM "tblpaises"
    WHERE "iidpais" = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

const createPais = async ({ vcodigo, vnombre, bactivo = true }) => {
  const query = `
    INSERT INTO "tblpaises" ("vcodigo", "vnombre", "bactivo")
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [vcodigo, vnombre, bactivo]);
  return rows[0];
};

const updatePais = async (id, { vcodigo, vnombre, bactivo }) => {
  const query = `
    UPDATE "tblpaises"
    SET "vcodigo" = $1, "vnombre" = $2, "bactivo" = $3
    WHERE "iidpais" = $4
    RETURNING *
  `;
  const { rows } = await pool.query(query, [vcodigo, vnombre, bactivo, id]);
  return rows[0] || null;
};

const deletePais = async (id) => {
  const query = `
    DELETE FROM "tblpaises"
    WHERE "iidpais" = $1
    RETURNING *
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

module.exports = {
  getAllPaises,
  getPaisById,
  createPais,
  updatePais,
  deletePais
};
