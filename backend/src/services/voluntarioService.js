const voluntarioRepository =
  require(
    '../repositories/voluntarioRepository'
  );


// ======================================================
// OBTENER INTERESES
// ======================================================

const obtenerIntereses = async (
  idVoluntario
) => {

  return await voluntarioRepository
    .obtenerIntereses(
      idVoluntario
    );

};


// ======================================================
// ACTUALIZAR INTERESES
// ======================================================

const actualizarIntereses = async (
  idVoluntario,
  intereses
) => {

  if (
    !Array.isArray(
      intereses
    )
  ) {

    const error =
      new Error(
        'Los intereses deben enviarse como un arreglo'
      );

    error.status = 400;

    throw error;

  }


  const interesesNormalizados =
    [
      ...new Set(
        intereses.map(
          (id) =>
            Number(id)
        )
      )
    ];


  const hayValorInvalido =
    interesesNormalizados
      .some(
        (id) =>
          !Number.isInteger(id) ||
          id <= 0
      );


  if (
    hayValorInvalido
  ) {

    const error =
      new Error(
        'Uno o más tipos de actividad no son válidos'
      );

    error.status = 400;

    throw error;

  }


  const tiposExistentes =
    await voluntarioRepository
      .obtenerTiposExistentes(
        interesesNormalizados
      );


  if (
    tiposExistentes.length !==
    interesesNormalizados.length
  ) {

    const error =
      new Error(
        'Uno o más tipos de actividad no existen'
      );

    error.status = 400;

    throw error;

  }


  await voluntarioRepository
    .reemplazarIntereses(
      idVoluntario,
      interesesNormalizados
    );


  return await voluntarioRepository
    .obtenerIntereses(
      idVoluntario
    );

};


module.exports = {
  obtenerIntereses,
  actualizarIntereses
};