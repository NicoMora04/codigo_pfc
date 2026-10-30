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

// ======================================================
// OCULTAR PERFIL PÚBLICO
// ACTIVIDAD 3.6.4
// ======================================================

exports.ocultarPerfilPublico =
  async (
    idPerfilPublico,
    idAdmin,
    motivo
  ) => {

    const client =
      await pool.connect()


    try {

      await client.query(
        'BEGIN'
      )


      // Bloqueamos el registro para evitar
      // modificaciones concurrentes.
      const perfilResult =
        await client.query(
          `
          SELECT
            id_perfil_publico,
            id_organizacion,
            slug,
            estado_publicacion

          FROM perfil_publico_organizacion

          WHERE id_perfil_publico = $1

          FOR UPDATE
          `,
          [
            idPerfilPublico
          ]
        )


      if (
        perfilResult.rows.length === 0
      ) {

        await client.query(
          'ROLLBACK'
        )

        return null
      }


      const perfil =
        perfilResult.rows[0]


      if (
        ![
          'PUBLICADO',
          'NO_PUBLICADO'
        ].includes(
          perfil.estado_publicacion
        )
      ) {

        await client.query(
          'ROLLBACK'
        )

        return {
          estadoInvalido: true,
          estadoActual:
            perfil.estado_publicacion
        }
      }


      const estadoAnterior =
        perfil.estado_publicacion


      const actualizadoResult =
        await client.query(
          `
          UPDATE perfil_publico_organizacion

          SET
            estado_publicacion =
              'OCULTO',

            estado_publicacion_anterior =
              $2,

            ocultado_por =
              $3,

            ocultado_en =
              NOW(),

            motivo_ocultamiento =
              $4,

            actualizado_en =
              NOW()

          WHERE id_perfil_publico =
            $1

          RETURNING
            id_perfil_publico,
            id_organizacion,
            slug,
            estado_publicacion,
            estado_publicacion_anterior,
            ocultado_por,
            ocultado_en,
            motivo_ocultamiento,
            actualizado_en
          `,
          [
            idPerfilPublico,
            estadoAnterior,
            idAdmin,
            motivo
          ]
        )


      await client.query(
        `
        INSERT INTO historial_moderacion_perfil (
          id_perfil_publico,
          accion,
          estado_anterior,
          estado_nuevo,
          id_admin,
          motivo
        )

        VALUES (
          $1,
          'OCULTAR',
          $2,
          'OCULTO',
          $3,
          $4
        )
        `,
        [
          idPerfilPublico,
          estadoAnterior,
          idAdmin,
          motivo
        ]
      )


      await client.query(
        'COMMIT'
      )


      return {
        perfil:
          actualizadoResult.rows[0]
      }

    }
    catch (error) {

      await client.query(
        'ROLLBACK'
      )

      throw error

    }
    finally {

      client.release()

    }

  }


// ======================================================
// REHABILITAR PERFIL PÚBLICO
// ACTIVIDAD 3.6.4
// ======================================================

exports.rehabilitarPerfilPublico =
  async (
    idPerfilPublico,
    idAdmin
  ) => {

    const client =
      await pool.connect()


    try {

      await client.query(
        'BEGIN'
      )


      const perfilResult =
        await client.query(
          `
          SELECT
            id_perfil_publico,
            id_organizacion,
            slug,
            estado_publicacion,
            estado_publicacion_anterior

          FROM perfil_publico_organizacion

          WHERE id_perfil_publico = $1

          FOR UPDATE
          `,
          [
            idPerfilPublico
          ]
        )


      if (
        perfilResult.rows.length === 0
      ) {

        await client.query(
          'ROLLBACK'
        )

        return null
      }


      const perfil =
        perfilResult.rows[0]


      if (
        perfil.estado_publicacion !==
          'OCULTO'
      ) {

        await client.query(
          'ROLLBACK'
        )

        return {
          estadoInvalido: true,
          estadoActual:
            perfil.estado_publicacion
        }
      }


      if (
        ![
          'PUBLICADO',
          'NO_PUBLICADO'
        ].includes(
          perfil
            .estado_publicacion_anterior
        )
      ) {

        await client.query(
          'ROLLBACK'
        )

        return {
          estadoAnteriorInvalido:
            true
        }
      }


      const estadoRestaurado =
        perfil
          .estado_publicacion_anterior


      const actualizadoResult =
        await client.query(
          `
          UPDATE perfil_publico_organizacion

          SET
            estado_publicacion =
              $2,

            estado_publicacion_anterior =
              NULL,

            ocultado_por =
              NULL,

            ocultado_en =
              NULL,

            motivo_ocultamiento =
              NULL,

            actualizado_en =
              NOW()

          WHERE id_perfil_publico =
            $1

          RETURNING
            id_perfil_publico,
            id_organizacion,
            slug,
            estado_publicacion,
            estado_publicacion_anterior,
            ocultado_por,
            ocultado_en,
            motivo_ocultamiento,
            actualizado_en
          `,
          [
            idPerfilPublico,
            estadoRestaurado
          ]
        )


      await client.query(
        `
        INSERT INTO historial_moderacion_perfil (
          id_perfil_publico,
          accion,
          estado_anterior,
          estado_nuevo,
          id_admin,
          motivo
        )

        VALUES (
          $1,
          'REHABILITAR',
          'OCULTO',
          $2,
          $3,
          NULL
        )
        `,
        [
          idPerfilPublico,
          estadoRestaurado,
          idAdmin
        ]
      )


      await client.query(
        'COMMIT'
      )


      return {
        perfil:
          actualizadoResult.rows[0]
      }

    }
    catch (error) {

      await client.query(
        'ROLLBACK'
      )

      throw error

    }
    finally {

      client.release()

    }

  }

// ======================================================
// LISTAR PERFILES PÚBLICOS PARA MODERACIÓN
// ACTIVIDAD 3.6.4
// ======================================================

exports.listarPerfilesPublicos =
  async (
    estado = null
  ) => {

    const valores = []

    const condiciones = [
      `
      p.estado_publicacion IN (
        'PUBLICADO',
        'OCULTO'
      )
      `
    ]


    if (estado) {

      valores.push(estado)

      condiciones.push(
        `p.estado_publicacion = $${valores.length}`
      )

    }


    const result =
      await pool.query(
        `
        SELECT
          p.id_perfil_publico,
          p.id_organizacion,
          p.nombre_visible,
          p.slug,
          p.estado_publicacion,
          p.estado_publicacion_anterior,
          p.publicado_en,
          p.ocultado_en,
          p.motivo_ocultamiento,

          o.razon_social,
          o.estado_verificacion,

          u.estado_cuenta,

          ub.localidad,
          ub.provincia

        FROM perfil_publico_organizacion p

        INNER JOIN organizacion o
          ON o.id_organizacion =
            p.id_organizacion

        INNER JOIN usuario u
          ON u.id_usuario =
            o.id_usuario

        LEFT JOIN ubicacion ub
          ON ub.id_ubicacion =
            o.id_ubicacion

        WHERE
          ${condiciones.join('\n AND ')}

        ORDER BY
          CASE
            WHEN p.estado_publicacion =
              'PUBLICADO'
              THEN 0
            ELSE 1
          END,

          p.nombre_visible ASC
        `,
        valores
      )


    return result.rows

  }