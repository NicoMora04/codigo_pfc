import { apiFetch } from './apiClient.js'


const TOKEN_KEY =
  'voluntariado_web_token'

const USER_KEY =
  'voluntariado_web_user'


// ======================================================
// INICIAR SESIÓN
// ACTIVIDAD 3.6.2
// ======================================================

async function iniciarSesion(
  email,
  password
) {

  const response =
    await apiFetch(
      '/auth/login',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({
            email,
            password,
          }),
      }
    )


  let data

  try {

    data =
      await response.json()

  }
  catch {

    data = {}

  }


  if (!response.ok) {

    throw new Error(
      data.error ||
      'No se pudo iniciar sesión'
    )

  }


  if (
    data.user?.rol !==
    'ORGANIZACION'
  ) {

    throw new Error(
      'El acceso web de gestión está disponible únicamente para organizaciones'
    )

  }


  localStorage.setItem(
    TOKEN_KEY,
    data.token
  )


  localStorage.setItem(
    USER_KEY,
    JSON.stringify(
      data.user
    )
  )


  return data
}


// ======================================================
// RESTABLECER CONTRASEÑA
// ======================================================

async function restablecerPassword(
  token,
  nuevaPassword
) {

  const response =
    await apiFetch(
      '/auth/reset-password',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({
            token,
            nuevaPassword,
          }),
      }
    )


  let data

  try {

    data =
      await response.json()

  }
  catch {

    data = {}

  }


  if (!response.ok) {

    throw new Error(
      data.error ||
      'No se pudo restablecer la contraseña.'
    )

  }


  return data
}


// ======================================================
// OBTENER TOKEN
// ======================================================

function obtenerToken() {

  return localStorage.getItem(
    TOKEN_KEY
  )

}


// ======================================================
// OBTENER USUARIO GUARDADO
// ======================================================

function obtenerUsuario() {

  const usuario =
    localStorage.getItem(
      USER_KEY
    )


  if (!usuario) {

    return null

  }


  try {

    return JSON.parse(
      usuario
    )

  }
  catch {

    return null

  }

}


// ======================================================
// CERRAR SESIÓN
// ======================================================

function cerrarSesion() {

  localStorage.removeItem(
    TOKEN_KEY
  )

  localStorage.removeItem(
    USER_KEY
  )

}


// ======================================================
// CONSULTAR SI EXISTE SESIÓN
// ======================================================

function haySesion() {

  return Boolean(
    obtenerToken()
  )

}

// ======================================================
// REGISTRAR VOLUNTARIO DESDE LA WEB
// ======================================================

async function registrarVoluntario({
  email,
  password,
  nombre,
  apellido,
  telefono,
}) {

  const response =
    await apiFetch(
      '/auth/register',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({
            email,
            password,
            rol: 'VOLUNTARIO',
            nombre,
            apellido,
            telefono:
              telefono?.trim() || null,
          }),
      }
    )


  let data

  try {

    data =
      await response.json()

  }
  catch {

    data = {}

  }


  if (!response.ok) {

    throw new Error(
      data.error ||
      'No se pudo registrar el voluntario'
    )

  }


  return data

}

export {
  iniciarSesion,
  registrarVoluntario,
  restablecerPassword,
  obtenerToken,
  obtenerUsuario,
  cerrarSesion,
  haySesion,
}