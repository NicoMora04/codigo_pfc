const pool = require('../config/db');


// ======================================================
// LISTAR ORGANIZACIONES PENDIENTES
// ======================================================

exports.listarOrganizacionesPendientes = async () => {

  const result = await pool.query(
    `
    SELECT
      o.id_organizacion,
      o.razon_social,
      o.cuit,
      o.descripcion,
      o.estado_verificacion,
      u.email,
      o.creado_en,

      ub.direccion,
      ub.localidad,
      ub.provincia,
      ub.es_aproximada

    FROM organizacion o

    INNER JOIN usuario u
      ON u.id_usuario =
        o.id_usuario

    LEFT JOIN ubicacion ub
      ON ub.id_ubicacion =
        o.id_ubicacion

    WHERE
      o.estado_verificacion =
        'PENDIENTE'

    ORDER BY
      o.creado_en ASC
    `
  );

  return result.rows;

};


// ======================================================
// APROBAR ORGANIZACIÓN
// ======================================================

exports.aprobarOrganizacion = async (idOrganizacion) => {

  const result = await pool.query(
    `
    UPDATE organizacion
    SET
      estado_verificacion = 'VERIFICADA',
      actualizado_en = CURRENT_TIMESTAMP
    WHERE id_organizacion = $1
      AND estado_verificacion = 'PENDIENTE'
    RETURNING
      id_organizacion,
      razon_social,
      cuit,
      estado_verificacion
    `,
    [idOrganizacion]
  );

  return result.rows[0];

};


// ======================================================
// RECHAZAR ORGANIZACIÓN
// ======================================================

exports.rechazarOrganizacion =
  async (
    idOrganizacion,
    motivo
  ) => {

    const result = await pool.query(
      `
      UPDATE organizacion
      SET
        estado_verificacion = 'RECHAZADA',
        motivo_rechazo = $2,
        actualizado_en = CURRENT_TIMESTAMP
      WHERE id_organizacion = $1
        AND estado_verificacion = 'PENDIENTE'
      RETURNING
        id_organizacion,
        razon_social,
        cuit,
        estado_verificacion,
        motivo_rechazo
      `,
      [
        idOrganizacion,
        motivo
      ]
    );

    return result.rows[0];

  };


// ======================================================
// BLOQUEAR USUARIO
// ======================================================

exports.bloquearUsuario =
  async (
    idUsuario,
    motivo
  ) => {

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
      [
        idUsuario,
        motivo
      ]
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
      motivo_bloqueo = NULL,
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