import axios from 'axios';

import BASE_URL from '../config/api';


// ======================================================
// OBTENER MIS NOTIFICACIONES
// ACTIVIDAD 3.3.1
// ======================================================

export const obtenerMisNotificaciones = async (
  token
) => {

  const response = await axios.get(

    `${BASE_URL}/notificaciones`,

    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

  );

  return response.data;

};


// ======================================================
// CONTAR NOTIFICACIONES NO LEÍDAS
// ======================================================

export const obtenerCantidadNoLeidas = async (
  token
) => {

  const response = await axios.get(

    `${BASE_URL}/notificaciones/no-leidas`,

    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

  );

  return response.data;

};


// ======================================================
// MARCAR NOTIFICACIÓN COMO LEÍDA
// ======================================================

export const marcarNotificacionLeida = async (
  token,
  idNotificacion
) => {

  const response = await axios.patch(

    `${BASE_URL}/notificaciones/${idNotificacion}/leida`,

    {},

    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

  );

  return response.data;

};