// ======================================================
// PROCESADOR DE RECIBOS PUSH
// ACTIVIDAD 3.3.1
// ======================================================

const envioPushRepository =
  require('../repositories/envioPushRepository');

const tokenDispositivoRepository =
  require('../repositories/tokenDispositivoRepository');

const expoPushService =
  require('./expoPushService');


// ======================================================
// CONFIGURACIÓN
// ======================================================

const TAMANIO_LOTE = 100;

const MAX_INTENTOS = 5;


// ======================================================
// PROCESAR RECIBOS PENDIENTES
// ======================================================

const procesarRecibos = async () => {

  // 1. Finalizar envíos sin confirmación
  // después de 24 horas.

  const sinConfirmacion =
    await envioPushRepository
      .finalizarRecibosSinConfirmacion();


  // 2. Reservar recibos pendientes

  const envios =
    await envioPushRepository
      .reservarRecibos(TAMANIO_LOTE);


  const resultados = {

    total: envios.length,

    aceptados: 0,

    reintentar: 0,

    errorFinal: 0,

    sinRecibo: 0,

    sinConfirmacion

  };


  if (envios.length === 0) {

    return resultados;

  }


  // 3. Obtener identificadores de tickets

  const idsRecibos = envios.map(
    envio => envio.expo_ticket_id
  );


  // 4. Consultar Expo

  let recibos;

  try {

    recibos =
      await expoPushService.consultarRecibos(
        idsRecibos
      );

  }
  catch (error) {

    console.error(
      'No se pudieron consultar los recibos:',
      error.message
    );

    // No reenviamos las notificaciones.
    // Los recibos podrán consultarse en otra
    // ejecución del procesador.

    return resultados;

  }


  // 5. Procesar cada recibo

  for (const envio of envios) {

    const recibo =
      recibos[envio.expo_ticket_id];


    // ==================================================
    // RECIBO TODAVÍA NO DISPONIBLE
    // ==================================================

    if (!recibo) {

      resultados.sinRecibo++;

      continue;

    }


    try {

      // ==================================================
      // ENTREGA ACEPTADA POR EL PROVEEDOR
      // ==================================================

      if (recibo.status === 'ok') {

        await envioPushRepository.resolverRecibo({

          idEnvioPush:
            envio.id_envio_push,

          expoTicketId:
            envio.expo_ticket_id,

          estado:
            'ACEPTADO_PROVEEDOR'

        });


        resultados.aceptados++;

        continue;

      }


      // ==================================================
      // ERROR DE ENTREGA
      // ==================================================

      if (recibo.status === 'error') {

        const codigoError =
          recibo.details?.error || 'ERROR_DESCONOCIDO';

        const mensajeError =
          recibo.message || codigoError;


        // Desactivar dispositivos inválidos

        if (codigoError === 'DeviceNotRegistered') {

          await tokenDispositivoRepository.desactivar(
            envio.id_usuario,
            envio.token
          );

        }


        // MessageRateExceeded es un error temporal.
        // No reintentamos automáticamente errores de
        // credenciales ni mensajes inválidos.

        const esTemporal =
          codigoError === 'MessageRateExceeded';


        const reintentar =
          esTemporal &&
          envio.intentos < MAX_INTENTOS;


        const segundosEspera =
          Math.min(
            60 * (2 ** (envio.intentos - 1)),
            3600
          );


        await envioPushRepository.resolverRecibo({

          idEnvioPush:
            envio.id_envio_push,

          expoTicketId:
            envio.expo_ticket_id,

          estado:
            reintentar
              ? 'REINTENTAR'
              : 'ERROR_FINAL',

          mensaje:
            mensajeError,

          segundosEspera

        });


        if (reintentar) {

          resultados.reintentar++;

        }
        else {

          resultados.errorFinal++;

        }

      }
      else {

        // No conocemos el estado devuelto.
        // Se volverá a consultar posteriormente.

        resultados.sinRecibo++;

        console.warn(
          'Estado de recibo desconocido:',
          recibo.status
        );

      }

    }
    catch (error) {

      console.error(
        'Error al procesar recibo:',
        envio.expo_ticket_id,
        error.message
      );

      // La reserva tiene vencimiento.
      // El registro podrá recuperarse.

    }

  }


  return resultados;

};


// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {

  procesarRecibos

};