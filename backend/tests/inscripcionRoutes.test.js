process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');


// ======================================================
// MOCK DE BASE DE DATOS
// ======================================================

jest.mock(
  '../src/config/db',
  () => ({
    query: jest.fn(),
  })
);


// ======================================================
// MOCK DE REPOSITORIOS
// ======================================================

jest.mock(
  '../src/repositories/inscripcionRepository',
  () => ({
    buscarPorOportunidadYVoluntario:
      jest.fn(),

    crear:
      jest.fn(),

    listarPorVoluntario:
      jest.fn(),
  })
);


jest.mock(
  '../src/repositories/oportunidadRepository',
  () => ({
    buscarOportunidadPorId:
      jest.fn(),
  })
);


const pool =
  require('../src/config/db');

const inscripcionRepository =
  require('../src/repositories/inscripcionRepository');

const oportunidadRepository =
  require('../src/repositories/oportunidadRepository');

const app =
  require('../src/index');


// ======================================================
// TOKENS DE PRUEBA
// ======================================================

const tokenVoluntario =
  jwt.sign(
    {
      id: 'voluntario-test',
      rol: 'VOLUNTARIO',
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
    }
  );


const tokenOrganizacion =
  jwt.sign(
    {
      id: 'organizacion-test',
      rol: 'ORGANIZACION',
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
    }
  );


// ======================================================
// DATOS BASE
// ======================================================

const oportunidadPublicada = {

  id_oportunidad:
    'oportunidad-test',

  titulo:
    'Oportunidad de prueba',

  estado:
    'PUBLICADA',

  fecha_inicio:
    '2099-01-01T10:00:00.000Z',

  fecha_fin:
    '2099-01-02T10:00:00.000Z',

};


const inscripcionCreada = {

  id_inscripcion:
    'inscripcion-test',

  id_oportunidad:
    'oportunidad-test',

  id_voluntario:
    'voluntario-test',

  estado:
    'PENDIENTE',

};


// ======================================================
// CONFIGURACIÓN GENERAL
// ======================================================

beforeEach(() => {

  jest.clearAllMocks();


  // Usuario autenticado y activo
  pool.query.mockResolvedValue({
    rows: [
      {
        estado_cuenta: 'ACTIVA',
      },
    ],
  });


  oportunidadRepository
    .buscarOportunidadPorId
    .mockResolvedValue(
      oportunidadPublicada
    );


  inscripcionRepository
    .buscarPorOportunidadYVoluntario
    .mockResolvedValue(
      null
    );


  inscripcionRepository
    .crear
    .mockResolvedValue(
      inscripcionCreada
    );


  inscripcionRepository
    .listarPorVoluntario
    .mockResolvedValue([
      {
        ...inscripcionCreada,

        oportunidad_titulo:
          'Oportunidad de prueba',

        fecha_inicio:
          oportunidadPublicada.fecha_inicio,

        fecha_fin:
          oportunidadPublicada.fecha_fin,

        oportunidad_estado:
          'PUBLICADA',
      },
    ]);

});


// ======================================================
// POST /api/inscripciones
// ======================================================

describe(
  'POST /api/inscripciones',
  () => {

    test(
      'rechaza una solicitud sin JWT',
      async () => {

        const response =
          await request(app)
            .post(
              '/api/inscripciones'
            )
            .send({
              id_oportunidad:
                'oportunidad-test',
            });


        expect(
          response.status
        ).toBe(401);

      }
    );


    test(
      'rechaza una organización por rol',
      async () => {

        const response =
          await request(app)
            .post(
              '/api/inscripciones'
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            )
            .send({
              id_oportunidad:
                'oportunidad-test',
            });


        expect(
          response.status
        ).toBe(403);

      }
    );


    test(
      'crea una inscripción PENDIENTE para un voluntario',
      async () => {

        const response =
          await request(app)
            .post(
              '/api/inscripciones'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            )
            .send({
              id_oportunidad:
                'oportunidad-test',
            });


        expect(
          response.status
        ).toBe(201);


        expect(
          response.body.inscripcion.estado
        ).toBe(
          'PENDIENTE'
        );


        expect(
          inscripcionRepository.crear
        ).toHaveBeenCalledWith(
          'oportunidad-test',
          'voluntario-test'
        );

      }
    );


    test(
      'rechaza una oportunidad inexistente',
      async () => {

        oportunidadRepository
          .buscarOportunidadPorId
          .mockResolvedValue(
            null
          );


        const response =
          await request(app)
            .post(
              '/api/inscripciones'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            )
            .send({
              id_oportunidad:
                'inexistente',
            });


        expect(
          response.status
        ).toBe(404);

      }
    );


    test(
      'rechaza una oportunidad que no está PUBLICADA',
      async () => {

        oportunidadRepository
          .buscarOportunidadPorId
          .mockResolvedValue({
            ...oportunidadPublicada,

            estado:
              'CANCELADA',
          });


        const response =
          await request(app)
            .post(
              '/api/inscripciones'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            )
            .send({
              id_oportunidad:
                'oportunidad-test',
            });


        expect(
          response.status
        ).toBe(400);

      }
    );


    test(
      'rechaza una oportunidad vencida',
      async () => {

        oportunidadRepository
          .buscarOportunidadPorId
          .mockResolvedValue({
            ...oportunidadPublicada,

            fecha_inicio:
              '2000-01-01T10:00:00.000Z',
          });


        const response =
          await request(app)
            .post(
              '/api/inscripciones'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            )
            .send({
              id_oportunidad:
                'oportunidad-test',
            });


        expect(
          response.status
        ).toBe(400);

      }
    );


    test(
      'rechaza una inscripción duplicada',
      async () => {

        inscripcionRepository
          .buscarPorOportunidadYVoluntario
          .mockResolvedValue(
            inscripcionCreada
          );


        const response =
          await request(app)
            .post(
              '/api/inscripciones'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            )
            .send({
              id_oportunidad:
                'oportunidad-test',
            });


        expect(
          response.status
        ).toBe(409);

      }
    );


    test(
      'convierte el UNIQUE de PostgreSQL en 409',
      async () => {

        inscripcionRepository
          .crear
          .mockRejectedValue({
            code:
              '23505',

            constraint:
              'uq_inscripcion_oportunidad_voluntario',
          });


        const response =
          await request(app)
            .post(
              '/api/inscripciones'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            )
            .send({
              id_oportunidad:
                'oportunidad-test',
            });


        expect(
          response.status
        ).toBe(409);


        expect(
          response.body.mensaje
        ).toBe(
          'Ya estás inscripto en esta oportunidad'
        );

      }
    );

  }
);


// ======================================================
// GET /api/inscripciones/mis-inscripciones
// ======================================================

describe(
  'GET /api/inscripciones/mis-inscripciones',
  () => {

    test(
      'rechaza una solicitud sin JWT',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/inscripciones/mis-inscripciones'
            );


        expect(
          response.status
        ).toBe(401);

      }
    );


    test(
      'rechaza una organización por rol',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/inscripciones/mis-inscripciones'
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            );


        expect(
          response.status
        ).toBe(403);

      }
    );


    test(
      'devuelve únicamente las inscripciones del voluntario autenticado',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/inscripciones/mis-inscripciones'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          Array.isArray(
            response.body
          )
        ).toBe(true);


        expect(
          inscripcionRepository
            .listarPorVoluntario
        ).toHaveBeenCalledWith(
          'voluntario-test'
        );


        expect(
          response.body[0]
            .id_voluntario
        ).toBe(
          'voluntario-test'
        );

      }
    );

  }
);