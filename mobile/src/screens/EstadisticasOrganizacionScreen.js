import React from 'react';

import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';


// ======================================================
// COMPONENTE AUXILIAR - BARRA DE PROGRESO
// ======================================================

function ProgressBar({
  value = 0,
  max = 100,
}) {

  const porcentaje =
    max > 0
      ? Math.min(
          (value / max) * 100,
          100
        )
      : 0;


  return (

    <View style={styles.progressTrack}>

      <View
        style={[
          styles.progressFill,
          {
            width:
              `${porcentaje}%`
          }
        ]}
      />

    </View>

  );

}


// ======================================================
// COMPONENTE AUXILIAR - FILA DE ESTADO
// ======================================================

function EstadoBarra({
  label,
  value,
  max,
}) {

  return (

    <View style={styles.stateRow}>

      <View style={styles.stateHeader}>

        <Text style={styles.stateLabel}>
          {label}
        </Text>

        <Text style={styles.stateValue}>
          {value}
        </Text>

      </View>

      <ProgressBar
        value={value}
        max={max}
      />

    </View>

  );

}


// ======================================================
// SCREEN PRINCIPAL
// ======================================================

export default function EstadisticasOrganizacionScreen({
  estadisticas,
  loading,
}) {

  if (
    loading ||
    !estadisticas
  ) {

    return (

      <View style={styles.container}>

        <ActivityIndicator
          size="large"
          color="#1F6F5C"
          style={styles.loader}
        />

      </View>

    );

  }


  const resumen =
    estadisticas.resumen || {};

  const oportunidades =
    estadisticas.oportunidades || {};

  const inscripciones =
    estadisticas.inscripciones || {};

  const donaciones =
    estadisticas.donaciones || {};


  const estadosInscripciones =
    inscripciones.porEstado || {};

  const estadosDonaciones =
    donaciones.porEstado || {};


  const maxInscripciones =
    Math.max(
      ...Object.values(
        estadosInscripciones
      ),
      1
    );


  const maxDonaciones =
    Math.max(
      ...Object.values(
        estadosDonaciones
      ),
      1
    );


  const tiempoHoras =
    Number(
      inscripciones
        .tiempoPromedioRespuestaHoras || 0
    );


  const tiempoRespuestaTexto =

    tiempoHoras < 1

      ? `${Math.round(
          tiempoHoras * 60
        )} min`

      : `${tiempoHoras.toFixed(
          1
        )} h`;


  return (

    <View style={styles.container}>


      {/* ================================================= */}
      {/* ENCABEZADO */}
      {/* ================================================= */}

      <View style={styles.header}>

        <Text style={styles.title}>
          Mis estadísticas
        </Text>

        <Text style={styles.subtitle}>
          Resumen de actividad, participación y donaciones de tu organización.
        </Text>

      </View>


      {/* ================================================= */}
      {/* RESUMEN GENERAL */}
      {/* ================================================= */}

      <Text style={styles.sectionTitle}>
        Resumen general
      </Text>

      <Text style={styles.sectionSubtitle}>
        Indicadores principales de la actividad de tu organización.
      </Text>


      <View style={styles.statsContainer}>

        <View style={styles.statCard}>

          <Text style={styles.statNumber}>
            {
              resumen
                .oportunidadesActivas || 0
            }
          </Text>

          <Text style={styles.statLabel}>
            Oportunidades activas
          </Text>

        </View>


        <View style={styles.statCard}>

          <Text style={styles.statNumber}>
            {
              resumen
                .inscripcionesRecibidas || 0
            }
          </Text>

          <Text style={styles.statLabel}>
            Inscripciones recibidas
          </Text>

        </View>


        <View style={styles.statCard}>

          <Text style={styles.statNumber}>
            {
              resumen
                .participacionesCompletadas || 0
            }
          </Text>

          <Text style={styles.statLabel}>
            Participaciones completadas
          </Text>

        </View>


        <View style={styles.statCard}>

          <Text style={styles.statNumber}>
            {
              resumen
                .donacionesRecibidas || 0
            }
          </Text>

          <Text style={styles.statLabel}>
            Donaciones recibidas
          </Text>

        </View>

      </View>


      {/* ================================================= */}
      {/* PARTICIPACIÓN DE VOLUNTARIOS */}
      {/* ================================================= */}

      <View style={styles.sectionCard}>

        <Text style={styles.sectionTitle}>
          Participación de voluntarios
        </Text>

        <Text style={styles.sectionSubtitle}>
          Indicadores sobre selección, asistencia y tiempos de respuesta.
        </Text>


        <View style={styles.metricBox}>

          <View style={styles.metricHeader}>

            <Text style={styles.metricLabel}>
              Tasa de aceptación
            </Text>

            <Text style={styles.metricValue}>
              {
                Number(
                  inscripciones
                    .tasaAceptacion || 0
                ).toFixed(1)
              }
              %
            </Text>

          </View>

          <ProgressBar
            value={
              Number(
                inscripciones
                  .tasaAceptacion || 0
              )
            }
            max={100}
          />

        </View>


        <View style={styles.metricBox}>

          <View style={styles.metricHeader}>

            <Text style={styles.metricLabel}>
              Participación efectiva
            </Text>

            <Text style={styles.metricValue}>
              {
                Number(
                  inscripciones
                    .tasaParticipacion || 0
                ).toFixed(1)
              }
              %
            </Text>

          </View>

          <ProgressBar
            value={
              Number(
                inscripciones
                  .tasaParticipacion || 0
              )
            }
            max={100}
          />

        </View>


        <View style={styles.responseTimeCard}>

          <Text style={styles.responseTimeLabel}>
            Tiempo promedio de respuesta
          </Text>

          <Text style={styles.responseTimeValue}>
            {tiempoRespuestaTexto}
          </Text>

        </View>

      </View>


      {/* ================================================= */}
      {/* ESTADO DE INSCRIPCIONES */}
      {/* ================================================= */}

      <View style={styles.sectionCard}>

        <Text style={styles.sectionTitle}>
          Estado de inscripciones
        </Text>

        <Text style={styles.sectionSubtitle}>
          Distribución actual de las inscripciones recibidas.
        </Text>


        <EstadoBarra
          label="Pendientes"
          value={
            estadosInscripciones
              .PENDIENTE || 0
          }
          max={maxInscripciones}
        />

        <EstadoBarra
          label="Aceptadas"
          value={
            estadosInscripciones
              .ACEPTADA || 0
          }
          max={maxInscripciones}
        />

        <EstadoBarra
          label="Rechazadas"
          value={
            estadosInscripciones
              .RECHAZADA || 0
          }
          max={maxInscripciones}
        />

        <EstadoBarra
          label="Canceladas"
          value={
            estadosInscripciones
              .CANCELADA || 0
          }
          max={maxInscripciones}
        />

        <EstadoBarra
          label="Completadas"
          value={
            estadosInscripciones
              .COMPLETADA || 0
          }
          max={maxInscripciones}
        />

        <EstadoBarra
          label="Ausentes"
          value={
            estadosInscripciones
              .AUSENTE || 0
          }
          max={maxInscripciones}
        />

      </View>


      {/* ================================================= */}
      {/* OPORTUNIDADES */}
      {/* ================================================= */}

      <View style={styles.sectionCard}>

        <Text style={styles.sectionTitle}>
          Rendimiento de oportunidades
        </Text>

        <Text style={styles.sectionSubtitle}>
          Compará convocatoria, participación y ocupación de cupos.
        </Text>


        <View style={styles.secondaryStats}>

          <View style={styles.secondaryStat}>

            <Text style={styles.secondaryValue}>
              {
                oportunidades.total || 0
              }
            </Text>

            <Text style={styles.secondaryLabel}>
              Oportunidades consideradas
            </Text>

          </View>


          <View style={styles.secondaryStat}>

            <Text style={styles.secondaryValue}>
              {
                Number(
                  oportunidades
                    .promedioInscripciones || 0
                ).toFixed(2)
              }
            </Text>

            <Text style={styles.secondaryLabel}>
              Inscripciones promedio
            </Text>

          </View>

        </View>


        {/* =============================================== */}
        {/* TOP PARTICIPACIÓN */}
        {/* =============================================== */}

        <Text style={styles.subsectionTitle}>
          Mayor participación
        </Text>


        {
          oportunidades
            .topParticipacion
            ?.length > 0

            ? oportunidades
                .topParticipacion
                .map(
                  (item) => (

                    <View
                      key={
                        item.idOportunidad
                      }
                      style={
                        styles.rankingCard
                      }
                    >

                      <View
                        style={
                          styles.rankingPosition
                        }
                      >

                        <Text
                          style={
                            styles.rankingPositionText
                          }
                        >
                          {item.posicion}
                        </Text>

                      </View>


                      <View
                        style={
                          styles.rankingContent
                        }
                      >

                        <Text
                          style={
                            styles.rankingTitle
                          }
                        >
                          {item.titulo}
                        </Text>

                        <Text
                          style={
                            styles.rankingInfo
                          }
                        >
                          {
                            item.totalInscripciones
                          } inscripciones
                        </Text>

                        <Text
                          style={
                            styles.rankingInfo
                          }
                        >
                          {
                            item
                              .participacionesCompletadas
                          } participaciones efectivas
                        </Text>

                      </View>

                    </View>

                  )
                )

            : (

              <Text style={styles.emptyText}>
                Todavía no hay oportunidades con participación completada.
              </Text>

            )
        }


        {/* =============================================== */}
        {/* OCUPACIÓN */}
        {/* =============================================== */}

        <Text style={styles.subsectionTitle}>
          Ocupación de cupos
        </Text>


        {
          oportunidades
            .ocupacion
            ?.length > 0

            ? oportunidades
                .ocupacion
                .map(
                  (item) => (

                    <View
                      key={
                        item.idOportunidad
                      }
                      style={
                        styles.occupationCard
                      }
                    >

                      <View
                        style={
                          styles.occupationHeader
                        }
                      >

                        <Text
                          style={
                            styles.occupationTitle
                          }
                        >
                          {item.titulo}
                        </Text>

                        <Text
                          style={
                            styles.occupationPercentage
                          }
                        >
                          {
                            Number(
                              item
                                .porcentajeOcupacion || 0
                            ).toFixed(1)
                          }
                          %
                        </Text>

                      </View>


                      <ProgressBar
                        value={
                          Number(
                            item
                              .porcentajeOcupacion || 0
                          )
                        }
                        max={100}
                      />


                      <Text
                        style={
                          styles.occupationInfo
                        }
                      >
                        {
                          item
                            .voluntariosAceptados
                        } de {
                          item.cupoTotal
                        } cupos ocupados
                      </Text>

                    </View>

                  )
                )

            : (

              <Text style={styles.emptyText}>
                No hay información de ocupación disponible.
              </Text>

            )
        }

      </View>


      {/* ================================================= */}
      {/* DONACIONES */}
      {/* ================================================= */}

      <View style={styles.sectionCard}>

        <Text style={styles.sectionTitle}>
          Donaciones
        </Text>

        <Text style={styles.sectionSubtitle}>
          Seguimiento de ofertas recibidas y donaciones concretadas.
        </Text>


        <View style={styles.secondaryStats}>

          <View style={styles.secondaryStat}>

            <Text style={styles.secondaryValue}>
              {
                donaciones
                  .totalOfertas || 0
              }
            </Text>

            <Text style={styles.secondaryLabel}>
              Ofertas recibidas
            </Text>

          </View>


          <View style={styles.secondaryStat}>

            <Text style={styles.secondaryValue}>
              {
                donaciones
                  .totalRecibidas || 0
              }
            </Text>

            <Text style={styles.secondaryLabel}>
              Donaciones concretadas
            </Text>

          </View>

        </View>


        <View style={styles.metricBox}>

          <View style={styles.metricHeader}>

            <Text style={styles.metricLabel}>
              Tasa de concreción
            </Text>

            <Text style={styles.metricValue}>
                {`${Number(
                        donaciones.tasaConcrecion || 0
                    ).toFixed(1)}%`}
            </Text>

          </View>

          <ProgressBar
            value={
              Number(
                donaciones
                  .tasaConcrecion || 0
              )
            }
            max={100}
          />

        </View>


        <Text style={styles.subsectionTitle}>
          Estado de donaciones
        </Text>


        <EstadoBarra
          label="Pendientes"
          value={
            estadosDonaciones
              .PENDIENTE || 0
          }
          max={maxDonaciones}
        />

        <EstadoBarra
          label="Aceptadas"
          value={
            estadosDonaciones
              .ACEPTADA || 0
          }
          max={maxDonaciones}
        />

        <EstadoBarra
          label="Rechazadas"
          value={
            estadosDonaciones
              .RECHAZADA || 0
          }
          max={maxDonaciones}
        />

        <EstadoBarra
          label="Coordinadas"
          value={
            estadosDonaciones
              .COORDINADA || 0
          }
          max={maxDonaciones}
        />

        <EstadoBarra
          label="Recibidas"
          value={
            estadosDonaciones
              .RECIBIDA || 0
          }
          max={maxDonaciones}
        />


        {/* =============================================== */}
        {/* CATEGORÍAS */}
        {/* =============================================== */}

        <Text style={styles.subsectionTitle}>
          Categorías más ofrecidas
        </Text>


        {
          donaciones
            .porCategoria
            ?.length > 0

            ? donaciones
                .porCategoria
                .map(
                  (item) => (

                    <View
                      key={
                        item.idCategoriaDonacion
                      }
                      style={
                        styles.categoryRow
                      }
                    >

                      <Text
                        style={
                          styles.categoryName
                        }
                      >
                        {item.categoria}
                      </Text>

                      <Text
                        style={
                          styles.categoryValue
                        }
                      >
                        {item.cantidad}
                      </Text>

                    </View>

                  )
                )

            : (

              <Text style={styles.emptyText}>
                Todavía no hay categorías de donación registradas.
              </Text>

            )
        }

      </View>


      <Text style={styles.footerText}>
        Las estadísticas se calculan a partir de la actividad registrada por tu organización.
      </Text>

    </View>

  );

}


// ======================================================
// ESTILOS
// ======================================================

const styles =
  StyleSheet.create({

    container: {

      width: '100%',
      maxWidth: 500,

    },


    loader: {

      marginVertical: 40,

    },


    header: {

      backgroundColor: '#FFFFFF',

      borderRadius: 16,

      padding: 18,

      marginBottom: 18,

      borderWidth: 1,
      borderColor: '#DDE5E2',

      elevation: 2,

      shadowColor: '#164C40',

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.08,

      shadowRadius: 5,

    },


    title: {

      fontSize: 26,
      fontWeight: 'bold',

      color: '#164C40',

    },


    subtitle: {

      fontSize: 14,

      color: '#5F6B76',

      marginTop: 5,

      lineHeight: 20,

    },


    sectionTitle: {

      fontSize: 18,

      fontWeight: '700',

      color: '#164C40',

      marginBottom: 4,

    },


    sectionSubtitle: {

      fontSize: 12,

      color: '#5F6B76',

      lineHeight: 17,

      marginBottom: 12,

    },


    subsectionTitle: {

      fontSize: 15,

      fontWeight: '700',

      color: '#164C40',

      marginTop: 18,

      marginBottom: 10,

    },


    // ==================================================
    // RESUMEN
    // ==================================================

    statsContainer: {

      flexDirection: 'row',

      flexWrap: 'wrap',

      gap: 10,

      marginBottom: 22,

    },


    statCard: {

      width: '47%',

      backgroundColor: '#FFFFFF',

      borderRadius: 14,

      padding: 16,

      borderWidth: 1,
      borderColor: '#DDE5E2',

      alignItems: 'center',

      justifyContent: 'center',

      minHeight: 105,

    },


    statNumber: {

      fontSize: 26,

      fontWeight: '800',

      color: '#1F6F5C',

    },


    statLabel: {

      fontSize: 12,

      color: '#5F6B76',

      marginTop: 5,

      textAlign: 'center',

      lineHeight: 16,

    },


    // ==================================================
    // TARJETAS GENERALES
    // ==================================================

    sectionCard: {

      backgroundColor: '#FFFFFF',

      borderRadius: 16,

      padding: 16,

      marginBottom: 22,

      borderWidth: 1,
      borderColor: '#DDE5E2',

      elevation: 1,

      shadowColor: '#164C40',

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.05,

      shadowRadius: 4,

    },


    // ==================================================
    // MÉTRICAS
    // ==================================================

    metricBox: {

      backgroundColor: '#F7FAF9',

      borderRadius: 12,

      padding: 12,

      marginBottom: 12,

    },


    metricHeader: {

      flexDirection: 'row',

      justifyContent: 'space-between',

      alignItems: 'center',

      marginBottom: 8,

    },


    metricLabel: {

      fontSize: 13,

      fontWeight: '600',

      color: '#34423E',

    },


    metricValue: {

      fontSize: 17,

      fontWeight: '800',

      color: '#1F6F5C',

    },


    responseTimeCard: {

      backgroundColor: '#EAF5F2',

      borderRadius: 12,

      padding: 14,

      marginTop: 2,

    },


    responseTimeLabel: {

      fontSize: 12,

      color: '#5F6B76',

    },


    responseTimeValue: {

      fontSize: 22,

      fontWeight: '800',

      color: '#164C40',

      marginTop: 3,

    },


    // ==================================================
    // BARRAS
    // ==================================================

    progressTrack: {

      height: 8,

      borderRadius: 8,

      backgroundColor: '#E3E9E7',

      overflow: 'hidden',

    },


    progressFill: {

      height: '100%',

      backgroundColor: '#1F6F5C',

      borderRadius: 8,

    },


    stateRow: {

      marginBottom: 12,

    },


    stateHeader: {

      flexDirection: 'row',

      justifyContent: 'space-between',

      marginBottom: 6,

    },


    stateLabel: {

      fontSize: 12,

      color: '#34423E',

    },


    stateValue: {

      fontSize: 12,

      fontWeight: '700',

      color: '#164C40',

    },


    // ==================================================
    // ESTADÍSTICAS SECUNDARIAS
    // ==================================================

    secondaryStats: {

      flexDirection: 'row',

      gap: 10,

      marginBottom: 6,

    },


    secondaryStat: {

      flex: 1,

      backgroundColor: '#F7FAF9',

      borderRadius: 12,

      padding: 12,

    },


    secondaryValue: {

      fontSize: 20,

      fontWeight: '800',

      color: '#1F6F5C',

    },


    secondaryLabel: {

      fontSize: 11,

      color: '#5F6B76',

      marginTop: 4,

      lineHeight: 15,

    },


    // ==================================================
    // RANKING
    // ==================================================

    rankingCard: {

      flexDirection: 'row',

      alignItems: 'center',

      backgroundColor: '#F7FAF9',

      borderRadius: 12,

      padding: 12,

      marginBottom: 9,

    },


    rankingPosition: {

      width: 34,
      height: 34,

      borderRadius: 17,

      backgroundColor: '#EAF5F2',

      alignItems: 'center',
      justifyContent: 'center',

      marginRight: 12,

    },


    rankingPositionText: {

      color: '#1F6F5C',

      fontWeight: '800',

      fontSize: 14,

    },


    rankingContent: {

      flex: 1,

    },


    rankingTitle: {

      fontSize: 13,

      fontWeight: '700',

      color: '#164C40',

    },


    rankingInfo: {

      fontSize: 11,

      color: '#5F6B76',

      marginTop: 2,

    },


    // ==================================================
    // OCUPACIÓN
    // ==================================================

    occupationCard: {

      marginBottom: 14,

    },


    occupationHeader: {

      flexDirection: 'row',

      justifyContent: 'space-between',

      alignItems: 'center',

      marginBottom: 7,

    },


    occupationTitle: {

      flex: 1,

      fontSize: 12,

      fontWeight: '600',

      color: '#34423E',

      marginRight: 10,

    },


    occupationPercentage: {

      fontSize: 12,

      fontWeight: '800',

      color: '#1F6F5C',

    },


    occupationInfo: {

      fontSize: 10,

      color: '#7A858F',

      marginTop: 5,

    },


    // ==================================================
    // CATEGORÍAS
    // ==================================================

    categoryRow: {

      flexDirection: 'row',

      justifyContent: 'space-between',

      alignItems: 'center',

      paddingVertical: 10,

      borderBottomWidth: 1,

      borderBottomColor: '#EEF2F1',

    },


    categoryName: {

      fontSize: 12,

      color: '#34423E',

    },


    categoryValue: {

      fontSize: 13,

      fontWeight: '800',

      color: '#1F6F5C',

    },


    emptyText: {

      fontSize: 12,

      color: '#7A858F',

      lineHeight: 17,

      marginVertical: 5,

    },


    footerText: {

      fontSize: 11,

      color: '#7A858F',

      textAlign: 'center',

      lineHeight: 16,

      marginBottom: 20,

      paddingHorizontal: 20,

    },

  });