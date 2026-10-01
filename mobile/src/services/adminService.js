import axios from 'axios';
import BASE_URL from '../config/api';


const authHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});


// ======================================================
// OBTENER ORGANIZACIONES PENDIENTES
// ======================================================

export const obtenerOrganizacionesPendientes =
  async (token) => {

    const response =
      await axios.get(
        `${BASE_URL}/admin/organizaciones/pendientes`,
        authHeaders(token)
      );

    return response.data;

  };


// ======================================================
// APROBAR ORGANIZACIÓN
// ======================================================

export const aprobarOrganizacion =
  async (
    token,
    idOrganizacion
  ) => {

    const response =
      await axios.patch(
        `${BASE_URL}/admin/organizaciones/${idOrganizacion}/aprobar`,
        {},
        authHeaders(token)
      );

    return response.data;

  };


// ======================================================
// RECHAZAR ORGANIZACIÓN
// ======================================================

export const rechazarOrganizacion =
  async (
    token,
    idOrganizacion,
    motivo
  ) => {

    const response =
      await axios.patch(
        `${BASE_URL}/admin/organizaciones/${idOrganizacion}/rechazar`,
        {
          motivo
        },
        authHeaders(token)
      );

    return response.data;

  };