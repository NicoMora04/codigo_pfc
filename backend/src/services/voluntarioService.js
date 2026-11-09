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

// ======================================================
// ACTUALIZAR DATOS PERSONALES DEL VOLUNTARIO
// ACTIVIDAD 3.5.1
// ======================================================

const actualizarDatosPersonales = async (
  idUsuario,
  datos
) => {

  const {
    nombre,
    apellido,
    telefono
  } = datos;

  // ==================================================
  // 1. VALIDAR NOMBRE
  // ==================================================

  if (
    typeof nombre !== 'string' ||
    !nombre.trim() ||
    nombre.trim().length > 100
  ) {

    const error = new Error(
      'El nombre es obligatorio y no puede superar los 100 caracteres'
    );

    error.status = 400;
    throw error;

  }

  // ==================================================
  // 2. VALIDAR APELLIDO
  // ==================================================

  if (
    typeof apellido !== 'string' ||
    !apellido.trim() ||
    apellido.trim().length > 100
  ) {

    const error = new Error(
      'El apellido es obligatorio y no puede superar los 100 caracteres'
    );

    error.status = 400;
    throw error;

  }

  // ==================================================
  // 3. VALIDAR TELÉFONO
  // ==================================================

  const telefonoNormalizado =
    telefono == null || telefono === ''
      ? null
      : typeof telefono === 'string'
        ? telefono.trim()
        : telefono;

  if (
    telefonoNormalizado !== null &&
    telefonoNormalizado !== '' &&
    (
      typeof telefonoNormalizado !== 'string' ||
      !/^\d{7,15}$/.test(telefonoNormalizado)
    )
  ) {

    const error = new Error(
      'El teléfono debe contener entre 7 y 15 dígitos numéricos'
    );

    error.status = 400;
    throw error;

  }

  // ==================================================
  // 4. ACTUALIZAR DATOS EN BASE DE DATOS
  // ==================================================

  const voluntarioActualizado =
    await voluntarioRepository
      .actualizarDatosPersonales(
        idUsuario,
        {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          telefono: telefonoNormalizado || null
        }
      );

  // ==================================================
  // 5. VERIFICAR EXISTENCIA
  // ==================================================

  if (!voluntarioActualizado) {

    const error = new Error(
      'No se encontró el perfil del voluntario'
    );

    error.status = 404;
    throw error;

  }

  // ==================================================
  // 6. DEVOLVER PERFIL ACTUALIZADO
  // ==================================================

  return voluntarioActualizado;

};

module.exports = {
  obtenerIntereses,
  actualizarIntereses,
  actualizarDatosPersonales
};