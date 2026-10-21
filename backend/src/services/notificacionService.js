const notificacionRepository =
  require('../repositories/notificacionRepository');


// ======================================================
// VALIDACIONES GENERALES
// ======================================================

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


const crearError = (mensaje, status) => {

  const error = new Error(mensaje);

  error.status = status;

  return error;

};


const validarUUID = (id, nombre) => {

  if (
    typeof id !== 'string' ||
    !uuidRegex.test(id)
  ) {

    throw crearError(
      `El identificador de ${nombre} no es válido`,
      400
    );

  }

};


// ======================================================
// CREAR NOTIFICACIÓN
// ACTIVIDAD 3.3.1
// ======================================================

const crearNotificacion = async ({
  idUsuario,
  titulo,
  mensaje,
  tipo
}) => {

  validarUUID(idUsuario, 'usuario');

  // Validar título

  if (
    typeof titulo !== 'string' ||
    !titulo.trim() ||
    titulo.trim().length > 180
  ) {

    throw crearError(
      'El título de la notificación no es válido',
      400
    );

  }


  // Validar mensaje

  if (
    typeof mensaje !== 'string' ||
    !mensaje.trim()
  ) {

    throw crearError(
      'El mensaje de la notificación es obligatorio',
      400
    );

  }


  // Validar tipo

  if (
    typeof tipo !== 'string' ||
    !tipo.trim() ||
    tipo.trim().length > 50
  ) {

    throw crearError(
      'El tipo de notificación no es válido',
      400
    );

  }


  // Registrar notificación

  return await notificacionRepository.crear(
    idUsuario,
    titulo.trim(),
    mensaje.trim(),
    tipo.trim().toUpperCase()
  );

};


// ======================================================
// LISTAR NOTIFICACIONES DEL USUARIO
// ======================================================

const listarMisNotificaciones = async (
  idUsuario,
  opciones = {}
) => {

  validarUUID(idUsuario, 'usuario');


  const limite = Number(
    opciones.limite ?? 30
  );

  const offset = Number(
    opciones.offset ?? 0
  );


  // Validar paginación

  if (
    !Number.isInteger(limite) ||
    limite < 1 ||
    limite > 100
  ) {

    throw crearError(
      'El límite debe estar entre 1 y 100',
      400
    );

  }


  if (
    !Number.isInteger(offset) ||
    offset < 0
  ) {

    throw crearError(
      'El desplazamiento no es válido',
      400
    );

  }


  return await notificacionRepository
    .listarPorUsuario(
      idUsuario,
      limite,
      offset
    );

};


// ======================================================
// MARCAR NOTIFICACIÓN COMO LEÍDA
// ======================================================

const marcarComoLeida = async (
  idNotificacion,
  idUsuario
) => {

  validarUUID(
    idNotificacion,
    'notificación'
  );

  validarUUID(
    idUsuario,
    'usuario'
  );


  const notificacion =
    await notificacionRepository
      .marcarComoLeida(
        idNotificacion,
        idUsuario
      );


  if (!notificacion) {

    throw crearError(
      'Notificación no encontrada',
      404
    );

  }


  return notificacion;

};


// ======================================================
// CONTAR NOTIFICACIONES NO LEÍDAS
// ======================================================

const contarMisNoLeidas = async (
  idUsuario
) => {

  validarUUID(
    idUsuario,
    'usuario'
  );


  return await notificacionRepository
    .contarNoLeidas(idUsuario);

};


// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  crearNotificacion,
  listarMisNotificaciones,
  marcarComoLeida,
  contarMisNoLeidas
};