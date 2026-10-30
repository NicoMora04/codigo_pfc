import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from 'react-native';

import {
  WEB_URL
} from '../config/api';

export default function MiOrganizacionScreen({
  organizacion,
  loading,
  perfilPublico,
  loadingPerfilPublico,
  onLogout,
  onVerReputacion,
}) {

  if (
    loading
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


  return (

    <View style={styles.container}>


      {/* ================================================= */}
      {/* ENCABEZADO */}
      {/* ================================================= */}

      <View style={styles.header}>

        <View>

          <Text style={styles.title}>
            Mi organización
          </Text>


          <Text style={styles.subtitle}>
            Información de la cuenta institucional.
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
      {/* IDENTIDAD */}
      {/* ================================================= */}

      <View style={styles.identityCard}>

        <View style={styles.iconCircle}>

          <Text style={styles.icon}>
            🏢
          </Text>

        </View>


        <Text style={styles.organizationName}>

          {organizacion
            ?.razon_social ||
            'Organización'}

        </Text>


        <View
          style={[
            styles.statusBadge,

            organizacion
              ?.estado_verificacion ===
              'VERIFICADA'

              ? styles.statusVerified

              : organizacion
                  ?.estado_verificacion ===
                  'RECHAZADA'

                ? styles.statusRejected

                : styles.statusPending
          ]}
        >

          <Text style={styles.statusText}>

            {organizacion
              ?.estado_verificacion ||
              'PENDIENTE'}

          </Text>

        </View>

      </View>


      {/* ================================================= */}
      {/* INFORMACIÓN */}
      {/* ================================================= */}

      <View style={styles.infoCard}>

        <Text style={styles.sectionTitle}>
          Información institucional
        </Text>


        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            Razón social
          </Text>

          <Text style={styles.infoValue}>
            {organizacion
              ?.razon_social ||
              'No disponible'}
          </Text>

        </View>


        <View style={styles.separator} />


        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            CUIT
          </Text>

          <Text style={styles.infoValue}>
            {organizacion
              ?.cuit ||
              'No disponible'}
          </Text>

        </View>


        <View style={styles.separator} />


        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            Correo electrónico
          </Text>

          <Text style={styles.infoValue}>
            {organizacion
              ?.email ||
              'No disponible'}
          </Text>

        </View>


        <View style={styles.separator} />


        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            Estado de verificación
          </Text>

          <Text style={styles.infoValue}>
            {organizacion
              ?.estado_verificacion ||
              'No disponible'}
          </Text>

        </View>


        <View style={styles.separator} />


        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            Estado de cuenta
          </Text>

          <Text style={styles.infoValue}>
            {organizacion
              ?.estado_cuenta ||
              'No disponible'}
          </Text>

        </View>

      </View>
      
      {/* ================================================= */}
      {/* MI REPUTACIÓN - ACTIVIDAD 3.2.2 */}
      {/* ================================================= */}

      <View style={styles.reputationCard}>

        <Text style={styles.sectionTitle}>
          Mi reputación
        </Text>

        <Text style={styles.reputationIcon}>
          ⭐
        </Text>

        <Text style={styles.reputationDescription}>
          Consultá las calificaciones y comentarios
          que recibiste de los voluntarios por las
          actividades realizadas.
        </Text>

        <TouchableOpacity
          style={[
            styles.reputationButton,
            !onVerReputacion && {
              opacity: 0.5
            }
          ]}
          onPress={onVerReputacion}
          disabled={!onVerReputacion}
        >

          <Text style={styles.reputationButtonText}>
            Ver mi reputación
          </Text>

        </TouchableOpacity>

      </View>

      {/* ================================================= */}
      {/* PERFIL PÚBLICO - ACTIVIDAD 3.6.1 */}
      {/* ================================================= */}

      <View style={styles.publicProfileCard}>

        <Text style={styles.sectionTitle}>
          Perfil público
        </Text>


        {loadingPerfilPublico ? (

          <ActivityIndicator
            size="small"
            color="#1F6F5C"
            style={styles.publicProfileLoader}
          />

        ) : (

          <>

            <View
              style={[
                styles.publicProfileStatusBadge,

                !perfilPublico
                  ? styles.publicProfileStatusMissing

                  : perfilPublico.estado_publicacion ===
                      'PUBLICADO'
                    ? styles.publicProfileStatusPublished

                    : perfilPublico.estado_publicacion ===
                        'OCULTO'
                      ? styles.publicProfileStatusHidden

                      : styles.publicProfileStatusDraft
              ]}
            >

              <Text
                style={
                  styles.publicProfileStatusText
                }
              >

                {!perfilPublico
                  ? 'SIN CREAR'

                  : perfilPublico
                      .estado_publicacion}

              </Text>

            </View>

            {perfilPublico?.estado_publicacion ===
                'PUBLICADO' &&
              perfilPublico?.slug && (

                <TouchableOpacity
                  style={
                    styles.publicProfileWebButton
                  }
                  onPress={() =>
                    Linking.openURL(
                      `${WEB_URL}/organizaciones/${perfilPublico.slug}`
                    )
                  }
                >

                  <Text
                    style={
                      styles.publicProfileWebButtonText
                    }
                  >
                    Ver mi perfil público en la web
                  </Text>

                </TouchableOpacity>
              )}
            
            <TouchableOpacity
              style={
                styles.managePublicProfileButton
              }
              onPress={() =>
                Linking.openURL(
                  `${WEB_URL}/mi-perfil`
                )
              }
            >

              <Text
                style={
                  styles.managePublicProfileButtonText
                }
              >
                Administrar perfil en la web
              </Text>

            </TouchableOpacity>

            <Text
              style={
                styles.publicProfileDescription
              }
            >

              {!perfilPublico

                ? 'Tu organización todavía no tiene un perfil público. Podrás crearlo y completar la información institucional visible para los visitantes.'

                : perfilPublico
                    .estado_publicacion ===
                    'PUBLICADO'

                  ? 'Tu perfil se encuentra publicado y visible para los visitantes del portal web.'

                  : perfilPublico
                      .estado_publicacion ===
                      'BORRADOR'

                    ? 'Tu perfil está guardado como borrador. Podrás seguir completándolo antes de publicarlo.'

                    : perfilPublico
                        .estado_publicacion ===
                        'NO_PUBLICADO'

                      ? 'Tu perfil existe, pero actualmente no está disponible en el portal público.'

                      : perfilPublico
                          .estado_publicacion ===
                          'OCULTO'

                        ? 'El perfil fue ocultado administrativamente y no se encuentra visible para los visitantes.'

                        : 'El perfil público existe y puede gestionarse desde el portal web.'}

            </Text>


            {perfilPublico?.nombre_visible && (

              <View style={styles.publicProfileInfo}>

                <Text style={styles.infoLabel}>
                  Nombre público
                </Text>

                <Text style={styles.infoValue}>
                  {
                    perfilPublico
                      .nombre_visible
                  }
                </Text>

              </View>

            )}


            {perfilPublico?.slug && (

              <View style={styles.publicProfileInfo}>

                <Text style={styles.infoLabel}>
                  Identificador público
                </Text>

                <Text style={styles.infoValue}>
                  {
                    perfilPublico.slug
                  }
                </Text>

              </View>

            )}


            <View style={styles.publicProfileGuide}>

              <Text style={styles.publicProfileGuideTitle}>
                Gestión del perfil
              </Text>

              <Text style={styles.publicProfileGuideText}>

                {perfilPublico
                  ? 'La edición, selección de plantilla, previsualización y publicación del perfil se realizará desde el portal web.'
                  : 'Para comenzar, ingresá al portal web con la misma cuenta de tu organización y completá tu perfil institucional.'}

              </Text>

            </View>

          </>

        )}

      </View>

    </View>

  );

}


const styles =
  StyleSheet.create({

    container: {

      width: '100%',
      maxWidth: 500,

    },


    loader: {

      marginTop: 50,

    },


    header: {

  backgroundColor: '#FFFFFF',

  borderRadius: 16,

  padding: 18,

  marginBottom: 20,

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

    },


    logoutText: {

      color: '#C62828',

      fontWeight: '600',

      marginTop: 10,

    },


    identityCard: {

      backgroundColor: '#EAF5F2',

      borderRadius: 18,

      padding: 22,

      alignItems: 'center',

      marginBottom: 18,

      borderWidth: 1,
      borderColor: '#CFE4DE',

    },


    iconCircle: {

      width: 70,
      height: 70,

      borderRadius: 35,

      backgroundColor: '#FFFFFF',

      alignItems: 'center',
      justifyContent: 'center',

    },


    icon: {

      fontSize: 34,

    },


    organizationName: {

      fontSize: 20,
      fontWeight: '700',
      color: '#164C40',

      marginTop: 12,

      textAlign: 'center',

    },


    statusBadge: {

      borderRadius: 20,

      paddingHorizontal: 12,
      paddingVertical: 6,

      marginTop: 10,

    },


    statusVerified: {

      backgroundColor: '#D9F2E8',

    },


    statusPending: {

      backgroundColor: '#FFF3CD',

    },


    statusRejected: {

      backgroundColor: '#F8D7DA',

    },


    statusText: {

      fontSize: 11,
      fontWeight: '700',
      color: '#164C40',

    },


    infoCard: {

      backgroundColor: '#FFFFFF',

      borderRadius: 16,

      padding: 18,

      borderWidth: 1,
      borderColor: '#DDE5E2',

      marginBottom: 18,

    },


    sectionTitle: {

      fontSize: 17,
      fontWeight: '700',
      color: '#164C40',

      marginBottom: 14,

    },


    infoRow: {

      paddingVertical: 8,

    },


    infoLabel: {

      fontSize: 12,
      color: '#5F6B76',

    },


    infoValue: {

      fontSize: 14,
      fontWeight: '600',
      color: '#1F2937',

      marginTop: 3,

    },


    separator: {

      height: 1,

      backgroundColor: '#EEF1F0',

    },


    noteCard: {

      backgroundColor: '#FFF8E7',

      borderRadius: 14,

      padding: 16,

      borderWidth: 1,
      borderColor: '#F3E4B4',

      marginBottom: 20,

    },


    noteTitle: {

      fontSize: 14,
      fontWeight: '700',
      color: '#7A5A00',

    },


    noteText: {

      fontSize: 12,
      color: '#5F6B76',

      lineHeight: 18,

      marginTop: 5,

    },

 // ======================================================
// REPUTACIÓN DE ORGANIZACIÓN - ACTIVIDAD 3.2.2
// ======================================================

reputationCard: {
  backgroundColor: '#FFFFFF',

  borderRadius: 16,

  padding: 20,

  marginBottom: 18,

  borderWidth: 1,
  borderColor: '#DDE5E2',

  alignItems: 'center',
},

reputationIcon: {
  fontSize: 42,

  marginBottom: 10,
},

reputationDescription: {
  fontSize: 14,

  color: '#5F6B76',

  textAlign: 'center',

  lineHeight: 21,

  marginBottom: 20,
},

reputationButton: {
  width: '100%',

  minHeight: 46,

  borderRadius: 10,

  backgroundColor: '#1F6F5C',

  alignItems: 'center',
  justifyContent: 'center',
},

reputationButtonText: {
  color: '#FFFFFF',

  fontWeight: '700',

  fontSize: 14,
},

publicProfileCard: {

  backgroundColor: '#FFFFFF',

  borderRadius: 16,

  padding: 18,

  borderWidth: 1,
  borderColor: '#DDE5E2',

  marginBottom: 18,

},


publicProfileLoader: {

  marginVertical: 18,

},


publicProfileStatusBadge: {

  alignSelf: 'flex-start',

  paddingHorizontal: 11,
  paddingVertical: 6,

  borderRadius: 20,

  marginBottom: 12,

},


publicProfileStatusPublished: {

  backgroundColor: '#D9F2E8',

},


publicProfileStatusDraft: {

  backgroundColor: '#FFF3CD',

},


publicProfileStatusMissing: {

  backgroundColor: '#EEF1F0',

},


publicProfileStatusHidden: {

  backgroundColor: '#F8D7DA',

},


publicProfileStatusText: {

  fontSize: 11,

  fontWeight: '700',

  color: '#164C40',

},


publicProfileDescription: {

  fontSize: 14,

  color: '#5F6B76',

  lineHeight: 21,

  marginBottom: 16,

},


publicProfileInfo: {

  paddingVertical: 8,

  borderTopWidth: 1,

  borderTopColor: '#EEF1F0',

},


publicProfileGuide: {

  marginTop: 14,

  padding: 14,

  borderRadius: 12,

  backgroundColor: '#EAF5F2',

  borderWidth: 1,

  borderColor: '#CFE4DE',

},


publicProfileGuideTitle: {

  fontSize: 13,

  fontWeight: '700',

  color: '#164C40',

  marginBottom: 5,

},


publicProfileGuideText: {

  fontSize: 12,

  color: '#5F6B76',

  lineHeight: 18,

},

publicProfileWebButton: {

  minHeight: 46,

  marginTop: 14,

  borderRadius: 10,

  backgroundColor: '#1F6F5C',

  alignItems: 'center',
  justifyContent: 'center',

  paddingHorizontal: 14,

},


publicProfileWebButtonText: {

  color: '#FFFFFF',

  fontSize: 14,
  fontWeight: '700',

  textAlign: 'center',

},

managePublicProfileButton: {

  minHeight: 46,

  marginTop: 10,

  borderRadius: 10,

  borderWidth: 1,
  borderColor: '#1F6F5C',

  backgroundColor: '#FFFFFF',

  alignItems: 'center',
  justifyContent: 'center',

  paddingHorizontal: 14,

},


managePublicProfileButtonText: {

  color: '#1F6F5C',

  fontSize: 14,
  fontWeight: '700',

  textAlign: 'center',

},

  });