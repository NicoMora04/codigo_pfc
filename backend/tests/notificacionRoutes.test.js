// ======================================================
// PRUEBAS DE RUTAS DE NOTIFICACIONES
// ACTIVIDAD 3.3.1
// ======================================================

process.env.JWT_SECRET = 'test-secret-notificaciones';

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');


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
// MOCK DEL REPOSITORIO DE NOTIFICACIONES
// ======================================================

jest.mock(
  '../src/repositories/notificacionRepository',
  () => ({

    listarPorUsuario:
      jest.fn(),

    marcarComoLeida:
      jest.fn(),

    contarNoLeidas:
      jest.fn()

  })
);


// ======================================================
// IMPORTACIONES
// ======================================================

const pool =
  require('../src/config/db');

const notificacionRepository =
  require('../src/repositories/notificacionRepository');

const notificacionRoutes =
  require('../src/routes/notificacionRoutes');


// ======================================================
// CREAR APLICACIÓN DE PRUEBAS
// ======================================================

// No iniciamos el servidor real ni los workers.
// Probamos solamente las rutas de notificaciones.

const app = express();

app.use(express.json());

app.use(
  '/api/notificaciones',
  notificacionRoutes
);


// ======================================================
// USUARIOS DE PRUEBA
// ======================================================

const idVoluntario1 =
  '11111111-1111-4111-8111-111111111111';

const idVoluntario2 =
  '22222222-2222-4222-8222-222222222222';

const idNotificacion =
  '33333333-3333-4333-8333-333333333333';


// ======================================================
// GENERAR JWT DE PRUEBA
// ======================================================

const tokenVoluntario1 = jwt.sign(
  {
    id: idVoluntario1,
    rol: 'VOLUNTARIO'
  },
  process.env.JWT_SECRET,
  {
    expiresIn: '1h'
  }
);


const tokenVoluntario2 = jwt.sign(
  {
    id: idVoluntario2,
    rol: 'VOLUNTARIO'
  },
  process.env.JWT_SECRET,
  {
    expiresIn: '1h'
  }
);


// ======================================================
// CONFIGURACIÓN GENERAL
// ======================================================

beforeEach(() => {

  jest.clearAllMocks();


  // Simular una cuenta activa.

  pool.query.mockResolvedValue({

    rows: [
      {
        estado_cuenta: 'ACTIVA'
      }
    ]

  });


  // Historial simulado.

  notificacionRepository
    .listarPorUsuario
    .mockResolvedValue([
      {
        id_notificacion: idNotificacion,
        titulo: 'Nueva oportunidad',
        mensaje: 'Se publicó una oportunidad.',
        tipo: 'NUEVA_OPORTUNIDAD',
        leida_en: null
      }
    ]);


  // Contador simulado.

  notificacionRepository
    .contarNoLeidas
    .mockResolvedValue(1);


  // Marcado como leída simulado.

  notificacionRepository
    .marcarComoLeida
    .mockResolvedValue({
      id_notificacion: idNotificacion,
      id_usuario: idVoluntario1,
      leida_en: '2026-10-22T12:00:00.000Z'
    });

});


// ======================================================
// PRUEBA 1 - SIN JWT
// ======================================================

test(
  'rechaza consultar notificaciones sin autenticación',
  async () => {

    const response =
      await request(app)
        .get('/api/notificaciones');


    expect(response.status).toBe(401);


    expect(
      notificacionRepository.listarPorUsuario
    ).not.toHaveBeenCalled();

  }
);


// ======================================================
// PRUEBA 2 - JWT INVÁLIDO
// ======================================================

test(
  'rechaza un token JWT inválido',
  async () => {

    const response =
      await request(app)
        .get('/api/notificaciones')
        .set(
          'Authorization',
          'Bearer token-invalido'
        );


    expect(response.status).toBe(401);


    expect(
      notificacionRepository.listarPorUsuario
    ).not.toHaveBeenCalled();

  }
);


// ======================================================
// PRUEBA 3 - CUENTA INACTIVA
// ======================================================

test(
  'rechaza a un usuario cuya cuenta no está activa',
  async () => {

    pool.query.mockResolvedValue({

      rows: [
        {
          estado_cuenta: 'BLOQUEADA'
        }
      ]

    });


    const response =
      await request(app)
        .get('/api/notificaciones')
        .set(
          'Authorization',
          `Bearer ${tokenVoluntario1}`
        );


    expect(response.status).toBe(403);


    expect(
      notificacionRepository.listarPorUsuario
    ).not.toHaveBeenCalled();

  }
);


// ======================================================
// PRUEBA 4 - CONSULTAR NOTIFICACIONES PROPIAS
// ======================================================

test(
  'consulta las notificaciones del usuario autenticado',
  async () => {

    const response =
      await request(app)
        .get('/api/notificaciones')
        .set(
          'Authorization',
          `Bearer ${tokenVoluntario1}`
        );


    expect(response.status).toBe(200);


    expect(
      response.body.notificaciones
    ).toHaveLength(1);


    expect(
      notificacionRepository.listarPorUsuario
    ).toHaveBeenCalledWith(
      idVoluntario1,
      30,
      0
    );

  }
);


// ======================================================
// PRUEBA 5 - SEPARACIÓN ENTRE USUARIOS
// ======================================================

test(
  'utiliza el identificador del JWT para consultar las notificaciones',
  async () => {

    await request(app)
      .get('/api/notificaciones')
      .set(
        'Authorization',
        `Bearer ${tokenVoluntario2}`
      );


    expect(
      notificacionRepository.listarPorUsuario
    ).toHaveBeenCalledWith(
      idVoluntario2,
      30,
      0
    );


    expect(
      notificacionRepository.listarPorUsuario
    ).not.toHaveBeenCalledWith(
      idVoluntario1,
      30,
      0
    );

  }
);


// ======================================================
// PRUEBA 6 - CONTADOR DE NO LEÍDAS
// ======================================================

test(
  'cuenta las notificaciones no leídas del usuario autenticado',
  async () => {

    const response =
      await request(app)
        .get('/api/notificaciones/no-leidas')
        .set(
          'Authorization',
          `Bearer ${tokenVoluntario1}`
        );


    expect(response.status).toBe(200);


    expect(response.body.cantidad).toBe(1);


    expect(
      notificacionRepository.contarNoLeidas
    ).toHaveBeenCalledWith(
      idVoluntario1
    );

  }
);


// ======================================================
// PRUEBA 7 - MARCAR COMO LEÍDA
// ======================================================

test(
  'marca como leída una notificación del usuario autenticado',
  async () => {

    const response =
      await request(app)
        .patch(
          `/api/notificaciones/${idNotificacion}/leida`
        )
        .set(
          'Authorization',
          `Bearer ${tokenVoluntario1}`
        );


    expect(response.status).toBe(200);


    expect(
      notificacionRepository.marcarComoLeida
    ).toHaveBeenCalledWith(
      idNotificacion,
      idVoluntario1
    );

  }
);


// ======================================================
// PRUEBA 8 - NOTIFICACIÓN AJENA
// ======================================================

test(
  'no permite marcar como leída una notificación ajena',
  async () => {

    // El repositorio no encuentra la combinación
    // de notificación y usuario autenticado.

    notificacionRepository
      .marcarComoLeida
      .mockResolvedValue(null);


    const response =
      await request(app)
        .patch(
          `/api/notificaciones/${idNotificacion}/leida`
        )
        .set(
          'Authorization',
          `Bearer ${tokenVoluntario2}`
        );


    expect(response.status).toBe(404);


    expect(
      notificacionRepository.marcarComoLeida
    ).toHaveBeenCalledWith(
      idNotificacion,
      idVoluntario2
    );

  }
);


// ======================================================
// PRUEBA 9 - IDENTIFICADOR INVÁLIDO
// ======================================================

test(
  'rechaza identificadores de notificación inválidos',
  async () => {

    const response =
      await request(app)
        .patch(
          '/api/notificaciones/id-invalido/leida'
        )
        .set(
          'Authorization',
          `Bearer ${tokenVoluntario1}`
        );


    expect(response.status).toBe(400);


    expect(
      notificacionRepository.marcarComoLeida
    ).not.toHaveBeenCalled();

  }
);


// ======================================================
// PRUEBA 10 - PAGINACIÓN INVÁLIDA
// ======================================================

test(
  'rechaza límites de paginación mayores a 100',
  async () => {

    const response =
      await request(app)
        .get('/api/notificaciones?limite=101')
        .set(
          'Authorization',
          `Bearer ${tokenVoluntario1}`
        );


    expect(response.status).toBe(400);


    expect(
      notificacionRepository.listarPorUsuario
    ).not.toHaveBeenCalled();

  }
);