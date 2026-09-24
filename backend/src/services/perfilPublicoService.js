const perfilPublicoRepository =
  require('../repositories/perfilPublicoRepository');


// ======================================================
// DIRECTORIO PÚBLICO DE ORGANIZACIONES
// ======================================================

exports.listarOrganizacionesPublicas = async (
  filtros = {}
) => {

  const nombre =
    typeof filtros.nombre === 'string'
      ? filtros.nombre.trim()
      : '';

  const ubicacion =
    typeof filtros.ubicacion === 'string'
      ? filtros.ubicacion.trim()
      : '';

  let idTipoActividad = null;


  if (
    filtros.idTipoActividad !== undefined &&
    filtros.idTipoActividad !== null &&
    filtros.idTipoActividad !== ''
  ) {

    idTipoActividad =
      Number(filtros.idTipoActividad);

    if (
      !Number.isInteger(idTipoActividad) ||
      idTipoActividad <= 0
    ) {

      const error =
        new Error(
          'El tipo de actividad indicado no es válido'
        );

      error.status = 400;

      throw error;
    }
  }


  const organizaciones =
    await perfilPublicoRepository
      .listarOrganizacionesPublicas({
        nombre,
        idTipoActividad,
        ubicacion
      });


  return organizaciones.map(
    organizacion => ({
      nombre_visible:
        organizacion.nombre_visible,

      slug:
        organizacion.slug,

      descripcion_publica:
        organizacion.descripcion_publica,

      ubicacion_aproximada:
        organizacion.localidad ||
        organizacion.provincia
          ? {
              localidad:
                organizacion.localidad,
              provincia:
                organizacion.provincia
            }
          : null,

      tipos_actividad:
        organizacion.tipos_actividad || [],

      imagen_principal:
        organizacion.imagen_url
          ? {
              url:
                organizacion.imagen_url,
              texto_alternativo:
                organizacion
                  .imagen_texto_alternativo
            }
          : null
    })
  );
};

// ======================================================
// CONSULTAR PERFIL PROPIO
// ======================================================

exports.obtenerPerfilPropio = async (
  idOrganizacion
) => {

  const resultado =
    await perfilPublicoRepository
      .obtenerPerfilPropio(
        idOrganizacion
      );

  if (!resultado) {

    const error =
      new Error(
        'Organización no encontrada'
      );

    error.status = 404;

    throw error;
  }

  return resultado;
};