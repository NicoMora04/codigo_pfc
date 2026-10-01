import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';


export default function OrganizacionesPendientesScreen({
  organizaciones = [],
  loading,
  onVerDetalle,
  onLogout,
}) {

  // =====================================================
  // FORMATEAR FECHA
  // =====================================================

  const formatearFecha =
    (fecha) => {

      if (!fecha) {
        return 'No disponible';
      }

      return new Date(
        fecha
      ).toLocaleString(
        'es-AR'
      );

    };


  return (

    <View style={styles.container}>


      {/* ================================================= */}
      {/* ENCABEZADO */}
      {/* ================================================= */}

      <View style={styles.header}>

        <View style={styles.headerText}>

          <Text style={styles.title}>
            Organizaciones
          </Text>


          <Text style={styles.subtitle}>
            Revisá las solicitudes pendientes de verificación.
          </Text>

        </View>


        <TouchableOpacity
          onPress={
            onLogout
          }
        >

          <Text style={styles.logoutText}>
            Cerrar sesión
          </Text>

        </TouchableOpacity>

      </View>


      {/* ================================================= */}
      {/* TÍTULO DE SECCIÓN */}
      {/* ================================================= */}

      <View style={styles.sectionHeader}>

        <Text style={styles.sectionTitle}>
          Pendientes de verificación
        </Text>


        {!loading && (

          <View style={styles.counterBadge}>

            <Text style={styles.counterText}>
              {organizaciones.length}
            </Text>

          </View>

        )}

      </View>


      {/* ================================================= */}
      {/* CARGANDO */}
      {/* ================================================= */}

      {loading ? (

        <ActivityIndicator
          size="large"
          color="#1F6F5C"
          style={styles.loader}
        />

      ) : organizaciones.length === 0 ? (


        /* ================================================= */
        /* ESTADO VACÍO */
        /* ================================================= */

        <View style={styles.emptyCard}>

          <Text style={styles.emptyIcon}>
            ✓
          </Text>


          <Text style={styles.emptyTitle}>
            No hay organizaciones pendientes
          </Text>


          <Text style={styles.emptyText}>
            Todas las solicitudes de verificación fueron procesadas.
          </Text>

        </View>

      ) : (


        /* ================================================= */
        /* LISTADO */
        /* ================================================= */

        organizaciones.map(
          (organizacion) => (

            <View
              key={
                organizacion.id_organizacion
              }
              style={styles.card}
            >


              <View style={styles.cardHeader}>

                <View style={styles.organizationIcon}>

                  <Text style={styles.organizationIconText}>
                    🏢
                  </Text>

                </View>


                <View style={styles.cardHeaderText}>

                  <Text style={styles.cardTitle}>
                    {
                      organizacion.razon_social ||
                      'Organización'
                    }
                  </Text>


                  <View style={styles.statusBadge}>

                    <Text style={styles.statusText}>
                      PENDIENTE
                    </Text>

                  </View>

                </View>

              </View>


              {/* CUIT */}

              <View style={styles.infoRow}>

                <Text style={styles.infoLabel}>
                  CUIT
                </Text>


                <Text style={styles.infoValue}>
                  {
                    organizacion.cuit ||
                    'No disponible'
                  }
                </Text>

              </View>


              <View style={styles.separator} />


              {/* CORREO */}

              <View style={styles.infoRow}>

                <Text style={styles.infoLabel}>
                  Correo
                </Text>


                <Text style={styles.infoValue}>
                  {
                    organizacion.email ||
                    'No disponible'
                  }
                </Text>

              </View>


              <View style={styles.separator} />


              {/* FECHA */}

              <View style={styles.infoRow}>

                <Text style={styles.infoLabel}>
                  Registrada
                </Text>


                <Text style={styles.infoValue}>
                  {
                    formatearFecha(
                      organizacion.creado_en
                    )
                  }
                </Text>

              </View>


              {/* VER DETALLE */}

              <TouchableOpacity
                style={styles.detailButton}
                onPress={() =>
                  onVerDetalle(
                    organizacion
                  )
                }
              >

                <Text style={styles.detailButtonText}>
                  Ver detalle
                </Text>

              </TouchableOpacity>

            </View>

          )
        )

      )}

    </View>

  );

}


const styles =
  StyleSheet.create({

    container: {

      width: '100%',
      maxWidth: 500,

    },


    // =====================================================
    // HEADER
    // =====================================================

    header: {

      marginBottom: 24,

    },


    headerText: {

      marginBottom: 8,

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


    logoutText: {

      color: '#C62828',

      fontWeight: '600',

      marginTop: 4,

    },


    // =====================================================
    // SECTION HEADER
    // =====================================================

   sectionHeader: {

  width: '100%',

  flexDirection: 'row',

  alignItems: 'center',

  backgroundColor: '#FFFFFF',

  borderRadius: 14,

  paddingHorizontal: 16,
  paddingVertical: 14,

  borderWidth: 1,
  borderColor: '#DDE5E2',

  marginBottom: 14,

  elevation: 2,

  shadowColor: '#164C40',

  shadowOffset: {
    width: 0,
    height: 2,
  },

  shadowOpacity: 0.08,

  shadowRadius: 5,

},


    sectionTitle: {

      fontSize: 18,
      fontWeight: '700',

      color: '#164C40',

    },


    counterBadge: {

  minWidth: 34,
  height: 34,

  borderRadius: 17,

  backgroundColor: '#D9EFE9',

  alignItems: 'center',
  justifyContent: 'center',

  marginLeft: 10,

  paddingHorizontal: 9,

},


counterText: {

  color: '#164C40',

  fontSize: 17,
  fontWeight: 'bold',

},


    // =====================================================
    // LOADING
    // =====================================================

    loader: {

      marginTop: 40,

    },


    // =====================================================
    // EMPTY STATE
    // =====================================================

    emptyCard: {

      backgroundColor: '#FFFFFF',

      borderRadius: 16,

      padding: 28,

      alignItems: 'center',

      borderWidth: 1,
      borderColor: '#DDE5E2',

    },


    emptyIcon: {

      fontSize: 34,

      color: '#1F6F5C',

      marginBottom: 10,

    },


    emptyTitle: {

      fontSize: 17,

      fontWeight: '700',

      color: '#164C40',

      textAlign: 'center',

    },


    emptyText: {

      fontSize: 13,

      color: '#5F6B76',

      textAlign: 'center',

      marginTop: 6,

      lineHeight: 19,

    },


    // =====================================================
    // ORGANIZATION CARD
    // =====================================================

    card: {

      backgroundColor: '#FFFFFF',

      borderRadius: 16,

      padding: 18,

      borderWidth: 1,
      borderColor: '#DDE5E2',

      marginBottom: 14,

    },


    cardHeader: {

      flexDirection: 'row',

      alignItems: 'center',

      marginBottom: 16,

    },


    organizationIcon: {

      width: 48,
      height: 48,

      borderRadius: 24,

      backgroundColor: '#EAF5F2',

      alignItems: 'center',
      justifyContent: 'center',

      marginRight: 12,

    },


    organizationIconText: {

      fontSize: 23,

    },


    cardHeaderText: {

      flex: 1,

      alignItems: 'flex-start',

    },


    cardTitle: {

      fontSize: 17,

      fontWeight: '700',

      color: '#1F2937',

      marginBottom: 6,

    },


    statusBadge: {

      backgroundColor: '#FFF3CD',

      borderRadius: 15,

      paddingHorizontal: 9,
      paddingVertical: 4,

    },


    statusText: {

      fontSize: 10,

      fontWeight: '700',

      color: '#7A5A00',

    },


    // =====================================================
    // INFORMATION
    // =====================================================

    infoRow: {

      paddingVertical: 8,

    },


    infoLabel: {

      fontSize: 11,

      color: '#5F6B76',

    },


    infoValue: {

      fontSize: 14,

      color: '#1F2937',

      fontWeight: '600',

      marginTop: 3,

    },


    separator: {

      height: 1,

      backgroundColor: '#EEF1F0',

    },


    // =====================================================
    // DETAIL BUTTON
    // =====================================================

    detailButton: {

      marginTop: 16,

      height: 44,

      borderRadius: 10,

      borderWidth: 1,
      borderColor: '#1F6F5C',

      alignItems: 'center',
      justifyContent: 'center',

    },


    detailButtonText: {

      color: '#1F6F5C',

      fontSize: 14,

      fontWeight: '700',

    },

  });