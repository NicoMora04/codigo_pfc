import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';


export default function DetalleOrganizacionDonacionScreen({
  organizacion,
  loading,
  onVolver,
  onDonar,
}) {

  // =====================================================
  // CARGANDO
  // =====================================================

  if (
    loading
  ) {

    return (

      <View style={styles.container}>

        <ActivityIndicator
          size="large"
          color="#1F6F5C"
        />

      </View>

    );

  }


  // =====================================================
  // SIN ORGANIZACIÓN
  // =====================================================

  if (
    !organizacion
  ) {

    return (

      <View style={styles.container}>

        <Text style={styles.emptyTitle}>
          No se pudo cargar la organización
        </Text>


        <TouchableOpacity
          style={styles.backButton}
          onPress={
            onVolver
          }
        >

          <Text style={styles.backButtonText}>
            ← Volver
          </Text>

        </TouchableOpacity>

      </View>

    );

  }


  // =====================================================
  // DATOS A MOSTRAR
  // =====================================================

  const nombre =
    organizacion.nombre_visible ||
    organizacion.razon_social;


const ubicacionGeneral = [
  organizacion.localidad,
  organizacion.provincia,
]
  .filter(Boolean)
  .join(', ');


const ubicacionCompleta =
  organizacion.direccion ||
  ubicacionGeneral;


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <View style={styles.container}>

      <TouchableOpacity
        style={styles.backButton}
        onPress={
          onVolver
        }
      >

        <Text style={styles.backButtonText}>
          ← Volver
        </Text>

      </TouchableOpacity>


      <View style={styles.card}>

        <View style={styles.header}>

          <Text style={styles.title}>
            {nombre}
          </Text>


          <View style={styles.verifiedBadge}>

            <Text style={styles.verifiedText}>
              ✓ Verificada
            </Text>

          </View>

        </View>


        {organizacion.descripcion_publica && (

          <>
            <Text style={styles.sectionTitle}>
              Sobre la organización
            </Text>

            <Text style={styles.text}>
              {organizacion.descripcion_publica}
            </Text>
          </>

        )}


        <Text style={styles.sectionTitle}>
          Actividades
        </Text>


        {organizacion
          .tipos_actividad
          ?.length > 0 ? (

          <Text style={styles.text}>

            {
              organizacion
                .tipos_actividad
                .map(
                  (tipo) =>
                    tipo.nombre
                )
                .join(', ')
            }

          </Text>

        ) : (

          <Text style={styles.text}>
            No se especificaron tipos de actividad.
          </Text>

        )}


        <Text style={styles.sectionTitle}>
          Ubicación
        </Text>


        <Text style={styles.text}>
        {
          ubicacionCompleta ||
          'Ubicación no especificada.'
        }
      </Text>

        {
          organizacion.direccion &&
          ubicacionGeneral &&
          organizacion.direccion !== ubicacionGeneral && (

            <Text style={styles.locationSecondary}>
              {ubicacionGeneral}
            </Text>

          )
        }


        {organizacion.es_aproximada && (

          <Text style={styles.approximateText}>
            La ubicación mostrada es aproximada.
          </Text>

        )}


        {(
          organizacion.email_contacto_publico ||
          organizacion.telefono_contacto_publico ||
          organizacion.sitio_web_url
        ) && (

          <>

            <Text style={styles.sectionTitle}>
              Contacto
            </Text>


            {
              organizacion.email_contacto_publico && (

                <Text style={styles.text}>
                  Email: {
                    organizacion.email_contacto_publico
                  }
                </Text>

              )
            }


            {
              organizacion.telefono_contacto_publico && (

                <Text style={styles.text}>
                  Teléfono: {
                    organizacion.telefono_contacto_publico
                  }
                </Text>

              )
            }


            {
              organizacion.sitio_web_url && (

                <Text style={styles.text}>
                  Sitio web: {
                    organizacion.sitio_web_url
                  }
                </Text>

              )
            }

          </>

        )}


        <TouchableOpacity
          style={styles.donateButton}
          onPress={
            onDonar
          }
        >

          <Text style={styles.donateButtonText}>
            Donar a esta organización
          </Text>

        </TouchableOpacity>

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
      maxWidth: 700,
      alignSelf: 'center',
      paddingBottom: 30,

    },


   backButton: {

  alignSelf: 'flex-start',

  backgroundColor: '#FFFFFF',

  paddingHorizontal: 14,
  paddingVertical: 10,

  borderRadius: 10,

  borderWidth: 1,
  borderColor: '#DDE5E2',

  elevation: 2,

  marginBottom: 14,

},


    backButtonText: {

      color: '#1F6F5C',
      fontWeight: '600',
      fontSize: 14,

    },


    card: {

      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 18,
      elevation: 2,

    },


    header: {

      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 20,

    },


    title: {

      flex: 1,
      fontSize: 24,
      fontWeight: 'bold',
      color: '#164C40',

    },


    verifiedBadge: {

      backgroundColor: '#E8F5F0',
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 14,

    },


    verifiedText: {

      color: '#1F6F5C',
      fontSize: 11,
      fontWeight: '600',

    },


    sectionTitle: {

      fontSize: 15,
      fontWeight: 'bold',
      color: '#1F2937',
      marginTop: 12,
      marginBottom: 5,

    },


    text: {

      fontSize: 14,
      lineHeight: 20,
      color: '#5F6B76',

    },


    approximateText: {

      fontSize: 12,
      color: '#7A858D',
      marginTop: 4,

    },


    donateButton: {

      height: 48,
      backgroundColor: '#1F6F5C',
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 26,

    },


    donateButtonText: {

      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 15,

    },


    emptyTitle: {

      fontSize: 17,
      fontWeight: 'bold',
      color: '#1F2937',
      marginBottom: 16,

    },
    locationSecondary: {
    fontSize: 12,
    color: '#7A858D',
    marginTop: 3,
  },

  });