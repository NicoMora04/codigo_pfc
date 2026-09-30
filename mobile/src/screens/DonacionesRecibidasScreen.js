import React from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';


// ======================================================
// ESTADOS DISPONIBLES
// ======================================================

const estados = [
  {
    valor: 'TODAS',
    texto: 'Todas',
  },
  {
    valor: 'PENDIENTE',
    texto: 'Pendientes',
  },
  {
    valor: 'ACEPTADA',
    texto: 'Aceptadas',
  },
  {
    valor: 'RECHAZADA',
    texto: 'Rechazadas',
  },
  {
    valor: 'COORDINADA',
    texto: 'Coordinadas',
  },
  {
    valor: 'RECIBIDA',
    texto: 'Recibidas',
  },
];


// ======================================================
// PANTALLA
// ======================================================

export default function DonacionesRecibidasScreen({
  donaciones = [],
  loading = false,
  estadoFiltro = 'TODAS',
  onCambiarEstadoFiltro,
  onVerDetalle,
}) {


  // ====================================================
  // FORMATEAR ESTADO
  // ====================================================

  const obtenerEstadoMostrado =
    (estado) => {

      switch (estado) {

        case 'PENDIENTE':
          return 'Pendiente';

        case 'ACEPTADA':
          return 'Aceptada';

        case 'RECHAZADA':
          return 'Rechazada';

        case 'COORDINADA':
          return 'Coordinada';

        case 'RECIBIDA':
          return 'Recibida';

        default:
          return estado || 'Sin estado';

      }

    };


  // ====================================================
  // FORMATEAR FECHA
  // ====================================================

  const formatearFecha =
    (fecha) => {

      if (!fecha) {

        return 'Sin fecha';

      }


      const valor =
        new Date(fecha);


      if (
        Number.isNaN(
          valor.getTime()
        )
      ) {

        return fecha;

      }


      return valor
        .toLocaleDateString(
          'es-AR'
        );

    };


  // ====================================================
  // ESTILO DE ESTADO
  // ====================================================

  const obtenerEstiloEstado =
    (estado) => {

      switch (estado) {

        case 'ACEPTADA':
          return styles.estadoAceptada;

        case 'RECHAZADA':
          return styles.estadoRechazada;

        case 'COORDINADA':
          return styles.estadoCoordinada;

        case 'RECIBIDA':
          return styles.estadoRecibida;

        case 'PENDIENTE':
        default:
          return styles.estadoPendiente;

      }

    };


  return (

    <View style={styles.container}>

      {/* ==================================================
          ENCABEZADO
      ================================================== */}

      <View style={styles.header}>

        <Text style={styles.title}>
          Donaciones recibidas
        </Text>

        <Text style={styles.subtitle}>
          Consultá y gestioná los bienes ofrecidos a tu organización.
        </Text>

      </View>


      {/* ==================================================
          FILTROS
      ================================================== */}

      <View style={styles.filterCard}>

        <Text style={styles.filterTitle}>
          Filtrar por estado
        </Text>


        <View style={styles.filterContainer}>

          {estados.map(
            (item) => {

              const activo =
                estadoFiltro ===
                item.valor;


              return (

                <TouchableOpacity
                  key={item.valor}
                  style={[
                    styles.filterButton,

                    activo &&
                      styles.filterButtonActive,
                  ]}
                  onPress={() =>
                    onCambiarEstadoFiltro?.(
                      item.valor
                    )
                  }
                >

                  <Text
                    style={[
                      styles.filterButtonText,

                      activo &&
                        styles.filterButtonTextActive,
                    ]}
                  >
                    {item.texto}
                  </Text>

                </TouchableOpacity>

              );

            }
          )}

        </View>

      </View>


      {/* ==================================================
          CARGANDO
      ================================================== */}

      {loading && (

        <View style={styles.loadingContainer}>

          <ActivityIndicator
            size="large"
            color="#1F6F5C"
          />

          <Text style={styles.loadingText}>
            Cargando donaciones...
          </Text>

        </View>

      )}


      {/* ==================================================
          ESTADO VACÍO
      ================================================== */}

      {!loading &&
        donaciones.length === 0 && (

          <View style={styles.emptyCard}>

            <Text style={styles.emptyIcon}>
              ♡
            </Text>

            <Text style={styles.emptyTitle}>
              No hay donaciones
            </Text>

            <Text style={styles.emptyText}>

              {estadoFiltro === 'TODAS'
                ? 'Todavía no recibiste ofrecimientos de bienes.'
                : 'No hay donaciones con el estado seleccionado.'}

            </Text>

          </View>

        )}


      {/* ==================================================
          LISTADO
      ================================================== */}

      {!loading &&
        donaciones.map(
          (donacion) => (

            <View
              key={
                donacion.id_donacion
              }
              style={styles.card}
            >

              <View style={styles.cardHeader}>

                <View style={styles.cardHeaderText}>

                  <Text style={styles.category}>
                    {donacion.categoria ||
                      'Sin categoría'}
                  </Text>

                  <Text
                    style={styles.description}
                    numberOfLines={2}
                  >
                    {donacion.descripcion ||
                      'Sin descripción'}
                  </Text>

                </View>


                <View
                  style={[
                    styles.estadoBadge,
                    obtenerEstiloEstado(
                      donacion.estado
                    ),
                  ]}
                >

                  <Text style={styles.estadoText}>
                    {obtenerEstadoMostrado(
                      donacion.estado
                    )}
                  </Text>

                </View>

              </View>


              <View style={styles.divider} />


              <View style={styles.infoBlock}>

                <Text style={styles.infoText}>
                  Cantidad:{' '}
                  {donacion.cantidad}{' '}
                  {donacion.unidad || ''}
                </Text>


                <Text style={styles.infoText}>
                  Condición:{' '}
                  {donacion.condicion_bien ||
                    'No especificada'}
                </Text>


                <Text style={styles.infoText}>
                  Disponible desde:{' '}
                  {formatearFecha(
                    donacion.disponible_desde
                  )}
                </Text>


                {(donacion.localidad ||
                  donacion.provincia) && (

                  <Text style={styles.infoText}>
                    Ubicación:{' '}
                    {[
                      donacion.localidad,
                      donacion.provincia,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </Text>

                )}

              </View>


              <TouchableOpacity
                style={styles.detailButton}
                onPress={() =>
                  onVerDetalle?.(
                    donacion
                  )
                }
              >

                <Text style={styles.detailButtonText}>
                  Ver detalle
                </Text>

              </TouchableOpacity>

            </View>

          )
        )}

    </View>

  );

}


// ======================================================
// ESTILOS
// ======================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 110,
    },

    header: {
      marginBottom: 18,
    },

    title: {
      fontSize: 26,
      fontWeight: '800',
      color: '#174C40',
    },

    subtitle: {
      marginTop: 6,
      fontSize: 14,
      lineHeight: 20,
      color: '#64726D',
    },

    filterCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 14,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: '#E1E8E5',
    },

    filterTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: '#29433D',
      marginBottom: 10,
    },

    filterContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },

    filterButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 18,
      backgroundColor: '#F0F4F2',
      borderWidth: 1,
      borderColor: '#DCE5E1',
    },

    filterButtonActive: {
      backgroundColor: '#1F6F5C',
      borderColor: '#1F6F5C',
    },

    filterButtonText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#52635E',
    },

    filterButtonTextActive: {
      color: '#FFFFFF',
    },

    loadingContainer: {
      paddingVertical: 40,
      alignItems: 'center',
    },

    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: '#64726D',
    },

    emptyCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      padding: 28,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E1E8E5',
    },

    emptyIcon: {
      fontSize: 32,
      color: '#1F6F5C',
      marginBottom: 10,
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#29433D',
    },

    emptyText: {
      marginTop: 6,
      textAlign: 'center',
      fontSize: 14,
      lineHeight: 20,
      color: '#6A7773',
    },

    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: '#E1E8E5',
      shadowColor: '#000000',
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 2,
    },

    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
    },

    cardHeaderText: {
      flex: 1,
    },

    category: {
      fontSize: 16,
      fontWeight: '800',
      color: '#174C40',
    },

    description: {
      marginTop: 4,
      fontSize: 14,
      lineHeight: 19,
      color: '#5F6E69',
    },

    estadoBadge: {
      borderRadius: 14,
      paddingHorizontal: 9,
      paddingVertical: 5,
    },

    estadoPendiente: {
      backgroundColor: '#FFF3CD',
    },

    estadoAceptada: {
      backgroundColor: '#DDF3E8',
    },

    estadoRechazada: {
      backgroundColor: '#FBE1E1',
    },

    estadoCoordinada: {
      backgroundColor: '#E2ECFA',
    },

    estadoRecibida: {
      backgroundColor: '#E6E7F5',
    },

    estadoText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#30423C',
    },

    divider: {
      height: 1,
      backgroundColor: '#EDF1EF',
      marginVertical: 13,
    },

    infoBlock: {
      marginTop: 12,
      gap: 4,
    },


      infoText: {
        fontSize: 12,
        color: '#5F6B76',
      },

    detailButton: {
      marginTop: 10,
      backgroundColor: '#1F6F5C',
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },

    detailButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },

  });