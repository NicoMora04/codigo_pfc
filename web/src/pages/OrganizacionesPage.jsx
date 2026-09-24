import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  listarOrganizaciones,
  listarTiposActividad,
} from '../services/publicPortalService.js'

function obtenerIniciales(nombre = '') {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(palabra => palabra[0])
    .join('')
    .toUpperCase()
}

function obtenerUbicacion(organizacion) {
  if (organizacion.localidad) {
    return organizacion.localidad
  }

  return organizacion.provincia || null
}

function OrganizacionesPage() {
  const [searchParams] = useSearchParams()

  const tipoInicial =
    searchParams.get('id_tipo_actividad') || ''
  
  const nombreInicial =
    searchParams.get('nombre') || ''

  const [organizaciones, setOrganizaciones] =
    useState([])

  const [tiposActividad, setTiposActividad] =
    useState([])

  const [nombre, setNombre] =
    useState(nombreInicial)

  const [
    idTipoActividad,
    setIdTipoActividad,
  ] = useState(tipoInicial)

  const [ubicacion, setUbicacion] =
    useState('')

  const [cargando, setCargando] =
    useState(true)

  const [error, setError] =
    useState('')

  async function cargarOrganizaciones(
    filtros = {}
  ) {
    try {
      setCargando(true)
      setError('')

      const organizacionesObtenidas =
        await listarOrganizaciones(filtros)

      setOrganizaciones(
        organizacionesObtenidas
      )
    } catch (errorCarga) {
      setError(
        errorCarga.message ||
          'No se pudo cargar el directorio'
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    async function cargarDatosIniciales() {
      try {
        setCargando(true)
        setError('')
        setNombre(nombreInicial)
        setIdTipoActividad(tipoInicial)

        const [
          organizacionesObtenidas,
          tiposObtenidos,
        ] = await 
        Promise.all([
          listarOrganizaciones({
            nombre: nombreInicial,
            idTipoActividad: tipoInicial,
          }),
          listarTiposActividad(),
        ])

        setOrganizaciones(
          organizacionesObtenidas
        )

        setTiposActividad(
          tiposObtenidos
        )
      } catch (errorCarga) {
        setError(
          errorCarga.message ||
            'No se pudo cargar el directorio'
        )
      } finally {
        setCargando(false)
      }
    }

    cargarDatosIniciales()
  }, [nombreInicial, tipoInicial])

  async function manejarFiltros(event) {
    event.preventDefault()

    await cargarOrganizaciones({
      nombre: nombre.trim(),
      idTipoActividad,
      ubicacion: ubicacion.trim(),
    })
  }

  async function limpiarFiltros() {
    setNombre('')
    setIdTipoActividad('')
    setUbicacion('')

    await cargarOrganizaciones()
  }

  return (
    <main>
      <header className="page-head">
        <div className="site-container">
          <p className="breadcrumb">
            Inicio / Organizaciones
          </p>

          <h1>Organizaciones</h1>

          <p>
            Encontrá perfiles activos,
            verificados y publicados.
          </p>
        </div>
      </header>

      <div className="site-container directory-layout">
        <aside className="panel filters">
          <h2>Filtrar resultados</h2>

          <form onSubmit={manejarFiltros}>
            <div className="field">
              <label htmlFor="nombre">
                Nombre
              </label>

              <input
                id="nombre"
                type="search"
                value={nombre}
                onChange={event =>
                  setNombre(event.target.value)
                }
                placeholder="Buscar organización"
              />
            </div>

            <div className="field">
              <label htmlFor="tipoActividad">
                Tipo de actividad
              </label>

              <select
                id="tipoActividad"
                value={idTipoActividad}
                onChange={event =>
                  setIdTipoActividad(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Todas
                </option>

                {tiposActividad.map(
                  tipo => (
                    <option
                      key={
                        tipo.id_tipo_actividad
                      }
                      value={
                        tipo.id_tipo_actividad
                      }
                    >
                      {tipo.nombre}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="field">
              <label htmlFor="ubicacion">
                Ubicación aproximada
              </label>

              <input
                id="ubicacion"
                type="search"
                value={ubicacion}
                onChange={event =>
                  setUbicacion(
                    event.target.value
                  )
                }
                placeholder="Ej. Santa Fe"
              />
            </div>

            <div className="filter-actions">
              <button
                type="submit"
                className="primary-button"
              >
                Aplicar filtros
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={limpiarFiltros}
              >
                Limpiar
              </button>
            </div>
          </form>
        </aside>

        <section
          className="directory-results"
          aria-live="polite"
        >
          {cargando && (
            <div className="loading-state">
              Cargando organizaciones...
            </div>
          )}

          {error && (
            <div
              className="error-state"
              role="alert"
            >
              {error}
            </div>
          )}

          {!cargando && !error && (
            <>
              <div className="results-head">
                <strong>
                  {organizaciones.length}{' '}
                  {organizaciones.length === 1
                    ? 'organización encontrada'
                    : 'organizaciones encontradas'}
                </strong>
              </div>

              {organizaciones.length === 0 ? (
                <div className="empty-result">
                  <span className="empty-result__icon">
                    ⌕
                  </span>

                  <strong>
                    No encontramos resultados
                  </strong>

                  <span>
                    Probá con otros criterios
                    de búsqueda.
                  </span>
                </div>
              ) : (
                <div className="results-list">
                  {organizaciones.map(
                    organizacion => {
                      const ubicacionOrg =
                        obtenerUbicacion(
                          organizacion
                        )

                      return (
                        <article
                          className="org-card"
                          key={organizacion.slug}
                        >
                          <div className="org-cover">
                            <div className="org-logo">
                              {obtenerIniciales(
                                organizacion.nombre_visible
                              )}
                            </div>
                          </div>

                          <div className="org-body">
                            <div className="org-title">
                              <h2>
                                {
                                  organizacion.nombre_visible
                                }
                              </h2>

                              <span className="verified-badge">
                                ✓ Verificada
                              </span>
                            </div>

                            <p>
                              {organizacion.descripcion_publica ||
                                'Organización con perfil público disponible.'}
                            </p>

                            <div className="meta-row">
                              {ubicacionOrg && (
                                <span className="chip">
                                  {ubicacionOrg}
                                </span>
                              )}

                              {organizacion.tipos_actividad.map(
                                tipo => (
                                  <span
                                    className="chip"
                                    key={tipo}
                                  >
                                    {tipo}
                                  </span>
                                )
                              )}
                            </div>

                            <div className="card-footer">
                              <span>
                                Perfil publicado
                              </span>

                              <button
                                type="button"
                                className="mini-primary"
                                disabled
                                title="El perfil público se implementará en una actividad posterior"
                              >
                                Ver perfil
                              </button>
                            </div>
                          </div>
                        </article>
                      )
                    }
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}

export default OrganizacionesPage