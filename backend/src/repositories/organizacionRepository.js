const pool = require('../config/db');


// ======================================================
// VOLVER A SOLICITAR VERIFICACIÓN
// ======================================================

exports.solicitarNuevaVerificacion = async (idUsuario) => {

  const result = await pool.query(
    `
    UPDATE organizacion
    SET
      estado_verificacion = 'PENDIENTE',
      motivo_rechazo = NULL,
      actualizado_en = CURRENT_TIMESTAMP
    WHERE id_usuario = $1
      AND estado_verificacion = 'RECHAZADA'
    RETURNING
      id_organizacion,
      razon_social,
      estado_verificacion,
      motivo_rechazo
    `,
    [idUsuario]
  );

  return result.rows[0];

};


// ======================================================
// LISTAR ORGANIZACIONES DISPONIBLES PARA DONACIÓN
// ======================================================

exports.listarDisponiblesParaDonacion = async (
  filtros = {}
) => {

  const {
    nombre,
    idTipoActividad,
    latitud,
    longitud,
    radioBusquedaKm
  } = filtros;


  const valores = [];

  const condiciones = [
    `usr.estado_cuenta = 'ACTIVA'`,
    `o.estado_verificacion = 'VERIFICADA'`
  ];


  let selectDistancia = '';


  // ====================================================
  // FILTRO POR NOMBRE
  // ====================================================

  if (nombre) {

    valores.push(
      `%${nombre}%`
    );

    condiciones.push(
      `o.razon_social ILIKE $${valores.length}`
    );

  }


  // ====================================================
  // FILTRO POR TIPO DE ACTIVIDAD
  // ====================================================

  if (idTipoActividad != null) {

    valores.push(
      idTipoActividad
    );

    condiciones.push(`
      EXISTS (
        SELECT 1
        FROM organizacion_tipo_actividad ota_filtro
        WHERE ota_filtro.id_organizacion =
          o.id_organizacion
          AND ota_filtro.id_tipo_actividad =
            $${valores.length}
      )
    `);

  }


  // ====================================================
  // FILTRO POR UBICACIÓN Y RADIO
  // ====================================================

  if (
    latitud != null &&
    longitud != null &&
    radioBusquedaKm != null
  ) {

    valores.push(latitud);
    const indiceLatitud =
      valores.length;


    valores.push(longitud);
    const indiceLongitud =
      valores.length;


    valores.push(radioBusquedaKm);
    const indiceRadio =
      valores.length;


    const expresionDistancia = `
      (
        6371 * 2 * ASIN(
          SQRT(
            POWER(
              SIN(
                RADIANS(
                  ub.latitud -
                  $${indiceLatitud}
                ) / 2
              ),
              2
            )
            +
            COS(
              RADIANS(
                $${indiceLatitud}
              )
            )
            *
            COS(
              RADIANS(
                ub.latitud
              )
            )
            *
            POWER(
              SIN(
                RADIANS(
                  ub.longitud -
                  $${indiceLongitud}
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
      ub.latitud IS NOT NULL
      AND ub.longitud IS NOT NULL
      AND ${expresionDistancia}
        <= $${indiceRadio}
    `);

  }


  const query = `
    SELECT
      o.id_organizacion,
      o.razon_social,
      o.estado_verificacion,

      ub.latitud,
      ub.longitud,
      ub.localidad,
      ub.provincia,
      ub.es_aproximada

      ${selectDistancia},

      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id_tipo_actividad',
                ta.id_tipo_actividad,
              'nombre',
                ta.nombre
            )
            ORDER BY ta.nombre ASC
          )
          FROM organizacion_tipo_actividad ota
          INNER JOIN tipo_actividad ta
            ON ta.id_tipo_actividad =
              ota.id_tipo_actividad
          WHERE ota.id_organizacion =
            o.id_organizacion
        ),
        '[]'::json
      ) AS tipos_actividad

    FROM organizacion o

    INNER JOIN usuario usr
      ON usr.id_usuario =
        o.id_usuario

    LEFT JOIN ubicacion ub
      ON ub.id_ubicacion =
        o.id_ubicacion

    WHERE
      ${condiciones.join('\n AND ')}

    ORDER BY
      o.razon_social ASC
  `;


  const result =
    await pool.query(
      query,
      valores
    );


  return result.rows;

};


// ======================================================
// DETALLE DE ORGANIZACIÓN DISPONIBLE PARA DONACIÓN
// ======================================================

exports.obtenerDetalleDisponibleDonacion =
  async (idOrganizacion) => {

    const result =
      await pool.query(
        `
        SELECT
          o.id_organizacion,
          o.razon_social,
          o.estado_verificacion,

          ub.latitud,
          ub.longitud,
          ub.localidad,
          ub.provincia,
          ub.es_aproximada,

          p.nombre_visible,
          p.descripcion_publica,
          p.sitio_web_url,
          p.email_contacto_publico,
          p.telefono_contacto_publico,

          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id_tipo_actividad',
                  ta.id_tipo_actividad,
                  'nombre',
                  ta.nombre
                )
                ORDER BY ta.nombre ASC
              )
              FROM organizacion_tipo_actividad ota
              INNER JOIN tipo_actividad ta
                ON ta.id_tipo_actividad =
                  ota.id_tipo_actividad
              WHERE ota.id_organizacion =
                o.id_organizacion
            ),
            '[]'::json
          ) AS tipos_actividad

        FROM organizacion o

        INNER JOIN usuario u
          ON u.id_usuario =
            o.id_usuario

        LEFT JOIN ubicacion ub
          ON ub.id_ubicacion =
            o.id_ubicacion

        LEFT JOIN perfil_publico_organizacion p
          ON p.id_organizacion =
            o.id_organizacion
          AND p.estado_publicacion =
            'PUBLICADO'

        WHERE o.id_organizacion = $1

          AND u.estado_cuenta =
            'ACTIVA'

          AND o.estado_verificacion =
            'VERIFICADA'
        `,
        [
          idOrganizacion
        ]
      );


    return result.rows[0];

  };