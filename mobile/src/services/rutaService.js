import axios from 'axios';

const ORS_BASE_URL =
  'https://api.heigit.org/openrouteservice/v2';

const ORS_API_KEY =
  process.env.EXPO_PUBLIC_ORS_API_KEY;


export const obtenerRuta = async (
  origen,
  destino,
  perfil = 'driving-car'
) => {

  if (
    !origen ||
    !destino
  ) {
    throw new Error(
      'Origen y destino son obligatorios.'
    );
  }


  const origenLat =
    Number(origen.latitud);

  const origenLon =
    Number(origen.longitud);

  const destinoLat =
    Number(destino.latitud);

  const destinoLon =
    Number(destino.longitud);


  if (
    !Number.isFinite(origenLat) ||
    !Number.isFinite(origenLon) ||
    !Number.isFinite(destinoLat) ||
    !Number.isFinite(destinoLon)
  ) {

    throw new Error(
      'Las coordenadas de la ruta no son válidas.'
    );

  }


  if (!ORS_API_KEY) {

    throw new Error(
      'No se configuró la API key de openrouteservice.'
    );

  }


  try {

    const response =
      await axios.post(
        `${ORS_BASE_URL}/directions/${perfil}/geojson`,
        {
          coordinates: [
            [
              origenLon,
              origenLat
            ],
            [
              destinoLon,
              destinoLat
            ]
          ]
        },
        {
          headers: {
            Authorization:
              ORS_API_KEY,

            'Content-Type':
              'application/json',
          },

          timeout: 10000,
        }
      );


    const feature =
      response.data?.features?.[0];

    if (!feature) {

      throw new Error(
        'No se encontró una ruta disponible.'
      );

    }


    const resumen =
      feature.properties?.summary;


    if (!resumen) {

      throw new Error(
        'La respuesta de ruta no contiene información suficiente.'
      );

    }


    return {

      distanciaKm:
        resumen.distance / 1000,

      duracionMin:
        resumen.duration / 60,

      coordenadas:
        feature.geometry?.coordinates ??
        [],

    };

  } catch (error) {

    if (
      error.code === 'ECONNABORTED'
    ) {

      throw new Error(
        'El servicio de rutas tardó demasiado en responder.'
      );

    }


    if (
      error.response?.status === 401 ||
      error.response?.status === 403
    ) {

      throw new Error(
        'No se pudo autenticar con el servicio de rutas.'
      );

    }


    if (
      error.response?.status === 429
    ) {

      throw new Error(
        'Se alcanzó temporalmente el límite de consultas del servicio de rutas.'
      );

    }


    if (error.response) {

      throw new Error(
        'El servicio de rutas no pudo calcular el recorrido.'
      );

    }


    if (error.request) {

      throw new Error(
        'No fue posible conectarse con el servicio de rutas.'
      );

    }


    throw error;

  }

};