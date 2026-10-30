const API_URL =
  import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error(
    'Falta configurar la variable VITE_API_URL'
  )
}

const BACKEND_URL =
  API_URL.replace(
    /\/api\/?$/,
    ''
  )

export {
  API_URL,
  BACKEND_URL,
}