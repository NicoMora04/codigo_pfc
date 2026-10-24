const estadisticaRepository =
  require('../repositories/estadisticaRepository');


// ======================================================
// OBTENER ESTADÍSTICAS DE LA ORGANIZACIÓN
// ACTIVIDAD 3.4.1
// ======================================================

exports.obtenerEstadisticasOrganizacion = async (
  idOrganizacion
) => {

  // ====================================================
  // CONSULTAS PRINCIPALES
  // ====================================================

  const [
    resumen,
    resumenOportunidades,
    topOportunidades,
    ocupacionOportunidades,
    inscripcionesPorEstado,
    metricasInscripciones,
    donacionesPorEstado,
    metricasDonaciones,
    donacionesPorCategoria
  ] = await Promise.all([

    estadisticaRepository
      .obtenerResumenOrganizacion(
        idOrganizacion
      ),

    estadisticaRepository
      .obtenerResumenOportunidades(
        idOrganizacion
      ),

    estadisticaRepository
      .obtenerTopOportunidades(
        idOrganizacion,
        5
      ),

    estadisticaRepository
      .obtenerOcupacionOportunidades(
        idOrganizacion
      ),

    estadisticaRepository
      .obtenerInscripcionesPorEstado(
        idOrganizacion
      ),

    estadisticaRepository
      .obtenerMetricasInscripciones(
        idOrganizacion
      ),

    estadisticaRepository
      .obtenerDonacionesPorEstado(
        idOrganizacion
      ),

    estadisticaRepository
      .obtenerMetricasDonaciones(
        idOrganizacion
      ),

    estadisticaRepository
      .obtenerDonacionesPorCategoria(
        idOrganizacion
      )

  ]);


  // ====================================================
  // NORMALIZAR DISTRIBUCIÓN DE INSCRIPCIONES
  // ====================================================

  const estadosInscripciones = {
    PENDIENTE: 0,
    ACEPTADA: 0,
    RECHAZADA: 0,
    CANCELADA: 0,
    COMPLETADA: 0,
    AUSENTE: 0
  };


  for (
    const fila
    of inscripcionesPorEstado
  ) {

    if (
      Object.prototype.hasOwnProperty.call(
        estadosInscripciones,
        fila.estado
      )
    ) {

      estadosInscripciones[
        fila.estado
      ] = Number(
        fila.cantidad
      );

    }

  }


  // ====================================================
  // NORMALIZAR DISTRIBUCIÓN DE DONACIONES
  // ====================================================

  const estadosDonaciones = {
    PENDIENTE: 0,
    ACEPTADA: 0,
    RECHAZADA: 0,
    COORDINADA: 0,
    RECIBIDA: 0
  };


  for (
    const fila
    of donacionesPorEstado
  ) {

    if (
      Object.prototype.hasOwnProperty.call(
        estadosDonaciones,
        fila.estado
      )
    ) {

      estadosDonaciones[
        fila.estado
      ] = Number(
        fila.cantidad
      );

    }

  }


  // ====================================================
  // NORMALIZAR TOP DE OPORTUNIDADES
  // ====================================================

  const topParticipacion =
    topOportunidades.map(
      (
        oportunidad,
        indice
      ) => ({
        posicion:
          indice + 1,

        idOportunidad:
          oportunidad.id_oportunidad,

        titulo:
          oportunidad.titulo,

        estado:
          oportunidad.estado,

        cupoTotal:
          Number(
            oportunidad.cupo_total
          ),

        totalInscripciones:
          Number(
            oportunidad.total_inscripciones
          ),

        participacionesCompletadas:
          Number(
            oportunidad
              .participaciones_completadas
          )
      })
    );


  // ====================================================
  // NORMALIZAR OCUPACIÓN DE OPORTUNIDADES
  // ====================================================

  const ocupacion =
    ocupacionOportunidades.map(
      (oportunidad) => ({

        idOportunidad:
          oportunidad.id_oportunidad,

        titulo:
          oportunidad.titulo,

        estado:
          oportunidad.estado,

        cupoTotal:
          Number(
            oportunidad.cupo_total
          ),

        voluntariosAceptados:
          Number(
            oportunidad
              .voluntarios_aceptados
          ),

        porcentajeOcupacion:
          Number(
            oportunidad
              .porcentaje_ocupacion
          )

      })
    );


  // ====================================================
  // NORMALIZAR CATEGORÍAS DE DONACIÓN
  // ====================================================

  const categoriasDonacion =
    donacionesPorCategoria.map(
      (categoria) => ({

        idCategoriaDonacion:
          Number(
            categoria
              .id_categoria_donacion
          ),

        categoria:
          categoria.categoria,

        cantidad:
          Number(
            categoria.cantidad
          )

      })
    );


  // ====================================================
  // RESPUESTA FINAL
  // ====================================================

  return {

    resumen: {

      oportunidadesActivas:
        Number(
          resumen
            .oportunidades_activas
        ),

      inscripcionesRecibidas:
        Number(
          resumen
            .inscripciones_recibidas
        ),

      participacionesCompletadas:
        Number(
          resumen
            .participaciones_completadas
        ),

      donacionesRecibidas:
        Number(
          resumen
            .donaciones_recibidas
        )

    },


    oportunidades: {

      total:
        Number(
          resumenOportunidades
            .total_oportunidades
        ),

      promedioInscripciones:
        Number(
          resumenOportunidades
            .promedio_inscripciones
        ),

      topParticipacion,

      ocupacion

    },


    inscripciones: {

      total:
        Number(
          metricasInscripciones
            .total_inscripciones
        ),

      totalAceptadas:
        Number(
          metricasInscripciones
            .total_aceptadas
        ),

      totalCompletadas:
        Number(
          metricasInscripciones
            .total_completadas
        ),

      totalAusentes:
        Number(
          metricasInscripciones
            .total_ausentes
        ),

      tasaAceptacion:
        Number(
          metricasInscripciones
            .tasa_aceptacion
        ),

      tasaParticipacion:
        Number(
          metricasInscripciones
            .tasa_participacion
        ),

      tiempoPromedioRespuestaHoras:
        Number(
          metricasInscripciones
            .tiempo_promedio_respuesta_horas
        ),

      porEstado:
        estadosInscripciones

    },


    donaciones: {

      totalOfertas:
        Number(
          metricasDonaciones
            .total_ofertas
        ),

      totalRecibidas:
        Number(
          metricasDonaciones
            .total_recibidas
        ),

      tasaConcrecion:
        Number(
          metricasDonaciones
            .tasa_concrecion
        ),

      porEstado:
        estadosDonaciones,

      porCategoria:
        categoriasDonacion

    }

  };

};

// ======================================================
// ESTADÍSTICAS GLOBALES PARA ADMIN
// ACTIVIDAD 3.4.2
// ======================================================

exports.obtenerEstadisticasGlobales =
  async () => {

    const [
      resumen,
      usuariosPorRol,
      organizacionesPorEstado,
      oportunidadesPorEstado,
      inscripcionesPorEstado,
      donacionesPorEstado,
      metricasParticipacion,
      metricasDonaciones,
      topOrganizacionesOportunidades,
      topOrganizacionesParticipacion,
      topOrganizacionesDonaciones,
      topVoluntariosParticipacion
    ] =
      await Promise.all([

        estadisticaRepository
          .obtenerResumenGlobal(),

        estadisticaRepository
          .obtenerUsuariosPorRol(),

        estadisticaRepository
          .obtenerOrganizacionesPorEstado(),

        estadisticaRepository
          .obtenerOportunidadesGlobalesPorEstado(),

        estadisticaRepository
          .obtenerInscripcionesGlobalesPorEstado(),

        estadisticaRepository
          .obtenerDonacionesGlobalesPorEstado(),

        estadisticaRepository
          .obtenerMetricasGlobalesParticipacion(),

        estadisticaRepository
          .obtenerMetricasGlobalesDonaciones(),

        estadisticaRepository
          .obtenerTopOrganizacionesPorOportunidades(),

        estadisticaRepository
          .obtenerTopOrganizacionesPorParticipacion(),

        estadisticaRepository
          .obtenerTopOrganizacionesPorDonaciones(),

        estadisticaRepository
          .obtenerTopVoluntariosPorParticipacion()

      ]);


    // ==================================================
    // NORMALIZAR USUARIOS POR ROL
    // ==================================================

    const usuariosPorRolNormalizados = {

      VOLUNTARIO: 0,
      ORGANIZACION: 0,

    };


    usuariosPorRol.forEach(
      (item) => {

        usuariosPorRolNormalizados[
          item.rol
        ] =
          Number(
            item.cantidad
          );

      }
    );


    // ==================================================
    // NORMALIZAR ORGANIZACIONES POR ESTADO
    // ==================================================

    const organizacionesPorEstadoNormalizadas = {

      PENDIENTE: 0,
      VERIFICADA: 0,
      RECHAZADA: 0,

    };


    organizacionesPorEstado.forEach(
      (item) => {

        organizacionesPorEstadoNormalizadas[
          item.estado
        ] =
          Number(
            item.cantidad
          );

      }
    );


    // ==================================================
    // NORMALIZAR OPORTUNIDADES POR ESTADO
    // ==================================================

    const oportunidadesPorEstadoNormalizadas = {

      BORRADOR: 0,
      PUBLICADA: 0,
      CERRADA: 0,
      FINALIZADA: 0,
      CANCELADA: 0,

    };


    oportunidadesPorEstado.forEach(
      (item) => {

        oportunidadesPorEstadoNormalizadas[
          item.estado
        ] =
          Number(
            item.cantidad
          );

      }
    );


    // ==================================================
    // NORMALIZAR INSCRIPCIONES POR ESTADO
    // ==================================================

    const inscripcionesPorEstadoNormalizadas = {

      PENDIENTE: 0,
      ACEPTADA: 0,
      RECHAZADA: 0,
      CANCELADA: 0,
      COMPLETADA: 0,
      AUSENTE: 0,

    };


    inscripcionesPorEstado.forEach(
      (item) => {

        inscripcionesPorEstadoNormalizadas[
          item.estado
        ] =
          Number(
            item.cantidad
          );

      }
    );


    // ==================================================
    // NORMALIZAR DONACIONES POR ESTADO
    // ==================================================

    const donacionesPorEstadoNormalizadas = {

      PENDIENTE: 0,
      ACEPTADA: 0,
      RECHAZADA: 0,
      COORDINADA: 0,
      RECIBIDA: 0,

    };


    donacionesPorEstado.forEach(
      (item) => {

        donacionesPorEstadoNormalizadas[
          item.estado
        ] =
          Number(
            item.cantidad
          );

      }
    );


    // ==================================================
    // RESPUESTA FINAL
    // ==================================================

    return {

      resumen: {

        totalUsuarios:
          Number(
            resumen.total_usuarios || 0
          ),

        totalOrganizaciones:
          Number(
            resumen.total_organizaciones || 0
          ),

        totalOportunidades:
          Number(
            resumen.total_oportunidades || 0
          ),

        totalInscripciones:
          Number(
            resumen.total_inscripciones || 0
          ),

        totalDonaciones:
          Number(
            resumen.total_donaciones || 0
          ),

      },


      usuarios: {

        porRol:
          usuariosPorRolNormalizados,

      },


      organizaciones: {

        porEstado:
          organizacionesPorEstadoNormalizadas,

      },


      oportunidades: {

        porEstado:
          oportunidadesPorEstadoNormalizadas,

      },


      inscripciones: {

        total:
          Number(
            metricasParticipacion
              .total_inscripciones || 0
          ),

        totalAceptadas:
          Number(
            metricasParticipacion
              .total_aceptadas || 0
          ),

        totalCompletadas:
          Number(
            metricasParticipacion
              .total_completadas || 0
          ),

        totalAusentes:
          Number(
            metricasParticipacion
              .total_ausentes || 0
          ),

        tasaAceptacion:
          Number(
            metricasParticipacion
              .tasa_aceptacion || 0
          ),

        tasaParticipacion:
          Number(
            metricasParticipacion
              .tasa_participacion || 0
          ),

        porEstado:
          inscripcionesPorEstadoNormalizadas,

      },


      donaciones: {

        totalOfertas:
          Number(
            metricasDonaciones
              .total_ofertas || 0
          ),

        totalRecibidas:
          Number(
            metricasDonaciones
              .total_recibidas || 0
          ),

        tasaConcrecion:
          Number(
            metricasDonaciones
              .tasa_concrecion || 0
          ),

        porEstado:
          donacionesPorEstadoNormalizadas,

      },


      rankings: {

        organizacionesPorOportunidades:
          topOrganizacionesOportunidades.map(
            (
              item,
              index
            ) => ({

              posicion:
                index + 1,

              idOrganizacion:
                item.id_organizacion,

              razonSocial:
                item.razon_social,

              totalOportunidades:
                Number(
                  item.total_oportunidades || 0
                ),

            })
          ),


        organizacionesPorParticipacion:
          topOrganizacionesParticipacion.map(
            (
              item,
              index
            ) => ({

              posicion:
                index + 1,

              idOrganizacion:
                item.id_organizacion,

              razonSocial:
                item.razon_social,

              participacionesCompletadas:
                Number(
                  item.participaciones_completadas || 0
                ),

            })
          ),


        organizacionesPorDonaciones:
          topOrganizacionesDonaciones.map(
            (
              item,
              index
            ) => ({

              posicion:
                index + 1,

              idOrganizacion:
                item.id_organizacion,

              razonSocial:
                item.razon_social,

              donacionesRecibidas:
                Number(
                  item.donaciones_recibidas || 0
                ),

            })
          ),


        voluntariosPorParticipacion:
          topVoluntariosParticipacion.map(
            (
              item,
              index
            ) => ({

              posicion:
                index + 1,

              idVoluntario:
                item.id_voluntario,

              nombre:
                item.nombre,

              apellido:
                item.apellido,

              oportunidadesCompletadas:
                Number(
                  item.oportunidades_completadas || 0
                ),

            })
          ),

      },

    };

  };