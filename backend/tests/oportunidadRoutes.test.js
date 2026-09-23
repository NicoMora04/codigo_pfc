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
// MOCK DE REPOSITORIO DE OPORTUNIDADES
// ======================================================

jest.mock(
  '../src/repositories/oportunidadRepository',
  () => ({
    buscarOportunidadPorId:
      jest.fn(),

    publicarOportunidad:
      jest.fn(),

    actualizarOportunidad:
      jest.fn(),

    cancelarOportunidad:
      jest.fn(),

    cerrarOportunidad:
      jest.fn(),

    finalizarOportunidad:
      jest.fn(),

    eliminarLogicamenteOportunidad:
      jest.fn(),

     buscarDetalleOportunidadVoluntario:
  jest.fn(), 
  })
);


const pool =
  require('../src/config/db');

const oportunidadRepository =
  require('../src/repositories/oportunidadRepository');

const app =
  require('../src/index');


// ======================================================
// TOKEN DE ORGANIZACIÓN
// ======================================================

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

// ======================================================
// CONFIGURACIÓN GENERAL
// ======================================================

beforeEach(() => {

  jest.clearAllMocks();


  pool.query.mockResolvedValue({
    rows: [
      {
        estado_cuenta:
          'ACTIVA',

        estado_verificacion:
          'VERIFICADA',

        id_organizacion:
          'organizacion-test',
      },
    ],
  });

});

// ======================================================
// PATCH /api/oportunidades/:id/publicar
// ======================================================

describe(
  'PATCH /api/oportunidades/:id/publicar',
  () => {

    test(
      'rechaza publicar una oportunidad eliminada lógicamente',
      async () => {

        const idOportunidad =
          '22222222-2222-4222-8222-222222222222';


        oportunidadRepository
          .buscarOportunidadPorId
          .mockResolvedValue({
            id_oportunidad:
              idOportunidad,

            id_organizacion:
              'organizacion-test',

            estado:
              'BORRADOR',

            eliminado_en:
              '2026-09-22T15:00:00.000Z',

            id_ubicacion:
              '33333333-3333-4333-8333-333333333333',

            tipo_ubicacion:
              'EXACTA',
          });


        const response =
          await request(app)
            .patch(
              `/api/oportunidades/${idOportunidad}/publicar`
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            );


        expect(
          response.status
        ).toBe(409);


        expect(
          oportunidadRepository
            .publicarOportunidad
        ).not.toHaveBeenCalled();

      }
    );

  }
);

// ======================================================
// GET /api/oportunidades/:id
// ======================================================

describe(
  'GET /api/oportunidades/:id',
  () => {

    test(
      'rechaza consultar una oportunidad eliminada lógicamente desde la gestión de la organización',
      async () => {

        const idOportunidad =
          '22222222-2222-4222-8222-222222222222';


        oportunidadRepository
          .buscarOportunidadPorId
          .mockResolvedValue({
            id_oportunidad:
              idOportunidad,

            id_organizacion:
              'organizacion-test',

            estado:
              'BORRADOR',

            eliminado_en:
              '2026-09-22T15:00:00.000Z',
          });


        const response =
          await request(app)
            .get(
              `/api/oportunidades/${idOportunidad}`
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            );


        expect(
          response.status
        ).toBe(409);

      }
    );

  }
);

// ======================================================
// PUT /api/oportunidades/:id
// ======================================================

describe(
  'PUT /api/oportunidades/:id',
  () => {

    test(
      'rechaza modificar una oportunidad eliminada lógicamente',
      async () => {

        const idOportunidad =
          '22222222-2222-4222-8222-222222222222';


        oportunidadRepository
          .buscarOportunidadPorId
          .mockResolvedValue({
            id_oportunidad:
              idOportunidad,

            id_organizacion:
              'organizacion-test',

            estado:
              'BORRADOR',

            eliminado_en:
              '2026-09-22T15:00:00.000Z',
          });


        const response =
          await request(app)
            .put(
              `/api/oportunidades/${idOportunidad}`
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            )
            .send({});


        expect(
          response.status
        ).toBe(409);


        expect(
          oportunidadRepository
            .actualizarOportunidad
        ).not.toHaveBeenCalled();

      }
    );

  }
);
// ======================================================
// PATCH /api/oportunidades/:id/cancelar
// ======================================================

describe(
  'PATCH /api/oportunidades/:id/cancelar',
  () => {

    test(
      'rechaza cancelar una oportunidad eliminada lógicamente',
      async () => {

        const idOportunidad =
          '22222222-2222-4222-8222-222222222222';


        oportunidadRepository
          .buscarOportunidadPorId
          .mockResolvedValue({
            id_oportunidad:
              idOportunidad,

            id_organizacion:
              'organizacion-test',

            estado:
              'BORRADOR',

            eliminado_en:
              '2026-09-22T15:00:00.000Z',
          });


        const response =
          await request(app)
            .patch(
              `/api/oportunidades/${idOportunidad}/cancelar`
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            );


        expect(
          response.status
        ).toBe(409);


        expect(
          oportunidadRepository
            .cancelarOportunidad
        ).not.toHaveBeenCalled();

      }
    );

  }
);


// ======================================================
// GET /api/oportunidades/:id/detalle
// ======================================================

describe(
  'GET /api/oportunidades/:id/detalle',
  () => {

    test(
      'permite al voluntario consultar el detalle histórico usando su identidad del JWT',
      async () => {

        const idOportunidad =
          '22222222-2222-4222-8222-222222222222';


        oportunidadRepository
          .buscarDetalleOportunidadVoluntario
          .mockResolvedValue({
            id_oportunidad:
              idOportunidad,

            titulo:
              'Actividad histórica',

            estado:
              'FINALIZADA',

            eliminado_en:
              null,
          });


        const response =
          await request(app)
            .get(
              `/api/oportunidades/${idOportunidad}/detalle`
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          oportunidadRepository
            .buscarDetalleOportunidadVoluntario
        ).toHaveBeenCalledWith(
          idOportunidad,
          'voluntario-test'
        );

      }
    );


    test(
      'rechaza consultar el detalle sin JWT',
      async () => {

        const idOportunidad =
          '22222222-2222-4222-8222-222222222222';


        const response =
          await request(app)
            .get(
              `/api/oportunidades/${idOportunidad}/detalle`
            );


        expect(
          response.status
        ).toBe(401);


        expect(
          oportunidadRepository
            .buscarDetalleOportunidadVoluntario
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza a una organización que intenta consultar el detalle destinado a voluntarios',
      async () => {

        const idOportunidad =
          '22222222-2222-4222-8222-222222222222';


        const response =
          await request(app)
            .get(
              `/api/oportunidades/${idOportunidad}/detalle`
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            );


        expect(
          response.status
        ).toBe(403);


        expect(
          oportunidadRepository
            .buscarDetalleOportunidadVoluntario
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza el detalle histórico cuando el voluntario no tiene acceso a la oportunidad',
      async () => {

        const idOportunidad =
          '22222222-2222-4222-8222-222222222222';


        oportunidadRepository
          .buscarDetalleOportunidadVoluntario
          .mockResolvedValue(
            null
          );


        const response =
          await request(app)
            .get(
              `/api/oportunidades/${idOportunidad}/detalle`
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(404);


        expect(
          oportunidadRepository
            .buscarDetalleOportunidadVoluntario
        ).toHaveBeenCalledWith(
          idOportunidad,
          'voluntario-test'
        );

      }
    );


    test(
      'permite consultar una actividad cancelada cuando existe acceso histórico del voluntario',
      async () => {

        const idOportunidad =
          '22222222-2222-4222-8222-222222222222';


        oportunidadRepository
          .buscarDetalleOportunidadVoluntario
          .mockResolvedValue({
            id_oportunidad:
              idOportunidad,

            titulo:
              'Actividad cancelada',

            estado:
              'CANCELADA',

            eliminado_en:
              null,
          });


        const response =
          await request(app)
            .get(
              `/api/oportunidades/${idOportunidad}/detalle`
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          response.body.oportunidad.estado
        ).toBe(
          'CANCELADA'
        );

      }
    );


    test(
      'permite consultar históricamente una actividad cancelada y eliminada lógicamente cuando el voluntario estuvo inscripto',
      async () => {

        const idOportunidad =
          '22222222-2222-4222-8222-222222222222';


        oportunidadRepository
          .buscarDetalleOportunidadVoluntario
          .mockResolvedValue({
            id_oportunidad:
              idOportunidad,

            titulo:
              'Actividad histórica eliminada',

            estado:
              'CANCELADA',

            eliminado_en:
              '2026-09-22T15:00:00.000Z',
          });


        const response =
          await request(app)
            .get(
              `/api/oportunidades/${idOportunidad}/detalle`
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          response.body.oportunidad
            .eliminado_en
        ).toBe(
          '2026-09-22T15:00:00.000Z'
        );

      }
    );


    test(
      'rechaza un identificador de oportunidad con formato inválido',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/oportunidades/id-invalido/detalle'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(400);


        expect(
          oportunidadRepository
            .buscarDetalleOportunidadVoluntario
        ).not.toHaveBeenCalled();

      }
    );

  }
);



