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