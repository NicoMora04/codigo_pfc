import axios from 'axios';
import BASE_URL from '../config/api';

export const login = async (email, password) => {
  const response = await axios.post(
    `${BASE_URL}/auth/login`,
    {
      email,
      password,
    }
  );

  return response.data;
};

export const registrarUsuario = async (data) => {
  const response = await axios.post(
    `${BASE_URL}/auth/register`,
    data
  );

  return response.data;
};

export const recuperarPassword = async (email) => {
  const response = await axios.post(
    `${BASE_URL}/auth/forgot-password`,
    {
      email,
    }
  );

  return response.data;
};

export const obtenerPerfilProtegido = async (token) => {
  const response = await axios.get(
    `${BASE_URL}/auth/perfil-protegido`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};