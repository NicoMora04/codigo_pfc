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


// ======================================================
// LISTAR NOTIFICACIONES DE UN USUARIO
// ======================================================

const listarPorUsuario = async (
  idUsuario,
  limite = 30,
  offset = 0
) => {

  const query = `
    SELECT
      id_notificacion,
      titulo,
      mensaje,
      tipo,
      creada_en,
      leida_en

    FROM notificacion

    WHERE id_usuario = $1

    ORDER BY
      creada_en DESC,
      id_notificacion DESC

    LIMIT $2
    OFFSET $3;
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
// EXPORTACIONES
// ======================================================

module.exports = {
  crear,
  listarPorUsuario,
  marcarComoLeida,
  contarNoLeidas
};