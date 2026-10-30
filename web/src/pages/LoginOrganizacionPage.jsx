import {
  useState
} from 'react'

import {
  Link,
  useNavigate
} from 'react-router-dom'

import {
  iniciarSesion
} from '../services/authService.js'


function LoginOrganizacionPage() {

  const navigate =
    useNavigate()


  const [
    email,
    setEmail
  ] = useState('')


  const [
    password,
    setPassword
  ] = useState('')


  const [
    loading,
    setLoading
  ] = useState(false)


  const [
    error,
    setError
  ] = useState('')


  const handleSubmit =
    async (
      event
    ) => {

      event.preventDefault()

      setError('')


      if (
        !email.trim() ||
        !password
      ) {

        setError(
          'Ingresá tu correo electrónico y contraseña'
        )

        return
      }


      try {

        setLoading(
          true
        )


        await iniciarSesion(
          email.trim(),
          password
        )


        navigate(
          '/mi-perfil'
        )

      }
      catch (error) {

        setError(
          error.message ||
          'No se pudo iniciar sesión'
        )

      }
      finally {

        setLoading(
          false
        )

      }

    }


  return (

    <main
      className="organization-login-page"
    >

      <div
        className="site-container"
      >

        <section
          className="organization-login-card"
        >

          <div
            className="organization-login-head"
          >

            <span
              className="organization-login-eyebrow"
            >
              Gestión institucional
            </span>


            <h1>
              Acceso de organizaciones
            </h1>


            <p>
              Ingresá con la misma cuenta que utilizás
              en la aplicación móvil para administrar
              tu perfil público.
            </p>

          </div>


          {error && (

            <div
              className="error-state organization-login-error"
            >
              {error}
            </div>

          )}


          <form
            onSubmit={
              handleSubmit
            }
          >

            <div
              className="field"
            >

              <label
                htmlFor="email"
              >
                Correo electrónico
              </label>


              <input
                id="email"
                type="email"
                value={
                  email
                }
                onChange={
                  (
                    event
                  ) => {

                    setEmail(
                      event.target.value
                    )

                  }
                }
                placeholder="organizacion@ejemplo.org"
                autoComplete="email"
                disabled={
                  loading
                }
              />

            </div>


            <div
              className="field"
            >

              <label
                htmlFor="password"
              >
                Contraseña
              </label>


              <input
                id="password"
                type="password"
                value={
                  password
                }
                onChange={
                  (
                    event
                  ) => {

                    setPassword(
                      event.target.value
                    )

                  }
                }
                placeholder="Ingresá tu contraseña"
                autoComplete="current-password"
                disabled={
                  loading
                }
              />

            </div>


            <button
              type="submit"
              className="primary-button organization-login-button"
              disabled={
                loading
              }
            >

              {loading
                ? 'Ingresando...'
                : 'Ingresar'}

            </button>

          </form>


          <div
            className="organization-login-footer"
          >

            <Link
              to="/"
            >
              ← Volver al portal público
            </Link>


            <Link
              to="/restablecer-contrasena"
            >
              ¿Olvidaste tu contraseña?
            </Link>

          </div>

        </section>

      </div>

    </main>

  )

}


export default LoginOrganizacionPage