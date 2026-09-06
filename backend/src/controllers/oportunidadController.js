const oportunidadService =
  require('../services/oportunidadService');


// ======================================================
// CREAR OPORTUNIDAD
// ======================================================

exports.crearOportunidad = async (req, res) => {

  try {

    const datos = {
        ...req.body,
        idOrganizacion: req.organizacion.id_organizacion,
        estado: 'BORRADOR'
    };

    const oportunidad =
      await oportunidadService.crearOportunidad(datos);

    return res.status(201).json({
      message: 'Oportunidad creada correctamente',
      oportunidad
    });

  } catch (error) {

    console.error(
      'ERROR AL CREAR OPORTUNIDAD:',
      error
    );

    return res.status(error.status || 500).json({
      error:
        error.status
          ? error.message
          : 'No se pudo crear la oportunidad'
    });

  }

};



// ======================================================
// ACTUALIZAR OPORTUNIDAD
// ======================================================

exports.actualizarOportunidad = async (req, res) => {

  try {

    const idOportunidad = req.params.id;

    const idOrganizacion =
      req.organizacion.id_organizacion;

    const oportunidad =
      await oportunidadService.actualizarOportunidad(
        idOportunidad,
        idOrganizacion,
        req.body
      );

    return res.status(200).json({
      message: 'Oportunidad actualizada correctamente',
      oportunidad
    });

  } catch (error) {

    console.error(
      'ERROR AL ACTUALIZAR OPORTUNIDAD:',
      error
    );

    return res.status(error.status || 500).json({
      error:
        error.status
          ? error.message
          : 'No se pudo actualizar la oportunidad'
    });

  }

};

// ======================================================
// CANCELAR OPORTUNIDAD
// ======================================================

exports.cancelarOportunidad = async (req, res) => {

  try {

    const idOportunidad = req.params.id;

    const idOrganizacion =
      req.organizacion.id_organizacion;

    const oportunidad =
      await oportunidadService.cancelarOportunidad(
        idOportunidad,
        idOrganizacion
      );

    return res.status(200).json({
      message: 'Oportunidad cancelada correctamente',
      oportunidad
    });

  } catch (error) {

    console.error(
      'ERROR AL CANCELAR OPORTUNIDAD:',
      error
    );

    return res.status(error.status || 500).json({
      error:
        error.status
          ? error.message
          : 'No se pudo cancelar la oportunidad'
    });

  }

};

// ======================================================
// PUBLICAR OPORTUNIDAD
// ======================================================

exports.publicarOportunidad = async (req, res) => {

  try {

    const idOportunidad = req.params.id;

    const idOrganizacion =
      req.organizacion.id_organizacion;

    const oportunidad =
      await oportunidadService.publicarOportunidad(
        idOportunidad,
        idOrganizacion
      );

    return res.status(200).json({
      message: 'Oportunidad publicada correctamente',
      oportunidad
    });

  } catch (error) {

    console.error(
      'ERROR AL PUBLICAR OPORTUNIDAD:',
      error
    );

    return res.status(error.status || 500).json({
      error:
        error.status
          ? error.message
          : 'No se pudo publicar la oportunidad'
    });

  }

};


exports.listarOportunidadesOrganizacion = async (
  req,
  res
) => {

  try {

    const idOrganizacion =
      req.organizacion.id_organizacion;

    const oportunidades =
      await oportunidadService.listarOportunidadesOrganizacion(
        idOrganizacion
      );

    return res.status(200).json({
      oportunidades
    });

  } catch (error) {

    return res.status(error.status || 500).json({
      error: error.message
    });

  }

};

exports.obtenerOportunidadOrganizacion = async (
  req,
  res
) => {

  try {

    const idOportunidad = req.params.id;

    const idOrganizacion =
      req.organizacion.id_organizacion;

    const oportunidad =
      await oportunidadService.obtenerOportunidadOrganizacion(
        idOportunidad,
        idOrganizacion
      );

    return res.status(200).json({
      oportunidad
    });

  } catch (error) {

    return res.status(error.status || 500).json({
      error: error.message
    });

  }

};


exports.cerrarOportunidad = async (
  req,
  res
) => {

  try {

    const oportunidad =
      await oportunidadService.cerrarOportunidad(
        req.params.id,
        req.organizacion.id_organizacion
      );

    res.status(200).json({
      message:
        'Oportunidad cerrada correctamente',
      oportunidad
    });

  } catch (error) {
      console.error(
      'ERROR AL CERRAR OPORTUNIDAD:',
      error
    );

    return res.status(error.status || 500).json({
      error:
        error.status
          ? error.message
          : 'No se pudo cerrar la oportunidad'
    });
  }
};


exports.finalizarOportunidad = async (
  req,
  res
) => {

  try {

    const oportunidad =
      await oportunidadService.finalizarOportunidad(
        req.params.id,
        req.organizacion.id_organizacion
      );

    res.status(200).json({
      message:
        'Oportunidad finalizada correctamente',
      oportunidad
    });

  } catch (error) {
    console.error(
        'ERROR AL FINALIZAR OPORTUNIDAD:',
        error
      );

      return res.status(error.status || 500).json({
        error:
          error.status
            ? error.message
            : 'No se pudo finalizar la oportunidad'
      });

      }
};


exports.obtenerOportunidadesPublicadas = async (req, res) => {
  try {

    const filtros = {
      tipoActividad: req.query.tipoActividad,
      urgencia: req.query.urgencia,
      fecha: req.query.fecha,
      latitud: req.query.latitud,
      longitud: req.query.longitud,
      radioBusquedaKm: req.query.radioBusquedaKm
    };

    const oportunidades =
      await oportunidadService.obtenerOportunidadesPublicadas(
        filtros
      );

    return res.status(200).json({
      oportunidades
    });

  } catch (error) {

    console.log(
      'Error obteniendo oportunidades publicadas:',
      error
    );

    return res.status(error.status || 500).json({
      error:
        error.status
          ? error.message
          : 'Error al obtener las oportunidades'
    });
  }
};




// ======================================================
// OBTENER DETALLE DE OPORTUNIDAD PARA VOLUNTARIO
// ======================================================

exports.obtenerDetalleOportunidadVoluntario = async (
  req,
  res
) => {

  try {

    const idOportunidad = req.params.id;

    const oportunidad =
      await oportunidadService.obtenerDetalleOportunidadVoluntario(
        idOportunidad
      );

    return res.status(200).json({
      oportunidad
    });

  } catch (error) {

    console.error(
      'ERROR AL OBTENER DETALLE DE OPORTUNIDAD:',
      error
    );

    return res.status(error.status || 500).json({
      error:
        error.status
          ? error.message
          : 'No se pudo obtener la oportunidad'
    });

  }

};