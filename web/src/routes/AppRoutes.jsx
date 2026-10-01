import {
  Route,
  Routes,
} from 'react-router-dom'

import AppLayout
  from '../components/AppLayout.jsx'

import HomePage
  from '../pages/HomePage.jsx'

import OrganizacionesPage
  from '../pages/OrganizacionesPage.jsx'

import ResetPasswordPage
  from '../pages/ResetPasswordPage.jsx'


function AppRoutes() {

  return (

    <Routes>

      {/* Página independiente de recuperación */}
      <Route
        path="/restablecer-contrasena"
        element={<ResetPasswordPage />}
      />


      {/* Portal público */}
      <Route element={<AppLayout />}>

        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/organizaciones"
          element={<OrganizacionesPage />}
        />

      </Route>

    </Routes>

  )

}


export default AppRoutes