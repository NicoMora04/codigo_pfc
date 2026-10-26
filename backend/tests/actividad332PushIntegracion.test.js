// ======================================================
// ACTIVIDAD 3.3.2
// PRUEBAS DE INTEGRACIÓN - ENVÍOS PUSH
// ======================================================

process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'codigo_pfc_test';

const { randomUUID } = require('node:crypto');

const pool = require('../src/config/db');

const envioPushRepository =
  require('../src/repositories/envioPushRepository');


// ======================================================
// DATOS DE PRUEBA
// ======================================================

const idUsuario = randomUUID();

const idOtroUsuario = randomUUID();

const idNotificacion = randomUUID();

let client;


// ======================================================
// CONFIGURACIÓN DE TABLAS TEMPORALES
// ======================================================

beforeAll(async () => {

  client = await pool.connect();

  const base = await client.query(
    'SELECT current_database() AS nombre'
  );

  if (
    base.rows[0].nombre !== 'codigo_pfc_test'
  ) {
    throw new Error(
      'Las pruebas deben ejecutarse en codigo_pfc_test'
    );
  }

  // Utilizar tablas temporales de esta conexión.

  await client.query(
    'SET search_path TO pg_temp, public'
  );


  await client.query(`
    CREATE TEMP TABLE notificacion (

      id_notificacion UUID PRIMARY KEY,

      id_usuario UUID NOT NULL,

      titulo TEXT,

      mensaje TEXT,

      tipo TEXT,

      id_oportunidad UUID,

      id_inscripcion UUID,

      id_donacion UUID

    )
  `);


  await client.query(`
    CREATE TEMP TABLE token_dispositivo (

      id_token_dispositivo UUID PRIMARY KEY,

      id_usuario UUID NOT NULL,

      token TEXT NOT NULL,

      activo BOOLEAN NOT NULL DEFAULT TRUE

    )
  `);


  await client.query(`
    CREATE TEMP TABLE envio_push (

      id_envio_push UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

      id_notificacion UUID NOT NULL,

      id_token_dispositivo UUID NOT NULL,

      estado TEXT NOT NULL,

      creado_en TIMESTAMP DEFAULT NOW(),

      CONSTRAINT
        uq_envio_push_notificacion_dispositivo

      UNIQUE (
        id_notificacion,
        id_token_dispositivo
      )

    )
  `);

});


// ======================================================
// PREPARAR CADA PRUEBA
// ======================================================

beforeEach(async () => {

  // Limpiar registros de la prueba anterior.

  await client.query(`
    TRUNCATE TABLE
      envio_push,
      token_dispositivo,
      notificacion
  `);


  // Crear una notificación interna.

  await client.query(
    `
    INSERT INTO notificacion (
      id_notificacion,
      id_usuario,
      tipo
    )
    VALUES ($1, $2, 'INSCRIPCION_ACEPTADA')
    `,
    [
      idNotificacion,
      idUsuario
    ]
  );

});


// ======================================================
// LIMPIEZA FINAL
// ======================================================

afterAll(async () => {

  try {

    if (client) {

      await client.query(
        'DROP TABLE IF EXISTS pg_temp.envio_push'
      );

      await client.query(
        'DROP TABLE IF EXISTS pg_temp.token_dispositivo'
      );

      await client.query(
        'DROP TABLE IF EXISTS pg_temp.notificacion'
      );

    }

  } finally {

    if (client) {
      client.release();
    }

    await pool.end();

  }

});


// ======================================================
// FUNCIÓN AUXILIAR
// ======================================================

const crearDispositivo = async (
  usuario,
  activo = true
) => {

  const idDispositivo = randomUUID();

  await client.query(
    `
    INSERT INTO token_dispositivo (
      id_token_dispositivo,
      id_usuario,
      token,
      activo
    )
    VALUES ($1, $2, $3, $4)
    `,
    [
      idDispositivo,
      usuario,
      `ExponentPushToken[TEST-${idDispositivo}]`,
      activo
    ]
  );

  return idDispositivo;

};


// ======================================================
// CASOS DE PRUEBA
// ======================================================

describe(
  'Actividad 3.3.2 - Integración de envíos push',
  () => {


    // --------------------------------------------------
    // PRUEBA 1
    // SOLO DISPOSITIVOS ACTIVOS DEL DESTINATARIO
    // --------------------------------------------------

    test(
      'crea envíos únicamente para dispositivos activos del usuario',
      async () => {

        const dispositivoUno =
          await crearDispositivo(
            idUsuario,
            true
          );

        const dispositivoDos =
          await crearDispositivo(
            idUsuario,
            true
          );

        const dispositivoInactivo =
          await crearDispositivo(
            idUsuario,
            false
          );

        const dispositivoAjeno =
          await crearDispositivo(
            idOtroUsuario,
            true
          );


        const envios =
          await envioPushRepository
            .crearPendientesPorNotificacion(
              idNotificacion,
              client
            );


        expect(envios)
          .toHaveLength(2);


        const ids = envios.map(
          envio => envio.id_token_dispositivo
        );


        expect(ids)
          .toContain(dispositivoUno);

        expect(ids)
          .toContain(dispositivoDos);

        expect(ids)
          .not.toContain(dispositivoInactivo);

        expect(ids)
          .not.toContain(dispositivoAjeno);


        expect(
          envios.every(
            envio => envio.estado === 'PENDIENTE'
          )
        ).toBe(true);

      }
    );


    // --------------------------------------------------
    // PRUEBA 2
    // SIN DISPOSITIVOS ACTIVOS
    // --------------------------------------------------

    test(
      'no genera envíos cuando no existen dispositivos activos',
      async () => {

        await crearDispositivo(
          idUsuario,
          false
        );

        const resultado =
          await envioPushRepository
            .crearPendientesPorNotificacion(
              idNotificacion,
              client
            );

        expect(resultado)
          .toEqual([]);


        const consulta = await client.query(
          'SELECT COUNT(*)::int AS total FROM envio_push'
        );

        expect(
          consulta.rows[0].total
        ).toBe(0);

      }
    );


    // --------------------------------------------------
    // PRUEBA 3
    // PREVENCIÓN DE DUPLICADOS
    // --------------------------------------------------

    test(
      'no duplica un envío al ejecutar nuevamente la generación',
      async () => {

        await crearDispositivo(
          idUsuario,
          true
        );


        const primera =
          await envioPushRepository
            .crearPendientesPorNotificacion(
              idNotificacion,
              client
            );


        const segunda =
          await envioPushRepository
            .crearPendientesPorNotificacion(
              idNotificacion,
              client
            );


        expect(primera)
          .toHaveLength(1);

        expect(segunda)
          .toHaveLength(0);


        const consulta = await client.query(
          `
          SELECT COUNT(*)::int AS total
          FROM envio_push
          WHERE id_notificacion = $1
          `,
          [idNotificacion]
        );


        expect(
          consulta.rows[0].total
        ).toBe(1);

      }
    );


    // --------------------------------------------------
    // PRUEBA 4
    // ROLLBACK DE ENVÍOS PUSH
    // --------------------------------------------------

    test(
      'revierte los envíos pendientes cuando se realiza rollback',
      async () => {

        await crearDispositivo(
          idUsuario,
          true
        );


        await client.query('BEGIN');

        try {

          const resultado =
            await envioPushRepository
              .crearPendientesPorNotificacion(
                idNotificacion,
                client
              );

          expect(resultado)
            .toHaveLength(1);

          const duranteTransaccion =
            await client.query(
              'SELECT COUNT(*)::int AS total FROM envio_push'
            );

          expect(
            duranteTransaccion.rows[0].total
          ).toBe(1);

        } finally {

          await client.query('ROLLBACK');

        }


        const despuesRollback =
          await client.query(
            'SELECT COUNT(*)::int AS total FROM envio_push'
          );


        expect(
          despuesRollback.rows[0].total
        ).toBe(0);

      }
    );

  }
);