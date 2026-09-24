import { NavLink, Outlet } from 'react-router-dom'

function AppLayout() {
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
          </nav>
        </div>
      </header>

      <Outlet />
    </div>
  )
}

export default AppLayout