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
// MOCK DE REPOSITORIO DE PERFILES
// ======================================================

jest.mock(
  '../src/repositories/perfilPublicoRepository',
  () => ({
    listarOrganizacionesPublicas:
      jest.fn(),

    obtenerPerfilPropio:
      jest.fn(),
  })
);


const pool =
  require('../src/config/db');

const perfilPublicoRepository =
  require('../src/repositories/perfilPublicoRepository');

const app =
  require('../src/index');


// ======================================================
// TOKENS DE PRUEBA
// ======================================================

const tokenOrganizacion =
  jwt.sign(
    {
      id: 'usuario-organizacion-test',
      rol: 'ORGANIZACION',
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
    }
  );


const tokenVoluntario =
  jwt.sign(
    {
      id: 'usuario-voluntario-test',
      rol: 'VOLUNTARIO',
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
    }
  );


// ======================================================
// CONFIGURACIÓN GENERAL
// ======================================================

beforeEach(() => {

  jest.clearAllMocks();

});


// ======================================================
// GET /api/public/organizaciones
// ======================================================

describe(
  'GET /api/public/organizaciones',
  () => {

    test(
      'permite consultar el directorio sin JWT y expone solo datos públicos',
      async () => {

        perfilPublicoRepository
          .listarOrganizacionesPublicas
          .mockResolvedValue([
            {
              nombre_visible:
                'Fundación Prueba',

              slug:
                'fundacion-prueba',

              descripcion_publica:
                'Descripción pública',

              localidad:
                'Santa Fe',

              provincia:
                'Santa Fe',

              tipos_actividad:
                [
                  'Asistencia social'
                ],

              imagen_url:
                null,

              imagen_texto_alternativo:
                null,

              // Dato interno simulado.
              // No debe aparecer en la API.
              id_organizacion:
                'id-interno-no-publico'
            }
          ]);


        const response =
          await request(app)
            .get(
              '/api/public/organizaciones'
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          response.body.organizaciones
        ).toHaveLength(1);


        expect(
          response.body.organizaciones[0]
            .nombre_visible
        ).toBe(
          'Fundación Prueba'
        );


        expect(
          response.body.organizaciones[0]
            .id_organizacion
        ).toBeUndefined();

      }
    );


    test(
      'rechaza un tipo de actividad con formato inválido',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/public/organizaciones?id_tipo_actividad=abc'
            );


        expect(
          response.status
        ).toBe(400);


        expect(
          perfilPublicoRepository
            .listarOrganizacionesPublicas
        ).not.toHaveBeenCalled();

      }
    );

  }
);


// ======================================================
// GET /api/organizaciones/mi-perfil
// ======================================================

describe(
  'GET /api/organizaciones/mi-perfil',
  () => {

    test(
      'rechaza la consulta sin JWT',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/organizaciones/mi-perfil'
            );


        expect(
          response.status
        ).toBe(401);


        expect(
          perfilPublicoRepository
            .obtenerPerfilPropio
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza a un usuario VOLUNTARIO',
      async () => {

        pool.query.mockResolvedValue({
          rows: [
            {
              estado_cuenta:
                'ACTIVA'
            }
          ]
        });


        const response =
          await request(app)
            .get(
              '/api/organizaciones/mi-perfil'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(403);


        expect(
          perfilPublicoRepository
            .obtenerPerfilPropio
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'obtiene el perfil usando la organización asociada al JWT',
      async () => {

        pool.query
          .mockResolvedValueOnce({
            rows: [
              {
                estado_cuenta:
                  'ACTIVA'
              }
            ]
          })
          .mockResolvedValueOnce({
            rows: [
              {
                id_organizacion:
                  'organizacion-test',

                estado_verificacion:
                  'VERIFICADA'
              }
            ]
          });


        perfilPublicoRepository
          .obtenerPerfilPropio
          .mockResolvedValue({
            organizacion: {
              razon_social:
                'Asociación',

              estado_verificacion:
                'VERIFICADA'
            },

            perfil:
              null
          });


        const response =
          await request(app)
            .get(
              '/api/organizaciones/mi-perfil'
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          perfilPublicoRepository
            .obtenerPerfilPropio
        ).toHaveBeenCalledWith(
          'organizacion-test'
        );


        expect(
          response.body.perfil
        ).toBeNull();

      }
    );

  }
);