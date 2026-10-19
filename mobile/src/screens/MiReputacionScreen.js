import React from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';


// ======================================================
// MI REPUTACIÓN - VOLUNTARIO
// ACTIVIDAD 3.2.1
// ======================================================

export default function MiReputacionScreen({
  reputacion,
  loading,
  onVolver
}) {

  // ======================================================
  // OBTENER DATOS
  // ======================================================

  const resumen = reputacion?.resumen || {
    promedio: null,
    cantidad: 0
  };

  const calificaciones =
    reputacion?.calificaciones || [];


  // ======================================================
  // FORMATEAR PROMEDIO
  // ======================================================

  const promedioMostrado =
    resumen.promedio === null
      ? 'Sin calificaciones'
      : Number(resumen.promedio)
          .toFixed(1)
          .replace('.', ',');


  // ======================================================
  // GENERAR ESTRELLAS
  // ======================================================

  const mostrarEstrellas = (puntuacion) => {

    const cantidad = Number(puntuacion);

    return (
      '★'.repeat(cantidad) +
      '☆'.repeat(5 - cantidad)
    );

  };


  return (

    <View style={styles.container}>

      {/* ============================================ */}
      {/* VOLVER */}
      {/* ============================================ */}

      <TouchableOpacity
        style={styles.backButton}
        onPress={onVolver}
      >

        <Text style={styles.backButtonText}>
          ← Volver a mi perfil
        </Text>

      </TouchableOpacity>


      {/* ============================================ */}
      {/* ENCABEZADO */}
      {/* ============================================ */}

      <View style={styles.header}>

        <Text style={styles.title}>
          Mi reputación
        </Text>

        <Text style={styles.subtitle}>
          Consultá las valoraciones que recibiste
          por tus participaciones.
        </Text>

      </View>


      {/* ============================================ */}
      {/* ESTADO DE CARGA */}
      {/* ============================================ */}

      {loading ? (

        <ActivityIndicator
          size="large"
          color="#1F6F5C"
          style={styles.loader}
        />

      ) : (

        <>

          {/* ======================================== */}
          {/* RESUMEN DE REPUTACIÓN */}
          {/* ======================================== */}

          <View style={styles.summaryCard}>

            <Text style={styles.summaryTitle}>
              Reputación general
            </Text>

            <Text style={styles.summaryIcon}>
              ⭐
            </Text>

            <Text style={styles.averageText}>
              {promedioMostrado}
              {resumen.promedio !== null
                ? ' / 5'
                : ''}
            </Text>

            <Text style={styles.summaryDescription}>

              {resumen.cantidad === 1
                ? 'Basado en 1 valoración recibida'
                : `Basado en ${resumen.cantidad} valoraciones recibidas`}

            </Text>

          </View>


          {/* ======================================== */}
          {/* LISTADO DE VALORACIONES */}
          {/* ======================================== */}

          <Text style={styles.sectionTitle}>
            Mis valoraciones
          </Text>


          {calificaciones.length === 0 ? (

            // ======================================
            // SIN CALIFICACIONES
            // ======================================

            <View style={styles.emptyCard}>

              <Text style={styles.emptyIcon}>
                ☆
              </Text>

              <Text style={styles.emptyTitle}>
                Todavía no recibiste valoraciones
              </Text>

              <Text style={styles.emptyDescription}>
                Cuando completes actividades y las
                organizaciones califiquen tu
                participación, las valoraciones
                aparecerán en esta sección.
              </Text>

            </View>

          ) : (

            // ======================================
            // CALIFICACIONES RECIBIDAS
            // ======================================

            calificaciones.map(
              (calificacion) => (

                <View
                  key={calificacion.id_calificacion}
                  style={styles.ratingCard}
                >

                  {/* ORGANIZACIÓN */}

                  <Text style={styles.organizationName}>
                    {calificacion.organizacion_nombre}
                  </Text>


                  {/* ACTIVIDAD */}

                  <Text style={styles.opportunityText}>
                    Actividad: {calificacion.oportunidad_titulo}
                  </Text>


                  {/* ESTRELLAS */}

                  <View style={styles.ratingRow}>

                    <Text style={styles.stars}>
                      {mostrarEstrellas(
                        calificacion.puntuacion
                      )}
                    </Text>

                    <Text style={styles.ratingNumber}>
                      {calificacion.puntuacion}/5
                    </Text>

                  </View>


                  {/* COMENTARIO */}

                  {calificacion.comentario && (

                    <View style={styles.commentBox}>

                      <Text style={styles.commentText}>
                        {calificacion.comentario}
                      </Text>

                    </View>

                  )}


                  {/* FECHA */}

                  <Text style={styles.dateText}>

                    Calificado el{' '}
                    {new Date(
                      calificacion.creada_en
                    ).toLocaleDateString('es-AR')}

                  </Text>

                </View>

              )
            )

          )}

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
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF'
  },

  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#DDE5E2',
    elevation: 2
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

  summaryCard: {
    backgroundColor: '#EAF5F2',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#CFE4DE'
  },

  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#164C40'
  },

  summaryIcon: {
    fontSize: 45,
    marginTop: 14
  },

  averageText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#164C40',
    marginTop: 10,
    textAlign: 'center'
  },

  summaryDescription: {
    fontSize: 13,
    color: '#5F6B76',
    marginTop: 8,
    textAlign: 'center'
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#164C40',
    marginBottom: 14
  },

  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DDE5E2'
  },

  organizationName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#164C40'
  },

  opportunityText: {
    fontSize: 13,
    color: '#5F6B76',
    marginTop: 6
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 10
  },

  stars: {
    fontSize: 25,
    color: '#F5B301'
  },

  ratingNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#164C40'
  },

  commentBox: {
    backgroundColor: '#F6F8F7',
    padding: 14,
    borderRadius: 10,
    marginTop: 14
  },

  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 21
  },

  dateText: {
    fontSize: 12,
    color: '#7B8794',
    marginTop: 14
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDE5E2'
  },

  emptyIcon: {
    fontSize: 45,
    color: '#B8C2CC',
    marginBottom: 12
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#164C40',
    textAlign: 'center'
  },

  emptyDescription: {
    fontSize: 14,
    color: '#5F6B76',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 10
  }

});