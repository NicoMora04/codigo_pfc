// ======================================================
// PRUEBAS DE GENERACIÓN DE NOTIFICACIONES
// ACTIVIDAD 3.3.1
// ======================================================


// ======================================================
// MOCK DE POSTGRESQL
// ======================================================

jest.mock(
  '../src/config/db',
  () => ({
    query: jest.fn()
  })
);


// ======================================================
// IMPORTACIONES
// ======================================================

const pool =
  require('../src/config/db');

const notificacionService =
  require('../src/services/notificacionService');

const notificacionRepository =
  require('../src/repositories/notificacionRepository');

const envioPushRepository =
  require('../src/repositories/envioPushRepository');


// ======================================================
// DATOS DE PRUEBA
// ======================================================

const idOportunidad =
  '11111111-1111-4111-8111-111111111111';

const idVoluntario1 =
  '22222222-2222-4222-8222-222222222222';

const idVoluntario2 =
  '33333333-3333-4333-8333-333333333333';

const idNotificacion =
  '44444444-4444-4444-8444-444444444444';

const idTipoActividad = 3;


// ======================================================
// CLIENTE TRANSACCIONAL SIMULADO
// ======================================================

const mockClient = {
  query: jest.fn()
};


// ======================================================
// NORMALIZAR CONSULTAS SQL
// ======================================================

const normalizarSQL = (sql) =>
  sql.replace(/\s+/g, ' ').trim();


// ======================================================
// CONFIGURACIÓN GENERAL
// ======================================================

beforeEach(() => {

  jest.resetAllMocks();

});


// ======================================================
// PRUEBA 1
// GENERACIÓN DE NOTIFICACIONES
// ======================================================

test(
  'genera notificaciones utilizando la conexión transaccional',
  async () => {

    const notificaciones = [
      {
        id_notificacion: idNotificacion,
        id_usuario: idVoluntario1,
        id_oportunidad: idOportunidad
      }
    ];


    mockClient.query.mockResolvedValue({
      rows: notificaciones
    });


    const resultado =
      await notificacionService
        .generarPorNuevaOportunidad(
          idOportunidad,
          mockClient
        );


    expect(resultado).toEqual(
      notificaciones
    );


    expect(
      mockClient.query
    ).toHaveBeenCalledTimes(1);


    expect(
      mockClient.query
    ).toHaveBeenCalledWith(
      expect.any(String),
      [idOportunidad]
    );


    // No debe utilizar una conexión independiente.

    expect(
      pool.query
    ).not.toHaveBeenCalled();

  }
);


// ======================================================
// PRUEBA 2
// VALIDAR IDENTIFICADOR DE OPORTUNIDAD
// ======================================================

test(
  'rechaza identificadores de oportunidad inválidos',
  async () => {

    await expect(

      notificacionService
        .generarPorNuevaOportunidad(
          'id-invalido',
          mockClient
        )

    ).rejects.toMatchObject({

      status: 400

    });


    expect(
      mockClient.query
    ).not.toHaveBeenCalled();

  }
);


// ======================================================
// PRUEBA 3
// COINCIDENCIA DE INTERESES
// ======================================================

test(
  'selecciona voluntarios mediante coincidencia de tipo de actividad',
  async () => {

    mockClient.query.mockResolvedValue({
      rows: []
    });


    await notificacionRepository
      .crearPorOportunidadPublicada(
        idOportunidad,
        mockClient
      );


    const sql = normalizarSQL(
      mockClient.query.mock.calls[0][0]
    );


    // Debe consultar los intereses.

    expect(sql).toMatch(
      /INNER JOIN voluntario_tipo_actividad vta/i
    );


    // El interés debe coincidir con
    // el tipo de actividad de la oportunidad.

    expect(sql).toMatch(
      /vta\.id_tipo_actividad\s*=\s*o\.id_tipo_actividad/i
    );


    // Debe relacionar el interés con el usuario.

    expect(sql).toMatch(
      /u\.id_usuario\s*=\s*vta\.id_voluntario/i
    );


    // Debe filtrar la oportunidad solicitada.

    expect(sql).toMatch(
      /o\.id_oportunidad\s*=\s*\$1/i
    );

  }
);


// ======================================================
// PRUEBA 4
// VOLUNTARIOS Y OPORTUNIDADES HABILITADAS
// ======================================================

test(
  'genera notificaciones solo para voluntarios activos y oportunidades publicadas',
  async () => {

    mockClient.query.mockResolvedValue({
      rows: []
    });


    await notificacionRepository
      .crearPorOportunidadPublicada(
        idOportunidad,
        mockClient
      );


    const sql = normalizarSQL(
      mockClient.query.mock.calls[0][0]
    );


    // Solamente voluntarios.

    expect(sql).toMatch(
      /u\.rol\s*=\s*'VOLUNTARIO'/i
    );


    // Cuenta activa.

    expect(sql).toMatch(
      /u\.estado_cuenta\s*=\s*'ACTIVA'/i
    );


    // Oportunidad publicada.

    expect(sql).toMatch(
      /o\.estado\s*=\s*'PUBLICADA'/i
    );


    // Oportunidad no eliminada.

    expect(sql).toMatch(
      /o\.eliminado_en\s+IS\s+NULL/i
    );

  }
);


// ======================================================
// PRUEBA 5
// PREVENCIÓN DE NOTIFICACIONES DUPLICADAS
// ======================================================

test(
  'utiliza una restricción única para evitar notificaciones duplicadas',
  async () => {

    // Simular que PostgreSQL detecta un conflicto
    // y no inserta un registro repetido.

    mockClient.query.mockResolvedValue({
      rows: []
    });


    const resultado =
      await notificacionRepository
        .crearPorOportunidadPublicada(
          idOportunidad,
          mockClient
        );


    expect(resultado).toEqual([]);


    const sql = normalizarSQL(
      mockClient.query.mock.calls[0][0]
    );


    // Evitar duplicados en el SELECT.

    expect(sql).toMatch(
      /SELECT DISTINCT/i
    );


    // Restricción única.

    expect(sql).toContain(
      'uq_notificacion_usuario_tipo_oportunidad'
    );


    // Si existe el registro, no repetirlo.

    expect(sql).toMatch(
      /DO NOTHING/i
    );

  }
);


// ======================================================
// PRUEBA 6
// CONSULTAR DESTINATARIOS POR INTERESES
// ======================================================

test(
  'obtiene los identificadores de voluntarios interesados',
  async () => {

    pool.query.mockResolvedValue({

      rows: [
        {
          id_usuario: idVoluntario1
        },
        {
          id_usuario: idVoluntario2
        }
      ]

    });


    const resultado =
      await notificacionRepository
        .buscarDestinatariosPorTipoActividad(
          idTipoActividad
        );


    expect(resultado).toEqual([
      idVoluntario1,
      idVoluntario2
    ]);


    expect(
      pool.query
    ).toHaveBeenCalledWith(
      expect.any(String),
      [idTipoActividad]
    );


    const sql = normalizarSQL(
      pool.query.mock.calls[0][0]
    );


    expect(sql).toMatch(
      /SELECT DISTINCT/i
    );


    expect(sql).toMatch(
      /vta\.id_tipo_actividad\s*=\s*\$1/i
    );


    expect(sql).toMatch(
      /u\.rol\s*=\s*'VOLUNTARIO'/i
    );


    expect(sql).toMatch(
      /u\.estado_cuenta\s*=\s*'ACTIVA'/i
    );

  }
);


// ======================================================
// PRUEBA 7
// ENVÍOS PUSH SOLAMENTE A DISPOSITIVOS ACTIVOS
// ======================================================

test(
  'genera envíos pendientes solamente para dispositivos activos',
  async () => {

    const envios = [
      {
        id_envio_push: 'envio-1',
        id_notificacion: idNotificacion,
        estado: 'PENDIENTE'
      }
    ];


    mockClient.query.mockResolvedValue({
      rows: envios
    });


    const resultado =
      await envioPushRepository
        .crearPendientesPorOportunidad(
          idOportunidad,
          mockClient
        );


    expect(resultado).toEqual(
      envios
    );


    const sql = normalizarSQL(
      mockClient.query.mock.calls[0][0]
    );


    // Relacionar notificación y dispositivo.

    expect(sql).toMatch(
      /INNER JOIN token_dispositivo td/i
    );


    expect(sql).toMatch(
      /td\.id_usuario\s*=\s*n\.id_usuario/i
    );


    // Solamente dispositivos activos.

    expect(sql).toMatch(
      /td\.activo\s*=\s*TRUE/i
    );


    // Solamente notificaciones de oportunidades.

    expect(sql).toMatch(
      /n\.tipo\s*=\s*'NUEVA_OPORTUNIDAD'/i
    );


    // Estado inicial del envío.

    expect(sql).toMatch(
      /'PENDIENTE'/i
    );


    expect(
      mockClient.query
    ).toHaveBeenCalledWith(
      expect.any(String),
      [idOportunidad]
    );

  }
);


// ======================================================
// PRUEBA 8
// NOTIFICACIONES SIN DISPOSITIVOS ACTIVOS
// ======================================================

test(
  'mantiene las notificaciones internas aunque no existan dispositivos activos',
  async () => {

    const notificaciones = [
      {
        id_notificacion: idNotificacion,
        id_usuario: idVoluntario1,
        id_oportunidad: idOportunidad
      }
    ];


    // Primera consulta:
    // se generan notificaciones internas.

    mockClient.query.mockResolvedValueOnce({
      rows: notificaciones
    });


    // Segunda consulta:
    // no hay dispositivos activos.

    mockClient.query.mockResolvedValueOnce({
      rows: []
    });


    const resultadoNotificaciones =
      await notificacionService
        .generarPorNuevaOportunidad(
          idOportunidad,
          mockClient
        );


    const resultadoEnvios =
      await envioPushRepository
        .crearPendientesPorOportunidad(
          idOportunidad,
          mockClient
        );


    // Las notificaciones internas existen.

    expect(
      resultadoNotificaciones
    ).toHaveLength(1);


    // No se crearon envíos push.

    expect(
      resultadoEnvios
    ).toHaveLength(0);


    // Ambas operaciones utilizan el mismo cliente.

    expect(
      mockClient.query
    ).toHaveBeenCalledTimes(2);


    expect(
      pool.query
    ).not.toHaveBeenCalled();


    // La generación interna no debe requerir
    // un dispositivo registrado.

    const sqlNotificaciones =
      normalizarSQL(
        mockClient.query.mock.calls[0][0]
      );


    expect(sqlNotificaciones).not.toMatch(
      /JOIN\s+token_dispositivo/i
    );

  }
);


// ======================================================
// PRUEBA 9
// PREVENCIÓN DE ENVÍOS PUSH DUPLICADOS
// ======================================================

test(
  'evita generar envíos duplicados para una notificación y dispositivo',
  async () => {

    // Simular conflicto con un envío existente.

    mockClient.query.mockResolvedValue({
      rows: []
    });


    const resultado =
      await envioPushRepository
        .crearPendientesPorOportunidad(
          idOportunidad,
          mockClient
        );


    expect(resultado).toEqual([]);


    const sql = normalizarSQL(
      mockClient.query.mock.calls[0][0]
    );


    expect(sql).toContain(
      'uq_envio_push_notificacion_dispositivo'
    );


    expect(sql).toMatch(
      /ON CONFLICT/i
    );


    expect(sql).toMatch(
      /DO NOTHING/i
    );

  }
);


// ======================================================
// PRUEBA 10
// MÚLTIPLES DISPOSITIVOS ACTIVOS
// ======================================================

test(
  'permite registrar un envío independiente por dispositivo activo',
  async () => {

    const envios = [
      {
        id_envio_push: 'envio-1',
        id_notificacion: idNotificacion,
        id_token_dispositivo: 'dispositivo-1',
        estado: 'PENDIENTE'
      },
      {
        id_envio_push: 'envio-2',
        id_notificacion: idNotificacion,
        id_token_dispositivo: 'dispositivo-2',
        estado: 'PENDIENTE'
      }
    ];


    mockClient.query.mockResolvedValue({
      rows: envios
    });


    const resultado =
      await envioPushRepository
        .crearPendientesPorOportunidad(
          idOportunidad,
          mockClient
        );


    expect(resultado).toHaveLength(2);


    expect(
      resultado[0].id_token_dispositivo
    ).not.toBe(
      resultado[1].id_token_dispositivo
    );


    expect(
      mockClient.query
    ).toHaveBeenCalledTimes(1);

  }
);