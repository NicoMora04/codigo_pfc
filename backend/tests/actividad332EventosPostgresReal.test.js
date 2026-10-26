// ======================================================
// ACTIVIDAD 3.3.2
// PRUEBAS DE INTEGRACIÓN CON POSTGRESQL REAL
// ======================================================

// IMPORTANTE:
// Estas pruebas utilizan exclusivamente codigo_pfc_test.
// No deben ejecutarse contra voluntariado_db.

process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'codigo_pfc_test';

const { randomUUID, randomInt } = require('node:crypto');

const pool = require('../src/config/db');

const inscripcionService =
  require('../src/services/inscripcionService');

const oportunidadService =
  require('../src/services/oportunidadService');

const donacionService =
  require('../src/services/donacionService');

const notificaciones =
  require('../src/repositories/notificacionRepository');

const push =
  require('../src/repositories/envioPushRepository');


// ======================================================
// VARIABLES PARA DATOS TEMPORALES
// ======================================================

const usuarios = [];
const voluntarios = [];
const oportunidades = [];

let idOrganizacion;
let idUsuarioOrganizacion;
let idTipoActividad;
let idCategoria;


// ======================================================
// VERIFICAR BASE DE DATOS
// ======================================================

const verificarBD = async () => {

  const resultado = await pool.query(
    'SELECT current_database() AS nombre'
  );

  if (
    resultado.rows[0].nombre !== 'codigo_pfc_test'
  ) {
    throw new Error(
      'Pruebas bloqueadas: la BD no es codigo_pfc_test'
    );
  }

};


// ======================================================
// CREAR USUARIO TEMPORAL
// ======================================================

const crearUsuario = async (rol, indice) => {

  const email =
    `act332-${indice}-${randomUUID()}@pfc.test`;

  const resultado = await pool.query(
    `
    INSERT INTO usuario (
      email,
      password_hash,
      rol,
      estado_cuenta
    )
    VALUES (
      $1,
      'hash-test',
      $2,
      'ACTIVA'
    )
    RETURNING id_usuario
    `,
    [email, rol]
  );

  const id = resultado.rows[0].id_usuario;

  usuarios.push(id);

  return id;

};


// ======================================================
// CREAR OPORTUNIDAD TEMPORAL
// ======================================================

const crearOportunidad = async (
  estado = 'PUBLICADA',
  cupo = 5
) => {

  const resultado = await pool.query(
    `
    INSERT INTO oportunidad (
      id_organizacion,
      id_tipo_actividad,
      titulo,
      descripcion,
      cupo_total,
      fecha_inicio,
      fecha_fin,
      urgencia,
      estado
    )
    VALUES (
      $1,
      $2,
      $3,
      'Oportunidad temporal de integración',
      $4,
      '2099-01-01T12:00:00Z',
      '2099-01-02T12:00:00Z',
      'MEDIA',
      $5
    )
    RETURNING id_oportunidad
    `,
    [
      idOrganizacion,
      idTipoActividad,
      `Test 3.3.2 ${randomUUID()}`,
      cupo,
      estado
    ]
  );

  const id =
    resultado.rows[0].id_oportunidad;

  oportunidades.push(id);

  return id;

};


// ======================================================
// CREAR INSCRIPCIÓN TEMPORAL
// ======================================================

const crearInscripcion = async (
  idOportunidad,
  idVoluntario,
  estado
) => {

  const resultado = await pool.query(
    `
    INSERT INTO inscripcion (
      id_oportunidad,
      id_voluntario,
      estado
    )
    VALUES ($1, $2, $3)
    RETURNING id_inscripcion
    `,
    [
      idOportunidad,
      idVoluntario,
      estado
    ]
  );

  return resultado.rows[0].id_inscripcion;

};


// ======================================================
// CREAR DONACIÓN ACEPTADA
// ======================================================

const crearDonacionAceptada = async () => {

  const resultado = await pool.query(
    `
    INSERT INTO donacion (
      id_voluntario,
      id_organizacion,
      id_categoria_donacion,
      descripcion,
      cantidad,
      unidad,
      condicion_bien,
      disponible_desde,
      estado,
      idempotency_key
    )
    VALUES (
      $1,
      $2,
      $3,
      'Donación temporal de integración',
      3,
      'paquetes',
      'Nuevo',
      '2099-01-01',
      'ACEPTADA',
      $4
    )
    RETURNING id_donacion
    `,
    [
      voluntarios[0],
      idOrganizacion,
      idCategoria,
      randomUUID()
    ]
  );

  return resultado.rows[0].id_donacion;

};


// ======================================================
// CONSULTAR NOTIFICACIONES
// ======================================================

const leerNotificaciones = async (
  columna,
  id,
  tipo
) => {

  const columnasPermitidas = [
    'id_inscripcion',
    'id_oportunidad',
    'id_donacion'
  ];

  if (!columnasPermitidas.includes(columna)) {
    throw new Error(
      'Columna de prueba no permitida'
    );
  }

  const resultado = await pool.query(
    `
    SELECT
      id_notificacion,
      id_usuario,
      tipo
    FROM notificacion
    WHERE ${columna} = $1
      AND tipo = $2
    ORDER BY id_usuario
    `,
    [id, tipo]
  );

  return resultado.rows;

};


// ======================================================
// PREPARACIÓN DE DATOS
// ======================================================

beforeAll(async () => {

  await verificarBD();

  // Crear cuatro voluntarios.

  for (let n = 0; n < 4; n++) {

    const id = await crearUsuario(
      'VOLUNTARIO',
      n
    );

    voluntarios.push(id);

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
        'Test 332'
      )
      `,
      [id]
    );

  }

  // Crear usuario de organización.

  idUsuarioOrganizacion =
    await crearUsuario(
      'ORGANIZACION',
      'org'
    );

  // Crear organización verificada.

  const organizacion = await pool.query(
    `
    INSERT INTO organizacion (
      id_usuario,
      razon_social,
      cuit,
      estado_verificacion
    )
    VALUES (
      $1,
      'Organizacion Test 332',
      $2,
      'VERIFICADA'
    )
    RETURNING id_organizacion
    `,
    [
      idUsuarioOrganizacion,
      `20${randomInt(100000000, 1000000000)}`
    ]
  );

  idOrganizacion =
    organizacion.rows[0].id_organizacion;

  // Crear tipo de actividad.

  const tipo = await pool.query(
    `
    INSERT INTO tipo_actividad (nombre)
    VALUES ($1)
    RETURNING id_tipo_actividad
    `,
    [
      `T332-${randomUUID().slice(0, 8)}`
    ]
  );

  idTipoActividad =
    tipo.rows[0].id_tipo_actividad;

  // Crear categoría de donación.

  const categoria = await pool.query(
    `
    INSERT INTO categoria_donacion (
      nombre,
      descripcion
    )
    VALUES (
      $1,
      'Categoria temporal de integracion'
    )
    RETURNING id_categoria_donacion
    `,
    [
      `C332-${randomUUID().slice(0, 8)}`
    ]
  );

  idCategoria =
    categoria.rows[0].id_categoria_donacion;

});


// ======================================================
// LIMPIEZA FINAL
// ======================================================

afterAll(async () => {

  try {

    // Eliminar envíos push asociados.

    if (usuarios.length) {

      await pool.query(
        `
        DELETE FROM envio_push
        WHERE id_notificacion IN (
          SELECT id_notificacion
          FROM notificacion
          WHERE id_usuario = ANY($1::uuid[])
        )
        `,
        [usuarios]
      );

      // Eliminar notificaciones.

      await pool.query(
        `
        DELETE FROM notificacion
        WHERE id_usuario = ANY($1::uuid[])
        `,
        [usuarios]
      );

    }

    // Eliminar donaciones e historial.

    if (voluntarios.length) {

      await pool.query(
        `
        DELETE FROM historial_estado_donacion
        WHERE id_donacion IN (
          SELECT id_donacion
          FROM donacion
          WHERE id_voluntario = ANY($1::uuid[])
        )
        `,
        [voluntarios]
      );

      await pool.query(
        `
        DELETE FROM donacion
        WHERE id_voluntario = ANY($1::uuid[])
        `,
        [voluntarios]
      );

    }

    // Eliminar inscripciones y oportunidades.

    if (oportunidades.length) {

      await pool.query(
        `
        DELETE FROM inscripcion
        WHERE id_oportunidad = ANY($1::uuid[])
        `,
        [oportunidades]
      );

      await pool.query(
        `
        DELETE FROM oportunidad
        WHERE id_oportunidad = ANY($1::uuid[])
        `,
        [oportunidades]
      );

    }

    // Eliminar tipo de actividad.

    if (idTipoActividad != null) {

      await pool.query(
        `
        DELETE FROM tipo_actividad
        WHERE id_tipo_actividad = $1
        `,
        [idTipoActividad]
      );

    }

    // Eliminar categoría.

    if (idCategoria != null) {

      await pool.query(
        `
        DELETE FROM categoria_donacion
        WHERE id_categoria_donacion = $1
        `,
        [idCategoria]
      );

    }

    // Eliminar organización.

    if (idOrganizacion) {

      await pool.query(
        `
        DELETE FROM organizacion
        WHERE id_organizacion = $1
        `,
        [idOrganizacion]
      );

    }

    // Eliminar perfiles y usuarios.

    if (voluntarios.length) {

      await pool.query(
        `
        DELETE FROM perfil_voluntario
        WHERE id_usuario = ANY($1::uuid[])
        `,
        [voluntarios]
      );

    }

    if (usuarios.length) {

      await pool.query(
        `
        DELETE FROM usuario
        WHERE id_usuario = ANY($1::uuid[])
        `,
        [usuarios]
      );

    }

  } finally {

    await pool.end();

  }

});


// ======================================================
// CASOS DE PRUEBA
// ======================================================

describe(
  'Actividad 3.3.2 - PostgreSQL real',
  () => {

    // ==================================================
    // CP-01 - INSCRIPCIÓN ACEPTADA
    // ==================================================

    test(
      'aceptar inscripción notifica al voluntario correcto y evita duplicados',
      async () => {

        const op = await crearOportunidad();

        const ins = await crearInscripcion(
          op,
          voluntarios[0],
          'PENDIENTE'
        );

        const aceptada =
          await inscripcionService
            .aceptarInscripcion(
              ins,
              idOrganizacion
            );

        expect(aceptada.estado)
          .toBe('ACEPTADA');

        const tipo = 'INSCRIPCION_ACEPTADA';

        const mensajes =
          await leerNotificaciones(
            'id_inscripcion',
            ins,
            tipo
          );

        expect(mensajes).toHaveLength(1);

        expect(mensajes[0].id_usuario)
          .toBe(voluntarios[0]);

        // No debe insertar duplicados.

        expect(
          await notificaciones
            .crearPorInscripcionAceptada(ins)
        ).toEqual([]);

        expect(
          await leerNotificaciones(
            'id_inscripcion',
            ins,
            tipo
          )
        ).toHaveLength(1);

      }
    );


    // ==================================================
    // CP-02 - ROLLBACK DE ACEPTACIÓN
    // ==================================================

    test(
      'una falla push revierte aceptación y notificación en PostgreSQL',
      async () => {

        const op = await crearOportunidad();

        const ins = await crearInscripcion(
          op,
          voluntarios[0],
          'PENDIENTE'
        );

        const spy = jest.spyOn(
          push,
          'crearPendientesPorNotificacion'
        ).mockRejectedValueOnce(
          new Error('Fallo push simulado')
        );

        try {

          await expect(
            inscripcionService.aceptarInscripcion(
              ins,
              idOrganizacion
            )
          ).rejects.toThrow(
            'Fallo push simulado'
          );

        } finally {

          spy.mockRestore();

        }

        const resultado = await pool.query(
          `
          SELECT estado
          FROM inscripcion
          WHERE id_inscripcion = $1
          `,
          [ins]
        );

        expect(resultado.rows[0].estado)
          .toBe('PENDIENTE');

        const avisos =
          await leerNotificaciones(
            'id_inscripcion',
            ins,
            'INSCRIPCION_ACEPTADA'
          );

        expect(avisos).toHaveLength(0);

      }
    );


    // ==================================================
    // CP-03 - CONCURRENCIA
    // ==================================================

    test(
      'dos voluntarios compiten por el último cupo',
      async () => {

        const op = await crearOportunidad(
          'PUBLICADA',
          1
        );

        const a = await crearInscripcion(
          op,
          voluntarios[0],
          'PENDIENTE'
        );

        const b = await crearInscripcion(
          op,
          voluntarios[1],
          'PENDIENTE'
        );

        const resultados = await Promise.allSettled([
          inscripcionService.aceptarInscripcion(
            a,
            idOrganizacion
          ),

          inscripcionService.aceptarInscripcion(
            b,
            idOrganizacion
          )
        ]);

        expect(
          resultados.filter(
            r => r.status === 'fulfilled'
          )
        ).toHaveLength(1);

        expect(
          resultados.filter(
            r => r.status === 'rejected'
          )
        ).toHaveLength(1);

        const rechazo = resultados.find(
          r => r.status === 'rejected'
        );

        expect(rechazo.reason.status)
          .toBe(409);

        const inscripciones = await pool.query(
          `
          SELECT estado, id_voluntario
          FROM inscripcion
          WHERE id_oportunidad = $1
          `,
          [op]
        );

        const aceptadas =
          inscripciones.rows.filter(
            i => i.estado === 'ACEPTADA'
          );

        expect(aceptadas).toHaveLength(1);

        const avisos = await pool.query(
          `
          SELECT n.id_usuario
          FROM notificacion n
          INNER JOIN inscripcion i
            ON i.id_inscripcion = n.id_inscripcion
          WHERE i.id_oportunidad = $1
            AND n.tipo = 'INSCRIPCION_ACEPTADA'
          `,
          [op]
        );

        expect(avisos.rows).toHaveLength(1);

        expect(avisos.rows[0].id_usuario)
          .toBe(aceptadas[0].id_voluntario);

      }
    );


    // ==================================================
    // CP-04 - CANCELACIÓN ACEPTADA
    // ==================================================

    test(
      'cancelar una inscripción aceptada notifica a la organización',
      async () => {

        const op = await crearOportunidad();

        const ins = await crearInscripcion(
          op,
          voluntarios[0],
          'ACEPTADA'
        );

        const cancelada =
          await inscripcionService
            .cancelarInscripcionVoluntario(
              ins,
              voluntarios[0]
            );

        expect(cancelada.estado)
          .toBe('CANCELADA');

        const avisos =
          await leerNotificaciones(
            'id_inscripcion',
            ins,
            'INSCRIPCION_CANCELADA_ORGANIZACION'
          );

        expect(avisos).toHaveLength(1);

        expect(avisos[0].id_usuario)
          .toBe(idUsuarioOrganizacion);

        // Comprobar prevención de duplicados.

        expect(
          await notificaciones
            .crearPorCancelacionInscripcionAceptada(
              ins
            )
        ).toEqual([]);

      }
    );


    // ==================================================
    // CP-05 - CANCELACIÓN PENDIENTE
    // ==================================================

    test(
      'cancelar una inscripción pendiente no notifica',
      async () => {

        const op = await crearOportunidad();

        const ins = await crearInscripcion(
          op,
          voluntarios[0],
          'PENDIENTE'
        );

        const cancelada =
          await inscripcionService
            .cancelarInscripcionVoluntario(
              ins,
              voluntarios[0]
            );

        expect(cancelada.estado)
          .toBe('CANCELADA');

        const avisos =
          await leerNotificaciones(
            'id_inscripcion',
            ins,
            'INSCRIPCION_CANCELADA_ORGANIZACION'
          );

        expect(avisos).toHaveLength(0);

      }
    );


    // ==================================================
    // CP-06 - CANCELACIÓN DE OPORTUNIDAD
    // ==================================================

    test(
      'cancelar oportunidad notifica solo a pendientes y aceptados',
      async () => {

        const op = await crearOportunidad();

        await crearInscripcion(
          op,
          voluntarios[0],
          'PENDIENTE'
        );

        await crearInscripcion(
          op,
          voluntarios[1],
          'ACEPTADA'
        );

        await crearInscripcion(
          op,
          voluntarios[2],
          'RECHAZADA'
        );

        await crearInscripcion(
          op,
          voluntarios[3],
          'CANCELADA'
        );

        const cancelada =
          await oportunidadService
            .cancelarOportunidad(
              op,
              idOrganizacion
            );

        expect(cancelada.estado)
          .toBe('CANCELADA');

        const avisos =
          await leerNotificaciones(
            'id_oportunidad',
            op,
            'OPORTUNIDAD_CANCELADA'
          );

        expect(avisos).toHaveLength(2);

        expect(
          avisos.map(
            n => n.id_usuario
          ).sort()
        ).toEqual([
          voluntarios[0],
          voluntarios[1]
        ].sort());

        // No generar duplicados.

        expect(
          await notificaciones
            .crearPorOportunidadCancelada(op)
        ).toEqual([]);

      }
    );


    // ==================================================
    // CP-07 - ROLLBACK DE OPORTUNIDAD
    // ==================================================

    test(
      'fallar la notificación revierte la cancelación de oportunidad',
      async () => {

        const op = await crearOportunidad();

        await crearInscripcion(
          op,
          voluntarios[0],
          'PENDIENTE'
        );

        const spy = jest.spyOn(
          notificaciones,
          'crearPorOportunidadCancelada'
        ).mockRejectedValueOnce(
          new Error('Fallo notificación simulado')
        );

        try {

          await expect(
            oportunidadService.cancelarOportunidad(
              op,
              idOrganizacion
            )
          ).rejects.toThrow(
            'Fallo notificación simulado'
          );

        } finally {

          spy.mockRestore();

        }

        const resultado = await pool.query(
          `
          SELECT estado
          FROM oportunidad
          WHERE id_oportunidad = $1
          `,
          [op]
        );

        expect(resultado.rows[0].estado)
          .toBe('PUBLICADA');

        const avisos =
          await leerNotificaciones(
            'id_oportunidad',
            op,
            'OPORTUNIDAD_CANCELADA'
          );

        expect(avisos).toHaveLength(0);

      }
    );


    // ==================================================
    // CP-08 - DONACIÓN COORDINADA
    // ==================================================

    test(
      'coordinar donación notifica al voluntario y registra historial',
      async () => {

        const id =
          await crearDonacionAceptada();

        const resultado =
          await donacionService.coordinarDonacion(
            id,
            idUsuarioOrganizacion,
            'Entrega acordada para el jueves',
            '+54 342 5551234'
          );

        expect(resultado.estado)
          .toBe('COORDINADA');

        const avisos =
          await leerNotificaciones(
            'id_donacion',
            id,
            'DONACION_COORDINADA'
          );

        expect(avisos).toHaveLength(1);

        expect(avisos[0].id_usuario)
          .toBe(voluntarios[0]);

        const historial = await pool.query(
          `
          SELECT estado
          FROM historial_estado_donacion
          WHERE id_donacion = $1
            AND estado = 'COORDINADA'
          `,
          [id]
        );

        expect(historial.rows)
          .toHaveLength(1);

        // Comprobar prevención de duplicados.

        expect(
          await notificaciones
            .crearPorDonacionCoordinada(id)
        ).toEqual([]);

      }
    );


    // ==================================================
    // CP-09 - ROLLBACK DE DONACIÓN
    // ==================================================

    test(
      'fallar push revierte coordinación, historial y notificación',
      async () => {

        const id =
          await crearDonacionAceptada();

        const spy = jest.spyOn(
          push,
          'crearPendientesPorNotificacion'
        ).mockRejectedValueOnce(
          new Error('Fallo push simulado')
        );

        try {

          await expect(
            donacionService.coordinarDonacion(
              id,
              idUsuarioOrganizacion,
              'Entrega acordada para el jueves',
              '+54 342 5551234'
            )
          ).rejects.toThrow(
            'Fallo push simulado'
          );

        } finally {

          spy.mockRestore();

        }

        const resultado = await pool.query(
          `
          SELECT estado
          FROM donacion
          WHERE id_donacion = $1
          `,
          [id]
        );

        expect(resultado.rows[0].estado)
          .toBe('ACEPTADA');

        const historial = await pool.query(
          `
          SELECT estado
          FROM historial_estado_donacion
          WHERE id_donacion = $1
            AND estado = 'COORDINADA'
          `,
          [id]
        );

        expect(historial.rows)
          .toHaveLength(0);

        const avisos =
          await leerNotificaciones(
            'id_donacion',
            id,
            'DONACION_COORDINADA'
          );

        expect(avisos).toHaveLength(0);

      }
    );


    // ==================================================
    // CP-10 - SEGURIDAD
    // ==================================================

    test(
      'una organización ajena no cancela oportunidad ni genera avisos',
      async () => {

        const op = await crearOportunidad();

        await crearInscripcion(
          op,
          voluntarios[0],
          'PENDIENTE'
        );

        await expect(
          oportunidadService.cancelarOportunidad(
            op,
            randomUUID()
          )
        ).rejects.toMatchObject({
          status: 403
        });

        const resultado = await pool.query(
          `
          SELECT estado
          FROM oportunidad
          WHERE id_oportunidad = $1
          `,
          [op]
        );

        expect(resultado.rows[0].estado)
          .toBe('PUBLICADA');

        const avisos =
          await leerNotificaciones(
            'id_oportunidad',
            op,
            'OPORTUNIDAD_CANCELADA'
          );

        expect(avisos).toHaveLength(0);

      }
    );

  }
);