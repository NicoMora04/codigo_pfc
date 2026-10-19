import axios from 'axios';
import BASE_URL from '../config/api';

const authHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});


// ======================================================
// CALIFICAR VOLUNTARIO POR ORGANIZACIÓN
// ACTIVIDAD 3.2.1
// ======================================================

export const calificarVoluntario = async (
  token,
  idInscripcion,
  puntuacion,
  comentario
) => {

  const response = await axios.post(
    `${BASE_URL}/calificaciones/voluntario/${idInscripcion}`,
    {
      puntuacion,
      comentario
    },
    authHeaders(token)
  );

  return response.data;

};


// ======================================================
// CONSULTAR MI REPUTACIÓN COMO VOLUNTARIO
// ACTIVIDAD 3.2.1
// ======================================================

export const obtenerMiReputacionVoluntario = async (
  token
) => {

  const response = await axios.get(
    `${BASE_URL}/calificaciones/mi-reputacion`,
    authHeaders(token)
  );

  return response.data;

};

// ======================================================
// CALIFICAR ORGANIZACIÓN COMO VOLUNTARIO
// ACTIVIDAD 3.2.2
// ======================================================

export const calificarOrganizacion = async (
  token,
  idInscripcion,
  puntuacion,
  comentario
) => {

  const response = await axios.post(
    `${BASE_URL}/calificaciones/organizacion/${idInscripcion}`,
    {
      puntuacion,
      comentario
    },
    authHeaders(token)
  );

  return response.data;

};


// ======================================================
// CONSULTAR MI REPUTACIÓN COMO ORGANIZACIÓN
// ACTIVIDAD 3.2.2
// ======================================================

export const obtenerMiReputacionOrganizacion = async (
  token
) => {

  const response = await axios.get(
    `${BASE_URL}/calificaciones/mi-reputacion-organizacion`,
    authHeaders(token)
  );

  return response.data;

};