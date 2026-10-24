const estadisticaService =
  require('../services/estadisticaService');


// ======================================================
// OBTENER ESTADÍSTICAS DE LA ORGANIZACIÓN
// ACTIVIDAD 3.4.1
// ======================================================

exports.obtenerEstadisticasOrganizacion = async (
  req,
  res
) => {

  try {

    const idOrganizacion =
      req.organizacion.id_organizacion;

    const estadisticas =
      await estadisticaService
        .obtenerEstadisticasOrganizacion(
          idOrganizacion
        );

    return res.status(200).json({
      estadisticas
    });

  }
  catch (error) {

    console.error(
      'ERROR AL OBTENER ESTADÍSTICAS DE LA ORGANIZACIÓN:',
      error
    );

    return res.status(
      error.status || 500
    ).json({
      error:
        error.status
          ? error.message
          : 'No se pudieron obtener las estadísticas'
    });

  }

};

// ======================================================
// OBTENER ESTADÍSTICAS GLOBALES DEL SISTEMA
// ACTIVIDAD 3.4.2
// ======================================================

exports.obtenerEstadisticasGlobales =
  async (
    req,
    res
  ) => {

    try {

      const estadisticas =
        await estadisticaService
          .obtenerEstadisticasGlobales();


      return res.status(200).json({
        estadisticas
      });

    }
    catch (error) {

      console.error(
        'ERROR AL OBTENER ESTADÍSTICAS GLOBALES:',
        error
      );


      return res.status(
        error.status || 500
      ).json({
        error:
          error.status
            ? error.message
            : 'No se pudieron obtener las estadísticas globales'
      });

    }

  };