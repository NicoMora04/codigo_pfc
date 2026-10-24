const pool = require('../config/db');


// ======================================================
// RESUMEN GENERAL DE LA ORGANIZACIÓN
// ACTIVIDAD 3.4.1
// ======================================================

exports.obtenerResumenOrganizacion = async (
  idOrganizacion
) => {

  const result = await pool.query(
    `
    SELECT

      -- Oportunidades actualmente publicadas
      (
        SELECT COUNT(*)::int
        FROM oportunidad o
        WHERE o.id_organizacion = $1
            AND o.estado = 'PUBLICADA'
            AND o.fecha_fin >= NOW()
            AND o.eliminado_en IS NULL
      ) AS oportunidades_activas,


      -- Todas las inscripciones recibidas
      (
        SELECT COUNT(*)::int
        FROM inscripcion i
        INNER JOIN oportunidad o
          ON o.id_oportunidad = i.id_oportunidad
        WHERE o.id_organizacion = $1
          AND o.eliminado_en IS NULL
      ) AS inscripciones_recibidas,


      -- Participaciones efectivamente completadas
      (
        SELECT COUNT(*)::int
        FROM inscripcion i
        INNER JOIN oportunidad o
          ON o.id_oportunidad = i.id_oportunidad
        WHERE o.id_organizacion = $1
          AND o.eliminado_en IS NULL
          AND i.estado = 'COMPLETADA'
      ) AS participaciones_completadas,


      -- Donaciones que llegaron efectivamente a la organización
      (
        SELECT COUNT(*)::int
        FROM donacion d
        WHERE d.id_organizacion = $1
          AND d.estado = 'RECIBIDA'
      ) AS donaciones_recibidas
    `,
    [idOrganizacion]
  );

  return result.rows[0];

};


// ======================================================
// ESTADÍSTICAS GENERALES DE OPORTUNIDADES
// ======================================================

exports.obtenerResumenOportunidades = async (
  idOrganizacion
) => {

  const result = await pool.query(
    `
    SELECT

      COUNT(*)::int AS total_oportunidades,

      COALESCE(
        ROUND(
          AVG(inscripciones.cantidad)::numeric,
          2
        ),
        0
      ) AS promedio_inscripciones

    FROM oportunidad o

    LEFT JOIN LATERAL (
      SELECT COUNT(*)::int AS cantidad
      FROM inscripcion i
      WHERE i.id_oportunidad = o.id_oportunidad
    ) inscripciones ON TRUE

    WHERE o.id_organizacion = $1
      AND o.eliminado_en IS NULL
      AND o.estado IN (
        'PUBLICADA',
        'CERRADA',
        'FINALIZADA'
        )
    `,
    [idOrganizacion]
  );

  return result.rows[0];

};


// ======================================================
// TOP DE OPORTUNIDADES POR PARTICIPACIÓN
// ======================================================

exports.obtenerTopOportunidades = async (
  idOrganizacion,
  limite = 5
) => {

  const result = await pool.query(
    `
    SELECT
      o.id_oportunidad,
      o.titulo,
      o.estado,
      o.cupo_total,

      COUNT(i.id_inscripcion)::int
        AS total_inscripciones,

      COUNT(i.id_inscripcion)
        FILTER (
          WHERE i.estado = 'COMPLETADA'
        )::int
        AS participaciones_completadas

    FROM oportunidad o

    LEFT JOIN inscripcion i
      ON i.id_oportunidad = o.id_oportunidad

    WHERE o.id_organizacion = $1
        AND o.eliminado_en IS NULL
        AND o.estado IN (
            'CERRADA',
            'FINALIZADA'
        )

    GROUP BY
      o.id_oportunidad,
      o.titulo,
      o.estado,
      o.cupo_total

    HAVING
        COUNT(i.id_inscripcion)
            FILTER (
            WHERE i.estado = 'COMPLETADA'
            ) > 0

    ORDER BY
      participaciones_completadas DESC,
      total_inscripciones DESC,
      o.titulo ASC

    LIMIT $2
    `,
    [
      idOrganizacion,
      limite
    ]
  );

  return result.rows;

};


// ======================================================
// OCUPACIÓN DE CUPOS POR OPORTUNIDAD
// ======================================================

exports.obtenerOcupacionOportunidades = async (
  idOrganizacion
) => {

  const result = await pool.query(
    `
    SELECT
      o.id_oportunidad,
      o.titulo,
      o.estado,
      o.cupo_total,

      COUNT(i.id_inscripcion)
        FILTER (
          WHERE i.estado IN (
            'ACEPTADA',
            'COMPLETADA',
            'AUSENTE'
          )
        )::int AS voluntarios_aceptados,

      ROUND(
        (
          COUNT(i.id_inscripcion)
            FILTER (
              WHERE i.estado IN (
                'ACEPTADA',
                'COMPLETADA',
                'AUSENTE'
              )
            )::numeric
          /
          NULLIF(
            o.cupo_total,
            0
          )
        ) * 100,
        2
      ) AS porcentaje_ocupacion

    FROM oportunidad o

    LEFT JOIN inscripcion i
      ON i.id_oportunidad = o.id_oportunidad

    WHERE o.id_organizacion = $1
        AND o.eliminado_en IS NULL
        AND (
        o.estado IN (
            'CERRADA',
            'FINALIZADA'
        )
        OR (
            o.estado = 'PUBLICADA'
            AND o.fecha_fin >= NOW()
        )
        )

    GROUP BY
      o.id_oportunidad,
      o.titulo,
      o.estado,
      o.cupo_total

    ORDER BY
    porcentaje_ocupacion DESC,
    o.titulo ASC

    LIMIT 5
    `,
    [idOrganizacion]
  );

  return result.rows;

};


// ======================================================
// DISTRIBUCIÓN DE INSCRIPCIONES POR ESTADO
// ======================================================

exports.obtenerInscripcionesPorEstado = async (
  idOrganizacion
) => {

  const result = await pool.query(
    `
    SELECT
      i.estado,
      COUNT(*)::int AS cantidad

    FROM inscripcion i

    INNER JOIN oportunidad o
      ON o.id_oportunidad = i.id_oportunidad

    WHERE o.id_organizacion = $1
      AND o.eliminado_en IS NULL

    GROUP BY i.estado

    ORDER BY i.estado ASC
    `,
    [idOrganizacion]
  );

  return result.rows;

};


// ======================================================
// TASAS Y TIEMPO DE RESPUESTA DE INSCRIPCIONES
// ======================================================

exports.obtenerMetricasInscripciones = async (
  idOrganizacion
) => {

  const result = await pool.query(
    `
    SELECT

      COUNT(*)::int AS total_inscripciones,


      -- Se consideran aceptadas también las que luego
      -- finalizaron como COMPLETADA o AUSENTE.
      (
        COUNT(*)
        FILTER (
          WHERE i.estado IN (
            'ACEPTADA',
            'COMPLETADA',
            'AUSENTE'
          )
        )
      )::int AS total_aceptadas,


      (
        COUNT(*)
        FILTER (
          WHERE i.estado = 'COMPLETADA'
        )
      )::int AS total_completadas,


      (
        COUNT(*)
        FILTER (
          WHERE i.estado = 'AUSENTE'
        )
      )::int AS total_ausentes,


      -- Tasa de aceptación:
      -- aceptadas / decisiones de la organización.
      --
      -- Se excluyen PENDIENTE y CANCELADA porque
      -- no representan necesariamente una decisión
      -- tomada por la organización.
      COALESCE(
        ROUND(
          (
            COUNT(*)
            FILTER (
              WHERE i.estado IN (
                'ACEPTADA',
                'COMPLETADA',
                'AUSENTE'
              )
            )
          )::numeric
          /
          NULLIF(
            COUNT(*)
            FILTER (
              WHERE i.estado IN (
                'ACEPTADA',
                'COMPLETADA',
                'AUSENTE',
                'RECHAZADA'
              )
            ),
            0
          )
          * 100,
          2
        ),
        0
      ) AS tasa_aceptacion,


      -- Participación efectiva:
      -- COMPLETADA / (COMPLETADA + AUSENTE)
      COALESCE(
        ROUND(
          (
            COUNT(*)
            FILTER (
              WHERE i.estado = 'COMPLETADA'
            )
          )::numeric
          /
          NULLIF(
            COUNT(*)
            FILTER (
              WHERE i.estado IN (
                'COMPLETADA',
                'AUSENTE'
              )
            ),
            0
          )
          * 100,
          2
        ),
        0
      ) AS tasa_participacion,


      -- Tiempo promedio entre inscripción y respuesta.
      -- Se expresa en horas.
      COALESCE(
        ROUND(
          AVG(
            EXTRACT(
              EPOCH FROM (
                i.respondida_en -
                i.inscrita_en
              )
            ) / 3600
          )
          FILTER (
            WHERE i.respondida_en IS NOT NULL
          )::numeric,
          2
        ),
        0
      ) AS tiempo_promedio_respuesta_horas

    FROM inscripcion i

    INNER JOIN oportunidad o
      ON o.id_oportunidad = i.id_oportunidad

    WHERE o.id_organizacion = $1
      AND o.eliminado_en IS NULL
    `,
    [idOrganizacion]
  );

  return result.rows[0];

};


// ======================================================
// DISTRIBUCIÓN DE DONACIONES POR ESTADO
// ======================================================

exports.obtenerDonacionesPorEstado = async (
  idOrganizacion
) => {

  const result = await pool.query(
    `
    SELECT
      d.estado,
      COUNT(*)::int AS cantidad

    FROM donacion d

    WHERE d.id_organizacion = $1

    GROUP BY d.estado

    ORDER BY d.estado ASC
    `,
    [idOrganizacion]
  );

  return result.rows;

};


// ======================================================
// MÉTRICAS GENERALES DE DONACIONES
// ======================================================

exports.obtenerMetricasDonaciones = async (
  idOrganizacion
) => {

  const result = await pool.query(
    `
    SELECT

      COUNT(*)::int
        AS total_ofertas,

      (
        COUNT(*)
        FILTER (
          WHERE estado = 'RECIBIDA'
        )
      )::int
        AS total_recibidas,

      COALESCE(
        ROUND(
          (
            COUNT(*)
            FILTER (
              WHERE estado = 'RECIBIDA'
            )
          )::numeric
          /
          NULLIF(
            COUNT(*),
            0
          )
          * 100,
          2
        ),
        0
      ) AS tasa_concrecion

    FROM donacion

    WHERE id_organizacion = $1
    `,
    [idOrganizacion]
  );

  return result.rows[0];

};


// ======================================================
// DONACIONES POR CATEGORÍA
// ======================================================

exports.obtenerDonacionesPorCategoria = async (
  idOrganizacion
) => {

  const result = await pool.query(
    `
    SELECT
      cd.id_categoria_donacion,
      cd.nombre AS categoria,

      COUNT(d.id_donacion)::int
        AS cantidad

    FROM categoria_donacion cd

    INNER JOIN donacion d
      ON d.id_categoria_donacion =
        cd.id_categoria_donacion

    WHERE d.id_organizacion = $1

    GROUP BY
      cd.id_categoria_donacion,
      cd.nombre

    ORDER BY
      cantidad DESC,
      cd.nombre ASC
    `,
    [idOrganizacion]
  );

  return result.rows;

};

// ======================================================
// RESUMEN GLOBAL DEL SISTEMA
// ACTIVIDAD 3.4.2
// ======================================================

exports.obtenerResumenGlobal = async () => {

  const result =
    await pool.query(
      `
      SELECT

        -- Usuarios funcionales de la plataforma.
        -- Se excluye ADMIN porque no representa
        -- participación en el sistema.
        (
          SELECT COUNT(*)::int
          FROM usuario
          WHERE rol IN (
            'VOLUNTARIO',
            'ORGANIZACION'
          )
        ) AS total_usuarios,


        (
          SELECT COUNT(*)::int
          FROM organizacion
        ) AS total_organizaciones,


        -- Oportunidades registradas y no eliminadas
        (
          SELECT COUNT(*)::int
          FROM oportunidad
          WHERE eliminado_en IS NULL
        ) AS total_oportunidades,


        (
          SELECT COUNT(*)::int
          FROM inscripcion
        ) AS total_inscripciones,


        (
          SELECT COUNT(*)::int
          FROM donacion
        ) AS total_donaciones
      `
    );


  return result.rows[0];

};


// ======================================================
// DISTRIBUCIÓN DE USUARIOS POR ROL
// ======================================================

exports.obtenerUsuariosPorRol = async () => {

  const result =
    await pool.query(
      `
      SELECT
        rol,
        COUNT(*)::int AS cantidad

      FROM usuario

      WHERE rol IN (
        'VOLUNTARIO',
        'ORGANIZACION'
      )

      GROUP BY rol

      ORDER BY rol ASC
      `
    );


  return result.rows;

};


// ======================================================
// ORGANIZACIONES POR ESTADO DE VERIFICACIÓN
// ======================================================

exports.obtenerOrganizacionesPorEstado = async () => {

  const result =
    await pool.query(
      `
      SELECT
        estado_verificacion AS estado,
        COUNT(*)::int AS cantidad

      FROM organizacion

      GROUP BY estado_verificacion

      ORDER BY estado_verificacion ASC
      `
    );


  return result.rows;

};


// ======================================================
// OPORTUNIDADES POR ESTADO
// ======================================================

exports.obtenerOportunidadesGlobalesPorEstado =
  async () => {

    const result =
      await pool.query(
        `
        SELECT
          estado,
          COUNT(*)::int AS cantidad

        FROM oportunidad

        WHERE eliminado_en IS NULL

        GROUP BY estado

        ORDER BY estado ASC
        `
      );


    return result.rows;

  };


// ======================================================
// INSCRIPCIONES POR ESTADO
// ======================================================

exports.obtenerInscripcionesGlobalesPorEstado =
  async () => {

    const result =
      await pool.query(
        `
        SELECT
          estado,
          COUNT(*)::int AS cantidad

        FROM inscripcion

        GROUP BY estado

        ORDER BY estado ASC
        `
      );


    return result.rows;

  };


// ======================================================
// DONACIONES POR ESTADO
// ======================================================

exports.obtenerDonacionesGlobalesPorEstado =
  async () => {

    const result =
      await pool.query(
        `
        SELECT
          estado,
          COUNT(*)::int AS cantidad

        FROM donacion

        GROUP BY estado

        ORDER BY estado ASC
        `
      );


    return result.rows;

  };


// ======================================================
// MÉTRICAS GLOBALES DE PARTICIPACIÓN
// ======================================================

exports.obtenerMetricasGlobalesParticipacion =
  async () => {

    const result =
      await pool.query(
        `
        SELECT

          COUNT(*)::int
            AS total_inscripciones,


          (
            COUNT(*)
            FILTER (
              WHERE estado IN (
                'ACEPTADA',
                'COMPLETADA',
                'AUSENTE'
              )
            )
          )::int
            AS total_aceptadas,


          (
            COUNT(*)
            FILTER (
              WHERE estado = 'COMPLETADA'
            )
          )::int
            AS total_completadas,


          (
            COUNT(*)
            FILTER (
              WHERE estado = 'AUSENTE'
            )
          )::int
            AS total_ausentes,


          -- Aceptadas /
          -- (aceptadas + rechazadas)
          COALESCE(
            ROUND(
              (
                COUNT(*)
                FILTER (
                  WHERE estado IN (
                    'ACEPTADA',
                    'COMPLETADA',
                    'AUSENTE'
                  )
                )
              )::numeric
              /
              NULLIF(
                COUNT(*)
                FILTER (
                  WHERE estado IN (
                    'ACEPTADA',
                    'COMPLETADA',
                    'AUSENTE',
                    'RECHAZADA'
                  )
                ),
                0
              )
              * 100,
              2
            ),
            0
          ) AS tasa_aceptacion,


          -- Completadas /
          -- (completadas + ausentes)
          COALESCE(
            ROUND(
              (
                COUNT(*)
                FILTER (
                  WHERE estado = 'COMPLETADA'
                )
              )::numeric
              /
              NULLIF(
                COUNT(*)
                FILTER (
                  WHERE estado IN (
                    'COMPLETADA',
                    'AUSENTE'
                  )
                ),
                0
              )
              * 100,
              2
            ),
            0
          ) AS tasa_participacion

        FROM inscripcion
        `
      );


    return result.rows[0];

  };


// ======================================================
// MÉTRICAS GLOBALES DE DONACIONES
// ======================================================

exports.obtenerMetricasGlobalesDonaciones =
  async () => {

    const result =
      await pool.query(
        `
        SELECT

          COUNT(*)::int
            AS total_ofertas,


          (
            COUNT(*)
            FILTER (
              WHERE estado = 'RECIBIDA'
            )
          )::int
            AS total_recibidas,


          COALESCE(
            ROUND(
              (
                COUNT(*)
                FILTER (
                  WHERE estado = 'RECIBIDA'
                )
              )::numeric
              /
              NULLIF(
                COUNT(*),
                0
              )
              * 100,
              2
            ),
            0
          ) AS tasa_concrecion

        FROM donacion
        `
      );


    return result.rows[0];

  };


// ======================================================
// TOP ORGANIZACIONES POR OPORTUNIDADES
// ======================================================

exports.obtenerTopOrganizacionesPorOportunidades =
  async (
    limite = 5
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          o.id_organizacion,
          o.razon_social,

          COUNT(op.id_oportunidad)::int
            AS total_oportunidades

        FROM organizacion o

        INNER JOIN oportunidad op
          ON op.id_organizacion =
            o.id_organizacion

        WHERE op.eliminado_en IS NULL

        GROUP BY
          o.id_organizacion,
          o.razon_social

        HAVING
          COUNT(op.id_oportunidad) > 0

        ORDER BY
          total_oportunidades DESC,
          o.razon_social ASC

        LIMIT $1
        `,
        [limite]
      );


    return result.rows;

  };


// ======================================================
// TOP ORGANIZACIONES POR PARTICIPACIONES COMPLETADAS
// ======================================================

exports.obtenerTopOrganizacionesPorParticipacion =
  async (
    limite = 5
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          org.id_organizacion,
          org.razon_social,

          COUNT(i.id_inscripcion)::int
            AS participaciones_completadas

        FROM organizacion org

        INNER JOIN oportunidad op
          ON op.id_organizacion =
            org.id_organizacion

        INNER JOIN inscripcion i
          ON i.id_oportunidad =
            op.id_oportunidad

        WHERE op.eliminado_en IS NULL
          AND i.estado = 'COMPLETADA'

        GROUP BY
          org.id_organizacion,
          org.razon_social

        HAVING
          COUNT(i.id_inscripcion) > 0

        ORDER BY
          participaciones_completadas DESC,
          org.razon_social ASC

        LIMIT $1
        `,
        [limite]
      );


    return result.rows;

  };


// ======================================================
// TOP ORGANIZACIONES POR DONACIONES RECIBIDAS
// ======================================================

exports.obtenerTopOrganizacionesPorDonaciones =
  async (
    limite = 5
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          org.id_organizacion,
          org.razon_social,

          COUNT(d.id_donacion)::int
            AS donaciones_recibidas

        FROM organizacion org

        INNER JOIN donacion d
          ON d.id_organizacion =
            org.id_organizacion

        WHERE d.estado = 'RECIBIDA'

        GROUP BY
          org.id_organizacion,
          org.razon_social

        HAVING
          COUNT(d.id_donacion) > 0

        ORDER BY
          donaciones_recibidas DESC,
          org.razon_social ASC

        LIMIT $1
        `,
        [limite]
      );


    return result.rows;

  };


// ======================================================
// TOP VOLUNTARIOS POR OPORTUNIDADES COMPLETADAS
// ======================================================

exports.obtenerTopVoluntariosPorParticipacion =
  async (
    limite = 5
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          pv.id_usuario
            AS id_voluntario,

          pv.nombre,
          pv.apellido,

          COUNT(i.id_inscripcion)::int
            AS oportunidades_completadas

        FROM perfil_voluntario pv

        INNER JOIN inscripcion i
          ON i.id_voluntario =
            pv.id_usuario

        INNER JOIN oportunidad o
          ON o.id_oportunidad =
            i.id_oportunidad

        WHERE i.estado = 'COMPLETADA'
          AND o.eliminado_en IS NULL

        GROUP BY
          pv.id_usuario,
          pv.nombre,
          pv.apellido

        HAVING
          COUNT(i.id_inscripcion) > 0

        ORDER BY
          oportunidades_completadas DESC,
          pv.apellido ASC,
          pv.nombre ASC

        LIMIT $1
        `,
        [limite]
      );


    return result.rows;

  };