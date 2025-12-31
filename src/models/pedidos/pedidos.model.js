const pool = require('@config/dbSupabase');

const getAllPedidos = async (filters = {}) => {
  let query = `
    SELECT 
      p.*,
      to_json(tp.*) as tipo,
      to_json(ep.*) as estado,
      bd.vnombre_bodega as bodega_destino_nombre,
      pr.vnombre as proveedor_nombre,
      pr.vruc as proveedor_ruc,
      pr.vemail as proveedor_email,
      pr.vtelefono as proveedor_telefono,
      us.vnombres as usuario_solicita_nombre,
      
      (
        SELECT v_observaciones 
        FROM tbl_pedidos_historial 
        WHERE iid_pedido = p.iid_pedido 
        ORDER BY d_fecha_cambio DESC 
        LIMIT 1
      ) as v_observaciones,
      
      (
        SELECT json_agg(
          json_build_object(
            'iid_pedido_det', pd.iid_pedido_det,
            'iid_inventario', pd.iid_inventario,
            'codigo_producto', ip.codigo_producto,
            'cantidad_solicitada', pd.cantidad_solicitada,
            'cantidad_cotizada', pd.cantidad_cotizada,
            'cantidad_recibida', pd.cantidad_recibida,
            'n_precio_unitario', pd.n_precio_unitario,
            'n_subtotal_linea', pd.n_subtotal_linea,
            'iid_iva', pd.iid_iva,
            'n_porcentaje_iva_aplicado', pd.n_porcentaje_iva_aplicado,
            'n_iva_linea', pd.n_iva_linea,
            'n_total_linea', pd.n_total_linea,
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
              'iid_iva', ip.iid_iva,
              'unidad_compra', json_build_object(
                'iidunidad', uc.iidunidad,
                'vnombreunidad', uc.vnombreunidad,
                'vabreviatura', uc.vabreviatura
              )
            )
          )
        )
        FROM tbl_pedidos_det pd
        INNER JOIN tbl_inventario_productos ip ON pd.iid_inventario = ip.iid_inventario
        INNER JOIN tbl_productos prod ON ip.iid_nombre = prod.iid_nombre
        LEFT JOIN tbl_caracteristicas c ON ip.iid_caracteristica = c.iid_caracteristica
        LEFT JOIN tbl_marcas m ON ip.iid_marca = m.iid_marca
        LEFT JOIN unidades_medida uc ON ip.unidad_compra = uc.iidunidad
        WHERE pd.iid_pedido = p.iid_pedido
      ) as detalles,
      
      (
        SELECT json_agg(
          json_build_object(
            'iid_historial', h.iid_historial,
            'iid_usuario', h.iid_usuario,
            'usuario_nombre', u.vnombres || ' ' || u.vapellidos,
            'd_fecha_cambio', h.d_fecha_cambio,
            'v_observaciones', h.v_observaciones,
            'v_accion', h.v_accion
          ) ORDER BY h.d_fecha_cambio ASC
        )
        FROM tbl_pedidos_historial h
        LEFT JOIN segtblusuarios u ON h.iid_usuario = u.iid
        WHERE h.iid_pedido = p.iid_pedido
      ) as historial,
      
      (
        SELECT json_agg(
          json_build_object(
            'iid_rel_factura_pedido', rfp.iid_rel_factura_pedido,
            'iid_factura_compra', fc.iid_factura_compra,
            'v_numero_factura', fc.v_numero_factura,
            'd_fecha_factura', fc.d_fecha_factura,
            'n_subtotal', fc.n_subtotal,
            'n_iva', fc.n_iva,
            'n_total', fc.n_total,
            'd_fecha_registro', fc.d_fecha_registro
          )
        )
        FROM tbl_rel_factura_pedido rfp
        INNER JOIN tbl_facturas_compra fc ON rfp.iid_factura_compra = fc.iid_factura_compra
        WHERE rfp.iid_pedido = p.iid_pedido
      ) as facturas
    FROM tbl_pedidos_cab p
    LEFT JOIN tbl_tipos_pedido tp ON p.iid_tipo_pedido = tp.iid_tipo_pedido
    LEFT JOIN tbl_estados_pedido ep ON p.iid_estado_pedido = ep.iid_estado_pedido
    LEFT JOIN tbl_bodegas bd ON p.iid_bodega_destino = bd.iid_bodega
    LEFT JOIN tbl_proveedores pr ON p.iid_proveedor = pr.iid_proveedor
    LEFT JOIN segtblusuarios us ON p.iid_usuario_solicita = us.iid
    WHERE 1=1
  `;

  const params = [];
  let paramCounter = 1;

  if (filters.iid_estado_pedido) {
    query += ` AND p.iid_estado_pedido = $${paramCounter}`;
    params.push(filters.iid_estado_pedido);
    paramCounter++;
  }

  if (filters.iid_tipo_pedido) {
    query += ` AND p.iid_tipo_pedido = $${paramCounter}`;
    params.push(filters.iid_tipo_pedido);
    paramCounter++;
  }

  if (filters.iid_bodega_destino) {
    query += ` AND p.iid_bodega_destino = $${paramCounter}`;
    params.push(filters.iid_bodega_destino);
    paramCounter++;
  }

  if (filters.iid_proveedor) {
    query += ` AND p.iid_proveedor = $${paramCounter}`;
    params.push(filters.iid_proveedor);
    paramCounter++;
  }

  if (filters.fecha_desde) {
    query += ` AND p.d_fecha_solicitud >= $${paramCounter}::timestamp`;
    params.push(filters.fecha_desde);
    paramCounter++;
  }

  if (filters.fecha_hasta) {
    query += ` AND p.d_fecha_solicitud <= $${paramCounter}::timestamp`;
    params.push(filters.fecha_hasta);
    paramCounter++;
  }

  query += ` ORDER BY p.d_fecha_solicitud DESC`;

  const { rows } = await pool.query(query, params);
  return rows;
};

const getPedidoById = async (iid_pedido, client = null) => {
  const dbConnection = client || pool;

  const query = `
    SELECT 
      p.*,
      to_json(tp.*) as tipo,
      to_json(ep.*) as estado,
      bd.vnombre_bodega as bodega_destino_nombre,
      pr.vnombre as proveedor_nombre,
      pr.vruc as proveedor_ruc,
      pr.vemail as proveedor_email,
      pr.vtelefono as proveedor_telefono,
      us.vnombres as usuario_solicita_nombre,
      (
        SELECT json_agg(
          json_build_object(
            'iid_pedido_det', pd.iid_pedido_det,
            'iid_inventario', pd.iid_inventario,
            'codigo_producto', ip.codigo_producto,
            'cantidad_solicitada', pd.cantidad_solicitada,
            'cantidad_cotizada', pd.cantidad_cotizada,
            'cantidad_recibida', pd.cantidad_recibida,
            'n_precio_unitario', pd.n_precio_unitario,
            'n_subtotal_linea', pd.n_subtotal_linea,
            'iid_iva', pd.iid_iva,
            'n_porcentaje_iva_aplicado', pd.n_porcentaje_iva_aplicado,
            'n_iva_linea', pd.n_iva_linea,
            'n_total_linea', pd.n_total_linea,
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
              'iid_iva', ip.iid_iva,
              'iva_porcentaje', iva.n_porcentaje,
              'iva_vigencia_desde', iva.d_fecha_vigencia_desde,
              'iva_vigencia_hasta', iva.d_fecha_vigencia_hasta,
              'iva_activo', iva.b_activo,
              'unidad_compra', json_build_object(
                'iidunidad', uc.iidunidad,
                'vnombreunidad', uc.vnombreunidad,
                'vabreviatura', uc.vabreviatura
              )
            )
          )
        )
        FROM tbl_pedidos_det pd
        INNER JOIN tbl_inventario_productos ip ON pd.iid_inventario = ip.iid_inventario
        INNER JOIN tbl_productos prod ON ip.iid_nombre = prod.iid_nombre
        LEFT JOIN tbl_caracteristicas c ON ip.iid_caracteristica = c.iid_caracteristica
        LEFT JOIN tbl_marcas m ON ip.iid_marca = m.iid_marca
        LEFT JOIN unidades_medida uc ON ip.unidad_compra = uc.iidunidad
        LEFT JOIN tbl_iva iva ON ip.iid_iva = iva.iid_iva
        WHERE pd.iid_pedido = p.iid_pedido
      ) as detalles,
      
      (
        SELECT json_agg(
          json_build_object(
            'iid_historial', h.iid_historial,
            'iid_usuario', h.iid_usuario,
            'usuario_nombre', u.vnombres || ' ' || u.vapellidos,
            'd_fecha_cambio', h.d_fecha_cambio,
            'v_observaciones', h.v_observaciones,
            'v_accion', h.v_accion
          ) ORDER BY h.d_fecha_cambio ASC
        )
        FROM tbl_pedidos_historial h
        LEFT JOIN segtblusuarios u ON h.iid_usuario = u.iid
        WHERE h.iid_pedido = p.iid_pedido
      ) as historial,
      
      (
        SELECT json_agg(
          json_build_object(
            'iid_rel_factura_pedido', rfp.iid_rel_factura_pedido,
            'iid_factura_compra', fc.iid_factura_compra,
            'v_numero_factura', fc.v_numero_factura,
            'd_fecha_factura', fc.d_fecha_factura,
            'n_subtotal', fc.n_subtotal,
            'n_iva', fc.n_iva,
            'n_total', fc.n_total,
            'd_fecha_registro', fc.d_fecha_registro
          )
        )
        FROM tbl_rel_factura_pedido rfp
        INNER JOIN tbl_facturas_compra fc ON rfp.iid_factura_compra = fc.iid_factura_compra
        WHERE rfp.iid_pedido = p.iid_pedido
      ) as facturas
    FROM tbl_pedidos_cab p
    LEFT JOIN tbl_tipos_pedido tp ON p.iid_tipo_pedido = tp.iid_tipo_pedido
    LEFT JOIN tbl_estados_pedido ep ON p.iid_estado_pedido = ep.iid_estado_pedido
    LEFT JOIN tbl_bodegas bd ON p.iid_bodega_destino = bd.iid_bodega
    LEFT JOIN tbl_proveedores pr ON p.iid_proveedor = pr.iid_proveedor
    LEFT JOIN segtblusuarios us ON p.iid_usuario_solicita = us.iid
    WHERE p.iid_pedido = $1
  `;
  const { rows } = await dbConnection.query(query, [iid_pedido]);
  return rows[0] || null;
};

const createPedido = async (pedidoData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const pedidoQuery = `
      INSERT INTO tbl_pedidos_cab (
        iid_tipo_pedido, iid_bodega_destino, iid_proveedor,
        iid_estado_pedido, iid_usuario_solicita
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const pedidoValues = [
      pedidoData.iid_tipo_pedido,
      pedidoData.iid_bodega_destino,
      pedidoData.iid_proveedor,
      pedidoData.iid_estado_pedido || 1,
      pedidoData.iid_usuario_solicita
    ];
    const { rows: pedidoRows } = await client.query(pedidoQuery, pedidoValues);
    const nuevoPedido = pedidoRows[0];

    const historialQuery = `
      INSERT INTO tbl_pedidos_historial (
        iid_pedido, 
        iid_usuario, 
        v_observaciones, 
        v_accion
      )
      VALUES ($1, $2, $3, $4)
    `;

    await client.query(historialQuery, [
      nuevoPedido.iid_pedido,
      pedidoData.iid_usuario_solicita,
      pedidoData.v_observaciones || null,
      'SOLICITUD_CREADA'
    ]);

    if (pedidoData.detalles && pedidoData.detalles.length > 0) {
      const detalleQuery = `
        INSERT INTO tbl_pedidos_det (
          iid_pedido, iid_inventario, cantidad_solicitada
        )
        VALUES ($1, $2, $3)
        RETURNING *;
      `;

      const detallesPromises = pedidoData.detalles.map(detalle =>
        client.query(detalleQuery, [
          nuevoPedido.iid_pedido,
          detalle.iid_inventario,
          detalle.cantidad_solicitada
        ])
      );

      await Promise.all(detallesPromises);
    }

    await client.query('COMMIT');

    return getPedidoById(nuevoPedido.iid_pedido);

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updatePedido = async (iid_pedido, pedidoData, req) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const iid_usuario = req.user?.iid;

    if (!iid_usuario) {
      throw new Error('Usuario no identificado');
    }

    const query = `
      UPDATE tbl_pedidos_cab
      SET 
        iid_tipo_pedido = COALESCE($2, iid_tipo_pedido),
        iid_bodega_destino = COALESCE($3, iid_bodega_destino),
        iid_proveedor = COALESCE($4, iid_proveedor)
      WHERE iid_pedido = $1 AND iid_estado_pedido = 1
      RETURNING *;
    `;
    const values = [
      iid_pedido,
      pedidoData.iid_tipo_pedido,
      pedidoData.iid_bodega_destino || pedidoData.iid_bodega,
      pedidoData.iid_proveedor
    ];
    const { rows } = await client.query(query, values);

    if (rows.length === 0) {
      throw new Error('Pedido no encontrado o no puede ser modificado (solo se pueden editar pedidos en estado PENDIENTE)');
    }

    if (pedidoData.v_observaciones && pedidoData.v_observaciones.trim()) {
      const historialQuery = `
        INSERT INTO tbl_pedidos_historial 
          (iid_pedido, iid_usuario, v_observaciones, v_accion)
        VALUES ($1, $2, $3, $4)
      `;
      await client.query(historialQuery, [
        iid_pedido,
        iid_usuario,
        pedidoData.v_observaciones.trim(),
        'ACTUALIZACION'
      ]);
    }

    if (pedidoData.detalles && Array.isArray(pedidoData.detalles)) {
      await client.query('DELETE FROM tbl_pedidos_det WHERE iid_pedido = $1', [iid_pedido]);

      for (const detalle of pedidoData.detalles) {
        const detalleQuery = `
          INSERT INTO tbl_pedidos_det 
            (iid_pedido, iid_inventario, cantidad_solicitada)
          VALUES ($1, $2, $3)
        `;
        await client.query(detalleQuery, [
          iid_pedido,
          detalle.iid_inventario,
          detalle.cantidad_solicitada
        ]);
      }
    }

    await client.query('COMMIT');
    return getPedidoById(iid_pedido);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const cotizarPedido = async (iid_pedido, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const query = `
      UPDATE tbl_pedidos_cab
      SET 
        iid_estado_pedido = 6,
        iid_proveedor = $2
      WHERE iid_pedido = $1 AND iid_estado_pedido IN (2, 6)
      RETURNING *;
    `;
    const { rows } = await client.query(query, [iid_pedido, data.iid_proveedor]);

    if (rows.length === 0) {
      throw new Error('Pedido no encontrado o no está en estado válido para cotizar');
    }

    const historialQuery = `
      INSERT INTO tbl_pedidos_historial (
        iid_pedido, 
        iid_usuario, 
        v_observaciones, 
        v_accion
      )
      VALUES ($1, $2, $3, $4)
    `;

    await client.query(historialQuery, [
      iid_pedido,
      data.iid_usuario,
      data.v_observaciones || null,
      'COTIZACION_COMPLETADA'
    ]);

    if (data.detalles && data.detalles.length > 0) {
      const updateDetalleQuery = `
        UPDATE tbl_pedidos_det pd
        SET 
          n_precio_unitario = $3,
          iid_iva = ip.iid_iva,
          n_porcentaje_iva_aplicado = COALESCE(iva.n_porcentaje, 0),
          n_subtotal_linea = pd.cantidad_solicitada * $3,
          n_iva_linea = (pd.cantidad_solicitada * $3) * (COALESCE(iva.n_porcentaje, 0) / 100),
          n_total_linea = (pd.cantidad_solicitada * $3) + 
                          ((pd.cantidad_solicitada * $3) * (COALESCE(iva.n_porcentaje, 0) / 100))
        FROM tbl_inventario_productos ip
        LEFT JOIN tbl_iva iva ON ip.iid_iva = iva.iid_iva
        WHERE pd.iid_pedido = $1 
          AND pd.iid_inventario = $2
          AND pd.iid_inventario = ip.iid_inventario
      `;

      const detallesPromises = data.detalles.map(detalle =>
        client.query(updateDetalleQuery, [
          iid_pedido,
          detalle.iid_inventario,
          detalle.n_precio_unitario
        ])
      );

      await Promise.all(detallesPromises);
    }

    await client.query('COMMIT');
    return getPedidoById(iid_pedido);

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const aprobarPedido = async (iid_pedido, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const query = `
      UPDATE tbl_pedidos_cab
      SET 
        iid_estado_pedido = 2
      WHERE iid_pedido = $1
      RETURNING *;
    `;
    const { rows } = await client.query(query, [iid_pedido]);

    if (rows.length === 0) {
      throw new Error('Pedido no encontrado o no está en estado COTIZADO');
    }

    const historialQuery = `
      INSERT INTO tbl_pedidos_historial (
        iid_pedido, iid_usuario, 
        v_observaciones, v_accion
      )
      VALUES ($1, $2, $3, $4)
    `;
    await client.query(historialQuery, [
      iid_pedido,
      data.iid_usuario_aprueba,
      data.v_observaciones || null,
      'APROBACION_A_COTIZANDO'
    ]);

    await client.query('COMMIT');
    return getPedidoById(iid_pedido);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const rechazarPedido = async (iid_pedido, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const query = `
      UPDATE tbl_pedidos_cab
      SET 
        iid_estado_pedido = 4,
        v_motivo_rechazo = $2
      WHERE iid_pedido = $1 AND (iid_estado_pedido = 1 OR iid_estado_pedido = 2 OR iid_estado_pedido = 6)
      RETURNING *;
    `;
    const { rows } = await client.query(query, [
      iid_pedido,
      data.v_motivo_rechazo
    ]);

    if (rows.length === 0) {
      throw new Error('Pedido no encontrado o no puede ser rechazado (Estado incorrecto)');
    }

    const historialQuery = `
      INSERT INTO tbl_pedidos_historial (
        iid_pedido, 
        iid_usuario, 
        v_observaciones, 
        v_accion
      )
      VALUES ($1, $2, $3, $4)
    `;

    await client.query(historialQuery, [
      iid_pedido,
      data.iid_usuario_aprueba,
      data.v_motivo_rechazo,
      'PEDIDO_RECHAZADO'
    ]);

    await client.query('COMMIT');
    return getPedidoById(iid_pedido);

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const recibirPedido = async (iid_pedido, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const query = `
      UPDATE tbl_pedidos_cab
      SET 
        iid_estado_pedido = 5
      WHERE iid_pedido = $1 AND iid_estado_pedido = 3
      RETURNING *;
    `;
    const { rows } = await client.query(query, [iid_pedido]);

    if (rows.length === 0) {
      throw new Error('Pedido no encontrado o no está en estado APROBADO');
    }

    const historialQuery = `
      INSERT INTO tbl_pedidos_historial (
        iid_pedido, 
        iid_usuario, 
        v_observaciones, 
        v_accion
      )
      VALUES ($1, $2, $3, $4)
    `;

    await client.query(historialQuery, [
      iid_pedido,
      data.iid_usuario_recibe,
      data.v_observaciones || null,
      'RECEPCION_COMPLETADA'
    ]);

    if (data.detalles && data.detalles.length > 0) {
      const updateDetalleQuery = `
        UPDATE tbl_pedidos_det
        SET cantidad_recibida = $3
        WHERE iid_pedido = $1 AND iid_inventario = $2
      `;

      const detallesPromises = data.detalles.map(detalle =>
        client.query(updateDetalleQuery, [
          iid_pedido,
          detalle.iid_inventario,
          detalle.cantidad_recibida
        ])
      );

      await Promise.all(detallesPromises);
    }

    await client.query('COMMIT');
    return getPedidoById(iid_pedido);

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const registrarFacturaPedido = async (iid_pedido, facturaData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const pedido = await getPedidoById(iid_pedido, client);
    if (!pedido) {
      throw new Error('Pedido no encontrado');
    }

    // Primero crear la factura en tbl_facturas_compra
    const facturaQuery = `
      INSERT INTO tbl_facturas_compra (
        v_numero_factura, d_fecha_factura,
        n_subtotal, n_iva, n_total, v_observaciones
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const facturaValues = [
      facturaData.v_numero_factura,
      facturaData.d_fecha_factura,
      facturaData.n_subtotal,
      facturaData.n_iva,
      facturaData.n_total,
      facturaData.v_observaciones || null
    ];
    const { rows: facturaRows } = await client.query(facturaQuery, facturaValues);
    const nuevaFactura = facturaRows[0];

    // Luego crear la relación en tbl_rel_factura_pedido
    const relacionQuery = `
      INSERT INTO tbl_rel_factura_pedido (
        iid_factura_compra, iid_pedido
      )
      VALUES ($1, $2)
      RETURNING *;
    `;
    await client.query(relacionQuery, [nuevaFactura.iid_factura_compra, iid_pedido]);

    if (pedido.detalles && pedido.detalles.length > 0) {
      const historialQuery = `
        INSERT INTO tbl_historial_precios_productos (
          iid_inventario, iid_proveedor, n_precio_compra,
          iid_pedido, iid_factura_compra, d_fecha_factura,
          iid_usuario_registra, v_observaciones
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;

      const historialPromises = pedido.detalles
        .filter(det => det.n_precio_unitario > 0)
        .map(detalle =>
          client.query(historialQuery, [
            detalle.iid_inventario,
            pedido.iid_proveedor,
            detalle.n_precio_unitario,
            iid_pedido,
            nuevaFactura.iid_factura_compra,
            facturaData.d_fecha_factura,
            facturaData.iid_usuario_registra,
            `Factura ${facturaData.v_numero_factura}`
          ])
        );

      await Promise.all(historialPromises);
    }

    await client.query('COMMIT');
    return getPedidoById(iid_pedido);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getTiposPedido = async () => {
  const query = `SELECT * FROM tbl_tipos_pedido WHERE b_activo = true ORDER BY v_descripcion`;
  const { rows } = await pool.query(query);
  return rows;
};

const getEstadosPedido = async () => {
  const query = `SELECT * FROM tbl_estados_pedido WHERE b_activo = true ORDER BY iid_estado_pedido`;
  const { rows } = await pool.query(query);
  return rows;
};

const getNextPedidoIdFromSequence = async () => {
  const query = `
    SELECT 
      COALESCE(last_value, 0) + 1 as next_id
    FROM tbl_pedidos_cab_iid_pedido_seq
  `;
  const { rows } = await pool.query(query);
  return rows[0].next_id;
};

const aprobarCotizacionFinal = async (iid_pedido, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const pedidoQuery = `
      SELECT iid_pedido, iid_estado_pedido 
      FROM tbl_pedidos_cab 
      WHERE iid_pedido = $1
    `;
    const { rows: pedidoRows } = await client.query(pedidoQuery, [iid_pedido]);

    if (pedidoRows.length === 0) {
      throw new Error('Pedido no encontrado');
    }

    if (pedidoRows[0].iid_estado_pedido !== 6) {
      throw new Error('El pedido no está en estado COTIZADO (6). No se puede aprobar.');
    }

    const detallesQuery = `
      SELECT 
        pd.iid_pedido_det,
        pd.iid_inventario,
        pd.cantidad_solicitada,
        pd.cantidad_cotizada,
        pd.n_precio_unitario,
        ip.iid_iva,
        COALESCE(iva.n_porcentaje, 0) as iva_porcentaje
      FROM tbl_pedidos_det pd
      LEFT JOIN tbl_inventario_productos ip ON pd.iid_inventario = ip.iid_inventario
      LEFT JOIN tbl_iva iva ON ip.iid_iva = iva.iid_iva AND iva.b_activo = true
      WHERE pd.iid_pedido = $1
    `;
    const { rows: detalles } = await client.query(detallesQuery, [iid_pedido]);

    const detallesSinPrecio = detalles.filter(d => !d.n_precio_unitario || parseFloat(d.n_precio_unitario) <= 0);
    if (detallesSinPrecio.length > 0) {
      throw new Error('No se puede aprobar la cotización. Hay productos sin precio unitario definido.');
    }

    for (const detalle of detalles) {
      const cantidad = parseFloat(detalle.cantidad_cotizada || detalle.cantidad_solicitada);
      const precioUnitario = parseFloat(detalle.n_precio_unitario);
      const porcentajeIva = parseFloat(detalle.iva_porcentaje || 0);

      const subtotalLinea = cantidad * precioUnitario;
      const ivaLinea = subtotalLinea * (porcentajeIva / 100);
      const totalLinea = subtotalLinea + ivaLinea;

      const updateDetalleQuery = `
        UPDATE tbl_pedidos_det
        SET 
          cantidad_cotizada = COALESCE(cantidad_cotizada, cantidad_solicitada),
          n_subtotal_linea = $1,
          iid_iva = $2,
          n_porcentaje_iva_aplicado = $3,
          n_iva_linea = $4,
          n_total_linea = $5
        WHERE iid_pedido_det = $6
      `;

      await client.query(updateDetalleQuery, [
        subtotalLinea.toFixed(2),
        detalle.iid_iva,
        porcentajeIva.toFixed(2),
        ivaLinea.toFixed(2),
        totalLinea.toFixed(2),
        detalle.iid_pedido_det
      ]);
    }

    const updatePedidoQuery = `
      UPDATE tbl_pedidos_cab
      SET iid_estado_pedido = 3
      WHERE iid_pedido = $1
      RETURNING *
    `;
    await client.query(updatePedidoQuery, [iid_pedido]);

    if (data.v_observaciones && data.v_observaciones.trim()) {
      const historialQuery = `
        INSERT INTO tbl_pedidos_historial (
          iid_pedido, 
          iid_usuario, 
          v_observaciones, 
          v_accion
        )
        VALUES ($1, $2, $3, $4)
      `;
      await client.query(historialQuery, [
        iid_pedido,
        data.iid_usuario_aprueba,
        data.v_observaciones.trim(),
        'APROBACION_COTIZACION'
      ]);
    }

    await client.query('COMMIT');
    return getPedidoById(iid_pedido);

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const actualizarPedidoCotizado = async (iid_pedido, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const pedidoQuery = `SELECT iid_estado_pedido FROM tbl_pedidos_cab WHERE iid_pedido = $1`;
    const { rows: pedidoRows } = await client.query(pedidoQuery, [iid_pedido]);

    if (pedidoRows.length === 0) throw new Error('Pedido no encontrado');
    if (![2, 6].includes(pedidoRows[0].iid_estado_pedido)) {
      throw new Error('Estado inválido para editar cotización');
    }

    await client.query(
      `UPDATE tbl_pedidos_cab SET iid_estado_pedido = 6, iid_proveedor = $2 WHERE iid_pedido = $1`,
      [iid_pedido, data.iid_proveedor]
    );

    const backupQuery = `SELECT iid_inventario, cantidad_solicitada FROM tbl_pedidos_det WHERE iid_pedido = $1`;
    const { rows: datosOriginales } = await client.query(backupQuery, [iid_pedido]);

    const mapaSolicitado = new Map();
    datosOriginales.forEach(d => mapaSolicitado.set(d.iid_inventario, d.cantidad_solicitada));

    await client.query('DELETE FROM tbl_pedidos_det WHERE iid_pedido = $1', [iid_pedido]);

    if (data.detalles && data.detalles.length > 0) {
      for (const detalle of data.detalles) {

        const prodQuery = `
          SELECT ip.iid_iva, COALESCE(iva.n_porcentaje, 0) as iva_percent
          FROM tbl_inventario_productos ip
          LEFT JOIN tbl_iva iva ON ip.iid_iva = iva.iid_iva AND iva.b_activo = true
          WHERE ip.iid_inventario = $1
        `;
        const { rows: prodRows } = await client.query(prodQuery, [detalle.iid_inventario]);
        if (prodRows.length === 0) throw new Error(`Producto ${detalle.iid_inventario} no existe`);

        const cantidadSolicitadaIntacta = mapaSolicitado.get(detalle.iid_inventario) || 0;

        const cantidadCotizada = parseFloat(detalle.cantidad_cotizada);
        const precioUnitario = parseFloat(detalle.n_precio_unitario);
        const ivaPercent = parseFloat(prodRows[0].iva_percent);

        const subtotal = cantidadCotizada * precioUnitario;
        const valorIva = subtotal * (ivaPercent / 100);
        const total = subtotal + valorIva;

        const insertQuery = `
          INSERT INTO tbl_pedidos_det (
            iid_pedido, iid_inventario, 
            cantidad_solicitada,       
            cantidad_cotizada,         
            n_precio_unitario, n_subtotal_linea, 
            iid_iva, n_porcentaje_iva_aplicado, n_iva_linea, n_total_linea
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `;

        await client.query(insertQuery, [
          iid_pedido,
          detalle.iid_inventario,
          cantidadSolicitadaIntacta,
          cantidadCotizada,
          precioUnitario,
          subtotal,
          prodRows[0].iid_iva,
          ivaPercent,
          valorIva,
          total
        ]);
      }
    }

    await client.query(
      `INSERT INTO tbl_pedidos_historial (iid_pedido, iid_usuario, v_observaciones, v_accion) VALUES ($1, $2, $3, 'COTIZACION_ACTUALIZADA')`,
      [iid_pedido, data.iid_usuario, data.v_observaciones]
    );

    await client.query('COMMIT');
    return getPedidoById(iid_pedido);

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getAllPedidos,
  getPedidoById,
  createPedido,
  updatePedido,
  cotizarPedido,
  aprobarPedido,
  rechazarPedido,
  recibirPedido,
  registrarFacturaPedido,
  getTiposPedido,
  getEstadosPedido,
  getNextPedidoIdFromSequence,
  aprobarCotizacionFinal,
  actualizarPedidoCotizado
};