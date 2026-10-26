const pool = require('../config/db');


// ======================================================
// REGISTRAR O ACTUALIZAR TOKEN DE DISPOSITIVO
// ACTIVIDAD 3.3.1
// ======================================================

const registrar = async (
  idUsuario,
  token,
  plataforma
) => {

  const query = `
    INSERT INTO token_dispositivo (
      id_usuario,
      token,
      plataforma,
      activo
    )

    VALUES ($1, $2, $3, TRUE)

    ON CONFLICT (token)

    DO UPDATE SET
      id_usuario = EXCLUDED.id_usuario,
      plataforma = EXCLUDED.plataforma,
      activo = TRUE,
      actualizado_en = NOW()

    WHERE
      token_dispositivo.id_usuario =
        EXCLUDED.id_usuario

      OR token_dispositivo.activo = FALSE

    RETURNING
      id_token_dispositivo,
      id_usuario,
      plataforma,
      activo,
      registrado_en,
      actualizado_en;
  `;

  const { rows } = await pool.query(
    query,
    [
      idUsuario,
      token,
      plataforma
    ]
  );

  return rows[0] || null;

};


// ======================================================
// DESACTIVAR TOKEN DE UN USUARIO
// ======================================================

const desactivar = async (
  idUsuario,
  token
) => {

  const query = `
    UPDATE token_dispositivo

    SET
      activo = FALSE,
      actualizado_en = NOW()

    WHERE id_usuario = $1
      AND token = $2
      AND activo = TRUE

    RETURNING id_token_dispositivo;
  `;

  const { rows } = await pool.query(
    query,
    [
      idUsuario,
      token
    ]
  );

  return rows.length > 0;

};


// ======================================================
// OBTENER TOKENS ACTIVOS DE UN USUARIO
// ======================================================

const obtenerActivosPorUsuario = async (
  idUsuario
) => {

  const query = `
    SELECT
      td.token,
      td.plataforma

    FROM token_dispositivo td

    INNER JOIN usuario u
      ON u.id_usuario = td.id_usuario

    WHERE td.id_usuario = $1

      AND td.activo = TRUE

      AND u.estado_cuenta = 'ACTIVA';
  `;

  const { rows } = await pool.query(
    query,
    [idUsuario]
  );

  return rows;

};


// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  registrar,
  desactivar,
  obtenerActivosPorUsuario
};