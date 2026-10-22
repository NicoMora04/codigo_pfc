const pool = require('../config/db');


// ======================================================
// CREAR NOTIFICACIÓN
// ACTIVIDAD 3.3.1
// ======================================================

const crear = async (
  idUsuario,
  titulo,
  mensaje,
  tipo
) => {

  const query = `
    INSERT INTO notificacion (
      id_usuario,
      titulo,
      mensaje,
      tipo
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const { rows } = await pool.query(
    query,
    [
      idUsuario,
      titulo,
      mensaje,
      tipo
    ]
  );

  return rows[0];

};


/// ======================================================
// LISTAR NOTIFICACIONES CON ESTADO DE OPORTUNIDAD
// ACTIVIDAD 3.3.1
// ======================================================

const listarPorUsuario = async (
  idUsuario,
  limite = 30,
  offset = 0
) => {

  const query = `

    SELECT

      n.id_notificacion,

      n.titulo,

      n.mensaje,

      n.tipo,

      n.id_oportunidad,

      n.creada_en,

      n.leida_en,

      o.titulo AS oportunidad_titulo,

      o.estado AS oportunidad_estado,

      CASE

        WHEN n.tipo = 'NUEVA_OPORTUNIDAD'

        THEN COALESCE(

          o.estado = 'PUBLICADA'

          AND o.eliminado_en IS NULL

          AND o.fecha_inicio > NOW()

          AND o.fecha_fin >= NOW()

          AND (

            SELECT COUNT(*)::INTEGER

            FROM inscripcion i

            WHERE i.id_oportunidad =
              o.id_oportunidad

              AND i.estado = 'ACEPTADA'

          ) < o.cupo_total,

          FALSE

        )

        ELSE NULL

      END AS oportunidad_disponible

    FROM (

      SELECT *

      FROM notificacion

      WHERE id_usuario = $1

      ORDER BY
        creada_en DESC,
        id_notificacion DESC

      LIMIT $2

      OFFSET $3

    ) n

    LEFT JOIN oportunidad o

      ON o.id_oportunidad = n.id_oportunidad

    ORDER BY
      n.creada_en DESC,
      n.id_notificacion DESC;

  `;


  const { rows } = await pool.query(
    query,
    [
      idUsuario,
      limite,
      offset
    ]
  );


  return rows;

};

// ======================================================
// MARCAR NOTIFICACIÓN COMO LEÍDA
// ======================================================

const marcarComoLeida = async (
  idNotificacion,
  idUsuario
) => {

  const query = `
    UPDATE notificacion

    SET leida_en = COALESCE(
      leida_en,
      NOW()
    )

    WHERE id_notificacion = $1
      AND id_usuario = $2

    RETURNING *;
  `;

  const { rows } = await pool.query(
    query,
    [
      idNotificacion,
      idUsuario
    ]
  );

  return rows[0] || null;

};


// ======================================================
// CONTAR NOTIFICACIONES NO LEÍDAS
// ======================================================

const contarNoLeidas = async (
  idUsuario
) => {

  const query = `
    SELECT
      COUNT(*)::INTEGER AS cantidad

    FROM notificacion

    WHERE id_usuario = $1
      AND leida_en IS NULL;
  `;

  const { rows } = await pool.query(
    query,
    [idUsuario]
  );

  return rows[0].cantidad;

};

// ======================================================
// BUSCAR DESTINATARIOS POR TIPO DE ACTIVIDAD
// ACTIVIDAD 3.3.1
// ======================================================

const buscarDestinatariosPorTipoActividad = async (
  idTipoActividad
) => {

  const query = `
    SELECT DISTINCT
      u.id_usuario

    FROM voluntario_tipo_actividad vta

    INNER JOIN usuario u
      ON u.id_usuario = vta.id_voluntario

    WHERE vta.id_tipo_actividad = $1

      AND u.rol = 'VOLUNTARIO'

      AND u.estado_cuenta = 'ACTIVA'

    ORDER BY u.id_usuario;
  `;

  const { rows } = await pool.query(
    query,
    [idTipoActividad]
  );

  return rows.map(
    (fila) => fila.id_usuario
  );

};


// ======================================================
// GENERAR NOTIFICACIONES POR NUEVA OPORTUNIDAD
// ACTIVIDAD 3.3.1
// ======================================================

const crearPorOportunidadPublicada = async (
  idOportunidad,
  db = pool
) => {

  const query = `

    INSERT INTO notificacion (
      id_usuario,
      titulo,
      mensaje,
      tipo,
      id_oportunidad
    )

    SELECT DISTINCT

      u.id_usuario,

      'Nueva oportunidad de voluntariado',

      'Se publicó "' ||
      o.titulo ||
      '", una oportunidad compatible con tus intereses.',

      'NUEVA_OPORTUNIDAD',

      o.id_oportunidad

    FROM oportunidad o

    INNER JOIN voluntario_tipo_actividad vta
      ON vta.id_tipo_actividad =
         o.id_tipo_actividad

    INNER JOIN usuario u
      ON u.id_usuario =
         vta.id_voluntario

    WHERE o.id_oportunidad = $1

      AND o.estado = 'PUBLICADA'

      AND o.eliminado_en IS NULL

      AND u.rol = 'VOLUNTARIO'

      AND u.estado_cuenta = 'ACTIVA'

    ON CONFLICT
      ON CONSTRAINT
        uq_notificacion_usuario_tipo_oportunidad

    DO NOTHING

    RETURNING
      id_notificacion,
      id_usuario,
      titulo,
      mensaje,
      tipo,
      id_oportunidad,
      creada_en;

  `;

  const { rows } = await db.query(
    query,
    [idOportunidad]
  );

  return rows;

};
// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  crear,
  listarPorUsuario,
  marcarComoLeida,
  contarNoLeidas,
  buscarDestinatariosPorTipoActividad,
  crearPorOportunidadPublicada
};