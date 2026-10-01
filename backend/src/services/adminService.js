const adminRepository =
  require('../repositories/adminRepository');


// ======================================================
// LISTAR ORGANIZACIONES PENDIENTES
// ======================================================

exports.listarOrganizacionesPendientes = async () => {

  return await adminRepository
    .listarOrganizacionesPendientes();

};


// ======================================================
// APROBAR ORGANIZACIÓN
// ======================================================

exports.aprobarOrganizacion =
  async (idOrganizacion) => {

    const organizacion =
      await adminRepository
        .aprobarOrganizacion(
          idOrganizacion
        );

    if (!organizacion) {

      const error = new Error(
        'Organización no encontrada o ya procesada'
      );

      error.status = 404;

      throw error;

    }

    return organizacion;

  };


// ======================================================
// RECHAZAR ORGANIZACIÓN
// ======================================================

exports.rechazarOrganizacion =
  async (
    idOrganizacion,
    motivo
  ) => {

    if (
      !motivo ||
      !motivo.trim()
    ) {

      const error = new Error(
        'El motivo del rechazo es obligatorio'
      );

      error.status = 400;

      throw error;

    }


    const organizacion =
      await adminRepository
        .rechazarOrganizacion(
          idOrganizacion,
          motivo.trim()
        );


    if (!organizacion) {

      const error = new Error(
        'Organización no encontrada o ya procesada'
      );

      error.status = 404;

      throw error;

    }


    return organizacion;

  };


// ======================================================
// BLOQUEAR USUARIO
// ======================================================

exports.bloquearUsuario =
  async (
    idUsuario,
    motivo
  ) => {

    if (
      !motivo ||
      !motivo.trim()
    ) {

      const error = new Error(
        'El motivo del bloqueo es obligatorio'
      );

      error.status = 400;

      throw error;

    }


    const usuario =
      await adminRepository
        .bloquearUsuario(
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

exports.rehabilitarUsuario =
  async (idUsuario) => {

    const usuario =
      await adminRepository
        .rehabilitarUsuario(
          idUsuario
        );


    if (!usuario) {

      const error = new Error(
        'Usuario no encontrado o la cuenta no está bloqueada'
      );

      error.status = 404;

      throw error;

    }


    return usuario;

  };