const perfilPublicoRepository =
  require('../repositories/perfilPublicoRepository');

const ubicacionService =
  require('./ubicacionService');


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

      portada:
        organizacion.portada_url
          ? {
              url:
                organizacion.portada_url,

              texto_alternativo:
                organizacion
                  .portada_texto_alternativo
            }
          : null,

      logo:
        organizacion.logo_url
          ? {
              url:
                organizacion.logo_url,

              texto_alternativo:
                organizacion
                  .logo_texto_alternativo
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

// ======================================================
// CONSULTAR PERFIL PÚBLICO POR SLUG
// ======================================================

exports.obtenerPerfilPublicoPorSlug = async (
  slug
) => {

  const slugNormalizado =
    typeof slug === 'string'
      ? slug.trim().toLowerCase()
      : '';


  if (!slugNormalizado) {

    const error =
      new Error(
        'El identificador del perfil público no es válido'
      );

    error.status = 400;

    throw error;
  }


  const perfil =
    await perfilPublicoRepository
      .obtenerPerfilPublicoPorSlug(
        slugNormalizado
      );


  if (!perfil) {

    const error =
      new Error(
        'Perfil público no encontrado'
      );

    error.status = 404;

    throw error;
  }


  return perfil;
};

// ======================================================
// ACTUALIZAR PERFIL PÚBLICO PROPIO
// ACTIVIDAD 3.6.2
// ======================================================

exports.actualizarPerfilPropio = async (
  idOrganizacion,
  datos = {}
) => {

  const nombreVisible =
    typeof datos.nombreVisible === 'string'
      ? datos.nombreVisible.trim()
      : '';


  const descripcionPublica =
    typeof datos.descripcionPublica === 'string'
      ? datos.descripcionPublica.trim()
      : '';


  const emailContactoPublico =
    typeof datos.emailContactoPublico === 'string'
      ? datos.emailContactoPublico.trim()
      : '';


  const telefonoContactoPublico =
    typeof datos.telefonoContactoPublico === 'string'
      ? datos.telefonoContactoPublico.trim()
      : '';


  const sitioWebUrl =
    typeof datos.sitioWebUrl === 'string'
      ? datos.sitioWebUrl.trim()
      : '';
  
  const redesSociales = {
    instagram:
      datos.redesSociales
        ?.instagram
        ?.trim() || '',

    facebook:
      datos.redesSociales
        ?.facebook
        ?.trim() || '',

    linkedin:
      datos.redesSociales
        ?.linkedin
        ?.trim() || '',
  }


  const horarioAtencion = {
    texto:
      datos.horarioAtencion
        ?.texto
        ?.trim() || '',
  }


  // ====================================================
  // VALIDACIONES
  // ====================================================

  if (!nombreVisible) {

    const error =
      new Error(
        'El nombre público es obligatorio'
      );

    error.status = 400;

    throw error;
  }


  if (
    nombreVisible.length > 150
  ) {

    const error =
      new Error(
        'El nombre público no puede superar los 150 caracteres'
      );

    error.status = 400;

    throw error;
  }


  if (
    descripcionPublica.length > 1000
  ) {

    const error =
      new Error(
        'La descripción pública no puede superar los 1000 caracteres'
      );

    error.status = 400;

    throw error;
  }


  if (emailContactoPublico) {

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailRegex.test(
        emailContactoPublico
      )
    ) {

      const error =
        new Error(
          'El correo electrónico público no tiene un formato válido'
        );

      error.status = 400;

      throw error;
    }

  }


  if (
    telefonoContactoPublico &&
    !/^[0-9+\-\s()]{7,30}$/.test(
      telefonoContactoPublico
    )
  ) {

    const error =
      new Error(
        'El teléfono público no tiene un formato válido'
      );

    error.status = 400;

    throw error;
  }


  if (sitioWebUrl) {

    try {

      const url =
        new URL(
          sitioWebUrl
        );


      if (
        ![
          'http:',
          'https:'
        ].includes(
          url.protocol
        )
      ) {

        throw new Error();

      }

    }
    catch {

      const error =
        new Error(
          'El sitio web debe ser una URL válida'
        );

      error.status = 400;

      throw error;
    }

  }


  // ====================================================
  // ACTUALIZAR PERFIL
  // ====================================================

  const perfil =
    await perfilPublicoRepository
      .actualizarPerfilPropio(
        idOrganizacion,
        {
          nombreVisible,

          descripcionPublica:
            descripcionPublica ||
            null,

          emailContactoPublico:
            emailContactoPublico ||
            null,

          telefonoContactoPublico:
            telefonoContactoPublico ||
            null,

          sitioWebUrl:
            sitioWebUrl ||
            null,
          
          redesSociales,

          horarioAtencion,
        }
      );


  if (!perfil) {

    const error =
      new Error(
        'El perfil público todavía no fue creado'
      );

    error.status = 404;

    throw error;
  }


  return perfil;

};

// ======================================================
// CREAR PERFIL PÚBLICO PROPIO
// ACTIVIDAD 3.6.2
// ======================================================

exports.crearPerfilPropio = async (
  idOrganizacion
) => {

  // ====================================================
  // 1. OBTENER ORGANIZACIÓN
  // ====================================================

  const organizacion =
    await perfilPublicoRepository
      .obtenerOrganizacionParaCrearPerfil(
        idOrganizacion
      );


  if (!organizacion) {

    const error =
      new Error(
        'Organización no encontrada'
      );

    error.status = 404;

    throw error;

  }


  // ====================================================
  // 2. COMPROBAR QUE TODAVÍA NO TENGA PERFIL
  // ====================================================

  const perfilActual =
    await perfilPublicoRepository
      .obtenerPerfilPropio(
        idOrganizacion
      );


  if (
    perfilActual?.perfil
  ) {

    const error =
      new Error(
        'La organización ya posee un perfil público'
      );

    error.status = 409;

    throw error;

  }


  // ====================================================
  // 3. GENERAR SLUG BASE DESDE LA RAZÓN SOCIAL
  // ====================================================

  let slugBase =
    organizacion
      .razon_social
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9]+/g,
        '-'
      )
      .replace(
        /^-+|-+$/g,
        ''
      );


  if (!slugBase) {

    slugBase =
      'organizacion';

  }


  // ====================================================
  // 4. BUSCAR UN SLUG DISPONIBLE
  // ====================================================

  let slug =
    slugBase;


  let contador =
    2;


  while (
    await perfilPublicoRepository
      .existeSlug(
        slug
      )
  ) {

    slug =
      `${slugBase}-${contador}`;


    contador += 1;

  }


  // ====================================================
  // 5. CREAR PERFIL EN BORRADOR
  // ====================================================

  const perfil =
    await perfilPublicoRepository
      .crearPerfilPropio(
        idOrganizacion,
        slug
      );


  if (!perfil) {

    const error =
      new Error(
        'No se pudo crear el perfil público'
      );

    error.status = 500;

    throw error;

  }


  return perfil;

};

// ======================================================
// LISTAR PLANTILLAS ACTIVAS
// ACTIVIDAD 3.6.3
// ======================================================

exports.listarPlantillasActivas = async () => {

  return perfilPublicoRepository
    .listarPlantillasActivas();

};

// ======================================================
// ACTUALIZAR PLANTILLA DEL PERFIL PROPIO
// ACTIVIDAD 3.6.3
// ======================================================

exports.actualizarPlantillaPerfilPropio = async (
  idOrganizacion,
  codigoPlantilla
) => {

  const codigo =
    typeof codigoPlantilla === 'string'
      ? codigoPlantilla
          .trim()
          .toLowerCase()
      : '';


  if (
    ![
      'clasica',
      'comunidad'
    ].includes(
      codigo
    )
  ) {

    const error =
      new Error(
        'La plantilla indicada no es válida'
      );

    error.status = 400;

    throw error;

  }


  const perfil =
    await perfilPublicoRepository
      .actualizarPlantillaPerfilPropio(
        idOrganizacion,
        codigo
      );


  if (!perfil) {

    const error =
      new Error(
        'No se pudo actualizar la plantilla del perfil'
      );

    error.status = 404;

    throw error;

  }


  return perfil;

};

// ======================================================
// GUARDAR IMAGEN DEL PERFIL
// ACTIVIDAD 3.6.3
// ======================================================

exports.guardarImagenPerfil =
  async (
    idOrganizacion,
    tipo,
    archivo,
    textoAlternativo
  ) => {

    // ====================================================
    // VALIDAR PERFIL
    // ====================================================

    const idPerfilPublico =
      await perfilPublicoRepository
        .obtenerIdPerfilPorOrganizacion(
          idOrganizacion
        );


    if (!idPerfilPublico) {

      const error =
        new Error(
          'La organización todavía no posee un perfil público'
        );

      error.status = 404;

      throw error;

    }


    // ====================================================
    // VALIDAR ARCHIVO
    // ====================================================

    if (!archivo) {

      const error =
        new Error(
          'No se recibió ninguna imagen'
        );

      error.status = 400;

      throw error;

    }


    // Defensa adicional.
    // Multer ya realiza esta validación.

    if (
      ![
        'image/jpeg',
        'image/png'
      ].includes(
        archivo.mimetype
      )
    ) {

      const error =
        new Error(
          'La imagen debe ser JPG o PNG'
        );

      error.status = 400;

      throw error;

    }


    // ====================================================
    // VALIDAR TIPO
    // ====================================================

    const tipoNormalizado =
      typeof tipo === 'string'
        ? tipo
            .trim()
            .toUpperCase()
        : '';


    if (
      ![
        'LOGO',
        'PORTADA',
        'GALERIA'
      ].includes(
        tipoNormalizado
      )
    ) {

      const error =
        new Error(
          'El tipo de imagen indicado no es válido'
        );

      error.status = 400;

      throw error;

    }


    // ====================================================
    // TEXTO ALTERNATIVO
    // ====================================================

    const texto =
      typeof textoAlternativo ===
        'string'
        ? textoAlternativo.trim()
        : '';


    if (
      texto.length > 255
    ) {

      const error =
        new Error(
          'El texto alternativo no puede superar los 255 caracteres'
        );

      error.status = 400;

      throw error;

    }


    const imagenUrl =
      `/uploads/perfiles/${archivo.filename}`;


    const datosImagen = {

      url:
        imagenUrl,

      textoAlternativo:
        texto || null,

      mimeType:
        archivo.mimetype,

      tamanoBytes:
        archivo.size

    };


    // ====================================================
    // GALERÍA
    // ====================================================

    if (
      tipoNormalizado ===
        'GALERIA'
    ) {

      const imagen =
        await perfilPublicoRepository
          .agregarImagenGaleria(
            idPerfilPublico,
            datosImagen
          );


      return {
        imagen,
        imagenAnterior: null
      };

    }


    // ====================================================
    // LOGO / PORTADA
    // ====================================================

    return perfilPublicoRepository
      .guardarImagenUnicaPerfil(
        idPerfilPublico,
        tipoNormalizado,
        datosImagen
      );

  };

  // ======================================================
// ELIMINAR IMAGEN DE GALERÍA
// ACTIVIDAD 3.6.3
// ======================================================

exports.eliminarImagenGaleria =
  async (
    idOrganizacion,
    idImagen
  ) => {

    if (!idImagen) {

      const error =
        new Error(
          'La imagen indicada no es válida'
        )

      error.status = 400

      throw error

    }


    const imagen =
      await perfilPublicoRepository
        .eliminarImagenGaleria(
          idOrganizacion,
          idImagen
        )


    if (!imagen) {

      const error =
        new Error(
          'La imagen de galería no existe o no pertenece a la organización'
        )

      error.status = 404

      throw error

    }


    return imagen

  }

// ======================================================
// GUARDAR SECCIÓN CONFIGURABLE
// ACTIVIDAD 3.6.3
// ======================================================

exports.guardarSeccionPerfil =
  async (
    idOrganizacion,
    tipo,
    datos = {}
  ) => {

    const tiposPermitidos = {
      SOBRE_NOSOTROS: 0,
      MISION: 1,
      IMPACTO: 2,
      ACTUALIDAD: 3
    }


    const tipoNormalizado =
      typeof tipo === 'string'
        ? tipo
            .trim()
            .toUpperCase()
        : ''


    if (
      !Object.prototype
        .hasOwnProperty.call(
          tiposPermitidos,
          tipoNormalizado
        )
    ) {

      const error =
        new Error(
          'El tipo de sección indicado no es válido'
        )

      error.status = 400

      throw error

    }


    // ====================================================
    // VALIDAR PERFIL
    // ====================================================

    const idPerfilPublico =
      await perfilPublicoRepository
        .obtenerIdPerfilPorOrganizacion(
          idOrganizacion
        )


    if (!idPerfilPublico) {

      const error =
        new Error(
          'La organización todavía no posee un perfil público'
        )

      error.status = 404

      throw error

    }


    // ====================================================
    // DATOS GENERALES
    // ====================================================

    const titulo =
      typeof datos.titulo ===
        'string'
        ? datos.titulo.trim()
        : ''


    if (
      titulo.length > 150
    ) {

      const error =
        new Error(
          'El título no puede superar los 150 caracteres'
        )

      error.status = 400

      throw error

    }


    const visible =
      datos.visible !== false


    let contenido


    // ====================================================
    // SECCIONES DE TEXTO
    // ====================================================

    if (
      tipoNormalizado !==
        'ACTUALIDAD'
    ) {

      const texto =
        typeof datos.texto ===
          'string'
          ? datos.texto.trim()
          : ''


      if (
        texto.length > 5000
      ) {

        const error =
          new Error(
            'El contenido de la sección es demasiado extenso'
          )

        error.status = 400

        throw error

      }


      contenido = {
        texto
      }

    }


    // ====================================================
    // ACTUALIDAD
    // ====================================================

    else {

      const items =
        Array.isArray(
          datos.items
        )
          ? datos.items
          : []


      const itemsNormalizados =
        items.map(
          item => ({

            titulo:
              typeof item.titulo ===
                'string'
                ? item.titulo
                    .trim()
                    .slice(0, 150)
                : '',

            fecha:
              typeof item.fecha ===
                'string'
                ? item.fecha.trim()
                : '',

            texto:
              typeof item.texto ===
                'string'
                ? item.texto
                    .trim()
                    .slice(0, 2000)
                : '',

            imagen:
              typeof item.imagen ===
                'string'
                ? item.imagen.trim()
                : '',

            enlace:
              typeof item.enlace ===
                'string'
                ? item.enlace.trim()
                : ''

          })
        )


      contenido = {
        items:
          itemsNormalizados
      }

    }


    const seccion =
      await perfilPublicoRepository
        .guardarSeccionPerfil(
          idOrganizacion,
          tipoNormalizado,
          {
            titulo:
              titulo || null,

            contenido,

            visible,

            orden:
              tiposPermitidos[
                tipoNormalizado
              ]
          }
        )


    if (!seccion) {

      const error =
        new Error(
          'No se pudo encontrar el perfil de la organización'
        )

      error.status = 404

      throw error

    }


    return seccion

  }

// ======================================================
// ACTUALIZAR ORDEN DE SECCIONES DEL PERFIL
// ACTIVIDAD 3.6.5
// CP-PRF-006
// ======================================================

exports.actualizarOrdenSecciones =
  async (
    idOrganizacion,
    secciones
  ) => {

    // ====================================================
    // VALIDAR ESTRUCTURA
    // ====================================================

    if (
      !Array.isArray(secciones) ||
      secciones.length === 0
    ) {

      const error =
        new Error(
          'Debe indicarse el orden de las secciones'
        );

      error.status = 400;

      throw error;

    }


    const tiposPermitidos = [
      'SOBRE_NOSOTROS',
      'MISION',
      'IMPACTO',
      'ACTUALIDAD',
    ];


    // ====================================================
    // NORMALIZAR
    // ====================================================

    const tiposNormalizados =
      secciones.map(
        tipo =>
          typeof tipo === 'string'
            ? tipo
                .trim()
                .toUpperCase()
            : ''
      );


    // ====================================================
    // VALIDAR TIPOS
    // ====================================================

    const todosValidos =
      tiposNormalizados.every(
        tipo =>
          tiposPermitidos.includes(
            tipo
          )
      );


    if (!todosValidos) {

      const error =
        new Error(
          'Una o más secciones indicadas no son válidas'
        );

      error.status = 400;

      throw error;

    }


    // ====================================================
    // EVITAR DUPLICADOS
    // ====================================================

    const tiposUnicos =
      [
        ...new Set(
          tiposNormalizados
        )
      ];


    if (
      tiposUnicos.length !==
      tiposNormalizados.length
    ) {

      const error =
        new Error(
          'No pueden repetirse secciones en el orden indicado'
        );

      error.status = 400;

      throw error;

    }


    // ====================================================
    // VALIDAR QUE ESTÉN TODAS LAS SECCIONES
    // ====================================================

    if (
      tiposUnicos.length !==
      tiposPermitidos.length
    ) {

      const error =
        new Error(
          'Debe indicarse el orden de todas las secciones'
        );

      error.status = 400;

      throw error;

    }


    // ====================================================
    // ACTUALIZAR ORDEN
    // ====================================================

    return await perfilPublicoRepository
      .actualizarOrdenSecciones(
        idOrganizacion,
        tiposNormalizados
      );

  };
  
// ======================================================
// PUBLICAR PERFIL PROPIO
// ACTIVIDAD 3.6.4
// ======================================================

exports.publicarPerfilPropio =
  async (
    idOrganizacion
  ) => {

    const resultadoPerfil =
      await perfilPublicoRepository
        .obtenerPerfilPropio(
          idOrganizacion
        )


    if (
      !resultadoPerfil ||
      !resultadoPerfil.perfil
    ) {

      const error =
        new Error(
          'La organización todavía no posee un perfil público'
        )

      error.status = 404

      throw error

    }


    const perfil =
      resultadoPerfil.perfil


    if (
      perfil.estado_publicacion ===
        'PUBLICADO'
    ) {

      const error =
        new Error(
          'El perfil ya se encuentra publicado'
        )

      error.status = 409

      throw error

    }


    if (
      perfil.estado_publicacion ===
        'OCULTO'
    ) {

      const error =
        new Error(
          'El perfil fue ocultado por un administrador y no puede publicarse'
        )

      error.status = 409

      throw error

    }


    if (!perfil.slug) {

      const error =
        new Error(
          'El perfil debe tener una URL pública antes de publicarse'
        )

      error.status = 400

      throw error

    }


    const resultado =
      await perfilPublicoRepository
        .publicarPerfilPropio(
          idOrganizacion
        )


    if (!resultado) {

      const error =
        new Error(
          'No fue posible publicar el perfil'
        )

      error.status = 409

      throw error

    }


    return resultado

  }


// ======================================================
// RETIRAR PERFIL PROPIO
// ACTIVIDAD 3.6.4
// ======================================================

exports.retirarPerfilPropio =
  async (
    idOrganizacion
  ) => {

    const resultadoPerfil =
      await perfilPublicoRepository
        .obtenerPerfilPropio(
          idOrganizacion
        )


    if (
      !resultadoPerfil ||
      !resultadoPerfil.perfil
    ) {

      const error =
        new Error(
          'La organización todavía no posee un perfil público'
        )

      error.status = 404

      throw error

    }


    const perfil =
      resultadoPerfil.perfil


    if (
      perfil.estado_publicacion !==
        'PUBLICADO'
    ) {

      const error =
        new Error(
          'Solo puede retirarse un perfil que se encuentre publicado'
        )

      error.status = 409

      throw error

    }


    const resultado =
      await perfilPublicoRepository
        .retirarPerfilPropio(
          idOrganizacion
        )


    if (!resultado) {

      const error =
        new Error(
          'No fue posible retirar el perfil'
        )

      error.status = 409

      throw error

    }


    return resultado

  }

// ======================================================
// ACTUALIZAR TIPOS DE ACTIVIDAD
// ACTIVIDAD 3.6.5
// ======================================================

exports.actualizarTiposActividad =
  async (
    idOrganizacion,
    idsTiposActividad
  ) => {

    if (
      !Array.isArray(
        idsTiposActividad
      )
    ) {

      const error =
        new Error(
          'idsTiposActividad debe ser un arreglo'
        );

      error.status = 400;

      throw error;
    }

    const idsNormalizados =
      idsTiposActividad.map(
        id => Number(id)
      );

    const todosValidos =
      idsNormalizados.every(
        id =>
          Number.isInteger(id) &&
          id > 0
      );

    if (!todosValidos) {

      const error =
        new Error(
          'Todos los tipos de actividad deben tener identificadores válidos'
        );

      error.status = 400;

      throw error;
    }

    return await perfilPublicoRepository
      .actualizarTiposActividadOrganizacion(
        idOrganizacion,
        idsNormalizados
      );
  };

// ======================================================
// ACTUALIZAR UBICACIÓN INSTITUCIONAL
// ACTIVIDAD 3.6.5
// ======================================================

exports.actualizarUbicacion =
  async (
    idOrganizacion,
    datosUbicacion
  ) => {

    if (
      !datosUbicacion ||
      typeof datosUbicacion !== 'object'
    ) {

      const error =
        new Error(
          'La ubicación es obligatoria'
        );

      error.status = 400;

      throw error;

    }


    const ubicacion =
      await ubicacionService
        .obtenerOCrearUbicacion({
          ...datosUbicacion,

          esAproximada: false,
        });


    const organizacion =
      await perfilPublicoRepository
        .actualizarUbicacionOrganizacion(
          idOrganizacion,
          ubicacion.id_ubicacion
        );


    if (!organizacion) {

      const error =
        new Error(
          'Organización no encontrada'
        );

      error.status = 404;

      throw error;

    }


    return ubicacion;

  };