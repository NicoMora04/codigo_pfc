import React from 'react';

import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';


// ======================================================
// BARRA HORIZONTAL SIMPLE
// ======================================================

function Barra({
  etiqueta,
  valor,
  maximo,
  sufijo = '',
}) {

  const porcentaje =
    maximo > 0
      ? Math.min(
          (valor / maximo) * 100,
          100
        )
      : 0;


  return (

    <View style={styles.barItem}>

      <View style={styles.barHeader}>

        <Text style={styles.barLabel}>
          {etiqueta}
        </Text>

        <Text style={styles.barValue}>
          {valor}{sufijo}
        </Text>

      </View>


      <View style={styles.barTrack}>

        <View
          style={[
            styles.barFill,
            {
              width:
                `${porcentaje}%`
            }
          ]}
        />

      </View>

    </View>

  );

}


// ======================================================
// TARJETA KPI
// ======================================================

function KpiCard({
  titulo,
  valor,
}) {

  return (

    <View style={styles.kpiCard}>

      <Text style={styles.kpiValue}>
        {valor}
      </Text>

      <Text style={styles.kpiLabel}>
        {titulo}
      </Text>

    </View>

  );

}


// ======================================================
// FILA DE RANKING
// ======================================================

function RankingItem({
  posicion,
  titulo,
  valor,
}) {

  return (

    <View style={styles.rankingItem}>

      <View style={styles.rankingPosition}>

        <Text style={styles.rankingPositionText}>
          {posicion}
        </Text>

      </View>


      <View style={styles.rankingInfo}>

        <Text style={styles.rankingTitle}>
          {titulo}
        </Text>

        <Text style={styles.rankingValue}>
          {valor}
        </Text>

      </View>

    </View>

  );

}


// ======================================================
// PANTALLA
// ======================================================

export default function EstadisticasAdminScreen({
  estadisticas,
  loading,
}) {

  if (loading) {

    return (

      <View style={styles.loadingContainer}>

        <ActivityIndicator
          size="large"
          color="#1F6F5C"
        />

        <Text style={styles.loadingText}>
          Cargando estadísticas globales...
        </Text>

      </View>

    );

  }


  if (!estadisticas) {

    return (

      <View style={styles.emptyCard}>

        <Text style={styles.emptyTitle}>
          No hay estadísticas disponibles
        </Text>

        <Text style={styles.emptyText}>
          No fue posible obtener las métricas globales del sistema.
        </Text>

      </View>

    );

  }


  const {
    resumen = {},
    usuarios = {},
    organizaciones = {},
    oportunidades = {},
    inscripciones = {},
    donaciones = {},
    rankings = {},
  } = estadisticas;


  const usuariosPorRol =
    usuarios.porRol || {};


  const organizacionesPorEstado =
    organizaciones.porEstado || {};


  const oportunidadesPorEstado =
    oportunidades.porEstado || {};


  const inscripcionesPorEstado =
    inscripciones.porEstado || {};


  const donacionesPorEstado =
    donaciones.porEstado || {};


  const maxUsuarios =
    Math.max(
      ...Object.values(
        usuariosPorRol
      ),
      1
    );


  const maxOrganizaciones =
    Math.max(
      ...Object.values(
        organizacionesPorEstado
      ),
      1
    );


  const maxOportunidades =
    Math.max(
      ...Object.values(
        oportunidadesPorEstado
      ),
      1
    );


  const maxInscripciones =
    Math.max(
      ...Object.values(
        inscripcionesPorEstado
      ),
      1
    );


  const maxDonaciones =
    Math.max(
      ...Object.values(
        donacionesPorEstado
      ),
      1
    );


  return (

    <View style={styles.container}>


      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <View style={styles.header}>

        <Text style={styles.title}>
          Estadísticas globales
        </Text>

        <Text style={styles.subtitle}>
          Métricas generales de uso y participación del sistema.
        </Text>

      </View>


      {/* ================================================= */}
      {/* KPIs */}
      {/* ================================================= */}

      <View style={styles.kpiGrid}>

        <KpiCard
          titulo="Usuarios"
          valor={
            resumen.totalUsuarios || 0
          }
        />

        <KpiCard
          titulo="Organizaciones"
          valor={
            resumen.totalOrganizaciones || 0
          }
        />

        <KpiCard
          titulo="Oportunidades"
          valor={
            resumen.totalOportunidades || 0
          }
        />

        <KpiCard
          titulo="Inscripciones"
          valor={
            resumen.totalInscripciones || 0
          }
        />

        <KpiCard
          titulo="Donaciones"
          valor={
            resumen.totalDonaciones || 0
          }
        />

      </View>


      {/* ================================================= */}
      {/* USUARIOS */}
      {/* ================================================= */}

      <View style={styles.sectionCard}>

        <Text style={styles.sectionTitle}>
          Usuarios
        </Text>

        <Text style={styles.sectionSubtitle}>
          Distribución de usuarios por rol.
        </Text>


        <Barra
          etiqueta="Voluntarios"
          valor={
            usuariosPorRol
              .VOLUNTARIO || 0
          }
          maximo={
            maxUsuarios
          }
        />

        <Barra
          etiqueta="Organizaciones"
          valor={
            usuariosPorRol
              .ORGANIZACION || 0
          }
          maximo={
            maxUsuarios
          }
        />

      </View>


      {/* ================================================= */}
      {/* ORGANIZACIONES */}
      {/* ================================================= */}

      <View style={styles.sectionCard}>

        <Text style={styles.sectionTitle}>
          Organizaciones
        </Text>

        <Text style={styles.sectionSubtitle}>
          Estado actual de verificación.
        </Text>


        <Barra
          etiqueta="Verificadas"
          valor={
            organizacionesPorEstado
              .VERIFICADA || 0
          }
          maximo={
            maxOrganizaciones
          }
        />

        <Barra
          etiqueta="Pendientes"
          valor={
            organizacionesPorEstado
              .PENDIENTE || 0
          }
          maximo={
            maxOrganizaciones
          }
        />

        <Barra
          etiqueta="Rechazadas"
          valor={
            organizacionesPorEstado
              .RECHAZADA || 0
          }
          maximo={
            maxOrganizaciones
          }
        />

      </View>


      {/* ================================================= */}
      {/* OPORTUNIDADES */}
      {/* ================================================= */}

      <View style={styles.sectionCard}>

        <Text style={styles.sectionTitle}>
          Oportunidades
        </Text>

        <Text style={styles.sectionSubtitle}>
          Distribución global por estado.
        </Text>


        <Barra
          etiqueta="Publicadas"
          valor={
            oportunidadesPorEstado
              .PUBLICADA || 0
          }
          maximo={
            maxOportunidades
          }
        />

        <Barra
          etiqueta="Cerradas"
          valor={
            oportunidadesPorEstado
              .CERRADA || 0
          }
          maximo={
            maxOportunidades
          }
        />

        <Barra
          etiqueta="Finalizadas"
          valor={
            oportunidadesPorEstado
              .FINALIZADA || 0
          }
          maximo={
            maxOportunidades
          }
        />

        <Barra
          etiqueta="Canceladas"
          valor={
            oportunidadesPorEstado
              .CANCELADA || 0
          }
          maximo={
            maxOportunidades
          }
        />

        <Barra
          etiqueta="Borrador"
          valor={
            oportunidadesPorEstado
              .BORRADOR || 0
          }
          maximo={
            maxOportunidades
          }
        />

      </View>


      {/* ================================================= */}
      {/* PARTICIPACIÓN */}
      {/* ================================================= */}

      <View style={styles.sectionCard}>

        <Text style={styles.sectionTitle}>
          Participación
        </Text>

        <Text style={styles.sectionSubtitle}>
          Indicadores globales de inscripciones.
        </Text>


        <View style={styles.metricRow}>

          <Text style={styles.metricLabel}>
            Tasa de aceptación
          </Text>

          <Text style={styles.metricValue}>
            {
              Number(
                inscripciones
                  .tasaAceptacion || 0
              ).toFixed(2)
            }%
          </Text>

        </View>


        <View style={styles.metricRow}>

          <Text style={styles.metricLabel}>
            Participación efectiva
          </Text>

          <Text style={styles.metricValue}>
            {
              Number(
                inscripciones
                  .tasaParticipacion || 0
              ).toFixed(2)
            }%
          </Text>

        </View>


        <View style={styles.separator} />


        <Barra
          etiqueta="Pendientes"
          valor={
            inscripcionesPorEstado
              .PENDIENTE || 0
          }
          maximo={
            maxInscripciones
          }
        />

        <Barra
          etiqueta="Aceptadas"
          valor={
            inscripcionesPorEstado
              .ACEPTADA || 0
          }
          maximo={
            maxInscripciones
          }
        />

        <Barra
          etiqueta="Completadas"
          valor={
            inscripcionesPorEstado
              .COMPLETADA || 0
          }
          maximo={
            maxInscripciones
          }
        />

        <Barra
          etiqueta="Ausentes"
          valor={
            inscripcionesPorEstado
              .AUSENTE || 0
          }
          maximo={
            maxInscripciones
          }
        />

        <Barra
          etiqueta="Rechazadas"
          valor={
            inscripcionesPorEstado
              .RECHAZADA || 0
          }
          maximo={
            maxInscripciones
          }
        />

        <Barra
          etiqueta="Canceladas"
          valor={
            inscripcionesPorEstado
              .CANCELADA || 0
          }
          maximo={
            maxInscripciones
          }
        />

      </View>


      {/* ================================================= */}
      {/* DONACIONES */}
      {/* ================================================= */}

      <View style={styles.sectionCard}>

        <Text style={styles.sectionTitle}>
          Donaciones
        </Text>

        <Text style={styles.sectionSubtitle}>
          Flujo global de donaciones registradas.
        </Text>


        <View style={styles.metricRow}>

          <Text style={styles.metricLabel}>
            Ofertas registradas
          </Text>

          <Text style={styles.metricValue}>
            {
              donaciones
                .totalOfertas || 0
            }
          </Text>

        </View>


        <View style={styles.metricRow}>

          <Text style={styles.metricLabel}>
            Donaciones recibidas
          </Text>

          <Text style={styles.metricValue}>
            {
              donaciones
                .totalRecibidas || 0
            }
          </Text>

        </View>


        <View style={styles.metricRow}>

          <Text style={styles.metricLabel}>
            Tasa de concreción
          </Text>

          <Text style={styles.metricValue}>
            {
              Number(
                donaciones
                  .tasaConcrecion || 0
              ).toFixed(2)
            }%
          </Text>

        </View>


        <View style={styles.separator} />


        <Barra
          etiqueta="Pendientes"
          valor={
            donacionesPorEstado
              .PENDIENTE || 0
          }
          maximo={
            maxDonaciones
          }
        />

        <Barra
          etiqueta="Aceptadas"
          valor={
            donacionesPorEstado
              .ACEPTADA || 0
          }
          maximo={
            maxDonaciones
          }
        />

        <Barra
          etiqueta="Coordinadas"
          valor={
            donacionesPorEstado
              .COORDINADA || 0
          }
          maximo={
            maxDonaciones
          }
        />

        <Barra
          etiqueta="Recibidas"
          valor={
            donacionesPorEstado
              .RECIBIDA || 0
          }
          maximo={
            maxDonaciones
          }
        />

        <Barra
          etiqueta="Rechazadas"
          valor={
            donacionesPorEstado
              .RECHAZADA || 0
          }
          maximo={
            maxDonaciones
          }
        />

      </View>


      {/* ================================================= */}
      {/* TOP ORGANIZACIONES POR OPORTUNIDADES */}
      {/* ================================================= */}

      <View style={styles.sectionCard}>

        <Text style={styles.sectionTitle}>
          Organizaciones con más actividades
        </Text>

        <Text style={styles.sectionSubtitle}>
          Ranking según oportunidades registradas.
        </Text>


        {
          (
            rankings
              .organizacionesPorOportunidades ||
            []
          ).length === 0
            ? (

              <Text style={styles.emptyRankingText}>
                No hay datos suficientes.
              </Text>

            )
            : (

              rankings
                .organizacionesPorOportunidades
                .map(
                  (item) => (

                    <RankingItem
                      key={
                        item.idOrganizacion
                      }
                      posicion={
                        item.posicion
                      }
                      titulo={
                        item.razonSocial
                      }
                      valor={
                        `${item.totalOportunidades} oportunidades`
                      }
                    />

                  )
                )

            )
        }

      </View>


      {/* ================================================= */}
      {/* TOP ORGANIZACIONES POR PARTICIPACIÓN */}
      {/* ================================================= */}

      <View style={styles.sectionCard}>

        <Text style={styles.sectionTitle}>
          Organizaciones con más participaciones
        </Text>

        <Text style={styles.sectionSubtitle}>
          Ranking según participaciones completadas.
        </Text>


        {
          (
            rankings
              .organizacionesPorParticipacion ||
            []
          ).length === 0
            ? (

              <Text style={styles.emptyRankingText}>
                No hay datos suficientes.
              </Text>

            )
            : (

              rankings
                .organizacionesPorParticipacion
                .map(
                  (item) => (

                    <RankingItem
                      key={
                        item.idOrganizacion
                      }
                      posicion={
                        item.posicion
                      }
                      titulo={
                        item.razonSocial
                      }
                      valor={
                        `${item.participacionesCompletadas} completadas`
                      }
                    />

                  )
                )

            )
        }

      </View>


      {/* ================================================= */}
      {/* TOP ORGANIZACIONES POR DONACIONES */}
      {/* ================================================= */}

      <View style={styles.sectionCard}>

        <Text style={styles.sectionTitle}>
          Organizaciones con más donaciones
        </Text>

        <Text style={styles.sectionSubtitle}>
          Ranking según donaciones efectivamente recibidas.
        </Text>


        {
          (
            rankings
              .organizacionesPorDonaciones ||
            []
          ).length === 0
            ? (

              <Text style={styles.emptyRankingText}>
                No hay datos suficientes.
              </Text>

            )
            : (

              rankings
                .organizacionesPorDonaciones
                .map(
                  (item) => (

                    <RankingItem
                      key={
                        item.idOrganizacion
                      }
                      posicion={
                        item.posicion
                      }
                      titulo={
                        item.razonSocial
                      }
                      valor={
                        `${item.donacionesRecibidas} recibidas`
                      }
                    />

                  )
                )

            )
        }

      </View>


      {/* ================================================= */}
      {/* TOP VOLUNTARIOS */}
      {/* ================================================= */}

      <View style={styles.sectionCard}>

        <Text style={styles.sectionTitle}>
          Voluntarios con mayor participación
        </Text>

        <Text style={styles.sectionSubtitle}>
          Ranking según oportunidades completadas.
        </Text>


        {
          (
            rankings
              .voluntariosPorParticipacion ||
            []
          ).length === 0
            ? (

              <Text style={styles.emptyRankingText}>
                No hay datos suficientes.
              </Text>

            )
            : (

              rankings
                .voluntariosPorParticipacion
                .map(
                  (item) => (

                    <RankingItem
                      key={
                        item.idVoluntario
                      }
                      posicion={
                        item.posicion
                      }
                      titulo={
                        `${item.nombre} ${item.apellido}`
                      }
                      valor={
                        `${item.oportunidadesCompletadas} oportunidades completadas`
                      }
                    />

                  )
                )

            )
        }

      </View>

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

      fontSize: 24,

      fontWeight: '700',

      color: '#164C40',

    },


    subtitle: {

      marginTop: 6,

      fontSize: 14,

      color: '#5F6B76',

      lineHeight: 20,

    },


    kpiGrid: {

      flexDirection: 'row',

      flexWrap: 'wrap',

      justifyContent:
        'space-between',

      marginBottom: 6,

    },


    kpiCard: {

      width: '48%',

      backgroundColor: '#FFFFFF',

      borderRadius: 14,

      padding: 16,

      marginBottom: 12,

      borderWidth: 1,
      borderColor: '#DDE5E2',

    },


    kpiValue: {

      fontSize: 28,

      fontWeight: '700',

      color: '#1F6F5C',

    },


    kpiLabel: {

      marginTop: 4,

      fontSize: 13,

      color: '#5F6B76',

    },


    sectionCard: {

      backgroundColor: '#FFFFFF',

      borderRadius: 16,

      padding: 18,

      marginBottom: 14,

      borderWidth: 1,
      borderColor: '#DDE5E2',

    },


    sectionTitle: {

      fontSize: 18,

      fontWeight: '700',

      color: '#164C40',

    },


    sectionSubtitle: {

      marginTop: 4,

      marginBottom: 16,

      fontSize: 13,

      lineHeight: 19,

      color: '#6B7280',

    },


    barItem: {

      marginBottom: 14,

    },


    barHeader: {

      flexDirection: 'row',

      justifyContent:
        'space-between',

      alignItems: 'center',

      marginBottom: 6,

    },


    barLabel: {

      fontSize: 13,

      color: '#374151',

    },


    barValue: {

      fontSize: 13,

      fontWeight: '700',

      color: '#164C40',

    },


    barTrack: {

      height: 9,

      borderRadius: 5,

      backgroundColor: '#E5ECEA',

      overflow: 'hidden',

    },


    barFill: {

      height: '100%',

      borderRadius: 5,

      backgroundColor: '#1F6F5C',

    },


    metricRow: {

      flexDirection: 'row',

      justifyContent:
        'space-between',

      alignItems: 'center',

      paddingVertical: 9,

    },


    metricLabel: {

      flex: 1,

      fontSize: 14,

      color: '#374151',

    },


    metricValue: {

      fontSize: 16,

      fontWeight: '700',

      color: '#1F6F5C',

    },


    separator: {

      height: 1,

      backgroundColor: '#EEF1F0',

      marginVertical: 14,

    },


    rankingItem: {

      flexDirection: 'row',

      alignItems: 'center',

      paddingVertical: 10,

      borderBottomWidth: 1,

      borderBottomColor: '#EEF1F0',

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

      fontSize: 14,

      fontWeight: '700',

      color: '#164C40',

    },


    rankingInfo: {

      flex: 1,

    },


    rankingTitle: {

      fontSize: 14,

      fontWeight: '700',

      color: '#1F2937',

    },


    rankingValue: {

      marginTop: 3,

      fontSize: 12,

      color: '#6B7280',

    },


    emptyRankingText: {

      fontSize: 13,

      color: '#6B7280',

      fontStyle: 'italic',

    },


    loadingContainer: {

      alignItems: 'center',

      justifyContent: 'center',

      paddingVertical: 60,

    },


    loadingText: {

      marginTop: 12,

      color: '#5F6B76',

      fontSize: 14,

    },


    emptyCard: {

      backgroundColor: '#FFFFFF',

      borderRadius: 16,

      padding: 24,

      alignItems: 'center',

      borderWidth: 1,
      borderColor: '#DDE5E2',

    },


    emptyTitle: {

      fontSize: 17,

      fontWeight: '700',

      color: '#164C40',

      textAlign: 'center',

    },


    emptyText: {

      marginTop: 7,

      fontSize: 13,

      color: '#6B7280',

      textAlign: 'center',

      lineHeight: 19,

    },

  });