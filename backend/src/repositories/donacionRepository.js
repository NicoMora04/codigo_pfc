const pool =
  require('../config/db');


// ======================================================
// LISTAR CATEGORÍAS DE DONACIÓN
// ======================================================

exports.listarCategorias =
  async () => {

    const result =
      await pool.query(
        `
        SELECT
          id_categoria_donacion,
          nombre,
          descripcion
        FROM categoria_donacion
        ORDER BY nombre ASC
        `
      );


    return result.rows;

  };


  // ======================================================
// CREAR DONACIÓN + HISTORIAL INICIAL
// TRANSACCIÓN ACID
// ======================================================

exports.crearDonacionTransaccional =
  async (datos) => {

    const {
      idVoluntario,
      idOrganizacion,
      idCategoriaDonacion,
      idUbicacion,
      descripcion,
      cantidad,
      unidad,
      condicionBien,
      disponibleDesde,
      idempotencyKey
    } = datos;


    const client =
      await pool.connect();


    try {

      await client.query(
        'BEGIN'
      );


      // ==================================================
      // 1. CONTROL DE IDEMPOTENCIA
      // ==================================================

      const donacionExistente =
        await client.query(
          `
          SELECT *
          FROM donacion
          WHERE idempotency_key = $1
          `,
          [
            idempotencyKey
          ]
        );


      if (
        donacionExistente.rows.length > 0
      ) {

        const existente =
          donacionExistente.rows[0];


        if (
          existente.id_voluntario !==
          idVoluntario
        ) {

          const error =
            new Error(
              'La clave de idempotencia ya fue utilizada'
            );

          error.status = 409;

          throw error;

        }


        await client.query(
          'COMMIT'
        );


        return {
          donacion:
            existente,

          reutilizada:
            true
        };

      }


      // ==================================================
      // 2. REVALIDAR ORGANIZACIÓN DESTINATARIA
      // ==================================================

      const resultadoOrganizacion =
        await client.query(
          `
          SELECT
            o.id_organizacion,
            o.estado_verificacion,
            u.estado_cuenta
          FROM organizacion o
          INNER JOIN usuario u
            ON u.id_usuario =
              o.id_usuario
          WHERE o.id_organizacion = $1
            AND o.estado_verificacion =
              'VERIFICADA'
            AND u.estado_cuenta =
              'ACTIVA'
          FOR UPDATE OF o, u
          `,
          [
            idOrganizacion
          ]
        );


      if (
        resultadoOrganizacion.rows.length === 0
      ) {

        const error =
          new Error(
            'La organización no está disponible para recibir donaciones'
          );

        error.status = 400;

        throw error;

      }


      // ==================================================
      // 3. VALIDAR CATEGORÍA
      // ==================================================

      const resultadoCategoria =
        await client.query(
          `
          SELECT
            id_categoria_donacion
          FROM categoria_donacion
          WHERE id_categoria_donacion = $1
          `,
          [
            idCategoriaDonacion
          ]
        );


      if (
        resultadoCategoria.rows.length === 0
      ) {

        const error =
          new Error(
            'La categoría de donación no es válida'
          );

        error.status = 400;

        throw error;

      }


      // ==================================================
      // 4. VALIDAR UBICACIÓN SI FUE INFORMADA
      // ==================================================

      if (
        idUbicacion
      ) {

        const resultadoUbicacion =
          await client.query(
            `
            SELECT
              id_ubicacion
            FROM ubicacion
            WHERE id_ubicacion = $1
            `,
            [
              idUbicacion
            ]
          );


        if (
          resultadoUbicacion.rows.length === 0
        ) {

          const error =
            new Error(
              'La ubicación indicada no es válida'
            );

          error.status = 400;

          throw error;

        }

      }


      // ==================================================
      // 5. CREAR DONACIÓN
      // ==================================================

      const resultadoDonacion =
        await client.query(
          `
          INSERT INTO donacion (
            id_voluntario,
            id_organizacion,
            id_categoria_donacion,
            id_ubicacion,
            descripcion,
            cantidad,
            unidad,
            condicion_bien,
            disponible_desde,
            estado,
            idempotency_key
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            'PENDIENTE',
            $10
          )
          RETURNING *
          `,
          [
            idVoluntario,
            idOrganizacion,
            idCategoriaDonacion,
            idUbicacion || null,
            descripcion,
            cantidad,
            unidad,
            condicionBien,
            disponibleDesde,
            idempotencyKey
          ]
        );


      const donacion =
        resultadoDonacion.rows[0];


      // ==================================================
      // 6. CREAR HISTORIAL INICIAL
      // ==================================================

      await client.query(
        `
        INSERT INTO historial_estado_donacion (
          id_donacion,
          cambiado_por,
          estado,
          observacion
        )
        VALUES (
          $1,
          $2,
          'PENDIENTE',
          $3
        )
        `,
        [
          donacion.id_donacion,
          idVoluntario,
          'Donación registrada por el voluntario'
        ]
      );


      // ==================================================
      // 7. CONFIRMAR TRANSACCIÓN
      // ==================================================

      await client.query(
        'COMMIT'
      );


      return {
        donacion,
        reutilizada:
          false
      };

    }
    catch (error) {

      await client.query(
        'ROLLBACK'
      );

      throw error;

    }
    finally {

      client.release();

    }

  };


  // ======================================================
// BUSCAR DONACIÓN PROPIA POR ID
// ======================================================

exports.buscarDonacionPropiaPorId =
  async (
    idDonacion,
    idVoluntario
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          id_donacion,
          id_voluntario,
          imagen_url
        FROM donacion
        WHERE id_donacion = $1
          AND id_voluntario = $2
        LIMIT 1
        `,
        [
          idDonacion,
          idVoluntario
        ]
      );


    return (
      result.rows[0] ||
      null
    );

  };

  // ======================================================
// ACTUALIZAR IMAGEN DE UNA DONACIÓN PROPIA
// ======================================================

exports.actualizarImagenDonacion =
  async (
    idDonacion,
    idVoluntario,
    imagenUrl
  ) => {

    const result =
      await pool.query(
        `
        UPDATE donacion
        SET
          imagen_url = $1,
          actualizada_en = CURRENT_TIMESTAMP
        WHERE id_donacion = $2
          AND id_voluntario = $3
        RETURNING
          id_donacion,
          imagen_url,
          actualizada_en
        `,
        [
          imagenUrl,
          idDonacion,
          idVoluntario
        ]
      );


    return (
      result.rows[0] ||
      null
    );

  };




  // ======================================================
// LISTAR DONACIONES PROPIAS DEL VOLUNTARIO
// ======================================================

exports.listarDonacionesPropias =
  async (
    idVoluntario,
    estado = null
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          d.id_donacion,
          d.id_organizacion,

          o.razon_social
            AS organizacion,

          d.id_categoria_donacion,

          cd.nombre
            AS categoria,

          d.descripcion,
          d.cantidad,
          d.unidad,
          d.condicion_bien,
          d.disponible_desde,
          d.imagen_url,
          d.estado,

          d.creada_en,
          d.actualizada_en,

          u.id_ubicacion,
          u.direccion,
          u.localidad,
          u.provincia,
          u.latitud,
          u.longitud,
          u.es_aproximada

        FROM donacion d

        INNER JOIN organizacion o
          ON o.id_organizacion =
            d.id_organizacion

        INNER JOIN categoria_donacion cd
          ON cd.id_categoria_donacion =
            d.id_categoria_donacion

        LEFT JOIN ubicacion u
          ON u.id_ubicacion =
            d.id_ubicacion

        WHERE d.id_voluntario = $1

          AND (
            $2::text IS NULL
            OR d.estado = $2
          )

        ORDER BY
          d.creada_en DESC
        `,
        [
          idVoluntario,
          estado
        ]
      );


    return result.rows;

  };


// ======================================================
// OBTENER DETALLE DE UNA DONACIÓN PROPIA
// ======================================================

exports.obtenerDetalleDonacionPropia =
  async (
    idDonacion,
    idVoluntario
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          d.id_donacion,
          d.id_voluntario,
          d.id_organizacion,

          o.razon_social
            AS organizacion,

          d.id_categoria_donacion,

          cd.nombre
            AS categoria,

          d.descripcion,
          d.cantidad,
          d.unidad,
          d.condicion_bien,
          d.disponible_desde,
          d.imagen_url,
          d.estado,

          d.creada_en,
          d.actualizada_en,

          u.id_ubicacion,
          u.direccion,
          u.localidad,
          u.provincia,
          u.latitud,
          u.longitud,
          u.es_aproximada

        FROM donacion d

        INNER JOIN organizacion o
          ON o.id_organizacion =
            d.id_organizacion

        INNER JOIN categoria_donacion cd
          ON cd.id_categoria_donacion =
            d.id_categoria_donacion

        LEFT JOIN ubicacion u
          ON u.id_ubicacion =
            d.id_ubicacion

        WHERE d.id_donacion = $1
          AND d.id_voluntario = $2

        LIMIT 1
        `,
        [
          idDonacion,
          idVoluntario
        ]
      );


    return (
      result.rows[0] ||
      null
    );

  };