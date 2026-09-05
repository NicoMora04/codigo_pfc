const ubicacionService =
  require('../services/ubicacionService');

exports.obtenerOCrearUbicacion = async (req, res) => {

  try {

    const ubicacion =
      await ubicacionService.obtenerOCrearUbicacion(
        req.body
      );

    return res.status(200).json({
      mensaje: 'Ubicación obtenida correctamente',
      ubicacion
    });

  } catch (error) {

    return res.status(error.status || 500).json({
      error: error.message
    });

  }

};

exports.buscarDirecciones = async (req, res) => {
  try {
    const resultados =
      await ubicacionService.buscarDirecciones(
        req.query.q
      );

    return res.status(200).json({
      resultados,
    });
  } catch (error) {
    console.error(
      'Error buscando direcciones:',
      error
    );

    return res.status(error.status || 500).json({
      mensaje:
        error.message ||
        'Error al buscar ubicaciones',
    });
  }
};