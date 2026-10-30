import axios from 'axios';

import BASE_URL
  from '../config/api';


// ======================================================
// OBTENER PERFIL PÚBLICO PROPIO
// ACTIVIDAD 3.6.1
// ======================================================

export const obtenerMiPerfilPublico =
  async (
    token
  ) => {

    const response =
      await axios.get(

        `${BASE_URL}/organizaciones/mi-perfil`,

        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }

      );


    return response.data;

  };