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

  // ======================================================
// LISTAR USUARIOS
// ======================================================

exports.listarUsuarios = async () => {

  return await adminRepository
    .listarUsuarios();

};


// ======================================================
// ANULAR REGISTRO INVÁLIDO DE ORGANIZACIÓN
// ======================================================

exports.anularRegistroOrganizacion =
  async (
    idOrganizacion,
    motivo
  ) => {

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


    // --------------------------------------------------
    // VALIDAR ID
    // --------------------------------------------------

    if (
      typeof idOrganizacion !== 'string' ||
      !uuidRegex.test(idOrganizacion)
    ) {

      const error = new Error(
        'El identificador de la organización no es válido'
      );

      error.status = 400;

      throw error;

    }


    // --------------------------------------------------
    // VALIDAR MOTIVO
    // --------------------------------------------------

    if (
      typeof motivo !== 'string' ||
      !motivo.trim()
    ) {

      const error = new Error(
        'El motivo de la anulación es obligatorio'
      );

      error.status = 400;

      throw error;

    }


    const resultado =
      await adminRepository
        .anularRegistroOrganizacion(
          idOrganizacion
        );


    // --------------------------------------------------
    // ORGANIZACIÓN INEXISTENTE
    // --------------------------------------------------

    if (
      resultado.resultado ===
      'NO_EXISTE'
    ) {

      const error = new Error(
        'La organización no existe'
      );

      error.status = 404;

      throw error;

    }


    // --------------------------------------------------
    // ESTADO NO PERMITIDO
    // --------------------------------------------------

    if (
      resultado.resultado ===
      'ESTADO_NO_PERMITIDO'
    ) {

      const error = new Error(
        'Solo se pueden anular organizaciones pendientes o rechazadas'
      );

      error.status = 409;

      throw error;

    }


    // --------------------------------------------------
    // EXISTEN REFERENCIAS
    // --------------------------------------------------

    if (
      resultado.resultado ===
      'TIENE_REFERENCIAS'
    ) {

      const error = new Error(
        'La organización posee información asociada y no puede ser anulada'
      );

      error.status = 409;

      throw error;

    }


    return {
      organizacion:
        resultado.organizacion,

      motivo:
        motivo.trim()
    };

  };