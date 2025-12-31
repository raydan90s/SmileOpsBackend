const pool = require('@config/dbSupabase');
const { executeWithAudit } = require('@middlewares/auditoria.middleware');

// ✅ Obtener todas las categorías activas
const getAllCategoriasActivos = async () => {
  const query = `
    SELECT * FROM tbl_categorias_activos
    WHERE bactivo = true
    ORDER BY vnombre_categoria ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// ✅ Obtener todas las categorías (incluyendo inactivas)
const getAllCategoriasActivosCompleto = async () => {
  const query = `
    SELECT * FROM tbl_categorias_activos
    ORDER BY vnombre_categoria ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// ✅ Obtener categoría por ID
const getCategoriaActivoById = async (iid_categoria) => {
  const query = `
    SELECT * FROM tbl_categorias_activos
    WHERE iid_categoria = $1
  `;
  const { rows } = await pool.query(query, [iid_categoria]);
  return rows[0] || null;
};

// ✅ Crear nueva categoría
const createCategoriaActivo = async (categoriaData, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      INSERT INTO tbl_categorias_activos (vnombre_categoria, bactivo)
      VALUES ($1, $2)
      RETURNING *;
    `;

    const values = [
      categoriaData.vnombre_categoria,
      categoriaData.bactivo !== undefined ? categoriaData.bactivo : true
    ];

    const { rows } = await client.query(query, values);
    return rows[0];
  });
};

// ✅ Actualizar categoría
const updateCategoriaActivo = async (iid_categoria, categoriaData, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      UPDATE tbl_categorias_activos
      SET 
        vnombre_categoria = $2,
        bactivo = $3
      WHERE iid_categoria = $1
      RETURNING *;
    `;

    const values = [
      iid_categoria,
      categoriaData.vnombre_categoria,
      categoriaData.bactivo
    ];

    const { rows } = await client.query(query, values);
    return rows[0];
  });
};

// ✅ Eliminar categoría (borrado lógico)
const deleteCategoriaActivo = async (iid_categoria, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      UPDATE tbl_categorias_activos
      SET bactivo = false
      WHERE iid_categoria = $1
      RETURNING *;
    `;

    const { rows } = await client.query(query, [iid_categoria]);
    return rows[0];
  });
};

module.exports = {
  getAllCategoriasActivos,
  getAllCategoriasActivosCompleto,
  getCategoriaActivoById,
  createCategoriaActivo,
  updateCategoriaActivo,
  deleteCategoriaActivo
};