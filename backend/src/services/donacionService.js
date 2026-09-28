const donacionRepository =
  require(
    '../repositories/donacionRepository'
  );


// ======================================================
// LISTAR CATEGORÍAS DE DONACIÓN
// ======================================================

exports.listarCategorias =
  async () => {

    const categorias =
      await donacionRepository
        .listarCategorias();


    return categorias;

  };

  // ======================================================
// CREAR DONACIÓN
// ======================================================

exports.crearDonacion =
  async (
    idVoluntario,
    datos,
    idempotencyKey
  ) => {

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


    const {
      id_organizacion,
      id_categoria_donacion,
      id_ubicacion,
      descripcion,
      cantidad,
      unidad,
      condicion_bien,
      disponible_desde
    } = datos;


    // ==================================================
    // CAMPOS OBLIGATORIOS
    // ==================================================

    if (
      !id_organizacion ||
      id_categoria_donacion == null ||
      cantidad == null ||
      !unidad ||
      !condicion_bien ||
      !disponible_desde
    ) {

      const error =
        new Error(
          'Faltan datos obligatorios para registrar la donación'
        );

      error.status = 400;

      throw error;

    }


    // ==================================================
    // UUID ORGANIZACIÓN
    // ==================================================

    if (
      !uuidRegex.test(
        id_organizacion
      )
    ) {

      const error =
        new Error(
          'La organización indicada no es válida'
        );

      error.status = 400;

      throw error;

    }


    // ==================================================
    // UUID UBICACIÓN OPCIONAL
    // ==================================================

    if (
      id_ubicacion &&
      !uuidRegex.test(
        id_ubicacion
      )
    ) {

      const error =
        new Error(
          'La ubicación indicada no es válida'
        );

      error.status = 400;

      throw error;

    }


    // ==================================================
    // IDEMPOTENCY KEY
    // ==================================================

    if (
      !idempotencyKey ||
      !uuidRegex.test(
        idempotencyKey
      )
    ) {

      const error =
        new Error(
          'La clave de idempotencia no es válida'
        );

      error.status = 400;

      throw error;

    }


    // ==================================================
    // CATEGORÍA
    // ==================================================

    const categoria =
      Number(
        id_categoria_donacion
      );


    if (
      !Number.isInteger(
        categoria
      ) ||
      categoria <= 0
    ) {

      const error =
        new Error(
          'La categoría de donación no es válida'
        );

      error.status = 400;

      throw error;

    }


    // ==================================================
    // DESCRIPCIÓN
    // ==================================================

    if (
  descripcion == null ||
  String(descripcion).trim().length === 0
) {

  const error =
    new Error(
      'La descripción es obligatoria'
    );

  error.status = 400;

  throw error;

}


const descripcionNormalizada =
  String(
    descripcion
  ).trim();

    // ==================================================
    // CANTIDAD
    // ==================================================

    const cantidadNumerica =
      Number(
        cantidad
      );


    if (
      !Number.isFinite(
        cantidadNumerica
      ) ||
      cantidadNumerica <= 0
    ) {

      const error =
        new Error(
          'La cantidad debe ser un número mayor que cero'
        );

      error.status = 400;

      throw error;

    }


    // ==================================================
    // UNIDAD Y CONDICIÓN
    // ==================================================

    const unidadNormalizada =
      String(
        unidad
      ).trim();

    const condicionNormalizada =
      String(
        condicion_bien
      ).trim();


    if (
      unidadNormalizada.length === 0 ||
      condicionNormalizada.length === 0
    ) {

      const error =
        new Error(
          'La unidad y la condición del bien son obligatorias'
        );

      error.status = 400;

      throw error;

    }


    // ==================================================
    // DISPONIBILIDAD
    // ==================================================

    const fechaDisponible =
      new Date(
        `${disponible_desde}T00:00:00`
      );


    if (
      Number.isNaN(
        fechaDisponible.getTime()
      )
    ) {

      const error =
        new Error(
          'La fecha de disponibilidad no es válida'
        );

      error.status = 400;

      throw error;

    }

    const hoy =
        new Date();

      hoy.setHours(
        0,
        0,
        0,
        0
      );


      if (
        fechaDisponible < hoy
      ) {

        const error =
          new Error(
            'La fecha de disponibilidad no puede ser anterior a hoy'
          );

        error.status = 400;

        throw error;

      }


    return await donacionRepository
      .crearDonacionTransaccional({

        idVoluntario,

        idOrganizacion:
          id_organizacion,

        idCategoriaDonacion:
          categoria,

        idUbicacion:
          id_ubicacion || null,

        descripcion:
          descripcionNormalizada,

        cantidad:
          cantidadNumerica,

        unidad:
          unidadNormalizada,

        condicionBien:
          condicionNormalizada,

        disponibleDesde:
          disponible_desde,

        idempotencyKey

      });

  };

 // ======================================================
// ASOCIAR IMAGEN A UNA DONACIÓN
// ======================================================

exports.actualizarImagenDonacion =
  async (
    idDonacion,
    idVoluntario,
    imagenUrl
  ) => {

    if (
      !idDonacion ||
      !idVoluntario
    ) {

      const error =
        new Error(
          'No se pudo identificar la donación'
        );

      error.status = 400;
      throw error;

    }


    if (
      typeof imagenUrl !== 'string' ||
      !imagenUrl.trim()
    ) {

      const error =
        new Error(
          'La referencia de la imagen no es válida'
        );

      error.status = 400;
      throw error;

    }


    const donacion =
      await donacionRepository
        .actualizarImagenDonacion(
          idDonacion,
          idVoluntario,
          imagenUrl.trim()
        );


    if (
      !donacion
    ) {

      const error =
        new Error(
          'Donación no encontrada'
        );

      error.status = 404;
      throw error;

    }


    return donacion;

  }; 

  // ======================================================
// LISTAR DONACIONES PROPIAS DEL VOLUNTARIO
// ======================================================

exports.listarDonacionesPropias =
  async (
    idVoluntario,
    estado
  ) => {

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


    if (
      !idVoluntario ||
      !uuidRegex.test(
        idVoluntario
      )
    ) {

      const error =
        new Error(
          'No se pudo identificar al voluntario'
        );

      error.status = 400;

      throw error;

    }


    const estadosPermitidos = [
      'PENDIENTE',
      'ACEPTADA',
      'RECHAZADA',
      'COORDINADA',
      'RECIBIDA'
    ];


    let estadoNormalizado =
      null;


    if (
      estado != null &&
      String(estado).trim()
    ) {

      estadoNormalizado =
        String(estado)
          .trim()
          .toUpperCase();


      if (
        !estadosPermitidos.includes(
          estadoNormalizado
        )
      ) {

        const error =
          new Error(
            'El estado de donación indicado no es válido'
          );

        error.status = 400;

        throw error;

      }

    }


    return await donacionRepository
      .listarDonacionesPropias(
        idVoluntario,
        estadoNormalizado
      );

  };


// ======================================================
// OBTENER DETALLE DE UNA DONACIÓN PROPIA
// ======================================================

exports.obtenerDetalleDonacionPropia =
  async (
    idDonacion,
    idVoluntario
  ) => {

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


    if (
      !idDonacion ||
      !uuidRegex.test(
        idDonacion
      )
    ) {

      const error =
        new Error(
          'El identificador de la donación no es válido'
        );

      error.status = 400;

      throw error;

    }


    if (
      !idVoluntario ||
      !uuidRegex.test(
        idVoluntario
      )
    ) {

      const error =
        new Error(
          'No se pudo identificar al voluntario'
        );

      error.status = 400;

      throw error;

    }


    const donacion =
      await donacionRepository
        .obtenerDetalleDonacionPropia(
          idDonacion,
          idVoluntario
        );


    if (
      !donacion
    ) {

      const error =
        new Error(
          'Donación no encontrada'
        );

      error.status = 404;

      throw error;

    }


    return donacion;

  };