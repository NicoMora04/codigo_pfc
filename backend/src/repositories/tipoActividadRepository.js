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