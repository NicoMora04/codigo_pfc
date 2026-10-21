const recomendacionRepository =
  require(
    '../repositories/recomendacionRepository'
  );

const voluntarioRepository =
  require(
    '../repositories/voluntarioRepository'
  );


// ======================================================
// CALCULAR PUNTAJE DE URGENCIA
// ======================================================

const calcularUrgencia = (
  urgencia
) => {

  switch (urgencia) {

    case 'ALTA':
      return 10;

    case 'MEDIA':
      return 5;

    case 'BAJA':
    default:
      return 0;

  }

};


// ======================================================
// CALCULAR CERCANÍA
// ======================================================

const calcularCercania = (
  distanciaKm,
  radioKm
) => {

  if (
    distanciaKm == null ||
    radioKm == null ||
    radioKm <= 0
  ) {

    return 0;

  }


  const puntaje =
    20 *
    (
      1 -
      distanciaKm /
      radioKm
    );


  return Math.max(
    0,
    Math.min(
      20,
      puntaje
    )
  );

};


// ======================================================
// OBTENER RECOMENDACIONES
// ======================================================

const obtenerRecomendaciones = async (
  idVoluntario,
  opciones = {}
) => {

  const {
    latitud,
    longitud,
    radioKm
  } = opciones;


  const tieneUbicacion =
    latitud != null &&
    longitud != null &&
    radioKm != null;


  // ====================================================
  // 1. OBTENER INTERESES DECLARADOS
  // ====================================================

  const intereses =
    await voluntarioRepository
      .obtenerIntereses(
        idVoluntario
      );


  const idsIntereses =
    new Set(
      intereses.map(
        (interes) =>
          Number(
            interes.id_tipo_actividad
          )
      )
    );


  const tieneIntereses =
    idsIntereses.size > 0;


  // ====================================================
  // 2. OBTENER HISTORIAL
  // ====================================================

  const historial =
    await recomendacionRepository
      .obtenerHistorialPorTipo(
        idVoluntario
      );


  const historialPorTipo =
    new Map();


  historial.forEach(
    (fila) => {

      const puntaje =
        Math.min(
          25,
          Number(
            fila.puntaje_historial
          ) || 0
        );


      historialPorTipo.set(
        Number(
          fila.id_tipo_actividad
        ),
        puntaje
      );

    }
  );


  const tieneHistorial = [...historialPorTipo.values()]
  .some((puntaje) => puntaje > 0);


  // ====================================================
  // 3. OBTENER OPORTUNIDADES ELEGIBLES
  // ====================================================

  const ubicacion =
    tieneUbicacion
      ? {
          latitud:
            Number(latitud),

          longitud:
            Number(longitud),

          radioKm:
            Number(radioKm)
        }
      : null;


  const oportunidades =
    await recomendacionRepository
      .obtenerOportunidadesCandidatas(
        idVoluntario,
        ubicacion
      );


  // ====================================================
  // 4. CALCULAR PUNTAJE
  // ====================================================

  const recomendaciones =
    oportunidades.map(
      (oportunidad) => {

        let puntosObtenidos = 0;
        let puntosMaximos = 15;

        const razones = [];


        const idTipo =
          Number(
            oportunidad
              .id_tipo_actividad
          );


        // ==============================================
        // INTERESES - 40
        // ==============================================

        if (
          tieneIntereses
        ) {

          puntosMaximos += 40;


          if (
            idsIntereses.has(
              idTipo
            )
          ) {

            puntosObtenidos += 40;

            razones.push(
              'Coincide con tus intereses'
            );

          }

        }


        // ==============================================
        // HISTORIAL - 25
        // ==============================================

        if (
          tieneHistorial
        ) {

          puntosMaximos += 25;


          const puntosHistorial =
            historialPorTipo.get(
              idTipo
            ) || 0;


          puntosObtenidos +=
            puntosHistorial;


          if (
            puntosHistorial > 0
          ) {

            razones.push(
              'Participaste anteriormente en actividades similares'
            );

          }

        }


        // ==============================================
        // CERCANÍA - 20
        // ==============================================

        if (
          tieneUbicacion
        ) {

          puntosMaximos += 20;


          const distancia =
            Number(
              oportunidad
                .distancia_km
            );


          const puntosCercania =
            calcularCercania(
              distancia,
              Number(
                radioKm
              )
            );


          puntosObtenidos +=
            puntosCercania;


          razones.push(
            `Se encuentra a ${distancia.toFixed(1)} km`
          );

        }


        // ==============================================
        // URGENCIA - 10
        // ==============================================

        const puntosUrgencia =
          calcularUrgencia(
            oportunidad.urgencia
          );


        puntosObtenidos +=
          puntosUrgencia;


        if (
          oportunidad.urgencia ===
          'ALTA'
        ) {

          razones.push(
            'Tiene urgencia alta'
          );

        }


        // ==============================================
        // DISPONIBILIDAD - 5
        // ==============================================

        if (
          Number(
            oportunidad
              .cupos_disponibles
          ) > 0
        ) {

          puntosObtenidos += 5;

        }


        // ==============================================
        // NORMALIZACIÓN 0-100
        // ==============================================

        const puntaje =
          puntosMaximos > 0
            ? (
                puntosObtenidos /
                puntosMaximos
              ) * 100
            : 0;


        return {

          ...oportunidad,

          puntaje:
            Number(
              puntaje.toFixed(2)
            ),

          razones

        };

      }
    );


  // ====================================================
  // 5. ORDEN FINAL
  // ====================================================

  recomendaciones.sort(
    (a, b) => {

      if (
        b.puntaje !==
        a.puntaje
      ) {

        return (
          b.puntaje -
          a.puntaje
        );

      }


      return (
        new Date(
          a.fecha_inicio
        ) -
        new Date(
          b.fecha_inicio
        )
      );

    }
  );


  return {
    criterios: {
      intereses:
        tieneIntereses,

      historial:
        tieneHistorial,

      ubicacion:
        tieneUbicacion,

      radio_km:
        tieneUbicacion
          ? Number(
              radioKm
            )
          : null
    },

    recomendaciones
  };

};


module.exports = {
  obtenerRecomendaciones
};