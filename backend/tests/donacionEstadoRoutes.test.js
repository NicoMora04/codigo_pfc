process.env.JWT_SECRET =
  'test-secret';

const request =
  require('supertest');

const jwt =
  require('jsonwebtoken');


// ======================================================
// MOCK DE BASE DE DATOS
// ======================================================

jest.mock(
  '../src/config/db',
  () => ({
    query:
      jest.fn(),
  })
);


// ======================================================
// MOCK DE REPOSITORIO
// ======================================================

jest.mock(
  '../src/repositories/donacionRepository',
  () => ({

    listarDonacionesRecibidas:
      jest.fn(),

    obtenerDetalleDonacionRecibida:
      jest.fn(),

    cambiarEstadoDonacionOrganizacion:
      jest.fn(),

  })
);


const pool =
  require(
    '../src/config/db'
  );

const donacionRepository =
  require(
    '../src/repositories/donacionRepository'
  );

const app =
  require(
    '../src/index'
  );


// ======================================================
// DATOS BASE
// ======================================================

const idUsuarioOrganizacion =
  '22222222-2222-4222-8222-222222222222';

const idDonacion =
  '66666666-6666-4666-8666-666666666666';


const tokenOrganizacion =
  jwt.sign(
    {
      id:
        idUsuarioOrganizacion,

      rol:
        'ORGANIZACION',
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        '1h',
    }
  );


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


const donacionBase = {

  id_donacion:
    idDonacion,

  id_voluntario:
    '11111111-1111-4111-8111-111111111111',

  id_organizacion:
    '44444444-4444-4444-8444-444444444444',

  categoria:
    'Alimentos',

  descripcion:
    'Cinco paquetes de alimentos',

  cantidad:
    '5.00',

  unidad:
    'paquetes',

  condicion_bien:
    'Nuevo',

  estado:
    'PENDIENTE',

};


// ======================================================
// CONFIGURACIÓN GENERAL
// ======================================================

beforeEach(() => {

  jest.clearAllMocks();


  pool.query
    .mockResolvedValue({
      rows: [
        {
          estado_cuenta:
            'ACTIVA',

          estado_verificacion:
            'VERIFICADA',
        },
      ],
    });


  donacionRepository
    .listarDonacionesRecibidas
    .mockResolvedValue([
      donacionBase,
    ]);


  donacionRepository
    .obtenerDetalleDonacionRecibida
    .mockResolvedValue(
      donacionBase
    );


  donacionRepository
    .cambiarEstadoDonacionOrganizacion
    .mockResolvedValue({
      ...donacionBase,

      estado:
        'ACEPTADA',
    });

});


// ======================================================
// CP-DON-006
// LISTADO Y DETALLE
// ======================================================

describe(
  'Donaciones recibidas por organización',
  () => {

    test(
      'lista las donaciones de la organización autenticada',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/donaciones/recibidas'
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          response.body.donaciones
        ).toHaveLength(1);


        expect(
          donacionRepository
            .listarDonacionesRecibidas
        ).toHaveBeenCalledWith(
          idUsuarioOrganizacion,
          null
        );

      }
    );


    test(
      'normaliza el filtro de estado',
      async () => {

        const response =
          await request(app)
            .get(
              '/api/donaciones/recibidas?estado=pendiente'
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          donacionRepository
            .listarDonacionesRecibidas
        ).toHaveBeenCalledWith(
          idUsuarioOrganizacion,
          'PENDIENTE'
        );

      }
    );


    test(
      'obtiene el detalle de una donación recibida',
      async () => {

        const response =
          await request(app)
            .get(
              `/api/donaciones/recibidas/${idDonacion}`
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
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
            .obtenerDetalleDonacionRecibida
        ).toHaveBeenCalledWith(
          idDonacion,
          idUsuarioOrganizacion
        );

      }
    );


    test(
      'rechaza el acceso a una donación que no pertenece a la organización',
      async () => {

        donacionRepository
          .obtenerDetalleDonacionRecibida
          .mockResolvedValueOnce(
            null
          );


        const response =
          await request(app)
            .get(
              `/api/donaciones/recibidas/${idDonacion}`
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            );


        expect(
          response.status
        ).toBe(404);


        expect(
          response.body.error
        ).toBe(
          'Donación no encontrada'
        );

      }
    );

  }
);


// ======================================================
// CP-DON-007
// ACEPTAR Y RECHAZAR
// ======================================================

describe(
  'Aceptar y rechazar donaciones',
  () => {

    test(
      'acepta una donación pendiente',
      async () => {

        const response =
          await request(app)
            .patch(
              `/api/donaciones/recibidas/${idDonacion}/aceptar`
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          donacionRepository
            .cambiarEstadoDonacionOrganizacion
        ).toHaveBeenCalledWith(
          expect.objectContaining({

            idDonacion,

            idUsuarioOrganizacion,

            estadoActualEsperado:
              'PENDIENTE',

            nuevoEstado:
              'ACEPTADA',

          })
        );

      }
    );


    test(
      'rechaza una donación pendiente',
      async () => {

        donacionRepository
          .cambiarEstadoDonacionOrganizacion
          .mockResolvedValueOnce({
            ...donacionBase,

            estado:
              'RECHAZADA',
          });


        const response =
          await request(app)
            .patch(
              `/api/donaciones/recibidas/${idDonacion}/rechazar`
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            )
            .send({
              observacion:
                'No podemos recibirla actualmente',
            });


        expect(
          response.status
        ).toBe(200);


        expect(
          donacionRepository
            .cambiarEstadoDonacionOrganizacion
        ).toHaveBeenCalledWith(
          expect.objectContaining({

            estadoActualEsperado:
              'PENDIENTE',

            nuevoEstado:
              'RECHAZADA',

            observacion:
              'No podemos recibirla actualmente',

          })
        );

      }
    );

  }
);


// ======================================================
// CP-DON-008
// COORDINAR Y RECIBIR
// ======================================================

describe(
  'Coordinación y recepción',
  () => {

    test(
  'coordina una donación aceptada con datos de coordinación',
  async () => {

    donacionRepository
      .cambiarEstadoDonacionOrganizacion
      .mockResolvedValueOnce({
        ...donacionBase,

        estado:
          'COORDINADA',

        detalle_coordinacion:
          'Viernes de 16:00 a 18:00 en la sede',

        telefono_contacto:
          '+54 9 342 512-3456',
      });


    const response =
      await request(app)
        .patch(
          `/api/donaciones/recibidas/${idDonacion}/coordinar`
        )
        .set(
          'Authorization',
          `Bearer ${tokenOrganizacion}`
        )
        .send({

          detalle_coordinacion:
            'Viernes de 16:00 a 18:00 en la sede',

          telefono_contacto:
            '+54 9 342 512-3456',

        });


    expect(
      response.status
    ).toBe(200);


    expect(
      donacionRepository
        .cambiarEstadoDonacionOrganizacion
    ).toHaveBeenCalledWith(
      expect.objectContaining({

        idDonacion,

        idUsuarioOrganizacion,

        estadoActualEsperado:
          'ACEPTADA',

        nuevoEstado:
          'COORDINADA',

        observacion:
          'Entrega coordinada con el donante',

        detalleCoordinacion:
          'Viernes de 16:00 a 18:00 en la sede',

        telefonoContacto:
          '+54 9 342 512-3456',

      })
    );

  }
);

test(
  'rechaza la coordinación sin detalle',
  async () => {

    const response =
      await request(app)
        .patch(
          `/api/donaciones/recibidas/${idDonacion}/coordinar`
        )
        .set(
          'Authorization',
          `Bearer ${tokenOrganizacion}`
        )
        .send({

          detalle_coordinacion:
            '',

          telefono_contacto:
            '+54 9 342 512-3456',

        });


    expect(
      response.status
    ).toBe(400);


    expect(
      donacionRepository
        .cambiarEstadoDonacionOrganizacion
    ).not.toHaveBeenCalled();

  }
);


test(
  'rechaza la coordinación sin teléfono de contacto',
  async () => {

    const response =
      await request(app)
        .patch(
          `/api/donaciones/recibidas/${idDonacion}/coordinar`
        )
        .set(
          'Authorization',
          `Bearer ${tokenOrganizacion}`
        )
        .send({

          detalle_coordinacion:
            'Viernes por la tarde',

          telefono_contacto:
            '',

        });


    expect(
      response.status
    ).toBe(400);


    expect(
      donacionRepository
        .cambiarEstadoDonacionOrganizacion
    ).not.toHaveBeenCalled();

  }
);


test(
  'rechaza un teléfono de contacto con formato inválido',
  async () => {

    const response =
      await request(app)
        .patch(
          `/api/donaciones/recibidas/${idDonacion}/coordinar`
        )
        .set(
          'Authorization',
          `Bearer ${tokenOrganizacion}`
        )
        .send({

          detalle_coordinacion:
            'Viernes por la tarde',

          telefono_contacto:
            'telefono123',

        });


    expect(
      response.status
    ).toBe(400);


    expect(
      donacionRepository
        .cambiarEstadoDonacionOrganizacion
    ).not.toHaveBeenCalled();

  }
);


    test(
      'marca como recibida una donación coordinada',
      async () => {

        donacionRepository
          .cambiarEstadoDonacionOrganizacion
          .mockResolvedValueOnce({
            ...donacionBase,

            estado:
              'RECIBIDA',
          });


        const response =
          await request(app)
            .patch(
              `/api/donaciones/recibidas/${idDonacion}/recibir`
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            );


        expect(
          response.status
        ).toBe(200);


        expect(
          donacionRepository
            .cambiarEstadoDonacionOrganizacion
        ).toHaveBeenCalledWith(
          expect.objectContaining({

            estadoActualEsperado:
              'COORDINADA',

            nuevoEstado:
              'RECIBIDA',

          })
        );

      }
    );

  }
);


// ======================================================
// CP-DON-009
// AUTORIZACIÓN Y TRANSICIONES INVÁLIDAS
// ======================================================

describe(
  'Seguridad y transiciones inválidas',
  () => {

    test(
      'rechaza al voluntario por rol',
      async () => {

        const response =
          await request(app)
            .patch(
              `/api/donaciones/recibidas/${idDonacion}/aceptar`
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
            .cambiarEstadoDonacionOrganizacion
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'propaga el conflicto de una transición inválida',
      async () => {

        const error =
          new Error(
            'La donación debe encontrarse en estado COORDINADA'
          );

        error.status =
          409;


        donacionRepository
          .cambiarEstadoDonacionOrganizacion
          .mockRejectedValueOnce(
            error
          );


        const response =
          await request(app)
            .patch(
              `/api/donaciones/recibidas/${idDonacion}/recibir`
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            );


        expect(
          response.status
        ).toBe(409);


        expect(
          response.body.error
        ).toBe(
          'La donación debe encontrarse en estado COORDINADA'
        );

      }
    );


    test(
      'rechaza una donación ajena sin revelar su existencia',
      async () => {

        const error =
          new Error(
            'Donación no encontrada'
          );

        error.status =
          404;


        donacionRepository
          .cambiarEstadoDonacionOrganizacion
          .mockRejectedValueOnce(
            error
          );


        const response =
          await request(app)
            .patch(
              `/api/donaciones/recibidas/${idDonacion}/aceptar`
            )
            .set(
              'Authorization',
              `Bearer ${tokenOrganizacion}`
            );


        expect(
          response.status
        ).toBe(404);


        expect(
          response.body.error
        ).toBe(
          'Donación no encontrada'
        );

      }
    );

  }
);