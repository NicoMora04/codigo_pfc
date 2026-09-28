const donacionRepository =
  require(
    '../repositories/donacionRepository'
  );


// ======================================================
// VERIFICAR PROPIEDAD DE LA DONACIÓN
// ======================================================

const verificarDonacionPropia =
  async (
    req,
    res,
    next
  ) => {

    try {

      const idDonacion =
        req.params.id;


      const idVoluntario =
        req.user.id;


      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


      if (
        !uuidRegex.test(
          idDonacion
        )
      ) {

        return res
          .status(400)
          .json({
            error:
              'El identificador de la donación no es válido'
          });

      }


      const donacion =
        await donacionRepository
          .buscarDonacionPropiaPorId(
            idDonacion,
            idVoluntario
          );


      if (
        !donacion
      ) {

        return res
          .status(404)
          .json({
            error:
              'Donación no encontrada'
          });

      }


      req.donacion =
        donacion;


      next();

    }
    catch (error) {

      console.error(
        'ERROR AL VERIFICAR DONACIÓN:',
        error
      );


      return res
        .status(500)
        .json({
          error:
            'No se pudo verificar la donación'
        });

    }

  };


module.exports =
  verificarDonacionPropia;