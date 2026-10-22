const tokenDispositivoRepository =
  require('../repositories/tokenDispositivoRepository');


// ======================================================
// CONFIGURACIÓN EXPO PUSH SERVICE
// ACTIVIDAD 3.3.1
// ======================================================

const EXPO_PUSH_URL =
  'https://exp.host/--/api/v2/push/send';

const TAMANIO_LOTE = 100;


// ======================================================
// ENVIAR NOTIFICACIONES A UN USUARIO
// ======================================================

const enviarPushAUsuario = async ({
  idUsuario,
  titulo,
  mensaje,
  data = {}
}) => {

  // 1. Obtener dispositivos activos del usuario

  const dispositivos =
    await tokenDispositivoRepository
      .obtenerActivosPorUsuario(idUsuario);


  if (dispositivos.length === 0) {

    return {
      dispositivos: 0,
      aceptados: 0,
      rechazados: 0,
      idsRecibos: []
    };

  }


  // 2. Construir mensajes para Expo

  const mensajes = dispositivos.map(
    (dispositivo) => ({

      to: dispositivo.token,

      title: titulo,

      body: mensaje,

      channelId: 'default',

      priority: 'high',

      data

    })
  );


  let aceptados = 0;
  let rechazados = 0;

  const idsRecibos = [];


  // 3. Enviar en lotes de hasta 100 mensajes

  for (
    let inicio = 0;
    inicio < mensajes.length;
    inicio += TAMANIO_LOTE
  ) {

    const lote =
      mensajes.slice(
        inicio,
        inicio + TAMANIO_LOTE
      );


    // 4. Enviar solicitud HTTPS a Expo

    const response = await fetch(
      EXPO_PUSH_URL,
      {

        method: 'POST',

        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(lote),

        signal: AbortSignal.timeout(15000)

      }
    );


    // 5. Interpretar respuesta

    const resultado = await response.json();


    if (
      !response.ok ||
      resultado.errors?.length
    ) {

      throw new Error(
        `Error al comunicarse con Expo Push Service (HTTP ${response.status})`
      );

    }


    const tickets =
      Array.isArray(resultado.data)
        ? resultado.data
        : [resultado.data];


    if (tickets.length !== lote.length) {

      throw new Error(
        'Expo devolvió una cantidad inesperada de tickets'
      );

    }


    // 6. Procesar tickets individuales

    for (let i = 0; i < tickets.length; i++) {

      const ticket = tickets[i];

      const dispositivo =
        dispositivos[inicio + i];


      if (
        ticket?.status === 'ok' &&
        ticket.id
      ) {

        aceptados++;

        idsRecibos.push(ticket.id);

      }
      else {

        rechazados++;

        const codigoError =
          ticket?.details?.error;


        console.warn(
          'Expo rechazó una notificación:',
          codigoError || ticket?.status
        );


        // Desactivar dispositivos inválidos

        if (codigoError === 'DeviceNotRegistered') {

          await tokenDispositivoRepository
            .desactivar(
              idUsuario,
              dispositivo.token
            );

        }

      }

    }

  }


  // 7. Devolver resumen del envío

  return {

    dispositivos: dispositivos.length,

    aceptados,

    rechazados,

    idsRecibos

  };

};

// ======================================================
// CONSULTAR RESULTADOS DE ENTREGA PUSH
// ACTIVIDAD 3.3.1
// ======================================================

const consultarRecibos = async (idsRecibos) => {

  // Validar identificadores

  if (
    !Array.isArray(idsRecibos) ||
    idsRecibos.length === 0 ||
    idsRecibos.length > 1000 ||
    !idsRecibos.every(
      id => typeof id === 'string' && id.length > 0
    )
  ) {

    throw new Error(
      'La lista de identificadores de recibos no es válida'
    );

  }


  // Endpoint de recibos de Expo

  const url =
    'https://exp.host/--/api/v2/push/getReceipts';


  // Consultar resultados

  const response = await fetch(
    url,
    {

      method: 'POST',

      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        ids: idsRecibos
      }),

      signal: AbortSignal.timeout(15000)

    }
  );


  const resultado = await response.json();


  // Verificar errores generales

  if (
    !response.ok ||
    resultado.errors?.length
  ) {

    throw new Error(
      'No se pudieron consultar los recibos de Expo: ' +
      JSON.stringify(resultado.errors || resultado)
    );

  }


  // Devolver resultados individuales

  return resultado.data || {};

};


// ======================================================
// ENVIAR PUSH A UN DISPOSITIVO ESPECÍFICO
// ACTIVIDAD 3.3.1
// ======================================================

const enviarPushADispositivo = async ({
  token,
  titulo,
  mensaje,
  data = {}
}) => {

  const response = await fetch(
    'https://exp.host/--/api/v2/push/send',
    {

      method: 'POST',

      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({

        to: token,

        title: titulo,

        body: mensaje,

        channelId: 'default',

        priority: 'high',

        data

      }),

      signal: AbortSignal.timeout(15000)

    }
  );


  const resultado = await response.json();


  if (
    !response.ok ||
    resultado.errors?.length
  ) {

    const error = new Error(
      'Expo rechazó la solicitud de envío: ' +
      JSON.stringify(resultado.errors || resultado)
    );

    error.httpStatus = response.status;

    throw error;

  }


  const ticket =
    Array.isArray(resultado.data)
      ? resultado.data[0]
      : resultado.data;


  if (!ticket) {

    throw new Error(
      'Expo no devolvió un ticket de envío'
    );

  }


  return ticket;

};
// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {
  enviarPushAUsuario,
  consultarRecibos,
  enviarPushADispositivo
};