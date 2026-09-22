const inscripcionRepository = require('../repositories/inscripcionRepository');
const oportunidadRepository = require('../repositories/oportunidadRepository');

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

  // 4. Crear la inscripción en estado PENDIENTE
  return inscripcionRepository.crear(idOportunidad, idVoluntario);
};



const listarMisInscripciones = async (idVoluntario) => {
  return inscripcionRepository.listarPorVoluntario(idVoluntario);
};


module.exports = {
  inscribirse,
  listarMisInscripciones
};
