import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from 'react-native';


// ======================================================
// PERFIL DEL VOLUNTARIO - VISTA ORGANIZACIÓN
// MEJORA 10 - ACTIVIDAD 3.2
// ======================================================

export default function PerfilVoluntarioOrganizacionScreen({
  perfil,
  loading,
  onVolver
}) {

  // ======================================================
  // 1. OBTENER NOMBRE COMPLETO
  // ======================================================

  const nombreCompleto = [
    perfil?.nombre,
    perfil?.apellido
  ]
    .filter(Boolean)
    .join(' ') || 'Voluntario';


  // ======================================================
  // 2. OBTENER DATOS DE REPUTACIÓN
  // ======================================================

  const cantidadValoraciones =
    Number(perfil?.cantidad || 0);

  const tieneValoraciones =
    cantidadValoraciones > 0 &&
    perfil?.promedio != null;


  const promedioMostrado =
    tieneValoraciones

      ? Number(perfil.promedio)
          .toFixed(1)
          .replace('.', ',')

      : null;


  return (

    <View style={styles.container}>

      {/* ============================================ */}
      {/* BOTÓN VOLVER */}
      {/* ============================================ */}

      <TouchableOpacity
        style={styles.backButton}
        onPress={onVolver}
      >

        <Text style={styles.backButtonText}>
          ← Volver a inscripciones
        </Text>

      </TouchableOpacity>


      {/* ============================================ */}
      {/* ENCABEZADO */}
      {/* ============================================ */}

      <View style={styles.header}>

        <Text style={styles.title}>
          Perfil del voluntario
        </Text>

        <Text style={styles.subtitle}>
          Información del voluntario inscripto
          en tu actividad.
        </Text>

      </View>


      {/* ============================================ */}
      {/* CARGA */}
      {/* ============================================ */}

      {loading ? (

        <ActivityIndicator
          size="large"
          color="#1F6F5C"
          style={styles.loader}
        />

      ) : !perfil ? (

        <View style={styles.emptyCard}>

          <Text style={styles.emptyTitle}>
            No se pudo cargar el perfil
          </Text>

          <Text style={styles.emptyDescription}>
            Volvé a la gestión de inscripciones
            e intentá nuevamente.
          </Text>

        </View>

      ) : (

        <>

          {/* ======================================== */}
          {/* IDENTIDAD DEL VOLUNTARIO */}
          {/* ======================================== */}

          <View style={styles.identityCard}>

            <View style={styles.iconCircle}>

              <Text style={styles.icon}>
                👤
              </Text>

            </View>


            <Text style={styles.volunteerName}>
              {nombreCompleto}
            </Text>


            <Text style={styles.volunteerRole}>
              Voluntario
            </Text>

          </View>


          {/* ======================================== */}
          {/* INFORMACIÓN PERSONAL */}
          {/* ======================================== */}

          <View style={styles.infoCard}>

            <Text style={styles.sectionTitle}>
              Información de contacto
            </Text>


            <View style={styles.infoRow}>

              <Text style={styles.infoLabel}>
                Nombre completo
              </Text>

              <Text style={styles.infoValue}>
                {nombreCompleto}
              </Text>

            </View>


            <View style={styles.separator} />


            <View style={styles.infoRow}>

              <Text style={styles.infoLabel}>
                Correo electrónico
              </Text>

              <Text style={styles.infoValue}>
                {perfil.email || 'No disponible'}
              </Text>

            </View>


            <View style={styles.separator} />


            <View style={styles.infoRow}>

              <Text style={styles.infoLabel}>
                Teléfono
              </Text>

              <Text style={styles.infoValue}>
                {perfil.telefono || 'No disponible'}
              </Text>

            </View>

          </View>


          {/* ======================================== */}
          {/* REPUTACIÓN DEL VOLUNTARIO */}
          {/* ======================================== */}

          <View style={styles.reputationCard}>

            <Text style={styles.sectionTitle}>
              Reputación del voluntario
            </Text>


            <Text style={styles.reputationIcon}>
              ⭐
            </Text>


            {tieneValoraciones ? (

              <>

                <Text style={styles.averageText}>
                  {promedioMostrado} / 5
                </Text>


                <Text style={styles.reputationCount}>

                  {cantidadValoraciones === 1

                    ? 'Basado en 1 valoración recibida'

                    : `Basado en ${cantidadValoraciones} valoraciones recibidas`}

                </Text>

              </>

            ) : (

              <>

                <Text style={styles.noRatingsText}>
                  Sin valoraciones todavía
                </Text>


                <Text style={styles.reputationCount}>
                  Este voluntario todavía no
                  recibió calificaciones de
                  organizaciones.
                </Text>

              </>

            )}

          </View>


          {/* ======================================== */}
          {/* ACLARACIÓN SOBRE REPUTACIÓN */}
          {/* ======================================== */}

          <View style={styles.noteCard}>

            <Text style={styles.noteTitle}>
              Información sobre la reputación
            </Text>


            <Text style={styles.noteText}>
              La reputación refleja las
              valoraciones recibidas por el
              voluntario en actividades
              completadas.

              {'\n\n'}

              Esta información es orientativa
              y no determina automáticamente
              la aceptación o el rechazo
              de una inscripción.
            </Text>

          </View>

        </>

      )}

    </View>

  );

}


// ======================================================
// ESTILOS
// ======================================================

const styles = StyleSheet.create({

  container: {
    width: '100%',
    maxWidth: 500
  },

  backButton: {
    alignSelf: 'flex-start',

    backgroundColor: '#1F6F5C',

    paddingHorizontal: 14,
    paddingVertical: 10,

    borderRadius: 10,

    marginBottom: 14
  },

  backButtonText: {
    color: '#FFFFFF',

    fontSize: 14,
    fontWeight: '700'
  },

  header: {
    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    padding: 18,

    marginBottom: 18,

    borderWidth: 1,
    borderColor: '#DDE5E2'
  },

  title: {
    fontSize: 24,

    fontWeight: 'bold',

    color: '#164C40'
  },

  subtitle: {
    fontSize: 14,

    color: '#5F6B76',

    marginTop: 5,

    lineHeight: 20
  },

  loader: {
    marginTop: 40
  },

  identityCard: {
    backgroundColor: '#EAF5F2',

    borderRadius: 18,

    padding: 24,

    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#CFE4DE',

    marginBottom: 18
  },

  iconCircle: {
    width: 70,
    height: 70,

    borderRadius: 35,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center'
  },

  icon: {
    fontSize: 34
  },

  volunteerName: {
    fontSize: 21,

    fontWeight: '700',

    color: '#164C40',

    marginTop: 12,

    textAlign: 'center'
  },

  volunteerRole: {
    fontSize: 13,

    color: '#5F6B76',

    marginTop: 5
  },

  infoCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    padding: 18,

    borderWidth: 1,
    borderColor: '#DDE5E2',

    marginBottom: 18
  },

  sectionTitle: {
    fontSize: 17,

    fontWeight: '700',

    color: '#164C40',

    marginBottom: 14
  },

  infoRow: {
    paddingVertical: 9
  },

  infoLabel: {
    fontSize: 12,

    color: '#5F6B76'
  },

  infoValue: {
    fontSize: 14,

    fontWeight: '600',

    color: '#1F2937',

    marginTop: 4
  },

  separator: {
    height: 1,

    backgroundColor: '#EEF1F0'
  },

  reputationCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    padding: 22,

    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#DDE5E2',

    marginBottom: 18
  },

  reputationIcon: {
    fontSize: 42,

    marginBottom: 12
  },

  averageText: {
    fontSize: 28,

    fontWeight: 'bold',

    color: '#164C40',

    marginBottom: 8
  },

  reputationCount: {
    fontSize: 13,

    color: '#5F6B76',

    textAlign: 'center',

    lineHeight: 20
  },

  noRatingsText: {
    fontSize: 17,

    fontWeight: '700',

    color: '#164C40',

    marginBottom: 10,

    textAlign: 'center'
  },

  noteCard: {
    backgroundColor: '#FFF8E7',

    borderRadius: 14,

    padding: 16,

    borderWidth: 1,
    borderColor: '#F3E4B4',

    marginBottom: 20
  },

  noteTitle: {
    fontSize: 14,

    fontWeight: '700',

    color: '#7A5A00'
  },

  noteText: {
    fontSize: 12,

    color: '#5F6B76',

    lineHeight: 19,

    marginTop: 7
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    padding: 24,

    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#DDE5E2'
  },

  emptyTitle: {
    fontSize: 16,

    fontWeight: '700',

    color: '#164C40',

    textAlign: 'center'
  },

  emptyDescription: {
    fontSize: 13,

    color: '#5F6B76',

    textAlign: 'center',

    marginTop: 10,

    lineHeight: 19
  }

});