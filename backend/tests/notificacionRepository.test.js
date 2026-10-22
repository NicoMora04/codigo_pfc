// ======================================================
// PRUEBAS DEL REPOSITORIO DE NOTIFICACIONES
// ACTIVIDAD 3.3.1
// ======================================================


// ======================================================
// MOCK DE POSTGRESQL
// ======================================================

jest.mock(
  '../src/config/db',
  () => ({
    query: jest.fn()
  })
);


// ======================================================
// IMPORTACIONES
// ======================================================

const pool =
  require('../src/config/db');

const notificacionRepository =
  require('../src/repositories/notificacionRepository');


// ======================================================
// DATOS DE PRUEBA
// ======================================================

const idUsuario1 =
  '11111111-1111-4111-8111-111111111111';

const idUsuario2 =
  '22222222-2222-4222-8222-222222222222';

const idNotificacion =
  '33333333-3333-4333-8333-333333333333';


// ======================================================
// CONFIGURACIÓN
// ======================================================

beforeEach(() => {

  jest.clearAllMocks();

});


// ======================================================
// PRUEBA 1 - LISTAR NOTIFICACIONES PROPIAS
// ======================================================

test(
  'lista notificaciones filtrando por el usuario autenticado',
  async () => {

    const notificaciones = [
      {
        id_notificacion: idNotificacion,
        titulo: 'Nueva oportunidad',
        leida_en: null
      }
    ];


    pool.query.mockResolvedValue({
      rows: notificaciones
    });


    const resultado =
      await notificacionRepository.listarPorUsuario(
        idUsuario1,
        30,
        0
      );


    expect(resultado).toEqual(
      notificaciones
    );


    expect(
      pool.query
    ).toHaveBeenCalledWith(

      expect.any(String),

      [
        idUsuario1,
        30,
        0
      ]

    );


    const consulta =
      pool.query.mock.calls[0][0];


    expect(consulta).toMatch(
      /id_usuario\s*=\s*\$1/i
    );

  }
);


// ======================================================
// PRUEBA 2 - PAGINACIÓN
// ======================================================

test(
  'aplica correctamente límite y desplazamiento',
  async () => {

    pool.query.mockResolvedValue({
      rows: []
    });


    await notificacionRepository.listarPorUsuario(
      idUsuario1,
      10,
      20
    );


    expect(
      pool.query
    ).toHaveBeenCalledWith(

      expect.any(String),

      [
        idUsuario1,
        10,
        20
      ]

    );


    const consulta =
      pool.query.mock.calls[0][0];


    expect(consulta).toMatch(
      /LIMIT\s+\$2/i
    );


    expect(consulta).toMatch(
      /OFFSET\s+\$3/i
    );

  }
);


// ======================================================
// PRUEBA 3 - MARCAR NOTIFICACIÓN PROPIA
// ======================================================

test(
  'marca como leída una notificación del usuario',
  async () => {

    const notificacionActualizada = {

      id_notificacion:
        idNotificacion,

      id_usuario:
        idUsuario1,

      leida_en:
        '2026-10-22T12:00:00.000Z'

    };


    pool.query.mockResolvedValue({

      rows: [
        notificacionActualizada
      ]

    });


    const resultado =
      await notificacionRepository.marcarComoLeida(
        idNotificacion,
        idUsuario1
      );


    expect(resultado).toEqual(
      notificacionActualizada
    );


    expect(
      pool.query
    ).toHaveBeenCalledWith(

      expect.any(String),

      [
        idNotificacion,
        idUsuario1
      ]

    );


    const consulta =
      pool.query.mock.calls[0][0];


    expect(consulta).toMatch(
      /UPDATE\s+notificacion/i
    );


    expect(consulta).toMatch(
      /id_notificacion\s*=\s*\$1/i
    );


    expect(consulta).toMatch(
      /id_usuario\s*=\s*\$2/i
    );

  }
);


// ======================================================
// PRUEBA 4 - NOTIFICACIÓN AJENA
// ======================================================

test(
  'no modifica notificaciones de otro usuario',
  async () => {

    // PostgreSQL simula que no encontró
    // una notificación que coincida con
    // el identificador y el usuario.

    pool.query.mockResolvedValue({
      rows: []
    });


    const resultado =
      await notificacionRepository.marcarComoLeida(
        idNotificacion,
        idUsuario2
      );


    expect(resultado).toBeNull();


    expect(
      pool.query
    ).toHaveBeenCalledWith(

      expect.any(String),

      [
        idNotificacion,
        idUsuario2
      ]

    );


    const consulta =
      pool.query.mock.calls[0][0];


    expect(consulta).toMatch(
      /id_usuario\s*=\s*\$2/i
    );

  }
);


// ======================================================
// PRUEBA 5 - EVITAR MODIFICAR FECHA DE LECTURA
// ======================================================

test(
  'conserva la fecha original si la notificación ya estaba leída',
  async () => {

    pool.query.mockResolvedValue({

      rows: [
        {
          id_notificacion:
            idNotificacion,

          id_usuario:
            idUsuario1,

          leida_en:
            '2026-10-21T10:00:00.000Z'
        }
      ]

    });


    await notificacionRepository.marcarComoLeida(
      idNotificacion,
      idUsuario1
    );


    const consulta =
      pool.query.mock.calls[0][0];


    // COALESCE impide reemplazar
    // una fecha de lectura existente.

    expect(consulta).toMatch(
      /COALESCE\s*\(\s*leida_en\s*,\s*NOW\(\s*\)\s*\)/i
    );

  }
);


// ======================================================
// PRUEBA 6 - CONTAR NOTIFICACIONES NO LEÍDAS
// ======================================================

test(
  'cuenta únicamente las notificaciones no leídas del usuario',
  async () => {

    pool.query.mockResolvedValue({

      rows: [
        {
          cantidad: 3
        }
      ]

    });


    const resultado =
      await notificacionRepository.contarNoLeidas(
        idUsuario1
      );


    expect(resultado).toBe(3);


    expect(
      pool.query
    ).toHaveBeenCalledWith(

      expect.any(String),

      [
        idUsuario1
      ]

    );


    const consulta =
      pool.query.mock.calls[0][0];


    expect(consulta).toMatch(
      /COUNT\s*\(\s*\*\s*\)/i
    );


    expect(consulta).toMatch(
      /id_usuario\s*=\s*\$1/i
    );


    expect(consulta).toMatch(
      /leida_en\s+IS\s+NULL/i
    );

  }
);