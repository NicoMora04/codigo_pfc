import axios from 'axios';
import BASE_URL from '../config/api';


const authHeaders = (
  token
) => ({
  headers: {
    Authorization:
      `Bearer ${token}`
  }
});


// ======================================================
// OBTENER INTERESES DEL VOLUNTARIO
// ======================================================

export const obtenerInteresesVoluntario =
  async (
    token
  ) => {

    const response =
      await axios.get(
        `${BASE_URL}/voluntarios/intereses`,
        authHeaders(token)
      );


    return response.data;

  };


// ======================================================
// ACTUALIZAR INTERESES DEL VOLUNTARIO
// ======================================================

export const actualizarInteresesVoluntario =
  async (
    token,
    intereses
  ) => {

    const response =
      await axios.put(
        `${BASE_URL}/voluntarios/intereses`,
        {
          intereses
        },
        authHeaders(token)
      );


    return response.data;

  };


// ======================================================
// OBTENER RECOMENDACIONES
// ======================================================

export const obtenerRecomendacionesVoluntario =
  async (
    token,
    ubicacion = null
  ) => {

    const params = {};


    if (
      ubicacion?.latitud != null &&
      ubicacion?.longitud != null
    ) {

      params.latitud =
        ubicacion.latitud;

      params.longitud =
        ubicacion.longitud;

      params.radioKm =
        ubicacion.radioKm ?? 25;

    }


    const response =
      await axios.get(
        `${BASE_URL}/voluntarios/recomendaciones`,
        {
          ...authHeaders(token),
          params
        }
      );


    return response.data;

  };