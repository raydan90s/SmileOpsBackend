const pool = require('@config/dbSupabase');

const getAllRequisiciones = async (filters = {}) => {
  let query = `
    SELECT 
      r.*,
      to_json(er.*) as estado,
      bs.vnombre_bodega as bodega_solicita_nombre,
      bo.vnombre_bodega as bodega_origen_nombre,
      us.vnombres as usuario_solicita_nombre,
      ua.vnombres as usuario_aprueba_nombre,
      ue.vnombres as usuario_entrega_nombre,
      
      (
        SELECT v_observaciones 
        FROM tbl_requisiciones_historial 
        WHERE iid_requisicion = r.iid_requisicion 
        ORDER BY d_fecha_cambio DESC 
        LIMIT 1
      ) as v_observaciones,
      
      (
        SELECT json_agg(
          json_build_object(
            'iid_requisicion_det', rd.iid_requisicion_det,
            'iid_inventario', rd.iid_inventario,
            'codigo_producto', ip.codigo_producto,
            'cantidad_solicitada', rd.cantidad_solicitada,
            'cantidad_aprobada', rd.cantidad_aprobada,
            'producto', json_build_object(
              'iid_nombre', prod.iid_nombre,
              'vnombre_producto', prod.vnombre_producto,
              'codigo_producto', ip.codigo_producto,
              'iid_inventario', ip.iid_inventario,
              'nombre_completo', CONCAT(
                prod.vnombre_producto,
                CASE WHEN c.vnombre_caracteristica IS NOT NULL 
                  THEN ' - ' || c.vnombre_caracteristica 
                  ELSE '' 
                END,
                CASE WHEN m.vnombre_marca IS NOT NULL 
                  THEN ' - ' || m.vnombre_marca 
                  ELSE '' 
                END
              ),
              'caracteristica', c.vnombre_caracteristica,
              'marca', m.vnombre_marca,
              'unidad_medida', json_build_object(
                'iidunidad', um.iidunidad,
                'vnombreunidad', um.vnombreunidad,
                'vabreviatura', um.vabreviatura
              )
            )
          )
        )
        FROM tbl_requisiciones_det rd
        INNER JOIN tbl_inventario_productos ip ON rd.iid_inventario = ip.iid_inventario
        INNER JOIN tbl_productos prod ON ip.iid_nombre = prod.iid_nombre
        LEFT JOIN tbl_caracteristicas c ON ip.iid_caracteristica = c.iid_caracteristica
        LEFT JOIN tbl_marcas m ON ip.iid_marca = m.iid_marca
        LEFT JOIN unidades_medida um ON ip.unidad_consumo = um.iidunidad
        WHERE rd.iid_requisicion = r.iid_requisicion
      ) as detalles,
      
      (
        SELECT json_agg(
          json_build_object(
            'iid_historial', h.iid_historial,
            'iid_usuario', h.iid_usuario,
            'usuario_nombre', u.vnombres || ' ' || u.vapellidos,
            'd_fecha_cambio', h.d_fecha_cambio,
            'v_observaciones', h.v_observaciones,
            'v_accion', h.v_accion,
            'iid_estado_requisicion', h.iid_estado_requisicion,
            'estado_descripcion', e.v_descripcion
          ) ORDER BY h.d_fecha_cambio ASC
        )
        FROM tbl_requisiciones_historial h
        LEFT JOIN segtblusuarios u ON h.iid_usuario = u.iid
        LEFT JOIN tbl_estados_requisicion e ON h.iid_estado_requisicion = e.iid_estado_requisicion
        WHERE h.iid_requisicion = r.iid_requisicion
      ) as historial
      
    FROM tbl_requisiciones_cab r
    LEFT JOIN tbl_estados_requisicion er ON r.iid_estado_requisicion = er.iid_estado_requisicion
    LEFT JOIN tbl_bodegas bs ON r.iid_bodega_solicita = bs.iid_bodega
    LEFT JOIN tbl_bodegas bo ON r.iid_bodega_origen = bo.iid_bodega
    LEFT JOIN segtblusuarios us ON r.iid_usuario_solicita = us.iid
    LEFT JOIN segtblusuarios ua ON r.iid_usuario_aprueba = ua.iid
    LEFT JOIN segtblusuarios ue ON r.iid_usuario_entrega = ue.iid
    WHERE 1=1
  `;

  const params = [];
  let paramCounter = 1;

  if (filters.iid_estado_requisicion) {
    query += ` AND r.iid_estado_requisicion = $${paramCounter}`;
    params.push(filters.iid_estado_requisicion);
    paramCounter++;
  }

  if (filters.iid_bodega_solicita) {
    query += ` AND r.iid_bodega_solicita = $${paramCounter}`;
    params.push(filters.iid_bodega_solicita);
    paramCounter++;
  }

  if (filters.iid_bodega_origen) {
    query += ` AND r.iid_bodega_origen = $${paramCounter}`;
    params.push(filters.iid_bodega_origen);
    paramCounter++;
  }

  if (filters.fecha_desde) {
    query += ` AND r.d_fecha_solicitud >= $${paramCounter}::timestamp`;
    params.push(filters.fecha_desde);
    paramCounter++;
  }

  if (filters.fecha_hasta) {
    query += ` AND r.d_fecha_solicitud <= $${paramCounter}::timestamp`;
    params.push(filters.fecha_hasta);
    paramCounter++;
  }

  query += ` ORDER BY r.d_fecha_solicitud DESC`;

  const { rows } = await pool.query(query, params);
  return rows;
};

const getRequisicionById = async (iid_requisicion, client = null) => {
  const dbConnection = client || pool;

  const query = `
    SELECT 
      r.*,
      to_json(er.*) as estado,
      bs.vnombre_bodega as bodega_solicita_nombre,
      bo.vnombre_bodega as bodega_origen_nombre,
      us.vnombres as usuario_solicita_nombre,
      ua.vnombres as usuario_aprueba_nombre,
      ue.vnombres as usuario_entrega_nombre,
      
      (
        SELECT json_agg(
          json_build_object(
            'iid_requisicion_det', rd.iid_requisicion_det,
            'iid_inventario', rd.iid_inventario,
            'codigo_producto', ip.codigo_producto,
            'cantidad_solicitada', rd.cantidad_solicitada,
            'cantidad_aprobada', rd.cantidad_aprobada,
            'producto', json_build_object(
              'iid_nombre', prod.iid_nombre,
              'vnombre_producto', prod.vnombre_producto,
              'codigo_producto', ip.codigo_producto,
              'iid_inventario', ip.iid_inventario,
              'nombre_completo', CONCAT(
                prod.vnombre_producto,
                CASE WHEN c.vnombre_caracteristica IS NOT NULL 
                  THEN ' - ' || c.vnombre_caracteristica 
                  ELSE '' 
                END,
                CASE WHEN m.vnombre_marca IS NOT NULL 
                  THEN ' - ' || m.vnombre_marca 
                  ELSE '' 
                END
              ),
              'caracteristica', c.vnombre_caracteristica,
              'marca', m.vnombre_marca,
              'unidad_medida', json_build_object(
                'iidunidad', um.iidunidad,
                'vnombreunidad', um.vnombreunidad,
                'vabreviatura', um.vabreviatura
              )
            )
          )
        )
        FROM tbl_requisiciones_det rd
        INNER JOIN tbl_inventario_productos ip ON rd.iid_inventario = ip.iid_inventario
        INNER JOIN tbl_productos prod ON ip.iid_nombre = prod.iid_nombre
        LEFT JOIN tbl_caracteristicas c ON ip.iid_caracteristica = c.iid_caracteristica
        LEFT JOIN tbl_marcas m ON ip.iid_marca = m.iid_marca
        LEFT JOIN unidades_medida um ON ip.unidad_consumo = um.iidunidad
        WHERE rd.iid_requisicion = r.iid_requisicion
      ) as detalles,
      
      (
        SELECT json_agg(
          json_build_object(
            'iid_historial', h.iid_historial,
            'iid_usuario', h.iid_usuario,
            'usuario_nombre', u.vnombres || ' ' || u.vapellidos,
            'd_fecha_cambio', h.d_fecha_cambio,
            'v_observaciones', h.v_observaciones,
            'v_accion', h.v_accion,
            'iid_estado_requisicion', h.iid_estado_requisicion,
            'estado_descripcion', e.v_descripcion
          ) ORDER BY h.d_fecha_cambio ASC
        )
        FROM tbl_requisiciones_historial h
        LEFT JOIN segtblusuarios u ON h.iid_usuario = u.iid
        LEFT JOIN tbl_estados_requisicion e ON h.iid_estado_requisicion = e.iid_estado_requisicion
        WHERE h.iid_requisicion = r.iid_requisicion
      ) as historial
      
    FROM tbl_requisiciones_cab r
    LEFT JOIN tbl_estados_requisicion er ON r.iid_estado_requisicion = er.iid_estado_requisicion
    LEFT JOIN tbl_bodegas bs ON r.iid_bodega_solicita = bs.iid_bodega
    LEFT JOIN tbl_bodegas bo ON r.iid_bodega_origen = bo.iid_bodega
    LEFT JOIN segtblusuarios us ON r.iid_usuario_solicita = us.iid
    LEFT JOIN segtblusuarios ua ON r.iid_usuario_aprueba = ua.iid
    LEFT JOIN segtblusuarios ue ON r.iid_usuario_entrega = ue.iid
    WHERE r.iid_requisicion = $1
  `;

  const { rows } = await dbConnection.query(query, [iid_requisicion]);
  return rows[0] || null;
};

const createRequisicion = async (requisicionData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const requisicionQuery = `
      INSERT INTO tbl_requisiciones_cab (
        iid_bodega_solicita, 
        iid_bodega_origen, 
        iid_estado_requisicion, 
        iid_usuario_solicita
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const requisicionValues = [
      requisicionData.iid_bodega_solicita,
      requisicionData.iid_bodega_origen,
      requisicionData.iid_estado_requisicion || 1,
      requisicionData.iid_usuario_solicita
    ];

    const { rows: requisicionRows } = await client.query(requisicionQuery, requisicionValues);
    const nuevaRequisicion = requisicionRows[0];

    const historialQuery = `
      INSERT INTO tbl_requisiciones_historial (
        iid_requisicion, 
        iid_usuario, 
        v_observaciones, 
        v_accion,
        iid_estado_requisicion
      )
      VALUES ($1, $2, $3, $4, $5)
    `;

    await client.query(historialQuery, [
      nuevaRequisicion.iid_requisicion,
      requisicionData.iid_usuario_solicita,
      requisicionData.v_observaciones || null,
      'SOLICITUD_CREADA',
      1
    ]);

    if (requisicionData.detalles && requisicionData.detalles.length > 0) {
      const detalleQuery = `
        INSERT INTO tbl_requisiciones_det (
          iid_requisicion, iid_inventario, cantidad_solicitada
        )
        VALUES ($1, $2, $3)
        RETURNING *;
      `;

      const detallesPromises = requisicionData.detalles.map(detalle =>
        client.query(detalleQuery, [
          nuevaRequisicion.iid_requisicion,
          detalle.iid_inventario,
          detalle.cantidad_solicitada
        ])
      );

      await Promise.all(detallesPromises);
    }

    await client.query('COMMIT');

    return getRequisicionById(nuevaRequisicion.iid_requisicion);

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updateRequisicion = async (iid_requisicion, requisicionData, req) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const iid_usuario = req.user?.iid;

    if (!iid_usuario) {
      throw new Error('Usuario no identificado');
    }

    const query = `
      UPDATE tbl_requisiciones_cab
      SET 
        iid_bodega_solicita = COALESCE($2, iid_bodega_solicita),
        iid_bodega_origen = COALESCE($3, iid_bodega_origen)
      WHERE iid_requisicion = $1 AND iid_estado_requisicion = 1
      RETURNING *;
    `;

    const values = [
      iid_requisicion,
      requisicionData.iid_bodega_solicita,
      requisicionData.iid_bodega_origen
    ];

    const { rows } = await client.query(query, values);

    if (rows.length === 0) {
      throw new Error('Requisición no encontrada o no puede ser modificada (solo se pueden editar requisiciones en estado SOLICITADA)');
    }

    if (requisicionData.v_observaciones && requisicionData.v_observaciones.trim()) {
      const historialQuery = `
        INSERT INTO tbl_requisiciones_historial 
          (iid_requisicion, iid_usuario, v_observaciones, v_accion, iid_estado_requisicion)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await client.query(historialQuery, [
        iid_requisicion,
        iid_usuario,
        requisicionData.v_observaciones.trim(),
        'ACTUALIZACION',
        1
      ]);
    }

    if (requisicionData.detalles && Array.isArray(requisicionData.detalles)) {
      await client.query('DELETE FROM tbl_requisiciones_det WHERE iid_requisicion = $1', [iid_requisicion]);

      for (const detalle of requisicionData.detalles) {
        const detalleQuery = `
          INSERT INTO tbl_requisiciones_det 
            (iid_requisicion, iid_inventario, cantidad_solicitada)
          VALUES ($1, $2, $3)
        `;
        await client.query(detalleQuery, [
          iid_requisicion,
          detalle.iid_inventario,
          detalle.cantidad_solicitada
        ]);
      }
    }

    await client.query('COMMIT');
    return getRequisicionById(iid_requisicion);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const aprobarRequisicion = async (iid_requisicion, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const query = `
      UPDATE tbl_requisiciones_cab
      SET 
        iid_estado_requisicion = 2,
        d_fecha_aprobacion = CURRENT_TIMESTAMP,
        iid_usuario_aprueba = $2
      WHERE iid_requisicion = $1 AND iid_estado_requisicion = 1
      RETURNING *;
    `;

    const { rows } = await client.query(query, [iid_requisicion, data.iid_usuario_aprueba]);

    if (rows.length === 0) {
      throw new Error('Requisición no encontrada o no está en estado SOLICITADA');
    }

    const historialQuery = `
      INSERT INTO tbl_requisiciones_historial (
        iid_requisicion, 
        iid_usuario, 
        v_observaciones, 
        v_accion,
        iid_estado_requisicion
      )
      VALUES ($1, $2, $3, $4, $5)
    `;

    await client.query(historialQuery, [
      iid_requisicion,
      data.iid_usuario_aprueba,
      data.v_observaciones || null,
      'REQUISICION_APROBADA',
      2
    ]);

    if (data.detalles && data.detalles.length > 0) {
      const updateDetalleQuery = `
        UPDATE tbl_requisiciones_det
        SET cantidad_aprobada = $3
        WHERE iid_requisicion = $1 AND iid_inventario = $2
      `;

      const detallesPromises = data.detalles.map(detalle =>
        client.query(updateDetalleQuery, [
          iid_requisicion,
          detalle.iid_inventario,
          detalle.cantidad_aprobada
        ])
      );

      await Promise.all(detallesPromises);
    }

    await client.query('COMMIT');
    return getRequisicionById(iid_requisicion);

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const rechazarRequisicion = async (iid_requisicion, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const query = `
      UPDATE tbl_requisiciones_cab
      SET 
        iid_estado_requisicion = 3,
        iid_usuario_aprueba = $2
      WHERE iid_requisicion = $1 AND iid_estado_requisicion = 1
      RETURNING *;
    `;

    const { rows } = await client.query(query, [
      iid_requisicion,
      data.iid_usuario_aprueba
    ]);

    if (rows.length === 0) {
      throw new Error('Requisición no encontrada o no puede ser rechazada');
    }

    const historialQuery = `
      INSERT INTO tbl_requisiciones_historial (
        iid_requisicion, 
        iid_usuario, 
        v_observaciones, 
        v_accion,
        iid_estado_requisicion
      )
      VALUES ($1, $2, $3, $4, $5)
    `;

    await client.query(historialQuery, [
      iid_requisicion,
      data.iid_usuario_aprueba,
      data.v_observaciones,
      'REQUISICION_RECHAZADA',
      3
    ]);

    await client.query('COMMIT');
    return getRequisicionById(iid_requisicion);

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const entregarRequisicion = async (iid_requisicion, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const query = `
      UPDATE tbl_requisiciones_cab
      SET 
        iid_estado_requisicion = 4,
        d_fecha_entrega = CURRENT_TIMESTAMP,
        iid_usuario_entrega = $2
      WHERE iid_requisicion = $1 AND iid_estado_requisicion = 2
      RETURNING *;
    `;

    const { rows } = await client.query(query, [iid_requisicion, data.iid_usuario_entrega]);

    if (rows.length === 0) {
      throw new Error('Requisición no encontrada o no está en estado APROBADA');
    }

    const historialQuery = `
      INSERT INTO tbl_requisiciones_historial (
        iid_requisicion, 
        iid_usuario, 
        v_observaciones, 
        v_accion,
        iid_estado_requisicion
      )
      VALUES ($1, $2, $3, $4, $5)
    `;

    await client.query(historialQuery, [
      iid_requisicion,
      data.iid_usuario_entrega,
      data.v_observaciones || null,
      'ENTREGA_COMPLETADA',
      4
    ]);

    await client.query('COMMIT');
    return getRequisicionById(iid_requisicion);

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getEstadosRequisicion = async () => {
  const query = `SELECT * FROM tbl_estados_requisicion WHERE b_activo = true ORDER BY iid_estado_requisicion`;
  const { rows } = await pool.query(query);
  return rows;
};

const getNextRequisicionIdFromSequence = async () => {
  const query = `
    SELECT 
      COALESCE(last_value, 0) + 1 as next_id
    FROM tbl_requisiciones_cab_iid_requisicion_seq
  `;
  const { rows } = await pool.query(query);
  return rows[0].next_id;
};

module.exports = {
  getAllRequisiciones,
  getRequisicionById,
  createRequisicion,
  updateRequisicion,
  aprobarRequisicion,
  rechazarRequisicion,
  entregarRequisicion,
  getEstadosRequisicion,
  getNextRequisicionIdFromSequence
};