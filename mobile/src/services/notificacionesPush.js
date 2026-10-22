import axios from 'axios';

import { Platform } from 'react-native';

import * as Notifications from 'expo-notifications';

import * as Device from 'expo-device';

import * as SecureStore from 'expo-secure-store';

import Constants from 'expo-constants';

import BASE_URL from '../config/api';



// ======================================================
// ALMACENAMIENTO LOCAL DEL TOKEN PUSH
// ======================================================

const PUSH_TOKEN_KEY = 'expo_push_token_registrado';
// ======================================================
// CONFIGURACIÓN DE NOTIFICACIONES
// ACTIVIDAD 3.3.1
// ======================================================

// Mostrar notificaciones incluso cuando la aplicación
// se encuentre abierta.

Notifications.setNotificationHandler({

  handleNotification: async () => ({

    shouldShowBanner: true,

    shouldShowList: true,

    shouldPlaySound: true,

    shouldSetBadge: false

  })

});


// ======================================================
// CONFIGURAR CANAL DE NOTIFICACIONES ANDROID
// ======================================================

const configurarCanalAndroid = async () => {

  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(
    'default',
    {

      name: 'Notificaciones de voluntariado',

      importance:
        Notifications.AndroidImportance.MAX,

      vibrationPattern: [0, 250, 250, 250],

      lightColor: '#1F6F5C'

    }
  );

};


// ======================================================
// OBTENER EXPO PUSH TOKEN
// ======================================================

const obtenerExpoPushToken = async () => {

  // 1. Verificar dispositivo físico

  if (!Device.isDevice) {

    console.warn(
      'Las pruebas actuales requieren un dispositivo físico'
    );

    return null;

  }


  // 2. Configurar canal Android

  await configurarCanalAndroid();


  // 3. Consultar permisos existentes

  const permisosActuales =
    await Notifications.getPermissionsAsync();

  let permisoConcedido =
    permisosActuales.granted;


  // 4. Solicitar permiso cuando sea necesario

  if (!permisoConcedido) {

    const nuevosPermisos =
      await Notifications.requestPermissionsAsync();

    permisoConcedido =
      nuevosPermisos.granted;

  }


  // 5. Verificar autorización

  if (!permisoConcedido) {

    console.log(
      'El usuario no autorizó las notificaciones'
    );

    return null;

  }


  // 6. Obtener identificador del proyecto Expo

  const projectId =

    Constants.expoConfig?.extra?.eas?.projectId ||

    Constants.easConfig?.projectId;


  if (!projectId) {

    throw new Error(
      'No se encontró el identificador del proyecto Expo'
    );

  }


  // 7. Obtener Expo Push Token

  const resultado =
    await Notifications.getExpoPushTokenAsync({

      projectId

    });


  return resultado.data;

};


// ======================================================
// REGISTRAR DISPOSITIVO EN BACKEND
// ======================================================

export const registrarDispositivoPush = async (
  jwt
) => {

  // 1. Obtener token del dispositivo

  const expoPushToken =
    await obtenerExpoPushToken();


  // Si el usuario rechazó los permisos,
  // la aplicación puede seguir funcionando.

  if (!expoPushToken) {

    return null;

  }


  // 2. Registrar token en PostgreSQL mediante API

  const response = await axios.post(

    `${BASE_URL}/notificaciones/dispositivos`,

    {

      token: expoPushToken,

      plataforma: Platform.OS.toUpperCase()

    },

    {

      headers: {

        Authorization: `Bearer ${jwt}`

      }

    }

  );

  // ======================================================
// GUARDAR TOKEN REGISTRADO LOCALMENTE
// ======================================================

await SecureStore.setItemAsync(
  PUSH_TOKEN_KEY,
  expoPushToken
);

  


  return response.data;

};


// ======================================================
// DESACTIVAR DISPOSITIVO AL CERRAR SESIÓN
// ACTIVIDAD 3.3.1
// ======================================================

export const desactivarDispositivoPush = async (
  jwt
) => {

  // 1. Recuperar token registrado

  const expoPushToken =
    await SecureStore.getItemAsync(
      PUSH_TOKEN_KEY
    );


  // 2. Verificar que exista

  if (!expoPushToken) {

    console.log(
      'No hay dispositivo push registrado para desactivar'
    );

    return false;

  }


  // 3. Solicitar desactivación al backend

  await axios.delete(

    `${BASE_URL}/notificaciones/dispositivos`,

    {

      headers: {

        Authorization: `Bearer ${jwt}`

      },

      data: {

        token: expoPushToken

      }

    }

  );


  // 4. Eliminar token almacenado localmente

  await SecureStore.deleteItemAsync(
    PUSH_TOKEN_KEY
  );


 


  return true;

};