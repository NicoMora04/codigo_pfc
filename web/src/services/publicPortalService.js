import { apiFetch } from './apiClient.js'


import { obtenerToken } from './authService.js'

async function obtenerJson(path) {
  const response = await apiFetch(path)

    let data

    try {
    data = await response.json()
    } catch {
    data = {}
    }

  if (!response.ok) {
    throw new Error(
      data.error || 'No se pudo completar la solicitud'
    )
  }

  return data
}

async function listarTiposActividad() {
  const data = await obtenerJson(
    '/public/tipos-actividad'
  )

  return data.tiposActividad || []
}

async function listarOrganizaciones(filtros = {}) {
  const params = new URLSearchParams()

  if (filtros.nombre) {
    params.set('nombre', filtros.nombre)
  }

  if (filtros.idTipoActividad) {
    params.set(
      'id_tipo_actividad',
      filtros.idTipoActividad
    )
  }

  if (filtros.ubicacion) {
    params.set(
      'ubicacion',
      filtros.ubicacion
    )
  }

  const query = params.toString()

  const path = query
    ? `/public/organizaciones?${query}`
    : '/public/organizaciones'

  const data = await obtenerJson(path)

  return data.organizaciones || []
}

async function obtenerPerfilOrganizacion(
  slug
) {
  const data = await obtenerJson(
    `/public/organizaciones/${encodeURIComponent(
      slug
    )}`
  )

  return data.perfil
}

async function obtenerMiPerfilOrganizacion() {

  const token =
    obtenerToken()


  const response =
    await apiFetch(
      '/organizaciones/mi-perfil',
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    )


  let data

  try {

    data =
      await response.json()

  }
  catch {

    data = {}

  }


  if (!response.ok) {

    throw new Error(
      data.error ||
      'No se pudo obtener el perfil institucional'
    )

  }


  if (!data.perfil) {
    return null
  }


  return {
    ...data.perfil,

    organizacion:
      data.organizacion || null,

    ubicacion_aproximada:
      data.organizacion
        ?.ubicacion
        ? {
            localidad:
              data.organizacion
                .ubicacion
                .localidad ||
              null,

            provincia:
              data.organizacion
                .ubicacion
                .provincia ||
              null,
          }
        : null,
  }

}

async function actualizarMiPerfilOrganizacion(
  datos
) {

  const token =
    obtenerToken()


  const response =
    await apiFetch(
      '/organizaciones/mi-perfil',
      {
        method: 'PATCH',

        headers: {
          'Content-Type':
            'application/json',

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify(
            datos
          ),
      }
    )


  let data

  try {

    data =
      await response.json()

  }
  catch {

    data = {}

  }


  if (!response.ok) {

    throw new Error(
      data.error ||
      'No se pudo actualizar el perfil institucional'
    )

  }


  return data.perfil

}

async function crearMiPerfilOrganizacion() {

  const token =
    obtenerToken()


  const response =
    await apiFetch(
      '/organizaciones/mi-perfil',
      {
        method: 'POST',

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    )


  let data

  try {

    data =
      await response.json()

  }
  catch {

    data = {}

  }


  if (!response.ok) {

    throw new Error(
      data.error ||
      'No se pudo crear el perfil institucional'
    )

  }


  return data.perfil

}

async function listarPlantillasPerfil() {

  const token =
    obtenerToken()


  const response =
    await apiFetch(
      '/organizaciones/plantillas-perfil',
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    )


  let data

  try {

    data =
      await response.json()

  }
  catch {

    data = {}

  }


  if (!response.ok) {

    throw new Error(
      data.error ||
      'No se pudieron consultar las plantillas'
    )

  }


  return data.plantillas || []

}

async function actualizarPlantillaMiPerfil(
  codigoPlantilla
) {

  const token =
    obtenerToken()


  const response =
    await apiFetch(
      '/organizaciones/mi-perfil/plantilla',
      {
        method: 'PATCH',

        headers: {
          'Content-Type':
            'application/json',

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify({
            codigoPlantilla,
          }),
      }
    )


  let data

  try {

    data =
      await response.json()

  }
  catch {

    data = {}

  }


  if (!response.ok) {

    throw new Error(
      data.error ||
      'No se pudo actualizar la plantilla'
    )

  }


  return data.perfil

}

async function subirLogoPerfil(
  archivo,
  textoAlternativo = ''
) {

  const token =
    obtenerToken()


  const formData =
    new FormData()


  formData.append(
    'imagen',
    archivo
  )


  formData.append(
    'textoAlternativo',
    textoAlternativo
  )


  const response =
    await apiFetch(
      '/organizaciones/mi-perfil/imagenes/logo',
      {
        method: 'PATCH',

        headers: {
          Authorization:
            `Bearer ${token}`,
        },

        body:
          formData,
      }
    )


  const data =
    await response.json()


  if (!response.ok) {

    throw new Error(
      data.error ||
      'No se pudo subir el logo'
    )

  }


  return data.imagen

}

async function subirPortadaPerfil(
  archivo,
  textoAlternativo = ''
) {

  const token =
    obtenerToken()


  const formData =
    new FormData()


  formData.append(
    'imagen',
    archivo
  )


  formData.append(
    'textoAlternativo',
    textoAlternativo
  )


  const response =
    await apiFetch(
      '/organizaciones/mi-perfil/imagenes/portada',
      {
        method: 'PATCH',

        headers: {
          Authorization:
            `Bearer ${token}`,
        },

        body:
          formData,
      }
    )


  const data =
    await response.json()


  if (!response.ok) {

    throw new Error(
      data.error ||
      'No se pudo subir la portada'
    )

  }


  return data.imagen

}

async function agregarImagenGaleriaPerfil(
  archivo,
  textoAlternativo = ''
) {

  const token =
    obtenerToken()


  const formData =
    new FormData()


  formData.append(
    'imagen',
    archivo
  )


  formData.append(
    'textoAlternativo',
    textoAlternativo
  )


  const response =
    await apiFetch(
      '/organizaciones/mi-perfil/imagenes/galeria',
      {
        method: 'POST',

        headers: {
          Authorization:
            `Bearer ${token}`,
        },

        body:
          formData,
      }
    )


  const data =
    await response.json()


  if (!response.ok) {

    throw new Error(
      data.error ||
      'No se pudo agregar la imagen a la galería'
    )

  }


  return data.imagen

}

async function eliminarImagenGaleriaPerfil(
  idImagen
) {

  const token =
    obtenerToken()


  const response =
    await apiFetch(
      `/organizaciones/mi-perfil/imagenes/galeria/${idImagen}`,
      {
        method: 'DELETE',

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    )


  const data =
    await response.json()


  if (!response.ok) {

    throw new Error(
      data.error ||
      'No se pudo eliminar la imagen'
    )

  }


  return data

}

async function guardarSeccionPerfil(
  tipo,
  datos
) {

  const token =
    obtenerToken()


  const response =
    await apiFetch(
      `/organizaciones/mi-perfil/secciones/${tipo}`,
      {
        method: 'PATCH',

        headers: {
          Authorization:
            `Bearer ${token}`,
          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify(
            datos
          ),
      }
    )


  const data =
    await response.json()


  if (!response.ok) {

    throw new Error(
      data.error ||
      'No se pudo guardar la sección'
    )

  }


  return data.seccion
}

async function actualizarOrdenSeccionesMiPerfil(
  secciones
) {

  const token =
    obtenerToken()


  const response =
    await apiFetch(
      '/organizaciones/mi-perfil/orden-secciones',
      {
        method: 'PATCH',

        headers: {
          'Content-Type':
            'application/json',

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify({
            secciones,
          }),
      }
    )


  let data

  try {

    data =
      await response.json()

  }
  catch {

    data = {}

  }


  if (!response.ok) {

    throw new Error(
      data.error ||
      'No se pudo actualizar el orden de las secciones'
    )

  }


  return data.secciones || []

}

async function publicarMiPerfil() {

  const token =
    obtenerToken()


  const response =
    await apiFetch(
      '/organizaciones/mi-perfil/publicar',
      {
        method: 'PATCH',

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    )


  const data =
    await response.json()


  if (!response.ok) {

    throw new Error(
      data.error ||
      'No se pudo publicar el perfil'
    )

  }


  return data.perfil
}


async function retirarMiPerfil() {

  const token =
    obtenerToken()


  const response =
    await apiFetch(
      '/organizaciones/mi-perfil/retirar',
      {
        method: 'PATCH',

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    )


  const data =
    await response.json()


  if (!response.ok) {

    throw new Error(
      data.error ||
      'No se pudo retirar el perfil'
    )

  }


  return data.perfil
}

// ======================================================
// ACTUALIZAR TIPOS DE ACTIVIDAD DEL PERFIL
// ACTIVIDAD 3.6.5
// ======================================================

async function actualizarTiposActividadMiPerfil(
  idsTiposActividad
) {

  const token =
    obtenerToken()


  const response =
    await apiFetch(
      '/organizaciones/mi-perfil/tipos-actividad',
      {
        method: 'PATCH',

        headers: {
          'Content-Type':
            'application/json',

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify({
            idsTiposActividad,
          }),
      }
    )


  let data

  try {

    data =
      await response.json()

  }
  catch {

    data = {}

  }


  if (!response.ok) {

    throw new Error(
      data.error ||
      'No se pudieron actualizar los tipos de actividad'
    )

  }


  return data.tiposActividad || []

}

// ======================================================
// CONSULTA DE UBICACIONES
// ACTIVIDAD 3.6.5
// ======================================================

async function buscarUbicaciones(
  texto
) {

  const response =
    await apiFetch(
      `/ubicaciones/buscar?q=${encodeURIComponent(
        texto
      )}`
    )


  let data

  try {

    data =
      await response.json()

  }
  catch {

    data = {}

  }


  if (!response.ok) {

    throw new Error(
      data.error ||
      'No se pudieron buscar ubicaciones'
    )

  }


  return data.resultados || []

}

async function actualizarUbicacionMiPerfil(
  ubicacion
) {

  const token =
    obtenerToken()


  const response =
    await apiFetch(
      '/organizaciones/mi-perfil/ubicacion',
      {
        method: 'PATCH',

        headers: {
          'Content-Type':
            'application/json',

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify(
            ubicacion
          ),
      }
    )


  let data

  try {

    data =
      await response.json()

  }
  catch {

    data = {}

  }


  if (!response.ok) {

    throw new Error(
      data.error ||
      'No se pudo actualizar la ubicación'
    )

  }


  return data.ubicacion

}

export {
  listarOrganizaciones,
  listarTiposActividad,
  obtenerPerfilOrganizacion,
  obtenerMiPerfilOrganizacion,
  actualizarMiPerfilOrganizacion,
  crearMiPerfilOrganizacion,
  listarPlantillasPerfil,
  actualizarPlantillaMiPerfil,
  subirLogoPerfil,
  subirPortadaPerfil,
  agregarImagenGaleriaPerfil,
  eliminarImagenGaleriaPerfil,
  guardarSeccionPerfil,
  actualizarOrdenSeccionesMiPerfil,
  publicarMiPerfil,
  retirarMiPerfil,
  actualizarTiposActividadMiPerfil,
  buscarUbicaciones,
  actualizarUbicacionMiPerfil,
}