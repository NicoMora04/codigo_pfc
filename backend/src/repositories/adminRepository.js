const pool = require('../config/db');


// ======================================================
// BLOQUEAR USUARIO
// ======================================================

exports.bloquearUsuario = async (idUsuario,motivo) => {

  const result = await pool.query(
    `
    UPDATE usuario
    SET
      estado_cuenta = 'BLOQUEADA',
      motivo_bloqueo = $2,
      actualizado_en = CURRENT_TIMESTAMP
    WHERE id_usuario = $1
      AND estado_cuenta = 'ACTIVA'
    RETURNING
      id_usuario,
      email,
      rol,
      estado_cuenta,
      motivo_bloqueo
    `,
    [idUsuario,motivo]
  );

  return result.rows[0];

};


// ======================================================
// REHABILITAR USUARIO
// ======================================================

exports.rehabilitarUsuario = async (idUsuario) => {

  const result = await pool.query(
    `
    UPDATE usuario
    SET
      estado_cuenta = 'ACTIVA',
      motivo_bloqueo=NULL,
      actualizado_en = CURRENT_TIMESTAMP
    WHERE id_usuario = $1
      AND estado_cuenta = 'BLOQUEADA'
    RETURNING
      id_usuario,
      email,
      rol,
      estado_cuenta,
      motivo_bloqueo
    `,
    [idUsuario]
  );

  return result.rows[0];

};