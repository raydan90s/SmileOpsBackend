const pool = require('@config/dbSupabase');

const getAllProductosNombre = async () => {
  const query = `
    SELECT 
      iid_nombre,
      vnombre_producto,
      bactivo
    FROM public.tbl_productos
    ORDER BY vnombre_producto ASC
  `;

  const { rows } = await pool.query(query);
  return rows;
};

const getProductoNombreById = async (iid_nombre) => {
  const query = `
    SELECT 
      iid_nombre,
      vnombre_producto,
      bactivo
    FROM public.tbl_productos
    WHERE iid_nombre = $1
  `;
  const { rows } = await pool.query(query, [iid_nombre]);
  return rows[0] || null;
};

const createProductoNombre = async (productoNombre) => {
  const query = `
    INSERT INTO public.tbl_productos (
      vnombre_producto, bactivo
    )
    VALUES ($1, $2)
    RETURNING *;
  `;

  const values = [
    productoNombre.vnombre_producto,
    productoNombre.bactivo !== undefined ? productoNombre.bactivo : true
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

const updateProductoNombre = async (iid_nombre, productoNombre) => {
  const query = `
    UPDATE public.tbl_productos
    SET 
      vnombre_producto = COALESCE($2, vnombre_producto),
      bactivo = COALESCE($3, bactivo)
    WHERE iid_nombre = $1
    RETURNING *;
  `;
  const values = [
    iid_nombre,
    productoNombre.vnombre_producto,
    productoNombre.bactivo
  ];

  const { rows } = await pool.query(query, values);

  if (rows.length === 0) throw new Error('Producto no encontrado');

  return rows[0];
};

const deleteProductoNombre = async (iid_nombre) => {
  const query = `
    UPDATE public.tbl_productos
    SET bactivo = false
    WHERE iid_nombre = $1
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [iid_nombre]);

  if (rows.length === 0) throw new Error('Producto no encontrado');

  return rows[0];
};

const activateProductoNombre = async (iid_nombre) => {
  const query = `
    UPDATE public.tbl_productos
    SET bactivo = true
    WHERE iid_nombre = $1
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [iid_nombre]);

  if (rows.length === 0) throw new Error('Producto no encontrado');

  return rows[0];
};

module.exports = {
  getAllProductosNombre,
  getProductoNombreById,
  createProductoNombre,
  updateProductoNombre,
  deleteProductoNombre,
  activateProductoNombre
};