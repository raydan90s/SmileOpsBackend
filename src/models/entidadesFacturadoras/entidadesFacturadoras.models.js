const pool = require('@config/dbSupabase');

const getAllEntidadesFacturadoras = async (filters = {}) => {
    try {
        let query = `
      SELECT 
        iid_entidad_facturadora,
        v_ruc,
        v_razon_social,
        v_nombre_comercial,
        v_direccion,
        v_telefono,
        v_email,
        b_activo,
        d_fecha_registro
      FROM tbl_entidades_facturadoras
    `;

        const conditions = [];
        const values = [];

        if (filters.activo !== undefined) {
            conditions.push(`b_activo = $${values.length + 1}`);
            values.push(filters.activo);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY v_razon_social ASC';

        const { rows } = await pool.query(query, values);
        return rows;
    } catch (error) {
        console.error('Error en getAllEntidadesFacturadoras:', error);
        throw error;
    }
};

const getEntidadFacturadoraById = async (iid_entidad_facturadora) => {
    try {
        const query = `
      SELECT 
        iid_entidad_facturadora,
        v_ruc,
        v_razon_social,
        v_nombre_comercial,
        v_direccion,
        v_telefono,
        v_email,
        b_activo,
        d_fecha_registro
      FROM tbl_entidades_facturadoras
      WHERE iid_entidad_facturadora = $1
    `;

        const { rows } = await pool.query(query, [iid_entidad_facturadora]);
        return rows[0] || null;
    } catch (error) {
        console.error('Error en getEntidadFacturadoraById:', error);
        throw error;
    }
};

const getEntidadFacturadoraByRuc = async (v_ruc) => {
    try {
        const query = `
      SELECT 
        iid_entidad_facturadora,
        v_ruc,
        v_razon_social,
        v_nombre_comercial,
        v_direccion,
        v_telefono,
        v_email,
        b_activo,
        d_fecha_registro
      FROM tbl_entidades_facturadoras
      WHERE v_ruc = $1
    `;

        const { rows } = await pool.query(query, [v_ruc]);
        return rows[0] || null;
    } catch (error) {
        console.error('Error en getEntidadFacturadoraByRuc:', error);
        throw error;
    }
};

const createEntidadFacturadora = async (data) => {
    try {
        const query = `
      INSERT INTO tbl_entidades_facturadoras (
        v_ruc,
        v_razon_social,
        v_nombre_comercial,
        v_direccion,
        v_telefono,
        v_email,
        b_activo
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

        const values = [
            data.v_ruc,
            data.v_razon_social,
            data.v_nombre_comercial,
            data.v_direccion,
            data.v_telefono,
            data.v_email,
            data.b_activo !== undefined ? data.b_activo : true
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    } catch (error) {
        console.error('Error en createEntidadFacturadora:', error);
        throw error;
    }
};

const updateEntidadFacturadora = async (iid_entidad_facturadora, data) => {
    try {
        const fields = [];
        const values = [];
        let paramCount = 1;

        if (data.v_ruc !== undefined) {
            fields.push(`v_ruc = $${paramCount}`);
            values.push(data.v_ruc);
            paramCount++;
        }

        if (data.v_razon_social !== undefined) {
            fields.push(`v_razon_social = $${paramCount}`);
            values.push(data.v_razon_social);
            paramCount++;
        }

        if (data.v_nombre_comercial !== undefined) {
            fields.push(`v_nombre_comercial = $${paramCount}`);
            values.push(data.v_nombre_comercial);
            paramCount++;
        }

        if (data.v_direccion !== undefined) {
            fields.push(`v_direccion = $${paramCount}`);
            values.push(data.v_direccion);
            paramCount++;
        }

        if (data.v_telefono !== undefined) {
            fields.push(`v_telefono = $${paramCount}`);
            values.push(data.v_telefono);
            paramCount++;
        }

        if (data.v_email !== undefined) {
            fields.push(`v_email = $${paramCount}`);
            values.push(data.v_email);
            paramCount++;
        }

        if (data.b_activo !== undefined) {
            fields.push(`b_activo = $${paramCount}`);
            values.push(data.b_activo);
            paramCount++;
        }

        if (fields.length === 0) {
            throw new Error('No hay campos para actualizar');
        }

        values.push(iid_entidad_facturadora);

        const query = `
      UPDATE tbl_entidades_facturadoras
      SET ${fields.join(', ')}
      WHERE iid_entidad_facturadora = $${paramCount}
      RETURNING *
    `;

        const { rows } = await pool.query(query, values);
        return rows[0] || null;
    } catch (error) {
        console.error('Error en updateEntidadFacturadora:', error);
        throw error;
    }
};

module.exports = {
    getAllEntidadesFacturadoras,
    getEntidadFacturadoraById,
    getEntidadFacturadoraByRuc,
    createEntidadFacturadora,
    updateEntidadFacturadora
};