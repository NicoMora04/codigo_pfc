const notificacionService =
  require('../services/notificacionService');

const tokenDispositivoService =
  require('../services/tokenDispositivoService');
// ======================================================
// LISTAR MIS NOTIFICACIONES
// ACTIVIDAD 3.3.1
// ======================================================

const listarMisNotificaciones = async (
  req,
  res
) => {

  try {

    // Obtener usuario autenticado mediante JWT

    const idUsuario = req.user.id;

    // Obtener parámetros de paginación

    const {
      limite,
      offset
    } = req.query;

    // Consultar notificaciones

    const notificaciones =
      await notificacionService
        .listarMisNotificaciones(
          idUsuario,
          {
            limite,
            offset
          }
        );

    return res.status(200).json({
      notificaciones
    });

  }
  catch (error) {

    console.error(
      'Error al listar notificaciones:',
      error
    );

    return res.status(
      error.status || 500
    ).json({

      mensaje:
        error.status
          ? error.message
          : 'No se pudieron obtener las notificaciones'

    });

  }

};


// ======================================================
// MARCAR NOTIFICACIÓN COMO LEÍDA
// ======================================================

const marcarComoLeida = async (
  req,
  res
) => {

  try {

    // Usuario autenticado

    const idUsuario = req.user.id;

    // Notificación solicitada

    const {
      idNotificacion
    } = req.params;

    // Actualizar notificación

    const notificacion =
      await notificacionService
        .marcarComoLeida(
          idNotificacion,
          idUsuario
        );

    return res.status(200).json({

      mensaje:
        'Notificación marcada como leída',

      notificacion

    });

  }
  catch (error) {

    console.error(
      'Error al marcar notificación:',
      error
    );

    return res.status(
      error.status || 500
    ).json({

      mensaje:
        error.status
          ? error.message
          : 'No se pudo actualizar la notificación'

    });

  }

};


// ======================================================
// CONTAR MIS NOTIFICACIONES NO LEÍDAS
// ======================================================

const contarMisNoLeidas = async (
  req,
  res
) => {

  try {

    const idUsuario = req.user.id;

    const cantidad =
      await notificacionService
        .contarMisNoLeidas(
          idUsuario
        );

    return res.status(200).json({
      cantidad
    });

  }
  catch (error) {

    console.error(
      'Error al contar notificaciones:',
      error
    );

    return res.status(
      error.status || 500
    ).json({

      mensaje:
        error.status
          ? error.message
          : 'No se pudieron contar las notificaciones'

    });

  }

};

// ======================================================
// REGISTRAR TOKEN DE DISPOSITIVO
// ACTIVIDAD 3.3.1
// ======================================================

const registrarTokenDispositivo = async (
  req,
  res
) => {

  try {

    const idUsuario = req.user.id;

    const {
      token,
      plataforma
    } = req.body;


    const dispositivo =
      await tokenDispositivoService.registrarToken({
        idUsuario,
        token,
        plataforma
      });


    return res.status(200).json({

      mensaje:
        'Dispositivo registrado correctamente',

      dispositivo

    });

  }
  catch (error) {

    console.error(
      'Error al registrar dispositivo:',
      error
    );

    return res.status(
      error.status || 500
    ).json({

      mensaje:
        error.status
          ? error.message
          : 'No se pudo registrar el dispositivo'

    });

  }

};


// ======================================================
// DESACTIVAR TOKEN DE DISPOSITIVO
// ======================================================

const desactivarTokenDispositivo = async (
  req,
  res
) => {

  try {

    const idUsuario = req.user.id;

    const { token } = req.body;


    await tokenDispositivoService.desactivarToken({
      idUsuario,
      token
    });


    return res.status(200).json({

      mensaje:
        'Dispositivo desactivado correctamente'

    });

  }
  catch (error) {

    console.error(
      'Error al desactivar dispositivo:',
      error
    );

    return res.status(
      error.status || 500
    ).json({

      mensaje:
        error.status
          ? error.message
          : 'No se pudo desactivar el dispositivo'

    });

  }

};
// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  listarMisNotificaciones,
  marcarComoLeida,
  contarMisNoLeidas,
  registrarTokenDispositivo,
  desactivarTokenDispositivo
};