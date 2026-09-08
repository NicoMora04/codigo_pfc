const pool = require('../config/db');


// ======================================================
// CREAR OPORTUNIDAD
// ======================================================

exports.crearOportunidad = async (datos) => {

  const {
    idOrganizacion,
    idTipoActividad,
    idUbicacion,
    titulo,
    descripcion,
    requisitos,
    cupoTotal,
    fechaInicio,
    fechaFin,
    urgencia,
    estado,
    tipoUbicacion,
    radioKm
  } = datos;

  const result = await pool.query(
    `
    INSERT INTO oportunidad (
      id_organizacion,
      id_tipo_actividad,
      id_ubicacion,
      titulo,
      descripcion,
      requisitos,
      cupo_total,
      fecha_inicio,
      fecha_fin,
      urgencia,
      estado,
      tipo_ubicacion,
      radio_km
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13
    )
    RETURNING *
    `,
    [
      idOrganizacion,
      idTipoActividad,
      idUbicacion,
      titulo,
      descripcion,
      requisitos,
      cupoTotal,
      fechaInicio,
      fechaFin,
      urgencia,
      estado,
      tipoUbicacion,
      radioKm
    ]
  );

  return result.rows[0];

};


exports.existeTipoActividad = async (idTipoActividad) => {

  const result = await pool.query(
    `
    SELECT id_tipo_actividad
    FROM tipo_actividad
    WHERE id_tipo_actividad = $1
    `,
    [idTipoActividad]
  );

  return result.rows.length > 0;
};

exports.existeUbicacion = async (idUbicacion) => {

  const result = await pool.query(
    `
    SELECT id_ubicacion
    FROM ubicacion
    WHERE id_ubicacion = $1
    `,
    [idUbicacion]
  );

  return result.rows.length > 0;
};


// ======================================================
// BUSCAR OPORTUNIDAD POR ID
// ======================================================

exports.buscarOportunidadPorId = async (idOportunidad) => {

 const result = await pool.query(
    `
    SELECT
      o.*,
      ta.nombre AS tipo_actividad,
      u.latitud,
      u.longitud,
      u.localidad,
      u.provincia,
      u.es_aproximada,
      u.direccion
    FROM oportunidad o
    JOIN tipo_actividad ta
      ON ta.id_tipo_actividad = o.id_tipo_actividad
    LEFT JOIN ubicacion u
      ON u.id_ubicacion = o.id_ubicacion
    WHERE o.id_oportunidad = $1
    `,
    [idOportunidad]
  );

  return result.rows[0];
};


// ======================================================
// ACTUALIZAR OPORTUNIDAD
// ======================================================

exports.actualizarOportunidad = async (idOportunidad, datos) => {

  const {
    idTipoActividad,
    idUbicacion,
    titulo,
    descripcion,
    requisitos,
    cupoTotal,
    fechaInicio,
    fechaFin,
    urgencia,
    tipoUbicacion,
    radioKm
  } = datos;

  const result = await pool.query(
    `
    UPDATE oportunidad
    SET
      id_tipo_actividad = $1,
      id_ubicacion = $2,
      titulo = $3,
      descripcion = $4,
      requisitos = $5,
      cupo_total = $6,
      fecha_inicio = $7,
      fecha_fin = $8,
      urgencia = $9,
      tipo_ubicacion = $10,
      radio_km = $11,
      actualizado_en = CURRENT_TIMESTAMP
    WHERE id_oportunidad = $12
    RETURNING *
    `,
    [
      idTipoActividad,
      idUbicacion,
      titulo,
      descripcion,
      requisitos,
      cupoTotal,
      fechaInicio,
      fechaFin,
      urgencia,
      tipoUbicacion,
      radioKm,
      idOportunidad
    ]
  );

  return result.rows[0];
};


// ======================================================
// CANCELAR OPORTUNIDAD
// ======================================================

exports.cancelarOportunidad = async (idOportunidad) => {

  const result = await pool.query(
    `
    UPDATE oportunidad
    SET
      estado = 'CANCELADA',
      actualizado_en = CURRENT_TIMESTAMP
    WHERE id_oportunidad = $1
    RETURNING *
    `,
    [idOportunidad]
  );

  return result.rows[0];
};

// ======================================================
// PUBLICAR OPORTUNIDAD
// ======================================================

exports.publicarOportunidad = async (idOportunidad) => {

  const result = await pool.query(
    `
    UPDATE oportunidad
    SET
      estado = 'PUBLICADA',
      actualizado_en = CURRENT_TIMESTAMP
    WHERE id_oportunidad = $1
    RETURNING *
    `,
    [idOportunidad]
  );

  return result.rows[0];
};


exports.buscarOportunidadesPorOrganizacion = async (
  idOrganizacion
) => {

  const result = await pool.query(
    `
    SELECT
      o.*,
      ta.nombre AS tipo_actividad,
      u.latitud,
      u.longitud,
      u.localidad,
      u.provincia,
      u.es_aproximada,
      u.direccion
    FROM oportunidad o
    INNER JOIN tipo_actividad ta
      ON ta.id_tipo_actividad = o.id_tipo_actividad
    LEFT JOIN ubicacion u
      ON u.id_ubicacion = o.id_ubicacion
    WHERE o.id_organizacion = $1
    ORDER BY o.creado_en DESC
    `,
    [idOrganizacion]
  );

  return result.rows;
};


exports.cerrarOportunidad = async (
  idOportunidad
) => {

  const result = await pool.query(
    `
    UPDATE oportunidad
    SET
      estado = 'CERRADA',
      actualizado_en = now()
    WHERE id_oportunidad = $1
    RETURNING *
    `,
    [idOportunidad]
  );

  return result.rows[0];
};


exports.finalizarOportunidad = async (
  idOportunidad
) => {

  const result = await pool.query(
    `
    UPDATE oportunidad
    SET
      estado = 'FINALIZADA',
      actualizado_en = now()
    WHERE id_oportunidad = $1
    RETURNING *
    `,
    [idOportunidad]
  );

  return result.rows[0];
};


exports.buscarOportunidadesPublicadas = async (filtros = {}) => {

  const {
    nombre,
    tipoActividad,
    urgencia,
    fecha,
    latitud,
    longitud,
    radioBusquedaKm
  } = filtros;

  const valores = [];

  const condiciones = [
    `o.estado = 'PUBLICADA'`,
    `o.fecha_fin >= NOW()`
  ];

  let selectDistancia = '';
  // FILTRO: NOMBRE DE OPORTUNIDAD
  if (nombre != null) {

      valores.push(`%${nombre}%`);

      condiciones.push(
        `o.titulo ILIKE $${valores.length}`
      );
  }

  // FILTRO: TIPO DE ACTIVIDAD
  if (tipoActividad != null) {

    valores.push(tipoActividad);

    condiciones.push(
      `o.id_tipo_actividad = $${valores.length}`
    );
  }

  // FILTRO: URGENCIA
  if (urgencia != null) {

    valores.push(urgencia);

    condiciones.push(
      `o.urgencia = $${valores.length}`
    );
  }

  // FILTRO: FECHA
  if (fecha != null) {

    valores.push(fecha);
    const indiceFecha = valores.length;

    condiciones.push(`
      o.fecha_inicio < ($${indiceFecha}::date + INTERVAL '1 day')
      AND o.fecha_fin >= $${indiceFecha}::date
    `);
  }

  // FILTRO: UBICACIÓN Y RADIO DE BÚSQUEDA
  if (
    latitud != null &&
    longitud != null &&
    radioBusquedaKm != null
  ) {

    valores.push(latitud);
    const indiceLatitud = valores.length;

    valores.push(longitud);
    const indiceLongitud = valores.length;

    valores.push(radioBusquedaKm);
    const indiceRadio = valores.length;

    const expresionDistancia = `
      (
        6371 * 2 * ASIN(
          SQRT(
            POWER(
              SIN(
                RADIANS(
                  u.latitud - $${indiceLatitud}
                ) / 2
              ),
              2
            )
            +
            COS(RADIANS($${indiceLatitud}))
            * COS(RADIANS(u.latitud))
            * POWER(
                SIN(
                  RADIANS(
                    u.longitud - $${indiceLongitud}
                  ) / 2
                ),
                2
              )
          )
        )
      )
    `;

    selectDistancia = `,
      ROUND(
        (${expresionDistancia})::numeric,
        2
      ) AS distancia_km
    `;

    condiciones.push(`
      u.latitud IS NOT NULL
      AND u.longitud IS NOT NULL
      AND ${expresionDistancia} <= $${indiceRadio}
    `);
  }

  const query = `
    SELECT
      o.*,
      ta.nombre AS tipo_actividad,
      org.razon_social AS organizacion,
      u.latitud,
      u.longitud,
      u.localidad,
      u.provincia,
      u.es_aproximada,
      u.direccion
      ${selectDistancia}
    FROM oportunidad o
    INNER JOIN tipo_actividad ta
      ON ta.id_tipo_actividad = o.id_tipo_actividad
    INNER JOIN organizacion org
      ON org.id_organizacion = o.id_organizacion
    LEFT JOIN ubicacion u
      ON u.id_ubicacion = o.id_ubicacion
    WHERE ${condiciones.join('\n AND ')}
    ORDER BY o.fecha_inicio ASC
  `;

  const result = await pool.query(
    query,
    valores
  );

  return result.rows;
};



// ======================================================
// OBTENER DETALLE DE OPORTUNIDAD PARA VOLUNTARIO
// ======================================================

exports.buscarOportunidadPublicadaPorId = async (
  idOportunidad
) => {

  const result = await pool.query(
    `
    SELECT
      o.*,
      ta.nombre AS tipo_actividad,
      org.razon_social AS organizacion,
      u.latitud,
      u.longitud,
      u.localidad,
      u.provincia,
      u.es_aproximada,
      u.direccion
    FROM oportunidad o
    INNER JOIN tipo_actividad ta
      ON ta.id_tipo_actividad = o.id_tipo_actividad
    INNER JOIN organizacion org
      ON org.id_organizacion = o.id_organizacion
    LEFT JOIN ubicacion u
      ON u.id_ubicacion = o.id_ubicacion
    WHERE o.id_oportunidad = $1
      AND o.estado = 'PUBLICADA'
      AND o.fecha_fin >= NOW()
    `,
    [idOportunidad]
  );

  return result.rows[0] || null;
};