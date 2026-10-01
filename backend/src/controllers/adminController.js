const adminService =
  require('../services/adminService');


// ======================================================
// 1. LISTAR ORGANIZACIONES PENDIENTES
// ======================================================

exports.listarOrganizacionesPendientes =
  async (req, res) => {

    try {

      const organizaciones =
        await adminService
          .listarOrganizacionesPendientes();


      return res.status(200).json({
        organizaciones
      });

    }
    catch (error) {

      console.error(
        'ERROR AL LISTAR ORGANIZACIONES PENDIENTES:',
        error
      );


      return res.status(
        error.status || 500
      ).json({
        error:
          error.status
            ? error.message
            : 'No se pudieron obtener las organizaciones pendientes'
      });

    }

  };


// ======================================================
// 2. APROBAR ORGANIZACIÓN
// ======================================================

exports.aprobarOrganizacion =
  async (req, res) => {

    const {
      idOrganizacion
    } = req.params;


    try {

      const organizacion =
        await adminService
          .aprobarOrganizacion(
            idOrganizacion
          );


      return res.status(200).json({

        message:
          'Organización verificada correctamente',

        organizacion

      });

    }
    catch (error) {

      console.error(
        'ERROR AL APROBAR ORGANIZACIÓN:',
        error
      );


      return res.status(
        error.status || 500
      ).json({
        error:
          error.status
            ? error.message
            : 'No se pudo verificar la organización'
      });

    }

  };


// ======================================================
// 3. RECHAZAR ORGANIZACIÓN
// ======================================================

exports.rechazarOrganizacion =
  async (req, res) => {

    const {
      idOrganizacion
    } = req.params;


    const {
      motivo
    } = req.body;


    try {

      const organizacion =
        await adminService
          .rechazarOrganizacion(
            idOrganizacion,
            motivo
          );


      return res.status(200).json({

        message:
          'Organización rechazada correctamente',

        organizacion

      });

    }
    catch (error) {

      console.error(
        'ERROR AL RECHAZAR ORGANIZACIÓN:',
        error
      );


      return res.status(
        error.status || 500
      ).json({
        error:
          error.status
            ? error.message
            : 'No se pudo rechazar la organización'
      });

    }

  };


// ======================================================
// 4. BLOQUEAR USUARIO
// ======================================================

exports.bloquearUsuario =
  async (req, res) => {

    const {
      idUsuario
    } = req.params;


    const {
      motivo
    } = req.body;


    try {

      const usuario =
        await adminService
          .bloquearUsuario(
            idUsuario,
            motivo
          );


      return res.status(200).json({

        message:
          'Usuario bloqueado correctamente',

        usuario

      });

    }
    catch (error) {

      console.error(
        'ERROR AL BLOQUEAR USUARIO:',
        error
      );


      return res.status(
        error.status || 500
      ).json({
        error:
          error.status
            ? error.message
            : 'No se pudo bloquear el usuario'
      });

    }

  };


// ======================================================
// 5. REHABILITAR USUARIO
// ======================================================

exports.rehabilitarUsuario =
  async (req, res) => {

    const {
      idUsuario
    } = req.params;


    try {

      const usuario =
        await adminService
          .rehabilitarUsuario(
            idUsuario
          );


      return res.status(200).json({

        message:
          'Usuario rehabilitado correctamente',

        usuario

      });

    }
    catch (error) {

      console.error(
        'ERROR AL REHABILITAR USUARIO:',
        error
      );


      return res.status(
        error.status || 500
      ).json({
        error:
          error.status
            ? error.message
            : 'No se pudo rehabilitar el usuario'
      });

    }

  };