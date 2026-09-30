jest.mock(
  '../src/config/db',
  () => ({
    query:
      jest.fn(),
  })
);


const pool =
  require(
    '../src/config/db'
  );

const organizacionRepository =
  require(
    '../src/repositories/organizacionRepository'
  );


beforeEach(() => {

  jest.clearAllMocks();


  pool.query
    .mockResolvedValue({
      rows: [],
    });

});


describe(
  'organizacionRepository - donaciones',
  () => {

    test(
      'lista solamente organizaciones con usuario ACTIVO y estado VERIFICADA',
      async () => {

        await organizacionRepository
          .listarDisponiblesParaDonacion();


        expect(
          pool.query
        ).toHaveBeenCalledTimes(1);


        const query =
          pool.query
            .mock
            .calls[0][0];


        expect(
          query
        ).toContain(
          "usr.estado_cuenta = 'ACTIVA'"
        );


        expect(
          query
        ).toContain(
          "o.estado_verificacion = 'VERIFICADA'"
        );

      }
    );


    test(
      'el listado no consulta datos sensibles de la organización',
      async () => {

        await organizacionRepository
          .listarDisponiblesParaDonacion();


        const query =
          pool.query
            .mock
            .calls[0][0];


        const selectPrincipal =
          query
            .split(
              'FROM organizacion o'
            )[0];


        expect(
          selectPrincipal
        ).not.toMatch(
          /\bcuit\b/i
        );


        expect(
          selectPrincipal
        ).not.toMatch(
          /\bmotivo_rechazo\b/i
        );


        expect(
          selectPrincipal
        ).not.toMatch(
          /\bemail\b(?!_contacto_publico)/i
        );

      }
    );


    test(
      'el detalle solo obtiene organizaciones activas y verificadas',
      async () => {

        await organizacionRepository
          .obtenerDetalleDisponibleDonacion(
            '44444444-4444-4444-8444-444444444444'
          );


        expect(
          pool.query
        ).toHaveBeenCalledTimes(1);


        const query =
          pool.query
            .mock
            .calls[0][0];


        expect(
          query
        ).toContain(
          "u.estado_cuenta ="
        );


        expect(
          query
        ).toContain(
          "'ACTIVA'"
        );


        expect(
          query
        ).toContain(
          "o.estado_verificacion ="
        );


        expect(
          query
        ).toContain(
          "'VERIFICADA'"
        );

      }
    );


    test(
      'el detalle utiliza únicamente el perfil público PUBLICADO',
      async () => {

        await organizacionRepository
          .obtenerDetalleDisponibleDonacion(
            '44444444-4444-4444-8444-444444444444'
          );


        const query =
          pool.query
            .mock
            .calls[0][0];


        expect(
          query
        ).toContain(
          'perfil_publico_organizacion'
        );


        expect(
          query
        ).toContain(
          'p.estado_publicacion'
        );


        expect(
          query
        ).toContain(
          "'PUBLICADO'"
        );


        expect(
          query
        ).toContain(
          'p.descripcion_publica'
        );


        expect(
          query
        ).toContain(
          'p.email_contacto_publico'
        );


        expect(
          query
        ).toContain(
          'p.telefono_contacto_publico'
        );

      }
    );

  }
);