import axios from 'axios';
import BASE_URL from '../config/api';

export const buscarUbicacionesPorTexto = async (
  token,
  texto
) => {

  const config = {
    params: {
      q: texto
    }
  };


  if (token) {

    config.headers = {
      Authorization: `Bearer ${token}`
    };

  }


  const response =
    await axios.get(
      `${BASE_URL}/ubicaciones/buscar`,
      config
    );


  return response.data;

};

export const registrarUbicacion = async (
  token,
  ubicacion
) => {
  const response = await axios.post(
    `${BASE_URL}/ubicaciones`,
    ubicacion,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};