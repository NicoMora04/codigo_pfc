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


  // ======================================================
// OBTENER USUARIOS
// ======================================================

export const obtenerUsuarios =
  async (token) => {

    const response =
      await axios.get(
        `${BASE_URL}/admin/usuarios`,
        authHeaders(token)
      );

    return response.data;

  };


// ======================================================
// BLOQUEAR USUARIO
// ======================================================

export const bloquearUsuario =
  async (
    token,
    idUsuario,
    motivo
  ) => {

    const response =
      await axios.patch(
        `${BASE_URL}/admin/usuarios/${idUsuario}/bloquear`,
        {
          motivo
        },
        authHeaders(token)
      );

    return response.data;

  };


// ======================================================
// REHABILITAR USUARIO
// ======================================================

export const rehabilitarUsuario =
  async (
    token,
    idUsuario
  ) => {

    const response =
      await axios.patch(
        `${BASE_URL}/admin/usuarios/${idUsuario}/rehabilitar`,
        {},
        authHeaders(token)
      );

    return response.data;

  };

  // ======================================================
// TIPOS DE ACTIVIDAD
// ======================================================

export const obtenerTiposActividadAdmin =
  async (token) => {

    const response =
      await axios.get(
        `${BASE_URL}/tipos-actividad`,
        authHeaders(token)
      );

    return response.data;
  };


export const crearTipoActividadAdmin =
  async (
    token,
    nombre
  ) => {

    const response =
      await axios.post(
        `${BASE_URL}/tipos-actividad`,
        {
          nombre
        },
        authHeaders(token)
      );

    return response.data;
  };


export const actualizarTipoActividadAdmin =
  async (
    token,
    idTipoActividad,
    nombre
  ) => {

    const response =
      await axios.put(
        `${BASE_URL}/tipos-actividad/${idTipoActividad}`,
        {
          nombre
        },
        authHeaders(token)
      );

    return response.data;
  };


  // ======================================================
// ANULAR REGISTRO INVÁLIDO DE ORGANIZACIÓN
// ======================================================

export const anularRegistroOrganizacion =
  async (
    token,
    idOrganizacion,
    motivo
  ) => {

    const response =
      await axios.delete(
        `${BASE_URL}/admin/organizaciones/${idOrganizacion}/anular`,
        {
          ...authHeaders(token),
          data: {
            motivo
          }
        }
      );

    return response.data;

  };