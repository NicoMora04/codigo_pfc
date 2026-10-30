import {
  Route,
  Routes,
} from 'react-router-dom'

import AppLayout
  from '../components/AppLayout.jsx'

import ProtectedOrganizationRoute
  from '../components/ProtectedOrganizationRoute.jsx'

import HomePage
  from '../pages/HomePage.jsx'

import OrganizacionesPage
  from '../pages/OrganizacionesPage.jsx'

import PerfilOrganizacionPage
  from '../pages/PerfilOrganizacionPage.jsx'

import ResetPasswordPage
  from '../pages/ResetPasswordPage.jsx'

import LoginOrganizacionPage
  from '../pages/LoginOrganizacionPage.jsx'

import MiPerfilOrganizacionPage
  from '../pages/MiPerfilOrganizacionPage.jsx'

import PrevisualizacionPerfilPage
  from '../pages/PrevisualizacionPerfilPage.jsx'

function AppRoutes() {

  return (

    <Routes>

      {/* ================================================= */}
      {/* RUTAS INDEPENDIENTES */}
      {/* ================================================= */}

      <Route
        path="/restablecer-contrasena"
        element={
          <ResetPasswordPage />
        }
      />


      <Route
        path="/acceso-organizacion"
        element={
          <LoginOrganizacionPage />
        }
      />


      {/* ================================================= */}
      {/* GESTIÓN AUTENTICADA DE ORGANIZACIÓN */}
      {/* ================================================= */}

      <Route
        element={
          <ProtectedOrganizationRoute />
        }
      >

        <Route
          path="/mi-perfil"
          element={
            <MiPerfilOrganizacionPage />
          }
        />

        <Route
          path="/mi-perfil/previsualizacion"
          element={
            <PrevisualizacionPerfilPage />
          }
        />

      </Route>


      {/* ================================================= */}
      {/* PORTAL PÚBLICO */}
      {/* ================================================= */}

      <Route
        element={
          <AppLayout />
        }
      >

        <Route
          path="/"
          element={
            <HomePage />
          }
        />


        <Route
          path="/organizaciones"
          element={
            <OrganizacionesPage />
          }
        />


        <Route
          path="/organizaciones/:slug"
          element={
            <PerfilOrganizacionPage />
          }
        />

      </Route>

    </Routes>

  )

}


export default AppRoutes