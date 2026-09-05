const ubicacionRepository =
  require('../repositories/ubicacionRepository');

exports.obtenerOCrearUbicacion = async (datos) => {

  const {
    latitud,
    longitud,
    direccion,
    localidad,
    provincia,
    esAproximada
  } = datos;


  // Validación de coordenadas
  if (
    typeof latitud !== 'number' ||
    !Number.isFinite(latitud) ||
    latitud < -90 ||
    latitud > 90
  ) {
    const error = new Error(
      'La latitud indicada no es válida'
    );

    error.status = 400;
    throw error;
  }


  if (
    typeof longitud !== 'number' ||
    !Number.isFinite(longitud) ||
    longitud < -180 ||
    longitud > 180
  ) {
    const error = new Error(
      'La longitud indicada no es válida'
    );

    error.status = 400;
    throw error;
  }


  // Localidad y provincia son opcionales,
  // pero si se informan deben ser texto
  if (
    localidad != null &&
    typeof localidad !== 'string'
  ) {
    const error = new Error(
      'La localidad debe ser un texto'
    );

    error.status = 400;
    throw error;
  }


  if (
    provincia != null &&
    typeof provincia !== 'string'
  ) {
    const error = new Error(
      'La provincia debe ser un texto'
    );

    error.status = 400;
    throw error;
  }

  if (
  direccion != null &&
  (
    typeof direccion !== 'string' ||
    direccion.trim().length === 0 ||
    direccion.trim().length > 255
  )
) {
  const error = new Error(
    'La dirección indicada no es válida'
  );

  error.status = 400;
  throw error;
}


  // Si no viene informado, asumimos false
  const aproximada =
    esAproximada == null
      ? false
      : esAproximada;


  if (typeof aproximada !== 'boolean') {
    const error = new Error(
      'El indicador de ubicación aproximada debe ser booleano'
    );

    error.status = 400;
    throw error;
  }


  // Buscamos si la misma ubicación ya existe
  const ubicacionExistente =
    await ubicacionRepository.buscarUbicacion(
      latitud,
      longitud,
      localidad ?? null,
      provincia ?? null,
      aproximada
    );


 if (ubicacionExistente) {

  if (
    !ubicacionExistente.direccion &&
    direccion?.trim()
  ) {
    return await ubicacionRepository.actualizarDireccion(
      ubicacionExistente.id_ubicacion,
      direccion.trim()
    );
  }

  return ubicacionExistente;
}


  // Si no existe, la creamos
  const nuevaUbicacion =
    await ubicacionRepository.crearUbicacion(
      latitud,
      longitud,
      direccion?.trim() || null,
      localidad ?? null,
      provincia ?? null,
      aproximada
    );

  return nuevaUbicacion;
};


exports.buscarDirecciones = async (texto) => {

  if (!texto || texto.trim().length < 3) {
    const error = new Error(
      'Ingresá al menos 3 caracteres para buscar una ubicación'
    );
    error.status = 400;
    throw error;
  }

  const resultados =
    await ubicacionRepository.buscarDirecciones(
      texto.trim()
    );

  return resultados.map((resultado) => ({
    placeId: resultado.place_id,

    nombre:
      resultado.address_line1 ||
      resultado.formatted,

    detalle: [
      resultado.city,
      resultado.state
    ]
      .filter(Boolean)
      .join(', '),

    latitud: Number(resultado.lat),
    longitud: Number(resultado.lon),

    localidad:
      resultado.city ||
      resultado.town ||
      resultado.village ||
      resultado.municipality ||
      null,

    provincia:
      resultado.state || null,
  }));
};