const inscripcionRepository = require('../repositories/inscripcionRepository');
const oportunidadRepository = require('../repositories/oportunidadRepository');
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const inscribirse = async (idOportunidad, idVoluntario) => {
  // 1. Verificar que la oportunidad exista
  const oportunidad = await oportunidadRepository.buscarOportunidadPorId(idOportunidad);

  if (!oportunidad) {
    const error = new Error('La oportunidad no existe');
    error.status = 404;
    throw error;
  }

  // 2. Solo se admiten inscripciones en oportunidades publicadas
  if (oportunidad.estado !== 'PUBLICADA') {
    const error = new Error('La oportunidad no admite inscripciones');
    error.status = 400;
    throw error;
  }

 
    const ahora = new Date();
    const fechaInicio = new Date(oportunidad.fecha_inicio);

    if (fechaInicio <= ahora) {
        const error = new Error('La oportunidad ya comenzó o se encuentra vencida');
        error.status = 400;
        throw error;
    }

  // 3. Verificar que el voluntario no tenga ya una inscripción
  const inscripcionExistente =
    await inscripcionRepository.buscarPorOportunidadYVoluntario(
      idOportunidad,
      idVoluntario
    );

  if (inscripcionExistente) {
    const error = new Error('Ya estás inscripto en esta oportunidad');
    error.status = 409;
    throw error;
  }

  // 4. Verificar que la oportunidad todavía tenga cupo disponible
const cantidadAceptadas =
  await inscripcionRepository
    .contarAceptadasPorOportunidad(
      idOportunidad
    );

if (
  cantidadAceptadas >=
  oportunidad.cupo_total
) {

  const error =
    new Error(
      'La oportunidad no tiene cupos disponibles'
    );

  error.status = 409;

  throw error;
}

// 5. Crear la inscripción en estado PENDIENTE
try {

  return await inscripcionRepository.crear(
    idOportunidad,
    idVoluntario
  );

}
catch (error) {

  if (
    error.code === '23505' &&
    error.constraint ===
      'uq_inscripcion_oportunidad_voluntario'
  ) {

    const duplicateError =
      new Error(
        'Ya estás inscripto en esta oportunidad'
      );

    duplicateError.status = 409;

    throw duplicateError;

  }

  throw error;

}
};



const listarMisInscripciones = async (idVoluntario) => {
  return inscripcionRepository.listarPorVoluntario(idVoluntario);
};

// ======================================================
// LISTAR INSCRIPCIONES DE UNA OPORTUNIDAD DE LA ORGANIZACIÓN
// ======================================================

const listarPorOportunidadOrganizacion = async (
  idOportunidad,
  idOrganizacion
) => {

  const oportunidad =
    await oportunidadRepository.buscarOportunidadPorId(
      idOportunidad
    );

  if (!oportunidad) {

    const error =
      new Error(
        'La oportunidad no existe'
      );

    error.status = 404;

    throw error;
  }


  if (
    oportunidad.id_organizacion !==
    idOrganizacion
  ) {

    const error =
      new Error(
        'No tenés permisos para consultar las inscripciones de esta oportunidad'
      );

    error.status = 403;

    throw error;
  }


  return await inscripcionRepository
    .listarPorOportunidad(
      idOportunidad
    );
};


// ======================================================
// ACEPTAR INSCRIPCIÓN
// ======================================================

const aceptarInscripcion = async (
  idInscripcion,
  idOrganizacion
) => {

  // 1. Validar identificador
  if (
    typeof idInscripcion !== 'string' ||
    !uuidRegex.test(idInscripcion)
  ) {

    const error =
      new Error(
        'El identificador de inscripción no es válido'
      );

    error.status = 400;

    throw error;
  }


  // 2. Verificar existencia
  const inscripcion =
    await inscripcionRepository.buscarPorId(
      idInscripcion
    );


  if (!inscripcion) {

    const error =
      new Error(
        'La inscripción no existe'
      );

    error.status = 404;

    throw error;
  }


  // 3. Verificar propiedad de la oportunidad
  if (
    inscripcion.id_organizacion !==
    idOrganizacion
  ) {

    const error =
      new Error(
        'No tenés permisos para gestionar esta inscripción'
      );

    error.status = 403;

    throw error;
  }


  // 4. Solo puede aceptarse una solicitud pendiente
  if (
    inscripcion.estado !==
    'PENDIENTE'
  ) {

    const error =
      new Error(
        'Solo se pueden aceptar inscripciones pendientes'
      );

    error.status = 409;

    throw error;
  }


  // 5. Aceptar con control transaccional del cupo
  return await inscripcionRepository
    .aceptarConControlCupo(
      idInscripcion
    );
};


// ======================================================
// RECHAZAR INSCRIPCIÓN
// ======================================================

const rechazarInscripcion = async (
  idInscripcion,
  idOrganizacion
) => {

  if (
    typeof idInscripcion !== 'string' ||
    !uuidRegex.test(idInscripcion)
  ) {

    const error =
      new Error(
        'El identificador de inscripción no es válido'
      );

    error.status = 400;

    throw error;
  }


  const inscripcion =
    await inscripcionRepository.buscarPorId(
      idInscripcion
    );


  if (!inscripcion) {

    const error =
      new Error(
        'La inscripción no existe'
      );

    error.status = 404;

    throw error;
  }


  if (
    inscripcion.id_organizacion !==
    idOrganizacion
  ) {

    const error =
      new Error(
        'No tenés permisos para gestionar esta inscripción'
      );

    error.status = 403;

    throw error;
  }


  if (
    inscripcion.estado !==
    'PENDIENTE'
  ) {

    const error =
      new Error(
        'Solo se pueden rechazar inscripciones pendientes'
      );

    error.status = 409;

    throw error;
  }


  const inscripcionRechazada =
    await inscripcionRepository.rechazar(
      idInscripcion
    );


  if (!inscripcionRechazada) {

    const error =
      new Error(
        'La inscripción ya no se encuentra pendiente'
      );

    error.status = 409;

    throw error;
  }


  return inscripcionRechazada;
};

const ocultarInscripcionVoluntario = async (
  idInscripcion,
  idVoluntario
) => {

  if (!uuidRegex.test(idInscripcion)) {
    const error =
      new Error('El identificador de la inscripción no es válido');

    error.status = 400;
    throw error;
  }

  const inscripcion =
    await inscripcionRepository.buscarPorId(
      idInscripcion
    );

  if (!inscripcion) {
    const error =
      new Error('La inscripción no existe');

    error.status = 404;
    throw error;
  }

  if (
    inscripcion.id_voluntario !==
    idVoluntario
  ) {
    const error =
      new Error(
        'No tenés permisos para ocultar esta inscripción'
      );

    error.status = 403;
    throw error;
  }

  if (
    inscripcion.estado !== 'RECHAZADA' &&
    inscripcion.estado !== 'CANCELADA' &&
    inscripcion.oportunidad_estado !== 'CANCELADA'
  ) {
    const error =
      new Error(
        'Solo se pueden ocultar inscripciones rechazadas o canceladas'
      );

    error.status = 409;
    throw error;
  }

  const inscripcionOcultada =
    await inscripcionRepository
      .ocultarParaVoluntario(
        idInscripcion
      );

  if (!inscripcionOcultada) {
    const error =
      new Error(
        'La inscripción ya no puede ocultarse'
      );

    error.status = 409;
    throw error;
  }

  return inscripcionOcultada;

};

// ======================================================
// CANCELAR INSCRIPCIÓN POR EL VOLUNTARIO
// ======================================================

const cancelarInscripcionVoluntario = async (
  idInscripcion,
  idVoluntario
) => {

  // 1. Validar identificador
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


  // 2. Buscar inscripción
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


  // 3. Verificar que pertenezca al voluntario autenticado
  if (
    inscripcion.id_voluntario !==
    idVoluntario
  ) {

    const error = new Error(
      'No tenés permisos para cancelar esta inscripción'
    );

    error.status = 403;
    throw error;
  }


  // 4. Solo PENDIENTE o ACEPTADA
  if (
    ![
      'PENDIENTE',
      'ACEPTADA'
    ].includes(inscripcion.estado)
  ) {

    const error = new Error(
      'La inscripción no puede cancelarse en su estado actual'
    );

    error.status = 409;
    throw error;
  }


  // 5. La actividad no debe estar cancelada ni finalizada
  if (
    [
      'CANCELADA',
      'FINALIZADA'
    ].includes(
      inscripcion.oportunidad_estado
    )
  ) {

    const error = new Error(
      'No se puede cancelar la inscripción porque la actividad ya fue cancelada o finalizada'
    );

    error.status = 409;
    throw error;
  }


  // 6. Verificar límite de 3 días
  const fechaInicio =
    new Date(
      inscripcion.fecha_inicio
    );

  const fechaLimite =
    new Date(
      fechaInicio.getTime() -
      3 * 24 * 60 * 60 * 1000
    );

  const ahora =
    new Date();


  if (
    ahora > fechaLimite
  ) {

    const error = new Error(
      'La inscripción solo puede cancelarse hasta 3 días antes del inicio de la actividad'
    );

    error.status = 409;
    throw error;
  }


  // 7. Cancelar
  const inscripcionCancelada =
    await inscripcionRepository
      .cancelarPorVoluntario(
        idInscripcion
      );


  if (!inscripcionCancelada) {

    const error = new Error(
      'La inscripción ya no puede cancelarse'
    );

    error.status = 409;
    throw error;
  }


  return inscripcionCancelada;

};

// ======================================================
// MARCAR RESULTADO DE PARTICIPACIÓN
// ORGANIZACIÓN
// ======================================================

const marcarResultadoParticipacion = async (
  idInscripcion,
  idOrganizacion,
  nuevoEstado
) => {

  // 1. Validar ID
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


  // 2. Validar estado solicitado
  if (
    ![
      'COMPLETADA',
      'AUSENTE'
    ].includes(nuevoEstado)
  ) {

    const error = new Error(
      'El resultado de participación no es válido'
    );

    error.status = 400;
    throw error;
  }


  // 3. Buscar inscripción
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


  // 4. Verificar propiedad de la oportunidad
  if (
    inscripcion.id_organizacion !==
    idOrganizacion
  ) {

    const error = new Error(
      'No tenés permisos para modificar esta inscripción'
    );

    error.status = 403;
    throw error;
  }


  // 5. Solo inscripciones aceptadas
  if (
    inscripcion.estado !== 'ACEPTADA'
  ) {

    const error = new Error(
      'Solo se puede registrar asistencia sobre una inscripción aceptada'
    );

    error.status = 409;
    throw error;
  }


  // 6. La actividad debe estar finalizada
  if (
    inscripcion.oportunidad_estado !==
    'FINALIZADA'
  ) {

    const error = new Error(
      'La asistencia solo puede registrarse cuando la actividad está finalizada'
    );

    error.status = 409;
    throw error;
  }


  // 7. Actualizar resultado
  const inscripcionActualizada =
    await inscripcionRepository
      .marcarResultadoParticipacion(
        idInscripcion,
        nuevoEstado
      );


  if (!inscripcionActualizada) {

    const error = new Error(
      'La inscripción ya no puede modificarse'
    );

    error.status = 409;
    throw error;
  }


  return inscripcionActualizada;

};




module.exports = {
  inscribirse,
  listarMisInscripciones,
  listarPorOportunidadOrganizacion,
  aceptarInscripcion,
  rechazarInscripcion,
  ocultarInscripcionVoluntario,
  cancelarInscripcionVoluntario,
  marcarResultadoParticipacion
};
