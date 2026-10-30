import { useEffect, useState } from 'react'
import {
    Link,
    useNavigate,
  } from 'react-router-dom'

import {
  listarOrganizaciones,
  listarTiposActividad,
} from '../services/publicPortalService.js'

import {
  registrarVoluntario,
} from '../services/authService.js'


import {
  BACKEND_URL,
} from '../config/env.js'

function obtenerUrlImagen(url) {
  if (!url) {
    return null
  }

  if (
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    return url
  }

  return `${BACKEND_URL}${url}`
}

function obtenerIniciales(nombre = '') {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(palabra => palabra[0])
    .join('')
    .toUpperCase()
}

function HomePage() {

  const navigate = useNavigate()

  const [nombreBusqueda, setNombreBusqueda] =
    useState('')

  const [tipoBusqueda, setTipoBusqueda] =
    useState('')

  const [tiposActividad, setTiposActividad] =
    useState([])

  const [cargandoTipos, setCargandoTipos] =
    useState(true)
  const [
  organizaciones,
  setOrganizaciones,
] = useState([])

const [
  cargandoOrganizaciones,
  setCargandoOrganizaciones,
] = useState(true)

const [
  errorOrganizaciones,
  setErrorOrganizaciones,
] = useState('')

  const [errorTipos, setErrorTipos] =
    useState('')
  useEffect(() => {
  async function cargarOrganizaciones() {
    try {
      setCargandoOrganizaciones(true)
      setErrorOrganizaciones('')

      const resultado =
        await listarOrganizaciones()

      setOrganizaciones(
        resultado.slice(0, 3)
      )
    } catch {
      setErrorOrganizaciones(
        'No se pudieron cargar las organizaciones.'
      )
    } finally {
      setCargandoOrganizaciones(false)
    }
  }

  cargarOrganizaciones()
}, [])

  const [
    registroVoluntario,
    setRegistroVoluntario,
  ] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmarPassword: '',
  })


  const [
    registrandoVoluntario,
    setRegistrandoVoluntario,
  ] = useState(false)


  const [
    errorRegistroVoluntario,
    setErrorRegistroVoluntario,
  ] = useState('')


  const [
    exitoRegistroVoluntario,
    setExitoRegistroVoluntario,
  ] = useState('')

  useEffect(() => {
    async function cargarTipos() {
      try {
        setCargandoTipos(true)
        setErrorTipos('')

        const tipos =
          await listarTiposActividad()

        setTiposActividad(tipos)
      } catch {
        setErrorTipos(
          'No se pudieron cargar las categorías.'
        )
      } finally {
        setCargandoTipos(false)
      }
    }

    cargarTipos()
  }, [])

  function manejarBusqueda(event) {
    event.preventDefault()

    const params = new URLSearchParams()

    const nombreLimpio =
      nombreBusqueda.trim()

    if (nombreLimpio) {
      params.set(
        'nombre',
        nombreLimpio
      )
    }

    if (tipoBusqueda) {
      params.set(
        'id_tipo_actividad',
        tipoBusqueda
      )
    }

    const query =
      params.toString()

    navigate(
      query
        ? `/organizaciones?${query}`
        : '/organizaciones'
    )
  }

  function manejarCambioRegistro(
    event
  ) {

    const {
      name,
      value,
    } = event.target


    setRegistroVoluntario(
      anterior => ({
        ...anterior,
        [name]: value,
      })
    )

  }


  async function manejarRegistroVoluntario(
    event
  ) {

    event.preventDefault()

    setErrorRegistroVoluntario('')
    setExitoRegistroVoluntario('')


    if (
      registroVoluntario.password !==
      registroVoluntario.confirmarPassword
    ) {

      setErrorRegistroVoluntario(
        'Las contraseñas no coinciden'
      )

      return

    }


    if (
      registroVoluntario.password.length < 6
    ) {

      setErrorRegistroVoluntario(
        'La contraseña debe tener al menos 6 caracteres'
      )

      return

    }


    try {

      setRegistrandoVoluntario(true)


      await registrarVoluntario({
        nombre:
          registroVoluntario.nombre.trim(),

        apellido:
          registroVoluntario.apellido.trim(),

        email:
          registroVoluntario.email.trim(),

        telefono:
          registroVoluntario.telefono.trim(),

        password:
          registroVoluntario.password,
      })


      setExitoRegistroVoluntario(
        'Cuenta creada correctamente. Ya podés ingresar desde la aplicación móvil.'
      )


      setRegistroVoluntario({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        password: '',
        confirmarPassword: '',
      })

    }
    catch (error) {

      setErrorRegistroVoluntario(
        error.message ||
        'No se pudo crear la cuenta'
      )

    }
    finally {

      setRegistrandoVoluntario(false)

    }

  }

  return (
    <main>
      <section className="home-hero">
        <div className="site-container home-hero__content">
          <span className="home-hero__eyebrow">
            Voluntariado Geolocalizado
          </span>

          <h1>
            Encontrá organizaciones donde hacer la diferencia
          </h1>

          <p>
            Descubrí organizaciones sociales verificadas
            y encontrá distintas formas de colaborar cerca tuyo.
          </p>

            <form
                className="home-search"
                onSubmit={manejarBusqueda}
            >
            <div className="home-search__field">
              <label htmlFor="homeSearch">
                ¿Qué organización buscás?
              </label>

              <input
                id="homeSearch"
                type="search"
                placeholder="Buscar por nombre"
                value={nombreBusqueda}
                onChange={event =>
                  setNombreBusqueda(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="home-search__field">
              <label htmlFor="homeActivity">
                Tipo de actividad
              </label>

              <select
                id="homeActivity"
                value={tipoBusqueda}
                onChange={event =>
                  setTipoBusqueda(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Todas las actividades
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

            <button
              type="submit"
              className="home-search__button"
            >
              Buscar
            </button>
          </form>

          <div className="home-hero__footer">
            <span>
              ✓ Organizaciones verificadas
            </span>

            <span>
              ✓ Consulta pública
            </span>

            <span>
              ✓ Sin necesidad de registrarte
            </span>
          </div>
        </div>
      </section>

      <section className="home-categories">
        <div className="site-container">
          <div className="home-section-heading">
            <div>
              <span className="home-section-eyebrow">
                Explorá
              </span>

              <h2>
                Encontrá una causa que te interese
              </h2>

              <p>
                Consultá organizaciones según el tipo
                de actividad que realizan.
              </p>
            </div>

            <Link
              to="/organizaciones"
              className="home-section-link"
            >
              Ver todas las organizaciones →
            </Link>
          </div>

          {cargandoTipos && (
            <p className="home-section-status">
              Cargando categorías...
            </p>
          )}

          {errorTipos && (
            <p
              className="home-section-status"
              role="alert"
            >
              {errorTipos}
            </p>
          )}

          {!cargandoTipos &&
            !errorTipos && (
              <div className="category-grid">
                {tiposActividad.map(
                  tipo => (
                    <Link
                      key={
                        tipo.id_tipo_actividad
                      }
                      to={`/organizaciones?id_tipo_actividad=${tipo.id_tipo_actividad}`}
                      className="category-card"
                    >
                      <span className="category-card__icon">
                        {tipo.nombre
                          .charAt(0)
                          .toUpperCase()}
                      </span>

                      <div>
                        <h3>
                          {tipo.nombre}
                        </h3>

                        <span>
                          Explorar organizaciones →
                        </span>
                      </div>
                    </Link>
                  )
                )}
              </div>
            )}
        </div>
      </section>

    <section className="home-organizations">
  <div className="site-container">
    <div className="home-section-heading">
      <div>
        <span className="home-section-eyebrow">
          Organizaciones
        </span>

        <h2>
          Conocé organizaciones que generan impacto
        </h2>

        <p>
          Explorá perfiles públicos de organizaciones
          verificadas que forman parte de la plataforma.
        </p>
      </div>

      <Link
        to="/organizaciones"
        className="home-section-link"
      >
        Ver directorio completo →
      </Link>
    </div>

    {cargandoOrganizaciones && (
      <p className="home-section-status">
        Cargando organizaciones...
      </p>
    )}

    {errorOrganizaciones && (
      <p
        className="home-section-status"
        role="alert"
      >
        {errorOrganizaciones}
      </p>
    )}

    {!cargandoOrganizaciones &&
      !errorOrganizaciones &&
      organizaciones.length === 0 && (
        <p className="home-section-status">
          No hay organizaciones publicadas
          disponibles.
        </p>
      )}

    {!cargandoOrganizaciones &&
      !errorOrganizaciones &&
      organizaciones.length > 0 && (
        <div className="home-organizations-grid">
          {organizaciones.map(
            organizacion => (
              <article
                className="home-org-card"
                key={organizacion.slug}
              >
                <div
                  className="home-org-cover"
                  style={
                    organizacion.portada?.url
                      ? {
                          backgroundImage:
                            `url("${obtenerUrlImagen(
                              organizacion.portada.url
                            )}")`,
                        }
                      : undefined
                  }
                >
                  <div className="home-org-logo">

                    {organizacion.logo?.url ? (

                      <img
                        src={
                          obtenerUrlImagen(
                            organizacion.logo.url
                          )
                        }
                        alt={
                          organizacion.logo
                            .texto_alternativo ||
                          `Logo de ${organizacion.nombre_visible}`
                        }
                      />

                    ) : (

                      obtenerIniciales(
                        organizacion.nombre_visible
                      )

                    )}

                  </div>
                </div>

                <div className="home-org-body">
                  <div className="home-org-title">
                    <h3>
                      {
                        organizacion.nombre_visible
                      }
                    </h3>

                    <span className="verified-badge">
                      ✓ Verificada
                    </span>
                  </div>

                  <p>
                    {organizacion.descripcion_publica ||
                      'Organización con perfil público disponible.'}
                  </p>

                  <div className="meta-row">
                    {organizacion.ubicacion_aproximada && (
                      <span className="chip">
                        {[
                          organizacion.ubicacion_aproximada.localidad,
                          organizacion.ubicacion_aproximada.provincia,
                        ]
                          .filter(Boolean)
                          .join(', ')}
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

                    <Link
                      to={`/organizaciones/${organizacion.slug}`}
                      className="mini-primary home-org-link"
                    >
                      Ver perfil
                    </Link>
                  </div>
                </div>
              </article>
            )
          )}
        </div>
      )}
  </div>
</section>

<section className="home-participation">
  <div className="site-container">
    <div className="home-section-heading home-section-heading--center">
      <div>
        <span className="home-section-eyebrow">
          Cómo participar
        </span>

        <h2>
          Encontrá una forma de involucrarte
        </h2>

        <p>
          Explorá organizaciones, descubrí las causas
          que trabajan y continuá tu participación
          desde la aplicación móvil.
        </p>
      </div>
    </div>

    <div className="participation-grid">
      <article className="participation-card">
        <span className="participation-card__number">
          01
        </span>

        <h3>
          Explorá organizaciones
        </h3>

        <p>
          Consultá perfiles públicos de organizaciones
          activas y verificadas sin necesidad de iniciar
          sesión.
        </p>
      </article>

      <article className="participation-card">
        <span className="participation-card__number">
          02
        </span>

        <h3>
          Encontrá una causa
        </h3>

        <p>
          Buscá por nombre, tipo de actividad o
          ubicación aproximada hasta encontrar una
          organización que coincida con tus intereses.
        </p>
      </article>

      <article className="participation-card">
        <span className="participation-card__number">
          03
        </span>

        <h3>
          Creá tu cuenta y sumate
        </h3>

        <p>
          Registrate como voluntario desde esta misma
          página y utilizá después tus credenciales en
          la aplicación móvil para participar en
          oportunidades de voluntariado.
        </p>
      </article>
    </div>
    <div className="home-volunteer-register">

  <div className="home-volunteer-register__intro">

    <span className="home-section-eyebrow">
      ¿Querés participar?
    </span>

    <h3>
      Creá tu cuenta de voluntario
    </h3>

    <p>
      Registrate desde la web y utilizá las mismas
      credenciales para ingresar en la aplicación móvil.
    </p>

  </div>


  <form
    className="home-volunteer-register__form"
    onSubmit={manejarRegistroVoluntario}
  >

    <div className="field-row">

      <div className="field">

        <label htmlFor="registroNombre">
          Nombre
        </label>

        <input
          id="registroNombre"
          name="nombre"
          type="text"
          value={registroVoluntario.nombre}
          onChange={manejarCambioRegistro}
          required
          disabled={registrandoVoluntario}
        />

      </div>


      <div className="field">

        <label htmlFor="registroApellido">
          Apellido
        </label>

        <input
          id="registroApellido"
          name="apellido"
          type="text"
          value={registroVoluntario.apellido}
          onChange={manejarCambioRegistro}
          required
          disabled={registrandoVoluntario}
        />

      </div>

    </div>


    <div className="field-row">

      <div className="field">

        <label htmlFor="registroEmail">
          Correo electrónico
        </label>

        <input
          id="registroEmail"
          name="email"
          type="email"
          value={registroVoluntario.email}
          onChange={manejarCambioRegistro}
          required
          disabled={registrandoVoluntario}
        />

      </div>


      <div className="field">

        <label htmlFor="registroTelefono">
          Teléfono
        </label>

        <input
          id="registroTelefono"
          name="telefono"
          type="tel"
          value={registroVoluntario.telefono}
          onChange={manejarCambioRegistro}
          placeholder="Opcional"
          disabled={registrandoVoluntario}
        />

      </div>

    </div>


    <div className="field-row">

      <div className="field">

        <label htmlFor="registroPassword">
          Contraseña
        </label>

        <input
          id="registroPassword"
          name="password"
          type="password"
          value={registroVoluntario.password}
          onChange={manejarCambioRegistro}
          required
          minLength="6"
          disabled={registrandoVoluntario}
        />

      </div>


      <div className="field">

        <label htmlFor="registroConfirmarPassword">
          Confirmar contraseña
        </label>

        <input
          id="registroConfirmarPassword"
          name="confirmarPassword"
          type="password"
          value={
            registroVoluntario.confirmarPassword
          }
          onChange={manejarCambioRegistro}
          required
          minLength="6"
          disabled={registrandoVoluntario}
        />

      </div>

    </div>


    {errorRegistroVoluntario && (

      <div
        className="error-state"
        role="alert"
      >
        {errorRegistroVoluntario}
      </div>

    )}


    {exitoRegistroVoluntario && (

      <div
        className="success-state"
        role="status"
      >
        {exitoRegistroVoluntario}
      </div>

    )}


    <button
      type="submit"
      className="primary-button"
      disabled={registrandoVoluntario}
    >
      {registrandoVoluntario
        ? 'Creando cuenta...'
        : 'Crear cuenta de voluntario'}
    </button>

  </form>

</div>
  </div>
</section>
    </main>
  )
}

export default HomePage