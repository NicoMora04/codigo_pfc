const adminRepository =
  require('../repositories/adminRepository');


// ======================================================
// BLOQUEAR USUARIO
// ======================================================

exports.bloquearUsuario = async (idUsuario, motivo) => {

  if (!motivo || !motivo.trim()) {
    const error = new Error(
      'El motivo del bloqueo es obligatorio'
    );
    error.status = 400;
    throw error;
  }

  const usuario =
    await adminRepository.bloquearUsuario(
      idUsuario,
      motivo.trim()
    );

  if (!usuario) {
    const error = new Error(
      'Usuario no encontrado o la cuenta no está activa'
    );
    error.status = 404;
    throw error;
  }

  return usuario;
};


// ======================================================
// REHABILITAR USUARIO
// ======================================================

exports.rehabilitarUsuario = async (idUsuario) => {

  const usuario =
    await adminRepository.rehabilitarUsuario(idUsuario);

  if (!usuario) {

    const error = new Error(
      'Usuario no encontrado o la cuenta no está bloqueada'
    );

    error.status = 404;

    throw error;
  }

  return usuario;

};