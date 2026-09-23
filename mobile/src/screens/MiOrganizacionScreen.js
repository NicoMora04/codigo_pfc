import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';


export default function MiOrganizacionScreen({
  organizacion,
  loading,
  onLogout,
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
      {/* ACLARACIÓN */}
      {/* ================================================= */}

      <View style={styles.noteCard}>

        <Text style={styles.noteTitle}>
          Perfil público
        </Text>


        <Text style={styles.noteText}>
          Más adelante esta sección podrá incorporar la edición del perfil público de la organización, imágenes, descripción y datos visibles para los visitantes.
        </Text>

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

      marginBottom: 20,

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

  });