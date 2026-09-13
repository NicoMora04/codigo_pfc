import React from 'react';
import MapaLeaflet from '../components/MapaLeaflet';

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

export default function DetalleOportunidadScreen({
  oportunidad,
  loading,
  onVolver,
}) {

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#1F6F5C"
        />
      </View>
    );
  }

  if (!oportunidad) {
    return (
      <View style={styles.container}>

        <Text style={styles.emptyTitle}>
          No se pudo cargar la oportunidad
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={onVolver}
        >
          <Text style={styles.backButtonText}>
            Volver
          </Text>
        </TouchableOpacity>

      </View>
    );
  }

  const ubicacion = [
    oportunidad.direccion,
    oportunidad.localidad,
    oportunidad.provincia,
  ]
    .filter(Boolean)
    .join(', ');

  return (

    <View style={styles.container}>

      <TouchableOpacity
        style={styles.backButton}
        onPress={onVolver}
      >
        <Text style={styles.backButtonText}>
          ← Volver
        </Text>
      </TouchableOpacity>

      <View style={styles.card}>

        <Text style={styles.title}>
          {oportunidad.titulo}
        </Text>

        <Text style={styles.organization}>
          {oportunidad.organizacion}
        </Text>

        <Text style={styles.type}>
          {oportunidad.tipo_actividad}
        </Text>


        <Text style={styles.sectionTitle}>
          Descripción
        </Text>

        <Text style={styles.text}>
          {oportunidad.descripcion ||
            'Sin descripción.'}
        </Text>


        <Text style={styles.sectionTitle}>
          Urgencia
        </Text>

        <Text style={styles.text}>
          {oportunidad.urgencia}
        </Text>


        <Text style={styles.sectionTitle}>
          Requisitos
        </Text>

        <Text style={styles.text}>
          {oportunidad.requisitos ||
            'No se especificaron requisitos.'}
        </Text>


        <Text style={styles.sectionTitle}>
          Cupo
        </Text>

        <Text style={styles.text}>
          {oportunidad.cupo_total}
        </Text>


        <Text style={styles.sectionTitle}>
          Inicio
        </Text>

        <Text style={styles.text}>
          {new Date(
            oportunidad.fecha_inicio
          ).toLocaleString('es-AR')}
        </Text>


        <Text style={styles.sectionTitle}>
          Fin previsto
        </Text>

        <Text style={styles.text}>
          {new Date(
            oportunidad.fecha_fin
          ).toLocaleString('es-AR')}
        </Text>


        <Text style={styles.sectionTitle}>
          Ubicación
        </Text>

        <Text style={styles.text}>
          {ubicacion ||
            'Ubicación no especificada.'}
        </Text>

              {(
        oportunidad.latitud != null &&
        oportunidad.longitud != null
      ) && (

        <View style={styles.mapSection}>

          <Text style={styles.mapTitle}>
            Ubicación de la oportunidad
          </Text>

          <Text style={styles.mapSubtitle}>
            Consultá en el mapa dónde se realizará la actividad.
          </Text>

          <MapaLeaflet
            oportunidades={[oportunidad]}
            mostrarBotonDetalle={false}
            zoom={15}
          />

        </View>

      )}

      </View>

    </View>

  );

}


const styles = StyleSheet.create({

  container: {
    width: '100%',
    maxWidth: 500,
  },

backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#1F6F5C',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 14,
    },

  backButtonText: {
  fontSize: 14,
  fontWeight: '700',
  color: '#FFFFFF',
},

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DDE5E2',
  },

  title: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#164C40',
  },

  organization: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F6F5C',
    marginTop: 6,
  },

  type: {
    fontSize: 13,
    color: '#5F6B76',
    marginTop: 4,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 14,
    marginBottom: 4,
  },

  text: {
    fontSize: 13,
    color: '#5F6B76',
    lineHeight: 19,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#164C40',
    marginBottom: 14,
  },

  mapSection: {
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: 16,
  marginTop: 18,
  marginBottom: 18,
  borderWidth: 1,
  borderColor: '#DDE5E2',
},

mapTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: '#164C40',
  marginBottom: 4,
},

mapSubtitle: {
  fontSize: 12,
  color: '#5F6B76',
  marginBottom: 12,
},

});
