// ======================================================
// PRUEBAS DEL REPOSITORIO DE PUBLICACIÓN
// ACTIVIDAD 3.3.1
// ======================================================

jest.mock('../src/config/db', () => ({
  query: jest.fn()
}));

const pool =
  require('../src/config/db');

const oportunidadRepository =
  require('../src/repositories/oportunidadRepository');

const idOportunidad =
  '11111111-1111-4111-8111-111111111111';

const idOrganizacion =
  '22222222-2222-4222-8222-222222222222';

const mockClient = {
  query: jest.fn()
};

beforeEach(() => {
  jest.clearAllMocks();
});


// ======================================================
// PRUEBA 1 - PUBLICACIÓN EXITOSA
// ======================================================

test(
  'publica utilizando la conexión de la transacción',
  async () => {

    const oportunidad = {
      id_oportunidad: idOportunidad,
      id_organizacion: idOrganizacion,
      estado: 'PUBLICADA'
    };

    mockClient.query.mockResolvedValue({
      rows: [oportunidad]
    });

    const resultado =
      await oportunidadRepository.publicarOportunidad(
        idOportunidad,
        idOrganizacion,
        mockClient
      );

    expect(resultado).toEqual(oportunidad);

    expect(mockClient.query).toHaveBeenCalledWith(
      expect.any(String),
      [idOportunidad, idOrganizacion]
    );

    // No debe utilizar la conexión general.
    expect(pool.query).not.toHaveBeenCalled();

  }
);


// ======================================================
// PRUEBA 2 - PUBLICACIÓN NO PERMITIDA
// ======================================================

test(
  'devuelve null si ninguna oportunidad cumple las condiciones',
  async () => {

    mockClient.query.mockResolvedValue({
      rows: []
    });

    const resultado =
      await oportunidadRepository.publicarOportunidad(
        idOportunidad,
        idOrganizacion,
        mockClient
      );

    expect(resultado).toBeNull();

  }
);


// ======================================================
// PRUEBA 3 - RESTRICCIONES DE PUBLICACIÓN
// ======================================================

test(
  'exige organización propietaria, borrador y oportunidad no eliminada',
  async () => {

    mockClient.query.mockResolvedValue({
      rows: []
    });

    await oportunidadRepository.publicarOportunidad(
      idOportunidad,
      idOrganizacion,
      mockClient
    );

    const consulta =
      mockClient.query.mock.calls[0][0];

    expect(consulta).toMatch(
      /id_organizacion\s*=\s*\$2/i
    );

    expect(consulta).toMatch(
      /estado\s*=\s*'BORRADOR'/i
    );

    expect(consulta).toMatch(
      /eliminado_en\s+IS\s+NULL/i
    );

    expect(consulta).toMatch(
      /WHERE\s+id_oportunidad\s*=\s*\$1/i
    );

  }
);


// ======================================================
// PRUEBA 4 - UBICACIÓN OBLIGATORIA
// ======================================================

test(
  'exige ubicación y tipo de ubicación para publicar',
  async () => {

    mockClient.query.mockResolvedValue({
      rows: []
    });

    await oportunidadRepository.publicarOportunidad(
      idOportunidad,
      idOrganizacion,
      mockClient
    );

    const consulta =
      mockClient.query.mock.calls[0][0];

    expect(consulta).toMatch(
      /id_ubicacion\s+IS\s+NOT\s+NULL/i
    );

    expect(consulta).toMatch(
      /tipo_ubicacion\s+IS\s+NOT\s+NULL/i
    );

  }
);