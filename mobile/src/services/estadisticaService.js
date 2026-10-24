import axios from 'axios';

import BASE_URL
  from '../config/api';


// ======================================================
// HEADERS DE AUTENTICACIÓN
// ======================================================

const authHeaders =
  (token) => ({

    headers: {

      Authorization:
        `Bearer ${token}`,

    },

  });


// ======================================================
// ESTADÍSTICAS DE ORGANIZACIÓN
// ACTIVIDAD 3.4.1
// ======================================================

export const obtenerEstadisticasOrganizacion =
  async (
    token
  ) => {

    const response =
      await axios.get(
        `${BASE_URL}/estadisticas/organizacion`,
        authHeaders(
          token
        )
      );


    return response.data;

  };


// ======================================================
// ESTADÍSTICAS GLOBALES PARA ADMIN
// ACTIVIDAD 3.4.2
// ======================================================

export const obtenerEstadisticasGlobales =
  async (
    token
  ) => {

    const response =
      await axios.get(
        `${BASE_URL}/estadisticas/globales`,
        authHeaders(
          token
        )
      );


    return response.data;

  };