const pool = require('../config/db');
const organizacionService =
  require('../services/organizacionService');
  const perfilPublicoService =
  require('../services/perfilPublicoService');

// ======================================================
// 1. CONSULTAR ESTADO DE VERIFICACIÓN
// ======================================================

exports.obtenerEstadoVerificacion = async (req, res) => {

  const idUsuario = req.user.id;

  try {

    const result = await pool.query(
      `
      SELECT
        id_organizacion,
        razon_social,
        estado_verificacion
      FROM organizacion
      WHERE id_usuario = $1
      `,
      [idUsuario]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        error: 'Organización no encontrada'
      });

    }

    return res.status(200).json({
      organizacion: result.rows[0]
    });

  } catch (error) {

    console.error(
      'ERROR AL CONSULTAR ESTADO DE VERIFICACIÓN:',
      error
    );

    return res.status(500).json({
      error: 'No se pudo consultar el estado de verificación'
    });

  }

};


// ======================================================
// 2. VOLVER A SOLICITAR VERIFICACIÓN
// ======================================================

exports.solicitarNuevaVerificacion = async (req, res) => {

  const idUsuario = req.user.id;

  try {

    const organizacion =
      await organizacionService.solicitarNuevaVerificacion(
        idUsuario
      );

    return res.status(200).json({
      message:
        'La organización volvió a ser enviada a revisión',
      organizacion
    });

  } catch (error) {

    console.error(
      'ERROR AL SOLICITAR NUEVA VERIFICACIÓN:',
      error
    );

    return res.status(error.status || 500).json({
      error:
        error.status
          ? error.message
          : 'No se pudo solicitar una nueva verificación'
    });

  }

};

// ======================================================
// ACTUALIZAR DESCRIPCIÓN INSTITUCIONAL
// ACTIVIDAD 3.5.1
// ======================================================

exports.actualizarDescripcionInstitucional =
  async (req, res) => {

    try {

      // ================================================
      // 1. IDENTIFICAR AL USUARIO AUTENTICADO
      // ================================================

      const idUsuario =
        req.user.id;


      // ================================================
      // 2. VALIDAR QUE SE ENVÍE LA DESCRIPCIÓN
      // ================================================

      if (
        !req.body ||
        !Object.prototype.hasOwnProperty.call(
          req.body,
          'descripcion'
        )
      ) {

        return res.status(400).json({
          error:
            'Debe indicar la descripción institucional'
        });

      }


      // ================================================
      // 3. OBTENER LA ORGANIZACIÓN DEL USUARIO
      // ================================================

      const resultado =
        await pool.query(
          `
          SELECT
            id_organizacion

          FROM organizacion

          WHERE id_usuario = $1

          LIMIT 1
          `,
          [idUsuario]
        );


      if (resultado.rows.length === 0) {

        return res.status(404).json({
          error:
            'No se encontró la organización asociada al usuario'
        });

      }


      const idOrganizacion =
        resultado.rows[0].id_organizacion;


      // ================================================
      // 4. ACTUALIZAR DESCRIPCIÓN INSTITUCIONAL
      // ================================================

      const organizacion =
        await organizacionService
          .actualizarDescripcionInstitucional(
            idOrganizacion,
            req.body.descripcion
          );


      // ================================================
      // 5. DEVOLVER RESPUESTA
      // ================================================

      return res.status(200).json({

        message:
          'Descripción institucional actualizada correctamente',

        organizacion

      });

    }
    catch (error) {

      console.error(
        'ERROR AL ACTUALIZAR DESCRIPCIÓN INSTITUCIONAL:',
        error
      );


      return res
        .status(error.status || 500)
        .json({

          error:
            error.status
              ? error.message
              : 'No se pudo actualizar la descripción institucional'

        });

    }

  };

  // ======================================================
// ACTUALIZAR TIPOS DE ACTIVIDAD INSTITUCIONALES
// ACTIVIDAD 3.5.1
// ======================================================

exports.actualizarTiposActividadInstitucional =
  async (req, res) => {

    try {

      // ================================================
      // 1. IDENTIFICAR AL USUARIO AUTENTICADO
      // ================================================

      const idUsuario =
        req.user.id;


      // ================================================
      // 2. OBTENER TIPOS DE ACTIVIDAD
      // ================================================

      const {
        idsTiposActividad
      } = req.body || {};


      // ================================================
      // 3. VALIDAR SELECCIÓN
      // ================================================

      if (
        !Array.isArray(idsTiposActividad) ||
        idsTiposActividad.length === 0
      ) {

        return res.status(400).json({
          error:
            'Debe seleccionar al menos un tipo de actividad'
        });

      }


      // ================================================
      // 4. OBTENER ORGANIZACIÓN DEL USUARIO
      // ================================================

      const resultado =
        await pool.query(
          `
          SELECT
            id_organizacion

          FROM organizacion

          WHERE id_usuario = $1

          LIMIT 1
          `,
          [idUsuario]
        );


      if (resultado.rows.length === 0) {

        return res.status(404).json({
          error:
            'No se encontró la organización asociada al usuario'
        });

      }


      const idOrganizacion =
        resultado.rows[0].id_organizacion;


      // ================================================
      // 5. ACTUALIZAR TIPOS DE ACTIVIDAD
      // ================================================

      const tiposActividad =
        await perfilPublicoService
          .actualizarTiposActividad(
            idOrganizacion,
            idsTiposActividad
          );


      // ================================================
      // 6. DEVOLVER RESULTADO
      // ================================================

      return res.status(200).json({

        message:
          'Tipos de actividad actualizados correctamente',

        tiposActividad

      });

    }
    catch (error) {

      console.error(
        'ERROR AL ACTUALIZAR TIPOS DE ACTIVIDAD INSTITUCIONALES:',
        error
      );

      return res
        .status(error.status || 500)
        .json({

          error:
            error.status
              ? error.message
              : 'No se pudieron actualizar los tipos de actividad'

        });

    }

  };

  // ======================================================
// ACTUALIZAR UBICACIÓN INSTITUCIONAL
// ACTIVIDAD 3.5.1
// ======================================================

exports.actualizarUbicacionInstitucional =
  async (req, res) => {

    try {

      // ================================================
      // 1. IDENTIFICAR AL USUARIO AUTENTICADO
      // ================================================

      const idUsuario =
        req.user.id;


      // ================================================
      // 2. VALIDAR LOS DATOS RECIBIDOS
      // ================================================

      if (
        !req.body ||
        typeof req.body !== 'object' ||
        Array.isArray(req.body)
      ) {

        return res.status(400).json({
          error:
            'Debe proporcionar una ubicación válida'
        });

      }


      // ================================================
      // 3. OBTENER LA ORGANIZACIÓN DEL USUARIO
      // ================================================

      const resultado =
        await pool.query(
          `
          SELECT
            id_organizacion

          FROM organizacion

          WHERE id_usuario = $1

          LIMIT 1
          `,
          [idUsuario]
        );


      if (resultado.rows.length === 0) {

        return res.status(404).json({
          error:
            'No se encontró la organización asociada al usuario'
        });

      }


      const idOrganizacion =
        resultado.rows[0].id_organizacion;


      // ================================================
      // 4. ACTUALIZAR UBICACIÓN INSTITUCIONAL
      // ================================================

      const ubicacion =
        await perfilPublicoService
          .actualizarUbicacion(
            idOrganizacion,
            req.body
          );


      // ================================================
      // 5. DEVOLVER RESPUESTA
      // ================================================

      return res.status(200).json({

        message:
          'Ubicación institucional actualizada correctamente',

        ubicacion

      });

    }
    catch (error) {

      console.error(
        'ERROR AL ACTUALIZAR UBICACIÓN INSTITUCIONAL:',
        error
      );


      return res
        .status(error.status || 500)
        .json({

          error:
            error.status
              ? error.message
              : 'No se pudo actualizar la ubicación institucional'

        });

    }

  };

// ======================================================
// LISTAR ORGANIZACIONES DISPONIBLES PARA DONACIÓN
// ======================================================

exports.listarDisponiblesParaDonacion =
  async (req, res) => {

    try {

      const organizaciones =
        await organizacionService
          .listarDisponiblesParaDonacion({

            nombre:
              req.query.nombre,

            idTipoActividad:
              req.query.id_tipo_actividad,

            latitud:
              req.query.latitud,

            longitud:
              req.query.longitud,

            radioBusquedaKm:
              req.query.radio_km

          });


      return res
        .status(200)
        .json({
          organizaciones
        });

    }
    catch (error) {

      console.error(
        'ERROR AL CONSULTAR ORGANIZACIONES PARA DONACIÓN:',
        error
      );


      return res
        .status(
          error.status || 500
        )
        .json({

          error:
            error.status
              ? error.message
              : 'No se pudieron consultar las organizaciones'

        });

    }

  };


  // ======================================================
// DETALLE DE ORGANIZACIÓN PARA DONACIÓN
// ======================================================

exports.obtenerDetalleDisponibleDonacion =
  async (req, res) => {

    try {

      const {
        id
      } = req.params;


      const organizacion =
        await organizacionService
          .obtenerDetalleDisponibleDonacion(
            id
          );


      return res.status(200).json({

        organizacion

      });

    }
    catch (error) {

      console.error(
        'ERROR AL CONSULTAR ORGANIZACIÓN PARA DONACIÓN:',
        error
      );


      return res
        .status(
          error.status || 500
        )
        .json({

          error:
            error.status
              ? error.message
              : 'No se pudo consultar la organización'

        });

    }

  };