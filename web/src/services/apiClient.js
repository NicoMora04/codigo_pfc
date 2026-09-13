import { API_URL } from '../config/env.js'

async function apiFetch(path, options = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return fetch(`${API_URL}${normalizedPath}`, options)
}

export { apiFetch }