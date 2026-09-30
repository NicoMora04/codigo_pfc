process.env.JWT_SECRET =
  'test-secret';

const request =
  require('supertest');

const jwt =
  require('jsonwebtoken');


// ======================================================
// MOCK BASE DE DATOS
// ======================================================

jest.mock(
  '../src/config/db',
  () => ({
    query:
      jest.fn(),
  })
);


// ======================================================
// MOCK REPOSITORIO DE ORGANIZACIONES
// ======================================================

jest.mock(
  '../src/repositories/organizacionRepository',
  () => ({

    solicitarNuevaVerificacion:
      jest.fn(),

    listarDisponiblesParaDonacion:
      jest.fn(),

    obtenerDetalleDisponibleDonacion:
      jest.fn(),

  })
);


const pool =
  require(
    '../src/config/db'
  );

const organizacionRepository =
  require(
    '../src/repositories/organizacionRepository'
  );

const app =
  require(
    '../src/index'
  );


// ======================================================
// DATOS DE PRUEBA
// ======================================================

const idVoluntario =
  '11111111-1111-4111-8111-111111111111';

const idOrganizacion =
  '44444444-4444-4444-8444-444444444444';


const tokenVoluntario =
  jwt.sign(
    {
      id:
        idVoluntario,

      rol:
        'VOLUNTARIO',
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        '1h',
    }
  );


const tokenOrganizacion =
  jwt.sign(
    {
      id:
        '22222222-2222-4222-8222-222222222222',

      rol:
        'ORGANIZACION',
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        '1h',
    }
  );


const organizacionDisponible = {

  id_organizacion:
    idOrganizacion,

  razon_social:
    'Actitud Solidaria',

  estado_verificacion:
    'VERIFICADA',

  latitud:
    -31.6333,

  longitud:
    -60.7,

  localidad:
    'Santa Fe',

  provincia:
    'Santa Fe',

  es_aproximada:
    true,

  tipos_actividad: [
    {
      id_tipo_actividad:
        1,

      nombre:
        'Asistencia social',
    },
  ],

};


const detalleOrganizacion = {

  ...organizacionDisponible,

  nombre_visible:
    'Actitud Solidaria',

  descripcion_publica:
    'Organización social de prueba',

  sitio_web_url:
    null,

  email_contacto_publico:
    'contacto@ejemplo.org',

  telefono_contacto_publico:
    null,

};


// ======================================================
// CONFIGURACIÓN GENERAL
// ======================================================

beforeEach(() => {

  jest.clearAllMocks();


  // Usuario autenticado activo.

  pool.query
    .mockResolvedValue({
      rows: [
        {
          estado_cuenta:
            'ACTIVA',
        },
      ],
    });


  organizacionRepository
    .listarDisponiblesParaDonacion
    .mockResolvedValue([
      organizacionDisponible,
    ]);


  organizacionRepository
    .obtenerDetalleDisponibleDonacion
    .mockResolvedValue(
      detalleOrganizacion
    );

});


// ======================================================
// GET /api/organizaciones/disponibles-donacion
// ======================================================

describe(
  'GET /api/organizaciones/disponibles-donacion',
  () => {

    test(
      'rechaza una solicitud sin JWT',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/organizaciones/disponibles-donacion'
            );


        expect(
          response.status
        ).toBe(401);


        expect(
          organizacionRepository
            .listarDisponiblesParaDonacion
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza el acceso con rol ORGANIZACION',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/organizaciones/disponibles-donacion'
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            );


        expect(
          response.status
        ).toBe(403);


        expect(
          organizacionRepository
            .listarDisponiblesParaDonacion
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'permite al voluntario consultar organizaciones disponibles',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/organizaciones/disponibles-donacion'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          response.body.organizaciones
        ).toHaveLength(1);


        expect(
          organizacionRepository
            .listarDisponiblesParaDonacion
        ).toHaveBeenCalledWith({

          nombre:
            null,

          idTipoActividad:
            null,

          latitud:
            null,

          longitud:
            null,

          radioBusquedaKm:
            null,

        });

      }
    );


    test(
      'normaliza los filtros enviados por el voluntario',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/organizaciones/disponibles-donacion'
            )
            .query({

              nombre:
                '  Actitud  ',

              id_tipo_actividad:
                '2',

              latitud:
                '-31.6333',

              longitud:
                '-60.7',

              radio_km:
                '10',

            })
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          organizacionRepository
            .listarDisponiblesParaDonacion
        ).toHaveBeenCalledWith({

          nombre:
            'Actitud',

          idTipoActividad:
            2,

          latitud:
            -31.6333,

          longitud:
            -60.7,

          radioBusquedaKm:
            10,

        });

      }
    );


    test(
      'rechaza un tipo de actividad inválido',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/organizaciones/disponibles-donacion'
            )
            .query({
              id_tipo_actividad:
                'abc',
            })
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(400);


        expect(
          organizacionRepository
            .listarDisponiblesParaDonacion
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza un filtro de cercanía incompleto',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/organizaciones/disponibles-donacion'
            )
            .query({
              latitud:
                '-31.6333',
            })
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(400);


        expect(
          organizacionRepository
            .listarDisponiblesParaDonacion
        ).not.toHaveBeenCalled();

      }
    );

  }
);


// ======================================================
// GET /api/organizaciones/:id/detalle-donacion
// ======================================================

describe(
  'GET /api/organizaciones/:id/detalle-donacion',
  () => {

    test(
      'rechaza consultar el detalle sin JWT',
      async () => {

        const response =
          await request(app)
            .get(
              `/api/organizaciones/${idOrganizacion}/detalle-donacion`
            );


        expect(
          response.status
        ).toBe(401);


        expect(
          organizacionRepository
            .obtenerDetalleDisponibleDonacion
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza un identificador de organización inválido',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/organizaciones/id-invalido/detalle-donacion'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(400);


        expect(
          organizacionRepository
            .obtenerDetalleDisponibleDonacion
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'devuelve 404 si la organización no está disponible',
      async () => {

        organizacionRepository
          .obtenerDetalleDisponibleDonacion
          .mockResolvedValueOnce(
            undefined
          );


        const response =
          await request(app)
            .get(
              `/api/organizaciones/${idOrganizacion}/detalle-donacion`
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(404);

      }
    );


    test(
      'permite consultar el detalle de una organización disponible',
      async () => {

        const response =
          await request(app)
            .get(
              `/api/organizaciones/${idOrganizacion}/detalle-donacion`
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          response.body
            .organizacion
            .id_organizacion
        ).toBe(
          idOrganizacion
        );


        expect(
          organizacionRepository
            .obtenerDetalleDisponibleDonacion
        ).toHaveBeenCalledWith(
          idOrganizacion
        );

      }
    );

  }
);