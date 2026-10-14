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
  o.estado_verificacion IN (
    'PENDIENTE',
    'RECHAZADA'
  )

    ORDER BY
  CASE
    WHEN o.estado_verificacion = 'PENDIENTE'
      THEN 1
    WHEN o.estado_verificacion = 'RECHAZADA'
      THEN 2
  END,
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


// ======================================================
// LISTAR USUARIOS
// ======================================================

exports.listarUsuarios = async () => {

  const result = await pool.query(
    `
    SELECT
      id_usuario,
      email,
      rol,
      estado_cuenta,
      motivo_bloqueo,
      creado_en,
      actualizado_en

    FROM usuario

    WHERE rol <> 'ADMIN'

    ORDER BY
      creado_en DESC
    `
  );

  return result.rows;

};


// ======================================================
// ANULAR REGISTRO INVÁLIDO DE ORGANIZACIÓN
// ======================================================

exports.anularRegistroOrganizacion =
  async (idOrganizacion) => {

    const client =
      await pool.connect();

    try {

      await client.query('BEGIN');


      // --------------------------------------------------
      // 1. BLOQUEAR Y OBTENER ORGANIZACIÓN
      // --------------------------------------------------

      const organizacionResult =
        await client.query(
          `
          SELECT
            o.id_organizacion,
            o.id_usuario,
            o.razon_social,
            o.cuit,
            o.estado_verificacion,
            u.email

          FROM organizacion o

          INNER JOIN usuario u
            ON u.id_usuario = o.id_usuario

          WHERE o.id_organizacion = $1

          FOR UPDATE
          `,
          [idOrganizacion]
        );


      if (
        organizacionResult.rows.length === 0
      ) {

        await client.query('ROLLBACK');

        return {
          resultado: 'NO_EXISTE'
        };

      }


      const organizacion =
        organizacionResult.rows[0];


      // --------------------------------------------------
      // 2. VALIDAR ESTADO
      // --------------------------------------------------

      if (
        ![
          'PENDIENTE',
          'RECHAZADA'
        ].includes(
          organizacion.estado_verificacion
        )
      ) {

        await client.query('ROLLBACK');

        return {
          resultado:
            'ESTADO_NO_PERMITIDO',

          organizacion
        };

      }


      // --------------------------------------------------
      // 3. COMPROBACIONES DEFENSIVAS
      // --------------------------------------------------

      const referenciasResult =
        await client.query(
          `
          SELECT

            EXISTS (
              SELECT 1
              FROM oportunidad
              WHERE id_organizacion = $1
            ) AS tiene_oportunidades,

            EXISTS (
              SELECT 1
              FROM donacion
              WHERE id_organizacion = $1
            ) AS tiene_donaciones,

            EXISTS (
              SELECT 1
              FROM perfil_publico_organizacion
              WHERE id_organizacion = $1
            ) AS tiene_perfil_publico
          `,
          [idOrganizacion]
        );


      const referencias =
        referenciasResult.rows[0];


      if (
        referencias.tiene_oportunidades ||
        referencias.tiene_donaciones ||
        referencias.tiene_perfil_publico
      ) {

        await client.query('ROLLBACK');

        return {
          resultado:
            'TIENE_REFERENCIAS'
        };

      }


      // --------------------------------------------------
      // 4. ELIMINAR RELACIONES DEL REGISTRO
      // --------------------------------------------------

      await client.query(
        `
        DELETE FROM organizacion_tipo_actividad
        WHERE id_organizacion = $1
        `,
        [idOrganizacion]
      );


      // --------------------------------------------------
      // 5. ELIMINAR ORGANIZACIÓN
      // --------------------------------------------------

      await client.query(
        `
        DELETE FROM organizacion
        WHERE id_organizacion = $1
        `,
        [idOrganizacion]
      );


      // --------------------------------------------------
      // 6. ELIMINAR TOKENS DE RECUPERACIÓN
      // --------------------------------------------------

      await client.query(
        `
        DELETE FROM token_recuperacion_contrasena
        WHERE id_usuario = $1
        `,
        [organizacion.id_usuario]
      );


      // --------------------------------------------------
      // 7. ELIMINAR USUARIO
      // --------------------------------------------------

      await client.query(
        `
        DELETE FROM usuario
        WHERE id_usuario = $1
        `,
        [organizacion.id_usuario]
      );


      await client.query('COMMIT');


      return {
        resultado: 'ANULADA',
        organizacion
      };

    }
    catch (error) {

      await client.query('ROLLBACK');

      throw error;

    }
    finally {

      client.release();

    }

  };