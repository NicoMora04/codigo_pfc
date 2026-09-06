const pool = require('../config/db');

exports.buscarUbicacion = async (
  latitud,
  longitud,
  localidad,
  provincia,
  esAproximada
) => {

  const result = await pool.query(
    `
    SELECT *
    FROM ubicacion
    WHERE latitud = $1
      AND longitud = $2
      AND localidad IS NOT DISTINCT FROM $3
      AND provincia IS NOT DISTINCT FROM $4
      AND es_aproximada = $5
    LIMIT 1
    `,
    [
      latitud,
      longitud,
      localidad,
      provincia,
      esAproximada
    ]
  );

  return result.rows[0] || null;
};


exports.crearUbicacion = async (
  latitud,
  longitud,
  direccion,
  localidad,
  provincia,
  esAproximada
) => {

  const result = await pool.query(
    `
    INSERT INTO ubicacion (
      latitud,
      longitud,
      direccion,
      localidad,
      provincia,
      es_aproximada
    )
    VALUES ($1, $2, $3, $4, $5,$6)
    RETURNING *
    `,
    [
      latitud,
      longitud,
      direccion,
      localidad,
      provincia,
      esAproximada
    ]
  );

  return result.rows[0];
};



exports.buscarDirecciones = async (texto) => {

  const params = new URLSearchParams({
    text: texto,
    format: 'json',
    lang: 'es',
    filter: 'countrycode:ar',
    limit: '5',
    apiKey: process.env.GEOAPIFY_API_KEY,
  });

  const response = await fetch(
    `https://api.geoapify.com/v1/geocode/autocomplete?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(
      `Error consultando Geoapify: ${response.status}`
    );
  }

  const data = await response.json();

  return Array.isArray(data.results)
  ? data.results
  : [];
};


exports.actualizarDireccion = async (
  idUbicacion,
  direccion
) => {

  const result = await pool.query(
    `
    UPDATE ubicacion
    SET direccion = $1
    WHERE id_ubicacion = $2
    RETURNING *
    `,
    [
      direccion,
      idUbicacion
    ]
  );

  return result.rows[0];
};