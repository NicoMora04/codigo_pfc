// ======================================================
// ACTIVIDAD 3.3.2
// PRUEBAS DE INTEGRACIÓN - NOTIFICACIONES
// ======================================================

process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'codigo_pfc_test';

const { randomUUID } = require('node:crypto');

const pool = require('../src/config/db');

const notificacionService =
  require('../src/services/notificacionService');


// ======================================================
// DATOS DE PRUEBA
// ======================================================

let idVoluntario;
let idOrganizacionUsuario;

const sufijo = randomUUID();

const emailVoluntario =
  `voluntario-${sufijo}@pfc.test`;

const emailOrganizacion =
  `organizacion-${sufijo}@pfc.test`;


// ======================================================
// CONFIGURACIÓN INICIAL
// ======================================================

beforeAll(async () => {

  const base = await pool.query(
    'SELECT current_database() AS nombre'
  );

  if (
    base.rows[0].nombre !== 'codigo_pfc_test'
  ) {
    throw new Error(
      'Las pruebas deben ejecutarse en codigo_pfc_test'
    );
  }

  // Crear voluntario.

  const voluntario = await pool.query(
    `
    INSERT INTO usuario (
      email,
      password_hash,
      rol,
      estado_cuenta
    )
    VALUES ($1, 'hash-test', 'VOLUNTARIO', 'ACTIVA')
    RETURNING id_usuario
    `,
    [emailVoluntario]
  );

  idVoluntario =
    voluntario.rows[0].id_usuario;


  // Crear usuario de organización.

  const organizacion = await pool.query(
    `
    INSERT INTO usuario (
      email,
      password_hash,
      rol,
      estado_cuenta
    )
    VALUES ($1, 'hash-test', 'ORGANIZACION', 'ACTIVA')
    RETURNING id_usuario
    `,
    [emailOrganizacion]
  );

  idOrganizacionUsuario =
    organizacion.rows[0].id_usuario;

});


// ======================================================
// LIMPIEZA ENTRE PRUEBAS
// ======================================================

afterEach(async () => {

  const usuarios = [
    idVoluntario,
    idOrganizacionUsuario
  ].filter(Boolean);

  if (usuarios.length === 0) return;

  await pool.query(
    `
    DELETE FROM notificacion
    WHERE id_usuario = ANY($1::uuid[])
    `,
    [usuarios]
  );

});


// ======================================================
// LIMPIEZA FINAL
// ======================================================

afterAll(async () => {

  try {

    await pool.query(
      `
      DELETE FROM usuario
      WHERE email IN ($1, $2)
      `,
      [
        emailVoluntario,
        emailOrganizacion
      ]
    );

  } finally {

    await pool.end();

  }

});


// ======================================================
// FUNCIONES AUXILIARES
// ======================================================

const crearNotificacion = async (
  idUsuario,
  tipo = 'INSCRIPCION_ACEPTADA'
) => {

  return notificacionService.crearNotificacion({

    idUsuario,

    titulo: 'Notificación de prueba',

    mensaje:
      'Mensaje generado durante las pruebas de integración',

    tipo

  });

};


// ======================================================
// CASOS DE PRUEBA
// ======================================================

describe(
  'Actividad 3.3.2 - Integración PostgreSQL',
  () => {


    // --------------------------------------------------
    // PRUEBA 1
    // CREACIÓN Y PERSISTENCIA
    // --------------------------------------------------

    test(
      'crea y persiste una notificación correctamente',
      async () => {

        const resultado =
          await crearNotificacion(
            idVoluntario
          );

        expect(resultado.id_notificacion)
          .toBeDefined();

        const consulta = await pool.query(
          `
          SELECT *
          FROM notificacion
          WHERE id_notificacion = $1
          `,
          [resultado.id_notificacion]
        );

        expect(consulta.rows)
          .toHaveLength(1);

        expect(
          consulta.rows[0].id_usuario
        ).toBe(idVoluntario);

        expect(
          consulta.rows[0].tipo
        ).toBe('INSCRIPCION_ACEPTADA');

        expect(
          consulta.rows[0].leida_en
        ).toBeNull();

      }
    );


    // --------------------------------------------------
    // PRUEBA 2
    // AISLAMIENTO ENTRE USUARIOS
    // --------------------------------------------------

    test(
      'cada usuario consulta solamente sus notificaciones',
      async () => {

        const notificacionVoluntario =
          await crearNotificacion(
            idVoluntario,
            'INSCRIPCION_ACEPTADA'
          );

        const notificacionOrganizacion =
          await crearNotificacion(
            idOrganizacionUsuario,
            'NUEVA_DONACION_ORGANIZACION'
          );

        const listadoVoluntario =
          await notificacionService
            .listarMisNotificaciones(
              idVoluntario
            );

        const listadoOrganizacion =
          await notificacionService
            .listarMisNotificaciones(
              idOrganizacionUsuario
            );

        expect(
          listadoVoluntario.map(
            n => n.id_notificacion
          )
        ).toContain(
          notificacionVoluntario.id_notificacion
        );

        expect(
          listadoVoluntario.map(
            n => n.id_notificacion
          )
        ).not.toContain(
          notificacionOrganizacion.id_notificacion
        );

        expect(
          listadoOrganizacion.map(
            n => n.id_notificacion
          )
        ).toContain(
          notificacionOrganizacion.id_notificacion
        );

        expect(
          listadoOrganizacion.map(
            n => n.id_notificacion
          )
        ).not.toContain(
          notificacionVoluntario.id_notificacion
        );

      }
    );


    // --------------------------------------------------
    // PRUEBA 3
    // CONTADOR DE NO LEÍDAS
    // --------------------------------------------------

    test(
      'actualiza el contador cuando se leen notificaciones',
      async () => {

        const primera =
          await crearNotificacion(
            idVoluntario
          );

        const segunda =
          await crearNotificacion(
            idVoluntario,
            'DONACION_COORDINADA'
          );

        const inicial =
          await notificacionService
            .contarMisNoLeidas(
              idVoluntario
            );

        expect(inicial).toBe(2);

        await notificacionService.marcarComoLeida(
          primera.id_notificacion,
          idVoluntario
        );

        const intermedio =
          await notificacionService
            .contarMisNoLeidas(
              idVoluntario
            );

        expect(intermedio).toBe(1);

        await notificacionService.marcarComoLeida(
          segunda.id_notificacion,
          idVoluntario
        );

        const final =
          await notificacionService
            .contarMisNoLeidas(
              idVoluntario
            );

        expect(final).toBe(0);

      }
    );


    // --------------------------------------------------
    // PRUEBA 4
    // SEGURIDAD DE LECTURA
    // --------------------------------------------------

    test(
      'una organización no puede marcar como leída una notificación ajena',
      async () => {

        const notificacion =
          await crearNotificacion(
            idVoluntario
          );

        await expect(
          notificacionService.marcarComoLeida(
            notificacion.id_notificacion,
            idOrganizacionUsuario
          )
        ).rejects.toMatchObject({
          status: 404
        });

        const consulta = await pool.query(
          `
          SELECT leida_en
          FROM notificacion
          WHERE id_notificacion = $1
          `,
          [notificacion.id_notificacion]
        );

        expect(
          consulta.rows[0].leida_en
        ).toBeNull();

      }
    );


    // --------------------------------------------------
    // PRUEBA 5
    // LECTURA IDEMPOTENTE
    // --------------------------------------------------

    test(
      'marcar dos veces como leída conserva la fecha original',
      async () => {

        const notificacion =
          await crearNotificacion(
            idVoluntario
          );

        const primeraLectura =
          await notificacionService
            .marcarComoLeida(
              notificacion.id_notificacion,
              idVoluntario
            );

        const segundaLectura =
          await notificacionService
            .marcarComoLeida(
              notificacion.id_notificacion,
              idVoluntario
            );

        expect(
          primeraLectura.leida_en
        ).not.toBeNull();

        expect(
          segundaLectura.leida_en.getTime()
        ).toBe(
          primeraLectura.leida_en.getTime()
        );

      }
    );


    // --------------------------------------------------
    // PRUEBA 6
    // PAGINACIÓN REAL
    // --------------------------------------------------

    test(
      'respeta límite y desplazamiento en PostgreSQL',
      async () => {

        for (let i = 0; i < 5; i++) {

          await crearNotificacion(
            idVoluntario
          );

        }

        const pagina =
          await notificacionService
            .listarMisNotificaciones(
              idVoluntario,
              {
                limite: 2,
                offset: 1
              }
            );

        expect(pagina)
          .toHaveLength(2);

        expect(
          pagina[0].id_notificacion
        ).not.toBe(
          pagina[1].id_notificacion
        );

      }
    );

  }
);