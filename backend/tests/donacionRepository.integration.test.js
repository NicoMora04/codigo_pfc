process.env.NODE_ENV =
  'test';

// IMPORTANTE:
// Se define antes de importar db.js.
// dotenv no reemplaza una variable ya existente.
process.env.DB_NAME =
  'codigo_pfc_test';


const pool =
  require(
    '../src/config/db'
  );
const donacionRepository =
  require(
    '../src/repositories/donacionRepository'
  );

// ======================================================
// CIERRE DE CONEXIÓN
// ======================================================

// ======================================================
// LIMPIEZA Y CIERRE
// ======================================================

afterAll(
  async () => {

    // Las donaciones eliminan su historial
    // mediante ON DELETE CASCADE.
    // ======================================================
// ELIMINAR ENVÍOS PUSH DE LAS DONACIONES DE PRUEBA
// ======================================================

await pool.query(
  `
  DELETE FROM envio_push
  WHERE id_notificacion IN (
    SELECT n.id_notificacion
    FROM notificacion n
    INNER JOIN donacion d
      ON d.id_donacion = n.id_donacion
    WHERE d.id_voluntario IN ($1, $2)
  )
  `,
  [
    idVoluntario,
    idSegundoVoluntario
  ]
);


// ======================================================
// ELIMINAR NOTIFICACIONES DE LAS DONACIONES DE PRUEBA
// ======================================================

await pool.query(
  `
  DELETE FROM notificacion
  WHERE id_donacion IN (
    SELECT id_donacion
    FROM donacion
    WHERE id_voluntario IN ($1, $2)
  )
  `,
  [
    idVoluntario,
    idSegundoVoluntario
  ]
);
    await pool.query(
      `
      DELETE FROM donacion
      WHERE id_voluntario IN (
        $1,
        $2
      )
      `,
      [
        idVoluntario,
        idSegundoVoluntario,
      ]
    );


    await pool.query(
      `
      DELETE FROM categoria_donacion
      WHERE id_categoria_donacion = $1
      `,
      [
        idCategoria,
      ]
    );


    await pool.query(
      `
      DELETE FROM usuario
      WHERE email IN (
        $1,
        $2,
        $3
      )
      `,
      [
        emailVoluntario,
        emailSegundoVoluntario,
        emailOrganizacion,
      ]
    );


    await pool.end();

  }
);


// ======================================================
// SEGURIDAD DEL AMBIENTE DE PRUEBAS
// ======================================================
// ======================================================
// DATOS CONTROLADOS DE INTEGRACIÓN
// ======================================================

let idVoluntario;
let idSegundoVoluntario;
let idOrganizacion;
let idCategoria;


const emailVoluntario =
  'test-donacion-voluntario@pfc.test';

const emailSegundoVoluntario =
  'test-donacion-voluntario-2@pfc.test';

const emailOrganizacion =
  'test-donacion-organizacion@pfc.test';

const cuitOrganizacion =
  '20999999991';

const nombreCategoria =
  'Categoria Integracion Test';


const idempotencyKey =
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

const segundaIdempotencyKey =
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';


  const terceraIdempotencyKey =
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

  const cuartaIdempotencyKey =
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
// ======================================================
// PREPARAR DATOS DE PRUEBA
// ======================================================

beforeAll(
  async () => {

    // ----------------------------------------------
    // Limpieza preventiva de una ejecución anterior
    // ----------------------------------------------
    // ----------------------------------------------
// Limpiar donaciones residuales de ejecuciones
// anteriores usando las claves del test.
// El historial se elimina por ON DELETE CASCADE.
// ----------------------------------------------
// ======================================================
// LIMPIEZA PREVENTIVA DE ENVÍOS PUSH
// ======================================================

await pool.query(
  `
  DELETE FROM envio_push
  WHERE id_notificacion IN (
    SELECT n.id_notificacion
    FROM notificacion n
    INNER JOIN donacion d
      ON d.id_donacion = n.id_donacion
    WHERE d.idempotency_key IN ($1, $2, $3, $4)
  )
  `,
  [
    idempotencyKey,
    segundaIdempotencyKey,
    terceraIdempotencyKey,
    cuartaIdempotencyKey
  ]
);


// ======================================================
// LIMPIEZA PREVENTIVA DE NOTIFICACIONES
// ======================================================

await pool.query(
  `
  DELETE FROM notificacion
  WHERE id_donacion IN (
    SELECT id_donacion
    FROM donacion
    WHERE idempotency_key IN ($1, $2, $3, $4)
  )
  `,
  [
    idempotencyKey,
    segundaIdempotencyKey,
    terceraIdempotencyKey,
    cuartaIdempotencyKey
  ]
);
await pool.query(
  `
  DELETE FROM donacion
  WHERE idempotency_key IN (
    $1,
    $2,
    $3,
    $4
  )
  `,
  [
    idempotencyKey,
    segundaIdempotencyKey,
    terceraIdempotencyKey,
    cuartaIdempotencyKey
  ]
);
    await pool.query(
      `
      DELETE FROM usuario
      WHERE email IN (
        $1,
        $2,
        $3
      )
      `,
      [
        emailVoluntario,
        emailSegundoVoluntario,
        emailOrganizacion,
      ]
    );


    await pool.query(
      `
      DELETE FROM categoria_donacion
      WHERE nombre = $1
      `,
      [
        nombreCategoria,
      ]
    );


    // ----------------------------------------------
    // VOLUNTARIO 1
    // ----------------------------------------------

    const usuarioVoluntario =
      await pool.query(
        `
        INSERT INTO usuario (
          email,
          password_hash,
          rol,
          estado_cuenta
        )
        VALUES (
          $1,
          $2,
          'VOLUNTARIO',
          'ACTIVA'
        )
        RETURNING id_usuario
        `,
        [
          emailVoluntario,
          'hash-test',
        ]
      );


    idVoluntario =
      usuarioVoluntario
        .rows[0]
        .id_usuario;


    await pool.query(
      `
      INSERT INTO perfil_voluntario (
        id_usuario,
        nombre,
        apellido
      )
      VALUES (
        $1,
        'Voluntario',
        'Integracion'
      )
      `,
      [
        idVoluntario,
      ]
    );


    // ----------------------------------------------
    // VOLUNTARIO 2
    // ----------------------------------------------

    const usuarioSegundoVoluntario =
      await pool.query(
        `
        INSERT INTO usuario (
          email,
          password_hash,
          rol,
          estado_cuenta
        )
        VALUES (
          $1,
          $2,
          'VOLUNTARIO',
          'ACTIVA'
        )
        RETURNING id_usuario
        `,
        [
          emailSegundoVoluntario,
          'hash-test',
        ]
      );


    idSegundoVoluntario =
      usuarioSegundoVoluntario
        .rows[0]
        .id_usuario;


    await pool.query(
      `
      INSERT INTO perfil_voluntario (
        id_usuario,
        nombre,
        apellido
      )
      VALUES (
        $1,
        'Segundo',
        'Voluntario'
      )
      `,
      [
        idSegundoVoluntario,
      ]
    );


    // ----------------------------------------------
    // ORGANIZACIÓN ACTIVA Y VERIFICADA
    // ----------------------------------------------

    const usuarioOrganizacion =
      await pool.query(
        `
        INSERT INTO usuario (
          email,
          password_hash,
          rol,
          estado_cuenta
        )
        VALUES (
          $1,
          $2,
          'ORGANIZACION',
          'ACTIVA'
        )
        RETURNING id_usuario
        `,
        [
          emailOrganizacion,
          'hash-test',
        ]
      );


    const idUsuarioOrganizacion =
      usuarioOrganizacion
        .rows[0]
        .id_usuario;


    const organizacion =
      await pool.query(
        `
        INSERT INTO organizacion (
          id_usuario,
          razon_social,
          cuit,
          estado_verificacion
        )
        VALUES (
          $1,
          'Organizacion Integracion Test',
          $2,
          'VERIFICADA'
        )
        RETURNING id_organizacion
        `,
        [
          idUsuarioOrganizacion,
          cuitOrganizacion,
        ]
      );


    idOrganizacion =
      organizacion
        .rows[0]
        .id_organizacion;


    // ----------------------------------------------
    // CATEGORÍA
    // ----------------------------------------------

    const categoria =
      await pool.query(
        `
        INSERT INTO categoria_donacion (
          nombre,
          descripcion
        )
        VALUES (
          $1,
          'Categoria exclusiva para pruebas automatizadas'
        )
        RETURNING id_categoria_donacion
        `,
        [
          nombreCategoria,
        ]
      );


    idCategoria =
      categoria
        .rows[0]
        .id_categoria_donacion;

  }
);

describe(
  'Base PostgreSQL exclusiva de pruebas',
  () => {

    test(
      'se conecta exclusivamente a codigo_pfc_test',
      async () => {

        const result =
          await pool.query(
            `
            SELECT
              current_database()
                AS database_name
            `
          );


        expect(
          result.rows[0]
            .database_name
        ).toBe(
          'codigo_pfc_test'
        );

      }
    );


    test(
      'contiene las tablas necesarias para probar donaciones',
      async () => {

        const result =
          await pool.query(
            `
            SELECT
              to_regclass(
                'public.usuario'
              ) AS usuario,

              to_regclass(
                'public.perfil_voluntario'
              ) AS perfil_voluntario,

              to_regclass(
                'public.organizacion'
              ) AS organizacion,

              to_regclass(
                'public.categoria_donacion'
              ) AS categoria_donacion,

              to_regclass(
                'public.donacion'
              ) AS donacion,

              to_regclass(
                'public.historial_estado_donacion'
              ) AS historial_estado_donacion
            `
          );


        const tablas =
          result.rows[0];


        expect(
          tablas.usuario
        ).toBe(
          'usuario'
        );


        expect(
          tablas.perfil_voluntario
        ).toBe(
          'perfil_voluntario'
        );


        expect(
          tablas.organizacion
        ).toBe(
          'organizacion'
        );


        expect(
          tablas.categoria_donacion
        ).toBe(
          'categoria_donacion'
        );


        expect(
          tablas.donacion
        ).toBe(
          'donacion'
        );


        expect(
          tablas.historial_estado_donacion
        ).toBe(
          'historial_estado_donacion'
        );

      }
    );

  }
);

// ======================================================
// TRANSACCIÓN REAL DE DONACIONES
// ======================================================

describe(
  'donacionRepository - integración PostgreSQL',
  () => {

    // ======================================================
// ACTIVIDAD 3.3.2
// PRUEBAS DE INTEGRACIÓN TRANSACCIONAL
// ======================================================

const { randomUUID } = require('node:crypto');

const notificacionRepository332 =
  require('../src/repositories/notificacionRepository');


// ======================================================
// DATOS AUXILIARES
// ======================================================

const crearDatosDonacion332 = (
  clave,
  voluntario = idVoluntario
) => ({
  idVoluntario: voluntario,
  idOrganizacion,
  idCategoriaDonacion: idCategoria,
  idUbicacion: null,
  descripcion: 'Donación de prueba 3.3.2',
  cantidad: 5,
  unidad: 'paquetes',
  condicionBien: 'Nuevo',
  disponibleDesde: '2099-01-01',
  idempotencyKey: clave
});


// ======================================================
// PRUEBA 1
// CONCURRENCIA SIN NOTIFICACIONES DUPLICADAS
// ======================================================

test(
  '3.3.2 - dos solicitudes concurrentes generan una sola notificación',
  async () => {

    const clave = randomUUID();

    const datos = crearDatosDonacion332(clave);

    const [primero, segundo] = await Promise.all([
      donacionRepository.crearDonacionTransaccional(datos),
      donacionRepository.crearDonacionTransaccional(datos)
    ]);

    // Una solicitud registra y la otra reutiliza.

    expect([
      primero.reutilizada,
      segundo.reutilizada
    ].sort()).toEqual([false, true]);

    // Ambas deben identificar la misma donación.

    expect(primero.donacion.id_donacion)
      .toBe(segundo.donacion.id_donacion);

    const idDonacion =
      primero.donacion.id_donacion;

    // Verificar notificaciones persistidas.

    const resultado = await pool.query(
      `
      SELECT
        id_notificacion,
        id_usuario,
        tipo
      FROM notificacion
      WHERE id_donacion = $1
      `,
      [idDonacion]
    );

    // Debe existir exactamente una notificación.

    expect(resultado.rows).toHaveLength(1);

    expect(resultado.rows[0].tipo)
      .toBe('NUEVA_DONACION_ORGANIZACION');

  }
);


// ======================================================
// PRUEBA 2
// DOS DONACIONES DIFERENTES
// ======================================================

test(
  '3.3.2 - dos donaciones diferentes generan notificaciones independientes',
  async () => {

    const primera =
      await donacionRepository.crearDonacionTransaccional(
        crearDatosDonacion332(randomUUID())
      );

    const segunda =
      await donacionRepository.crearDonacionTransaccional(
        crearDatosDonacion332(randomUUID())
      );

    const idPrimera =
      primera.donacion.id_donacion;

    const idSegunda =
      segunda.donacion.id_donacion;

    expect(idPrimera).not.toBe(idSegunda);

    const resultado = await pool.query(
      `
      SELECT
        id_notificacion,
        id_donacion,
        id_usuario,
        tipo
      FROM notificacion
      WHERE id_donacion IN ($1, $2)
      ORDER BY id_donacion
      `,
      [idPrimera, idSegunda]
    );

    // Cada donación debe tener su propia notificación.

    expect(resultado.rows).toHaveLength(2);

    const idsDonaciones =
      resultado.rows.map(n => n.id_donacion);

    expect(idsDonaciones).toContain(idPrimera);
    expect(idsDonaciones).toContain(idSegunda);

    // Los identificadores de notificación son diferentes.

    expect(
      resultado.rows[0].id_notificacion
    ).not.toBe(
      resultado.rows[1].id_notificacion
    );

    // Ambas corresponden al mismo tipo de evento.

    expect(
      resultado.rows.every(
        n => n.tipo === 'NUEVA_DONACION_ORGANIZACION'
      )
    ).toBe(true);

  }
);


// ======================================================
// PRUEBA 3
// ROLLBACK SI FALLA LA NOTIFICACIÓN
// ======================================================

test(
  '3.3.2 - revierte la donación si falla la generación de notificaciones',
  async () => {

    const clave = randomUUID();

    const datos = crearDatosDonacion332(clave);

    const errorSimulado =
      'Fallo simulado de notificaciones 3.3.2';

    // Simular una falla dentro de la transacción.

    const spy = jest.spyOn(
      notificacionRepository332,
      'crearPorNuevaDonacionOrganizacion'
    ).mockRejectedValueOnce(
      new Error(errorSimulado)
    );

    try {

      await expect(
        donacionRepository.crearDonacionTransaccional(datos)
      ).rejects.toThrow(errorSimulado);

    } finally {

      // Restaurar siempre la función original.
      spy.mockRestore();

    }

    // La donación no debe haberse persistido.

    const resultado = await pool.query(
      `
      SELECT COUNT(*)::int AS total
      FROM donacion
      WHERE idempotency_key = $1
      `,
      [clave]
    );

    expect(resultado.rows[0].total).toBe(0);

    // Tampoco debe existir un historial asociado
    // a una donación con esa clave.

    const historial = await pool.query(
      `
      SELECT COUNT(*)::int AS total
      FROM historial_estado_donacion h
      INNER JOIN donacion d
        ON d.id_donacion = h.id_donacion
      WHERE d.idempotency_key = $1
      `,
      [clave]
    );

    expect(historial.rows[0].total).toBe(0);

  }
);


// ======================================================
// PRUEBA 4
// IDEMPOTENCIA Y SEGURIDAD
// ======================================================

test(
  '3.3.2 - rechaza reutilización ajena sin generar otra notificación',
  async () => {

    const clave = randomUUID();

    // Primer voluntario registra la donación.

    const primera =
      await donacionRepository.crearDonacionTransaccional(
        crearDatosDonacion332(
          clave,
          idVoluntario
        )
      );

    const idDonacion =
      primera.donacion.id_donacion;

    const consultarNotificaciones = async () =>
      pool.query(
        `
        SELECT
          id_notificacion,
          id_usuario
        FROM notificacion
        WHERE id_donacion = $1
        `,
        [idDonacion]
      );

    const notificacionesIniciales =
      await consultarNotificaciones();

    expect(notificacionesIniciales.rows)
      .toHaveLength(1);

    // Otro voluntario intenta reutilizar la clave.

    await expect(
      donacionRepository.crearDonacionTransaccional(
        crearDatosDonacion332(
          clave,
          idSegundoVoluntario
        )
      )
    ).rejects.toMatchObject({
      status: 409
    });

    // No debe generarse ninguna notificación adicional.

    const notificacionesFinales =
      await consultarNotificaciones();

    expect(notificacionesFinales.rows)
      .toHaveLength(1);

    expect(
      notificacionesFinales.rows[0].id_notificacion
    ).toBe(
      notificacionesIniciales.rows[0].id_notificacion
    );

  }
);

        // ======================================================
    // ACTIVIDAD 3.3.2
    // NOTIFICACIÓN POR NUEVA DONACIÓN
    // ======================================================

    test(
      '3.3.2 - notifica a la organización sin generar duplicados',
      async () => {

        const { randomUUID } =
          require('node:crypto');

        // Clave única para esta ejecución.
        const idempotencyKeyNotificacion =
          randomUUID();

        const datosDonacion = {
          idVoluntario,
          idOrganizacion,

          idCategoriaDonacion:
            idCategoria,

          idUbicacion: null,

          descripcion:
            'Donación para probar notificaciones',

          cantidad: 5,

          unidad: 'paquetes',

          condicionBien: 'Nuevo',

          disponibleDesde: '2099-01-01',

          idempotencyKey:
            idempotencyKeyNotificacion
        };

        let idDonacion = null;

        try {

          // ================================================
          // 1. REGISTRAR DONACIÓN
          // ================================================

          const resultado =
            await donacionRepository
              .crearDonacionTransaccional(
                datosDonacion
              );

          idDonacion =
            resultado.donacion.id_donacion;

          expect(resultado.reutilizada)
            .toBe(false);

          expect(resultado.donacion.estado)
            .toBe('PENDIENTE');


          // ================================================
          // 2. CONSULTAR NOTIFICACIONES GENERADAS
          // ================================================

          const consultarNotificaciones =
            async () => pool.query(
              `
              SELECT
                n.id_notificacion,
                n.id_usuario,
                n.id_donacion,
                n.tipo,

                o.id_usuario
                  AS id_usuario_organizacion

              FROM notificacion n

              INNER JOIN donacion d
                ON d.id_donacion =
                  n.id_donacion

              INNER JOIN organizacion o
                ON o.id_organizacion =
                  d.id_organizacion

              WHERE n.id_donacion = $1
              `,
              [idDonacion]
            );

          const notificaciones =
            await consultarNotificaciones();


          // Debe existir una sola notificación.
          expect(notificaciones.rows)
            .toHaveLength(1);


          const notificacion =
            notificaciones.rows[0];


          // Verificar el tipo de notificación.
          expect(notificacion.tipo)
            .toBe(
              'NUEVA_DONACION_ORGANIZACION'
            );


          // Verificar la organización destinataria.
          expect(notificacion.id_usuario)
            .toBe(
              notificacion.id_usuario_organizacion
            );


          // Verificar la donación relacionada.
          expect(notificacion.id_donacion)
            .toBe(idDonacion);


          // ================================================
          // 3. COMPROBAR IDEMPOTENCIA
          // ================================================

          const segundoResultado =
            await donacionRepository
              .crearDonacionTransaccional(
                datosDonacion
              );


          // Debe reutilizar la donación existente.
          expect(segundoResultado.reutilizada)
            .toBe(true);


          expect(
            segundoResultado.donacion.id_donacion
          ).toBe(idDonacion);


          // ================================================
          // 4. VERIFICAR AUSENCIA DE DUPLICADOS
          // ================================================

          const notificacionesFinales =
            await consultarNotificaciones();


          expect(notificacionesFinales.rows)
            .toHaveLength(1);


          expect(
            notificacionesFinales.rows[0]
              .id_notificacion
          ).toBe(
            notificacion.id_notificacion
          );

        } finally {

          // ================================================
          // 5. LIMPIEZA DE DATOS DE PRUEBA
          // ================================================

          if (idDonacion) {

            // Eliminar envíos push asociados.
            await pool.query(
              `
              DELETE FROM envio_push
              WHERE id_notificacion IN (
                SELECT id_notificacion
                FROM notificacion
                WHERE id_donacion = $1
              )
              `,
              [idDonacion]
            );


            // Eliminar notificaciones.
            await pool.query(
              `
              DELETE FROM notificacion
              WHERE id_donacion = $1
              `,
              [idDonacion]
            );


            // Eliminar donación.
            await pool.query(
              `
              DELETE FROM donacion
              WHERE id_donacion = $1
              `,
              [idDonacion]
            );

          }

        }

      }
    );

    test(
      'crea la donación y el historial inicial en PostgreSQL',
      async () => {

        const resultado =
          await donacionRepository
            .crearDonacionTransaccional({

              idVoluntario,

              idOrganizacion,

              idCategoriaDonacion:
                idCategoria,

              idUbicacion:
                null,

              descripcion:
                'Alimentos para prueba de integración',

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


        expect(
          resultado.reutilizada
        ).toBe(false);


        expect(
          resultado.donacion.estado
        ).toBe(
          'PENDIENTE'
        );


        const donacionBD =
          await pool.query(
            `
            SELECT *
            FROM donacion
            WHERE idempotency_key = $1
            `,
            [
              idempotencyKey,
            ]
          );


        expect(
          donacionBD.rows
        ).toHaveLength(1);


        expect(
          donacionBD.rows[0]
            .id_voluntario
        ).toBe(
          idVoluntario
        );


        const historialBD =
          await pool.query(
            `
            SELECT
              estado,
              cambiado_por,
              observacion
            FROM historial_estado_donacion
            WHERE id_donacion = $1
            `,
            [
              resultado.donacion
                .id_donacion,
            ]
          );


        expect(
          historialBD.rows
        ).toHaveLength(1);


        expect(
          historialBD.rows[0].estado
        ).toBe(
          'PENDIENTE'
        );


        expect(
          historialBD.rows[0]
            .cambiado_por
        ).toBe(
          idVoluntario
        );

      }
    );


    test(
      'reutiliza la misma donación si se repite la misma clave de idempotencia',
      async () => {

        const resultado =
          await donacionRepository
            .crearDonacionTransaccional({

              idVoluntario,

              idOrganizacion,

              idCategoriaDonacion:
                idCategoria,

              idUbicacion:
                null,

              descripcion:
                'Este contenido no debe crear otra donación',

              cantidad:
                100,

              unidad:
                'cajas',

              condicionBien:
                'Usado',

              disponibleDesde:
                '2099-02-01',

              idempotencyKey,

            });


        expect(
          resultado.reutilizada
        ).toBe(true);


        const cantidadDonaciones =
          await pool.query(
            `
            SELECT COUNT(*)::int AS total
            FROM donacion
            WHERE idempotency_key = $1
            `,
            [
              idempotencyKey,
            ]
          );


        expect(
          cantidadDonaciones
            .rows[0]
            .total
        ).toBe(1);


        const cantidadHistorial =
          await pool.query(
            `
            SELECT COUNT(*)::int AS total
            FROM historial_estado_donacion h
            INNER JOIN donacion d
              ON d.id_donacion =
                h.id_donacion
            WHERE d.idempotency_key = $1
            `,
            [
              idempotencyKey,
            ]
          );


        expect(
          cantidadHistorial
            .rows[0]
            .total
        ).toBe(1);

      }
    );


    test(
      'rechaza reutilizar una clave de idempotencia perteneciente a otro voluntario',
      async () => {

        await expect(
          donacionRepository
            .crearDonacionTransaccional({

              idVoluntario:
                idSegundoVoluntario,

              idOrganizacion,

              idCategoriaDonacion:
                idCategoria,

              idUbicacion:
                null,

              descripcion:
                'Intento con clave ajena',

              cantidad:
                2,

              unidad:
                'unidades',

              condicionBien:
                'Nuevo',

              disponibleDesde:
                '2099-03-01',

              idempotencyKey,

            })
        ).rejects.toMatchObject({

          status:
            409,

          message:
            'La clave de idempotencia ya fue utilizada',

        });


        const cantidadDonaciones =
          await pool.query(
            `
            SELECT COUNT(*)::int AS total
            FROM donacion
            WHERE idempotency_key = $1
            `,
            [
              idempotencyKey,
            ]
          );


        expect(
          cantidadDonaciones
            .rows[0]
            .total
        ).toBe(1);

      }
    );


    test(
      'realiza rollback si la categoría no existe',
      async () => {

        const categoriaInexistente =
          32767;


        await expect(
          donacionRepository
            .crearDonacionTransaccional({

              idVoluntario,

              idOrganizacion,

              idCategoriaDonacion:
                categoriaInexistente,

              idUbicacion:
                null,

              descripcion:
                'Esta donación no debe persistir',

              cantidad:
                1,

              unidad:
                'unidad',

              condicionBien:
                'Nuevo',

              disponibleDesde:
                '2099-04-01',

              idempotencyKey:
                segundaIdempotencyKey,

            })
        ).rejects.toMatchObject({

          status:
            400,

          message:
            'La categoría de donación no es válida',

        });


        const resultadoBD =
          await pool.query(
            `
            SELECT COUNT(*)::int AS total
            FROM donacion
            WHERE idempotency_key = $1
            `,
            [
              segundaIdempotencyKey,
            ]
          );


        expect(
          resultadoBD
            .rows[0]
            .total
        ).toBe(0);

      }
    );

    test(
  'realiza rollback completo si falla la creación del historial después de insertar la donación',
  async () => {

    // Creamos un trigger temporal únicamente
    // en la base codigo_pfc_test.
    //
    // Su objetivo es forzar un error justo al
    // insertar el historial, es decir, después
    // de que el INSERT de donacion ya ocurrió.

    await pool.query(
      `
      CREATE OR REPLACE FUNCTION
        test_fallar_historial_donacion()
      RETURNS trigger
      AS $$
      BEGIN
        RAISE EXCEPTION
          'Fallo simulado del historial';
      END;
      $$
      LANGUAGE plpgsql;
      `
    );


    await pool.query(
      `
      DROP TRIGGER IF EXISTS
        test_trigger_fallar_historial
      ON historial_estado_donacion
      `
    );


    await pool.query(
      `
      CREATE TRIGGER
        test_trigger_fallar_historial
      BEFORE INSERT
      ON historial_estado_donacion
      FOR EACH ROW
      EXECUTE FUNCTION
        test_fallar_historial_donacion()
      `
    );


    try {

      await expect(
        donacionRepository
          .crearDonacionTransaccional({

            idVoluntario,

            idOrganizacion,

            idCategoriaDonacion:
              idCategoria,

            idUbicacion:
              null,

            descripcion:
              'Donación destinada a probar rollback completo',

            cantidad:
              3,

            unidad:
              'unidades',

            condicionBien:
              'Nuevo',

            disponibleDesde:
              '2099-05-01',

            idempotencyKey:
              terceraIdempotencyKey,

          })
      ).rejects.toThrow(
        'Fallo simulado del historial'
      );


      // Aunque el INSERT de donacion se ejecutó
      // antes del fallo del historial, el ROLLBACK
      // debe haberlo eliminado.

      const donacionBD =
        await pool.query(
          `
          SELECT COUNT(*)::int AS total
          FROM donacion
          WHERE idempotency_key = $1
          `,
          [
            terceraIdempotencyKey,
          ]
        );


      expect(
        donacionBD.rows[0].total
      ).toBe(0);


      const historialBD =
        await pool.query(
          `
          SELECT COUNT(*)::int AS total
          FROM historial_estado_donacion h
          INNER JOIN donacion d
            ON d.id_donacion =
              h.id_donacion
          WHERE d.idempotency_key = $1
          `,
          [
            terceraIdempotencyKey,
          ]
        );


      expect(
        historialBD.rows[0].total
      ).toBe(0);

    }
    finally {

      // Siempre restauramos el esquema del test,
      // incluso si alguna expectativa falla.

      await pool.query(
        `
        DROP TRIGGER IF EXISTS
          test_trigger_fallar_historial
        ON historial_estado_donacion
        `
      );


      await pool.query(
        `
        DROP FUNCTION IF EXISTS
          test_fallar_historial_donacion()
        `
      );

    }

  }
);

  }
);

test(
  'maneja dos registros concurrentes con la misma clave de idempotencia sin crear duplicados',
  async () => {

    const datosBase = {

      idVoluntario,

      idOrganizacion,

      idCategoriaDonacion:
        idCategoria,

      idUbicacion:
        null,

      descripcion:
        'Donación concurrente de prueba',

      cantidad:
        4,

      unidad:
        'cajas',

      condicionBien:
        'Nuevo',

      disponibleDesde:
        '2099-06-01',

      idempotencyKey:
        cuartaIdempotencyKey,

    };


    const [
      resultadoUno,
      resultadoDos,
    ] =
      await Promise.all([

        donacionRepository
          .crearDonacionTransaccional(
            datosBase
          ),

        donacionRepository
          .crearDonacionTransaccional(
            datosBase
          ),

      ]);


    // Una solicitud debe crear la donación
    // y la otra reutilizarla.

    const resultadosReutilizacion = [
      resultadoUno.reutilizada,
      resultadoDos.reutilizada,
    ].sort();


    expect(
      resultadosReutilizacion
    ).toEqual([
      false,
      true,
    ]);


    // Ambas deben referirse exactamente
    // a la misma donación.

    expect(
      resultadoUno
        .donacion
        .id_donacion
    ).toBe(
      resultadoDos
        .donacion
        .id_donacion
    );


    // En PostgreSQL debe existir
    // una única donación.

    const donacionesBD =
      await pool.query(
        `
        SELECT
          id_donacion
        FROM donacion
        WHERE idempotency_key = $1
        `,
        [
          cuartaIdempotencyKey,
        ]
      );


    expect(
      donacionesBD.rows
    ).toHaveLength(1);


    // Y tampoco debe duplicarse
    // el historial inicial.

    const historialBD =
      await pool.query(
        `
        SELECT
          h.id_historial
        FROM historial_estado_donacion h

        INNER JOIN donacion d
          ON d.id_donacion =
            h.id_donacion

        WHERE d.idempotency_key = $1
        `,
        [
          cuartaIdempotencyKey,
        ]
      );


    expect(
      historialBD.rows
    ).toHaveLength(1);

  }
);