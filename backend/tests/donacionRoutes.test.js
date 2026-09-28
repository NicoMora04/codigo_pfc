process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');


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
// MOCK DE REPOSITORIO DE DONACIONES
// ======================================================

jest.mock(
  '../src/repositories/donacionRepository',
  () => ({

    listarCategorias:
      jest.fn(),

    crearDonacionTransaccional:
      jest.fn(),

    buscarDonacionPropiaPorId:
      jest.fn(),

    actualizarImagenDonacion:
      jest.fn(),

    listarDonacionesPropias:
      jest.fn(),

    obtenerDetalleDonacionPropia:
      jest.fn(),

  })
);


const pool =
  require('../src/config/db');

const donacionRepository =
  require(
    '../src/repositories/donacionRepository'
  );

const app =
  require('../src/index');


// ======================================================
// TOKENS DE PRUEBA
// ======================================================

const tokenVoluntario =
  jwt.sign(
    {
      id:
        '11111111-1111-4111-8111-111111111111',

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


const tokenAdmin =
  jwt.sign(
    {
      id:
        '33333333-3333-4333-8333-333333333333',

      rol:
        'ADMIN',
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        '1h',
    }
  );

// ======================================================
// DATOS BASE DE DONACIÓN
// ======================================================

const idVoluntario =
  '11111111-1111-4111-8111-111111111111';

const idOrganizacion =
  '44444444-4444-4444-8444-444444444444';

const idUbicacion =
  '55555555-5555-4555-8555-555555555555';

const idDonacion =
  '66666666-6666-4666-8666-666666666666';

const idempotencyKey =
  '77777777-7777-4777-8777-777777777777';


const donacionValida = {

  id_organizacion:
    idOrganizacion,

  id_categoria_donacion:
    1,

  id_ubicacion:
    idUbicacion,

  descripcion:
    'Cinco paquetes de alimentos',

  cantidad:
    5,

  unidad:
    'paquetes',

  condicion_bien:
    'Nuevo',

  disponible_desde:
    '2099-01-01',

};


const donacionCreada = {

  id_donacion:
    idDonacion,

  id_voluntario:
    idVoluntario,

  ...donacionValida,

  estado:
    'PENDIENTE',

};

const jpegValido =
  Buffer.from([
    0xFF,
    0xD8,
    0xFF,
    0xE0,
    0x00,
    0x10,
    0x4A,
    0x46,
    0x49,
    0x46,
  ]);

  const pngValido =
  Buffer.from([
    0x89,
    0x50,
    0x4E,
    0x47,
    0x0D,
    0x0A,
    0x1A,
    0x0A,
  ]);


const webpValido =
  Buffer.from([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x00, 0x00, 0x00, 0x00,
    0x57, 0x45, 0x42, 0x50, // WEBP
  ]);
// ======================================================
// CONFIGURACIÓN GENERAL
// ======================================================

beforeEach(() => {

  jest.clearAllMocks();


  // Por defecto consideramos que el usuario
  // autenticado existe y posee una cuenta activa.

  pool.query.mockResolvedValue({
    rows: [
      {
        estado_cuenta:
          'ACTIVA',
      },
    ],
  });


  donacionRepository
    .listarCategorias
    .mockResolvedValue([
      {
        id_categoria_donacion:
          1,

        nombre:
          'Alimentos',

        descripcion:
          'Alimentos y productos relacionados',
      },

      {
        id_categoria_donacion:
          2,

        nombre:
          'Ropa',

        descripcion:
          'Prendas y artículos textiles',
      },
    ]);

});

donacionRepository
  .crearDonacionTransaccional
  .mockResolvedValue({

    donacion:
      donacionCreada,

    reutilizada:
      false,

  });

donacionRepository
  .listarDonacionesPropias
  .mockResolvedValue([
    {
      ...donacionCreada,

      nombre_organizacion:
        'Organización de prueba',
    },
  ]);


donacionRepository
  .obtenerDetalleDonacionPropia
  .mockResolvedValue({
    ...donacionCreada,

    nombre_organizacion:
      'Organización de prueba',
});

donacionRepository
  .buscarDonacionPropiaPorId
  .mockResolvedValue({

    id_donacion:
      idDonacion,

    id_voluntario:
      idVoluntario,

    imagen_url:
      null,

  });


donacionRepository
  .actualizarImagenDonacion
  .mockImplementation(
    async (
      idDonacionRecibido,
      idVoluntarioRecibido,
      imagenUrl
    ) => ({

      id_donacion:
        idDonacionRecibido,

      id_voluntario:
        idVoluntarioRecibido,

      imagen_url:
        imagenUrl,

    })
  );
// ======================================================
// GET /api/donaciones/categorias
// ======================================================

describe(
  'GET /api/donaciones/categorias',
  () => {

    test(
      'rechaza una solicitud sin JWT',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/donaciones/categorias'
            );


        expect(
          response.status
        ).toBe(401);


        expect(
          donacionRepository
            .listarCategorias
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza un JWT inválido',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/donaciones/categorias'
            )
            .set(
              'Authorization',
              'Bearer token-invalido'
            );


        expect(
          response.status
        ).toBe(401);


        expect(
          donacionRepository
            .listarCategorias
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza una organización por rol',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/donaciones/categorias'
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            );


        expect(
          response.status
        ).toBe(403);


        expect(
          donacionRepository
            .listarCategorias
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza un administrador por rol',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/donaciones/categorias'
            )
            .set(
              'Authorization',
              `Bearer ${tokenAdmin}`
            );


        expect(
          response.status
        ).toBe(403);


        expect(
          donacionRepository
            .listarCategorias
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza un usuario inexistente',
      async () => {

        pool.query.mockResolvedValueOnce({
          rows: [],
        });


        const response =
          await request(app)
            .get(
              '/api/donaciones/categorias'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(401);


        expect(
          donacionRepository
            .listarCategorias
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza un voluntario con cuenta no activa',
      async () => {

        pool.query.mockResolvedValueOnce({
          rows: [
            {
              estado_cuenta:
                'DESHABILITADA',
            },
          ],
        });


        const response =
          await request(app)
            .get(
              '/api/donaciones/categorias'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(403);


        expect(
          donacionRepository
            .listarCategorias
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'permite a un voluntario activo consultar las categorías',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/donaciones/categorias'
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
            response.body.categorias
          )
        ).toBe(true);


        expect(
          response.body.categorias
        ).toHaveLength(2);


        expect(
          donacionRepository
            .listarCategorias
        ).toHaveBeenCalledTimes(1);

      }
    );

  }
);


// ======================================================
// POST /api/donaciones
// ======================================================

describe(
  'POST /api/donaciones',
  () => {

    test(
      'rechaza registrar una donación sin JWT',
      async () => {

        const response =
          await request(app)
            .post(
              '/api/donaciones'
            )
            .set(
              'Idempotency-Key',
              idempotencyKey
            )
            .send(
              donacionValida
            );


        expect(
          response.status
        ).toBe(401);


        expect(
          donacionRepository
            .crearDonacionTransaccional
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza registrar una donación con rol ORGANIZACION',
      async () => {

        const response =
          await request(app)
            .post(
              '/api/donaciones'
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            )
            .set(
              'Idempotency-Key',
              idempotencyKey
            )
            .send(
              donacionValida
            );


        expect(
          response.status
        ).toBe(403);


        expect(
          donacionRepository
            .crearDonacionTransaccional
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'registra una donación válida en estado PENDIENTE',
      async () => {

        const response =
          await request(app)
            .post(
              '/api/donaciones'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            )
            .set(
              'Idempotency-Key',
              idempotencyKey
            )
            .send(
              donacionValida
            );


        expect(
          response.status
        ).toBe(201);


        expect(
          response.body.donacion.estado
        ).toBe(
          'PENDIENTE'
        );


        expect(
          donacionRepository
            .crearDonacionTransaccional
        ).toHaveBeenCalledWith({

          idVoluntario,

          idOrganizacion,

          idCategoriaDonacion:
            1,

          idUbicacion,

          descripcion:
            'Cinco paquetes de alimentos',

          cantidad:
            5,

          unidad:
            'paquetes',

          condicionBien:
            'Nuevo',

          disponibleDesde:
            '2099-01-01',

          idempotencyKey,

        });

      }
    );


    test(
      'permite registrar una donación sin ubicación',
      async () => {

        const datos = {
          ...donacionValida,
          id_ubicacion:
            null,
        };


        const response =
          await request(app)
            .post(
              '/api/donaciones'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            )
            .set(
              'Idempotency-Key',
              idempotencyKey
            )
            .send(
              datos
            );


        expect(
          response.status
        ).toBe(201);


        expect(
          donacionRepository
            .crearDonacionTransaccional
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            idUbicacion:
              null,
          })
        );

      }
    );


    test(
      'rechaza una donación sin descripción',
      async () => {

        const response =
          await request(app)
            .post(
              '/api/donaciones'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            )
            .set(
              'Idempotency-Key',
              idempotencyKey
            )
            .send({
              ...donacionValida,
              descripcion:
                '',
            });


        expect(
          response.status
        ).toBe(400);


        expect(
          donacionRepository
            .crearDonacionTransaccional
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza una cantidad igual a cero',
      async () => {

        const response =
          await request(app)
            .post(
              '/api/donaciones'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            )
            .set(
              'Idempotency-Key',
              idempotencyKey
            )
            .send({
              ...donacionValida,
              cantidad:
                0,
            });


        expect(
          response.status
        ).toBe(400);


        expect(
          donacionRepository
            .crearDonacionTransaccional
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza una cantidad no numérica',
      async () => {

        const response =
          await request(app)
            .post(
              '/api/donaciones'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            )
            .set(
              'Idempotency-Key',
              idempotencyKey
            )
            .send({
              ...donacionValida,
              cantidad:
                'abc',
            });


        expect(
          response.status
        ).toBe(400);


        expect(
          donacionRepository
            .crearDonacionTransaccional
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza una donación sin condición del bien',
      async () => {

        const response =
          await request(app)
            .post(
              '/api/donaciones'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            )
            .set(
              'Idempotency-Key',
              idempotencyKey
            )
            .send({
              ...donacionValida,
              condicion_bien:
                '',
            });


        expect(
          response.status
        ).toBe(400);


        expect(
          donacionRepository
            .crearDonacionTransaccional
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza una clave de idempotencia inválida',
      async () => {

        const response =
          await request(app)
            .post(
              '/api/donaciones'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            )
            .set(
              'Idempotency-Key',
              'clave-invalida'
            )
            .send(
              donacionValida
            );


        expect(
          response.status
        ).toBe(400);


        expect(
          donacionRepository
            .crearDonacionTransaccional
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza una fecha de disponibilidad anterior a hoy',
      async () => {

        const response =
          await request(app)
            .post(
              '/api/donaciones'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            )
            .set(
              'Idempotency-Key',
              idempotencyKey
            )
            .send({
              ...donacionValida,
              disponible_desde:
                '2000-01-01',
            });


        expect(
          response.status
        ).toBe(400);


        expect(
          donacionRepository
            .crearDonacionTransaccional
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'devuelve 200 cuando la clave de idempotencia reutiliza la donación existente',
      async () => {

        donacionRepository
          .crearDonacionTransaccional
          .mockResolvedValueOnce({

            donacion:
              donacionCreada,

            reutilizada:
              true,

          });


        const response =
          await request(app)
            .post(
              '/api/donaciones'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            )
            .set(
              'Idempotency-Key',
              idempotencyKey
            )
            .send(
              donacionValida
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          response.body.message
        ).toBe(
          'La donación ya había sido registrada'
        );

      }
    );

  }
);

// ======================================================
// GET /api/donaciones/mias
// ======================================================

describe(
  'GET /api/donaciones/mias',
  () => {

    test(
      'rechaza consultar las donaciones sin JWT',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/donaciones/mias'
            );


        expect(
          response.status
        ).toBe(401);


        expect(
          donacionRepository
            .listarDonacionesPropias
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza a una organización por rol',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/donaciones/mias'
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            );


        expect(
          response.status
        ).toBe(403);


        expect(
          donacionRepository
            .listarDonacionesPropias
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'lista únicamente las donaciones del voluntario autenticado',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/donaciones/mias'
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
            response.body.donaciones
          )
        ).toBe(true);


        expect(
          donacionRepository
            .listarDonacionesPropias
        ).toHaveBeenCalledWith(
          idVoluntario,
          null
        );

      }
    );


    test(
      'normaliza y aplica un filtro de estado válido',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/donaciones/mias?estado=aceptada'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          donacionRepository
            .listarDonacionesPropias
        ).toHaveBeenCalledWith(
          idVoluntario,
          'ACEPTADA'
        );

      }
    );


    test(
      'rechaza un filtro de estado inválido',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/donaciones/mias?estado=INVALIDO'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(400);


        expect(
          donacionRepository
            .listarDonacionesPropias
        ).not.toHaveBeenCalled();

      }
    );

  }
);


// ======================================================
// GET /api/donaciones/:id
// ======================================================

describe(
  'GET /api/donaciones/:id',
  () => {

    test(
      'rechaza consultar el detalle sin JWT',
      async () => {

        const response =
          await request(app)
            .get(
              `/api/donaciones/${idDonacion}`
            );


        expect(
          response.status
        ).toBe(401);


        expect(
          donacionRepository
            .obtenerDetalleDonacionPropia
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'permite consultar el detalle de una donación propia',
      async () => {

        const response =
          await request(app)
            .get(
              `/api/donaciones/${idDonacion}`
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          response.body.donacion
            .id_donacion
        ).toBe(
          idDonacion
        );


        expect(
          donacionRepository
            .obtenerDetalleDonacionPropia
        ).toHaveBeenCalledWith(
          idDonacion,
          idVoluntario
        );

      }
    );


    test(
      'rechaza un identificador de donación inválido',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/donaciones/id-invalido'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(400);


        expect(
          donacionRepository
            .obtenerDetalleDonacionPropia
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza consultar una donación ajena',
      async () => {

        donacionRepository
          .obtenerDetalleDonacionPropia
          .mockResolvedValueOnce(
            null
          );


        const response =
          await request(app)
            .get(
              `/api/donaciones/${idDonacion}`
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(404);


        expect(
          donacionRepository
            .obtenerDetalleDonacionPropia
        ).toHaveBeenCalledWith(
          idDonacion,
          idVoluntario
        );

      }
    );

  }
);

// ======================================================
// PATCH /api/donaciones/:id/imagen
// ======================================================

describe(
  'PATCH /api/donaciones/:id/imagen',
  () => {

    test(
      'rechaza cargar una imagen sin JWT',
      async () => {

        const response =
          await request(app)
            .patch(
              `/api/donaciones/${idDonacion}/imagen`
            )
            .attach(
              'imagen',
              jpegValido,
              {
                filename:
                  'donacion.jpg',

                contentType:
                  'image/jpeg',
              }
            );


        expect(
          response.status
        ).toBe(401);


        expect(
          donacionRepository
            .buscarDonacionPropiaPorId
        ).not.toHaveBeenCalled();


        expect(
          donacionRepository
            .actualizarImagenDonacion
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza cargar una imagen con rol ORGANIZACION',
      async () => {

        const response =
          await request(app)
            .patch(
              `/api/donaciones/${idDonacion}/imagen`
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            )
            .attach(
              'imagen',
              jpegValido,
              {
                filename:
                  'donacion.jpg',

                contentType:
                  'image/jpeg',
              }
            );


        expect(
          response.status
        ).toBe(403);


        expect(
          donacionRepository
            .buscarDonacionPropiaPorId
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza un identificador de donación inválido antes de procesar la imagen',
      async () => {

        const response =
          await request(app)
            .patch(
              '/api/donaciones/id-invalido/imagen'
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            )
            .attach(
              'imagen',
              jpegValido,
              {
                filename:
                  'donacion.jpg',

                contentType:
                  'image/jpeg',
              }
            );


        expect(
          response.status
        ).toBe(400);


        expect(
          donacionRepository
            .actualizarImagenDonacion
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza cargar una imagen en una donación ajena',
      async () => {

        donacionRepository
          .buscarDonacionPropiaPorId
          .mockResolvedValueOnce(
            null
          );


        const response =
          await request(app)
            .patch(
              `/api/donaciones/${idDonacion}/imagen`
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            )
            .attach(
              'imagen',
              jpegValido,
              {
                filename:
                  'donacion.jpg',

                contentType:
                  'image/jpeg',
              }
            );


        expect(
          response.status
        ).toBe(404);


        expect(
          donacionRepository
            .buscarDonacionPropiaPorId
        ).toHaveBeenCalledWith(
          idDonacion,
          idVoluntario
        );


        expect(
          donacionRepository
            .actualizarImagenDonacion
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza actualizar cuando no se envía ninguna imagen',
      async () => {

        const response =
          await request(app)
            .patch(
              `/api/donaciones/${idDonacion}/imagen`
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            );


        expect(
          response.status
        ).toBe(400);


        expect(
          response.body.error
        ).toBe(
          'No se recibió ninguna imagen'
        );


        expect(
          donacionRepository
            .actualizarImagenDonacion
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza una extensión de imagen no permitida',
      async () => {

        const response =
          await request(app)
            .patch(
              `/api/donaciones/${idDonacion}/imagen`
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            )
            .attach(
              'imagen',
              Buffer.from(
                'archivo de prueba'
              ),
              {
                filename:
                  'archivo.txt',

                contentType:
                  'text/plain',
              }
            );


        expect(
          response.status
        ).toBe(400);


        expect(
          response.body.error
        ).toBe(
          'La imagen debe ser JPG, PNG o WEBP'
        );


        expect(
          donacionRepository
            .actualizarImagenDonacion
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza un archivo JPG cuyo contenido no corresponde a una imagen válida',
      async () => {

        const response =
          await request(app)
            .patch(
              `/api/donaciones/${idDonacion}/imagen`
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            )
            .attach(
              'imagen',
              Buffer.from(
                'esto no es realmente una imagen'
              ),
              {
                filename:
                  'imagen-falsa.jpg',

                contentType:
                  'image/jpeg',
              }
            );


        expect(
          response.status
        ).toBe(400);


        expect(
          response.body.error
        ).toBe(
          'El contenido del archivo no corresponde a una imagen JPG, PNG o WEBP válida'
        );


        expect(
          donacionRepository
            .actualizarImagenDonacion
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'permite al propietario cargar una imagen JPEG válida',
      async () => {

        const response =
          await request(app)
            .patch(
              `/api/donaciones/${idDonacion}/imagen`
            )
            .set(
              'Authorization',
              `Bearer ${tokenVoluntario}`
            )
            .attach(
              'imagen',
              jpegValido,
              {
                filename:
                  'donacion.jpg',

                contentType:
                  'image/jpeg',
              }
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          response.body.donacion
            .imagen_url
        ).toMatch(
          /^\/uploads\/donaciones\/donacion-.+\.jpg$/
        );


        expect(
          donacionRepository
            .actualizarImagenDonacion
        ).toHaveBeenCalledWith(
          idDonacion,
          idVoluntario,
          expect.stringMatching(
            /^\/uploads\/donaciones\/donacion-.+\.jpg$/
          )
        );


        // Limpiamos solamente el archivo generado
        // por este test para no ensuciar uploads.

        const rutaCreada =
          path.join(
            __dirname,
            '..',
            response.body.donacion
              .imagen_url
              .replace(
                /^\/+/,
                ''
              )
          );


        if (
          fs.existsSync(
            rutaCreada
          )
        ) {

          fs.unlinkSync(
            rutaCreada
          );

        }

      }
    );

    test(
  'permite al propietario cargar una imagen PNG válida',
  async () => {

    const response =
      await request(app)
        .patch(
          `/api/donaciones/${idDonacion}/imagen`
        )
        .set(
          'Authorization',
          `Bearer ${tokenVoluntario}`
        )
        .attach(
          'imagen',
          pngValido,
          {
            filename:
              'donacion.png',

            contentType:
              'image/png',
          }
        );


    expect(
      response.status
    ).toBe(200);


    expect(
      response.body.donacion
        .imagen_url
    ).toMatch(
      /^\/uploads\/donaciones\/donacion-.+\.png$/
    );


    const rutaCreada =
      path.join(
        __dirname,
        '..',
        response.body.donacion
          .imagen_url
          .replace(
            /^\/+/,
            ''
          )
      );


    if (
      fs.existsSync(
        rutaCreada
      )
    ) {

      fs.unlinkSync(
        rutaCreada
      );

    }

  }
);


test(
  'permite al propietario cargar una imagen WEBP válida',
  async () => {

    const response =
      await request(app)
        .patch(
          `/api/donaciones/${idDonacion}/imagen`
        )
        .set(
          'Authorization',
          `Bearer ${tokenVoluntario}`
        )
        .attach(
          'imagen',
          webpValido,
          {
            filename:
              'donacion.webp',

            contentType:
              'image/webp',
          }
        );


    expect(
      response.status
    ).toBe(200);


    expect(
      response.body.donacion
        .imagen_url
    ).toMatch(
      /^\/uploads\/donaciones\/donacion-.+\.webp$/
    );


    const rutaCreada =
      path.join(
        __dirname,
        '..',
        response.body.donacion
          .imagen_url
          .replace(
            /^\/+/,
            ''
          )
      );


    if (
      fs.existsSync(
        rutaCreada
      )
    ) {

      fs.unlinkSync(
        rutaCreada
      );

    }

  }
);


test(
  'rechaza una imagen mayor a 5 MB',
  async () => {

    const imagenGrande =
      Buffer.alloc(
        5 * 1024 * 1024 + 1
      );


    // Firma JPEG válida al inicio.
    imagenGrande[0] =
      0xFF;

    imagenGrande[1] =
      0xD8;

    imagenGrande[2] =
      0xFF;


    const response =
      await request(app)
        .patch(
          `/api/donaciones/${idDonacion}/imagen`
        )
        .set(
          'Authorization',
          `Bearer ${tokenVoluntario}`
        )
        .attach(
          'imagen',
          imagenGrande,
          {
            filename:
              'demasiado-grande.jpg',

            contentType:
              'image/jpeg',
          }
        );


    expect(
      response.status
    ).toBe(400);


    expect(
      response.body.error
    ).toBe(
      'La imagen no puede superar los 5 MB'
    );


    expect(
      donacionRepository
        .actualizarImagenDonacion
    ).not.toHaveBeenCalled();

  }
);


test(
  'rechaza cuando MIME, extensión y contenido real no coinciden',
  async () => {

    const response =
      await request(app)
        .patch(
          `/api/donaciones/${idDonacion}/imagen`
        )
        .set(
          'Authorization',
          `Bearer ${tokenVoluntario}`
        )
        .attach(
          'imagen',
          pngValido,
          {
            filename:
              'imagen.jpg',

            contentType:
              'image/jpeg',
          }
        );


    expect(
      response.status
    ).toBe(400);


    expect(
      response.body.error
    ).toBe(
      'El contenido del archivo no corresponde a una imagen JPG, PNG o WEBP válida'
    );


    expect(
      donacionRepository
        .actualizarImagenDonacion
    ).not.toHaveBeenCalled();

  }
);


test(
  'reemplaza una imagen anterior y elimina el archivo viejo',
  async () => {

    const nombreAnterior =
      'imagen-anterior-test.jpg';


    const rutaAnterior =
      path.join(
        __dirname,
        '..',
        'uploads',
        'donaciones',
        nombreAnterior
      );


    fs.mkdirSync(
      path.dirname(
        rutaAnterior
      ),
      {
        recursive:
          true,
      }
    );


    fs.writeFileSync(
      rutaAnterior,
      jpegValido
    );


    donacionRepository
      .buscarDonacionPropiaPorId
      .mockResolvedValueOnce({

        id_donacion:
          idDonacion,

        id_voluntario:
          idVoluntario,

        imagen_url:
          `/uploads/donaciones/${nombreAnterior}`,

      });


    const response =
      await request(app)
        .patch(
          `/api/donaciones/${idDonacion}/imagen`
        )
        .set(
          'Authorization',
          `Bearer ${tokenVoluntario}`
        )
        .attach(
          'imagen',
          pngValido,
          {
            filename:
              'imagen-nueva.png',

            contentType:
              'image/png',
          }
        );


    expect(
      response.status
    ).toBe(200);


    expect(
      fs.existsSync(
        rutaAnterior
      )
    ).toBe(false);


    expect(
      response.body.donacion
        .imagen_url
    ).toMatch(
      /^\/uploads\/donaciones\/donacion-.+\.png$/
    );


    const rutaNueva =
      path.join(
        __dirname,
        '..',
        response.body.donacion
          .imagen_url
          .replace(
            /^\/+/,
            ''
          )
      );


    expect(
      fs.existsSync(
        rutaNueva
      )
    ).toBe(true);


    // Limpieza del archivo generado por el test.
    if (
      fs.existsSync(
        rutaNueva
      )
    ) {

      fs.unlinkSync(
        rutaNueva
      );

    }

  }
);
test(
  'conserva la imagen nueva si falla la eliminación de la imagen anterior después de actualizar la BD',
  async () => {

    const nombreAnterior =
      'imagen-anterior-fallo-test.jpg';


    const rutaAnterior =
      path.join(
        __dirname,
        '..',
        'uploads',
        'donaciones',
        nombreAnterior
      );


    fs.mkdirSync(
      path.dirname(
        rutaAnterior
      ),
      {
        recursive:
          true,
      }
    );


    fs.writeFileSync(
      rutaAnterior,
      jpegValido
    );


    donacionRepository
      .buscarDonacionPropiaPorId
      .mockResolvedValueOnce({

        id_donacion:
          idDonacion,

        id_voluntario:
          idVoluntario,

        imagen_url:
          `/uploads/donaciones/${nombreAnterior}`,

      });


    const unlinkSyncOriginal =
      fs.unlinkSync;


    const warnSpy =
      jest
        .spyOn(
          console,
          'warn'
        )
        .mockImplementation(
          () => {}
        );


    const unlinkSpy =
      jest
        .spyOn(
          fs,
          'unlinkSync'
        )
        .mockImplementation(
          (ruta) => {

            if (
              path.resolve(ruta) ===
              path.resolve(rutaAnterior)
            ) {

              throw new Error(
                'Fallo simulado al eliminar la imagen anterior'
              );

            }


            return unlinkSyncOriginal(
              ruta
            );

          }
        );


    const response =
      await request(app)
        .patch(
          `/api/donaciones/${idDonacion}/imagen`
        )
        .set(
          'Authorization',
          `Bearer ${tokenVoluntario}`
        )
        .attach(
          'imagen',
          pngValido,
          {
            filename:
              'imagen-nueva.png',

            contentType:
              'image/png',
          }
        );


    expect(
      response.status
    ).toBe(200);


    expect(
      donacionRepository
        .actualizarImagenDonacion
    ).toHaveBeenCalledTimes(1);


    expect(
      response.body.donacion
        .imagen_url
    ).toMatch(
      /^\/uploads\/donaciones\/donacion-.+\.png$/
    );


    const rutaNueva =
      path.join(
        __dirname,
        '..',
        response.body.donacion
          .imagen_url
          .replace(
            /^\/+/,
            ''
          )
      );


    expect(
      fs.existsSync(
        rutaNueva
      )
    ).toBe(true);


    expect(
      fs.existsSync(
        rutaAnterior
      )
    ).toBe(true);


    expect(
      warnSpy
    ).toHaveBeenCalled();


    // Restauramos antes de limpiar.
    unlinkSpy.mockRestore();
    warnSpy.mockRestore();


    if (
      fs.existsSync(
        rutaNueva
      )
    ) {

      fs.unlinkSync(
        rutaNueva
      );

    }


    if (
      fs.existsSync(
        rutaAnterior
      )
    ) {

      fs.unlinkSync(
        rutaAnterior
      );

    }

  }
);

  }
);