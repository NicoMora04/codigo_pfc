const donacionService =
  require(
    '../services/donacionService'
  );

const fs =
  require('fs');

const path =
  require('path');

// ======================================================
// LISTAR CATEGORÍAS DE DONACIÓN
// ======================================================

exports.listarCategorias =
  async (
    req,
    res
  ) => {

    try {

      const categorias =
        await donacionService
          .listarCategorias();


      return res.status(200).json({
        categorias
      });

    }
    catch (error) {

      console.error(
        'ERROR AL CONSULTAR CATEGORÍAS DE DONACIÓN:',
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
              : 'No se pudieron consultar las categorías de donación'
        });

    }

  };


  // ======================================================
// CREAR DONACIÓN
// ======================================================

exports.crearDonacion =
  async (
    req,
    res
  ) => {

    try {

      const idVoluntario =
        req.user.id;


      const idempotencyKey =
        req.get(
          'Idempotency-Key'
        );


      const resultado =
        await donacionService
          .crearDonacion(
            idVoluntario,
            req.body,
            idempotencyKey
          );


      return res
        .status(
          resultado.reutilizada
            ? 200
            : 201
        )
        .json({

          message:
            resultado.reutilizada
              ? 'La donación ya había sido registrada'
              : 'Donación registrada correctamente',

          donacion:
            resultado.donacion

        });

    }
    catch (error) {

      console.error(
        'ERROR AL REGISTRAR DONACIÓN:',
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
              : 'No se pudo registrar la donación'

        });

    }

  };

  // ======================================================
// CARGAR / REEMPLAZAR IMAGEN DE DONACIÓN
// ======================================================

exports.actualizarImagenDonacion =
  async (
    req,
    res
  ) => {

    let imagenPersistidaEnBD =
      false;


    try {

      if (
        !req.file
      ) {

        return res
          .status(400)
          .json({
            error:
              'No se recibió ninguna imagen'
          });

      }


      const imagenUrl =
        `/uploads/donaciones/${req.file.filename}`;


      const donacion =
        await donacionService
          .actualizarImagenDonacion(
            req.params.id,
            req.user.id,
            imagenUrl
          );


      // A partir de este punto PostgreSQL
      // ya referencia correctamente
      // la nueva imagen.
      imagenPersistidaEnBD =
        true;


      // Si ya existía una imagen anterior,
      // intentamos eliminarla.
      //
      // Un fallo al borrar el archivo viejo
      // no debe invalidar la nueva imagen
      // ya persistida en PostgreSQL.

      const imagenAnterior =
        req.donacion
          ?.imagen_url;


      if (
        imagenAnterior &&
        imagenAnterior !==
          imagenUrl
      ) {

        try {

          const rutaAnterior =
            path.join(
              __dirname,
              '../../',
              imagenAnterior
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
            'NO SE PUDO ELIMINAR LA IMAGEN ANTERIOR DE LA DONACIÓN:',
            errorBorradoAnterior
          );

        }

      }


      return res
        .status(200)
        .json({

          mensaje:
            'Imagen de la donación actualizada correctamente',

          donacion

        });

    }
    catch (error) {

      // La imagen nueva solamente debe
      // eliminarse si PostgreSQL NO llegó
      // a guardar su referencia.
      //
      // Si la BD ya fue actualizada,
      // conservar el archivo nuevo evita
      // dejar una referencia rota.

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
        'ERROR AL ACTUALIZAR IMAGEN DE DONACIÓN:',
        error
      );


      return res
        .status(
          error.status ||
          500
        )
        .json({
          error:
            error.message ||
            'No se pudo actualizar la imagen de la donación'
        });

    }

  };


  // ======================================================
// LISTAR DONACIONES PROPIAS DEL VOLUNTARIO
// ======================================================

exports.listarDonacionesPropias =
  async (
    req,
    res
  ) => {

    try {

      const idVoluntario =
        req.user.id;


      const estado =
        req.query.estado;


      const donaciones =
        await donacionService
          .listarDonacionesPropias(
            idVoluntario,
            estado
          );


      return res
        .status(200)
        .json({
          donaciones
        });

    }
    catch (error) {

      console.error(
        'ERROR AL CONSULTAR DONACIONES DEL VOLUNTARIO:',
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
              : 'No se pudieron consultar las donaciones'

        });

    }

  };


// ======================================================
// OBTENER DETALLE DE UNA DONACIÓN PROPIA
// ======================================================

exports.obtenerDetalleDonacionPropia =
  async (
    req,
    res
  ) => {

    try {

      const donacion =
        await donacionService
          .obtenerDetalleDonacionPropia(
            req.params.id,
            req.user.id
          );


      return res
        .status(200)
        .json({
          donacion
        });

    }
    catch (error) {

      console.error(
        'ERROR AL CONSULTAR DETALLE DE DONACIÓN:',
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
              : 'No se pudo consultar la donación'

        });

    }

  };