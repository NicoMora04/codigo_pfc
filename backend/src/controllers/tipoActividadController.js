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