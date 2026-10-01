import { apiFetch } from './apiClient.js'


async function restablecerPassword(
  token,
  nuevaPassword
) {

  const response = await apiFetch(
    '/auth/reset-password',
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        token,
        nuevaPassword,
      }),
    }
  )


  let data

  try {
    data = await response.json()
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


export {
  restablecerPassword,
}