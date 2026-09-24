const perfilPublicoService =
  require('../services/perfilPublicoService');


// ======================================================
// DIRECTORIO PÚBLICO DE ORGANIZACIONES
// ======================================================

exports.listarOrganizacionesPublicas = async (
  req,
  res
) => {

  try {

    const organizaciones =
      await perfilPublicoService
        .listarOrganizacionesPublicas({
          nombre: req.query.nombre,

          idTipoActividad:
            req.query.id_tipo_actividad,

          ubicacion:
            req.query.ubicacion
        });

    return res.status(200).json({
      organizaciones
    });

  } catch (error) {

    console.error(
      'ERROR AL CONSULTAR DIRECTORIO PÚBLICO:',
      error
    );

    return res
      .status(error.status || 500)
      .json({
        error:
          error.status
            ? error.message
            : 'No se pudo consultar el directorio público'
      });
  }
};

// ======================================================
// CONSULTAR PERFIL PROPIO
// ======================================================

exports.obtenerPerfilPropio = async (
  req,
  res
) => {

  try {

    const resultado =
      await perfilPublicoService
        .obtenerPerfilPropio(
          req.organizacion.id_organizacion
        );

    return res.status(200).json(
      resultado
    );

  } catch (error) {

    console.error(
      'ERROR AL CONSULTAR PERFIL PROPIO:',
      error
    );

    return res
      .status(error.status || 500)
      .json({
        error:
          error.status
            ? error.message
            : 'No se pudo obtener el perfil público'
      });
  }
};