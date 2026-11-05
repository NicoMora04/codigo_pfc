import axios from 'axios';

import BASE_URL
  from '../config/api';


const PUBLIC_URL =
  `${BASE_URL}/public`;


// ======================================================
// LISTAR ORGANIZACIONES PÚBLICAS
// ======================================================

export const listarOrganizacionesPublicas =
  async (
    filtros = {}
  ) => {

    const params = {};


    if (
      filtros.nombre
    ) {

      params.nombre =
        filtros.nombre;

    }


    if (
      filtros.idTipoActividad
    ) {

      params.id_tipo_actividad =
        filtros.idTipoActividad;

    }


    if (
      filtros.ubicacion
    ) {

      params.ubicacion =
        filtros.ubicacion;

    }


    const response =
      await axios.get(
        `${PUBLIC_URL}/organizaciones`,
        {
          params
        }
      );


    return (
      response.data
        ?.organizaciones ||
      []
    );

  };


// ======================================================
// OBTENER PERFIL PÚBLICO POR SLUG
// ======================================================

export const obtenerPerfilPublicoOrganizacion =
  async (
    slug
  ) => {

    const response =
      await axios.get(
        `${PUBLIC_URL}/organizaciones/${encodeURIComponent(
          slug
        )}`
      );


    return (
      response.data
        ?.perfil ||
      null
    );

  };