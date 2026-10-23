// ACTIVIDAD 3.3.2 - Coordinación de donaciones
// Pruebas de orquestación transaccional

jest.mock('../src/config/db', () => ({
  connect: jest.fn(),
  query: jest.fn()
}));

jest.mock('../src/repositories/notificacionRepository', () => ({
  crearPorDonacionCoordinada: jest.fn()
}));

jest.mock('../src/repositories/envioPushRepository', () => ({
  crearPendientesPorNotificacion: jest.fn()
}));

const pool = require('../src/config/db');

const donaciones =
  require('../src/repositories/donacionRepository');

const donacionService =
  require('../src/services/donacionService');

const notificaciones =
  require('../src/repositories/notificacionRepository');

const push =
  require('../src/repositories/envioPushRepository');

const ID_DON =
  '11111111-1111-4111-8111-111111111111';

const ID_USUARIO_ORG =
  '22222222-2222-4222-8222-222222222222';

const ID_NOT =
  '33333333-3333-4333-8333-333333333333';


// ======================================================
// CLIENTE SQL SIMULADO
// ======================================================

function clienteSimulado({
  estado = 'ACEPTADA',
  existe = true,
  fallaHistorial = false
} = {}) {

  const client = {

    release: jest.fn(),

    query: jest.fn(async (sql, parametros = []) => {

      const s = sql.trim().replace(/\s+/g, ' ');

      if (
        ['BEGIN', 'COMMIT', 'ROLLBACK'].includes(s)
      ) {
        return { rows: [] };
      }

      // Buscar y bloquear donación.

      if (
        s.includes('FROM donacion d') &&
        s.includes('FOR UPDATE OF d')
      ) {

        return {
          rows: existe
            ? [{
                id_donacion: ID_DON,
                estado
              }]
            : []
        };
      }

      // Actualizar estado de donación.

      if (s.startsWith('UPDATE donacion')) {

        return {
          rows: [{
            id_donacion: ID_DON,

            estado:
              parametros[0],

            detalle_coordinacion:
              parametros[2],

            telefono_contacto:
              parametros[3]
          }]
        };
      }

      // Registrar historial.

      if (
        s.startsWith(
          'INSERT INTO historial_estado_donacion'
        )
      ) {

        if (fallaHistorial) {
          throw new Error('Falla historial');
        }

        return { rows: [] };
      }

      throw new Error(
        `SQL no contemplado por el test: ${s}`
      );

    })
  };

  pool.connect.mockResolvedValue(client);

  return client;
}


// ======================================================
// FUNCIONES AUXILIARES
// ======================================================

const huboSQL = (client, sentencia) =>

  client.query.mock.calls.some(
    ([sql]) => sql.trim() === sentencia
  );


const coordinar = () =>

  donacionService.coordinarDonacion(

    ID_DON,

    ID_USUARIO_ORG,

    ' Retirar el jueves por la tarde ',

    ' +54 342 555-1234 '

  );


// ======================================================
// CONFIGURACIÓN
// ======================================================

beforeEach(() => {

  jest.resetAllMocks();

  notificaciones
    .crearPorDonacionCoordinada
    .mockResolvedValue([]);

  push.crearPendientesPorNotificacion
    .mockResolvedValue([]);

});


// ======================================================
// CASOS DE PRUEBA
// ======================================================

describe(
  'Actividad 3.3.2 - Donación coordinada',
  () => {

    test(
      'guarda coordinación, notifica y encola push en una transacción',
      async () => {

        const client = clienteSimulado();

        notificaciones
          .crearPorDonacionCoordinada
          .mockResolvedValue([
            { id_notificacion: ID_NOT }
          ]);

        const resultado = await coordinar();

        expect(resultado.estado)
          .toBe('COORDINADA');

        expect(
          resultado.detalle_coordinacion
        ).toBe(
          'Retirar el jueves por la tarde'
        );

        expect(
          resultado.telefono_contacto
        ).toBe(
          '+54 342 555-1234'
        );

        expect(
          notificaciones.crearPorDonacionCoordinada
        ).toHaveBeenCalledWith(
          ID_DON,
          client
        );

        expect(
          push.crearPendientesPorNotificacion
        ).toHaveBeenCalledWith(
          ID_NOT,
          client
        );

        expect(huboSQL(client, 'BEGIN'))
          .toBe(true);

        expect(huboSQL(client, 'COMMIT'))
          .toBe(true);

        expect(huboSQL(client, 'ROLLBACK'))
          .toBe(false);

        expect(client.release)
          .toHaveBeenCalledTimes(1);

      }
    );


    test(
      'coordina sin push si no se generan notificaciones',
      async () => {

        const client = clienteSimulado();

        const resultado = await coordinar();

        expect(resultado.estado)
          .toBe('COORDINADA');

        expect(
          push.crearPendientesPorNotificacion
        ).not.toHaveBeenCalled();

        expect(huboSQL(client, 'COMMIT'))
          .toBe(true);

      }
    );


    test(
      'aceptar una donación no genera aviso de coordinación',
      async () => {

        const client = clienteSimulado({
          estado: 'PENDIENTE'
        });

        const resultado =
          await donacionService.aceptarDonacion(
            ID_DON,
            ID_USUARIO_ORG
          );

        expect(resultado.estado)
          .toBe('ACEPTADA');

        expect(
          notificaciones.crearPorDonacionCoordinada
        ).not.toHaveBeenCalled();

        expect(
          push.crearPendientesPorNotificacion
        ).not.toHaveBeenCalled();

        expect(huboSQL(client, 'COMMIT'))
          .toBe(true);

      }
    );


    test(
      'marcar como recibida no duplica el aviso de coordinación',
      async () => {

        const client = clienteSimulado({
          estado: 'COORDINADA'
        });

        const resultado =
          await donacionService.marcarDonacionRecibida(
            ID_DON,
            ID_USUARIO_ORG
          );

        expect(resultado.estado)
          .toBe('RECIBIDA');

        expect(
          notificaciones.crearPorDonacionCoordinada
        ).not.toHaveBeenCalled();

        expect(huboSQL(client, 'COMMIT'))
          .toBe(true);

      }
    );


    test(
      'no coordina una donación que no está ACEPTADA',
      async () => {

        const client = clienteSimulado({
          estado: 'PENDIENTE'
        });

        await expect(
          coordinar()
        ).rejects.toMatchObject({
          status: 409
        });

        expect(
          notificaciones.crearPorDonacionCoordinada
        ).not.toHaveBeenCalled();

        expect(huboSQL(client, 'ROLLBACK'))
          .toBe(true);

        expect(huboSQL(client, 'COMMIT'))
          .toBe(false);

      }
    );


    test(
      'no coordina una donación ajena o inexistente',
      async () => {

        const client = clienteSimulado({
          existe: false
        });

        await expect(
          coordinar()
        ).rejects.toMatchObject({
          status: 404
        });

        expect(
          notificaciones.crearPorDonacionCoordinada
        ).not.toHaveBeenCalled();

        expect(huboSQL(client, 'ROLLBACK'))
          .toBe(true);

      }
    );


    test(
      'revierte la coordinación cuando falla la notificación',
      async () => {

        const client = clienteSimulado();

        notificaciones
          .crearPorDonacionCoordinada
          .mockRejectedValue(
            new Error('Falla notificación')
          );

        await expect(
          coordinar()
        ).rejects.toThrow(
          'Falla notificación'
        );

        expect(huboSQL(client, 'ROLLBACK'))
          .toBe(true);

        expect(huboSQL(client, 'COMMIT'))
          .toBe(false);

        expect(client.release)
          .toHaveBeenCalledTimes(1);

      }
    );


    test(
      'revierte la coordinación cuando falla el envío push',
      async () => {

        const client = clienteSimulado();

        notificaciones
          .crearPorDonacionCoordinada
          .mockResolvedValue([
            { id_notificacion: ID_NOT }
          ]);

        push.crearPendientesPorNotificacion
          .mockRejectedValue(
            new Error('Falla push')
          );

        await expect(
          coordinar()
        ).rejects.toThrow(
          'Falla push'
        );

        expect(huboSQL(client, 'ROLLBACK'))
          .toBe(true);

        expect(huboSQL(client, 'COMMIT'))
          .toBe(false);

      }
    );


    test(
      'no confirma la coordinación si falla el historial',
      async () => {

        const client = clienteSimulado({
          fallaHistorial: true
        });

        await expect(
          coordinar()
        ).rejects.toThrow(
          'Falla historial'
        );

        expect(
          notificaciones.crearPorDonacionCoordinada
        ).not.toHaveBeenCalled();

        expect(huboSQL(client, 'ROLLBACK'))
          .toBe(true);

        expect(huboSQL(client, 'COMMIT'))
          .toBe(false);

      }
    );


    test(
      'valida el teléfono antes de comenzar la transacción',
      async () => {

        clienteSimulado();

        await expect(
          donacionService.coordinarDonacion(

            ID_DON,

            ID_USUARIO_ORG,

            'Entregar el jueves',

            'telefono invalido'

          )
        ).rejects.toMatchObject({
          status: 400
        });

        expect(pool.connect)
          .not.toHaveBeenCalled();

      }
    );

  }
);