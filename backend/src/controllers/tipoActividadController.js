const tipoActividadService =
  require('../services/tipoActividadService');

exports.listarTiposActividad = async (
  req,
  res
) => {

  try {

    const tiposActividad =
      await tipoActividadService.listarTiposActividad();

    return res.status(200).json({
      tiposActividad
    });

  } catch (error) {

    return res.status(error.status || 500).json({
      error: error.message
    });

  }

};


// ======================================================
// CREAR TIPO DE ACTIVIDAD
// ======================================================

exports.crearTipoActividad =
  async (req, res) => {

    const {
      nombre
    } = req.body;


    try {

      const tipoActividad =
        await tipoActividadService
          .crearTipoActividad(
            nombre
          );


      return res.status(201).json({

        message:
          'Tipo de actividad creado correctamente',

        tipoActividad

      });

    }
    catch (error) {

      console.error(
        'ERROR AL CREAR TIPO DE ACTIVIDAD:',
        error
      );


      return res.status(
        error.status || 500
      ).json({

        error:
          error.status
            ? error.message
            : 'No se pudo crear el tipo de actividad'

      });

    }

  };


  // ======================================================
// ACTUALIZAR TIPO DE ACTIVIDAD
// ======================================================

exports.actualizarTipoActividad =
  async (req, res) => {

    const {
      id
    } = req.params;

    const {
      nombre
    } = req.body;


    try {

      const tipoActividad =
        await tipoActividadService
          .actualizarTipoActividad(
            id,
            nombre
          );


      return res.status(200).json({

        message:
          'Tipo de actividad actualizado correctamente',

        tipoActividad

      });

    }
    catch (error) {

      console.error(
        'ERROR AL ACTUALIZAR TIPO DE ACTIVIDAD:',
        error
      );


      return res.status(
        error.status || 500
      ).json({

        error:
          error.status
            ? error.message
            : 'No se pudo actualizar el tipo de actividad'

      });

    }

  };