const pool = require('../config/db');


// ======================================================
// OBTENER HISTORIAL DE PARTICIPACIÓN POR TIPO
// ======================================================

const obtenerHistorialPorTipo = async (
  idVoluntario
) => {

  const result = await pool.query(
    `
    SELECT
      o.id_tipo_actividad,

      SUM(
        CASE
          WHEN i.estado = 'COMPLETADA'
            THEN 6
          WHEN i.estado = 'ACEPTADA'
            THEN 4
          WHEN i.estado = 'PENDIENTE'
            THEN 1
          ELSE 0
        END
      )::int AS puntaje_historial

    FROM inscripcion i

    INNER JOIN oportunidad o
      ON o.id_oportunidad =
        i.id_oportunidad

    WHERE i.id_voluntario = $1

    GROUP BY
      o.id_tipo_actividad
    `,
    [idVoluntario]
  );


  return result.rows;

};


// ======================================================
// OBTENER OPORTUNIDADES CANDIDATAS
// ======================================================

const obtenerOportunidadesCandidatas =
  async (
    idVoluntario,
    ubicacion = null
  ) => {

    const valores = [
      idVoluntario
    ];

    const condiciones = [

      `o.estado = 'PUBLICADA'`,

      `o.fecha_inicio > NOW()`,

      `o.eliminado_en IS NULL`,

      `
      NOT EXISTS (
        SELECT 1
        FROM inscripcion i_vol
        WHERE
          i_vol.id_oportunidad =
            o.id_oportunidad
          AND
          i_vol.id_voluntario = $1
      )
      `,

      `
      (
        SELECT COUNT(*)::int
        FROM inscripcion i_cupo
        WHERE
          i_cupo.id_oportunidad =
            o.id_oportunidad
          AND
          i_cupo.estado = 'ACEPTADA'
      ) < o.cupo_total
      `
    ];


    let selectDistancia = '';


    // ==================================================
    // FILTRO GEOGRÁFICO OPCIONAL
    // ==================================================

    if (
      ubicacion &&
      ubicacion.latitud != null &&
      ubicacion.longitud != null &&
      ubicacion.radioKm != null
    ) {

      valores.push(
        ubicacion.latitud
      );

      const indiceLatitud =
        valores.length;


      valores.push(
        ubicacion.longitud
      );

      const indiceLongitud =
        valores.length;


      valores.push(
        ubicacion.radioKm
      );

      const indiceRadio =
        valores.length;


      const expresionDistancia = `
        (
          6371 * 2 * ASIN(
            SQRT(
              POWER(
                SIN(
                  RADIANS(
                    u.latitud -
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
                  u.latitud
                )
              )
              *
              POWER(
                SIN(
                  RADIANS(
                    u.longitud -
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
        u.latitud IS NOT NULL
        AND u.longitud IS NOT NULL
        AND ${expresionDistancia}
          <= $${indiceRadio}
      `);

    }


    const query = `
      SELECT
        o.id_oportunidad,
        o.id_tipo_actividad,
        o.titulo,
        o.descripcion,
        o.fecha_inicio,
        o.fecha_fin,
        o.urgencia,
        o.cupo_total,

        ta.nombre AS tipo_actividad,

        org.razon_social
          AS organizacion,

        u.latitud,
        u.longitud,
        u.localidad,
        u.provincia,
        u.es_aproximada

        ${selectDistancia},

        (
          SELECT COUNT(*)::int
          FROM inscripcion i
          WHERE
            i.id_oportunidad =
              o.id_oportunidad
            AND
            i.estado = 'ACEPTADA'
        ) AS cupos_ocupados,

        GREATEST(
          o.cupo_total -
          (
            SELECT COUNT(*)::int
            FROM inscripcion i
            WHERE
              i.id_oportunidad =
                o.id_oportunidad
              AND
              i.estado = 'ACEPTADA'
          ),
          0
        ) AS cupos_disponibles

      FROM oportunidad o

      INNER JOIN tipo_actividad ta
        ON ta.id_tipo_actividad =
          o.id_tipo_actividad

      INNER JOIN organizacion org
        ON org.id_organizacion =
          o.id_organizacion

      LEFT JOIN ubicacion u
        ON u.id_ubicacion =
          o.id_ubicacion

      WHERE
        ${condiciones.join('\n AND ')}

      ORDER BY
        o.fecha_inicio ASC
    `;


    const result =
      await pool.query(
        query,
        valores
      );


    return result.rows;

  };


module.exports = {
  obtenerHistorialPorTipo,
  obtenerOportunidadesCandidatas
};