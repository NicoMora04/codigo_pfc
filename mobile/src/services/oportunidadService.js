import axios from 'axios';
import BASE_URL from '../config/api';

const authHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const obtenerMisOportunidades = async (token) => {
  const response = await axios.get(
    `${BASE_URL}/oportunidades/mias`,
    authHeaders(token)
  );

  return response.data;
};

export const obtenerOportunidadesVoluntario = async (
  token,
  filtros = {}
) => {
  const response = await axios.get(
    `${BASE_URL}/oportunidades`,
    {
      ...authHeaders(token),
      params: filtros,
    }
  );

  return response.data;
};

export const obtenerDetalleOportunidadVoluntario = async (
  token,
  idOportunidad
) => {
  const response = await axios.get(
    `${BASE_URL}/oportunidades/${idOportunidad}/detalle`,
    authHeaders(token)
  );

  return response.data;
};

export const obtenerOportunidadPorId = async (
  token,
  idOportunidad
) => {
  const response = await axios.get(
    `${BASE_URL}/oportunidades/${idOportunidad}`,
    authHeaders(token)
  );

  return response.data;
};

export const obtenerTiposActividad = async (token) => {
  const response = await axios.get(
    `${BASE_URL}/tipos-actividad`,
    authHeaders(token)
  );

  return response.data;
};


export const publicarOportunidad = async (
  token,
  idOportunidad
) => {
  const response = await axios.patch(
    `${BASE_URL}/oportunidades/${idOportunidad}/publicar`,
    {},
    authHeaders(token)
  );

  return response.data;
};


export const cancelarOportunidad = async (
  token,
  idOportunidad
) => {
  const response = await axios.patch(
    `${BASE_URL}/oportunidades/${idOportunidad}/cancelar`,
    {},
    authHeaders(token)
  );

  return response.data;
};


export const cerrarOportunidad = async (
  token,
  idOportunidad
) => {
  const response = await axios.patch(
    `${BASE_URL}/oportunidades/${idOportunidad}/cerrar`,
    {},
    authHeaders(token)
  );

  return response.data;
};


export const finalizarOportunidad = async (
  token,
  idOportunidad
) => {
  const response = await axios.patch(
    `${BASE_URL}/oportunidades/${idOportunidad}/finalizar`,
    {},
    authHeaders(token)
  );

  return response.data;
};


export const crearOportunidad = async (
  token,
  datosOportunidad
) => {
  const response = await axios.post(
    `${BASE_URL}/oportunidades`,
    datosOportunidad,
    authHeaders(token)
  );

  return response.data;
};

export const actualizarOportunidad = async (
  token,
  idOportunidad,
  datosOportunidad
) => {
  const response = await axios.put(
    `${BASE_URL}/oportunidades/${idOportunidad}`,
    datosOportunidad,
    authHeaders(token)
  );

  return response.data;
};