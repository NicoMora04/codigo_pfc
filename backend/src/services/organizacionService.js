const organizacionRepository =
  require('../repositories/organizacionRepository');


// ======================================================
// VOLVER A SOLICITAR VERIFICACIÓN
// ======================================================

exports.solicitarNuevaVerificacion = async (idUsuario) => {

  const organizacion =
    await organizacionRepository.solicitarNuevaVerificacion(
      idUsuario
    );

  if (!organizacion) {

    const error = new Error(
      'La organización no está rechazada o no existe'
    );

    error.status = 400;

    throw error;
  }

  return organizacion;

};

// ======================================================
// ACTUALIZAR DESCRIPCIÓN INSTITUCIONAL
// ACTIVIDAD 3.5.1
// ======================================================

exports.actualizarDescripcionInstitucional =
  async (
    idOrganizacion,
    descripcion
  ) => {

    // ================================================
    // 1. VALIDAR TIPO DE DATO
    // ================================================

    if (
      descripcion !== null &&
      typeof descripcion !== 'string'
    ) {

      const error = new Error(
        'La descripción institucional debe ser un texto'
      );

      error.status = 400;

      throw error;

    }


    // ================================================
    // 2. NORMALIZAR DESCRIPCIÓN
    // ================================================

    const descripcionNormalizada =
      descripcion?.trim() || null;


    // ================================================
    // 3. VALIDAR LONGITUD
    // ================================================

    if (
      descripcionNormalizada &&
      descripcionNormalizada.length > 500
    ) {

      const error = new Error(
        'La descripción institucional no puede superar los 500 caracteres'
      );

      error.status = 400;

      throw error;

    }


    // ================================================
    // 4. ACTUALIZAR EN BASE DE DATOS
    // ================================================

    const organizacion =
      await organizacionRepository
        .actualizarDescripcionInstitucional(
          idOrganizacion,
          descripcionNormalizada
        );


    // ================================================
    // 5. VERIFICAR RESULTADO
    // ================================================

    if (!organizacion) {

      const error = new Error(
        'No se encontró la organización'
      );

      error.status = 404;

      throw error;

    }


    // ================================================
    // 6. DEVOLVER DATOS ACTUALIZADOS
    // ================================================

    return organizacion;

  };

// ======================================================
// LISTAR ORGANIZACIONES DISPONIBLES PARA DONACIÓN
// ======================================================

exports.listarDisponiblesParaDonacion =
  async (filtros = {}) => {

    const {
      nombre,
      idTipoActividad,
      latitud,
      longitud,
      radioBusquedaKm
    } = filtros;


    const tieneLatitud =
      latitud != null &&
      latitud !== '';

    const tieneLongitud =
      longitud != null &&
      longitud !== '';

    const tieneRadio =
      radioBusquedaKm != null &&
      radioBusquedaKm !== '';


    const usaUbicacion =
      tieneLatitud ||
      tieneLongitud ||
      tieneRadio;


    if (
      usaUbicacion &&
      !(
        tieneLatitud &&
        tieneLongitud &&
        tieneRadio
      )
    ) {

      const error = new Error(
        'Para filtrar por cercanía deben indicarse latitud, longitud y radio'
      );

      error.status = 400;

      throw error;

    }

    let tipoActividadNormalizado =
      null;


    if (
      idTipoActividad != null &&
      idTipoActividad !== ''
    ) {

      const tipoNumero =
        Number(
          idTipoActividad
        );


      if (
        !Number.isInteger(
          tipoNumero
        ) ||
        tipoNumero <= 0
      ) {

        const error =
          new Error(
            'El tipo de actividad indicado no es válido'
          );


        error.status =
          400;


        throw error;

      }


      tipoActividadNormalizado =
        tipoNumero;

    }


    const filtrosNormalizados = {

      nombre:
        nombre?.trim() || null,

      idTipoActividad: tipoActividadNormalizado,

      latitud: null,

      longitud: null,

      radioBusquedaKm: null

    };


    if (usaUbicacion) {

      const latitudNumero =
        Number(latitud);

      const longitudNumero =
        Number(longitud);

      const radioNumero =
        Number(radioBusquedaKm);


      if (
        !Number.isFinite(latitudNumero) ||
        latitudNumero < -90 ||
        latitudNumero > 90
      ) {

        const error = new Error(
          'La latitud indicada no es válida'
        );

        error.status = 400;

        throw error;

      }


      if (
        !Number.isFinite(longitudNumero) ||
        longitudNumero < -180 ||
        longitudNumero > 180
      ) {

        const error = new Error(
          'La longitud indicada no es válida'
        );

        error.status = 400;

        throw error;

      }


      if (
        !Number.isFinite(radioNumero) ||
        radioNumero <= 0
      ) {

        const error = new Error(
          'El radio de búsqueda debe ser mayor que cero'
        );

        error.status = 400;

        throw error;

      }


      filtrosNormalizados.latitud =
        latitudNumero;

      filtrosNormalizados.longitud =
        longitudNumero;

      filtrosNormalizados.radioBusquedaKm =
        radioNumero;

    }


    return organizacionRepository
      .listarDisponiblesParaDonacion(
        filtrosNormalizados
      );

  };

  // ======================================================
// DETALLE DE ORGANIZACIÓN DISPONIBLE PARA DONACIÓN
// ======================================================

exports.obtenerDetalleDisponibleDonacion =
  async (idOrganizacion) => {

    const uuidValido =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


    if (
      !idOrganizacion ||
      !uuidValido.test(
        idOrganizacion
      )
    ) {

      const error =
        new Error(
          'El identificador de la organización no es válido'
        );

      error.status = 400;

      throw error;

    }


    const organizacion =
      await organizacionRepository
        .obtenerDetalleDisponibleDonacion(
          idOrganizacion
        );


    if (
      !organizacion
    ) {

      const error =
        new Error(
          'La organización no está disponible para recibir donaciones'
        );

      error.status = 404;

      throw error;

    }


    return organizacion;

  };