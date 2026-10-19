const pool = require('../config/db');

// ======================================================
// BUSCAR CALIFICACIÓN POR INSCRIPCIÓN Y ROL
// ======================================================

const buscarPorInscripcionYRol = async (
  idInscripcion,
  autorRol
) => {

  const query = `
    SELECT *
    FROM calificacion
    WHERE id_inscripcion = $1
      AND autor_rol = $2;
  `;

  const { rows } = await pool.query(
    query,
    [idInscripcion, autorRol]
  );

  return rows[0] || null;

};


// ======================================================
// CREAR CALIFICACIÓN
// ======================================================

const crear = async (
  idInscripcion,
  autorRol,
  puntuacion,
  comentario
) => {

  const query = `
    INSERT INTO calificacion (
      id_inscripcion,
      autor_rol,
      puntuacion,
      comentario
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const { rows } = await pool.query(
    query,
    [
      idInscripcion,
      autorRol,
      puntuacion,
      comentario
    ]
  );

  return rows[0];

};

// ======================================================
// OBTENER RESUMEN DE REPUTACIÓN DEL VOLUNTARIO
// ACTIVIDAD 3.2.1
// ======================================================

const obtenerResumenVoluntario = async (
  idVoluntario
) => {

  const query = `
    SELECT
      ROUND(
        AVG(c.puntuacion)::numeric,
        1
      ) AS promedio,

      COUNT(*)::integer AS cantidad

    FROM calificacion c

    INNER JOIN inscripcion i
      ON i.id_inscripcion = c.id_inscripcion

    WHERE i.id_voluntario = $1
      AND i.estado = 'COMPLETADA'
      AND c.autor_rol = 'ORGANIZACION';
  `;

  const { rows } = await pool.query(
    query,
    [idVoluntario]
  );

  return {
    promedio:
      rows[0].promedio === null
        ? null
        : Number(rows[0].promedio),

    cantidad: rows[0].cantidad
  };

};

// ======================================================
// LISTAR CALIFICACIONES RECIBIDAS POR VOLUNTARIO
// ACTIVIDAD 3.2.1
// ======================================================

const listarCalificacionesVoluntario = async (
  idVoluntario
) => {

  const query = `
    SELECT
      c.id_calificacion,
      c.puntuacion,
      c.comentario,
      c.creada_en,

      o.id_oportunidad,
      o.titulo AS oportunidad_titulo,

      org.razon_social AS organizacion_nombre

    FROM calificacion c

    INNER JOIN inscripcion i
      ON i.id_inscripcion = c.id_inscripcion

    INNER JOIN oportunidad o
      ON o.id_oportunidad = i.id_oportunidad

    INNER JOIN organizacion org
      ON org.id_organizacion = o.id_organizacion

    WHERE i.id_voluntario = $1
      AND i.estado = 'COMPLETADA'
      AND c.autor_rol = 'ORGANIZACION'

    ORDER BY c.creada_en DESC;
  `;

  const { rows } = await pool.query(
    query,
    [idVoluntario]
  );

  return rows;

};

// ======================================================
// OBTENER RESUMEN DE REPUTACIÓN DE UNA ORGANIZACIÓN
// ACTIVIDAD 3.2.2
// ======================================================

const obtenerResumenOrganizacionPorUsuario = async (
  idUsuario
) => {

  const query = `
    SELECT
      ROUND(
        AVG(c.puntuacion)::numeric,
        1
      ) AS promedio,

      COUNT(*)::integer AS cantidad

    FROM calificacion c

    INNER JOIN inscripcion i
      ON i.id_inscripcion = c.id_inscripcion

    INNER JOIN oportunidad o
      ON o.id_oportunidad = i.id_oportunidad

    INNER JOIN organizacion org
      ON org.id_organizacion = o.id_organizacion

    WHERE org.id_usuario = $1
      AND i.estado = 'COMPLETADA'
      AND c.autor_rol = 'VOLUNTARIO';
  `;

  const { rows } = await pool.query(
    query,
    [idUsuario]
  );

  return {
    promedio:
      rows[0].promedio === null
        ? null
        : Number(rows[0].promedio),

    cantidad: rows[0].cantidad
  };

};

// ======================================================
// LISTAR CALIFICACIONES RECIBIDAS POR ORGANIZACIÓN
// ACTIVIDAD 3.2.2
// ======================================================

const listarCalificacionesOrganizacionPorUsuario = async (
  idUsuario
) => {

  const query = `
    SELECT
      c.id_calificacion,
      c.puntuacion,
      c.comentario,
      c.creada_en,

      o.id_oportunidad,
      o.titulo AS oportunidad_titulo

    FROM calificacion c

    INNER JOIN inscripcion i
      ON i.id_inscripcion = c.id_inscripcion

    INNER JOIN oportunidad o
      ON o.id_oportunidad = i.id_oportunidad

    INNER JOIN organizacion org
      ON org.id_organizacion = o.id_organizacion

    WHERE org.id_usuario = $1
      AND i.estado = 'COMPLETADA'
      AND c.autor_rol = 'VOLUNTARIO'

    ORDER BY
      c.creada_en DESC,
      c.id_calificacion DESC;
  `;

  const { rows } = await pool.query(
    query,
    [idUsuario]
  );

  return rows;

};

module.exports = {
  buscarPorInscripcionYRol,
  crear,
  obtenerResumenVoluntario,
  listarCalificacionesVoluntario,
  obtenerResumenOrganizacionPorUsuario,
  listarCalificacionesOrganizacionPorUsuario
};