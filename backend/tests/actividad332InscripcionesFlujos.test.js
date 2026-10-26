// ACTIVIDAD 3.3.2 - Inscripciones
// Pruebas de orquestación transaccional

jest.mock('../src/config/db', () => ({
  connect: jest.fn(),
  query: jest.fn()
}));

jest.mock('../src/repositories/notificacionRepository', () => ({
  crearPorInscripcionAceptada: jest.fn(),
  crearPorCancelacionInscripcionAceptada: jest.fn()
}));

jest.mock('../src/repositories/envioPushRepository', () => ({
  crearPendientesPorNotificacion: jest.fn()
}));

const pool = require('../src/config/db');

const inscripciones =
  require('../src/repositories/inscripcionRepository');

const notificaciones =
  require('../src/repositories/notificacionRepository');

const push =
  require('../src/repositories/envioPushRepository');

const ID_INS =
  '11111111-1111-4111-8111-111111111111';

const ID_OP =
  '22222222-2222-4222-8222-222222222222';

const ID_VOL =
  '33333333-3333-4333-8333-333333333333';

const ID_NOT =
  '44444444-4444-4444-8444-444444444444';


// ======================================================
// CLIENTE SQL SIMULADO
// ======================================================

function clienteSimulado({
  estado = 'PENDIENTE',
  cupoTotal = 3,
  aceptadas = 0,
  existe = true,
  actualiza = true
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

      // Buscar inscripción para aceptación.

      if (s.includes('FOR UPDATE OF o')) {

        return {
          rows: existe ? [{
            id_inscripcion: ID_INS,
            id_oportunidad: ID_OP,
            estado,
            cupo_total: cupoTotal
          }] : []
        };
      }

      // Controlar cupos disponibles.

      if (
        s.includes('COUNT(*)::int AS aceptadas')
      ) {

        return {
          rows: [{ aceptadas }]
        };
      }

      // Buscar inscripción para cancelación.

      if (
        s.startsWith('SELECT estado') &&
        s.includes('FOR UPDATE')
      ) {

        return {
          rows: existe ? [{ estado }] : []
        };
      }

      // Aceptar inscripción.

      if (
        s.startsWith('UPDATE inscripcion') &&
        s.includes("estado = 'ACEPTADA'")
      ) {

        return {
          rows: actualiza ? [{
            id_inscripcion: parametros[0],
            estado: 'ACEPTADA',
            id_voluntario: ID_VOL
          }] : []
        };
      }

      // Cancelar inscripción.

      if (
        s.startsWith('UPDATE inscripcion') &&
        s.includes("estado = 'CANCELADA'")
      ) {

        return {
          rows: actualiza ? [{
            id_inscripcion: parametros[0],
            id_voluntario: parametros[1],
            estado: 'CANCELADA'
          }] : []
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

function huboSQL(client, sql) {

  return client.query.mock.calls.some(
    ([sentencia]) => sentencia.trim() === sql
  );

}


// ======================================================
// CONFIGURACIÓN
// ======================================================

beforeEach(() => {

  jest.resetAllMocks();

  notificaciones
    .crearPorInscripcionAceptada
    .mockResolvedValue([]);

  notificaciones
    .crearPorCancelacionInscripcionAceptada
    .mockResolvedValue([]);

  push.crearPendientesPorNotificacion
    .mockResolvedValue([]);

});


// ======================================================
// ACEPTACIÓN DE INSCRIPCIONES
// ======================================================

describe(
  'Actividad 3.3.2 - Aceptar inscripción',
  () => {

    test(
      'acepta, notifica y programa el push usando la misma transacción',
      async () => {

        const client = clienteSimulado();

        notificaciones
          .crearPorInscripcionAceptada
          .mockResolvedValue([
            { id_notificacion: ID_NOT }
          ]);

        const resultado =
          await inscripciones
            .aceptarConControlCupo(ID_INS);

        expect(resultado.estado)
          .toBe('ACEPTADA');

        expect(
          notificaciones.crearPorInscripcionAceptada
        ).toHaveBeenCalledWith(
          ID_INS,
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
      'acepta sin envíos cuando no se generan notificaciones',
      async () => {

        const client = clienteSimulado();

        const resultado =
          await inscripciones
            .aceptarConControlCupo(ID_INS);

        expect(resultado.estado)
          .toBe('ACEPTADA');

        expect(
          push.crearPendientesPorNotificacion
        ).not.toHaveBeenCalled();

        expect(huboSQL(client, 'COMMIT'))
          .toBe(true);

      }
    );


    test(
      'revierte la aceptación si falla la generación de notificaciones',
      async () => {

        const client = clienteSimulado();

        notificaciones
          .crearPorInscripcionAceptada
          .mockRejectedValue(
            new Error('Falla notificación')
          );

        await expect(
          inscripciones.aceptarConControlCupo(ID_INS)
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
      'revierte la aceptación si falla el encolado push',
      async () => {

        const client = clienteSimulado();

        notificaciones
          .crearPorInscripcionAceptada
          .mockResolvedValue([
            { id_notificacion: ID_NOT }
          ]);

        push.crearPendientesPorNotificacion
          .mockRejectedValue(
            new Error('Falla push')
          );

        await expect(
          inscripciones.aceptarConControlCupo(ID_INS)
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
      'rechaza aceptar sin cupo y no genera notificaciones',
      async () => {

        const client = clienteSimulado({
          cupoTotal: 2,
          aceptadas: 2
        });

        await expect(
          inscripciones.aceptarConControlCupo(ID_INS)
        ).rejects.toMatchObject({
          status: 409
        });

        expect(
          notificaciones.crearPorInscripcionAceptada
        ).not.toHaveBeenCalled();

        expect(huboSQL(client, 'ROLLBACK'))
          .toBe(true);

      }
    );


    test(
      'rechaza una inscripción que ya no está pendiente',
      async () => {

        const client = clienteSimulado({
          actualiza: false
        });

        await expect(
          inscripciones.aceptarConControlCupo(ID_INS)
        ).rejects.toMatchObject({
          status: 409
        });

        expect(
          notificaciones.crearPorInscripcionAceptada
        ).not.toHaveBeenCalled();

        expect(huboSQL(client, 'ROLLBACK'))
          .toBe(true);

      }
    );

  }
);


// ======================================================
// CANCELACIÓN DE INSCRIPCIONES
// ======================================================

describe(
  'Actividad 3.3.2 - Cancelar inscripción',
  () => {

    test(
      'si estaba ACEPTADA, notifica a la organización y encola push',
      async () => {

        const client = clienteSimulado({
          estado: 'ACEPTADA'
        });

        notificaciones
          .crearPorCancelacionInscripcionAceptada
          .mockResolvedValue([
            { id_notificacion: ID_NOT }
          ]);

        const resultado =
          await inscripciones.cancelarPorVoluntario(
            ID_INS,
            ID_VOL
          );

        expect(resultado.estado)
          .toBe('CANCELADA');

        expect(
          notificaciones
            .crearPorCancelacionInscripcionAceptada
        ).toHaveBeenCalledWith(
          ID_INS,
          client
        );

        expect(
          push.crearPendientesPorNotificacion
        ).toHaveBeenCalledWith(
          ID_NOT,
          client
        );

        expect(huboSQL(client, 'COMMIT'))
          .toBe(true);

        expect(client.release)
          .toHaveBeenCalledTimes(1);

      }
    );


    test(
      'si estaba PENDIENTE, cancela sin notificar',
      async () => {

        const client = clienteSimulado({
          estado: 'PENDIENTE'
        });

        const resultado =
          await inscripciones.cancelarPorVoluntario(
            ID_INS,
            ID_VOL
          );

        expect(resultado.estado)
          .toBe('CANCELADA');

        expect(
          notificaciones
            .crearPorCancelacionInscripcionAceptada
        ).not.toHaveBeenCalled();

        expect(
          push.crearPendientesPorNotificacion
        ).not.toHaveBeenCalled();

        expect(huboSQL(client, 'COMMIT'))
          .toBe(true);

      }
    );


    test(
      'si falla la notificación, ejecuta rollback',
      async () => {

        const client = clienteSimulado({
          estado: 'ACEPTADA'
        });

        notificaciones
          .crearPorCancelacionInscripcionAceptada
          .mockRejectedValue(
            new Error('Falla notificación')
          );

        await expect(
          inscripciones.cancelarPorVoluntario(
            ID_INS,
            ID_VOL
          )
        ).rejects.toThrow(
          'Falla notificación'
        );

        expect(huboSQL(client, 'ROLLBACK'))
          .toBe(true);

        expect(huboSQL(client, 'COMMIT'))
          .toBe(false);

      }
    );


    test(
      'si falla el push, ejecuta rollback',
      async () => {

        const client = clienteSimulado({
          estado: 'ACEPTADA'
        });

        notificaciones
          .crearPorCancelacionInscripcionAceptada
          .mockResolvedValue([
            { id_notificacion: ID_NOT }
          ]);

        push.crearPendientesPorNotificacion
          .mockRejectedValue(
            new Error('Falla push')
          );

        await expect(
          inscripciones.cancelarPorVoluntario(
            ID_INS,
            ID_VOL
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
      'no cancela una inscripción ajena o inexistente',
      async () => {

        const client = clienteSimulado({
          existe: false
        });

        const resultado =
          await inscripciones.cancelarPorVoluntario(
            ID_INS,
            ID_VOL
          );

        expect(resultado)
          .toBeNull();

        expect(
          notificaciones
            .crearPorCancelacionInscripcionAceptada
        ).not.toHaveBeenCalled();

        expect(huboSQL(client, 'ROLLBACK'))
          .toBe(true);

        expect(huboSQL(client, 'COMMIT'))
          .toBe(false);

        expect(client.release)
          .toHaveBeenCalledTimes(1);

      }
    );

  }
);