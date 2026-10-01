const pool = require('../src/config/db');

const {
  INSCRIPCION_ID
} = process.env;


if (!INSCRIPCION_ID) {

  console.error(
    'Falta INSCRIPCION_ID'
  );

  process.exit(1);

}


const ejecutar = async () => {

  const client =
    await pool.connect();
let estadoInicial = null;

  try {

    // ==================================================
    // 1. ESTADO INICIAL
    // ==================================================

    const antes =
      await client.query(
        `
        SELECT
          i.id_inscripcion,
          i.id_oportunidad,
          i.estado,
          o.cupo_total,
          (
            SELECT COUNT(*)::int
            FROM inscripcion i2
            WHERE i2.id_oportunidad = i.id_oportunidad
              AND i2.estado = 'ACEPTADA'
          ) AS aceptadas
        FROM inscripcion i
        INNER JOIN oportunidad o
          ON o.id_oportunidad = i.id_oportunidad
        WHERE i.id_inscripcion = $1
        `,
        [INSCRIPCION_ID]
      );


    if (
      antes.rows.length === 0
    ) {

      throw new Error(
        'La inscripción no existe'
      );

    }


    estadoInicial =
      antes.rows[0];


    console.log(
      '\nEstado inicial:',
      estadoInicial.estado
    );

    console.log(
      'Aceptadas antes:',
      estadoInicial.aceptadas
    );

    console.log(
      'Cupo total:',
      estadoInicial.cupo_total
    );


    if (
      estadoInicial.estado !==
      'PENDIENTE'
    ) {

      throw new Error(
        'La inscripción debe estar PENDIENTE para ejecutar esta prueba'
      );

    }


    // ==================================================
    // 2. INICIAR TRANSACCIÓN
    // ==================================================

    await client.query(
      'BEGIN'
    );


    // ==================================================
    // 3. BLOQUEAR OPORTUNIDAD
    // ==================================================

    await client.query(
      `
      SELECT o.id_oportunidad
      FROM oportunidad o
      WHERE o.id_oportunidad = $1
      FOR UPDATE
      `,
      [
        estadoInicial.id_oportunidad
      ]
    );


    // ==================================================
    // 4. REALIZAR ESCRITURA PARCIAL
    // ==================================================

    await client.query(
      `
      UPDATE inscripcion
      SET
        estado = 'ACEPTADA',
        respondida_en = NOW(),
        actualizada_en = NOW()
      WHERE id_inscripcion = $1
      `,
      [INSCRIPCION_ID]
    );


    console.log(
      '\nCambio parcial realizado dentro de la transacción.'
    );


    // ==================================================
    // 5. PROVOCAR FALLO CONTROLADO
    // ==================================================

    throw new Error(
      'Fallo controlado antes del COMMIT'
    );

  }
  catch (error) {

    console.log(
      '\nFallo esperado:',
      error.message
    );


    try {

      await client.query(
        'ROLLBACK'
      );

      console.log(
        'ROLLBACK ejecutado.'
      );

    }
    catch (rollbackError) {

      console.error(
        'Error durante ROLLBACK:',
        rollbackError
      );

    }


    // ==================================================
    // 6. VERIFICAR ESTADO POSTERIOR
    // ==================================================

    const despues =
      await client.query(
        `
        SELECT
          i.estado,
          o.cupo_total,
          (
            SELECT COUNT(*)::int
            FROM inscripcion i2
            WHERE i2.id_oportunidad = i.id_oportunidad
              AND i2.estado = 'ACEPTADA'
          ) AS aceptadas
        FROM inscripcion i
        INNER JOIN oportunidad o
          ON o.id_oportunidad = i.id_oportunidad
        WHERE i.id_inscripcion = $1
        `,
        [INSCRIPCION_ID]
      );


    const estadoFinal =
      despues.rows[0];


    console.log(
      '\nEstado después:',
      estadoFinal.estado
    );

    console.log(
      'Aceptadas después:',
      estadoFinal.aceptadas
    );


    const rollbackCorrecto =

      estadoFinal.estado ===
        'PENDIENTE' &&

      estadoFinal.aceptadas ===
        estadoInicial.aceptadas;


    if (
      rollbackCorrecto
    ) {

      console.log(
        '\nOK - ROLLBACK correcto. No quedó ningún cambio parcial.'
      );

      process.exitCode = 0;

    }
    else {

      console.error(
        '\nERROR - Quedó información parcial luego del fallo.'
      );

      process.exitCode = 1;

    }

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