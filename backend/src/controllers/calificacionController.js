const calificacionService =
  require('../services/calificacionService');


// ======================================================
// CALIFICAR VOLUNTARIO POR ORGANIZACIÓN
// ACTIVIDAD 3.2.1
// ======================================================

const calificarVoluntario = async (
  req,
  res
) => {

  try {

    // 1. Obtener identificador de inscripción
    const {
      idInscripcion
    } = req.params;


    // 2. Obtener datos de la calificación
    const {
      puntuacion,
      comentario
    } = req.body;


    // 3. Obtener organización autenticada
    const idOrganizacion =
      req.organizacion.id_organizacion;


    // 4. Ejecutar reglas de negocio
    const calificacion =
      await calificacionService.calificarVoluntario(
        idInscripcion,
        idOrganizacion,
        puntuacion,
        comentario
      );


    // 5. Responder con la calificación registrada
    return res.status(201).json({

      mensaje:
        'Voluntario calificado correctamente',

      calificacion

    });

  }
  catch (error) {

    console.error(
      'Error al calificar voluntario:',
      error
    );

    return res.status(
      error.status || 500
    ).json({

      mensaje:
        error.status
          ? error.message
          : 'Error interno del servidor'

    });

  }

};

// ======================================================
// CONSULTAR MI REPUTACIÓN COMO VOLUNTARIO
// ACTIVIDAD 3.2.1
// ======================================================

const obtenerMiReputacionVoluntario = async (
  req,
  res
) => {

  try {

    // 1. Obtener voluntario autenticado
    const idVoluntario = req.user.id;

    // 2. Consultar reputación
    const reputacion =
      await calificacionService.obtenerMiReputacionVoluntario(
        idVoluntario
      );

    // 3. Devolver resultados
    return res.status(200).json(
      reputacion
    );

  }
  catch (error) {

    console.error(
      'Error al consultar reputación del voluntario:',
      error
    );

    return res.status(
      error.status || 500
    ).json({
      mensaje:
        error.status
          ? error.message
          : 'No se pudo obtener la reputación del voluntario'
    });

  }

};

// ======================================================
// CALIFICAR ORGANIZACIÓN COMO VOLUNTARIO
// ACTIVIDAD 3.2.2
// ======================================================

const calificarOrganizacion = async (
  req,
  res
) => {

  try {

    // ==================================================
    // 1. OBTENER DATOS DE LA SOLICITUD
    // ==================================================

    const { idInscripcion } = req.params;

    const {
      puntuacion,
      comentario
    } = req.body;


    // ==================================================
    // 2. OBTENER VOLUNTARIO AUTENTICADO
    // ==================================================

    const idVoluntario =
      req.user.id;


    // ==================================================
    // 3. REGISTRAR CALIFICACIÓN
    // ==================================================

    const calificacion =
      await calificacionService.calificarOrganizacion(
        idInscripcion,
        idVoluntario,
        puntuacion,
        comentario
      );


    // ==================================================
    // 4. DEVOLVER RESULTADO
    // ==================================================

    return res.status(201).json({

      mensaje:
        'Organización calificada correctamente',

      calificacion

    });

  }
  catch (error) {

    console.error(
      'Error al calificar organización:',
      error
    );


    return res.status(
      error.status || 500
    ).json({

      mensaje:
        error.status
          ? error.message
          : 'No se pudo registrar la calificación de la organización'

    });

  }

};

// ======================================================
// CONSULTAR MI REPUTACIÓN COMO ORGANIZACIÓN
// ACTIVIDAD 3.2.2
// ======================================================

const obtenerMiReputacionOrganizacion = async (
  req,
  res
) => {

  try {

    // ==================================================
    // 1. OBTENER USUARIO AUTENTICADO
    // ==================================================

    const idUsuario =
      req.user.id;


    // ==================================================
    // 2. CONSULTAR REPUTACIÓN
    // ==================================================

    const reputacion =
      await calificacionService
        .obtenerMiReputacionOrganizacion(
          idUsuario
        );


    // ==================================================
    // 3. DEVOLVER RESULTADOS
    // ==================================================

    return res.status(200).json(
      reputacion
    );

  }
  catch (error) {

    console.error(
      'Error al consultar reputación de la organización:',
      error
    );


    return res.status(
      error.status || 500
    ).json({

      mensaje:
        error.status
          ? error.message
          : 'No se pudo obtener la reputación de la organización'

    });

  }

};

module.exports = {
  calificarVoluntario,
  obtenerMiReputacionVoluntario,
  calificarOrganizacion,
  obtenerMiReputacionOrganizacion
};