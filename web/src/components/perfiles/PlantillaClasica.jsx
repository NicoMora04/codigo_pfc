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


function PlantillaClasica({
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

    <div className="template-classic">

      {/* ============================================ */}
      {/* PORTADA */}
      {/* ============================================ */}

      <section
        className="template-classic__hero"
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
            className="template-classic__hero-image"
          />

        ) : (

          <div
            className="template-classic__hero-placeholder"
          />

        )}


        <div
          className="template-classic__hero-overlay"
        />

      </section>


      {/* ============================================ */}
      {/* IDENTIDAD */}
      {/* ============================================ */}

      <section
        className="template-classic__identity"
      >

        <div
          className="template-classic__identity-inner"
        >

          <div
            className="template-classic__logo"
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


          <div
            className="template-classic__identity-content"
          >

            <div
              className="template-classic__identity-top"
            >

              <h1>
                {perfil.nombre_visible}
              </h1>


              <span
                className="template-classic__verified"
              >
                Organización verificada
              </span>

            </div>


            {perfil.descripcion_publica && (

              <p>
                {perfil.descripcion_publica}
              </p>

            )}


            {perfil.tipos_actividad?.length > 0 && (

              <div
                className="template-classic__tags"
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

        </div>

      </section>


      {/* ============================================ */}
      {/* CONTENIDO PRINCIPAL */}
      {/* ============================================ */}

      <div
        className="template-classic__layout"
      >

        <main
          className="template-classic__main"
        >

          {/* SOBRE NOSOTROS */}

          {sobreNosotros && (

            <section
              className="template-classic__section"
            >

              <span
                className="template-classic__eyebrow"
              >
                La organización
              </span>


              <h2>
                {
                  sobreNosotros.titulo ||
                  'Sobre nosotros'
                }
              </h2>


              {sobreNosotros.contenido?.texto && (

                <p>
                  {
                    sobreNosotros
                      .contenido
                      .texto
                  }
                </p>

              )}

            </section>

          )}


          {/* MISIÓN */}

          {mision && (

            <section
              className="template-classic__section template-classic__highlight"
            >

              <span
                className="template-classic__eyebrow"
              >
                Nuestro propósito
              </span>


              <h2>
                {
                  mision.titulo ||
                  'Nuestra misión'
                }
              </h2>


              {mision.contenido?.texto && (

                <p>
                  {
                    mision
                      .contenido
                      .texto
                  }
                </p>

              )}

            </section>

          )}


          {/* IMPACTO */}

          {impacto && (

            <section
              className="template-classic__section"
            >

              <span
                className="template-classic__eyebrow"
              >
                Resultados
              </span>


              <h2>
                {
                  impacto.titulo ||
                  'Nuestro impacto'
                }
              </h2>


              {impacto.contenido?.texto && (

                <p>
                  {
                    impacto
                      .contenido
                      .texto
                  }
                </p>

              )}

            </section>

          )}


          {/* ======================================== */}
          {/* ACTUALIDAD */}
          {/* ======================================== */}

          {itemsActualidad.length > 0 && (

            <section
              className="template-classic__section"
            >

              <span
                className="template-classic__eyebrow"
              >
                Actualidad
              </span>


              <h2>
                {
                  actualidad.titulo ||
                  'Novedades y actividades'
                }
              </h2>


              <div
                className="template-classic__news-grid"
              >

                {itemsActualidad.map(
                  (
                    item,
                    index
                  ) => (

                    <article
                      key={index}
                      className="template-classic__news-card"
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
                        className="template-classic__news-content"
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

          )}


          {/* ======================================== */}
          {/* OPORTUNIDADES */}
          {/* ======================================== */}

          {oportunidades.length > 0 && (

            <section
              className="template-classic__section"
            >

              <span
                className="template-classic__eyebrow"
              >
                Participá
              </span>


              <h2>
                Oportunidades de voluntariado
              </h2>


              <div
                className="template-classic__opportunities"
              >

                {oportunidades.map(
                  oportunidad => (

                    <article
                      key={
                        oportunidad.id_oportunidad
                      }
                      className="template-classic__opportunity"
                    >

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


          {/* ======================================== */}
          {/* GALERÍA */}
          {/* ======================================== */}

          {galeria.length > 0 && (

            <section
              className="template-classic__section"
            >

              <span
                className="template-classic__eyebrow"
              >
                Nuestra comunidad
              </span>


              <h2>
                Galería
              </h2>


              <div
                className="template-classic__gallery"
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

        </main>


        {/* ============================================ */}
        {/* CONTACTO */}
        {/* ============================================ */}

        <aside
          className="template-classic__sidebar"
        >

          <div
            className="template-classic__contact-card"
          >

            <span
              className="template-classic__eyebrow"
            >
              Contacto
            </span>


            <h2>
              Hablemos
            </h2>

            {perfil.ubicacion_aproximada && (

              <div>

                <strong>
                  Ubicación
                </strong>

                <span>
                  {
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

              </div>

            )}

            {perfil.horario_atencion?.texto && (

              <div>

                <strong>
                  Horario de atención
                </strong>

                <span>
                  {
                    perfil
                      .horario_atencion
                      .texto
                  }
                </span>

              </div>

            )}


            {perfil.email_contacto_publico && (

              <div>
                <strong>
                  Correo
                </strong>

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
              </div>

            )}


            {perfil.telefono_contacto_publico && (

              <div>
                <strong>
                  Teléfono
                </strong>

                <span>
                  {
                    perfil
                      .telefono_contacto_publico
                  }
                </span>
              </div>

            )}


            {perfil.sitio_web_url && (

              <div>
                <strong>
                  Sitio web
                </strong>

                <a
                  href={
                    perfil.sitio_web_url
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Visitar sitio
                </a>
              </div>

            )}

            {Object.values(
              perfil.redes_sociales || {}
            ).some(Boolean) && (

              <div>

                <strong>
                  Redes sociales
                </strong>

                <div>

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

              </div>

            )}

          </div>

        </aside>

      </div>

    </div>

  )

}


export default PlantillaClasica