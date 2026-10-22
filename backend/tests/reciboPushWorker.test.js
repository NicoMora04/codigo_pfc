// ======================================================
// PRUEBAS DEL PROCESADOR DE RECIBOS PUSH
// ACTIVIDAD 3.3.1
// ======================================================


// ======================================================
// MOCK DEL REPOSITORIO DE ENVÍOS
// ======================================================

jest.mock(
  '../src/repositories/envioPushRepository',
  () => ({

    reservarRecibos:
      jest.fn(),

    resolverRecibo:
      jest.fn(),

    finalizarRecibosSinConfirmacion:
      jest.fn()

  })
);


// ======================================================
// MOCK DEL REPOSITORIO DE DISPOSITIVOS
// ======================================================

jest.mock(
  '../src/repositories/tokenDispositivoRepository',
  () => ({

    desactivar:
      jest.fn()

  })
);


// ======================================================
// MOCK DE EXPO
// ======================================================

jest.mock(
  '../src/services/expoPushService',
  () => ({

    consultarRecibos:
      jest.fn()

  })
);


// ======================================================
// IMPORTACIONES
// ======================================================

const envioPushRepository =
  require('../src/repositories/envioPushRepository');

const tokenDispositivoRepository =
  require('../src/repositories/tokenDispositivoRepository');

const expoPushService =
  require('../src/services/expoPushService');

const reciboPushWorker =
  require('../src/services/reciboPushWorker');


// ======================================================
// DATOS DE PRUEBA
// ======================================================

const envioBase = {

  id_envio_push:
    '11111111-1111-4111-8111-111111111111',

  id_usuario:
    '22222222-2222-4222-8222-222222222222',

  token:
    'ExpoPushToken[1234567890abcdef]',

  expo_ticket_id:
    'ticket-expo-123',

  intentos: 1,

  enviado_en:
    '2026-10-22T10:00:00.000Z'

};


// ======================================================
// CONFIGURACIÓN
// ======================================================

beforeEach(() => {

  jest.resetAllMocks();


  envioPushRepository
    .finalizarRecibosSinConfirmacion
    .mockResolvedValue(0);


  envioPushRepository
    .reservarRecibos
    .mockResolvedValue([]);


  envioPushRepository
    .resolverRecibo
    .mockResolvedValue({});


  tokenDispositivoRepository
    .desactivar
    .mockResolvedValue({});


});


// ======================================================
// PRUEBA 1 - COLA VACÍA
// ======================================================

test(
  'procesa correctamente una cola sin recibos pendientes',
  async () => {

    const resultado =
      await reciboPushWorker.procesarRecibos();


    expect(resultado).toEqual({

      total: 0,

      aceptados: 0,

      reintentar: 0,

      errorFinal: 0,

      sinRecibo: 0,

      sinConfirmacion: 0

    });


    expect(
      envioPushRepository.reservarRecibos
    ).toHaveBeenCalledWith(100);


    expect(
      expoPushService.consultarRecibos
    ).not.toHaveBeenCalled();

  }
);


// ======================================================
// PRUEBA 2 - RECIBO EXITOSO
// ======================================================

test(
  'confirma un envío cuando Expo devuelve status ok',
  async () => {

    envioPushRepository
      .reservarRecibos
      .mockResolvedValue([
        envioBase
      ]);


    expoPushService
      .consultarRecibos
      .mockResolvedValue({

        'ticket-expo-123': {

          status: 'ok'

        }

      });


    const resultado =
      await reciboPushWorker.procesarRecibos();


    expect(resultado.aceptados).toBe(1);


    expect(
      expoPushService.consultarRecibos
    ).toHaveBeenCalledWith([
      'ticket-expo-123'
    ]);


    expect(
      envioPushRepository.resolverRecibo
    ).toHaveBeenCalledWith({

      idEnvioPush:
        envioBase.id_envio_push,

      expoTicketId:
        envioBase.expo_ticket_id,

      estado:
        'ACEPTADO_PROVEEDOR'

    });


    expect(
      tokenDispositivoRepository.desactivar
    ).not.toHaveBeenCalled();

  }
);


// ======================================================
// PRUEBA 3 - RECIBO NO DISPONIBLE
// ======================================================

test(
  'mantiene pendiente la consulta si Expo todavía no devuelve el recibo',
  async () => {

    envioPushRepository
      .reservarRecibos
      .mockResolvedValue([
        envioBase
      ]);


    expoPushService
      .consultarRecibos
      .mockResolvedValue({});


    const resultado =
      await reciboPushWorker.procesarRecibos();


    expect(resultado.sinRecibo).toBe(1);


    expect(
      envioPushRepository.resolverRecibo
    ).not.toHaveBeenCalled();


    expect(
      tokenDispositivoRepository.desactivar
    ).not.toHaveBeenCalled();

  }
);


// ======================================================
// PRUEBA 4 - EXPO NO RESPONDE
// ======================================================

test(
  'no modifica el estado del envío si falla la consulta a Expo',
  async () => {

    envioPushRepository
      .reservarRecibos
      .mockResolvedValue([
        envioBase
      ]);


    expoPushService
      .consultarRecibos
      .mockRejectedValue(

        new Error(
          'Expo temporalmente no disponible'
        )

      );


    const resultado =
      await reciboPushWorker.procesarRecibos();


    expect(resultado.total).toBe(1);


    expect(resultado.aceptados).toBe(0);


    expect(
      envioPushRepository.resolverRecibo
    ).not.toHaveBeenCalled();


    expect(
      tokenDispositivoRepository.desactivar
    ).not.toHaveBeenCalled();

  }
);


// ======================================================
// PRUEBA 5 - TOKEN INVÁLIDO
// ======================================================

test(
  'desactiva el dispositivo cuando el recibo indica DeviceNotRegistered',
  async () => {

    envioPushRepository
      .reservarRecibos
      .mockResolvedValue([
        envioBase
      ]);


    expoPushService
      .consultarRecibos
      .mockResolvedValue({

        'ticket-expo-123': {

          status: 'error',

          message:
            'El dispositivo no está registrado',

          details: {

            error:
              'DeviceNotRegistered'

          }

        }

      });


    const resultado =
      await reciboPushWorker.procesarRecibos();


    expect(resultado.errorFinal).toBe(1);


    expect(
      tokenDispositivoRepository.desactivar
    ).toHaveBeenCalledWith(

      envioBase.id_usuario,

      envioBase.token

    );


    expect(
      envioPushRepository.resolverRecibo
    ).toHaveBeenCalledWith(

      expect.objectContaining({

        estado:
          'ERROR_FINAL'

      })

    );

  }
);


// ======================================================
// PRUEBA 6 - ERROR TEMPORAL
// ======================================================

test(
  'programa un reintento ante MessageRateExceeded',
  async () => {

    const envio = {

      ...envioBase,

      intentos: 2

    };


    envioPushRepository
      .reservarRecibos
      .mockResolvedValue([
        envio
      ]);


    expoPushService
      .consultarRecibos
      .mockResolvedValue({

        'ticket-expo-123': {

          status: 'error',

          message:
            'Límite de frecuencia excedido',

          details: {

            error:
              'MessageRateExceeded'

          }

        }

      });


    const resultado =
      await reciboPushWorker.procesarRecibos();


    expect(resultado.reintentar).toBe(1);


    expect(
      envioPushRepository.resolverRecibo
    ).toHaveBeenCalledWith({

      idEnvioPush:
        envioBase.id_envio_push,

      expoTicketId:
        envioBase.expo_ticket_id,

      estado:
        'REINTENTAR',

      mensaje:
        'Límite de frecuencia excedido',

      segundosEspera: 120

    });

  }
);


// ======================================================
// PRUEBA 7 - INTENTOS AGOTADOS
// ======================================================

test(
  'finaliza el envío cuando se agotaron los cinco intentos',
  async () => {

    const envio = {

      ...envioBase,

      intentos: 5

    };


    envioPushRepository
      .reservarRecibos
      .mockResolvedValue([
        envio
      ]);


    expoPushService
      .consultarRecibos
      .mockResolvedValue({

        'ticket-expo-123': {

          status: 'error',

          message:
            'Demasiados mensajes',

          details: {

            error:
              'MessageRateExceeded'

          }

        }

      });


    const resultado =
      await reciboPushWorker.procesarRecibos();


    expect(resultado.errorFinal).toBe(1);


    expect(resultado.reintentar).toBe(0);


    expect(
      envioPushRepository.resolverRecibo
    ).toHaveBeenCalledWith(

      expect.objectContaining({

        estado:
          'ERROR_FINAL'

      })

    );

  }
);


// ======================================================
// PRUEBA 8 - ERROR PERMANENTE
// ======================================================

test(
  'no reintenta automáticamente un error de credenciales',
  async () => {

    envioPushRepository
      .reservarRecibos
      .mockResolvedValue([
        envioBase
      ]);


    expoPushService
      .consultarRecibos
      .mockResolvedValue({

        'ticket-expo-123': {

          status: 'error',

          message:
            'Credenciales inválidas',

          details: {

            error:
              'InvalidCredentials'

          }

        }

      });


    const resultado =
      await reciboPushWorker.procesarRecibos();


    expect(resultado.errorFinal).toBe(1);


    expect(
      envioPushRepository.resolverRecibo
    ).toHaveBeenCalledWith(

      expect.objectContaining({

        estado:
          'ERROR_FINAL',

        mensaje:
          'Credenciales inválidas'

      })

    );


    expect(
      tokenDispositivoRepository.desactivar
    ).not.toHaveBeenCalled();

  }
);


// ======================================================
// PRUEBA 9 - RECIBOS VENCIDOS
// ======================================================

test(
  'registra los recibos que superaron las 24 horas sin confirmación',
  async () => {

    envioPushRepository
      .finalizarRecibosSinConfirmacion
      .mockResolvedValue(2);


    envioPushRepository
      .reservarRecibos
      .mockResolvedValue([]);


    const resultado =
      await reciboPushWorker.procesarRecibos();


    expect(resultado.sinConfirmacion).toBe(2);


    expect(
      envioPushRepository.finalizarRecibosSinConfirmacion
    ).toHaveBeenCalledTimes(1);


    expect(
      expoPushService.consultarRecibos
    ).not.toHaveBeenCalled();

  }
);