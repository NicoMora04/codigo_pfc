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
    ORDER BY i.inscrita_en DESC;
  `;

  const { rows } = await pool.query(query, [idVoluntario]);

  return rows;
};

module.exports = {
  buscarPorOportunidadYVoluntario,
  crear,
  listarPorVoluntario
};

