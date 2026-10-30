const perfilPublicoService =
  require('../services/perfilPublicoService');

const fs =
  require('fs');

const path =
  require('path');


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

// ======================================================
// CONSULTAR PERFIL PÚBLICO POR SLUG
// ======================================================

exports.obtenerPerfilPublicoPorSlug = async (
  req,
  res
) => {

  try {

    const perfil =
      await perfilPublicoService
        .obtenerPerfilPublicoPorSlug(
          req.params.slug
        );

    return res
      .status(200)
      .json({
        perfil
      });

  } catch (error) {

    console.error(
      'ERROR AL CONSULTAR PERFIL PÚBLICO:',
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

// ======================================================
// ACTUALIZAR PERFIL PÚBLICO PROPIO
// ACTIVIDAD 3.6.2
// ======================================================

exports.actualizarPerfilPropio = async (
  req,
  res
) => {

  try {

    const perfil =
      await perfilPublicoService
        .actualizarPerfilPropio(
          req.organizacion.id_organizacion,
          {
            nombreVisible:
              req.body.nombreVisible,

            descripcionPublica:
              req.body.descripcionPublica,

            emailContactoPublico:
              req.body.emailContactoPublico,

            telefonoContactoPublico:
              req.body.telefonoContactoPublico,

            sitioWebUrl:
              req.body.sitioWebUrl,

            redesSociales:
              req.body.redesSociales,

            horarioAtencion:
              req.body.horarioAtencion
          }
        );


    return res
      .status(200)
      .json({
        message:
          'Perfil público actualizado correctamente',

        perfil
      });

  }
  catch (error) {

    console.error(
      'ERROR AL ACTUALIZAR PERFIL PÚBLICO:',
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
            : 'No se pudo actualizar el perfil público'

      });

  }

};

// ======================================================
// CREAR PERFIL PÚBLICO PROPIO
// ACTIVIDAD 3.6.2
// ======================================================

exports.crearPerfilPropio = async (
  req,
  res
) => {

  try {

    const perfil =
      await perfilPublicoService
        .crearPerfilPropio(
          req.organizacion.id_organizacion
        );


    return res
      .status(201)
      .json({
        message:
          'Perfil público creado correctamente',

        perfil
      });

  }
  catch (error) {

    console.error(
      'ERROR AL CREAR PERFIL PÚBLICO:',
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
            : 'No se pudo crear el perfil público'

      });

  }

};

// ======================================================
// LISTAR PLANTILLAS ACTIVAS
// ACTIVIDAD 3.6.3
// ======================================================

exports.listarPlantillasActivas = async (
  req,
  res
) => {

  try {

    const plantillas =
      await perfilPublicoService
        .listarPlantillasActivas();


    return res
      .status(200)
      .json({
        plantillas
      });

  }
  catch (error) {

    console.error(
      'ERROR AL CONSULTAR PLANTILLAS:',
      error
    );


    return res
      .status(500)
      .json({
        error:
          'No se pudieron consultar las plantillas'
      });

  }

};

// ======================================================
// ACTUALIZAR PLANTILLA DEL PERFIL PROPIO
// ACTIVIDAD 3.6.3
// ======================================================

exports.actualizarPlantillaPerfilPropio = async (
  req,
  res
) => {

  try {

    const perfil =
      await perfilPublicoService
        .actualizarPlantillaPerfilPropio(
          req.organizacion.id_organizacion,
          req.body.codigoPlantilla
        );


    return res
      .status(200)
      .json({
        message:
          'Plantilla actualizada correctamente',

        perfil
      });

  }
  catch (error) {

    console.error(
      'ERROR AL ACTUALIZAR PLANTILLA:',
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
            : 'No se pudo actualizar la plantilla'

      });

  }

};

// ======================================================
// GUARDAR IMAGEN DEL PERFIL
// ACTIVIDAD 3.6.3
// ======================================================

exports.guardarImagenPerfil =
  async (
    req,
    res
  ) => {

    let imagenPersistidaEnBD =
      false;


    try {

      const tipo =
        req.params.tipo;


      const resultado =
        await perfilPublicoService
          .guardarImagenPerfil(
            req.organizacion
              .id_organizacion,
            tipo,
            req.file,
            req.body
              ?.textoAlternativo
          );


      imagenPersistidaEnBD =
        true;


      // ====================================================
      // ELIMINAR ARCHIVO ANTERIOR
      // SOLO PARA LOGO / PORTADA
      // ====================================================

      const imagenAnterior =
        resultado
          .imagenAnterior;


      if (
        imagenAnterior
          ?.url &&
        imagenAnterior.url !==
          resultado
            .imagen
            .url
      ) {

        try {

          const rutaAnterior =
            path.join(
              __dirname,
              '../../',
              imagenAnterior
                .url
                .replace(
                  /^\/+/,
                  ''
                )
            );


          if (
            fs.existsSync(
              rutaAnterior
            )
          ) {

            fs.unlinkSync(
              rutaAnterior
            );

          }

        }
        catch (
          errorBorradoAnterior
        ) {

          console.warn(
            'NO SE PUDO ELIMINAR LA IMAGEN ANTERIOR DEL PERFIL:',
            errorBorradoAnterior
          );

        }

      }


      return res
        .status(
          tipo
            ?.toUpperCase() ===
            'GALERIA'
            ? 201
            : 200
        )
        .json({

          message:
            tipo
              ?.toUpperCase() ===
              'GALERIA'
              ? 'Imagen agregada a la galería correctamente'
              : 'Imagen del perfil actualizada correctamente',

          imagen:
            resultado.imagen

        });

    }
    catch (error) {

      // ====================================================
      // LIMPIEZA SI LA BD NO LLEGÓ A PERSISTIR
      // ====================================================

      if (
        !imagenPersistidaEnBD &&
        req.file?.path &&
        fs.existsSync(
          req.file.path
        )
      ) {

        try {

          fs.unlinkSync(
            req.file.path
          );

        }
        catch (
          errorLimpieza
        ) {

          console.warn(
            'NO SE PUDO ELIMINAR LA IMAGEN NUEVA TRAS EL ERROR:',
            errorLimpieza
          );

        }

      }


      console.error(
        'ERROR AL GUARDAR IMAGEN DEL PERFIL:',
        error
      );


      return res
        .status(
          error.status ||
          500
        )
        .json({

          error:
            error.status
              ? error.message
              : 'No se pudo guardar la imagen del perfil'

        });

    }

  };

  // ======================================================
// ELIMINAR IMAGEN DE GALERÍA
// ACTIVIDAD 3.6.3
// ======================================================

exports.eliminarImagenGaleria =
  async (
    req,
    res
  ) => {

    try {

      const imagen =
        await perfilPublicoService
          .eliminarImagenGaleria(
            req.organizacion
              .id_organizacion,
            req.params.idImagen
          )


      // ====================================================
      // ELIMINAR ARCHIVO FÍSICO
      // ====================================================

      if (imagen.url) {

        try {

          const rutaArchivo =
            path.join(
              __dirname,
              '../../',
              imagen.url.replace(
                /^\/+/,
                ''
              )
            )


          if (
            fs.existsSync(
              rutaArchivo
            )
          ) {

            fs.unlinkSync(
              rutaArchivo
            )

          }

        }
        catch (
          errorArchivo
        ) {

          console.warn(
            'NO SE PUDO ELIMINAR EL ARCHIVO DE GALERÍA:',
            errorArchivo
          )

        }

      }


      return res
        .status(200)
        .json({

          message:
            'Imagen eliminada de la galería correctamente',

          id_imagen:
            imagen.id_imagen

        })

    }
    catch (error) {

      console.error(
        'ERROR AL ELIMINAR IMAGEN DE GALERÍA:',
        error
      )


      return res
        .status(
          error.status ||
          500
        )
        .json({

          error:
            error.status
              ? error.message
              : 'No se pudo eliminar la imagen de galería'

        })

    }

  }

// ======================================================
// GUARDAR SECCIÓN DEL PERFIL
// ACTIVIDAD 3.6.3
// ======================================================

exports.guardarSeccionPerfil =
  async (
    req,
    res
  ) => {

    try {

      const seccion =
        await perfilPublicoService
          .guardarSeccionPerfil(
            req.organizacion
              .id_organizacion,
            req.params.tipo,
            req.body
          )


      return res
        .status(200)
        .json({

          message:
            'Sección del perfil guardada correctamente',

          seccion

        })

    }
    catch (error) {

      console.error(
        'ERROR AL GUARDAR SECCIÓN DEL PERFIL:',
        error
      )


      return res
        .status(
          error.status ||
          500
        )
        .json({

          error:
            error.status
              ? error.message
              : 'No se pudo guardar la sección del perfil'

        })

    }

  }

// ======================================================
// ACTUALIZAR ORDEN DE SECCIONES DEL PERFIL
// ACTIVIDAD 3.6.5
// CP-PRF-006
// ======================================================

exports.actualizarOrdenSecciones =
  async (
    req,
    res
  ) => {

    try {

      const secciones =
        await perfilPublicoService
          .actualizarOrdenSecciones(
            req.organizacion
              .id_organizacion,

            req.body.secciones
          );


      return res
        .status(200)
        .json({

          message:
            'Orden de secciones actualizado correctamente',

          secciones

        });

    }
    catch (error) {

      console.error(
        'ERROR AL ACTUALIZAR ORDEN DE SECCIONES:',
        error
      );


      return res
        .status(
          error.status ||
          500
        )
        .json({

          error:
            error.status
              ? error.message
              : 'No se pudo actualizar el orden de las secciones'

        });

    }

  };

// ======================================================
// PUBLICAR PERFIL PROPIO
// ACTIVIDAD 3.6.4
// ======================================================

exports.publicarPerfilPropio =
  async (
    req,
    res
  ) => {

    try {

      const perfil =
        await perfilPublicoService
          .publicarPerfilPropio(
            req.organizacion
              .id_organizacion
          )


      return res
        .status(200)
        .json({

          message:
            'Perfil publicado correctamente',

          perfil

        })

    }
    catch (error) {

      console.error(
        'ERROR AL PUBLICAR PERFIL:',
        error
      )


      return res
        .status(
          error.status ||
          500
        )
        .json({

          error:
            error.status
              ? error.message
              : 'No se pudo publicar el perfil'

        })

    }

  }


// ======================================================
// RETIRAR PERFIL PROPIO
// ACTIVIDAD 3.6.4
// ======================================================

exports.retirarPerfilPropio =
  async (
    req,
    res
  ) => {

    try {

      const perfil =
        await perfilPublicoService
          .retirarPerfilPropio(
            req.organizacion
              .id_organizacion
          )


      return res
        .status(200)
        .json({

          message:
            'Perfil retirado de la vista pública correctamente',

          perfil

        })

    }
    catch (error) {

      console.error(
        'ERROR AL RETIRAR PERFIL:',
        error
      )


      return res
        .status(
          error.status ||
          500
        )
        .json({

          error:
            error.status
              ? error.message
              : 'No se pudo retirar el perfil'

        })

    }

  }

// ======================================================
// ACTUALIZAR TIPOS DE ACTIVIDAD
// ACTIVIDAD 3.6.5
// ======================================================

exports.actualizarTiposActividad =
  async (
    req,
    res
  ) => {

    try {

      const {
        idsTiposActividad
      } = req.body;

      const tiposActividad =
        await perfilPublicoService
          .actualizarTiposActividad(
            req.organizacion.id_organizacion,
            idsTiposActividad
          );

      return res
        .status(200)
        .json({
          message:
            'Tipos de actividad actualizados correctamente',

          tiposActividad
        });

    }
    catch (error) {

      console.error(
        'ERROR AL ACTUALIZAR TIPOS DE ACTIVIDAD:',
        error
      );

      return res
        .status(
          error.status ||
          500
        )
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
// ACTIVIDAD 3.6.5
// ======================================================

exports.actualizarUbicacion =
  async (
    req,
    res
  ) => {

    try {

      const ubicacion =
        await perfilPublicoService
          .actualizarUbicacion(
            req.organizacion
              .id_organizacion,

            req.body
          );


      return res
        .status(200)
        .json({

          message:
            'Ubicación actualizada correctamente',

          ubicacion,

        });

    }
    catch (error) {

      console.error(
        'ERROR AL ACTUALIZAR UBICACIÓN:',
        error
      );


      return res
        .status(
          error.status ||
          500
        )
        .json({

          error:
            error.status
              ? error.message
              : 'No se pudo actualizar la ubicación',

        });

    }

  };