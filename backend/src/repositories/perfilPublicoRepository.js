const pool = require('../config/db');


// ======================================================
// DIRECTORIO PÚBLICO DE ORGANIZACIONES
// ======================================================

exports.listarOrganizacionesPublicas = async (filtros = {}) => {

  const {
    nombre,
    idTipoActividad,
    ubicacion
  } = filtros;

  const valores = [];

  const condiciones = [
    `u.estado_cuenta = 'ACTIVA'`,
    `o.estado_verificacion = 'VERIFICADA'`,
    `p.estado_publicacion = 'PUBLICADO'`
  ];


  // ====================================================
  // FILTRO POR NOMBRE VISIBLE
  // ====================================================

  if (nombre) {

    valores.push(`%${nombre}%`);

    condiciones.push(
      `p.nombre_visible ILIKE $${valores.length}`
    );
  }


  // ====================================================
  // FILTRO POR TIPO DE ACTIVIDAD
  // ====================================================

  if (idTipoActividad != null) {

    valores.push(idTipoActividad);

    condiciones.push(`
      EXISTS (
        SELECT 1
        FROM organizacion_tipo_actividad ota_filtro
        WHERE ota_filtro.id_organizacion = o.id_organizacion
          AND ota_filtro.id_tipo_actividad = $${valores.length}
      )
    `);
  }


  // ====================================================
  // FILTRO POR UBICACIÓN APROXIMADA
  // ====================================================

if (ubicacion) {

  valores.push(`%${ubicacion}%`);

  const indiceUbicacion = valores.length;

  condiciones.push(`
    (
      ub.localidad ILIKE $${indiceUbicacion}
      OR ub.provincia ILIKE $${indiceUbicacion}
      OR CONCAT_WS(
        ', ',
        ub.localidad,
        ub.provincia
      ) ILIKE $${indiceUbicacion}
    )
  `);
}


  const query = `
    SELECT
      p.nombre_visible,
      p.slug,
      p.descripcion_publica,

      ub.localidad,
      ub.provincia,

      COALESCE(
        (
          SELECT json_agg(
            ta.nombre
            ORDER BY ta.nombre ASC
          )
          FROM organizacion_tipo_actividad ota
          INNER JOIN tipo_actividad ta
            ON ta.id_tipo_actividad =
              ota.id_tipo_actividad
          WHERE ota.id_organizacion =
            o.id_organizacion
        ),
        '[]'::json
      ) AS tipos_actividad,

      portada.url AS portada_url,
      portada.texto_alternativo
        AS portada_texto_alternativo,

      logo.url AS logo_url,
      logo.texto_alternativo
        AS logo_texto_alternativo

    FROM perfil_publico_organizacion p

    INNER JOIN organizacion o
      ON o.id_organizacion =
        p.id_organizacion

    INNER JOIN usuario u
      ON u.id_usuario =
        o.id_usuario

    LEFT JOIN ubicacion ub
      ON ub.id_ubicacion =
        o.id_ubicacion

    LEFT JOIN LATERAL (
      SELECT
        i.url,
        i.texto_alternativo
      FROM imagen_perfil_organizacion i
      WHERE i.id_perfil_publico =
        p.id_perfil_publico
        AND i.visible = TRUE
        AND i.tipo = 'PORTADA'
      ORDER BY i.orden ASC
      LIMIT 1
    ) portada ON TRUE

    LEFT JOIN LATERAL (
      SELECT
        i.url,
        i.texto_alternativo
      FROM imagen_perfil_organizacion i
      WHERE i.id_perfil_publico =
        p.id_perfil_publico
        AND i.visible = TRUE
        AND i.tipo = 'LOGO'
      ORDER BY i.orden ASC
      LIMIT 1
    ) logo ON TRUE

    WHERE ${condiciones.join('\n AND ')}

    ORDER BY
      p.nombre_visible ASC
  `;

  const result = await pool.query(
    query,
    valores
  );

  return result.rows;
};

// ======================================================
// CONSULTAR PERFIL PROPIO
// ======================================================

exports.obtenerPerfilPropio = async (
  idOrganizacion
) => {

  const organizacionResult = await pool.query(
  `
  SELECT
    o.razon_social,
    o.estado_verificacion,

    ub.id_ubicacion,
    ub.latitud,
    ub.longitud,
    ub.direccion,
    ub.localidad,
    ub.provincia,
    ub.es_aproximada

  FROM organizacion o

  LEFT JOIN ubicacion ub
    ON ub.id_ubicacion =
      o.id_ubicacion

  WHERE o.id_organizacion = $1
  `,
  [idOrganizacion]
);

  if (organizacionResult.rows.length === 0) {
    return null;
  }


  const perfilResult = await pool.query(
    `
    SELECT
      p.id_perfil_publico,
      p.nombre_visible,
      p.descripcion_publica,
      p.slug,
      p.email_contacto_publico,
      p.telefono_contacto_publico,
      p.sitio_web_url,
      p.redes_sociales,
      p.horario_atencion,
      p.estado_publicacion,
      p.publicado_en,
      p.retirado_en,
      p.creado_en,
      p.actualizado_en,

      pl.codigo AS plantilla_codigo,
      pl.nombre AS plantilla_nombre,
      pl.version AS plantilla_version

    FROM perfil_publico_organizacion p

    INNER JOIN plantilla_perfil pl
      ON pl.id_plantilla = p.id_plantilla

    WHERE p.id_organizacion = $1
    `,
    [idOrganizacion]
  );


  if (perfilResult.rows.length === 0) {

    const organizacion =
      organizacionResult.rows[0];


    return {

      organizacion: {

        razon_social:
          organizacion.razon_social,

        estado_verificacion:
          organizacion.estado_verificacion,

        ubicacion:
          organizacion.id_ubicacion
            ? {
                id_ubicacion:
                  organizacion.id_ubicacion,

                latitud:
                  organizacion.latitud,

                longitud:
                  organizacion.longitud,

                direccion:
                  organizacion.direccion,

                localidad:
                  organizacion.localidad,

                provincia:
                  organizacion.provincia,

                es_aproximada:
                  organizacion.es_aproximada,
              }
            : null,

      },

      perfil: null,

    };
  }


  const perfil = perfilResult.rows[0];


  const [
    tiposResult,
    imagenesResult,
    seccionesResult
  ] = await Promise.all([

    pool.query(
      `
      SELECT
        ta.id_tipo_actividad,
        ta.nombre
      FROM organizacion_tipo_actividad ota
      INNER JOIN tipo_actividad ta
        ON ta.id_tipo_actividad =
          ota.id_tipo_actividad
      WHERE ota.id_organizacion = $1
      ORDER BY ta.nombre ASC
      `,
      [idOrganizacion]
    ),

    pool.query(
      `
      SELECT
        id_imagen,
        url,
        tipo,
        texto_alternativo,
        orden,
        visible,
        mime_type,
        tamano_bytes,
        creada_en
      FROM imagen_perfil_organizacion
      WHERE id_perfil_publico = $1
      ORDER BY orden ASC
      `,
      [perfil.id_perfil_publico]
    ),

    pool.query(
      `
      SELECT
        id_seccion,
        tipo_seccion,
        titulo,
        contenido,
        orden,
        visible,
        actualizada_en
      FROM seccion_perfil_organizacion
      WHERE id_perfil_publico = $1
      ORDER BY orden ASC
      `,
      [perfil.id_perfil_publico]
    )

  ]);

  const organizacion =
    organizacionResult.rows[0];

  return {

    organizacion: {

      razon_social:
        organizacion.razon_social,

      estado_verificacion:
        organizacion.estado_verificacion,

      ubicacion:
        organizacion.id_ubicacion
          ? {
              id_ubicacion:
                organizacion.id_ubicacion,

              latitud:
                organizacion.latitud,

              longitud:
                organizacion.longitud,

              direccion:
                organizacion.direccion,

              localidad:
                organizacion.localidad,

              provincia:
                organizacion.provincia,

              es_aproximada:
                organizacion.es_aproximada,
            }
          : null,

    },

    perfil: {
      id_perfil_publico:
        perfil.id_perfil_publico,

      nombre_visible:
        perfil.nombre_visible,

      descripcion_publica:
        perfil.descripcion_publica,

      slug:
        perfil.slug,

      email_contacto_publico:
        perfil.email_contacto_publico,

      telefono_contacto_publico:
        perfil.telefono_contacto_publico,

      sitio_web_url:
        perfil.sitio_web_url,

      redes_sociales:
        perfil.redes_sociales,

      horario_atencion:
        perfil.horario_atencion,

      estado_publicacion:
        perfil.estado_publicacion,

      plantilla: {
        codigo:
          perfil.plantilla_codigo,

        nombre:
          perfil.plantilla_nombre,

        version:
          perfil.plantilla_version
      },

      tipos_actividad:
        tiposResult.rows,

      imagenes:
        imagenesResult.rows,

      secciones:
        seccionesResult.rows,

      publicado_en:
        perfil.publicado_en,

      retirado_en:
        perfil.retirado_en,

      creado_en:
        perfil.creado_en,

      actualizado_en:
        perfil.actualizado_en
    }
  };
};

// ======================================================
// CONSULTAR PERFIL PÚBLICO POR SLUG
// ======================================================

exports.obtenerPerfilPublicoPorSlug = async (
  slug
) => {

  const perfilResult = await pool.query(
    `
    SELECT
      p.id_perfil_publico,
      p.nombre_visible,
      p.descripcion_publica,
      p.slug,
      p.email_contacto_publico,
      p.telefono_contacto_publico,
      p.sitio_web_url,
      p.redes_sociales,
      p.horario_atencion,
      p.estado_publicacion,
      p.publicado_en,

      pl.codigo AS plantilla_codigo,
      pl.nombre AS plantilla_nombre,
      pl.version AS plantilla_version,

      ub.localidad,
      ub.provincia,

      o.id_organizacion

    FROM perfil_publico_organizacion p

    INNER JOIN organizacion o
      ON o.id_organizacion =
        p.id_organizacion

    INNER JOIN usuario u
      ON u.id_usuario =
        o.id_usuario

    INNER JOIN plantilla_perfil pl
      ON pl.id_plantilla =
        p.id_plantilla

    LEFT JOIN ubicacion ub
      ON ub.id_ubicacion =
        o.id_ubicacion

    WHERE p.slug = $1
      AND p.estado_publicacion = 'PUBLICADO'
      AND o.estado_verificacion = 'VERIFICADA'
      AND u.estado_cuenta = 'ACTIVA'

    LIMIT 1
    `,
    [slug]
  );


  if (perfilResult.rows.length === 0) {
    return null;
  }


  const perfil =
    perfilResult.rows[0];


  const [
    tiposResult,
    imagenesResult,
    seccionesResult,
    oportunidadesResult
  ] = await Promise.all([

    pool.query(
      `
      SELECT
        ta.id_tipo_actividad,
        ta.nombre

      FROM organizacion_tipo_actividad ota

      INNER JOIN tipo_actividad ta
        ON ta.id_tipo_actividad =
          ota.id_tipo_actividad

      WHERE ota.id_organizacion = $1

      ORDER BY ta.nombre ASC
      `,
      [perfil.id_organizacion]
    ),

    pool.query(
      `
      SELECT
        id_imagen,
        url,
        tipo,
        texto_alternativo,
        orden

      FROM imagen_perfil_organizacion

      WHERE id_perfil_publico = $1
        AND visible = TRUE

      ORDER BY orden ASC
      `,
      [perfil.id_perfil_publico]
    ),

    pool.query(
      `
      SELECT
        id_seccion,
        tipo_seccion,
        titulo,
        contenido,
        orden

      FROM seccion_perfil_organizacion

      WHERE id_perfil_publico = $1
        AND visible = TRUE

      ORDER BY orden ASC
      `,
      [perfil.id_perfil_publico]
    ),

    pool.query(
      `
      SELECT
        op.id_oportunidad,
        op.titulo,
        op.descripcion,
        op.requisitos,
        op.cupo_total,
        op.fecha_inicio,
        op.fecha_fin,
        op.urgencia,
        op.tipo_ubicacion

      FROM oportunidad op

      WHERE op.id_organizacion = $1
        AND op.estado = 'PUBLICADA'
        AND op.eliminado_en IS NULL

      ORDER BY op.fecha_inicio ASC
      `,
      [perfil.id_organizacion]
    )

  ]);


  return {
    nombre_visible:
      perfil.nombre_visible,

    descripcion_publica:
      perfil.descripcion_publica,

    slug:
      perfil.slug,

    email_contacto_publico:
      perfil.email_contacto_publico,

    telefono_contacto_publico:
      perfil.telefono_contacto_publico,

    sitio_web_url:
      perfil.sitio_web_url,

    redes_sociales:
      perfil.redes_sociales,

    horario_atencion:
      perfil.horario_atencion,

    ubicacion_aproximada:
      perfil.localidad ||
      perfil.provincia
        ? {
            localidad:
              perfil.localidad,
            provincia:
              perfil.provincia
          }
        : null,

    plantilla: {
      codigo:
        perfil.plantilla_codigo,

      nombre:
        perfil.plantilla_nombre,

      version:
        perfil.plantilla_version
    },

    tipos_actividad:
      tiposResult.rows,

    imagenes:
      imagenesResult.rows,

    secciones:
      seccionesResult.rows,

    oportunidades:
      oportunidadesResult.rows,

    publicado_en:
      perfil.publicado_en
  };
};

// ======================================================
// ACTUALIZAR DATOS BÁSICOS DEL PERFIL PROPIO
// ACTIVIDAD 3.6.2
// ======================================================

exports.actualizarPerfilPropio = async (
  idOrganizacion,
  datos
) => {

  const {
    nombreVisible,
    descripcionPublica,
    emailContactoPublico,
    telefonoContactoPublico,
    sitioWebUrl,
    redesSociales,
    horarioAtencion
  } = datos;


  const result =
    await pool.query(
      `
      UPDATE perfil_publico_organizacion

      SET
        nombre_visible = $1,
        descripcion_publica = $2,
        email_contacto_publico = $3,
        telefono_contacto_publico = $4,
        sitio_web_url = $5,
        redes_sociales = $6,
        horario_atencion = $7,
        actualizado_en = CURRENT_TIMESTAMP

      WHERE id_organizacion = $8

      RETURNING
        id_perfil_publico,
        nombre_visible,
        descripcion_publica,
        slug,
        email_contacto_publico,
        telefono_contacto_publico,
        sitio_web_url,
        redes_sociales,
        horario_atencion,
        estado_publicacion,
        actualizado_en
      `,
      [
        nombreVisible,
        descripcionPublica,
        emailContactoPublico,
        telefonoContactoPublico,
        sitioWebUrl,
        redesSociales || {},
        horarioAtencion || {},
        idOrganizacion
      ]
    );


  return (
    result.rows[0] ||
    null
  );

};

// ======================================================
// OBTENER DATOS DE ORGANIZACIÓN PARA CREAR PERFIL
// ACTIVIDAD 3.6.2
// ======================================================

exports.obtenerOrganizacionParaCrearPerfil =
  async (
    idOrganizacion
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          id_organizacion,
          razon_social
        FROM organizacion
        WHERE id_organizacion = $1
        `,
        [
          idOrganizacion
        ]
      );


    return (
      result.rows[0] ||
      null
    );

  };


// ======================================================
// COMPROBAR DISPONIBILIDAD DE SLUG
// ACTIVIDAD 3.6.2
// ======================================================

exports.existeSlug = async (
  slug
) => {

  const result =
    await pool.query(
      `
      SELECT
        1
      FROM perfil_publico_organizacion
      WHERE slug = $1
      LIMIT 1
      `,
      [
        slug
      ]
    );


  return (
    result.rows.length > 0
  );

};


// ======================================================
// CREAR PERFIL PÚBLICO PROPIO
// ACTIVIDAD 3.6.2
// ======================================================

exports.crearPerfilPropio = async (
  idOrganizacion,
  slug
) => {

  const result =
    await pool.query(
      `
      INSERT INTO perfil_publico_organizacion
        (
          id_organizacion,
          id_plantilla,
          nombre_visible,
          slug,
          estado_publicacion
        )

      SELECT
        o.id_organizacion,
        p.id_plantilla,
        o.razon_social,
        $2,
        'BORRADOR'

      FROM organizacion o

      CROSS JOIN LATERAL (
        SELECT
          id_plantilla
        FROM plantilla_perfil
        WHERE codigo = 'clasica'
          AND activo = TRUE
        ORDER BY
          id_plantilla ASC
        LIMIT 1
      ) p

      WHERE o.id_organizacion = $1

      RETURNING
        id_perfil_publico,
        id_organizacion,
        nombre_visible,
        slug,
        descripcion_publica,
        email_contacto_publico,
        telefono_contacto_publico,
        sitio_web_url,
        estado_publicacion,
        creado_en,
        actualizado_en
      `,
      [
        idOrganizacion,
        slug
      ]
    );


  return (
    result.rows[0] ||
    null
  );

};

// ======================================================
// LISTAR PLANTILLAS ACTIVAS
// ACTIVIDAD 3.6.3
// ======================================================

exports.listarPlantillasActivas = async () => {

  const result =
    await pool.query(
      `
      SELECT
        id_plantilla,
        codigo,
        nombre,
        version,
        descripcion
      FROM plantilla_perfil
      WHERE activo = TRUE
      ORDER BY
        id_plantilla ASC
      `
    );


  return result.rows;

};

// ======================================================
// ACTUALIZAR PLANTILLA DEL PERFIL PROPIO
// ACTIVIDAD 3.6.3
// ======================================================

exports.actualizarPlantillaPerfilPropio = async (
  idOrganizacion,
  codigoPlantilla
) => {

  const result =
    await pool.query(
      `
      UPDATE perfil_publico_organizacion p

      SET
        id_plantilla = pl.id_plantilla,
        actualizado_en = CURRENT_TIMESTAMP

      FROM plantilla_perfil pl

      WHERE p.id_organizacion = $1
        AND pl.codigo = $2
        AND pl.activo = TRUE

      RETURNING
        p.id_perfil_publico,
        p.id_organizacion,
        p.id_plantilla,
        p.estado_publicacion,
        p.actualizado_en
      `,
      [
        idOrganizacion,
        codigoPlantilla
      ]
    );


  return (
    result.rows[0] ||
    null
  );

};
// ======================================================
// OBTENER ID DEL PERFIL PROPIO
// ACTIVIDAD 3.6.3
// ======================================================

exports.obtenerIdPerfilPorOrganizacion =
  async (
    idOrganizacion
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          id_perfil_publico
        FROM perfil_publico_organizacion
        WHERE id_organizacion = $1
        `,
        [
          idOrganizacion
        ]
      );


    return (
      result.rows[0]
        ?.id_perfil_publico ||
      null
    );

  };


// ======================================================
// OBTENER IMAGEN ÚNICA DEL PERFIL
// LOGO / PORTADA
// ======================================================

exports.obtenerImagenUnicaPerfil =
  async (
    idPerfilPublico,
    tipo
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          id_imagen,
          url,
          tipo,
          texto_alternativo,
          orden,
          visible,
          mime_type,
          tamano_bytes,
          creada_en
        FROM imagen_perfil_organizacion
        WHERE id_perfil_publico = $1
          AND tipo = $2
        LIMIT 1
        `,
        [
          idPerfilPublico,
          tipo
        ]
      );


    return (
      result.rows[0] ||
      null
    );

  };


// ======================================================
// GUARDAR / REEMPLAZAR LOGO O PORTADA
// ======================================================

exports.guardarImagenUnicaPerfil =
  async (
    idPerfilPublico,
    tipo,
    datos
  ) => {

    const {
      url,
      textoAlternativo,
      mimeType,
      tamanoBytes
    } = datos;


    const existente =
      await exports
        .obtenerImagenUnicaPerfil(
          idPerfilPublico,
          tipo
        );


    let result;


    if (existente) {

      result =
        await pool.query(
          `
          UPDATE imagen_perfil_organizacion

          SET
            url = $3,
            texto_alternativo = $4,
            mime_type = $5,
            tamano_bytes = $6,
            visible = TRUE,
            orden = 0,
            creada_en = NOW()

          WHERE id_perfil_publico = $1
            AND tipo = $2

          RETURNING
            id_imagen,
            url,
            tipo,
            texto_alternativo,
            orden,
            visible,
            mime_type,
            tamano_bytes,
            creada_en
          `,
          [
            idPerfilPublico,
            tipo,
            url,
            textoAlternativo,
            mimeType,
            tamanoBytes
          ]
        );

    }
    else {

      result =
        await pool.query(
          `
          INSERT INTO imagen_perfil_organizacion (
            id_perfil_publico,
            url,
            tipo,
            texto_alternativo,
            orden,
            visible,
            mime_type,
            tamano_bytes
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            0,
            TRUE,
            $5,
            $6
          )

          RETURNING
            id_imagen,
            url,
            tipo,
            texto_alternativo,
            orden,
            visible,
            mime_type,
            tamano_bytes,
            creada_en
          `,
          [
            idPerfilPublico,
            url,
            tipo,
            textoAlternativo,
            mimeType,
            tamanoBytes
          ]
        );

    }


    await pool.query(
      `
      UPDATE perfil_publico_organizacion
      SET actualizado_en = NOW()
      WHERE id_perfil_publico = $1
      `,
      [
        idPerfilPublico
      ]
    );


    return {
      imagen:
        result.rows[0],

      imagenAnterior:
        existente
    };

  };


// ======================================================
// AGREGAR IMAGEN A GALERÍA
// ======================================================

exports.agregarImagenGaleria =
  async (
    idPerfilPublico,
    datos
  ) => {

    const {
      url,
      textoAlternativo,
      mimeType,
      tamanoBytes
    } = datos;


    const result =
      await pool.query(
        `
        INSERT INTO imagen_perfil_organizacion (
          id_perfil_publico,
          url,
          tipo,
          texto_alternativo,
          orden,
          visible,
          mime_type,
          tamano_bytes
        )

        VALUES (
          $1,
          $2,
          'GALERIA',
          $3,

          COALESCE(
            (
              SELECT
                MAX(orden) + 1

              FROM imagen_perfil_organizacion

              WHERE id_perfil_publico = $1
                AND tipo = 'GALERIA'
            ),
            0
          ),

          TRUE,
          $4,
          $5
        )

        RETURNING
          id_imagen,
          url,
          tipo,
          texto_alternativo,
          orden,
          visible,
          mime_type,
          tamano_bytes,
          creada_en
        `,
        [
          idPerfilPublico,
          url,
          textoAlternativo,
          mimeType,
          tamanoBytes
        ]
      );


    await pool.query(
      `
      UPDATE perfil_publico_organizacion
      SET actualizado_en = NOW()
      WHERE id_perfil_publico = $1
      `,
      [
        idPerfilPublico
      ]
    );


    return result.rows[0];

  };

  // ======================================================
// OBTENER IMAGEN DE GALERÍA PROPIA
// ACTIVIDAD 3.6.3
// ======================================================

exports.obtenerImagenGaleriaPropia =
  async (
    idOrganizacion,
    idImagen
  ) => {

    const result =
      await pool.query(
        `
        SELECT
          i.id_imagen,
          i.url,
          i.tipo,
          i.texto_alternativo,
          i.orden,
          i.visible
        FROM imagen_perfil_organizacion i

        INNER JOIN perfil_publico_organizacion p
          ON p.id_perfil_publico =
            i.id_perfil_publico

        WHERE p.id_organizacion = $1
          AND i.id_imagen = $2
          AND i.tipo = 'GALERIA'

        LIMIT 1
        `,
        [
          idOrganizacion,
          idImagen
        ]
      )


    return (
      result.rows[0] ||
      null
    )

  }


// ======================================================
// ELIMINAR IMAGEN DE GALERÍA
// ACTIVIDAD 3.6.3
// ======================================================

exports.eliminarImagenGaleria =
  async (
    idOrganizacion,
    idImagen
  ) => {

    const client =
      await pool.connect()


    try {

      await client.query(
        'BEGIN'
      )


      const imagenResult =
        await client.query(
          `
          SELECT
            i.id_imagen,
            i.id_perfil_publico,
            i.url,
            i.orden

          FROM imagen_perfil_organizacion i

          INNER JOIN perfil_publico_organizacion p
            ON p.id_perfil_publico =
              i.id_perfil_publico

          WHERE p.id_organizacion = $1
            AND i.id_imagen = $2
            AND i.tipo = 'GALERIA'

          FOR UPDATE
          `,
          [
            idOrganizacion,
            idImagen
          ]
        )


      if (
        imagenResult.rows.length === 0
      ) {

        await client.query(
          'ROLLBACK'
        )

        return null

      }


      const imagen =
        imagenResult.rows[0]


      await client.query(
        `
        DELETE FROM imagen_perfil_organizacion
        WHERE id_imagen = $1
        `,
        [
          idImagen
        ]
      )


      // Reordenar la galería para evitar huecos:
      // 0, 1, 3 -> 0, 1, 2

      await client.query(
        `
        WITH imagenes_ordenadas AS (
          SELECT
            id_imagen,
            ROW_NUMBER() OVER (
              ORDER BY orden ASC, creada_en ASC
            ) - 1 AS nuevo_orden

          FROM imagen_perfil_organizacion

          WHERE id_perfil_publico = $1
            AND tipo = 'GALERIA'
        )

        UPDATE imagen_perfil_organizacion i

        SET orden =
          imagenes_ordenadas.nuevo_orden

        FROM imagenes_ordenadas

        WHERE i.id_imagen =
          imagenes_ordenadas.id_imagen
        `,
        [
          imagen.id_perfil_publico
        ]
      )


      await client.query(
        `
        UPDATE perfil_publico_organizacion

        SET actualizado_en = NOW()

        WHERE id_perfil_publico = $1
        `,
        [
          imagen.id_perfil_publico
        ]
      )


      await client.query(
        'COMMIT'
      )


      return imagen

    }
    catch (error) {

      await client.query(
        'ROLLBACK'
      )

      throw error

    }
    finally {

      client.release()

    }

  }

  // ======================================================
// CREAR / ACTUALIZAR SECCIÓN DEL PERFIL
// ACTIVIDAD 3.6.3
// ======================================================

exports.guardarSeccionPerfil =
  async (
    idOrganizacion,
    tipoSeccion,
    datos
  ) => {

    const {
      titulo,
      contenido,
      visible,
      orden
    } = datos


    const result =
      await pool.query(
        `
        INSERT INTO seccion_perfil_organizacion (
          id_perfil_publico,
          tipo_seccion,
          titulo,
          contenido,
          orden,
          visible
        )

        SELECT
          p.id_perfil_publico,
          $2,
          $3,
          $4::jsonb,
          $5,
          $6

        FROM perfil_publico_organizacion p

        WHERE p.id_organizacion = $1

        ON CONFLICT (
          id_perfil_publico,
          tipo_seccion
        )

        DO UPDATE SET

          titulo =
            EXCLUDED.titulo,

          contenido =
            EXCLUDED.contenido,

          visible =
            EXCLUDED.visible,

          actualizada_en =
            NOW()

        RETURNING
          id_seccion,
          tipo_seccion,
          titulo,
          contenido,
          orden,
          visible,
          actualizada_en
        `,
        [
          idOrganizacion,
          tipoSeccion,
          titulo,
          JSON.stringify(
            contenido
          ),
          orden,
          visible
        ]
      )


    if (
      result.rows.length === 0
    ) {

      return null

    }


    await pool.query(
      `
      UPDATE perfil_publico_organizacion

      SET actualizado_en =
        NOW()

      WHERE id_organizacion = $1
      `,
      [
        idOrganizacion
      ]
    )


    return result.rows[0]

  }

// ======================================================
// ACTUALIZAR ORDEN DE SECCIONES DEL PERFIL
// ACTIVIDAD 3.6.5
// CP-PRF-006
// ======================================================

exports.actualizarOrdenSecciones =
  async (
    idOrganizacion,
    tiposSeccion
  ) => {

    const client =
      await pool.connect();


    try {

      await client.query(
        'BEGIN'
      );


      // ==================================================
      // OBTENER PERFIL
      // ==================================================

      const perfilResult =
        await client.query(
          `
          SELECT
            id_perfil_publico

          FROM perfil_publico_organizacion

          WHERE id_organizacion = $1

          FOR UPDATE
          `,
          [
            idOrganizacion
          ]
        );


      if (
        perfilResult.rows.length === 0
      ) {

        const error =
          new Error(
            'La organización no posee un perfil público'
          );

        error.status = 404;

        throw error;

      }


      const idPerfilPublico =
        perfilResult
          .rows[0]
          .id_perfil_publico;


      // ==================================================
      // ACTUALIZAR ORDEN
      // ==================================================

      for (
        let indice = 0;
        indice < tiposSeccion.length;
        indice += 1
      ) {

        const tipoSeccion =
          tiposSeccion[indice];


        const result =
          await client.query(
            `
            UPDATE seccion_perfil_organizacion

            SET
              orden = $1,
              actualizada_en = NOW()

            WHERE id_perfil_publico = $2
              AND tipo_seccion = $3
            `,
            [
              indice,
              idPerfilPublico,
              tipoSeccion
            ]
          );


        if (
          result.rowCount === 0
        ) {

          const error =
            new Error(
              `La sección ${tipoSeccion} no existe en el perfil`
            );

          error.status = 400;

          throw error;

        }

      }


      // ==================================================
      // ACTUALIZAR FECHA DEL PERFIL
      // ==================================================

      await client.query(
        `
        UPDATE perfil_publico_organizacion

        SET
          actualizado_en = NOW()

        WHERE id_perfil_publico = $1
        `,
        [
          idPerfilPublico
        ]
      );


      // ==================================================
      // DEVOLVER ORDEN FINAL
      // ==================================================

      const resultado =
        await client.query(
          `
          SELECT
            id_seccion,
            tipo_seccion,
            titulo,
            orden,
            visible

          FROM seccion_perfil_organizacion

          WHERE id_perfil_publico = $1

          ORDER BY orden ASC
          `,
          [
            idPerfilPublico
          ]
        );


      await client.query(
        'COMMIT'
      );


      return resultado.rows;

    }
    catch (error) {

      await client.query(
        'ROLLBACK'
      );

      throw error;

    }
    finally {

      client.release();

    }

  };

// ======================================================
// PUBLICAR PERFIL PROPIO
// ACTIVIDAD 3.6.4
// ======================================================

exports.publicarPerfilPropio =
  async (
    idOrganizacion
  ) => {

    const result =
      await pool.query(
        `
        UPDATE perfil_publico_organizacion

        SET
          estado_publicacion = 'PUBLICADO',
          publicado_en = NOW(),
          retirado_en = NULL,
          actualizado_en = NOW()

        WHERE id_organizacion = $1
          AND estado_publicacion IN (
            'BORRADOR',
            'NO_PUBLICADO'
          )

        RETURNING
          id_perfil_publico,
          id_organizacion,
          slug,
          estado_publicacion,
          publicado_en,
          retirado_en,
          actualizado_en
        `,
        [
          idOrganizacion
        ]
      )


    return (
      result.rows[0] ||
      null
    )

  }


// ======================================================
// RETIRAR PERFIL PROPIO
// ACTIVIDAD 3.6.4
// ======================================================

exports.retirarPerfilPropio =
  async (
    idOrganizacion
  ) => {

    const result =
      await pool.query(
        `
        UPDATE perfil_publico_organizacion

        SET
          estado_publicacion = 'NO_PUBLICADO',
          retirado_en = NOW(),
          actualizado_en = NOW()

        WHERE id_organizacion = $1
          AND estado_publicacion = 'PUBLICADO'

        RETURNING
          id_perfil_publico,
          id_organizacion,
          slug,
          estado_publicacion,
          publicado_en,
          retirado_en,
          actualizado_en
        `,
        [
          idOrganizacion
        ]
      )


    return (
      result.rows[0] ||
      null
    )

  }

// ======================================================
// ACTUALIZAR TIPOS DE ACTIVIDAD DE LA ORGANIZACIÓN
// ACTIVIDAD 3.6.5
// ======================================================

exports.actualizarTiposActividadOrganizacion =
  async (
    idOrganizacion,
    idsTiposActividad
  ) => {

    const client =
      await pool.connect();


    try {

      await client.query(
        'BEGIN'
      );


      const idsUnicos =
        [
          ...new Set(
            idsTiposActividad
          )
        ];


      // ==================================================
      // VALIDAR QUE TODOS LOS TIPOS EXISTAN
      // ==================================================

      if (
        idsUnicos.length > 0
      ) {

        const placeholders =
          idsUnicos
            .map(
              (_, index) =>
                `$${index + 1}`
            )
            .join(', ');


        const tiposResult =
          await client.query(
            `
            SELECT
              id_tipo_actividad

            FROM tipo_actividad

            WHERE id_tipo_actividad
              IN (${placeholders})
            `,
            idsUnicos
          );


        if (
          tiposResult.rows.length !==
          idsUnicos.length
        ) {

          const error =
            new Error(
              'Uno o más tipos de actividad no existen'
            );

          error.status = 400;

          throw error;

        }

      }


      // ==================================================
      // ELIMINAR ASOCIACIONES ACTUALES
      // ==================================================

      await client.query(
        `
        DELETE
        FROM organizacion_tipo_actividad

        WHERE id_organizacion = $1
        `,
        [
          idOrganizacion
        ]
      );


      // ==================================================
      // CREAR NUEVAS ASOCIACIONES
      // ==================================================

      for (
        const idTipoActividad
        of idsUnicos
      ) {

        await client.query(
          `
          INSERT INTO
            organizacion_tipo_actividad
            (
              id_organizacion,
              id_tipo_actividad
            )

          VALUES (
            $1,
            $2
          )

          ON CONFLICT DO NOTHING
          `,
          [
            idOrganizacion,
            idTipoActividad
          ]
        );

      }


      // Actualizar fecha del perfil, si existe.

      await client.query(
        `
        UPDATE
          perfil_publico_organizacion

        SET
          actualizado_en =
            CURRENT_TIMESTAMP

        WHERE id_organizacion = $1
        `,
        [
          idOrganizacion
        ]
      );


      // ==================================================
      // DEVOLVER SELECCIÓN ACTUALIZADA
      // ==================================================

      const result =
        await client.query(
          `
          SELECT
            ta.id_tipo_actividad,
            ta.nombre

          FROM organizacion_tipo_actividad ota

          INNER JOIN tipo_actividad ta
            ON ta.id_tipo_actividad =
              ota.id_tipo_actividad

          WHERE ota.id_organizacion = $1

          ORDER BY
            ta.nombre ASC
          `,
          [
            idOrganizacion
          ]
        );


      await client.query(
        'COMMIT'
      );


      return result.rows;

    }
    catch (error) {

      await client.query(
        'ROLLBACK'
      );

      throw error;

    }
    finally {

      client.release();

    }

  };

// ======================================================
// ACTUALIZAR UBICACIÓN DE LA ORGANIZACIÓN
// ACTIVIDAD 3.6.5
// ======================================================

exports.actualizarUbicacionOrganizacion =
  async (
    idOrganizacion,
    idUbicacion
  ) => {

    const result =
      await pool.query(
        `
        UPDATE organizacion

        SET
          id_ubicacion = $1,
          actualizado_en =
            CURRENT_TIMESTAMP

        WHERE id_organizacion = $2

        RETURNING
          id_organizacion,
          id_ubicacion
        `,
        [
          idUbicacion,
          idOrganizacion
        ]
      );


    return (
      result.rows[0] ||
      null
    );

  };