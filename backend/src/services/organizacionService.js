const organizacionRepository =
  require('../repositories/organizacionRepository');


// ======================================================
// VOLVER A SOLICITAR VERIFICACIÓN
// ======================================================

exports.solicitarNuevaVerificacion = async (idUsuario) => {

  const organizacion =
    await organizacionRepository.solicitarNuevaVerificacion(
      idUsuario
    );

  if (!organizacion) {

    const error = new Error(
      'La organización no está rechazada o no existe'
    );

    error.status = 400;

    throw error;
  }

  return organizacion;

};