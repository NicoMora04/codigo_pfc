const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error('Falta configurar la variable VITE_API_URL')
}

export { API_URL }