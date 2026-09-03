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