const voluntarioService =
  require(
    '../services/voluntarioService'
  );

const recomendacionService =
  require(
    '../services/recomendacionService'
  );


// ======================================================
// OBTENER INTERESES DEL VOLUNTARIO AUTENTICADO
// ======================================================

const obtenerIntereses = async (
  req,
  res
) => {

  try {

    const idVoluntario =
      req.user.id;


    const intereses =
      await voluntarioService
        .obtenerIntereses(
          idVoluntario
        );


    return res.json({
      intereses
    });

  }
  catch (error) {

    console.error(
      'ERROR AL OBTENER INTERESES:',
      error
    );


    return res.status(
      error.status || 500
    ).json({
      error:
        error.message ||
        'No se pudieron obtener los intereses'
    });

  }

};


// ======================================================
// ACTUALIZAR INTERESES DEL VOLUNTARIO AUTENTICADO
// ======================================================

const actualizarIntereses = async (
  req,
  res
) => {

  try {

    const idVoluntario =
      req.user.id;


    const {
      intereses
    } = req.body;


    const interesesActualizados =
      await voluntarioService
        .actualizarIntereses(
          idVoluntario,
          intereses
        );


    return res.json({
      message:
        'Intereses actualizados correctamente',
      intereses:
        interesesActualizados
    });

  }
  catch (error) {

    console.error(
      'ERROR AL ACTUALIZAR INTERESES:',
      error
    );


    return res.status(
      error.status || 500
    ).json({
      error:
        error.message ||
        'No se pudieron actualizar los intereses'
    });

  }

};

// ======================================================
// OBTENER RECOMENDACIONES DEL VOLUNTARIO
// ======================================================

const obtenerRecomendaciones = async (
  req,
  res
) => {

  try {

    const idVoluntario =
      req.user.id;


    const {
      latitud,
      longitud,
      radioKm
    } = req.query;


    const envioAlgunaUbicacion =
      latitud != null ||
      longitud != null ||
      radioKm != null;


    // Si se envía información geográfica,
    // deben estar presentes los tres parámetros.
    if (
      envioAlgunaUbicacion &&
      (
        latitud == null ||
        longitud == null ||
        radioKm == null
      )
    ) {

      return res.status(400).json({
        error:
          'Para utilizar ubicación deben enviarse latitud, longitud y radioKm'
      });

    }


    if (
      envioAlgunaUbicacion
    ) {

      const lat =
        Number(latitud);

      const lon =
        Number(longitud);

      const radio =
        Number(radioKm);


      if (
        !Number.isFinite(lat) ||
        lat < -90 ||
        lat > 90
      ) {

        return res.status(400).json({
          error:
            'La latitud no es válida'
        });

      }


      if (
        !Number.isFinite(lon) ||
        lon < -180 ||
        lon > 180
      ) {

        return res.status(400).json({
          error:
            'La longitud no es válida'
        });

      }


      if (
        !Number.isFinite(radio) ||
        radio <= 0
      ) {

        return res.status(400).json({
          error:
            'El radio debe ser mayor que cero'
        });

      }

    }


    const resultado =
      await recomendacionService
        .obtenerRecomendaciones(
          idVoluntario,
          {
            latitud,
            longitud,
            radioKm
          }
        );


    return res.json(
      resultado
    );

  }
  catch (error) {

    console.error(
      'ERROR AL OBTENER RECOMENDACIONES:',
      error
    );


    return res.status(
      error.status || 500
    ).json({
      error:
        error.message ||
        'No se pudieron obtener las recomendaciones'
    });

  }

};

// ======================================================
// ACTUALIZAR DATOS PERSONALES DEL VOLUNTARIO
// ACTIVIDAD 3.5.1
// ======================================================

const actualizarDatosPersonales = async (
  req,
  res
) => {

  try {

    // ==================================================
    // 1. OBTENER USUARIO AUTENTICADO
    // ==================================================

    const idUsuario =
      req.user.id;


    // ==================================================
    // 2. OBTENER DATOS ENVIADOS
    // ==================================================

    const datos = req.body || {};


    // ==================================================
    // 3. ACTUALIZAR PERFIL
    // ==================================================

    const voluntarioActualizado =
      await voluntarioService
        .actualizarDatosPersonales(
          idUsuario,
          datos
        );


    // ==================================================
    // 4. DEVOLVER RESPUESTA
    // ==================================================

    return res.status(200).json({

      mensaje:
        'Datos personales actualizados correctamente',

      voluntario:
        voluntarioActualizado

    });

  }
  catch (error) {

    // ==================================================
    // 5. MANEJAR ERRORES
    // ==================================================

    console.error(
      'ERROR AL ACTUALIZAR DATOS PERSONALES:',
      error
    );

    const status =
      Number.isInteger(error.status) &&
      error.status >= 400 &&
      error.status < 500
        ? error.status
        : 500;

    return res.status(status).json({

      error:
        status === 500
          ? 'No se pudieron actualizar los datos personales'
          : error.message

    });

  }

};
module.exports = {
  obtenerIntereses,
  actualizarIntereses,
  obtenerRecomendaciones,
  actualizarDatosPersonales
};