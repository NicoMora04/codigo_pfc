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