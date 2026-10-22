// ======================================================
// REPOSITORIO DE ENVÍOS PUSH
// ACTIVIDAD 3.3.1
// ======================================================

const pool = require('../config/db');
// ======================================================
// REGISTRAR ENVÍOS PENDIENTES DE UNA OPORTUNIDAD
// ======================================================

const crearPendientesPorOportunidad = async (
  idOportunidad,
  db
) => {

  const query = `

    INSERT INTO envio_push (

      id_notificacion,

      id_token_dispositivo,

      estado

    )

    SELECT

      n.id_notificacion,

      td.id_token_dispositivo,

      'PENDIENTE'

    FROM notificacion n

    INNER JOIN token_dispositivo td

      ON td.id_usuario = n.id_usuario

    WHERE n.id_oportunidad = $1

      AND n.tipo = 'NUEVA_OPORTUNIDAD'

      AND td.activo = TRUE

    ON CONFLICT
      ON CONSTRAINT
        uq_envio_push_notificacion_dispositivo

    DO NOTHING

    RETURNING

      id_envio_push,

      id_notificacion,

      id_token_dispositivo,

      estado;

  `;


  const { rows } = await db.query(
    query,
    [idOportunidad]
  );


  return rows;

};

// ======================================================
// RESERVAR ENVÍOS PUSH PENDIENTES
// ACTIVIDAD 3.3.1
// ======================================================

const reservarPendientes = async (limite = 10) => {

  const query = `

    WITH seleccion AS (

      SELECT id_envio_push

      FROM envio_push

      WHERE (

        (
          estado IN ('PENDIENTE', 'REINTENTAR')
          AND proximo_intento_en <= NOW()
        )

        OR

        (
          estado = 'EN_PROCESO'
          AND bloqueado_hasta <= NOW()
        )

      )

      AND intentos < 5

      ORDER BY
        proximo_intento_en ASC,
        creado_en ASC

      LIMIT $1

      FOR UPDATE SKIP LOCKED

    )

    UPDATE envio_push ep

    SET

      estado = 'EN_PROCESO',

      intentos = ep.intentos + 1,

      bloqueado_hasta =
        NOW() + INTERVAL '3 minutes',

      actualizado_en = NOW()

    FROM
      seleccion s,
      notificacion n,
      token_dispositivo td

    WHERE ep.id_envio_push = s.id_envio_push

      AND n.id_notificacion = ep.id_notificacion

      AND td.id_token_dispositivo =
          ep.id_token_dispositivo

    RETURNING

      ep.id_envio_push,

      ep.intentos,

      n.id_notificacion,

      n.id_usuario,

      n.titulo,

      n.mensaje,

      n.tipo,

      n.id_oportunidad,

      td.token,

      td.activo,

      td.id_usuario AS id_usuario_dispositivo;

  `;

  const { rows } = await pool.query(
    query,
    [limite]
  );

  return rows;

};


// ======================================================
// REGISTRAR TICKET ACEPTADO POR EXPO
// ======================================================

const marcarEsperandoRecibo = async (
  idEnvioPush,
  expoTicketId
) => {

  const query = `

    UPDATE envio_push

    SET

      estado = 'ESPERANDO_RECIBO',

      expo_ticket_id = $2,

      enviado_en = NOW(),

      bloqueado_hasta = NULL,

      ultimo_error = NULL,

      actualizado_en = NOW()

    WHERE id_envio_push = $1

      AND estado = 'EN_PROCESO'

    RETURNING *;

  `;

  const { rows } = await pool.query(
    query,
    [
      idEnvioPush,
      expoTicketId
    ]
  );

  return rows[0] || null;

};



// ======================================================
// REGISTRAR ERROR DE ENVÍO
// ======================================================

const registrarError = async ({
  idEnvioPush,
  mensaje,
  definitivo,
  segundosEspera = 60
}) => {

  const estado =
    definitivo
      ? 'ERROR_FINAL'
      : 'REINTENTAR';

  const query = `

    UPDATE envio_push

    SET

      estado = $2,

      ultimo_error = $3,

      proximo_intento_en =
        NOW() + ($4::INTEGER * INTERVAL '1 second'),

      bloqueado_hasta = NULL,

      expo_ticket_id = NULL,

      actualizado_en = NOW()

    WHERE id_envio_push = $1

      AND estado = 'EN_PROCESO'

    RETURNING *;

  `;

  const { rows } = await pool.query(
    query,
    [
      idEnvioPush,
      estado,
      mensaje,
      segundosEspera
    ]
  );

  return rows[0] || null;

};


// ======================================================
// FINALIZAR TRABAJOS QUE AGOTARON LOS INTENTOS
// ======================================================

const finalizarAgotados = async () => {

  const query = `

    UPDATE envio_push

    SET

      estado = 'ERROR_FINAL',

      ultimo_error =
        'Se agotaron los intentos de procesamiento',

      bloqueado_hasta = NULL,

      actualizado_en = NOW()

    WHERE estado = 'EN_PROCESO'

      AND bloqueado_hasta <= NOW()

      AND intentos >= 5;

  `;

  const resultado = await pool.query(query);

  return resultado.rowCount;

};

// ======================================================
// RESERVAR RECIBOS PENDIENTES
// ACTIVIDAD 3.3.1
// ======================================================

const reservarRecibos = async (limite = 100) => {

  const query = `

    WITH seleccion AS (

      SELECT ep.id_envio_push

      FROM envio_push ep

      WHERE ep.estado = 'ESPERANDO_RECIBO'

        -- Esperar al menos 15 minutos desde el envío

        AND ep.enviado_en <=
            NOW() - INTERVAL '15 minutes'

        -- Respetar próxima fecha de consulta

        AND ep.proximo_intento_en <= NOW()

        -- Evitar reservas simultáneas

        AND (
          ep.bloqueado_hasta IS NULL
          OR ep.bloqueado_hasta <= NOW()
        )

        AND ep.expo_ticket_id IS NOT NULL

      ORDER BY ep.enviado_en ASC

      LIMIT $1

      FOR UPDATE OF ep SKIP LOCKED

    )

    UPDATE envio_push ep

    SET

      bloqueado_hasta =
        NOW() + INTERVAL '3 minutes',

      -- Si no hay recibo, volver a consultar después

      proximo_intento_en =
        NOW() + INTERVAL '15 minutes',

      actualizado_en = NOW()

    FROM seleccion s,
         notificacion n,
         token_dispositivo td

    WHERE ep.id_envio_push = s.id_envio_push

      AND n.id_notificacion = ep.id_notificacion

      AND td.id_token_dispositivo =
          ep.id_token_dispositivo

    RETURNING

      ep.id_envio_push,

      ep.expo_ticket_id,

      ep.enviado_en,

      ep.intentos,

      n.id_usuario,

      td.token;

  `;

  const { rows } = await pool.query(
    query,
    [limite]
  );

  return rows;

};

// ======================================================
// REGISTRAR RESULTADO DE RECIBO
// ACTIVIDAD 3.3.1
// ======================================================

const resolverRecibo = async ({
  idEnvioPush,
  expoTicketId,
  estado,
  mensaje = null,
  segundosEspera = 60
}) => {

  const estadosPermitidos = [
    'ACEPTADO_PROVEEDOR',
    'REINTENTAR',
    'ERROR_FINAL'
  ];

  if (!estadosPermitidos.includes(estado)) {

    throw new Error(
      'Estado de resolución de recibo no válido'
    );

  }

  const query = `

    UPDATE envio_push

    SET

      estado = $3,

      ultimo_error = $4,

      confirmado_en =
        CASE
          WHEN $3 = 'ACEPTADO_PROVEEDOR'
          THEN NOW()
          ELSE confirmado_en
        END,

      bloqueado_hasta = NULL,

      proximo_intento_en =
        CASE
          WHEN $3 = 'REINTENTAR'
          THEN NOW() +
            ($5::INTEGER * INTERVAL '1 second')
          ELSE proximo_intento_en
        END,

      expo_ticket_id =
        CASE
          WHEN $3 = 'REINTENTAR'
          THEN NULL
          ELSE expo_ticket_id
        END,

      actualizado_en = NOW()

    WHERE id_envio_push = $1

      AND expo_ticket_id = $2

      AND estado = 'ESPERANDO_RECIBO'

    RETURNING *;

  `;

  const { rows } = await pool.query(
    query,
    [
      idEnvioPush,
      expoTicketId,
      estado,
      mensaje,
      segundosEspera
    ]
  );

  return rows[0] || null;

};


// ======================================================
// FINALIZAR RECIBOS SIN CONFIRMACIÓN
// ACTIVIDAD 3.3.1
// ======================================================

const finalizarRecibosSinConfirmacion = async () => {

  const query = `

    UPDATE envio_push

    SET

      estado = 'SIN_CONFIRMACION',

      ultimo_error =
        'No se obtuvo un recibo de Expo dentro de las 24 horas',

      bloqueado_hasta = NULL,

      actualizado_en = NOW()

    WHERE estado = 'ESPERANDO_RECIBO'

      AND enviado_en <=
          NOW() - INTERVAL '24 hours'

      AND (
        bloqueado_hasta IS NULL
        OR bloqueado_hasta <= NOW()
      );

  `;

  const resultado = await pool.query(query);

  return resultado.rowCount;

};


// ======================================================
// VERIFICAR DISPONIBILIDAD DE OPORTUNIDAD
// ACTIVIDAD 3.3.1
// ======================================================

const esOportunidadNotificable = async (
  idOportunidad
) => {

  const query = `

    SELECT

      (
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

        ) < o.cupo_total

      ) AS notificable

    FROM oportunidad o

    WHERE o.id_oportunidad = $1;

  `;


  const { rows } = await pool.query(
    query,
    [idOportunidad]
  );


  if (rows.length === 0) {

    return false;

  }


  return rows[0].notificable === true;

};

// ======================================================
// OMITIR ENVÍO PUSH
// ACTIVIDAD 3.3.1
// ======================================================

const marcarOmitido = async (
  idEnvioPush,
  motivo
) => {

  const query = `

    UPDATE envio_push

    SET

      estado = 'OMITIDO',

      ultimo_error = $2,

      bloqueado_hasta = NULL,

      actualizado_en = NOW()

    WHERE id_envio_push = $1

      AND estado = 'EN_PROCESO'

    RETURNING *;

  `;


  const { rows } = await pool.query(
    query,
    [
      idEnvioPush,
      motivo
    ]
  );


  return rows[0] || null;

};

// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {

  crearPendientesPorOportunidad,

  reservarPendientes,

  marcarEsperandoRecibo,

  registrarError,

  finalizarAgotados,

  reservarRecibos,

  resolverRecibo,

  finalizarRecibosSinConfirmacion,

  esOportunidadNotificable,

  marcarOmitido

};