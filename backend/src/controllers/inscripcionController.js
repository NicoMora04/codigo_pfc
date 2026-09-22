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

module.exports = {
  inscribirse,
  listarMisInscripciones,
};