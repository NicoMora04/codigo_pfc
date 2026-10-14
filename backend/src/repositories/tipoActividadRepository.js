const pool =
  require('../config/db'); 

exports.listarTiposActividad = async () => {

  const result = await pool.query(
    `
    SELECT
      id_tipo_actividad,
      nombre
    FROM tipo_actividad
    ORDER BY nombre ASC
    `
  );

  return result.rows;
};

// ======================================================
// BUSCAR TIPO DE ACTIVIDAD POR NOMBRE
// ======================================================

exports.buscarPorNombre =
  async (nombre) => {

    const result =
      await pool.query(
        `
        SELECT
          id_tipo_actividad,
          nombre
        FROM tipo_actividad
        WHERE LOWER(nombre) =
          LOWER($1)
        `,
        [nombre]
      );

    return result.rows[0] || null;

  };


// ======================================================
// CREAR TIPO DE ACTIVIDAD
// ======================================================

exports.crearTipoActividad =
  async (nombre) => {

    const result =
      await pool.query(
        `
        INSERT INTO tipo_actividad (
          nombre
        )
        VALUES ($1)
        RETURNING
          id_tipo_actividad,
          nombre
        `,
        [nombre]
      );

    return result.rows[0];

  };


  // ======================================================
// BUSCAR TIPO DE ACTIVIDAD POR ID
// ======================================================

exports.buscarPorId =
  async (idTipoActividad) => {

    const result =
      await pool.query(
        `
        SELECT
          id_tipo_actividad,
          nombre
        FROM tipo_actividad
        WHERE id_tipo_actividad = $1
        `,
        [idTipoActividad]
      );

    return result.rows[0] || null;

  };


// ======================================================
// ACTUALIZAR TIPO DE ACTIVIDAD
// ======================================================

exports.actualizarTipoActividad =
  async (
    idTipoActividad,
    nombre
  ) => {

    const result =
      await pool.query(
        `
        UPDATE tipo_actividad
        SET
          nombre = $2
        WHERE id_tipo_actividad = $1
        RETURNING
          id_tipo_actividad,
          nombre
        `,
        [
          idTipoActividad,
          nombre
        ]
      );

    return result.rows[0] || null;

  };