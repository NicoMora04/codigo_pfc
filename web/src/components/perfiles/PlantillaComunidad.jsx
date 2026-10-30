import {
  BACKEND_URL,
} from '../../config/env.js'

function obtenerUrlImagen(url) {

  if (!url) {
    return ''
  }

  if (
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    return url
  }

  return `${BACKEND_URL}${url}`
}


function PlantillaComunidad({
  perfil,
  oportunidades = [],
}) {

  const imagenLogo =
    perfil.imagenes?.find(
      imagen =>
        imagen.tipo === 'LOGO' &&
        imagen.visible !== false
    )


  const imagenPortada =
    perfil.imagenes?.find(
      imagen =>
        imagen.tipo === 'PORTADA' &&
        imagen.visible !== false
    )


  const galeria =
    perfil.imagenes
      ?.filter(
        imagen =>
          imagen.tipo === 'GALERIA' &&
          imagen.visible !== false
      )
      .sort(
        (a, b) =>
          Number(a.orden || 0) -
          Number(b.orden || 0)
      ) || []


  const obtenerSeccion =
    (tipo) =>
      perfil.secciones?.find(
        seccion =>
          seccion.tipo_seccion === tipo &&
          seccion.visible !== false
      )


  const sobreNosotros =
    obtenerSeccion(
      'SOBRE_NOSOTROS'
    )

  const mision =
    obtenerSeccion(
      'MISION'
    )

  const impacto =
    obtenerSeccion(
      'IMPACTO'
    )

  const actualidad =
    obtenerSeccion(
      'ACTUALIDAD'
    )

  const seccionesOrdenadas =
  Array.isArray(perfil?.secciones)
    ? [...perfil.secciones]
        .filter(
          seccion =>
            seccion.visible !== false
        )
        .sort(
          (a, b) =>
            Number(a.orden) -
            Number(b.orden)
        )
    : []


  const itemsActualidad =
    Array.isArray(
      actualidad?.contenido?.items
    )
      ? actualidad.contenido.items
      : []


  const iniciales =
    perfil.nombre_visible
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(
        palabra =>
          palabra[0]?.toUpperCase()
      )
      .join('') || 'ORG'


  return (

    <div className="template-community">

      {/* ============================================ */}
      {/* HERO */}
      {/* ============================================ */}

      <section
        className="template-community__hero"
      >

        <div
          className="template-community__hero-content"
        >

          <div
            className="template-community__brand"
          >

            <div
              className="template-community__logo"
            >

              {imagenLogo ? (

                <img
                  src={
                    obtenerUrlImagen(
                      imagenLogo.url
                    )
                  }
                  alt={
                    imagenLogo.texto_alternativo ||
                    `Logo de ${perfil.nombre_visible}`
                  }
                />

              ) : (

                <span>
                  {iniciales}
                </span>

              )}

            </div>


            <span
              className="template-community__verified"
            >
              Organización verificada
            </span>

          </div>


          <h1>
            {perfil.nombre_visible}
          </h1>


          {perfil.descripcion_publica && (

            <p>
              {perfil.descripcion_publica}
            </p>

          )}


          {perfil.tipos_actividad?.length > 0 && (

            <div
              className="template-community__tags"
            >

              {perfil.tipos_actividad.map(
                tipo => (

                  <span
                    key={
                      tipo.id_tipo_actividad ||
                      tipo.nombre
                    }
                  >
                    {tipo.nombre}
                  </span>

                )
              )}

            </div>

          )}

        </div>


        <div
          className="template-community__hero-visual"
        >

          {imagenPortada ? (

            <img
              src={
                obtenerUrlImagen(
                  imagenPortada.url
                )
              }
              alt={
                imagenPortada.texto_alternativo ||
                'Portada de la organización'
              }
            />

          ) : (

            <div
              className="template-community__hero-placeholder"
            >

              <span>
                Comunidad
              </span>

            </div>

          )}

        </div>

      </section>

      {/* ===================================================== */}
    {/* SECCIONES SOBRE NOSOTROS - MISION - IMPACTO - ACTUALIDAD  */}
      {/* ===================================================== */}
      {seccionesOrdenadas.map(
          seccion => {

            switch (
              seccion.tipo_seccion
            ) {

              case 'SOBRE_NOSOTROS':

                return (
                  <section
                    key={
                      seccion.id_seccion ||
                      seccion.tipo_seccion
                    }
                    className="template-classic__section"
                  >

                    <span
                      className="template-classic__eyebrow"
                    >
                      Sobre nosotros
                    </span>

                    <h2>
                      {seccion.titulo ||
                        'Quiénes somos'}
                    </h2>

                    <p>
                      {seccion.contenido
                        ?.texto || ''}
                    </p>

                  </section>
                )


              case 'MISION':

                return (
                  <section
                    key={
                      seccion.id_seccion ||
                      seccion.tipo_seccion
                    }
                    className="template-classic__section"
                  >

                    <span
                      className="template-classic__eyebrow"
                    >
                      Propósito
                    </span>

                    <h2>
                      {seccion.titulo ||
                        'Nuestra misión'}
                    </h2>

                    <p>
                      {seccion.contenido
                        ?.texto || ''}
                    </p>

                  </section>
                )


              case 'IMPACTO':

                return (
                  <section
                    key={
                      seccion.id_seccion ||
                      seccion.tipo_seccion
                    }
                    className="template-classic__section"
                  >

                    <span
                      className="template-classic__eyebrow"
                    >
                      Impacto
                    </span>

                    <h2>
                      {seccion.titulo ||
                        'Nuestro impacto'}
                    </h2>

                    <p>
                      {seccion.contenido
                        ?.texto || ''}
                    </p>

                  </section>
                )


              case 'ACTUALIDAD':

                return (
                  <section
                    key={
                      seccion.id_seccion ||
                      seccion.tipo_seccion
                    }
                    className="template-community__section"
                  >

                    <div
                      className="template-community__section-heading"
                    >

                      <span
                        className="template-community__eyebrow"
                      >
                        Actualidad
                      </span>

                      <h2>
                        {seccion.titulo ||
                          'Novedades y actividades'}
                      </h2>

                    </div>


                    <div
                      className="template-community__news-grid"
                    >

                      {Array.isArray(
                        seccion.contenido?.items
                      ) &&
                        seccion.contenido.items.map(
                          (
                            item,
                            index
                          ) => (

                            <article
                              key={
                                `${seccion.tipo_seccion}-${index}`
                              }
                              className="template-community__news-card"
                            >

                              {item.imagen && (

                                <img
                                  src={
                                    obtenerUrlImagen(
                                      item.imagen
                                    )
                                  }
                                  alt={
                                    item.titulo ||
                                    'Actividad de la organización'
                                  }
                                />

                              )}


                              <div
                                className="template-community__news-content"
                              >

                                {item.fecha && (

                                  <span>
                                    {item.fecha}
                                  </span>

                                )}


                                {item.titulo && (

                                  <h3>
                                    {item.titulo}
                                  </h3>

                                )}


                                {item.texto && (

                                  <p>
                                    {item.texto}
                                  </p>

                                )}

                              </div>

                            </article>

                          )
                        )}

                    </div>

                  </section>
                )


              default:

                return null

            }

          }
        )}


      {/* ============================================ */}
      {/* OPORTUNIDADES */}
      {/* ============================================ */}

      {oportunidades.length > 0 && (

        <section
          className="template-community__opportunities"
        >

          <div
            className="template-community__section-heading"
          >

            <span
              className="template-community__eyebrow"
            >
              Sumate
            </span>


            <h2>
              Encontrá tu próxima forma de ayudar
            </h2>

          </div>


          <div
            className="template-community__opportunity-grid"
          >

            {oportunidades.map(
              oportunidad => (

                <article
                  key={
                    oportunidad.id_oportunidad
                  }
                  className="template-community__opportunity-card"
                >

                  <span>
                    Oportunidad
                  </span>


                  <h3>
                    {
                      oportunidad.titulo
                    }
                  </h3>


                  {oportunidad.descripcion && (

                    <p>
                      {
                        oportunidad
                          .descripcion
                      }
                    </p>

                  )}

                </article>

              )
            )}

          </div>

        </section>

      )}


      {/* ============================================ */}
      {/* GALERÍA */}
      {/* ============================================ */}

      {galeria.length > 0 && (

        <section
          className="template-community__gallery-section"
        >

          <div
            className="template-community__section-heading"
          >

            <span
              className="template-community__eyebrow"
            >
              Nuestra comunidad
            </span>


            <h2>
              Momentos que compartimos
            </h2>

          </div>


          <div
            className="template-community__gallery"
          >

            {galeria.map(
              imagen => (

                <img
                  key={
                    imagen.id_imagen
                  }
                  src={
                    obtenerUrlImagen(
                      imagen.url
                    )
                  }
                  alt={
                    imagen.texto_alternativo ||
                    'Actividad de la organización'
                  }
                />

              )
            )}

          </div>

        </section>

      )}


      {/* ============================================ */}
      {/* CONTACTO */}
      {/* ============================================ */}

      <section
        className="template-community__contact"
      >

        <div>

          <span
            className="template-community__eyebrow"
          >
            Conectemos
          </span>


          <h2>
            ¿Querés conocer más?
          </h2>


          <p>
            Ponete en contacto con la organización
            y descubrí cómo participar.
          </p>

        </div>


        <div
          className="template-community__contact-links"
        >

          {perfil.ubicacion_aproximada && (

            <span>

              📍 {
                [
                  perfil
                    .ubicacion_aproximada
                    .localidad,

                  perfil
                    .ubicacion_aproximada
                    .provincia,
                ]
                  .filter(Boolean)
                  .filter(
                    (valor, indice, array) =>
                      array.indexOf(valor) === indice
                  )
                  .join(', ')
              }

            </span>

          )}

          {perfil.horario_atencion?.texto && (

            <span>
              🕒 {
                perfil
                  .horario_atencion
                  .texto
              }
            </span>

          )}

          {perfil.email_contacto_publico && (

            <a
              href={
                `mailto:${perfil.email_contacto_publico}`
              }
            >
              {
                perfil
                  .email_contacto_publico
              }
            </a>

          )}


          {perfil.telefono_contacto_publico && (

            <span>
              {
                perfil
                  .telefono_contacto_publico
              }
            </span>

          )}


          {perfil.sitio_web_url && (

            <a
              href={
                perfil.sitio_web_url
              }
              target="_blank"
              rel="noreferrer"
            >
              Sitio web
            </a>

          )}

          {perfil.redes_sociales
            ?.instagram && (

            <a
              href={
                perfil
                  .redes_sociales
                  .instagram
              }
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>

          )}


          {perfil.redes_sociales
            ?.facebook && (

            <a
              href={
                perfil
                  .redes_sociales
                  .facebook
              }
              target="_blank"
              rel="noreferrer"
            >
              Facebook
            </a>

          )}


          {perfil.redes_sociales
            ?.linkedin && (

            <a
              href={
                perfil
                  .redes_sociales
                  .linkedin
              }
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>

          )}

        </div>

      </section>

    </div>

  )

}


export default PlantillaComunidad