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

export const obtenerMiOrganizacion =
  async (
    token
  ) => {

    const response =
      await axios.get(

        `${BASE_URL}/auth/mi-organizacion`,

        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }

      );


    return response.data;

  };

  // ======================================================
// ACTUALIZAR DESCRIPCIÓN INSTITUCIONAL
// ACTIVIDAD 3.5.1
// ======================================================

export const actualizarDescripcionInstitucional =
  async (
    token,
    descripcion
  ) => {

    const response =
      await axios.patch(

        `${BASE_URL}/organizaciones/mi-organizacion/descripcion`,

        {
          descripcion
        },

        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }

      );

    return response.data;

  };

  // ======================================================
// ACTUALIZAR TIPOS DE ACTIVIDAD INSTITUCIONALES
// ACTIVIDAD 3.5.1
// ======================================================

export const actualizarTiposActividadInstitucional =
  async (
    token,
    idsTiposActividad
  ) => {

    const response =
      await axios.patch(

        `${BASE_URL}/organizaciones/mi-organizacion/tipos-actividad`,

        {
          idsTiposActividad
        },

        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }

      );

    return response.data;

  };
  // ======================================================
// ACTUALIZAR UBICACIÓN INSTITUCIONAL
// ACTIVIDAD 3.5.1
// ======================================================

export const actualizarUbicacionInstitucional =
  async (
    token,
    ubicacion
  ) => {

    const response =
      await axios.patch(

        `${BASE_URL}/organizaciones/mi-organizacion/ubicacion`,

        {
          latitud: ubicacion.latitud,
          longitud: ubicacion.longitud,
          direccion: ubicacion.direccion,
          localidad: ubicacion.localidad,
          provincia: ubicacion.provincia
        },

        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }

      );

    return response.data;

  };

  // ======================================================
// OBTENER MI PERFIL DE VOLUNTARIO
// ACTIVIDAD 3.2.1
// ======================================================

export const obtenerMiVoluntario = async (token) => {

  const response = await axios.get(
    `${BASE_URL}/auth/mi-voluntario`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;

};