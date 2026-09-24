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

      img.url AS imagen_url,
      img.texto_alternativo
        AS imagen_texto_alternativo

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
        AND i.tipo IN (
          'PORTADA',
          'LOGO'
        )
      ORDER BY
        CASE
          WHEN i.tipo = 'PORTADA'
            THEN 0
          ELSE 1
        END,
        i.orden ASC
      LIMIT 1
    ) img ON TRUE

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
      razon_social,
      estado_verificacion
    FROM organizacion
    WHERE id_organizacion = $1
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

    return {
      organizacion:
        organizacionResult.rows[0],

      perfil: null
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


  return {
    organizacion:
      organizacionResult.rows[0],

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