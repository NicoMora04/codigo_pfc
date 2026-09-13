import { API_URL } from '../config/env.js'

function HomePage() {
  return (
    <main>
      <h1>Voluntariado Geolocalizado</h1>
      <p>Frontend web iniciado correctamente.</p>
      <p>API configurada: {API_URL}</p>
    </main>
  )
}

export default HomePage