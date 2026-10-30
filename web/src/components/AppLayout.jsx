import { NavLink, Outlet } from 'react-router-dom'
import { haySesion } from '../services/authService.js'
import AppFooter from './AppFooter.jsx'

function AppLayout() {
  const sesionActiva = haySesion()
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header__content">
          <NavLink
            to="/"
            className="site-brand"
          >
            Voluntariado Geolocalizado
          </NavLink>

          <nav
            className="site-nav"
            aria-label="Navegación principal"
          >
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? 'site-nav__link site-nav__link--active'
                  : 'site-nav__link'
              }
              end
            >
              Inicio
            </NavLink>

            <NavLink
              to="/organizaciones"
              className={({ isActive }) =>
                isActive
                  ? 'site-nav__link site-nav__link--active'
                  : 'site-nav__link'
              }
            >
              Organizaciones
            </NavLink>

            {sesionActiva ? (
              <NavLink
                to="/mi-perfil"
                className="site-nav__link"
              >
                Mi perfil
              </NavLink>
            ) : (
              <NavLink
                to="/acceso-organizacion"
                className="site-nav__link"
              >
                Iniciar sesión
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <Outlet />
      <AppFooter />
    </div>
  )
}

export default AppLayout