jest.mock(
  '../src/config/db',
  () => ({
    query: jest.fn(),
  })
);

const pool =
  require('../src/config/db');

const perfilPublicoRepository =
  require(
    '../src/repositories/perfilPublicoRepository'
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe(
  'perfilPublicoRepository.listarOrganizacionesPublicas',
  () => {

    test(
      'permite filtrar por localidad y provincia combinadas',
      async () => {

        pool.query.mockResolvedValue({
          rows: [],
        });

        await perfilPublicoRepository
          .listarOrganizacionesPublicas({
            ubicacion:
              'Santa Fe, Santa Fe',
          });

        expect(
          pool.query
        ).toHaveBeenCalledTimes(1);

        const [
          query,
          valores,
        ] = pool.query.mock.calls[0];

        expect(
          query
        ).toContain(
          'CONCAT_WS'
        );

        expect(
          valores
        ).toContain(
          '%Santa Fe, Santa Fe%'
        );
      }
    );

  }
);