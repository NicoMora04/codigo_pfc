// ======================================================
// PRUEBAS DEL PROCESADOR DE NOTIFICACIONES PUSH
// ACTIVIDAD 3.3.1
// ======================================================


// ======================================================
// MOCK DEL REPOSITORIO DE ENVÍOS PUSH
// ======================================================

jest.mock(
  '../src/repositories/envioPushRepository',
  () => ({

    esOportunidadNotificable:
      jest.fn(),

    marcarOmitido:
      jest.fn(),

    registrarError:
      jest.fn(),

    marcarEsperandoRecibo:
      jest.fn(),

    finalizarAgotados:
      jest.fn(),

    reservarPendientes:
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
// MOCK DE EXPO PUSH SERVICE
// ======================================================

jest.mock(
  '../src/services/expoPushService',
  () => ({

    enviarPushADispositivo:
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

const envioPushWorker =
  require('../src/services/envioPushWorker');


// ======================================================
// DATOS BASE DE PRUEBA
// ======================================================

const envioBase = {

  id_envio_push:
    '11111111-1111-4111-8111-111111111111',

  id_notificacion:
    '22222222-2222-4222-8222-222222222222',

  id_oportunidad:
    '33333333-3333-4333-8333-333333333333',

  id_usuario:
    '44444444-4444-4444-8444-444444444444',

  id_usuario_dispositivo:
    '44444444-4444-4444-8444-444444444444',

  token:
    'ExpoPushToken[1234567890abcdef]',

  activo: true,

  titulo:
    'Nueva oportunidad de voluntariado',

  mensaje:
    'Se publicó una oportunidad compatible con tus intereses.',

  tipo:
    'NUEVA_OPORTUNIDAD',

  intentos: 1

};


// ======================================================
// CONFIGURACIÓN GENERAL
// ======================================================

beforeEach(() => {

  jest.clearAllMocks();


  // Por defecto, la oportunidad está disponible.

  envioPushRepository
    .esOportunidadNotificable
    .mockResolvedValue(true);


  envioPushRepository
    .marcarOmitido
    .mockResolvedValue({});


  envioPushRepository
    .registrarError
    .mockResolvedValue({});


  envioPushRepository
    .marcarEsperandoRecibo
    .mockResolvedValue({});


  envioPushRepository
    .finalizarAgotados
    .mockResolvedValue(0);


  envioPushRepository
    .reservarPendientes
    .mockResolvedValue([]);


  tokenDispositivoRepository
    .desactivar
    .mockResolvedValue({});


});


// ======================================================
// PRUEBA 1
// ENVÍO EXITOSO
// ======================================================

test(
  'envía una notificación cuando la oportunidad está disponible',
  async () => {

    expoPushService
      .enviarPushADispositivo
      .mockResolvedValue({

        status: 'ok',

        id: 'ticket-expo-123'

      });


    const resultado =
      await envioPushWorker.procesarEnvio(
        envioBase
      );


    expect(resultado).toBe(
      'ESPERANDO_RECIBO'
    );


    expect(
      envioPushRepository.esOportunidadNotificable
    ).toHaveBeenCalledWith(
      envioBase.id_oportunidad
    );


    expect(
      expoPushService.enviarPushADispositivo
    ).toHaveBeenCalledWith({

      token: envioBase.token,

      titulo: envioBase.titulo,

      mensaje: envioBase.mensaje,

      data: {

        tipo: 'NUEVA_OPORTUNIDAD',

        idNotificacion:
          envioBase.id_notificacion,

        idOportunidad:
          envioBase.id_oportunidad

      }

    });


    expect(
      envioPushRepository.marcarEsperandoRecibo
    ).toHaveBeenCalledWith(

      envioBase.id_envio_push,

      'ticket-expo-123'

    );


    expect(
      envioPushRepository.registrarError
    ).not.toHaveBeenCalled();

  }
);


// ======================================================
// PRUEBA 2
// OPORTUNIDAD NO DISPONIBLE
// ======================================================

test(
  'omite el envío cuando la oportunidad ya no está disponible',
  async () => {

    envioPushRepository
      .esOportunidadNotificable
      .mockResolvedValue(false);


    const resultado =
      await envioPushWorker.procesarEnvio(
        envioBase
      );


    expect(resultado).toBe(
      'OMITIDO'
    );


    expect(
      envioPushRepository.marcarOmitido
    ).toHaveBeenCalledWith(

      envioBase.id_envio_push,

      expect.any(String)

    );


    expect(
      expoPushService.enviarPushADispositivo
    ).not.toHaveBeenCalled();

  }
);


// ======================================================
// PRUEBA 3
// DISPOSITIVO INACTIVO
// ======================================================

test(
  'rechaza el envío a un dispositivo inactivo',
  async () => {

    const envio = {

      ...envioBase,

      activo: false

    };


    const resultado =
      await envioPushWorker.procesarEnvio(
        envio
      );


    expect(resultado).toBe(
      'ERROR_FINAL'
    );


    expect(
      envioPushRepository.registrarError
    ).toHaveBeenCalledWith(

      expect.objectContaining({

        idEnvioPush:
          envioBase.id_envio_push,

        definitivo: true

      })

    );


    expect(
      expoPushService.enviarPushADispositivo
    ).not.toHaveBeenCalled();

  }
);


// ======================================================
// PRUEBA 4
// DISPOSITIVO DE OTRO USUARIO
// ======================================================

test(
  'rechaza un dispositivo asociado a otro usuario',
  async () => {

    const envio = {

      ...envioBase,

      id_usuario_dispositivo:
        '55555555-5555-4555-8555-555555555555'

    };


    const resultado =
      await envioPushWorker.procesarEnvio(
        envio
      );


    expect(resultado).toBe(
      'ERROR_FINAL'
    );


    expect(
      expoPushService.enviarPushADispositivo
    ).not.toHaveBeenCalled();

  }
);


// ======================================================
// PRUEBA 5
// ERROR TEMPORAL DE EXPO
// ======================================================

test(
  'programa un reintento cuando Expo no responde',
  async () => {

    expoPushService
      .enviarPushADispositivo
      .mockRejectedValue(

        new Error(
          'Error de conexión con Expo'
        )

      );


    const resultado =
      await envioPushWorker.procesarEnvio(
        envioBase
      );


    expect(resultado).toBe(
      'REINTENTAR'
    );


    expect(
      envioPushRepository.registrarError
    ).toHaveBeenCalledWith({

      idEnvioPush:
        envioBase.id_envio_push,

      mensaje:
        'Error de conexión con Expo',

      definitivo: false,

      segundosEspera: 60

    });

  }
);


// ======================================================
// PRUEBA 6
// AGOTAMIENTO DE INTENTOS
// ======================================================

test(
  'finaliza el envío cuando se agotan los cinco intentos',
  async () => {

    const envio = {

      ...envioBase,

      intentos: 5

    };


    expoPushService
      .enviarPushADispositivo
      .mockRejectedValue(

        new Error(
          'Expo no disponible'
        )

      );


    const resultado =
      await envioPushWorker.procesarEnvio(
        envio
      );


    expect(resultado).toBe(
      'ERROR_FINAL'
    );


    expect(
      envioPushRepository.registrarError
    ).toHaveBeenCalledWith(

      expect.objectContaining({

        definitivo: true

      })

    );

  }
);


// ======================================================
// PRUEBA 7
// TOKEN NO REGISTRADO
// ======================================================

test(
  'desactiva el token cuando Expo informa DeviceNotRegistered',
  async () => {

    expoPushService
      .enviarPushADispositivo
      .mockResolvedValue({

        status: 'error',

        message:
          'El dispositivo no está registrado',

        details: {

          error:
            'DeviceNotRegistered'

        }

      });


    const resultado =
      await envioPushWorker.procesarEnvio(
        envioBase
      );


    expect(resultado).toBe(
      'ERROR_FINAL'
    );


    expect(
      tokenDispositivoRepository.desactivar
    ).toHaveBeenCalledWith(

      envioBase.id_usuario,

      envioBase.token

    );


    expect(
      envioPushRepository.registrarError
    ).toHaveBeenCalledWith(

      expect.objectContaining({

        definitivo: true

      })

    );

  }
);


// ======================================================
// PRUEBA 8
// LÍMITE DE FRECUENCIA
// ======================================================

test(
  'reintenta cuando Expo devuelve un error de frecuencia',
  async () => {

    const envio = {

      ...envioBase,

      intentos: 2

    };


    expoPushService
      .enviarPushADispositivo
      .mockResolvedValue({

        status: 'error',

        message:
          'Demasiados mensajes',

        details: {

          error:
            'MessageRateExceeded'

        }

      });


    const resultado =
      await envioPushWorker.procesarEnvio(
        envio
      );


    expect(resultado).toBe(
      'REINTENTAR'
    );


    expect(
      envioPushRepository.registrarError
    ).toHaveBeenCalledWith({

      idEnvioPush:
        envioBase.id_envio_push,

      mensaje:
        'Demasiados mensajes',

      definitivo: false,

      segundosEspera: 120

    });

  }
);


// ======================================================
// PRUEBA 9
// COLA VACÍA
// ======================================================

test(
  'procesa correctamente una cola sin envíos pendientes',
  async () => {

    envioPushRepository
      .reservarPendientes
      .mockResolvedValue([]);


    const resultado =
      await envioPushWorker.procesarLote();


    expect(resultado).toEqual({

      total: 0,

      esperandoRecibo: 0,

      reintentar: 0,

      errorFinal: 0,

      omitidos: 0

    });


    expect(
      envioPushRepository.finalizarAgotados
    ).toHaveBeenCalledTimes(1);


    expect(
      envioPushRepository.reservarPendientes
    ).toHaveBeenCalledWith(10);


    expect(
      expoPushService.enviarPushADispositivo
    ).not.toHaveBeenCalled();

  }
);