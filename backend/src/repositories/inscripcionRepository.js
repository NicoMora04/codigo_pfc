const pool = require('../config/db');

const buscarPorOportunidadYVoluntario = async (idOportunidad, idVoluntario) => {
  const query = `
    SELECT *
    FROM inscripcion
    WHERE id_oportunidad = $1
      AND id_voluntario = $2
  `;

  const { rows } = await pool.query(query, [idOportunidad, idVoluntario]);

  return rows[0] || null;
};



const crear = async (idOportunidad, idVoluntario) => {
  const query = `
    INSERT INTO inscripcion (
      id_oportunidad,
      id_voluntario
    )
    VALUES ($1, $2)
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [
    idOportunidad,
    idVoluntario,
  ]);

  return rows[0];
};

const listarPorVoluntario = async (idVoluntario) => {
  const query = `
    SELECT
      i.*,
      o.titulo AS oportunidad_titulo,
      o.descripcion AS oportunidad_descripcion,
      o.fecha_inicio,
      o.fecha_fin,
      o.estado AS oportunidad_estado
    FROM inscripcion i
    INNER JOIN oportunidad o
      ON o.id_oportunidad = i.id_oportunidad
    WHERE i.id_voluntario = $1
    AND i.ocultada_en IS NULL
    ORDER BY i.inscrita_en DESC;
  `;

  const { rows } = await pool.query(query, [idVoluntario]);

  return rows;
};

// ======================================================
// LISTAR INSCRIPCIONES DE UNA OPORTUNIDAD
// ======================================================

const listarPorOportunidad = async (
  idOportunidad
) => {

  const query = `
    SELECT
      i.id_inscripcion,
      i.id_oportunidad,
      i.id_voluntario,
      i.estado,
      i.inscrita_en,
      i.respondida_en,
      i.actualizada_en,
      pv.nombre AS voluntario_nombre,
      pv.apellido AS voluntario_apellido
    FROM inscripcion i
    INNER JOIN perfil_voluntario pv
      ON pv.id_usuario = i.id_voluntario
    WHERE i.id_oportunidad = $1
    ORDER BY
      CASE i.estado
        WHEN 'PENDIENTE' THEN 1
        WHEN 'ACEPTADA' THEN 2
        WHEN 'RECHAZADA' THEN 3
        WHEN 'CANCELADA' THEN 4
        WHEN 'COMPLETADA' THEN 5
        WHEN 'AUSENTE' THEN 6
        ELSE 7
      END,
      i.inscrita_en ASC;
  `;

  const { rows } = await pool.query(
    query,
    [idOportunidad]
  );

  return rows;
};

// ======================================================
// BUSCAR INSCRIPCIÓN POR ID
// ======================================================

const buscarPorId = async (
  idInscripcion
) => {

  const query = `
    SELECT
      i.*,
      o.id_organizacion,
      o.cupo_total,
      o.estado AS oportunidad_estado,
      o.fecha_inicio
    FROM inscripcion i
    INNER JOIN oportunidad o
      ON o.id_oportunidad = i.id_oportunidad
    WHERE i.id_inscripcion = $1;
  `;

  const { rows } = await pool.query(
    query,
    [idInscripcion]
  );

  return rows[0] || null;
};


// ======================================================
// ACEPTAR INSCRIPCIÓN CON CONTROL DE CUPO
// ======================================================

const aceptarConControlCupo = async (
  idInscripcion
) => {

  const client =
    await pool.connect();

  try {

    await client.query(
      'BEGIN'
    );


    // 1. Obtener y bloquear la oportunidad asociada
    const resultadoInscripcion =
      await client.query(
        `
        SELECT
          i.id_inscripcion,
          i.id_oportunidad,
          i.estado,
          o.cupo_total
        FROM inscripcion i
        INNER JOIN oportunidad o
          ON o.id_oportunidad = i.id_oportunidad
        WHERE i.id_inscripcion = $1
        FOR UPDATE OF o;
        `,
        [idInscripcion]
      );


    if (
      resultadoInscripcion.rows.length === 0
    ) {

      const error =
        new Error(
          'La inscripción no existe'
        );

      error.status = 404;

      throw error;
    }


    const inscripcion =
      resultadoInscripcion.rows[0];


    // 2. Contar únicamente inscripciones ACEPTADAS
    const resultadoCupo =
      await client.query(
        `
        SELECT COUNT(*)::int AS aceptadas
        FROM inscripcion
        WHERE id_oportunidad = $1
          AND estado = 'ACEPTADA';
        `,
        [
          inscripcion.id_oportunidad
        ]
      );


    const aceptadas =
      resultadoCupo.rows[0].aceptadas;


    // 3. Verificar capacidad
    if (
      aceptadas >=
      inscripcion.cupo_total
    ) {

      const error =
        new Error(
          'No hay cupos disponibles para aceptar esta inscripción'
        );

      error.status = 409;

      throw error;
    }


    // 4. Aceptar inscripción
    const resultadoActualizacion =
      await client.query(
        `
        UPDATE inscripcion
        SET
          estado = 'ACEPTADA',
          respondida_en = NOW(),
          actualizada_en = NOW()
        WHERE id_inscripcion = $1
          AND estado = 'PENDIENTE'
        RETURNING *;
        `,
        [idInscripcion]
      );


    if (
      resultadoActualizacion.rows.length === 0
    ) {

      const error =
        new Error(
          'La inscripción ya no se encuentra pendiente'
        );

      error.status = 409;

      throw error;
    }


    await client.query(
      'COMMIT'
    );


    return resultadoActualizacion
      .rows[0];

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
// RECHAZAR INSCRIPCIÓN
// ======================================================

const rechazar = async (
  idInscripcion
) => {

  const query = `
    UPDATE inscripcion
    SET
      estado = 'RECHAZADA',
      respondida_en = NOW(),
      actualizada_en = NOW()
    WHERE id_inscripcion = $1
      AND estado = 'PENDIENTE'
    RETURNING *;
  `;

  const { rows } =
    await pool.query(
      query,
      [idInscripcion]
    );

  return rows[0] || null;
};

// ======================================================
// CONTAR INSCRIPCIONES ACEPTADAS DE UNA OPORTUNIDAD
// ======================================================

const contarAceptadasPorOportunidad = async (
  idOportunidad
) => {

  const query = `
    SELECT COUNT(*)::int AS cantidad
    FROM inscripcion
    WHERE id_oportunidad = $1
      AND estado = 'ACEPTADA';
  `;

  const { rows } =
    await pool.query(
      query,
      [idOportunidad]
    );

  return rows[0].cantidad;
};

// ======================================================
// CANCELAR INSCRIPCIÓN POR EL VOLUNTARIO
// ======================================================

const cancelarPorVoluntario = async (
  idInscripcion
) => {

  const query = `
    UPDATE inscripcion
    SET
      estado = 'CANCELADA',
      actualizada_en = NOW()
    WHERE id_inscripcion = $1
      AND estado IN (
        'PENDIENTE',
        'ACEPTADA'
      )
    RETURNING *;
  `;

  const { rows } =
    await pool.query(
      query,
      [idInscripcion]
    );

  return rows[0] || null;
};

// ======================================================
// MARCAR RESULTADO DE PARTICIPACIÓN
// ======================================================

const marcarResultadoParticipacion = async (
  idInscripcion,
  nuevoEstado
) => {

  const query = `
    UPDATE inscripcion
    SET
      estado = $2,
      actualizada_en = NOW()
    WHERE id_inscripcion = $1
      AND estado = 'ACEPTADA'
    RETURNING *;
  `;

  const { rows } =
    await pool.query(
      query,
      [
        idInscripcion,
        nuevoEstado
      ]
    );

  return rows[0] || null;
};

const ocultarParaVoluntario = async (
  idInscripcion
) => {

  const query = `
    UPDATE inscripcion i
    SET
      ocultada_en = NOW(),
      actualizada_en = NOW()
    WHERE i.id_inscripcion = $1
      AND i.ocultada_en IS NULL
      AND (
        i.estado IN (
          'RECHAZADA',
          'CANCELADA'
        )
        OR EXISTS (
          SELECT 1
          FROM oportunidad o
          WHERE o.id_oportunidad = i.id_oportunidad
            AND o.estado = 'CANCELADA'
        )
      )
    RETURNING i.*;
  `;

  const { rows } =
    await pool.query(
      query,
      [idInscripcion]
    );

  return rows[0] || null;

};

module.exports = {
  buscarPorOportunidadYVoluntario,
  crear,
  listarPorVoluntario,
  listarPorOportunidad,
  buscarPorId,
  aceptarConControlCupo,
  rechazar,
  contarAceptadasPorOportunidad,
  ocultarParaVoluntario,
  cancelarPorVoluntario,
  marcarResultadoParticipacion
};

