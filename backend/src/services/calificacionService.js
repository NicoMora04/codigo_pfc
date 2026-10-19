const calificacionRepository =
  require('../repositories/calificacionRepository');

const inscripcionRepository =
  require('../repositories/inscripcionRepository');

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


// ======================================================
// CALIFICAR VOLUNTARIO POR ORGANIZACIÓN
// ACTIVIDAD 3.2.1
// ======================================================

const calificarVoluntario = async (
  idInscripcion,
  idOrganizacion,
  puntuacion,
  comentario
) => {

  // 1. Validar identificador de inscripción

  if (
    typeof idInscripcion !== 'string' ||
    !uuidRegex.test(idInscripcion)
  ) {

    const error = new Error(
      'El identificador de inscripción no es válido'
    );

    error.status = 400;
    throw error;
  }


  // 2. Validar puntuación entre 1 y 5

  if (
    !Number.isInteger(puntuacion) ||
    puntuacion < 1 ||
    puntuacion > 5
  ) {

    const error = new Error(
      'La puntuación debe ser un número entero entre 1 y 5'
    );

    error.status = 400;
    throw error;
  }


  // 3. Validar comentario opcional

  if (
    comentario != null &&
    typeof comentario !== 'string'
  ) {

    const error = new Error(
      'El comentario debe ser un texto'
    );

    error.status = 400;
    throw error;
  }

  const comentarioNormalizado =
    typeof comentario === 'string'
      ? comentario.trim()
      : '';

  if (comentarioNormalizado.length > 1000) {

    const error = new Error(
      'El comentario no puede superar los 1000 caracteres'
    );

    error.status = 400;
    throw error;
  }


  // 4. Verificar existencia de inscripción

  const inscripcion =
    await inscripcionRepository.buscarPorId(
      idInscripcion
    );

  if (!inscripcion) {

    const error = new Error(
      'La inscripción no existe'
    );

    error.status = 404;
    throw error;
  }


  // 5. Verificar propiedad de la oportunidad

  if (
    inscripcion.id_organizacion !==
    idOrganizacion
  ) {

    const error = new Error(
      'No tenés permisos para calificar a este voluntario'
    );

    error.status = 403;
    throw error;
  }


  // 6. Verificar participación completada

  if (
    inscripcion.estado !== 'COMPLETADA'
  ) {

    const error = new Error(
      'Solo se pueden calificar voluntarios que hayan completado la actividad'
    );

    error.status = 409;
    throw error;
  }


  // 7. Comprobar si ya existe una calificación

  const calificacionExistente =
    await calificacionRepository.buscarPorInscripcionYRol(
      idInscripcion,
      'ORGANIZACION'
    );

  if (calificacionExistente) {

    const error = new Error(
      'Ya calificaste a este voluntario por esta participación'
    );

    error.status = 409;
    throw error;
  }


  // 8. Registrar calificación

  try {

    const calificacion =
      await calificacionRepository.crear(
        idInscripcion,
        'ORGANIZACION',
        puntuacion,
        comentarioNormalizado || null
      );

    return calificacion;

  } catch (error) {

    // Protección ante solicitudes simultáneas
    // que intenten crear la misma calificación.

    if (
      error.code === '23505' &&
      error.constraint ===
        'uq_calificacion_inscripcion_autor'
    ) {

      const duplicateError = new Error(
        'Ya calificaste a este voluntario por esta participación'
      );

      duplicateError.status = 409;
      throw duplicateError;
    }

    throw error;
  }

};

// ======================================================
// OBTENER MI REPUTACIÓN COMO VOLUNTARIO
// ACTIVIDAD 3.2.1
// ======================================================

const obtenerMiReputacionVoluntario = async (
  idVoluntario
) => {

  // 1. Obtener promedio y cantidad de valoraciones
  const resumen =
    await calificacionRepository.obtenerResumenVoluntario(
      idVoluntario
    );

  // 2. Obtener calificaciones individuales
  const calificaciones =
    await calificacionRepository.listarCalificacionesVoluntario(
      idVoluntario
    );

  // 3. Devolver información completa
  return {
    resumen,
    calificaciones
  };

};

// ======================================================
// CALIFICAR ORGANIZACIÓN COMO VOLUNTARIO
// ACTIVIDAD 3.2.2
// ======================================================

const calificarOrganizacion = async (
  idInscripcion,
  idVoluntario,
  puntuacion,
  comentario
) => {

  // ====================================================
  // 1. VALIDAR IDENTIFICADOR DE INSCRIPCIÓN
  // ====================================================

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (
    !uuidRegex.test(idInscripcion)
  ) {

    const error = new Error(
      'El identificador de inscripción no es válido'
    );

    error.status = 400;

    throw error;

  }


  // ====================================================
  // 2. VALIDAR PUNTUACIÓN
  // ====================================================

  if (
    !Number.isInteger(puntuacion) ||
    puntuacion < 1 ||
    puntuacion > 5
  ) {

    const error = new Error(
      'La puntuación debe ser un número entero entre 1 y 5'
    );

    error.status = 400;

    throw error;

  }


  // ====================================================
  // 3. VALIDAR COMENTARIO
  // ====================================================

  if (
    comentario !== undefined &&
    comentario !== null &&
    typeof comentario !== 'string'
  ) {

    const error = new Error(
      'El comentario debe ser un texto'
    );

    error.status = 400;

    throw error;

  }


  const comentarioNormalizado =
    typeof comentario === 'string'
      ? comentario.trim()
      : '';


  if (
    comentarioNormalizado.length > 1000
  ) {

    const error = new Error(
      'El comentario no puede superar los 1000 caracteres'
    );

    error.status = 400;

    throw error;

  }


  // ====================================================
  // 4. BUSCAR INSCRIPCIÓN
  // ====================================================

  const inscripcion =
    await inscripcionRepository.buscarPorId(
      idInscripcion
    );


  if (!inscripcion) {

    const error = new Error(
      'La inscripción no existe'
    );

    error.status = 404;

    throw error;

  }


  // ====================================================
  // 5. VERIFICAR TITULARIDAD
  // ====================================================

  if (
    String(inscripcion.id_voluntario) !==
    String(idVoluntario)
  ) {

    const error = new Error(
      'No tenés permisos para calificar esta organización'
    );

    error.status = 403;

    throw error;

  }


  // ====================================================
  // 6. VERIFICAR PARTICIPACIÓN COMPLETADA
  // ====================================================

  if (
    inscripcion.estado !== 'COMPLETADA'
  ) {

    const error = new Error(
      'Solo podés calificar organizaciones de actividades completadas'
    );

    error.status = 409;

    throw error;

  }


  // ====================================================
  // 7. VERIFICAR CALIFICACIÓN EXISTENTE
  // ====================================================

  const calificacionExistente =
    await calificacionRepository.buscarPorInscripcionYRol(
      idInscripcion,
      'VOLUNTARIO'
    );


  if (calificacionExistente) {

    const error = new Error(
      'Ya calificaste a esta organización por esta actividad'
    );

    error.status = 409;

    throw error;

  }


  // ====================================================
  // 8. REGISTRAR CALIFICACIÓN
  // ====================================================

  try {

    const calificacion =
      await calificacionRepository.crear(
        idInscripcion,
        'VOLUNTARIO',
        puntuacion,
        comentarioNormalizado || null
      );


    return calificacion;

  }
  catch (error) {

    // Evitar duplicados ante solicitudes simultáneas

    if (
      error.code === '23505' &&
      error.constraint ===
        'uq_calificacion_inscripcion_autor'
    ) {

      const conflicto = new Error(
        'Ya calificaste a esta organización por esta actividad'
      );

      conflicto.status = 409;

      throw conflicto;

    }

    throw error;

  }

};

// ======================================================
// OBTENER MI REPUTACIÓN COMO ORGANIZACIÓN
// ACTIVIDAD 3.2.2
// ======================================================

const obtenerMiReputacionOrganizacion = async (
  idUsuario
) => {

  // ====================================================
  // 1. OBTENER PROMEDIO Y CANTIDAD DE VALORACIONES
  // ====================================================

  const resumen =
    await calificacionRepository
      .obtenerResumenOrganizacionPorUsuario(
        idUsuario
      );


  // ====================================================
  // 2. OBTENER VALORACIONES RECIBIDAS
  // ====================================================

  const calificaciones =
    await calificacionRepository
      .listarCalificacionesOrganizacionPorUsuario(
        idUsuario
      );


  // ====================================================
  // 3. DEVOLVER INFORMACIÓN COMPLETA
  // ====================================================

  return {
    resumen,
    calificaciones
  };

};

module.exports = {
  calificarVoluntario,
  obtenerMiReputacionVoluntario,
  calificarOrganizacion,
  obtenerMiReputacionOrganizacion
};