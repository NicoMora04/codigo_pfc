const mockClient = {
  query:
    jest.fn(),

  release:
    jest.fn(),
};


// ======================================================
// MOCK DE BASE DE DATOS
// ======================================================

jest.mock(
  '../src/config/db',
  () => ({
    query:
      jest.fn(),

    connect:
      jest.fn(
        async () =>
          mockClient
      ),
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


// ======================================================
// DATOS DE PRUEBA
// ======================================================

const idDonacion =
  '66666666-6666-4666-8666-666666666666';

const idUsuarioOrganizacion =
  '22222222-2222-4222-8222-222222222222';


// ======================================================
// CONFIGURACIÓN
// ======================================================

beforeEach(() => {

  jest.clearAllMocks();

});


// ======================================================
// CAMBIO DE ESTADO TRANSACCIONAL
// ======================================================

describe(
  'cambiarEstadoDonacionOrganizacion',
  () => {

    test(
      'confirma la transacción cuando estado e historial se actualizan correctamente',
      async () => {

        mockClient.query
          .mockResolvedValueOnce({
            rows: [],
          }) // BEGIN

          .mockResolvedValueOnce({
            rows: [
              {
                id_donacion:
                  idDonacion,

                estado:
                  'ACEPTADA',
              },
            ],
          }) // SELECT FOR UPDATE

          .mockResolvedValueOnce({
            rows: [
              {
                id_donacion:
                  idDonacion,

                estado:
                'COORDINADA',

              detalle_coordinacion:
                'Viernes de 16:00 a 18:00 en la sede',

              telefono_contacto:
                '+54 9 342 512-3456',
              },
            ],
          }) // UPDATE

          .mockResolvedValueOnce({
            rows: [],
          }) // INSERT HISTORIAL

          .mockResolvedValueOnce({
            rows: [],
          }); // COMMIT


        const resultado =
          await donacionRepository
            .cambiarEstadoDonacionOrganizacion({

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

            });


        expect(
          resultado.estado
        ).toBe(
          'COORDINADA'
        );


        expect(
          resultado.detalle_coordinacion
        ).toBe(
          'Viernes de 16:00 a 18:00 en la sede'
        );


        expect(
          resultado.telefono_contacto
        ).toBe(
          '+54 9 342 512-3456'
        );

        expect(
          mockClient.query
        ).toHaveBeenCalledWith(

          expect.stringContaining(
            'UPDATE donacion'
          ),

          [
            'COORDINADA',
            idDonacion,
            'Viernes de 16:00 a 18:00 en la sede',
            '+54 9 342 512-3456'
          ]

        );


        expect(
          mockClient.query
        ).toHaveBeenCalledWith(
          'COMMIT'
        );


        expect(
          mockClient.query
        ).not.toHaveBeenCalledWith(
          'ROLLBACK'
        );


        expect(
          mockClient.release
        ).toHaveBeenCalledTimes(1);

      }
    );


    test(
      'ejecuta ROLLBACK si falla el registro del historial',
      async () => {

        mockClient.query
          .mockResolvedValueOnce({
            rows: [],
          }) // BEGIN

          .mockResolvedValueOnce({
            rows: [
              {
                id_donacion:
                  idDonacion,

                estado:
                  'ACEPTADA',
              },
            ],
          }) // SELECT FOR UPDATE

          .mockResolvedValueOnce({
            rows: [
              {
                id_donacion:
                  idDonacion,

                estado:
                'COORDINADA',

              detalle_coordinacion:
                'Viernes por la tarde',

              telefono_contacto:
                '+54 9 342 512-3456',
              },
            ],
          }) // UPDATE

          .mockRejectedValueOnce(
            new Error(
              'Fallo controlado al registrar historial'
            )
          ) // INSERT HISTORIAL

          .mockResolvedValueOnce({
            rows: [],
          }); // ROLLBACK


        await expect(
          donacionRepository
            .cambiarEstadoDonacionOrganizacion({

              idDonacion,

              idUsuarioOrganizacion,

              estadoActualEsperado:
                'ACEPTADA',

              nuevoEstado:
                'COORDINADA',

              observacion:
                'Entrega coordinada con el donante',

              detalleCoordinacion:
                'Viernes por la tarde',

              telefonoContacto:
                '+54 9 342 512-3456',

            })
        ).rejects.toThrow(
          'Fallo controlado al registrar historial'
        );


        expect(
          mockClient.query
        ).toHaveBeenCalledWith(
          'ROLLBACK'
        );


        expect(
          mockClient.query
        ).not.toHaveBeenCalledWith(
          'COMMIT'
        );


        expect(
          mockClient.release
        ).toHaveBeenCalledTimes(1);

      }
    );

  }
);