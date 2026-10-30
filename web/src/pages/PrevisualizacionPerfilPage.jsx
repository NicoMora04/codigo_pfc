import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  obtenerMiPerfilOrganizacion,
} from '../services/publicPortalService.js'

import PlantillaClasica
  from '../components/perfiles/PlantillaClasica.jsx'

import PlantillaComunidad
  from '../components/perfiles/PlantillaComunidad.jsx'


function PrevisualizacionPerfilPage() {

  const [
    perfil,
    setPerfil,
  ] = useState(null)


  const [
    loading,
    setLoading,
  ] = useState(true)


  const [
    error,
    setError,
  ] = useState('')


  useEffect(() => {

    const cargarPerfil =
      async () => {

        try {

          setLoading(true)

          setError('')


          const data =
            await obtenerMiPerfilOrganizacion()


          setPerfil(
            data
          )

        }
        catch (error) {

          setError(
            error.message ||
            'No se pudo cargar la previsualización'
          )

        }
        finally {

          setLoading(false)

        }

      }


    cargarPerfil()

  }, [])


  if (loading) {

    return (

      <main className="site-container">

        <div
          className="loading-state"
          style={{
            marginTop: '3rem',
          }}
        >
          Cargando previsualización...
        </div>

      </main>

    )

  }


  if (error) {

    return (

      <main
        className="site-container"
        style={{
          padding: '3rem 0',
        }}
      >

        <div className="error-state">
          {error}
        </div>

      </main>

    )

  }


  if (!perfil) {

    return (

      <main
        className="site-container"
        style={{
          padding: '3rem 0',
        }}
      >

        <div className="empty-result">

          <strong>
            Todavía no existe un perfil
          </strong>

          <p>
            Primero creá el perfil institucional
            para poder previsualizarlo.
          </p>

        </div>

      </main>

    )

  }


  const codigoPlantilla =
    perfil.plantilla?.codigo ||
    'clasica'


  const oportunidades =
    perfil.oportunidades ||
    []


  return (

    <div className="private-preview">

      {/* ================================================= */}
      {/* BARRA DE PREVISUALIZACIÓN PRIVADA */}
      {/* ================================================= */}

      <div
        className="private-preview-toolbar"
      >

        <div
          className="site-container private-preview-toolbar__content"
        >

          <div
            className="private-preview-toolbar__info"
          >

            <strong>
              Previsualización privada
            </strong>


            <span>
              Estás viendo la plantilla
              {' '}
              <strong>
                {
                  perfil.plantilla?.nombre ||
                  'Clásica'
                }
              </strong>
              .
              Este perfil todavía puede modificarse
              antes de publicarlo.
            </span>

          </div>


          <div
            className="private-preview-toolbar__actions"
          >

            <span
              className="private-preview-status"
            >
              {
                perfil.estado_publicacion
              }
            </span>


            <Link
              to="/mi-perfil"
              className="secondary-button"
            >
              ← Volver al editor
            </Link>

          </div>

        </div>

      </div>


      {/* ================================================= */}
      {/* PLANTILLA SELECCIONADA */}
      {/* ================================================= */}

      {codigoPlantilla ===
        'comunidad' ? (

        <PlantillaComunidad
          perfil={perfil}
          oportunidades={
            oportunidades
          }
        />

      ) : (

        <PlantillaClasica
          perfil={perfil}
          oportunidades={
            oportunidades
          }
        />

      )}

    </div>

  )

}


export default PrevisualizacionPerfilPage