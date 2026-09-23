import axios from 'axios';
import BASE_URL from '../config/api';

const authHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const inscribirseOportunidad = async (
  token,
  idOportunidad
) => {
  const response = await axios.post(
    `${BASE_URL}/inscripciones`,
    {
      id_oportunidad: idOportunidad,
    },
    authHeaders(token)
  );

  return response.data;
};

export const obtenerMisInscripciones = async (token) => {
  const response = await axios.get(
    `${BASE_URL}/inscripciones/mis-inscripciones`,
    authHeaders(token)
  );

  return response.data;
};


export const obtenerInscripcionesOportunidad = async (
  token,
  idOportunidad
) => {
  const response = await axios.get(
    `${BASE_URL}/inscripciones/oportunidad/${idOportunidad}`,
    authHeaders(token)
  );

  return response.data;
};

export const aceptarInscripcion = async (
  token,
  idInscripcion
) => {
  const response = await axios.patch(
    `${BASE_URL}/inscripciones/${idInscripcion}/aceptar`,
    {},
    authHeaders(token)
  );

  return response.data;
};

export const rechazarInscripcion = async (
  token,
  idInscripcion
) => {
  const response = await axios.patch(
    `${BASE_URL}/inscripciones/${idInscripcion}/rechazar`,
    {},
    authHeaders(token)
  );

  return response.data;
};


export const ocultarInscripcion = async (
  token,
  idInscripcion
) => {
  const response = await axios.patch(
    `${BASE_URL}/inscripciones/${idInscripcion}/ocultar`,
    {},
    authHeaders(token)
  );

  return response.data;
};

export const cancelarInscripcion = async (
  token,
  idInscripcion
) => {

  const response = await axios.patch(
    `${BASE_URL}/inscripciones/${idInscripcion}/cancelar`,
    {},
    authHeaders(token)
  );

  return response.data;

};

export const marcarResultadoParticipacion = async (
  token,
  idInscripcion,
  estado
) => {

  const response = await axios.patch(
    `${BASE_URL}/inscripciones/${idInscripcion}/resultado`,
    {
      estado
    },
    authHeaders(token)
  );

  return response.data;

};