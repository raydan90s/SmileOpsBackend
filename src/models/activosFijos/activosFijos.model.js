const pool = require('@config/dbSupabase');
const { executeWithAudit } = require('@middlewares/auditoria.middleware');

// ✅ Obtener todos los activos fijos
const getAllActivosFijos = async () => {
  const query = `
    SELECT * FROM vw_activos_fijos_completa
    WHERE bactivo = true
    ORDER BY vcodigo_activo ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// ✅ Obtener activo fijo por ID
const getActivoFijoById = async (iid_activo) => {
  const query = `
    SELECT * FROM vw_activos_fijos_completa
    WHERE iid_activo = $1
  `;
  const { rows } = await pool.query(query, [iid_activo]);
  return rows[0] || null;
};

// ✅ Obtener activo fijo por código
const getActivoFijoByCodigo = async (codigo) => {
  const query = `
    SELECT * FROM vw_activos_fijos_completa
    WHERE vcodigo_activo = $1
  `;
  const { rows } = await pool.query(query, [codigo]);
  return rows[0] || null;
};

// ✅ Obtener activos por categoría
const getActivosFijosByCategoria = async (iid_categoria) => {
  const query = `
    SELECT * FROM vw_activos_fijos_completa
    WHERE iid_categoria = $1 AND bactivo = true
    ORDER BY vcodigo_activo ASC
  `;
  const { rows } = await pool.query(query, [iid_categoria]);
  return rows;
};

// ✅ Obtener activos por ubicación
const getActivosFijosByUbicacion = async (iid_ubicacion) => {
  const query = `
    SELECT * FROM vw_activos_fijos_completa
    WHERE iid_ubicacion = $1 AND bactivo = true
    ORDER BY vcodigo_activo ASC
  `;
  const { rows } = await pool.query(query, [iid_ubicacion]);
  return rows;
};

// ✅ Obtener activos por estado operativo
const getActivosFijosByEstado = async (iid_estado_operativo) => {
  const query = `
    SELECT * FROM vw_activos_fijos_completa
    WHERE iid_estado_operativo = $1 AND bactivo = true
    ORDER BY vcodigo_activo ASC
  `;
  const { rows } = await pool.query(query, [iid_estado_operativo]);
  return rows;
};

// ✅ Obtener activos por doctor asignado
const getActivosFijosByDoctor = async (iid_doctor_asignado) => {
  const query = `
    SELECT * FROM vw_activos_fijos_completa
    WHERE iid_doctor_asignado = $1 AND bactivo = true
    ORDER BY vcodigo_activo ASC
  `;
  const { rows } = await pool.query(query, [iid_doctor_asignado]);
  return rows;
};

// ✅ Obtener activos por tipo de instrumental
const getActivosFijosByTipo = async (iid_tipo_instrumental) => {
  const query = `
    SELECT * FROM vw_activos_fijos_completa
    WHERE iid_tipo_instrumental = $1 AND bactivo = true
    ORDER BY vcodigo_activo ASC
  `;
  const { rows } = await pool.query(query, [iid_tipo_instrumental]);
  return rows;
};

// ✅ Obtener activos por marca
const getActivosFijosByMarca = async (iid_marca) => {
  const query = `
    SELECT * FROM vw_activos_fijos_completa
    WHERE iid_marca = $1 AND bactivo = true
    ORDER BY vcodigo_activo ASC
  `;
  const { rows } = await pool.query(query, [iid_marca]);
  return rows;
};

// ✅ Buscar activos (motor de búsqueda)
const searchActivosFijos = async (termino) => {
  const query = `
    SELECT * FROM vw_activos_fijos_completa
    WHERE texto_busqueda ILIKE $1 AND bactivo = true
    ORDER BY vcodigo_activo ASC
    LIMIT 100
  `;
  const { rows } = await pool.query(query, [`%${termino}%`]);
  return rows;
};

// ✅ Obtener activos con garantía vigente
const getActivosConGarantia = async () => {
  const query = `
    SELECT * FROM vw_activos_fijos_completa
    WHERE bgarantia = true 
      AND dfecha_hasta_garantia >= CURRENT_DATE
      AND bactivo = true
    ORDER BY dfecha_hasta_garantia ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// ✅ Obtener activos egresados (dados de baja)
const getActivosEgresados = async () => {
  const query = `
    SELECT * FROM vw_activos_fijos_completa
    WHERE begresado = true
    ORDER BY dfecha_egreso DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// ✅ Crear nuevo activo fijo
const createActivoFijo = async (activoData, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      INSERT INTO tbl_activos_fijos (
        vcodigo_activo,
        vdescripcion,
        iid_categoria,
        iid_proveedor,
        dcosto_adquisicion,
        dfecha_adquisicion,
        iid_ubicacion,
        iid_doctor_asignado,
        ivida_util_anios,
        dvalor_depreciacion_mensual,
        iid_tipo_instrumental,
        iid_marca,
        iid_modelo,
        vnumero_serie,
        iid_factura_compra,
        bgarantia,
        dfecha_desde_garantia,
        dfecha_hasta_garantia,
        iid_clase,
        iid_uso,
        iid_estado_fisico,
        iid_condicion,
        iid_estado_operativo
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *;
    `;

    const values = [
      activoData.vcodigo_activo || null, // Se auto-genera si es null
      activoData.vdescripcion || null,
      activoData.iid_categoria || null,
      activoData.iid_proveedor || null,
      activoData.dcosto_adquisicion || null,
      activoData.dfecha_adquisicion || null,
      activoData.iid_ubicacion || null,
      activoData.iid_doctor_asignado || null,
      activoData.ivida_util_anios || null,
      activoData.dvalor_depreciacion_mensual || null,
      activoData.iid_tipo_instrumental || null,
      activoData.iid_marca || null,
      activoData.iid_modelo || null,
      activoData.vnumero_serie || null,
      activoData.iid_factura_compra || null,
      activoData.bgarantia !== undefined ? activoData.bgarantia : false,
      activoData.dfecha_desde_garantia || null,
      activoData.dfecha_hasta_garantia || null,
      activoData.iid_clase || null,
      activoData.iid_uso || null,
      activoData.iid_estado_fisico || null,
      activoData.iid_condicion || null,
      activoData.iid_estado_operativo || 1 // Por defecto OPERATIVO
    ];

    const { rows } = await client.query(query, values);
    return rows[0];
  });
};

// ✅ Actualizar activo fijo
const updateActivoFijo = async (iid_activo, activoData, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      UPDATE tbl_activos_fijos
      SET 
        vcodigo_activo = $2,
        vdescripcion = $3,
        iid_categoria = $4,
        iid_proveedor = $5,
        dcosto_adquisicion = $6,
        dfecha_adquisicion = $7,
        iid_ubicacion = $8,
        iid_doctor_asignado = $9,
        ivida_util_anios = $10,
        dvalor_depreciacion_mensual = $11,
        iid_tipo_instrumental = $12,
        iid_marca = $13,
        iid_modelo = $14,
        vnumero_serie = $15,
        iid_factura_compra = $16,
        bgarantia = $17,
        dfecha_desde_garantia = $18,
        dfecha_hasta_garantia = $19,
        iid_clase = $20,
        iid_uso = $21,
        iid_estado_fisico = $22,
        iid_condicion = $23,
        iid_estado_operativo = $24
      WHERE iid_activo = $1
      RETURNING *;
    `;

    const values = [
      iid_activo,
      activoData.vcodigo_activo,
      activoData.vdescripcion,
      activoData.iid_categoria,
      activoData.iid_proveedor,
      activoData.dcosto_adquisicion,
      activoData.dfecha_adquisicion,
      activoData.iid_ubicacion,
      activoData.iid_doctor_asignado,
      activoData.ivida_util_anios,
      activoData.dvalor_depreciacion_mensual,
      activoData.iid_tipo_instrumental,
      activoData.iid_marca,
      activoData.iid_modelo,
      activoData.vnumero_serie,
      activoData.iid_factura_compra,
      activoData.bgarantia,
      activoData.dfecha_desde_garantia,
      activoData.dfecha_hasta_garantia,
      activoData.iid_clase,
      activoData.iid_uso,
      activoData.iid_estado_fisico,
      activoData.iid_condicion,
      activoData.iid_estado_operativo
    ];

    const { rows } = await client.query(query, values);
    return rows[0];
  });
};

// ✅ Eliminar activo fijo (borrado lógico)
const deleteActivoFijo = async (iid_activo, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      UPDATE tbl_activos_fijos
      SET bactivo = false
      WHERE iid_activo = $1
      RETURNING *;
    `;

    const { rows } = await client.query(query, [iid_activo]);
    return rows[0];
  });
};

// ✅ Dar de baja (egresar) un activo fijo
const egresarActivoFijo = async (iid_activo, motivoEgreso, usuarioAutoriza, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      UPDATE tbl_activos_fijos
      SET 
        begresado = true,
        dfecha_egreso = CURRENT_DATE,
        vmotivo_egreso = $2,
        vusuario_autoriza = $3,
        iid_estado_operativo = (SELECT iid_estado_operativo FROM tbl_estados_operativos WHERE vnombre_estado = 'DADO DE BAJA')
      WHERE iid_activo = $1
      RETURNING *;
    `;

    const { rows } = await client.query(query, [iid_activo, motivoEgreso, usuarioAutoriza]);
    return rows[0];
  });
};

// ✅ Cambiar estado operativo
const cambiarEstadoOperativo = async (iid_activo, iid_estado_operativo, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      UPDATE tbl_activos_fijos
      SET iid_estado_operativo = $2
      WHERE iid_activo = $1
      RETURNING *;
    `;

    const { rows } = await client.query(query, [iid_activo, iid_estado_operativo]);
    return rows[0];
  });
};

// ✅ Asignar activo a doctor
const asignarActivoDoctor = async (iid_activo, iid_doctor_asignado, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      UPDATE tbl_activos_fijos
      SET iid_doctor_asignado = $2
      WHERE iid_activo = $1
      RETURNING *;
    `;

    const { rows } = await client.query(query, [iid_activo, iid_doctor_asignado]);
    return rows[0];
  });
};

// ✅ Cambiar ubicación
const cambiarUbicacion = async (iid_activo, iid_ubicacion, req) => {
  return executeWithAudit(pool, req, async (client) => {
    const query = `
      UPDATE tbl_activos_fijos
      SET iid_ubicacion = $2
      WHERE iid_activo = $1
      RETURNING *;
    `;

    const { rows } = await client.query(query, [iid_activo, iid_ubicacion]);
    return rows[0];
  });
};

module.exports = {
  getAllActivosFijos,
  getActivoFijoById,
  getActivoFijoByCodigo,
  getActivosFijosByCategoria,
  getActivosFijosByUbicacion,
  getActivosFijosByEstado,
  getActivosFijosByDoctor,
  getActivosFijosByTipo,
  getActivosFijosByMarca,
  searchActivosFijos,
  getActivosConGarantia,
  getActivosEgresados,
  createActivoFijo,
  updateActivoFijo,
  deleteActivoFijo,
  egresarActivoFijo,
  cambiarEstadoOperativo,
  asignarActivoDoctor,
  cambiarUbicacion
};