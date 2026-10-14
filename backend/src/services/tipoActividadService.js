const tipoActividadRepository =
  require('../repositories/tipoActividadRepository');

exports.listarTiposActividad = async () => {

  const tiposActividad =
    await tipoActividadRepository.listarTiposActividad();

  return tiposActividad;
};

// ======================================================
// CREAR TIPO DE ACTIVIDAD
// ======================================================

exports.crearTipoActividad =
  async (nombre) => {

    if (
      typeof nombre !== 'string' ||
      !nombre.trim()
    ) {

      const error = new Error(
        'El nombre del tipo de actividad es obligatorio'
      );

      error.status = 400;

      throw error;

    }


    const nombreNormalizado =
      nombre.trim();


    const tipoExistente =
      await tipoActividadRepository
        .buscarPorNombre(
          nombreNormalizado
        );


    if (tipoExistente) {

      const error = new Error(
        'Ya existe un tipo de actividad con ese nombre'
      );

      error.status = 409;

      throw error;

    }


    return await tipoActividadRepository
      .crearTipoActividad(
        nombreNormalizado
      );

  };


  // ======================================================
// ACTUALIZAR TIPO DE ACTIVIDAD
// ======================================================

exports.actualizarTipoActividad =
  async (
    idTipoActividad,
    nombre
  ) => {

    const id =
      Number(idTipoActividad);


    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {

      const error = new Error(
        'El identificador del tipo de actividad no es válido'
      );

      error.status = 400;

      throw error;

    }


    if (
      typeof nombre !== 'string' ||
      !nombre.trim()
    ) {

      const error = new Error(
        'El nombre del tipo de actividad es obligatorio'
      );

      error.status = 400;

      throw error;

    }


    const tipoActual =
      await tipoActividadRepository
        .buscarPorId(
          id
        );


    if (!tipoActual) {

      const error = new Error(
        'El tipo de actividad no existe'
      );

      error.status = 404;

      throw error;

    }


    const nombreNormalizado =
      nombre.trim();


    const tipoConMismoNombre =
      await tipoActividadRepository
        .buscarPorNombre(
          nombreNormalizado
        );


    if (
      tipoConMismoNombre &&
      tipoConMismoNombre.id_tipo_actividad !== id
    ) {

      const error = new Error(
        'Ya existe un tipo de actividad con ese nombre'
      );

      error.status = 409;

      throw error;

    }


    return await tipoActividadRepository
      .actualizarTipoActividad(
        id,
        nombreNormalizado
      );

  };