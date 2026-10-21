const pool = require('../config/db');

// ======================================================
// OBTENER INTERESES DEL VOLUNTARIO
// ======================================================

const obtenerIntereses = async (
  idVoluntario
) => {

  const result = await pool.query(
    `
    SELECT
      ta.id_tipo_actividad,
      ta.nombre,
      ta.descripcion
    FROM voluntario_tipo_actividad vta
    INNER JOIN tipo_actividad ta
      ON ta.id_tipo_actividad =
        vta.id_tipo_actividad
    WHERE vta.id_voluntario = $1
    ORDER BY ta.nombre ASC
    `,
    [idVoluntario]
  );

  return result.rows;
};


// ======================================================
// REEMPLAZAR INTERESES DEL VOLUNTARIO
// ======================================================

const reemplazarIntereses = async (
  idVoluntario,
  intereses
) => {

  const client =
    await pool.connect();

  try {

    await client.query(
      'BEGIN'
    );

    await client.query(
      `
      DELETE FROM voluntario_tipo_actividad
      WHERE id_voluntario = $1
      `,
      [idVoluntario]
    );


    if (
      intereses.length > 0
    ) {

      await client.query(
        `
        INSERT INTO voluntario_tipo_actividad
          (
            id_voluntario,
            id_tipo_actividad
          )
        SELECT
          $1,
          UNNEST($2::smallint[])
        `,
        [
          idVoluntario,
          intereses
        ]
      );

    }


    await client.query(
      'COMMIT'
    );

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
// VALIDAR TIPOS DE ACTIVIDAD
// ======================================================

const obtenerTiposExistentes = async (
  ids
) => {

  if (
    ids.length === 0
  ) {

    return [];

  }


  const result =
    await pool.query(
      `
      SELECT id_tipo_actividad
      FROM tipo_actividad
      WHERE id_tipo_actividad =
        ANY($1::smallint[])
      `,
      [ids]
    );


  return result.rows.map(
    (fila) =>
      Number(
        fila.id_tipo_actividad
      )
  );

};


module.exports = {
  obtenerIntereses,
  reemplazarIntereses,
  obtenerTiposExistentes
};