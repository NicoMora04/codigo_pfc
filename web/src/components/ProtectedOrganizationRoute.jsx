import {
  Navigate,
  Outlet,
} from 'react-router-dom'

import {
  haySesion,
  obtenerUsuario,
} from '../services/authService.js'


function ProtectedOrganizationRoute() {

  const usuario =
    obtenerUsuario()


  if (
    !haySesion() ||
    usuario?.rol !==
      'ORGANIZACION'
  ) {

    return (
      <Navigate
        to="/acceso-organizacion"
        replace
      />
    )

  }


  return (
    <Outlet />
  )

}


export default ProtectedOrganizationRoute