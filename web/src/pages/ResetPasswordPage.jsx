import {
  useState,
} from 'react'

import {
  useSearchParams,
} from 'react-router-dom'

import {
  restablecerPassword,
} from '../services/authService.js'


function ResetPasswordPage() {

  const [
    searchParams,
  ] = useSearchParams()


  const token =
    searchParams.get('token')


  const [
    nuevaPassword,
    setNuevaPassword,
  ] = useState('')


  const [
    confirmarPassword,
    setConfirmarPassword,
  ] = useState('')


  const [
    cargando,
    setCargando,
  ] = useState(false)


  const [
    error,
    setError,
  ] = useState('')


  const [
    mensaje,
    setMensaje,
  ] = useState('')

  const [
  mostrarPassword,
  setMostrarPassword,
] = useState(false)


  async function manejarSubmit(event) {

    event.preventDefault()

    setError('')
    setMensaje('')


    if (!token) {

      setError(
        'El enlace de recuperación no es válido.'
      )

      return

    }


    if (nuevaPassword.length < 6) {

      setError(
        'La contraseña debe tener al menos 6 caracteres.'
      )

      return

    }


    if (
      nuevaPassword !==
      confirmarPassword
    ) {

      setError(
        'Las contraseñas no coinciden.'
      )

      return

    }


    try {

      setCargando(true)


      const data =
        await restablecerPassword(
          token,
          nuevaPassword
        )


      setMensaje(
        data.message ||
        'La contraseña fue restablecida correctamente.'
      )


      setNuevaPassword('')
      setConfirmarPassword('')

    }
    catch (error) {

      setError(
        error.message ||
        'No se pudo restablecer la contraseña.'
      )

    }
    finally {

      setCargando(false)

    }

  }


  return (

    <main className="reset-password-page">

      <div className="site-container">

        <section className="reset-password-card">

          <span className="home-section-eyebrow">
            Recuperación de acceso
          </span>


          <h1>
            Restablecer contraseña
          </h1>


          <p className="reset-password-description">
            Ingresá una nueva contraseña para tu cuenta.
          </p>


          {!token ? (

            <div
              className="error-state"
              role="alert"
            >
              El enlace de recuperación no contiene
              un token válido.
            </div>

          ) : (

            <form
              onSubmit={manejarSubmit}
            >

              <div className="field">

                <label htmlFor="nuevaPassword">
                  Nueva contraseña
                </label>

                <input
                  id="nuevaPassword"
                  type={
                    mostrarPassword
                        ? 'text'
                        : 'password'
                    }
                  value={nuevaPassword}
                  onChange={event =>
                    setNuevaPassword(
                      event.target.value
                    )
                  }
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />

              </div>


              <div className="field">

                <label htmlFor="confirmarPassword">
                  Confirmar contraseña
                </label>

                <input
                  id="confirmarPassword"
                  type={
                    mostrarPassword
                        ? 'text'
                        : 'password'
                    }
                  value={confirmarPassword}
                  onChange={event =>
                    setConfirmarPassword(
                      event.target.value
                    )
                  }
                  placeholder="Repetí la contraseña"
                  autoComplete="new-password"
                />

              </div>

              <label className="password-visibility">

                <input
                    type="checkbox"
                    checked={mostrarPassword}
                    onChange={event =>
                    setMostrarPassword(
                        event.target.checked
                    )
                    }
                />

                <span>
                    Mostrar contraseñas
                </span>

                </label>


              {error && (

                <div
                  className="error-state"
                  role="alert"
                >
                  {error}
                </div>

              )}


              {mensaje && (

                <div
                  className="reset-password-success"
                  role="status"
                >
                  {mensaje}
                </div>

              )}


              <button
                type="submit"
                className="primary-button reset-password-button"
                disabled={
                  cargando ||
                  Boolean(mensaje)
                }
              >

                {cargando
                  ? 'Guardando...'
                  : 'Restablecer contraseña'}

              </button>

            </form>

          )}



        </section>

      </div>

    </main>

  )

}


export default ResetPasswordPage