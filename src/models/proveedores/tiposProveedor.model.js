const pool = require('@config/dbSupabase');
const { executeWithAudit } = require('@middlewares/auditoria.middleware');

const getAllTiposProveedor = async () => {
    const query = `
        SELECT 
            iid_tipo_proveedor,
            vnombre,
            bactivo
        FROM public.tbl_tipos_proveedor
        WHERE bactivo = true
        ORDER BY vnombre ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
};

const getTipoProveedorById = async (iid_tipo_proveedor) => {
    const query = `
        SELECT 
            iid_tipo_proveedor,
            vnombre,
            bactivo
        FROM public.tbl_tipos_proveedor
        WHERE iid_tipo_proveedor = $1
    `;
    const { rows } = await pool.query(query, [iid_tipo_proveedor]);
    return rows[0] || null;
};

const createTipoProveedor = async (tipoProveedorData, req) => {
    return executeWithAudit(pool, req, async (client) => {
        const query = `
            INSERT INTO public.tbl_tipos_proveedor (vnombre, bactivo)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const values = [
            tipoProveedorData.vnombre,
            tipoProveedorData.bactivo !== undefined ? tipoProveedorData.bactivo : true
        ];
        const { rows } = await client.query(query, values);
        return rows[0];
    });
};

const updateTipoProveedor = async (iid_tipo_proveedor, tipoProveedorData, req) => {
    return executeWithAudit(pool, req, async (client) => {
        const query = `
            UPDATE public.tbl_tipos_proveedor
            SET 
                vnombre = COALESCE($2, vnombre),
                bactivo = COALESCE($3, bactivo)
            WHERE iid_tipo_proveedor = $1
            RETURNING *;
        `;
        const values = [
            iid_tipo_proveedor,
            tipoProveedorData.vnombre,
            tipoProveedorData.bactivo
        ];
        const { rows } = await client.query(query, values);

        if (rows.length === 0) throw new Error('Tipo de proveedor no encontrado');

        return rows[0];
    });
};

const deleteTipoProveedor = async (iid_tipo_proveedor, req) => {
    return executeWithAudit(pool, req, async (client) => {
        const query = `
            UPDATE public.tbl_tipos_proveedor
            SET bactivo = false
            WHERE iid_tipo_proveedor = $1
            RETURNING *;
        `;
        const { rows } = await client.query(query, [iid_tipo_proveedor]);

        if (rows.length === 0) throw new Error('Tipo de proveedor no encontrado');

        return rows[0];
    });
};

module.exports = {
    getAllTiposProveedor,
    getTipoProveedorById,
    createTipoProveedor,
    updateTipoProveedor,
    deleteTipoProveedor
};