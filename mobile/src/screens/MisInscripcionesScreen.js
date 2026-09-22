import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';


export default function MisInscripcionesScreen({
  inscripciones = [],
  loading,
  onVerDetalle,
}) {

  
  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Mis inscripciones
      </Text>


      <Text style={styles.subtitle}>
        Consultá las actividades en las que te inscribiste y el estado de cada solicitud.
      </Text>


      {loading ? (

        <ActivityIndicator
          size="large"
          color="#1F6F5C"
          style={styles.loader}
        />

      ) : inscripciones.length === 0 ? (

        <View style={styles.emptyCard}>

          <Text style={styles.emptyTitle}>
            Todavía no tenés inscripciones
          </Text>

          <Text style={styles.emptyText}>
            Cuando te inscribas a una oportunidad, aparecerá en esta sección.
          </Text>

        </View>

      ) : (

        inscripciones.map(
          (inscripcion) => (

            <View
              key={inscripcion.id_inscripcion}
              style={styles.card}
            >

              <Text style={styles.cardTitle}>
                {inscripcion.oportunidad_titulo}
              </Text>


              <Text style={styles.cardInfo}>
                Inicio:{' '}
                {new Date(
                  inscripcion.fecha_inicio
                ).toLocaleString('es-AR')}
              </Text>


              <Text style={styles.cardInfo}>
                Fin:{' '}
                {new Date(
                  inscripcion.fecha_fin
                ).toLocaleString('es-AR')}
              </Text>


              <View style={styles.statusContainer}>

                <Text style={styles.statusLabel}>
                  Estado
                </Text>

                <Text style={styles.statusText}>
                  {inscripcion.estado}
                </Text>

              </View>


              <TouchableOpacity
                style={styles.detailButton}
                onPress={() =>
                    onVerDetalle(
                    inscripcion.id_oportunidad,
                    inscripcion.estado
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


    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#164C40',
    },


    subtitle: {
      fontSize: 13,
      color: '#5F6B76',
      marginTop: 4,
      marginBottom: 20,
      lineHeight: 18,
    },


    loader: {
      marginTop: 30,
    },


    emptyCard: {
      backgroundColor: '#FFFFFF',

      borderRadius: 14,

      padding: 20,

      borderWidth: 1,
      borderColor: '#E6F2EF',

      alignItems: 'center',
    },


    emptyTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#164C40',
    },


    emptyText: {
      fontSize: 13,
      color: '#5F6B76',

      marginTop: 6,

      textAlign: 'center',
      lineHeight: 18,
    },


    card: {
      backgroundColor: '#FFFFFF',

      borderRadius: 14,

      padding: 16,

      marginBottom: 12,

      borderWidth: 1,
      borderColor: '#E6F2EF',
    },


    cardTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: '#164C40',

      marginBottom: 8,
    },


    cardInfo: {
      fontSize: 12,
      color: '#5F6B76',

      marginTop: 4,
    },


    statusContainer: {
      flexDirection: 'row',

      alignItems: 'center',

      marginTop: 12,

      gap: 8,
    },


    statusLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: '#5F6B76',
    },


    statusText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#1F6F5C',
    },


    detailButton: {
      borderWidth: 1,
      borderColor: '#1F6F5C',

      backgroundColor: '#FFFFFF',

      borderRadius: 10,

      paddingVertical: 10,
      paddingHorizontal: 14,

      alignItems: 'center',

      marginTop: 14,
    },


    detailButtonText: {
      color: '#1F6F5C',

      fontSize: 13,
      fontWeight: '700',
    },

  });