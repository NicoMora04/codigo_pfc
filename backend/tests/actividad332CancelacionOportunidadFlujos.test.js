// ACTIVIDAD 3.3.2 - Cancelación de oportunidades
// Pruebas de orquestación transaccional

jest.mock('../src/config/db', () => ({
  connect: jest.fn(),
  query: jest.fn()
}));

jest.mock('../src/repositories/notificacionRepository', () => ({
  crearPorOportunidadCancelada: jest.fn()
}));

jest.mock('../src/repositories/envioPushRepository', () => ({
  crearPendientesPorNotificacion: jest.fn()
}));

const pool = require('../src/config/db');

const oportunidades =
  require('../src/services/oportunidadService');

const notificaciones =
  require('../src/repositories/notificacionRepository');

const push =
  require('../src/repositories/envioPushRepository');

const ID_OP =
  '11111111-1111-4111-8111-111111111111';

const ID_ORG =
  '22222222-2222-4222-8222-222222222222';

const ID_OTRA_ORG =
  '33333333-3333-4333-8333-333333333333';

const ID_NOT_1 =
  '44444444-4444-4444-8444-444444444444';

const ID_NOT_2 =
  '55555555-5555-4555-8555-555555555555';


// ======================================================
// CLIENTE SQL SIMULADO
// ======================================================

function clienteSimulado({
  estado = 'PUBLICADA',
  existe = true,
  actualiza = true
} = {}) {

  const oportunidad = {
    id_oportunidad: ID_OP,
    id_organizacion: ID_ORG,
    estado,
    eliminado_en: null
  };

  pool.query.mockResolvedValue({
    rows: existe ? [oportunidad] : []
  });

  const client = {

    release: jest.fn(),

    query: jest.fn(async (sql, params = []) => {

      const s = sql.trim().replace(/\s+/g, ' ');

      if (
        ['BEGIN', 'COMMIT', 'ROLLBACK'].includes(s)
      ) {
        return { rows: [] };
      }

      if (s.startsWith('UPDATE oportunidad')) {

        expect(params).toEqual([
          ID_OP,
          ID_ORG
        ]);

        expect(s).toContain(
          'id_organizacion = $2'
        );

        expect(s).toContain(
          'eliminado_en IS NULL'
        );

        return {
          rows: actualiza
            ? [{
                ...oportunidad,
                estado: 'CANCELADA'
              }]
            : []
        };
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


// ======================================================
// CONFIGURACIÓN
// ======================================================

beforeEach(() => {

  jest.resetAllMocks();

  notificaciones
    .crearPorOportunidadCancelada
    .mockResolvedValue([]);

  push.crearPendientesPorNotificacion
    .mockResolvedValue([]);

});


// ======================================================
// CASOS DE PRUEBA
// ======================================================

describe(
  'Actividad 3.3.2 - Cancelación de oportunidad',
  () => {

    test(
      'cancela, genera notificaciones y encola push en una sola transacción',
      async () => {

        const client = clienteSimulado();

        notificaciones
          .crearPorOportunidadCancelada
          .mockResolvedValue([
            { id_notificacion: ID_NOT_1 },
            { id_notificacion: ID_NOT_2 }
          ]);

        const resultado =
          await oportunidades.cancelarOportunidad(
            ID_OP,
            ID_ORG
          );

        expect(resultado.estado)
          .toBe('CANCELADA');

        expect(
          notificaciones.crearPorOportunidadCancelada
        ).toHaveBeenCalledWith(
          ID_OP,
          client
        );

        expect(
          push.crearPendientesPorNotificacion
        ).toHaveBeenNthCalledWith(
          1,
          ID_NOT_1,
          client
        );

        expect(
          push.crearPendientesPorNotificacion
        ).toHaveBeenNthCalledWith(
          2,
          ID_NOT_2,
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
      'confirma la cancelación cuando no hay destinatarios',
      async () => {

        const client = clienteSimulado();

        const resultado =
          await oportunidades.cancelarOportunidad(
            ID_OP,
            ID_ORG
          );

        expect(resultado.estado)
          .toBe('CANCELADA');

        expect(
          notificaciones.crearPorOportunidadCancelada
        ).toHaveBeenCalledWith(
          ID_OP,
          client
        );

        expect(
          push.crearPendientesPorNotificacion
        ).not.toHaveBeenCalled();

        expect(huboSQL(client, 'COMMIT'))
          .toBe(true);

      }
    );


    test(
      'admite cancelar una oportunidad en borrador',
      async () => {

        const client = clienteSimulado({
          estado: 'BORRADOR'
        });

        await oportunidades.cancelarOportunidad(
          ID_OP,
          ID_ORG
        );

        expect(huboSQL(client, 'COMMIT'))
          .toBe(true);

      }
    );


    test(
      'si el UPDATE no afecta filas, revierte la operación',
      async () => {

        const client = clienteSimulado({
          actualiza: false
        });

        await expect(
          oportunidades.cancelarOportunidad(
            ID_OP,
            ID_ORG
          )
        ).rejects.toMatchObject({
          status: 409
        });

        expect(
          notificaciones.crearPorOportunidadCancelada
        ).not.toHaveBeenCalled();

        expect(huboSQL(client, 'ROLLBACK'))
          .toBe(true);

        expect(huboSQL(client, 'COMMIT'))
          .toBe(false);

      }
    );


    test(
      'revierte la cancelación si falla la generación de notificaciones',
      async () => {

        const client = clienteSimulado();

        notificaciones
          .crearPorOportunidadCancelada
          .mockRejectedValue(
            new Error('Falla notificación')
          );

        await expect(
          oportunidades.cancelarOportunidad(
            ID_OP,
            ID_ORG
          )
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
      'revierte la cancelación si falla el encolado push',
      async () => {

        const client = clienteSimulado();

        notificaciones
          .crearPorOportunidadCancelada
          .mockResolvedValue([
            { id_notificacion: ID_NOT_1 }
          ]);

        push.crearPendientesPorNotificacion
          .mockRejectedValue(
            new Error('Falla push')
          );

        await expect(
          oportunidades.cancelarOportunidad(
            ID_OP,
            ID_ORG
          )
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
      'bloquea la cancelación solicitada por otra organización',
      async () => {

        clienteSimulado();

        await expect(
          oportunidades.cancelarOportunidad(
            ID_OP,
            ID_OTRA_ORG
          )
        ).rejects.toMatchObject({
          status: 403
        });

        expect(pool.connect)
          .not.toHaveBeenCalled();

        expect(
          notificaciones.crearPorOportunidadCancelada
        ).not.toHaveBeenCalled();

      }
    );


    test(
      'bloquea cancelar una oportunidad que ya estaba cancelada',
      async () => {

        clienteSimulado({
          estado: 'CANCELADA'
        });

        await expect(
          oportunidades.cancelarOportunidad(
            ID_OP,
            ID_ORG
          )
        ).rejects.toMatchObject({
          status: 409
        });

        expect(pool.connect)
          .not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza una oportunidad inexistente',
      async () => {

        clienteSimulado({
          existe: false
        });

        await expect(
          oportunidades.cancelarOportunidad(
            ID_OP,
            ID_ORG
          )
        ).rejects.toMatchObject({
          status: 404
        });

        expect(pool.connect)
          .not.toHaveBeenCalled();

      }
    );


    test(
      'rechaza identificadores inválidos antes de abrir la transacción',
      async () => {

        clienteSimulado();

        await expect(
          oportunidades.cancelarOportunidad(
            'no-es-uuid',
            ID_ORG
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