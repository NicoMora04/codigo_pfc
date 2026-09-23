const inscripcionService = require('../services/inscripcionService');

const inscribirse = async (req, res) => {
  try {
    const { id_oportunidad } = req.body;

    if (!id_oportunidad) {
      return res.status(400).json({
        mensaje: 'El id de la oportunidad es obligatorio',
      });
    }

    // El voluntario se obtiene del usuario autenticado,
    // no desde datos enviados libremente por el cliente.
    const idVoluntario = req.user.id;

    const inscripcion = await inscripcionService.inscribirse(
      id_oportunidad,
      idVoluntario
    );

    return res.status(201).json({
      mensaje: 'Inscripción realizada correctamente',
      inscripcion,
    });
  } catch (error) {
    console.error('Error al realizar inscripción:', error);

    return res.status(error.status || 500).json({
      mensaje: error.message || 'Error interno del servidor',
    });
  }
};

const listarMisInscripciones = async (req, res) => {
  try {
    const idVoluntario = req.user.id;

    const inscripciones =
      await inscripcionService.listarMisInscripciones(idVoluntario);

    return res.status(200).json(inscripciones);
  } catch (error) {
    console.error('Error al obtener inscripciones:', error);

    return res.status(error.status || 500).json({
      mensaje: error.message || 'Error interno del servidor',
    });
  }
};

// ======================================================
// LISTAR INSCRIPCIONES DE UNA OPORTUNIDAD DE LA ORGANIZACIÓN
// ======================================================

const listarPorOportunidadOrganizacion = async (
  req,
  res
) => {

  try {

    const idOportunidad =
      req.params.idOportunidad;

    const idOrganizacion =
      req.organizacion.id_organizacion;


    const inscripciones =
      await inscripcionService
        .listarPorOportunidadOrganizacion(
          idOportunidad,
          idOrganizacion
        );


    return res.status(200).json({
      inscripciones
    });

  }
  catch (error) {

    console.error(
      'Error al obtener inscripciones de la oportunidad:',
      error
    );


    return res.status(
      error.status || 500
    ).json({
      mensaje:
        error.message ||
        'Error interno del servidor'
    });

  }

};

// ======================================================
// ACEPTAR INSCRIPCIÓN
// ======================================================

const aceptarInscripcion = async (
  req,
  res
) => {

  try {

    const idInscripcion =
      req.params.idInscripcion;

    const idOrganizacion =
      req.organizacion.id_organizacion;


    const inscripcion =
      await inscripcionService
        .aceptarInscripcion(
          idInscripcion,
          idOrganizacion
        );


    return res.status(200).json({
      mensaje:
        'Inscripción aceptada correctamente',
      inscripcion
    });

  }
  catch (error) {

    console.error(
      'Error al aceptar inscripción:',
      error
    );


    return res.status(
      error.status || 500
    ).json({
      mensaje:
        error.message ||
        'Error interno del servidor'
    });

  }

};

// ======================================================
// RECHAZAR INSCRIPCIÓN
// ======================================================

const rechazarInscripcion = async (
  req,
  res
) => {

  try {

    const idInscripcion =
      req.params.idInscripcion;

    const idOrganizacion =
      req.organizacion.id_organizacion;


    const inscripcion =
      await inscripcionService
        .rechazarInscripcion(
          idInscripcion,
          idOrganizacion
        );


    return res.status(200).json({
      mensaje:
        'Inscripción rechazada correctamente',
      inscripcion
    });

  }
  catch (error) {

    console.error(
      'Error al rechazar inscripción:',
      error
    );


    return res.status(
      error.status || 500
    ).json({
      mensaje:
        error.message ||
        'Error interno del servidor'
    });

  }

};

const ocultarInscripcionVoluntario =
  async (req, res) => {

    try {

      const {
        idInscripcion
      } = req.params;

      const idVoluntario =
        req.user.id;

      const inscripcion =
        await inscripcionService
          .ocultarInscripcionVoluntario(
            idInscripcion,
            idVoluntario
          );

      return res.status(200).json({
        mensaje:
          'La inscripción se ocultó correctamente',
        inscripcion,
      });

    }
    catch (error) {

      return res
        .status(error.status || 500)
        .json({
          error:
            error.message ||
            'No se pudo ocultar la inscripción',
        });

    }

  };

  // ======================================================
// CANCELAR INSCRIPCIÓN POR EL VOLUNTARIO
// ======================================================

const cancelarInscripcionVoluntario = async (
  req,
  res
) => {

  try {

    const {
      idInscripcion
    } = req.params;

    const idVoluntario =
      req.user.id;

    const inscripcion =
      await inscripcionService
        .cancelarInscripcionVoluntario(
          idInscripcion,
          idVoluntario
        );

    return res.status(200).json({
      mensaje:
        'La inscripción fue cancelada correctamente',
      inscripcion
    });

  }
  catch (error) {

    return res.status(
      error.status || 500
    ).json({
      error:
        error.message ||
        'No se pudo cancelar la inscripción'
    });

  }

};

// ======================================================
// MARCAR RESULTADO DE PARTICIPACIÓN
// ORGANIZACIÓN
// ======================================================

const marcarResultadoParticipacion = async (
  req,
  res
) => {

  try {

    const {
      idInscripcion
    } = req.params;

    const {
      estado
    } = req.body;

    const idOrganizacion =
      req.organizacion.id_organizacion;

    const inscripcion =
      await inscripcionService
        .marcarResultadoParticipacion(
          idInscripcion,
          idOrganizacion,
          estado
        );

    return res.status(200).json({
      mensaje:
        'Resultado de participación actualizado correctamente',
      inscripcion
    });

  }
  catch (error) {

    return res.status(
      error.status || 500
    ).json({
      error:
        error.message ||
        'No se pudo actualizar el resultado de participación'
    });

  }

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