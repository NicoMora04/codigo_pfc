const oportunidadRepository =
  require('../repositories/oportunidadRepository');

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// ======================================================
// CREAR OPORTUNIDAD
// ======================================================

exports.crearOportunidad = async (datos) => {

  const {
    idTipoActividad,
    idUbicacion,
    titulo,
    descripcion,
    requisitos,
    cupoTotal,
    fechaInicio,
    fechaFin,
    urgencia,
    tipoUbicacion,
    radioKm
  } = datos;


  // Validaciones básicas

        if (
    !Number.isInteger(idTipoActividad) ||
    idTipoActividad <= 0 || idTipoActividad > 32767
    ) {
    const error = new Error(
        'El tipo de actividad debe ser un identificador válido'
    );

    error.status = 400;
    throw error;
    }

        const tipoActividadExiste =
        await oportunidadRepository.existeTipoActividad(idTipoActividad);

        if (!tipoActividadExiste) {
        const error = new Error(
            'El tipo de actividad indicado no existe'
        );

        error.status = 400;
        throw error;
        }

        if (typeof titulo !== 'string' ||typeof descripcion !== 'string' ||titulo.trim() === '' ||descripcion.trim() === '') {
        const error = new Error(
        'El título y la descripción son obligatorios'
        );

    error.status = 400;
    throw error;
    }
        if (titulo.trim().length > 150) {
    const error = new Error(
        'El título no puede superar los 150 caracteres'
    );

    error.status = 400;
    throw error;
    }

        if (
    requisitos != null &&
    typeof requisitos !== 'string'
    ) {
    const error = new Error(
        'Los requisitos deben ser un texto'
    );

    error.status = 400;
    throw error;
    }

        if (idUbicacion!=null) {
            
            if (
                typeof idUbicacion !== 'string' ||
                !uuidRegex.test(idUbicacion)
            ) {
                const error = new Error(
                'El identificador de ubicación no es válido'
                );

                error.status = 400;
                throw error;
            }
    const ubicacionExiste =
        await oportunidadRepository.existeUbicacion(idUbicacion);

    if (!ubicacionExiste) {
        const error = new Error(
        'La ubicación indicada no existe'
        );

        error.status = 400;
        throw error;
    }

}
if (
  tipoUbicacion != null &&
  idUbicacion == null
) {
  const error = new Error(
    'Debe indicarse una ubicación cuando se define el tipo de ubicación'
  );

  error.status = 400;
  throw error;
}

       if (
    idUbicacion != null &&
    tipoUbicacion == null
    ) {
    const error = new Error(
        'Debe indicarse el tipo de ubicación cuando se define una ubicación'
    );

    error.status = 400;
    throw error;
    }


    if (!Number.isInteger(cupoTotal) ||cupoTotal <= 0) {
    const error = new Error(
        'El cupo total debe ser un número entero mayor que cero'
    );

    error.status = 400;
    throw error;
    }

    if (!fechaInicio || !fechaFin) {
    const error = new Error(
        'La fecha de inicio y la fecha de fin son obligatorias'
    );

    error.status = 400;
    throw error;
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
    const error = new Error(
        'Las fechas indicadas no son válidas'
    );

    error.status = 400;
    throw error;
    }

    if (fin < inicio) {
    const error = new Error(
        'La fecha de fin no puede ser anterior a la fecha de inicio'
    );

    error.status = 400;
    throw error;
    }


  if (!['BAJA', 'MEDIA', 'ALTA'].includes(urgencia)) {
    const error = new Error(
      'La urgencia indicada no es válida'
    );

    error.status = 400;
    throw error;
  }


  if (
    tipoUbicacion!=null &&
    !['EXACTA', 'RADIO'].includes(tipoUbicacion)
  ) {
    const error = new Error(
      'El tipo de ubicación indicado no es válido'
    );

    error.status = 400;
    throw error;
  }


    if (
    tipoUbicacion === 'RADIO' &&
    (
        typeof radioKm !== 'number' ||
        !Number.isFinite(radioKm) ||
        radioKm <= 0||radioKm>999.99
    )
    ) {
    const error = new Error(
        'El radio debe ser un número mayor que cero y menor o igual a 999.99 km'
    );

    error.status = 400;
    throw error;
    }


  if (
    tipoUbicacion === 'EXACTA' &&
    radioKm != null
  ) {
    const error = new Error(
      'Una ubicación exacta no debe indicar radio'
    );

    error.status = 400;
    throw error;
  }

  if (
  tipoUbicacion == null &&
  radioKm != null
) {
  const error = new Error(
    'No se puede indicar un radio sin definir el tipo de ubicación'
  );

  error.status = 400;
  throw error;
}


  const oportunidad =
    await oportunidadRepository.crearOportunidad(datos);

  return oportunidad;

};


// ======================================================
// ACTUALIZAR OPORTUNIDAD
// ======================================================

exports.actualizarOportunidad = async (
  idOportunidad,
  idOrganizacion,
  datos
) => {

        if (
    typeof idOportunidad !== 'string' ||
    !uuidRegex.test(idOportunidad)
    ) {
    const error = new Error(
        'El identificador de oportunidad no es válido'
    );

    error.status = 400;
    throw error;
    }

  const oportunidad =
    await oportunidadRepository.buscarOportunidadPorId(idOportunidad);

  if (!oportunidad) {
    const error = new Error(
      'La oportunidad indicada no existe'
    );

    error.status = 404;
    throw error;
  }

  if (oportunidad.id_organizacion !== idOrganizacion) {
    const error = new Error(
      'No tenés permisos para modificar esta oportunidad'
    );

    error.status = 403;
    throw error;
  }
  if (oportunidad.estado !== 'BORRADOR') {

  const error = new Error(
    'Solo se pueden modificar oportunidades en estado BORRADOR'
  );

  error.status = 409;
  throw error;
}

    const {
    idTipoActividad,
    idUbicacion,
    titulo,
    descripcion,
    requisitos,
    cupoTotal,
    fechaInicio,
    fechaFin,
    urgencia,
    tipoUbicacion,
    radioKm
    } = datos;

        if (
    !Number.isInteger(idTipoActividad) ||
    idTipoActividad <= 0 || idTipoActividad > 32767
    ) {
    const error = new Error(
        'El tipo de actividad debe ser un identificador válido'
    );

    error.status = 400;
    throw error;
    }

    const tipoActividadExiste =
    await oportunidadRepository.existeTipoActividad(idTipoActividad);

    if (!tipoActividadExiste) {
    const error = new Error(
        'El tipo de actividad indicado no existe'
    );

    error.status = 400;
    throw error;
    }

    if (idUbicacion!=null) {

    if (
        typeof idUbicacion !== 'string' ||
        !uuidRegex.test(idUbicacion)
    ) {
        const error = new Error(
        'El identificador de ubicación no es válido'
        );

        error.status = 400;
        throw error;
    }

  const ubicacionExiste =
    await oportunidadRepository.existeUbicacion(idUbicacion);

  if (!ubicacionExiste) {
    const error = new Error(
      'La ubicación indicada no existe'
    );

    error.status = 400;
    throw error;
  }

    }

    if (
    typeof titulo !== 'string' ||
    typeof descripcion !== 'string' ||
    titulo.trim() === '' ||
    descripcion.trim() === ''
    ) {
    const error = new Error(
        'El título y la descripción son obligatorios'
    );

    error.status = 400;
    throw error;
    }

    if (titulo.trim().length > 150) {
    const error = new Error(
        'El título no puede superar los 150 caracteres'
    );
    error.status = 400;
  throw error;
}

    if (
    requisitos != null &&
    typeof requisitos !== 'string'
    ) {
    const error = new Error(
        'Los requisitos deben ser un texto'
    );

    error.status = 400;
    throw error;
    }

    if (
    !Number.isInteger(cupoTotal) ||
    cupoTotal <= 0
    ) {
    const error = new Error(
        'El cupo total debe ser un número entero mayor que cero'
    );

    error.status = 400;
    throw error;
    }

        // Validación de fechas
    if (!fechaInicio || !fechaFin) {
    const error = new Error(
        'La fecha de inicio y la fecha de fin son obligatorias'
    );

    error.status = 400;
    throw error;
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
    const error = new Error(
        'Las fechas indicadas no son válidas'
    );

    error.status = 400;
    throw error;
    }

    if (fin < inicio) {
    const error = new Error(
        'La fecha de fin no puede ser anterior a la fecha de inicio'
    );

    error.status = 400;
    throw error;
    }


    // Validación de urgencia
    if (!['BAJA', 'MEDIA', 'ALTA'].includes(urgencia)) {
    const error = new Error(
        'La urgencia indicada no es válida'
    );

    error.status = 400;
    throw error;
    }


    // Validación de ubicación
    if (
    tipoUbicacion !=null &&
    !['EXACTA', 'RADIO'].includes(tipoUbicacion)
    ) {
    const error = new Error(
        'El tipo de ubicación indicado no es válido'
    );

    error.status = 400;
    throw error;
    }

    if (
        tipoUbicacion != null &&
        idUbicacion == null
        ) {
        const error = new Error(
            'Debe indicarse una ubicación cuando se define el tipo de ubicación'
        );

        error.status = 400;
        throw error;
    }

        if (
    idUbicacion != null &&
    tipoUbicacion == null
    ) {
    const error = new Error(
        'Debe indicarse el tipo de ubicación cuando se define una ubicación'
    );

    error.status = 400;
    throw error;
    }


    if (
    tipoUbicacion === 'RADIO' &&
    (
        typeof radioKm !== 'number' ||
        !Number.isFinite(radioKm) ||
        radioKm <= 0||radioKm>999.99
    )
    ) {
    const error = new Error(
        'El radio debe ser un número mayor que cero y menor o igual a 999.99 km'
    );

    error.status = 400;
    throw error;
    }

    if (
    tipoUbicacion === 'EXACTA' &&
    radioKm != null
    ) {
    const error = new Error(
        'Una ubicación exacta no debe indicar radio'
    );

    error.status = 400;
    throw error;
    }

    if (
    tipoUbicacion == null &&
    radioKm != null
    ) {
    const error = new Error(
        'No se puede indicar un radio sin definir el tipo de ubicación'
    );

    error.status = 400;
    throw error;
    }
    
    const oportunidadActualizada = await oportunidadRepository.actualizarOportunidad(
    idOportunidad,
    datos
  );

return oportunidadActualizada;

};


// ======================================================
// CANCELAR OPORTUNIDAD
// ======================================================

exports.cancelarOportunidad = async (
  idOportunidad,
  idOrganizacion
) => {

    if (
  typeof idOportunidad !== 'string' ||
  !uuidRegex.test(idOportunidad)
) {
  const error = new Error(
    'El identificador de oportunidad no es válido'
  );

  error.status = 400;
  throw error;
}

  const oportunidad =
    await oportunidadRepository.buscarOportunidadPorId(idOportunidad);

  if (!oportunidad) {
    const error = new Error(
      'La oportunidad indicada no existe'
    );

    error.status = 404;
    throw error;
  }

  if (oportunidad.id_organizacion !== idOrganizacion) {
    const error = new Error(
      'No tenés permisos para cancelar esta oportunidad'
    );

    error.status = 403;
    throw error;
  }

  if (
    !['BORRADOR', 'PUBLICADA'].includes(oportunidad.estado)
  ) {
    const error = new Error(
      'La oportunidad no puede cancelarse en su estado actual'
    );

    error.status = 409;
    throw error;
  }

  const oportunidadCancelada =
    await oportunidadRepository.cancelarOportunidad(idOportunidad);

  return oportunidadCancelada;
};


// ======================================================
// PUBLICAR OPORTUNIDAD
// ======================================================

exports.publicarOportunidad = async (
  idOportunidad,
  idOrganizacion
) => {

        if (
    typeof idOportunidad !== 'string' ||
    !uuidRegex.test(idOportunidad)
    ) {
    const error = new Error(
        'El identificador de oportunidad no es válido'
    );

    error.status = 400;
    throw error;
    }
  const oportunidad =
    await oportunidadRepository.buscarOportunidadPorId(idOportunidad);

  if (!oportunidad) {
    const error = new Error(
      'La oportunidad indicada no existe'
    );

    error.status = 404;
    throw error;
  }

  if (oportunidad.id_organizacion !== idOrganizacion) {
    const error = new Error(
      'No tenés permisos para publicar esta oportunidad'
    );

    error.status = 403;
    throw error;
  }

  if (oportunidad.estado !== 'BORRADOR') {
    const error = new Error(
      'Solo se pueden publicar oportunidades en estado borrador'
    );

    error.status = 409;
    throw error;
  }

  if (
    !oportunidad.id_ubicacion ||
    !oportunidad.tipo_ubicacion
  ) {
    const error = new Error(
      'La oportunidad debe tener una ubicación definida antes de publicarse'
    );

    error.status = 400;
    throw error;
  }

  const oportunidadPublicada =
    await oportunidadRepository.publicarOportunidad(idOportunidad);

  return oportunidadPublicada;
};

// ======================================================
// LISTAR OPORTUNIDADES DE LA ORGANIZACIÓN
// ======================================================

exports.listarOportunidadesOrganizacion = async (
  idOrganizacion
) => {

  const oportunidades =
    await oportunidadRepository.buscarOportunidadesPorOrganizacion(
      idOrganizacion
    );

  return oportunidades;
};

// ======================================================
// OBTENER OPORTUNIDAD DE LA ORGANIZACIÓN
// ======================================================

exports.obtenerOportunidadOrganizacion = async (
  idOportunidad,
  idOrganizacion
) => {

  if (
    typeof idOportunidad !== 'string' ||
    !uuidRegex.test(idOportunidad)
  ) {
    const error = new Error(
      'El identificador de oportunidad no es válido'
    );

    error.status = 400;
    throw error;
  }

  const oportunidad =
    await oportunidadRepository.buscarOportunidadPorId(
      idOportunidad
    );

  if (!oportunidad) {
    const error = new Error(
      'La oportunidad indicada no existe'
    );

    error.status = 404;
    throw error;
  }

  if (
    oportunidad.id_organizacion !== idOrganizacion
  ) {
    const error = new Error(
      'No tenés permisos para consultar esta oportunidad'
    );

    error.status = 403;
    throw error;
  }

  return oportunidad;
};


exports.cerrarOportunidad = async (
  idOportunidad,
  idOrganizacion
) => {

    if (
    typeof idOportunidad !== 'string' ||
    !uuidRegex.test(idOportunidad)
  ) {
    const error = new Error(
      'El identificador de oportunidad no es válido'
    );

    error.status = 400;
    throw error;
  }

  const oportunidad =
    await oportunidadRepository.buscarOportunidadPorId(
      idOportunidad
    );

  if (!oportunidad) {
    const error = new Error(
      'La oportunidad no existe'
    );
    error.status = 404;
    throw error;
  }

  if (
    oportunidad.id_organizacion !==
    idOrganizacion
  ) {
    const error = new Error(
      'No tenés permiso para modificar esta oportunidad'
    );
    error.status = 403;
    throw error;
  }

  if (oportunidad.estado !== 'PUBLICADA') {
    const error = new Error(
      'Solo se puede cerrar una oportunidad publicada'
    );
    error.status = 409;
    throw error;
  }

  return await oportunidadRepository.cerrarOportunidad(
    idOportunidad
  );
};


exports.finalizarOportunidad = async (
  idOportunidad,
  idOrganizacion
) => {

  if (
    typeof idOportunidad !== 'string' ||
    !uuidRegex.test(idOportunidad)
  ) {
    const error = new Error(
      'El identificador de oportunidad no es válido'
    );

    error.status = 400;
    throw error;
  }

  const oportunidad =
    await oportunidadRepository.buscarOportunidadPorId(
      idOportunidad
    );

  if (!oportunidad) {
    const error = new Error(
      'La oportunidad no existe'
    );
    error.status = 404;
    throw error;
  }

  if (
    oportunidad.id_organizacion !==
    idOrganizacion
  ) {
    const error = new Error(
      'No tenés permiso para modificar esta oportunidad'
    );
    error.status = 403;
    throw error;
  }

  if (oportunidad.estado !== 'CERRADA') {
    const error = new Error(
      'Solo se puede finalizar una oportunidad cerrada'
    );
    error.status = 409;
    throw error;
  }

  return await oportunidadRepository.finalizarOportunidad(
    idOportunidad
  );
};



exports.obtenerOportunidadesPublicadas = async (filtros = {}) => {

  const filtrosNormalizados = {};
    
  if (filtros.nombre != null) {

    const nombre =
      String(filtros.nombre).trim();

    if (nombre.length > 150) {
      const error = new Error(
        'El nombre de búsqueda no puede superar los 150 caracteres'
      );

      error.status = 400;
      throw error;
    }

    if (nombre !== '') {
      filtrosNormalizados.nombre = nombre;
    }
  }

  if (filtros.tipoActividad != null) {

    const idTipoActividad =
      Number(filtros.tipoActividad);

    if (
      !Number.isInteger(idTipoActividad) ||
      idTipoActividad <= 0 ||
      idTipoActividad > 32767
    ) {
      const error = new Error(
        'El tipo de actividad no es válido'
      );
      error.status = 400;
      throw error;
    }

    const existeTipo =
      await oportunidadRepository.existeTipoActividad(
        idTipoActividad
      );

    if (!existeTipo) {
      const error = new Error(
        'El tipo de actividad no existe'
      );
      error.status = 400;
      throw error;
    }

    filtrosNormalizados.tipoActividad =
      idTipoActividad;
  }

  if (filtros.urgencia != null) {

    const urgencia =
      String(filtros.urgencia).trim().toUpperCase();

    const urgenciasValidas = [
      'BAJA',
      'MEDIA',
      'ALTA'
    ];

  if (!urgenciasValidas.includes(urgencia)) {
      const error = new Error(
        'La urgencia no es válida'
      );
      error.status = 400;
      throw error;
    }

    filtrosNormalizados.urgencia = urgencia;
  }

  if (filtros.fecha != null) {

  const fecha = String(filtros.fecha).trim();

  const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

  if (!formatoFecha.test(fecha)) {
    const error = new Error(
      'La fecha no es válida'
    );
    error.status = 400;
    throw error;
  }

  const fechaParseada = new Date(`${fecha}T00:00:00Z`);

  if (
    Number.isNaN(fechaParseada.getTime()) ||
    fechaParseada.toISOString().slice(0, 10) !== fecha
  ) {
    const error = new Error(
      'La fecha no es válida'
    );
    error.status = 400;
    throw error;
  }

  filtrosNormalizados.fecha = fecha;
}


const tieneLatitud = filtros.latitud != null;
const tieneLongitud = filtros.longitud != null;
const tieneRadioBusqueda = filtros.radioBusquedaKm != null;

const cantidadParametrosUbicacion = [
  tieneLatitud,
  tieneLongitud,
  tieneRadioBusqueda
].filter(Boolean).length;

if (
  cantidadParametrosUbicacion > 0 &&
  cantidadParametrosUbicacion < 3
) {
  const error = new Error(
    'Para filtrar por ubicación se requieren latitud, longitud y radio de búsqueda'
  );
  error.status = 400;
  throw error;
}

if (cantidadParametrosUbicacion === 3) {

  const latitud = Number(filtros.latitud);
  const longitud = Number(filtros.longitud);
  const radioBusquedaKm = Number(filtros.radioBusquedaKm);

  if (
    !Number.isFinite(latitud) ||
    latitud < -90 ||
    latitud > 90
  ) {
    const error = new Error(
      'La latitud no es válida'
    );
    error.status = 400;
    throw error;
  }

  if (
    !Number.isFinite(longitud) ||
    longitud < -180 ||
    longitud > 180
  ) {
    const error = new Error(
      'La longitud no es válida'
    );
    error.status = 400;
    throw error;
  }

  if (
    !Number.isFinite(radioBusquedaKm) ||
    radioBusquedaKm <= 0
  ) {
    const error = new Error(
      'El radio de búsqueda no es válido'
    );
    error.status = 400;
    throw error;
  }

  filtrosNormalizados.latitud = latitud;
  filtrosNormalizados.longitud = longitud;
  filtrosNormalizados.radioBusquedaKm = radioBusquedaKm;
}



  const oportunidades =
    await oportunidadRepository.buscarOportunidadesPublicadas(
      filtrosNormalizados
    );

  return oportunidades;
};



// ======================================================
// OBTENER DETALLE DE OPORTUNIDAD PARA VOLUNTARIO
// ======================================================

exports.obtenerDetalleOportunidadVoluntario = async (
  idOportunidad
) => {

  if (
    typeof idOportunidad !== 'string' ||
    !uuidRegex.test(idOportunidad)
  ) {
    const error = new Error(
      'El identificador de oportunidad no es válido'
    );

    error.status = 400;
    throw error;
  }

  const oportunidad =
    await oportunidadRepository.buscarOportunidadPublicadaPorId(
      idOportunidad
    );

  if (!oportunidad) {
    const error = new Error(
      'La oportunidad no existe o no está disponible'
    );

    error.status = 404;
    throw error;
  }

  return oportunidad;
};