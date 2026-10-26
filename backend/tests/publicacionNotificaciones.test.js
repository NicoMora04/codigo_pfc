// ======================================================
// PRUEBAS DE PUBLICACIÓN Y GENERACIÓN DE NOTIFICACIONES
// ACTIVIDAD 3.3.1
// ======================================================

// ======================================================
// MOCK DE CLIENTE POSTGRESQL
// ======================================================

const mockClient = {
  query: jest.fn(),
  release: jest.fn()
};


// ======================================================
// MOCK DE CONEXIÓN A BASE DE DATOS
// ======================================================

jest.mock('../src/config/db', () => ({
  connect: jest.fn()
}));


// ======================================================
// MOCK DE REPOSITORIO DE OPORTUNIDADES
// ======================================================

jest.mock('../src/repositories/oportunidadRepository', () => ({
  buscarOportunidadPorId: jest.fn(),
  publicarOportunidad: jest.fn()
}));


// ======================================================
// MOCK DE SERVICIO DE NOTIFICACIONES
// ======================================================

jest.mock('../src/services/notificacionService', () => ({
  generarPorNuevaOportunidad: jest.fn()
}));


// ======================================================
// MOCK DE REPOSITORIO DE ENVÍOS PUSH
// ======================================================

jest.mock('../src/repositories/envioPushRepository', () => ({
  crearPendientesPorOportunidad: jest.fn()
}));


// ======================================================
// IMPORTACIONES
// ======================================================

const pool =
  require('../src/config/db');

const oportunidadRepository =
  require('../src/repositories/oportunidadRepository');

const notificacionService =
  require('../src/services/notificacionService');

const envioPushRepository =
  require('../src/repositories/envioPushRepository');

const oportunidadService =
  require('../src/services/oportunidadService');


// ======================================================
// DATOS BASE DE PRUEBA
// ======================================================

const idOportunidad =
  '11111111-1111-4111-8111-111111111111';

const idOrganizacion =
  '22222222-2222-4222-8222-222222222222';


const borrador = {

  id_oportunidad: idOportunidad,

  id_organizacion: idOrganizacion,

  id_ubicacion:
    '33333333-3333-4333-8333-333333333333',

  tipo_ubicacion: 'EXACTA',

  estado: 'BORRADOR',

  eliminado_en: null

};


const publicada = {
  ...borrador,
  estado: 'PUBLICADA'
};


// ======================================================
// CONFIGURACIÓN GENERAL
// ======================================================

beforeEach(() => {

  jest.resetAllMocks();


  // Simular conexión PostgreSQL.

  pool.connect.mockResolvedValue(mockClient);


  // Simular ejecución de consultas SQL.

  mockClient.query.mockResolvedValue({
    rows: []
  });


  // Por defecto, existe un borrador válido.

  oportunidadRepository
    .buscarOportunidadPorId
    .mockResolvedValue(borrador);


  // Simular publicación correcta.

  oportunidadRepository
    .publicarOportunidad
    .mockResolvedValue(publicada);


  // Simular dos notificaciones generadas.

  notificacionService
    .generarPorNuevaOportunidad
    .mockResolvedValue([
      {
        id_notificacion: 'n1'
      },
      {
        id_notificacion: 'n2'
      }
    ]);


  // Simular un envío push pendiente.

  envioPushRepository
    .crearPendientesPorOportunidad
    .mockResolvedValue([
      {
        id_envio_push: 'e1'
      }
    ]);


  // Evitar mensajes informativos durante las pruebas.

  jest.spyOn(
    console,
    'log'
  ).mockImplementation(() => {});

});


afterEach(() => {

  jest.restoreAllMocks();

});


// ======================================================
// PRUEBA 1
// PUBLICACIÓN TRANSACCIONAL EXITOSA
// ======================================================

test(
  'publica, genera notificaciones y crea envíos dentro de la misma transacción',
  async () => {

    const resultado =
      await oportunidadService.publicarOportunidad(
        idOportunidad,
        idOrganizacion
      );


    expect(resultado).toEqual(
      publicada
    );


    // Debe obtener una única conexión.

    expect(
      pool.connect
    ).toHaveBeenCalledTimes(1);


    // Debe iniciar y confirmar la transacción.

    expect(
      mockClient.query.mock.calls.map(
        ([sql]) => sql
      )
    ).toEqual([
      'BEGIN',
      'COMMIT'
    ]);


    // La publicación debe utilizar el cliente
    // de la misma transacción.

    expect(
      oportunidadRepository.publicarOportunidad
    ).toHaveBeenCalledWith(

      idOportunidad,

      idOrganizacion,

      mockClient

    );


    // Las notificaciones deben generarse
    // dentro de la misma transacción.

    expect(
      notificacionService.generarPorNuevaOportunidad
    ).toHaveBeenCalledWith(

      idOportunidad,

      mockClient

    );


    // Los envíos push también deben registrarse
    // dentro de la misma transacción.

    expect(
      envioPushRepository.crearPendientesPorOportunidad
    ).toHaveBeenCalledWith(

      idOportunidad,

      mockClient

    );


    // La conexión debe liberarse.

    expect(
      mockClient.release
    ).toHaveBeenCalledTimes(1);

  }
);


// ======================================================
// PRUEBA 2
// PUBLICACIÓN SIN DISPOSITIVOS ACTIVOS
// ======================================================

test(
  'confirma la publicación aun cuando no hay envíos push pendientes',
  async () => {

    // No existen dispositivos activos.

    envioPushRepository
      .crearPendientesPorOportunidad
      .mockResolvedValue([]);


    await expect(

      oportunidadService.publicarOportunidad(
        idOportunidad,
        idOrganizacion
      )

    ).resolves.toEqual(publicada);


    // Las notificaciones internas se generan igual.

    expect(
      notificacionService.generarPorNuevaOportunidad
    ).toHaveBeenCalledTimes(1);


    // La transacción debe confirmarse.

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


// ======================================================
// PRUEBA 3
// ERROR AL GENERAR NOTIFICACIONES
// ======================================================

test(
  'hace ROLLBACK cuando falla la generación de notificaciones',
  async () => {

    // Simular un error al crear las notificaciones.

    notificacionService
      .generarPorNuevaOportunidad
      .mockRejectedValue(

        new Error(
          'Error controlado al crear notificaciones'
        )

      );


    await expect(

      oportunidadService.publicarOportunidad(
        idOportunidad,
        idOrganizacion
      )

    ).rejects.toThrow(
      'Error controlado al crear notificaciones'
    );


    // Debe iniciar la transacción.

    expect(
      mockClient.query
    ).toHaveBeenCalledWith(
      'BEGIN'
    );


    // Debe revertir los cambios.

    expect(
      mockClient.query
    ).toHaveBeenCalledWith(
      'ROLLBACK'
    );


    // No debe confirmar la publicación.

    expect(
      mockClient.query
    ).not.toHaveBeenCalledWith(
      'COMMIT'
    );


    // No debe continuar creando envíos push.

    expect(
      envioPushRepository.crearPendientesPorOportunidad
    ).not.toHaveBeenCalled();


    // Debe liberar la conexión.

    expect(
      mockClient.release
    ).toHaveBeenCalledTimes(1);

  }
);


// ======================================================
// PRUEBA 4
// ERROR AL REGISTRAR ENVÍOS PUSH
// ======================================================

test(
  'hace ROLLBACK cuando falla la creación de envíos push',
  async () => {

    // Simular error al crear trabajos pendientes.

    envioPushRepository
      .crearPendientesPorOportunidad
      .mockRejectedValue(

        new Error(
          'Error controlado en la cola push'
        )

      );


    await expect(

      oportunidadService.publicarOportunidad(
        idOportunidad,
        idOrganizacion
      )

    ).rejects.toThrow(
      'Error controlado en la cola push'
    );


    // Debe haber intentado generar notificaciones.

    expect(
      notificacionService.generarPorNuevaOportunidad
    ).toHaveBeenCalledTimes(1);


    // Debe revertir la operación completa.

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


// ======================================================
// PRUEBA 5
// PUBLICACIÓN CONCURRENTE O BORRADOR NO DISPONIBLE
// ======================================================

test(
  'hace ROLLBACK si el UPDATE ya no puede publicar el borrador',
  async () => {

    // Simular que la oportunidad ya no puede
    // pasar de BORRADOR a PUBLICADA.

    oportunidadRepository
      .publicarOportunidad
      .mockResolvedValue(null);


    await expect(

      oportunidadService.publicarOportunidad(
        idOportunidad,
        idOrganizacion
      )

    ).rejects.toMatchObject({

      status: 409

    });


    // No debe generar notificaciones.

    expect(
      notificacionService.generarPorNuevaOportunidad
    ).not.toHaveBeenCalled();


    // No debe registrar envíos.

    expect(
      envioPushRepository.crearPendientesPorOportunidad
    ).not.toHaveBeenCalled();


    // Debe ejecutar ROLLBACK.

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


// ======================================================
// PRUEBA 6
// ORGANIZACIÓN SIN PERMISOS
// ======================================================

test(
  'rechaza publicar una oportunidad de otra organización',
  async () => {

    const otraOrganizacion =
      '44444444-4444-4444-8444-444444444444';


    await expect(

      oportunidadService.publicarOportunidad(
        idOportunidad,
        otraOrganizacion
      )

    ).rejects.toMatchObject({

      status: 403

    });


    // No debe abrir una transacción.

    expect(
      pool.connect
    ).not.toHaveBeenCalled();


    // No debe publicar la oportunidad.

    expect(
      oportunidadRepository.publicarOportunidad
    ).not.toHaveBeenCalled();

  }
);


// ======================================================
// PRUEBA 7
// OPORTUNIDAD YA PUBLICADA
// ======================================================

test(
  'rechaza una oportunidad que ya está publicada',
  async () => {

    oportunidadRepository
      .buscarOportunidadPorId
      .mockResolvedValue(publicada);


    await expect(

      oportunidadService.publicarOportunidad(
        idOportunidad,
        idOrganizacion
      )

    ).rejects.toMatchObject({

      status: 409

    });


    // No debe abrir una transacción.

    expect(
      pool.connect
    ).not.toHaveBeenCalled();


    // No debe generar notificaciones.

    expect(
      notificacionService.generarPorNuevaOportunidad
    ).not.toHaveBeenCalled();

  }
);


// ======================================================
// PRUEBA 8
// OPORTUNIDAD SIN UBICACIÓN
// ======================================================

test(
  'rechaza un borrador sin ubicación definida',
  async () => {

    oportunidadRepository
      .buscarOportunidadPorId
      .mockResolvedValue({

        ...borrador,

        id_ubicacion: null

      });


    await expect(

      oportunidadService.publicarOportunidad(
        idOportunidad,
        idOrganizacion
      )

    ).rejects.toMatchObject({

      status: 400

    });


    // No debe abrir una transacción.

    expect(
      pool.connect
    ).not.toHaveBeenCalled();


    // No debe generar notificaciones.

    expect(
      notificacionService.generarPorNuevaOportunidad
    ).not.toHaveBeenCalled();

  }
);