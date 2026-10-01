const pool =
  require('../src/config/db');


const {
  DONACION_ID,
} = process.env;


if (!DONACION_ID) {

  console.error(
    'Falta DONACION_ID'
  );

  process.exit(1);

}


const ejecutar =
  async () => {

    const client =
      await pool.connect();

let historialAntes = null;
    try {

      // ==================================================
      // 1. LÍNEA BASE
      // ==================================================

      const antesResult =
        await client.query(
          `
          SELECT
            d.id_donacion,
            d.estado,
            d.actualizada_en,
            o.id_usuario
              AS id_usuario_organizacion
          FROM donacion d
          INNER JOIN organizacion o
            ON o.id_organizacion =
              d.id_organizacion
          WHERE d.id_donacion = $1
          `,
          [
            DONACION_ID
          ]
        );


      if (
        antesResult.rows.length === 0
      ) {

        throw new Error(
          'La donación indicada no existe'
        );

      }


      const antes =
        antesResult.rows[0];


      if (
        antes.estado !== 'PENDIENTE'
      ) {

        throw new Error(
          `La donación debe estar PENDIENTE. Estado actual: ${antes.estado}`
        );

      }


      const historialAntesResult =
        await client.query(
          `
          SELECT COUNT(*)::int
            AS cantidad
          FROM historial_estado_donacion
          WHERE id_donacion = $1
          `,
          [
            DONACION_ID
          ]
        );


      historialAntes =
  historialAntesResult
    .rows[0]
    .cantidad;


      console.log(
        '\nEstado antes:',
        antes.estado
      );

      console.log(
        'Historial antes:',
        historialAntes
      );


      // ==================================================
      // 2. INICIAR TRANSACCIÓN
      // ==================================================

      await client.query(
        'BEGIN'
      );


      await client.query(
        `
        SELECT id_donacion
        FROM donacion
        WHERE id_donacion = $1
        FOR UPDATE
        `,
        [
          DONACION_ID
        ]
      );


      // ==================================================
      // 3. CAMBIO VÁLIDO DEL ESTADO PRINCIPAL
      // ==================================================

      await client.query(
        `
        UPDATE donacion
        SET
          estado = 'ACEPTADA',
          actualizada_en =
            CURRENT_TIMESTAMP
        WHERE id_donacion = $1
        `,
        [
          DONACION_ID
        ]
      );


      console.log(
        '\nEstado actualizado temporalmente a ACEPTADA.'
      );


      // ==================================================
      // 4. PROVOCAR UN FALLO CONTROLADO
      // ==================================================
      //
      // ESTADO_INVALIDO viola el CHECK de la tabla
      // historial_estado_donacion.
      //
      // El UPDATE anterior ya ocurrió dentro de la
      // transacción, por lo que PostgreSQL deberá
      // revertirlo junto con este INSERT fallido.

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
          'ESTADO_INVALIDO',
          'Prueba controlada de rollback'
        )
        `,
        [
          DONACION_ID,
          antes.id_usuario_organizacion
        ]
      );


      // Nunca debería llegar aquí.

      await client.query(
        'COMMIT'
      );


      throw new Error(
        'ERROR: la operación inválida no fue rechazada'
      );

    }
    catch (error) {

      await client.query(
        'ROLLBACK'
      );


      console.log(
        '\nFallo controlado detectado:'
      );

      console.log(
        error.message
      );


      // ==================================================
      // 5. VERIFICAR ROLLBACK
      // ==================================================

      const despuesResult =
        await client.query(
          `
          SELECT
            estado,
            actualizada_en
          FROM donacion
          WHERE id_donacion = $1
          `,
          [
            DONACION_ID
          ]
        );


      const historialDespuesResult =
        await client.query(
          `
          SELECT COUNT(*)::int
            AS cantidad
          FROM historial_estado_donacion
          WHERE id_donacion = $1
          `,
          [
            DONACION_ID
          ]
        );


      const despues =
        despuesResult.rows[0];

      const historialDespues =
        historialDespuesResult
          .rows[0]
          .cantidad;


      console.log(
        '\nEstado después:',
        despues.estado
      );

      console.log(
        'Historial después:',
        historialDespues
      );


      if (
        despues.estado === 'PENDIENTE' &&
        historialDespues === historialAntes
      ) {

        console.log(
          '\nOK - ROLLBACK correcto.'
        );

        console.log(
          'No quedó ningún cambio parcial.'
        );

        process.exitCode = 0;

        return;

      }


      console.error(
        '\nERROR - Quedó información parcial después del fallo.'
      );

      process.exitCode = 1;

    }
    finally {

      client.release();

      await pool.end();

    }

  };


ejecutar()
  .catch(
    error => {

      console.error(
        '\nError ejecutando la prueba:',
        error
      );

      process.exit(1);

    }
  );