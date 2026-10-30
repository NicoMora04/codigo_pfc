import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import {
  obtenerPerfilOrganizacion,
} from '../services/publicPortalService.js'

import PlantillaClasica
  from '../components/perfiles/PlantillaClasica.jsx'

import PlantillaComunidad
  from '../components/perfiles/PlantillaComunidad.jsx'


function PerfilOrganizacionPage() {

  const {
    slug,
  } = useParams()


  const [
    perfil,
    setPerfil,
  ] = useState(null)


  const [
    oportunidades,
    setOportunidades,
  ] = useState([])


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
            await obtenerPerfilOrganizacion(
              slug
            )


          const perfilRecibido =
            data.perfil ||
            data


          setPerfil(
            perfilRecibido
          )


          setOportunidades(
            perfilRecibido
              ?.oportunidades ||
            data.oportunidades ||
            []
          )

        }
        catch (error) {

          setError(
            error.message ||
            'No se pudo cargar el perfil de la organización'
          )

        }
        finally {

          setLoading(false)

        }

      }


    cargarPerfil()

  }, [slug])


  if (loading) {

    return (

      <main className="site-container">

        <div
          className="loading-state"
          style={{
            marginTop: '3rem',
          }}
        >
          Cargando perfil...
        </div>

      </main>

    )

  }


  if (
    error ||
    !perfil
  ) {

    return (

      <main
        className="site-container"
        style={{
          padding: '3rem 0',
        }}
      >

        <div
          className="error-state"
        >
          {
            error ||
            'El perfil solicitado no está disponible'
          }
        </div>


        <div
          style={{
            marginTop: '1rem',
          }}
        >

          <Link
            to="/organizaciones"
            className="secondary-button"
          >
            Volver al directorio
          </Link>

        </div>

      </main>

    )

  }


  const codigoPlantilla =
    perfil.plantilla?.codigo ||
    'clasica'


  return (

    <main>

      {codigoPlantilla ===
        'comunidad' ? (

        <PlantillaComunidad
          perfil={
            perfil
          }
          oportunidades={
            oportunidades
          }
        />

      ) : (

        <PlantillaClasica
          perfil={
            perfil
          }
          oportunidades={
            oportunidades
          }
        />

      )}

    </main>

  )

}


export default PerfilOrganizacionPage