import { apiFetch } from './apiClient.js'

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

export {
  listarOrganizaciones,
  listarTiposActividad,
}