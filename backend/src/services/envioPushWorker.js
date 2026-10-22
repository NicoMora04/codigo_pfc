// ======================================================
// PROCESADOR DE ENVÍOS PUSH
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

const MAX_INTENTOS = 5;

const TAMANIO_LOTE = 10;


// ======================================================
// PROCESAR UN ENVÍO
// ======================================================

const procesarEnvio = async (envio) => {

  const {
    id_envio_push,
    id_usuario,
    id_usuario_dispositivo,
    token,
    activo,
    titulo,
    mensaje,
    tipo,
    id_notificacion,
    id_oportunidad,
    intentos
  } = envio;


  // ==================================================
  // 1. VERIFICAR DESTINATARIO
  // ==================================================

  if (
    !activo ||
    id_usuario !== id_usuario_dispositivo
  ) {

    await envioPushRepository.registrarError({

      idEnvioPush: id_envio_push,

      mensaje:
        'Dispositivo inactivo o asociado a otro usuario',

      definitivo: true

    });

    return 'ERROR_FINAL';

  }


  try {

    // ======================================================
// VERIFICAR QUE LA OPORTUNIDAD SIGA DISPONIBLE
// ACTIVIDAD 3.3.1
// ======================================================

if (tipo === 'NUEVA_OPORTUNIDAD') {

  const notificable =
    id_oportunidad
      ? await envioPushRepository
          .esOportunidadNotificable(
            id_oportunidad
          )
      : false;


  // Si la oportunidad ya no está disponible,
  // omitimos el envío push.

  if (!notificable) {

    const motivo =
      'Oportunidad no disponible: cerrada, cancelada, ' +
      'finalizada, vencida, eliminada o sin cupos';


    await envioPushRepository.marcarOmitido(
      id_envio_push,
      motivo
    );


    console.log(
      '[PUSH] Envío omitido por oportunidad no disponible:',
      id_envio_push
    );


    return 'OMITIDO';

  }

}

    // ==================================================
    // 2. ENVIAR A EXPO
    // ==================================================

    const ticket =
      await expoPushService.enviarPushADispositivo({

        token,

        titulo,

        mensaje,

        data: {

          tipo,

          idNotificacion: id_notificacion,

          idOportunidad: id_oportunidad

        }

      });


    // ==================================================
    // 3. PROCESAR TICKET EXITOSO
    // ==================================================

    if (
      ticket.status === 'ok' &&
      ticket.id
    ) {

      await envioPushRepository.marcarEsperandoRecibo(
        id_envio_push,
        ticket.id
      );

      console.log(
        'Push aceptado por Expo:',
        id_envio_push
      );

      return 'ESPERANDO_RECIBO';

    }


    // ==================================================
    // 4. PROCESAR RECHAZO DE EXPO
    // ==================================================

    const codigoError =
      ticket.details?.error;

    const mensajeError =
      ticket.message ||
      codigoError ||
      'Expo rechazó el envío';


    // Errores que no se solucionan reintentando
    // el mismo mensaje con las mismas condiciones.

    const errorPermanente = [
      'DeviceNotRegistered',
      'MessageTooBig',
      'InvalidCredentials'
    ].includes(codigoError);


    // Desactivar tokens inválidos

    if (codigoError === 'DeviceNotRegistered') {

      await tokenDispositivoRepository.desactivar(
        id_usuario,
        token
      );

    }


    // Calcular reintento

    const definitivo =
      errorPermanente ||
      intentos >= MAX_INTENTOS;


    const segundosEspera = Math.min(
      60 * (2 ** (intentos - 1)),
      3600
    );


    await envioPushRepository.registrarError({

      idEnvioPush: id_envio_push,

      mensaje: mensajeError,

      definitivo,

      segundosEspera

    });


    return definitivo
      ? 'ERROR_FINAL'
      : 'REINTENTAR';

  }
  catch (error) {

    // ==================================================
    // 5. ERROR DE RED O SERVICIO EXTERNO
    // ==================================================

    const esErrorCliente =
      error.httpStatus >= 400 &&
      error.httpStatus < 500 &&
      error.httpStatus !== 429;

    const definitivo =
      esErrorCliente ||
      intentos >= MAX_INTENTOS;


    const segundosEspera = Math.min(
      60 * (2 ** (intentos - 1)),
      3600
    );


    await envioPushRepository.registrarError({

      idEnvioPush: id_envio_push,

      mensaje: error.message,

      definitivo,

      segundosEspera

    });


    console.error(
      'Error en envío push:',
      id_envio_push,
      error.message
    );


    return definitivo
      ? 'ERROR_FINAL'
      : 'REINTENTAR';

  }

};


// ======================================================
// PROCESAR UN LOTE
// ======================================================

const procesarLote = async () => {

  // 1. Finalizar reservas agotadas

  await envioPushRepository.finalizarAgotados();


  // 2. Reservar trabajos pendientes

  const envios =
    await envioPushRepository.reservarPendientes(
      TAMANIO_LOTE
    );


  if (envios.length > 0) {

  console.log(
    '[PUSH] Envíos pendientes seleccionados:',
    envios.length
  );

}


  const resultados = {

    total: envios.length,

    esperandoRecibo: 0,

    reintentar: 0,

    errorFinal: 0,
    omitidos:0

  };


  // 3. Procesar trabajos individualmente

  for (const envio of envios) {

    try {

      const resultado =
        await procesarEnvio(envio);


      if (resultado === 'ESPERANDO_RECIBO') {
        resultados.esperandoRecibo++;
      }
      else if (resultado === 'REINTENTAR') {
        resultados.reintentar++;
      } else if (resultado === 'OMITIDO') {

        resultados.omitidos++;

        }
      else {
        resultados.errorFinal++;
      }

    }
    catch (error) {

      console.error(
        'No se pudo completar el procesamiento:',
        envio.id_envio_push,
        error.message
      );

      // El bloqueo tiene vencimiento.
      // Si falla la actualización de PostgreSQL,
      // podrá recuperarse en otra ejecución.

    }

  }


  return resultados;

};


// ======================================================
// EXPORTACIONES
// ======================================================

module.exports = {

  procesarEnvio,

  procesarLote

};