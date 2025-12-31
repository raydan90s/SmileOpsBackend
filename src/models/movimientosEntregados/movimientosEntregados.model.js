const pool = require('@config/dbSupabase');

const getPedidosRecibidosParaReporte = async (filters = {}) => {
    let query = `
    SELECT 
      p.iid_pedido,
      p.d_fecha_solicitud,
      p.iid_bodega_destino,
      bd.vnombre_bodega as bodega_destino_nombre,
      p.iid_proveedor,
      pr.vnombre as proveedor_nombre,
      p.iid_usuario_solicita,
      us.vnombres as usuario_solicita_nombre,
      
      -- Fecha de entrega real (prioriza recepción/factura del historial)
      COALESCE(
        (SELECT d_fecha_cambio 
         FROM tbl_pedidos_historial 
         WHERE iid_pedido = p.iid_pedido 
           AND v_accion IN ('RECEPCION_COMPLETADA', 'FACTURA_REGISTRADA')
         ORDER BY d_fecha_cambio DESC 
         LIMIT 1),
        p.d_fecha_solicitud
      ) as d_fecha_entrega,
      
      -- Usuario que recibió (del historial)
      (SELECT h.iid_usuario 
       FROM tbl_pedidos_historial h
       WHERE h.iid_pedido = p.iid_pedido 
         AND v_accion = 'RECEPCION_COMPLETADA'
       ORDER BY h.d_fecha_cambio DESC 
       LIMIT 1
      ) as iid_usuario_recibio,
      
      (SELECT u.vnombres
       FROM tbl_pedidos_historial h
       LEFT JOIN segtblusuarios u ON h.iid_usuario = u.iid
       WHERE h.iid_pedido = p.iid_pedido 
         AND v_accion = 'RECEPCION_COMPLETADA'
       ORDER BY h.d_fecha_cambio DESC 
       LIMIT 1
      ) as usuario_recibio_nombre,
      
      -- Factura si existe
      (SELECT fc.v_numero_factura
       FROM tbl_rel_factura_pedido rfp
       INNER JOIN tbl_facturas_compra fc ON rfp.iid_factura_compra = fc.iid_factura_compra
       WHERE rfp.iid_pedido = p.iid_pedido
       LIMIT 1
      ) as numero_factura,
      
      (SELECT rfp.iid_factura_compra
       FROM tbl_rel_factura_pedido rfp
       WHERE rfp.iid_pedido = p.iid_pedido
       LIMIT 1
      ) as iid_factura,
      
      -- Observaciones
      (SELECT v_observaciones 
       FROM tbl_pedidos_historial 
       WHERE iid_pedido = p.iid_pedido 
       ORDER BY d_fecha_cambio DESC 
       LIMIT 1
      ) as v_observaciones,
      
      -- Detalles con productos
      (
        SELECT json_agg(
          json_build_object(
            'iid_pedido_det', pd.iid_pedido_det,
            'iid_inventario', pd.iid_inventario,
            'codigo_producto', ip.codigo_producto,
            'nombre_producto', prod.vnombre_producto,
            'cantidad_solicitada', pd.cantidad_solicitada,
            'cantidad_recibida', COALESCE(pd.cantidad_recibida, pd.cantidad_solicitada),
            'unidad_compra_abreviatura', uc.vabreviatura,
            'caracteristica', c.vnombre_caracteristica,
            'marca', m.vnombre_marca
          )
        )
        FROM tbl_pedidos_det pd
        INNER JOIN tbl_inventario_productos ip ON pd.iid_inventario = ip.iid_inventario
        INNER JOIN tbl_productos prod ON ip.iid_nombre = prod.iid_nombre
        LEFT JOIN tbl_caracteristicas c ON ip.iid_caracteristica = c.iid_caracteristica
        LEFT JOIN tbl_marcas m ON ip.iid_marca = m.iid_marca
        LEFT JOIN unidades_medida uc ON ip.unidad_compra = uc.iidunidad
        WHERE pd.iid_pedido = p.iid_pedido
      ) as detalles
      
    FROM tbl_pedidos_cab p
    LEFT JOIN tbl_bodegas bd ON p.iid_bodega_destino = bd.iid_bodega
    LEFT JOIN tbl_proveedores pr ON p.iid_proveedor = pr.iid_proveedor
    LEFT JOIN segtblusuarios us ON p.iid_usuario_solicita = us.iid
    WHERE p.iid_estado_pedido = 5
  `;

    const params = [];
    let paramCounter = 1;

    if (filters.iid_bodega_destino && filters.iid_bodega_destino !== '0') {
        query += ` AND p.iid_bodega_destino = $${paramCounter}`;
        params.push(parseInt(filters.iid_bodega_destino));
        paramCounter++;
    }

    query += ` ORDER BY p.iid_pedido DESC`;

    const { rows } = await pool.query(query, params);

    let filteredRows = rows;

    if (filters.fecha_desde) {
        const fechaDesde = new Date(filters.fecha_desde);
        filteredRows = filteredRows.filter(row => {
            const fechaEntrega = new Date(row.d_fecha_entrega);
            return fechaEntrega >= fechaDesde;
        });
    }

    if (filters.fecha_hasta) {
        const fechaHasta = new Date(filters.fecha_hasta);
        fechaHasta.setHours(23, 59, 59, 999); // Incluir todo el día
        filteredRows = filteredRows.filter(row => {
            const fechaEntrega = new Date(row.d_fecha_entrega);
            return fechaEntrega <= fechaHasta;
        });
    }

    return filteredRows;
};

const getRequisicionesEntregadasParaReporte = async (filters = {}) => {
    let query = `
    SELECT 
      r.iid_requisicion,
      r.d_fecha_solicitud,
      r.d_fecha_entrega,
      r.iid_bodega_solicita,
      r.iid_bodega_origen,
      bs.vnombre_bodega as bodega_solicita_nombre,
      bo.vnombre_bodega as bodega_origen_nombre,
      r.iid_usuario_solicita,
      r.iid_usuario_entrega,
      us.vnombres as usuario_solicita_nombre,
      ue.vnombres as usuario_entrega_nombre,
      
      -- Observaciones
      (SELECT v_observaciones 
       FROM tbl_requisiciones_historial 
       WHERE iid_requisicion = r.iid_requisicion 
       ORDER BY d_fecha_cambio DESC 
       LIMIT 1
      ) as v_observaciones,
      
      -- Detalles con productos
      (
        SELECT json_agg(
          json_build_object(
            'iid_requisicion_det', rd.iid_requisicion_det,
            'iid_inventario', rd.iid_inventario,
            'codigo_producto', ip.codigo_producto,
            'nombre_producto', prod.vnombre_producto,
            'cantidad_solicitada', rd.cantidad_solicitada,
            'cantidad_aprobada', COALESCE(rd.cantidad_aprobada, rd.cantidad_solicitada),
            'unidad_consumo_abreviatura', um.vabreviatura,
            'caracteristica', c.vnombre_caracteristica,
            'marca', m.vnombre_marca
          )
        )
        FROM tbl_requisiciones_det rd
        INNER JOIN tbl_inventario_productos ip ON rd.iid_inventario = ip.iid_inventario
        INNER JOIN tbl_productos prod ON ip.iid_nombre = prod.iid_nombre
        LEFT JOIN tbl_caracteristicas c ON ip.iid_caracteristica = c.iid_caracteristica
        LEFT JOIN tbl_marcas m ON ip.iid_marca = m.iid_marca
        LEFT JOIN unidades_medida um ON ip.unidad_consumo = um.iidunidad
        WHERE rd.iid_requisicion = r.iid_requisicion
      ) as detalles
      
    FROM tbl_requisiciones_cab r
    LEFT JOIN tbl_bodegas bs ON r.iid_bodega_solicita = bs.iid_bodega
    LEFT JOIN tbl_bodegas bo ON r.iid_bodega_origen = bo.iid_bodega
    LEFT JOIN segtblusuarios us ON r.iid_usuario_solicita = us.iid
    LEFT JOIN segtblusuarios ue ON r.iid_usuario_entrega = ue.iid
    WHERE r.iid_estado_requisicion = 4
  `;

    const params = [];
    let paramCounter = 1;

    if (filters.iid_bodega && filters.iid_bodega !== '0') {
        query += ` AND (r.iid_bodega_solicita = $${paramCounter} OR r.iid_bodega_origen = $${paramCounter})`;
        params.push(parseInt(filters.iid_bodega));
        paramCounter++;
    }

    if (filters.fecha_desde) {
        query += ` AND r.d_fecha_entrega >= $${paramCounter}::timestamp`;
        params.push(filters.fecha_desde);
        paramCounter++;
    }

    if (filters.fecha_hasta) {
        query += ` AND r.d_fecha_entrega <= $${paramCounter}::timestamp`;
        params.push(filters.fecha_hasta);
        paramCounter++;
    }

    query += ` ORDER BY r.d_fecha_entrega DESC`;

    const { rows } = await pool.query(query, params);

    return rows;
};

module.exports = {
    getPedidosRecibidosParaReporte,
    getRequisicionesEntregadasParaReporte
};