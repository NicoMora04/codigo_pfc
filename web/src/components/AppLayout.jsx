import { Outlet } from 'react-router-dom'

function AppLayout() {
  return (
    <>
      <header>
        <strong>Voluntariado Geolocalizado</strong>
      </header>

      <Outlet />
    </>
  )
}

export default AppLayout