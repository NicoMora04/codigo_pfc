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
    
      contarAceptadasPorOportunidad:
      jest.fn(),
     buscarPorId:
      jest.fn(),

    cancelarPorVoluntario:
      jest.fn(), 
     
    aceptarConControlCupo:
      jest.fn(),

     rechazar:
  jest.fn(), 
    listarPorOportunidad:
  jest.fn(),
  
  marcarResultadoParticipacion:
  jest.fn(),

  ocultarParaVoluntario:
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
         estado_verificacion: 'VERIFICADA',
         id_organizacion: 'organizacion-test',
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
  .contarAceptadasPorOportunidad
  .mockResolvedValue(0);


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

    inscripcionRepository
  .buscarPorId
  .mockResolvedValue({
    id_inscripcion:
      '11111111-1111-4111-8111-111111111111',
    id_organizacion:
  'organizacion-test',  

    id_oportunidad:
      'oportunidad-test',

    id_voluntario:
      'voluntario-test',

    estado:
      'PENDIENTE',

    oportunidad_estado:
      'PUBLICADA',

    fecha_inicio:
      '2099-01-01T10:00:00.000Z',
  });


inscripcionRepository
  .cancelarPorVoluntario
  .mockResolvedValue({
    id_inscripcion:
      '11111111-1111-4111-8111-111111111111',

    id_voluntario:
      'voluntario-test',

    estado:
      'CANCELADA',
  });

  inscripcionRepository
  .rechazar
  .mockResolvedValue({
    id_inscripcion:
      '11111111-1111-4111-8111-111111111111',

    id_voluntario:
      'voluntario-test',

    estado:
      'RECHAZADA',
  });

  inscripcionRepository
  .listarPorOportunidad
  .mockResolvedValue([
    {
      id_inscripcion:
        '11111111-1111-4111-8111-111111111111',

      id_voluntario:
        'voluntario-test',

      nombre:
        'Voluntario',

      apellido:
        'Prueba',

      estado:
        'PENDIENTE',
    },
  ]);

  inscripcionRepository
  .marcarResultadoParticipacion
  .mockResolvedValue({
    id_inscripcion:
      '11111111-1111-4111-8111-111111111111',

    id_voluntario:
      'voluntario-test',

    estado:
      'COMPLETADA',
  });

  inscripcionRepository
  .ocultarParaVoluntario
  .mockResolvedValue({
    id_inscripcion:
      '11111111-1111-4111-8111-111111111111',

    id_voluntario:
      'voluntario-test',

    estado:
      'RECHAZADA',

    ocultada_en:
      '2026-09-22T20:00:00.000Z',
  });

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
      'rechaza una inscripción cuando la oportunidad no tiene cupos disponibles',
      async () => {

        oportunidadRepository
          .buscarOportunidadPorId
          .mockResolvedValue({
            ...oportunidadPublicada,
            cupo_total: 1,
          });

        inscripcionRepository
          .contarAceptadasPorOportunidad
          .mockResolvedValue(1);


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
          inscripcionRepository.crear
        ).not.toHaveBeenCalled();

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
// PATCH /api/inscripciones/:idInscripcion/aceptar
// ======================================================

describe(
  'PATCH /api/inscripciones/:idInscripcion/aceptar',
  () => {

    test(
      'permite a la organización aceptar una inscripción pendiente propia',
      async () => {

        const idInscripcion =
          '11111111-1111-4111-8111-111111111111';


        const response =
          await request(app)
            .patch(
              `/api/inscripciones/${idInscripcion}/aceptar`
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          inscripcionRepository
            .aceptarConControlCupo
        ).toHaveBeenCalledWith(
          idInscripcion
        );

      }
    );

    test(
  'rechaza a una organización que intenta aceptar una inscripción de otra organización',
  async () => {

    const idInscripcion =
      '11111111-1111-4111-8111-111111111111';


    inscripcionRepository
      .buscarPorId
      .mockResolvedValue({
        id_inscripcion:
          idInscripcion,

        id_organizacion:
          'otra-organizacion',

        id_oportunidad:
          'oportunidad-test',

        id_voluntario:
          'voluntario-test',

        estado:
          'PENDIENTE',

        oportunidad_estado:
          'PUBLICADA',

        fecha_inicio:
          '2099-01-01T10:00:00.000Z',
      });


    const response =
      await request(app)
        .patch(
          `/api/inscripciones/${idInscripcion}/aceptar`
        )
        .set(
          'Authorization',
          `Bearer ${tokenOrganizacion}`
        );


    expect(
      response.status
    ).toBe(403);


    expect(
      inscripcionRepository
        .aceptarConControlCupo
    ).not.toHaveBeenCalled();

  }
);

test(
  'rechaza la aceptación cuando la inscripción ya no está pendiente',
  async () => {

    const idInscripcion =
      '11111111-1111-4111-8111-111111111111';


    inscripcionRepository
      .buscarPorId
      .mockResolvedValue({
        id_inscripcion:
          idInscripcion,

        id_organizacion:
          'organizacion-test',

        id_oportunidad:
          'oportunidad-test',

        id_voluntario:
          'voluntario-test',

        estado:
          'ACEPTADA',

        oportunidad_estado:
          'PUBLICADA',

        fecha_inicio:
          '2099-01-01T10:00:00.000Z',
      });


    const response =
      await request(app)
        .patch(
          `/api/inscripciones/${idInscripcion}/aceptar`
        )
        .set(
          'Authorization',
          `Bearer ${tokenOrganizacion}`
        );


    expect(
      response.status
    ).toBe(409);


    expect(
      inscripcionRepository
        .aceptarConControlCupo
    ).not.toHaveBeenCalled();

  }
);

test(
  'rechaza la aceptación cuando ya no quedan cupos disponibles',
  async () => {

    const idInscripcion =
      '11111111-1111-4111-8111-111111111111';

    const errorCupo =
      new Error(
        'No hay cupos disponibles'
      );

    errorCupo.status = 409;

    inscripcionRepository
      .aceptarConControlCupo
      .mockRejectedValue(
        errorCupo
      );


    const response =
      await request(app)
        .patch(
          `/api/inscripciones/${idInscripcion}/aceptar`
        )
        .set(
          'Authorization',
          `Bearer ${tokenOrganizacion}`
        );


    expect(
      response.status
    ).toBe(409);


    expect(
      inscripcionRepository
        .aceptarConControlCupo
    ).toHaveBeenCalledWith(
      idInscripcion
    );

  }
);
test(
  'rechaza a un voluntario que intenta aceptar una inscripción',
  async () => {

    const idInscripcion =
      '11111111-1111-4111-8111-111111111111';


    const response =
      await request(app)
        .patch(
          `/api/inscripciones/${idInscripcion}/aceptar`
        )
        .set(
          'Authorization',
          `Bearer ${tokenVoluntario}`
        );


    expect(
      response.status
    ).toBe(403);


    expect(
      inscripcionRepository
        .aceptarConControlCupo
    ).not.toHaveBeenCalled();

  }
);
test(
  'rechaza la aceptación cuando no se envía token',
  async () => {

    const idInscripcion =
      '11111111-1111-4111-8111-111111111111';


    const response =
      await request(app)
        .patch(
          `/api/inscripciones/${idInscripcion}/aceptar`
        );


    expect(
      response.status
    ).toBe(401);


    expect(
      inscripcionRepository
        .aceptarConControlCupo
    ).not.toHaveBeenCalled();

  }
);
test(
  'rechaza la aceptación cuando la organización no está verificada',
  async () => {

    const idInscripcion =
      '11111111-1111-4111-8111-111111111111';


    pool.query
      .mockResolvedValueOnce({
        rows: [
          {
            estado_cuenta:
              'ACTIVA',
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id_organizacion:
              'organizacion-test',

            estado_verificacion:
              'PENDIENTE',
          },
        ],
      });


    const response =
      await request(app)
        .patch(
          `/api/inscripciones/${idInscripcion}/aceptar`
        )
        .set(
          'Authorization',
          `Bearer ${tokenOrganizacion}`
        );


    expect(
      response.status
    ).toBe(403);


    expect(
      inscripcionRepository
        .aceptarConControlCupo
    ).not.toHaveBeenCalled();

  }
);

  }
);




// ======================================================
// PATCH /api/inscripciones/:idInscripcion/rechazar
// ======================================================

describe(
  'PATCH /api/inscripciones/:idInscripcion/rechazar',
  () => {

    test(
      'permite a la organización rechazar una inscripción pendiente propia',
      async () => {

        const idInscripcion =
          '11111111-1111-4111-8111-111111111111';


        const response =
          await request(app)
            .patch(
              `/api/inscripciones/${idInscripcion}/rechazar`
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          inscripcionRepository
            .rechazar
        ).toHaveBeenCalledWith(
          idInscripcion
        );

      }
    );

    test(
  'rechaza a una organización que intenta rechazar una inscripción de otra organización',
  async () => {

    const idInscripcion =
      '11111111-1111-4111-8111-111111111111';


    inscripcionRepository
      .buscarPorId
      .mockResolvedValue({
        id_inscripcion:
          idInscripcion,

        id_organizacion:
          'otra-organizacion',

        id_oportunidad:
          'oportunidad-test',

        id_voluntario:
          'voluntario-test',

        estado:
          'PENDIENTE',

        oportunidad_estado:
          'PUBLICADA',

        fecha_inicio:
          '2099-01-01T10:00:00.000Z',
      });


    const response =
      await request(app)
        .patch(
          `/api/inscripciones/${idInscripcion}/rechazar`
        )
        .set(
          'Authorization',
          `Bearer ${tokenOrganizacion}`
        );


    expect(
      response.status
    ).toBe(403);


    expect(
      inscripcionRepository
        .rechazar
    ).not.toHaveBeenCalled();

  }
);
test(
  'rechaza el rechazo cuando la inscripción ya no está pendiente',
  async () => {

    const idInscripcion =
      '11111111-1111-4111-8111-111111111111';


    inscripcionRepository
      .buscarPorId
      .mockResolvedValue({
        id_inscripcion:
          idInscripcion,

        id_organizacion:
          'organizacion-test',

        id_oportunidad:
          'oportunidad-test',

        id_voluntario:
          'voluntario-test',

        estado:
          'ACEPTADA',

        oportunidad_estado:
          'PUBLICADA',

        fecha_inicio:
          '2099-01-01T10:00:00.000Z',
      });


    const response =
      await request(app)
        .patch(
          `/api/inscripciones/${idInscripcion}/rechazar`
        )
        .set(
          'Authorization',
          `Bearer ${tokenOrganizacion}`
        );


    expect(
      response.status
    ).toBe(409);


    expect(
      inscripcionRepository
        .rechazar
    ).not.toHaveBeenCalled();

  }
);
test(
  'rechaza a un voluntario que intenta rechazar una inscripción',
  async () => {

    const idInscripcion =
      '11111111-1111-4111-8111-111111111111';


    const response =
      await request(app)
        .patch(
          `/api/inscripciones/${idInscripcion}/rechazar`
        )
        .set(
          'Authorization',
          `Bearer ${tokenVoluntario}`
        );


    expect(
      response.status
    ).toBe(403);


    expect(
      inscripcionRepository
        .rechazar
    ).not.toHaveBeenCalled();

  }
);

  }
);

// ======================================================
// PATCH /api/inscripciones/:idInscripcion/cancelar
// ======================================================

describe(
  'PATCH /api/inscripciones/:idInscripcion/cancelar',
  () => {

    test(
      'permite al voluntario cancelar su propia inscripción dentro del plazo',
      async () => {

        const idInscripcion =
          '11111111-1111-4111-8111-111111111111';


        const response =
          await request(app)
            .patch(
              `/api/inscripciones/${idInscripcion}/cancelar`
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          inscripcionRepository
            .cancelarPorVoluntario
        ).toHaveBeenCalledWith(
          idInscripcion
        );

      }
    );

    test(
  'rechaza la cancelación cuando faltan menos de 3 días para la actividad',
  async () => {

    const idInscripcion =
      '11111111-1111-4111-8111-111111111111';

    const fechaEnDosDias =
      new Date(
        Date.now() +
        2 * 24 * 60 * 60 * 1000
      ).toISOString();


    inscripcionRepository
      .buscarPorId
      .mockResolvedValue({
        id_inscripcion:
          idInscripcion,

        id_voluntario:
          'voluntario-test',

        estado:
          'ACEPTADA',

        oportunidad_estado:
          'PUBLICADA',

        fecha_inicio:
          fechaEnDosDias,
      });


    const response =
      await request(app)
        .patch(
          `/api/inscripciones/${idInscripcion}/cancelar`
        )
        .set(
          'Authorization',
          `Bearer ${tokenVoluntario}`
        );


    expect(
      response.status
    ).toBe(409);


    expect(
      inscripcionRepository
        .cancelarPorVoluntario
    ).not.toHaveBeenCalled();

  }
);

test(
  'rechaza la cancelación de una inscripción perteneciente a otro voluntario',
  async () => {

    const idInscripcion =
      '11111111-1111-4111-8111-111111111111';


    inscripcionRepository
      .buscarPorId
      .mockResolvedValue({
        id_inscripcion:
          idInscripcion,

        id_voluntario:
          'otro-voluntario',

        estado:
          'ACEPTADA',

        oportunidad_estado:
          'PUBLICADA',

        fecha_inicio:
          '2099-01-01T10:00:00.000Z',
      });


    const response =
      await request(app)
        .patch(
          `/api/inscripciones/${idInscripcion}/cancelar`
        )
        .set(
          'Authorization',
          `Bearer ${tokenVoluntario}`
        );


    expect(
      response.status
    ).toBe(403);


    expect(
      inscripcionRepository
        .cancelarPorVoluntario
    ).not.toHaveBeenCalled();

  }
);

test(
  'rechaza la cancelación cuando la inscripción está en un estado no cancelable',
  async () => {

    const idInscripcion =
      '11111111-1111-4111-8111-111111111111';


    inscripcionRepository
      .buscarPorId
      .mockResolvedValue({
        id_inscripcion:
          idInscripcion,

        id_voluntario:
          'voluntario-test',

        estado:
          'RECHAZADA',

        oportunidad_estado:
          'PUBLICADA',

        fecha_inicio:
          '2099-01-01T10:00:00.000Z',
      });


    const response =
      await request(app)
        .patch(
          `/api/inscripciones/${idInscripcion}/cancelar`
        )
        .set(
          'Authorization',
          `Bearer ${tokenVoluntario}`
        );


    expect(
      response.status
    ).toBe(409);


    expect(
      inscripcionRepository
        .cancelarPorVoluntario
    ).not.toHaveBeenCalled();

  }
);
test(
  'rechaza la cancelación cuando la actividad está finalizada',
  async () => {

    const idInscripcion =
      '11111111-1111-4111-8111-111111111111';


    inscripcionRepository
      .buscarPorId
      .mockResolvedValue({
        id_inscripcion:
          idInscripcion,

        id_voluntario:
          'voluntario-test',

        estado:
          'ACEPTADA',

        oportunidad_estado:
          'FINALIZADA',

        fecha_inicio:
          '2099-01-01T10:00:00.000Z',
      });


    const response =
      await request(app)
        .patch(
          `/api/inscripciones/${idInscripcion}/cancelar`
        )
        .set(
          'Authorization',
          `Bearer ${tokenVoluntario}`
        );


    expect(
      response.status
    ).toBe(409);


    expect(
      inscripcionRepository
        .cancelarPorVoluntario
    ).not.toHaveBeenCalled();

  }
);
test(
  'rechaza la cancelación cuando la actividad está cancelada',
  async () => {

    const idInscripcion =
      '11111111-1111-4111-8111-111111111111';


    inscripcionRepository
      .buscarPorId
      .mockResolvedValue({
        id_inscripcion:
          idInscripcion,

        id_voluntario:
          'voluntario-test',

        estado:
          'ACEPTADA',

        oportunidad_estado:
          'CANCELADA',

        fecha_inicio:
          '2099-01-01T10:00:00.000Z',
      });


    const response =
      await request(app)
        .patch(
          `/api/inscripciones/${idInscripcion}/cancelar`
        )
        .set(
          'Authorization',
          `Bearer ${tokenVoluntario}`
        );


    expect(
      response.status
    ).toBe(409);


    expect(
      inscripcionRepository
        .cancelarPorVoluntario
    ).not.toHaveBeenCalled();

  }
);
test(
  'rechaza a una organización que intenta cancelar una inscripción de voluntario',
  async () => {

    const idInscripcion =
      '11111111-1111-4111-8111-111111111111';


    const response =
      await request(app)
        .patch(
          `/api/inscripciones/${idInscripcion}/cancelar`
        )
        .set(
          'Authorization',
          `Bearer ${tokenOrganizacion}`
        );


    expect(
      response.status
    ).toBe(403);


    expect(
      inscripcionRepository
        .cancelarPorVoluntario
    ).not.toHaveBeenCalled();

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



// ======================================================
// GET /api/inscripciones/oportunidad/:idOportunidad
// ======================================================

describe(
  'GET /api/inscripciones/oportunidad/:idOportunidad',
  () => {

    test(
      'permite a la organización consultar las inscripciones de una oportunidad propia',
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
              'PUBLICADA',

            fecha_inicio:
              '2099-01-01T10:00:00.000Z',

            cupo_total:
              10,
          });


        const response =
          await request(app)
            .get(
              `/api/inscripciones/oportunidad/${idOportunidad}`
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          inscripcionRepository
            .listarPorOportunidad
        ).toHaveBeenCalledWith(
          idOportunidad
        );


        expect(
          response.body.inscripciones
        ).toHaveLength(1);

      }
    );
    test(
  'rechaza a una organización que intenta consultar inscripciones de una oportunidad ajena',
  async () => {

    const idOportunidad =
      '22222222-2222-4222-8222-222222222222';


    oportunidadRepository
      .buscarOportunidadPorId
      .mockResolvedValue({
        id_oportunidad:
          idOportunidad,

        id_organizacion:
          'otra-organizacion',

        estado:
          'PUBLICADA',

        fecha_inicio:
          '2099-01-01T10:00:00.000Z',

        cupo_total:
          10,
      });


    const response =
      await request(app)
        .get(
          `/api/inscripciones/oportunidad/${idOportunidad}`
        )
        .set(
          'Authorization',
          `Bearer ${tokenOrganizacion}`
        );


    expect(
      response.status
    ).toBe(403);


    expect(
      inscripcionRepository
        .listarPorOportunidad
    ).not.toHaveBeenCalled();

  }
);
test(
  'rechaza a un voluntario que intenta consultar las inscripciones de una oportunidad',
  async () => {

    const idOportunidad =
      '22222222-2222-4222-8222-222222222222';


    const response =
      await request(app)
        .get(
          `/api/inscripciones/oportunidad/${idOportunidad}`
        )
        .set(
          'Authorization',
          `Bearer ${tokenVoluntario}`
        );


    expect(
      response.status
    ).toBe(403);


    expect(
      inscripcionRepository
        .listarPorOportunidad
    ).not.toHaveBeenCalled();

  }
);
test(
  'rechaza la consulta cuando la organización no está verificada',
  async () => {

    const idOportunidad =
      '22222222-2222-4222-8222-222222222222';


    pool.query
      .mockResolvedValueOnce({
        rows: [
          {
            estado_cuenta:
              'ACTIVA',
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id_organizacion:
              'organizacion-test',

            estado_verificacion:
              'PENDIENTE',
          },
        ],
      });


    const response =
      await request(app)
        .get(
          `/api/inscripciones/oportunidad/${idOportunidad}`
        )
        .set(
          'Authorization',
          `Bearer ${tokenOrganizacion}`
        );


    expect(
      response.status
    ).toBe(403);


    expect(
      inscripcionRepository
        .listarPorOportunidad
    ).not.toHaveBeenCalled();

  }
);

  }
);


// ======================================================
// PATCH /api/inscripciones/:idInscripcion/resultado
// ======================================================

describe(
  'PATCH /api/inscripciones/:idInscripcion/resultado',
  () => {

    test(
      'permite a la organización marcar como COMPLETADA una inscripción aceptada de una actividad finalizada',
      async () => {

        const idInscripcion =
          '11111111-1111-4111-8111-111111111111';


        inscripcionRepository
          .buscarPorId
          .mockResolvedValue({
            id_inscripcion:
              idInscripcion,

            id_organizacion:
              'organizacion-test',

            id_oportunidad:
              'oportunidad-test',

            id_voluntario:
              'voluntario-test',

            estado:
              'ACEPTADA',

            oportunidad_estado:
              'FINALIZADA',

            fecha_inicio:
              '2099-01-01T10:00:00.000Z',
          });


        const response =
          await request(app)
            .patch(
              `/api/inscripciones/${idInscripcion}/resultado`
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            )
            .send({
              estado:
                'COMPLETADA',
            });


        expect(
          response.status
        ).toBe(200);


        expect(
          inscripcionRepository
            .marcarResultadoParticipacion
        ).toHaveBeenCalledWith(
          idInscripcion,
          'COMPLETADA'
        );

      }
    );
    test(
  'permite a la organización marcar como AUSENTE una inscripción aceptada de una actividad finalizada',
  async () => {

    const idInscripcion =
      '11111111-1111-4111-8111-111111111111';


    inscripcionRepository
      .buscarPorId
      .mockResolvedValue({
        id_inscripcion:
          idInscripcion,

        id_organizacion:
          'organizacion-test',

        id_oportunidad:
          'oportunidad-test',

        id_voluntario:
          'voluntario-test',

        estado:
          'ACEPTADA',

        oportunidad_estado:
          'FINALIZADA',

        fecha_inicio:
          '2099-01-01T10:00:00.000Z',
      });


    inscripcionRepository
      .marcarResultadoParticipacion
      .mockResolvedValue({
        id_inscripcion:
          idInscripcion,

        id_voluntario:
          'voluntario-test',

        estado:
          'AUSENTE',
      });


    const response =
      await request(app)
        .patch(
          `/api/inscripciones/${idInscripcion}/resultado`
        )
        .set(
          'Authorization',
          `Bearer ${tokenOrganizacion}`
        )
        .send({
          estado:
            'AUSENTE',
        });


    expect(
      response.status
    ).toBe(200);


    expect(
      inscripcionRepository
        .marcarResultadoParticipacion
    ).toHaveBeenCalledWith(
      idInscripcion,
      'AUSENTE'
    );

  }
);
test(
  'rechaza registrar el resultado si la inscripción no está aceptada',
  async () => {

    const idInscripcion =
      '11111111-1111-4111-8111-111111111111';


    inscripcionRepository
      .buscarPorId
      .mockResolvedValue({
        id_inscripcion:
          idInscripcion,

        id_organizacion:
          'organizacion-test',

        id_oportunidad:
          'oportunidad-test',

        id_voluntario:
          'voluntario-test',

        estado:
          'PENDIENTE',

        oportunidad_estado:
          'FINALIZADA',

        fecha_inicio:
          '2099-01-01T10:00:00.000Z',
      });


    const response =
      await request(app)
        .patch(
          `/api/inscripciones/${idInscripcion}/resultado`
        )
        .set(
          'Authorization',
          `Bearer ${tokenOrganizacion}`
        )
        .send({
          estado:
            'COMPLETADA',
        });


    expect(
      response.status
    ).toBe(409);


    expect(
      inscripcionRepository
        .marcarResultadoParticipacion
    ).not.toHaveBeenCalled();

  }
);
test(
  'rechaza registrar el resultado si la actividad no está finalizada',
  async () => {

    const idInscripcion =
      '11111111-1111-4111-8111-111111111111';


    inscripcionRepository
      .buscarPorId
      .mockResolvedValue({
        id_inscripcion:
          idInscripcion,

        id_organizacion:
          'organizacion-test',

        id_oportunidad:
          'oportunidad-test',

        id_voluntario:
          'voluntario-test',

        estado:
          'ACEPTADA',

        oportunidad_estado:
          'CERRADA',

        fecha_inicio:
          '2099-01-01T10:00:00.000Z',
      });


    const response =
      await request(app)
        .patch(
          `/api/inscripciones/${idInscripcion}/resultado`
        )
        .set(
          'Authorization',
          `Bearer ${tokenOrganizacion}`
        )
        .send({
          estado:
            'COMPLETADA',
        });


    expect(
      response.status
    ).toBe(409);


    expect(
      inscripcionRepository
        .marcarResultadoParticipacion
    ).not.toHaveBeenCalled();

  }
);
test(
  'rechaza registrar el resultado cuando la inscripción pertenece a otra organización',
  async () => {

    const idInscripcion =
      '11111111-1111-4111-8111-111111111111';


    inscripcionRepository
      .buscarPorId
      .mockResolvedValue({
        id_inscripcion:
          idInscripcion,

        id_organizacion:
          'otra-organizacion',

        id_oportunidad:
          'oportunidad-test',

        id_voluntario:
          'voluntario-test',

        estado:
          'ACEPTADA',

        oportunidad_estado:
          'FINALIZADA',
      });


    const response =
      await request(app)
        .patch(
          `/api/inscripciones/${idInscripcion}/resultado`
        )
        .set(
          'Authorization',
          `Bearer ${tokenOrganizacion}`
        )
        .send({
          estado:
            'COMPLETADA',
        });


    expect(
      response.status
    ).toBe(403);


    expect(
      inscripcionRepository
        .marcarResultadoParticipacion
    ).not.toHaveBeenCalled();

  }
);
test(
  'rechaza un resultado de participación no válido',
  async () => {

    const idInscripcion =
      '11111111-1111-4111-8111-111111111111';


    const response =
      await request(app)
        .patch(
          `/api/inscripciones/${idInscripcion}/resultado`
        )
        .set(
          'Authorization',
          `Bearer ${tokenOrganizacion}`
        )
        .send({
          estado:
            'PENDIENTE',
        });


    expect(
      response.status
    ).toBe(400);


    expect(
      inscripcionRepository
        .marcarResultadoParticipacion
    ).not.toHaveBeenCalled();

  }
);
test(
  'rechaza a un voluntario que intenta registrar el resultado de participación',
  async () => {

    const idInscripcion =
      '11111111-1111-4111-8111-111111111111';


    const response =
      await request(app)
        .patch(
          `/api/inscripciones/${idInscripcion}/resultado`
        )
        .set(
          'Authorization',
          `Bearer ${tokenVoluntario}`
        )
        .send({
          estado:
            'COMPLETADA',
        });


    expect(
      response.status
    ).toBe(403);


    expect(
      inscripcionRepository
        .marcarResultadoParticipacion
    ).not.toHaveBeenCalled();

  }
);

  }
);


// ======================================================
// PATCH /api/inscripciones/:idInscripcion/ocultar
// ======================================================

describe(
  'PATCH /api/inscripciones/:idInscripcion/ocultar',
  () => {

    test(
      'permite al voluntario ocultar una inscripción rechazada propia',
      async () => {

        const idInscripcion =
          '11111111-1111-4111-8111-111111111111';


        inscripcionRepository
          .buscarPorId
          .mockResolvedValue({
            id_inscripcion:
              idInscripcion,

            id_voluntario:
              'voluntario-test',

            estado:
              'RECHAZADA',

            oportunidad_estado:
              'PUBLICADA',
          });


        const response =
          await request(app)
            .patch(
              `/api/inscripciones/${idInscripcion}/ocultar`
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          inscripcionRepository
            .ocultarParaVoluntario
        ).toHaveBeenCalledWith(
          idInscripcion
        );

      }
    );


    test(
      'permite ocultar una inscripción cuando la actividad fue cancelada',
      async () => {

        const idInscripcion =
          '11111111-1111-4111-8111-111111111111';


        inscripcionRepository
          .buscarPorId
          .mockResolvedValue({
            id_inscripcion:
              idInscripcion,

            id_voluntario:
              'voluntario-test',

            estado:
              'ACEPTADA',

            oportunidad_estado:
              'CANCELADA',
          });


        const response =
          await request(app)
            .patch(
              `/api/inscripciones/${idInscripcion}/ocultar`
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          inscripcionRepository
            .ocultarParaVoluntario
        ).toHaveBeenCalledWith(
          idInscripcion
        );

      }
    );


    test(
      'rechaza ocultar una inscripción perteneciente a otro voluntario',
      async () => {

        const idInscripcion =
          '11111111-1111-4111-8111-111111111111';


        inscripcionRepository
          .buscarPorId
          .mockResolvedValue({
            id_inscripcion:
              idInscripcion,

            id_voluntario:
              'otro-voluntario',

            estado:
              'RECHAZADA',

            oportunidad_estado:
              'PUBLICADA',
          });


        const response =
          await request(app)
            .patch(
              `/api/inscripciones/${idInscripcion}/ocultar`
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(403);


        expect(
          inscripcionRepository
            .ocultarParaVoluntario
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza ocultar una inscripción activa cuya actividad no está cancelada',
      async () => {

        const idInscripcion =
          '11111111-1111-4111-8111-111111111111';


        inscripcionRepository
          .buscarPorId
          .mockResolvedValue({
            id_inscripcion:
              idInscripcion,

            id_voluntario:
              'voluntario-test',

            estado:
              'ACEPTADA',

            oportunidad_estado:
              'PUBLICADA',
          });


        const response =
          await request(app)
            .patch(
              `/api/inscripciones/${idInscripcion}/ocultar`
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(409);


        expect(
          inscripcionRepository
            .ocultarParaVoluntario
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza a una organización que intenta ocultar una inscripción del voluntario',
      async () => {

        const idInscripcion =
          '11111111-1111-4111-8111-111111111111';


        const response =
          await request(app)
            .patch(
              `/api/inscripciones/${idInscripcion}/ocultar`
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            );


        expect(
          response.status
        ).toBe(403);


        expect(
          inscripcionRepository
            .ocultarParaVoluntario
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza ocultar una inscripción con identificador inválido',
      async () => {

        const response =
          await request(app)
            .patch(
              '/api/inscripciones/id-invalido/ocultar'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(400);


        expect(
          inscripcionRepository
            .ocultarParaVoluntario
        ).not.toHaveBeenCalled();

      }
    );

  }
);


// ======================================================
// CP-INS-007 - SIMULACIÓN DE CONCURRENCIA ÚLTIMO CUPO
// ======================================================

describe(
  'CP-INS-007 - concurrencia simulada por el último cupo',
  () => {

    test(
      'solo una de dos aceptaciones concurrentes obtiene el último cupo',
      async () => {

        const idInscripcion1 =
          '11111111-1111-4111-8111-111111111111';

        const idInscripcion2 =
          '22222222-2222-4222-8222-222222222222';


        inscripcionRepository
          .buscarPorId
          .mockImplementation(
            async (idInscripcion) => ({
              id_inscripcion:
                idInscripcion,

              id_organizacion:
                'organizacion-test',

              id_oportunidad:
                '33333333-3333-4333-8333-333333333333',

              id_voluntario:
                idInscripcion ===
                idInscripcion1
                  ? 'voluntario-1'
                  : 'voluntario-2',

              estado:
                'PENDIENTE',

              oportunidad_estado:
                'PUBLICADA',

              fecha_inicio:
                '2099-01-01T10:00:00.000Z',
            })
          );


        let ultimoCupoOcupado =
          false;


        inscripcionRepository
          .aceptarConControlCupo
          .mockImplementation(
            async (idInscripcion) => {

              if (
                ultimoCupoOcupado
              ) {

                const error =
                  new Error(
                    'No hay cupos disponibles'
                  );

                error.status =
                  409;

                throw error;

              }


              ultimoCupoOcupado =
                true;


              return {
                id_inscripcion:
                  idInscripcion,

                estado:
                  'ACEPTADA',
              };

            }
          );


        const [
          response1,
          response2,
        ] =
          await Promise.all([
            request(app)
              .patch(
                `/api/inscripciones/${idInscripcion1}/aceptar`
              )
              .set(
                'Authorization',
                `Bearer ${tokenOrganizacion}`
              ),

            request(app)
              .patch(
                `/api/inscripciones/${idInscripcion2}/aceptar`
              )
              .set(
                'Authorization',
                `Bearer ${tokenOrganizacion}`
              ),
          ]);


        const estados =
          [
            response1.status,
            response2.status,
          ].sort();


        expect(
          estados
        ).toEqual(
          [
            200,
            409,
          ]
        );


        expect(
          inscripcionRepository
            .aceptarConControlCupo
        ).toHaveBeenCalledTimes(
          2
        );

      }
    );

  }
);


// ======================================================
// CP-INS-009 - RECÁLCULO SIMULADO DE CUPO
// ======================================================

describe(
  'CP-INS-009 - recálculo simulado del cupo',
  () => {

    test(
      'cancelar una inscripción aceptada libera capacidad para una nueva inscripción',
      async () => {

        const idInscripcion =
          '11111111-1111-4111-8111-111111111111';


        let cuposOcupados =
          1;


        oportunidadRepository
          .buscarOportunidadPorId
          .mockResolvedValue({
            ...oportunidadPublicada,

            cupo_total:
              1,
          });


        inscripcionRepository
          .buscarPorId
          .mockResolvedValue({
            id_inscripcion:
              idInscripcion,

            id_voluntario:
              'voluntario-test',

            estado:
              'ACEPTADA',

            oportunidad_estado:
              'PUBLICADA',

            fecha_inicio:
              '2099-01-01T10:00:00.000Z',
          });


        inscripcionRepository
          .cancelarPorVoluntario
          .mockImplementation(
            async () => {

              cuposOcupados =
                0;


              return {
                id_inscripcion:
                  idInscripcion,

                id_voluntario:
                  'voluntario-test',

                estado:
                  'CANCELADA',
              };

            }
          );


        inscripcionRepository
          .contarAceptadasPorOportunidad
          .mockImplementation(
            async () =>
              cuposOcupados
          );


        const cancelacion =
          await request(app)
            .patch(
              `/api/inscripciones/${idInscripcion}/cancelar`
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          cancelacion.status
        ).toBe(200);


        expect(
          cuposOcupados
        ).toBe(0);


        const nuevaInscripcion =
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
          nuevaInscripcion.status
        ).toBe(201);


        expect(
          inscripcionRepository
            .crear
        ).toHaveBeenCalled();

      }
    );


    test(
      'rechazar una inscripción pendiente no libera ni consume capacidad',
      async () => {

        const idInscripcion =
          '11111111-1111-4111-8111-111111111111';


        let cuposOcupados =
          1;


        oportunidadRepository
          .buscarOportunidadPorId
          .mockResolvedValue({
            ...oportunidadPublicada,

            cupo_total:
              1,
          });


        inscripcionRepository
          .buscarPorId
          .mockResolvedValue({
            id_inscripcion:
              idInscripcion,

            id_organizacion:
              'organizacion-test',

            id_voluntario:
              'voluntario-test',

            estado:
              'PENDIENTE',

            oportunidad_estado:
              'PUBLICADA',

            fecha_inicio:
              '2099-01-01T10:00:00.000Z',
          });


        inscripcionRepository
          .contarAceptadasPorOportunidad
          .mockImplementation(
            async () =>
              cuposOcupados
          );


        const rechazo =
          await request(app)
            .patch(
              `/api/inscripciones/${idInscripcion}/rechazar`
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            );


        expect(
          rechazo.status
        ).toBe(200);


        expect(
          cuposOcupados
        ).toBe(1);


        const nuevaInscripcion =
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
          nuevaInscripcion.status
        ).toBe(409);


        expect(
          inscripcionRepository
            .crear
        ).not.toHaveBeenCalled();

      }
    );

  }
);


// ======================================================
// CONTRATO DE DATOS - GESTIÓN DE PARTICIPANTES
// ======================================================

describe(
  'Contrato de datos de participantes',
  () => {

    test(
      'el listado para la organización expone solo los datos necesarios del voluntario',
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
              'PUBLICADA',
          });


        inscripcionRepository
          .listarPorOportunidad
          .mockResolvedValue([
            {
              id_inscripcion:
                '11111111-1111-4111-8111-111111111111',

              id_voluntario:
                'voluntario-test',

              nombre:
                'Voluntario',

              apellido:
                'Prueba',

              estado:
                'PENDIENTE',
            },
          ]);


        const response =
          await request(app)
            .get(
              `/api/inscripciones/oportunidad/${idOportunidad}`
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            );


        expect(
          response.status
        ).toBe(200);


        const textoRespuesta =
          JSON.stringify(
            response.body
          );


        expect(
          textoRespuesta
        ).not.toContain(
          '"email"'
        );

        expect(
          textoRespuesta
        ).not.toContain(
          '"password_hash"'
        );

        expect(
          textoRespuesta
        ).not.toContain(
          '"cuit"'
        );

      }
    );

  }
);