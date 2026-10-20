import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import MapaLeaflet
  from '../components/MapaLeaflet';


export default function InicioVoluntarioScreen({
  oportunidades = [],
  loading,

  recomendaciones = [],
  loadingRecomendaciones,
  recomendacionesCargadas,
  ubicacionRecomendaciones,
  onUsarUbicacion,

  onBuscar,
  onVerDetalle,
  onLogout,
}) {

  // ======================================================
  // TOP DE RECOMENDACIONES
  // ======================================================

  const recomendacionesDestacadas =
    recomendaciones.slice(
      0,
      5
    );

  return (

    <View style={styles.container}>


      {/* ================================================= */}
      {/* ENCABEZADO */}
      {/* ================================================= */}

      <View style={styles.header}>

        <View style={styles.headerTextContainer}>

          <Text style={styles.title}>
            Inicio
          </Text>


          <Text style={styles.subtitle}>
            Descubrí oportunidades de voluntariado y encontrá dónde podés ayudar.
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
      {/* BIENVENIDA */}
      {/* ================================================= */}

      <View style={styles.welcomeCard}>

        <Text style={styles.welcomeTitle}>
          Encontrá una oportunidad para colaborar
        </Text>


        <Text style={styles.welcomeText}>
          Explorá las actividades disponibles, consultá su ubicación y elegí cómo participar.
        </Text>


        <TouchableOpacity
          style={styles.primaryButton}
          onPress={
            onBuscar
          }
        >

          <Text style={styles.primaryButtonText}>
            Buscar oportunidades
          </Text>

        </TouchableOpacity>

      </View>


      {/* ================================================= */}
      {/* MAPA GENERAL */}
      {/* ================================================= */}

      <View style={styles.mapSection}>

        <Text style={styles.sectionTitle}>
          Oportunidades disponibles
        </Text>


        <Text style={styles.sectionSubtitle}>
          Estas son las oportunidades publicadas actualmente.
        </Text>


        {loading ? (

          <ActivityIndicator
            size="large"
            color="#1F6F5C"
            style={styles.loader}
          />

        ) : oportunidades.length > 0 ? (

          <>

            <MapaLeaflet

              oportunidades={
                oportunidades
              }

              onVerDetalle={
                onVerDetalle
              }

            />


            <View style={styles.mapLegend}>

              <View style={styles.legendItem}>

                <View style={styles.opportunityMarker} />

                <Text style={styles.legendText}>
                  Oportunidad
                </Text>

              </View>


              <View style={styles.legendItem}>

                <View style={styles.approximateMarker} />

                <Text style={styles.legendText}>
                  Zona aproximada
                </Text>

              </View>

            </View>

          </>

        ) : (

          <View style={styles.emptyCard}>

            <Text style={styles.emptyTitle}>
              No hay oportunidades disponibles
            </Text>


            <Text style={styles.emptyText}>
              Cuando una organización publique una nueva actividad, aparecerá en este mapa.
            </Text>

          </View>

        )}

      </View>


      {/* ================================================= */}
      {/* RECOMENDACIONES */}
      {/* ACTIVIDAD 3.1.2 */}
      {/* ================================================= */}

      <View style={styles.recommendationSection}>

        <View style={styles.recommendationHeader}>

          <View style={styles.recommendationHeaderText}>

            <Text style={styles.sectionTitle}>
              Recomendadas para vos
            </Text>


            <Text style={styles.sectionSubtitle}>
              Ordenadas según tus intereses, participación previa, urgencia y disponibilidad.
            </Text>

          </View>

        </View>


        {/* =============================================== */}
        {/* UBICACIÓN PARA RECOMENDACIONES */}
        {/* =============================================== */}

        <View style={styles.locationCard}>

          <View style={styles.locationInfo}>

            <Text style={styles.locationIcon}>
              📍
            </Text>


            <View style={styles.locationTextContainer}>

              <Text style={styles.locationTitle}>

                {ubicacionRecomendaciones

                  ? 'Ubicación activada'

                  : 'Mejorar recomendaciones'}

              </Text>


              <Text style={styles.locationDescription}>

                {ubicacionRecomendaciones

                  ? 'También se tiene en cuenta la cercanía dentro de un radio de 25 km.'

                  : 'Podés usar tu ubicación para priorizar oportunidades cercanas.'}

              </Text>

            </View>

          </View>


          {!ubicacionRecomendaciones && (

            <TouchableOpacity
              style={styles.locationButton}
              onPress={
                onUsarUbicacion
              }
              disabled={
                loadingRecomendaciones
              }
            >

              <Text style={styles.locationButtonText}>
                Usar mi ubicación
              </Text>

            </TouchableOpacity>

          )}

        </View>


        {/* =============================================== */}
        {/* CARGANDO */}
        {/* =============================================== */}

        {(
            loadingRecomendaciones ||
            !recomendacionesCargadas
          ) ? (

          <View style={styles.recommendationLoading}>

            <ActivityIndicator
              size="small"
              color="#1F6F5C"
            />


            <Text style={styles.loadingText}>
              Actualizando recomendaciones...
            </Text>

          </View>

        ) : recomendacionesDestacadas.length > 0 ? (

          /* ============================================= */
          /* TARJETAS DE RECOMENDACIONES */
          /* ============================================= */

          recomendacionesDestacadas.map(
            (
              oportunidad,
              index
            ) => (

              <View
                key={
                  oportunidad.id_oportunidad
                }
                style={styles.opportunityCard}
              >

                <View style={styles.cardTopRow}>

                  <View style={styles.cardPositionBadge}>

                    <Text style={styles.cardPositionText}>
                      #{index + 1}
                    </Text>

                  </View>


                  <View style={styles.scoreBadge}>

                    <Text style={styles.scoreText}>
                      {Math.round(
                        Number(
                          oportunidad.puntaje
                        ) || 0
                      )}%
                    </Text>

                    <Text style={styles.scoreLabel}>
                      afinidad
                    </Text>

                  </View>

                </View>


                <Text style={styles.opportunityTitle}>
                  {oportunidad.titulo}
                </Text>


                {!!oportunidad.organizacion && (

                  <Text style={styles.organization}>
                    {oportunidad.organizacion}
                  </Text>

                )}


                <View style={styles.metaContainer}>

                  {!!oportunidad.tipo_actividad && (

                    <View style={styles.metaChip}>

                      <Text style={styles.metaChipText}>
                        {oportunidad.tipo_actividad}
                      </Text>

                    </View>

                  )}


                  {!!oportunidad.urgencia && (

                    <View style={styles.metaChip}>

                      <Text style={styles.metaChipText}>
                        Urgencia {oportunidad.urgencia.toLowerCase()}
                      </Text>

                    </View>

                  )}

                </View>


                {(oportunidad.localidad ||
                  oportunidad.provincia) && (

                  <Text style={styles.infoText}>

                    📍{' '}

                    {[
                      oportunidad.localidad,
                      oportunidad.provincia
                    ]
                      .filter(Boolean)
                      .join(', ')}

                  </Text>

                )}


                {!!oportunidad.fecha_inicio && (

                  <Text style={styles.infoText}>

                    📅 Inicio:{' '}

                    {new Date(
                      oportunidad.fecha_inicio
                    ).toLocaleDateString(
                      'es-AR'
                    )}

                  </Text>

                )}


                {oportunidad.cupos_disponibles != null && (

                  <Text style={styles.infoText}>

                    👥 Cupos disponibles:{' '}

                    {oportunidad.cupos_disponibles}

                  </Text>

                )}


                {/* ======================================= */}
                {/* EXPLICACIÓN DEL ALGORITMO */}
                {/* ======================================= */}

                {Array.isArray(
                  oportunidad.razones
                ) &&
                  oportunidad.razones.length > 0 && (

                  <View style={styles.reasonsContainer}>

                    <Text style={styles.reasonsTitle}>
                      ¿Por qué te la recomendamos?
                    </Text>


                    {oportunidad.razones.map(
                      (
                        razon,
                        razonIndex
                      ) => (

                        <View
                          key={
                            `${oportunidad.id_oportunidad}-${razonIndex}`
                          }
                          style={styles.reasonRow}
                        >

                          <Text style={styles.reasonCheck}>
                            ✓
                          </Text>


                          <Text style={styles.reasonText}>
                            {razon}
                          </Text>

                        </View>

                      )
                    )}

                  </View>

                )}


                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() =>
                    onVerDetalle(
                      oportunidad.id_oportunidad
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

        ) : (

          /* ============================================= */
          /* SIN RECOMENDACIONES */
          /* ============================================= */

          <View style={styles.emptyRecommendationCard}>

            <Text style={styles.emptyRecommendationIcon}>
              🤝
            </Text>


            <Text style={styles.emptyTitle}>
              No encontramos recomendaciones por ahora
            </Text>


            <Text style={styles.emptyText}>
              Cuando haya nuevas oportunidades compatibles con tu perfil, aparecerán acá.
            </Text>


            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={
                onBuscar
              }
            >

              <Text style={styles.secondaryButtonText}>
                Explorar oportunidades
              </Text>

            </TouchableOpacity>

          </View>

        )}

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


    headerTextContainer: {

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

    },


    welcomeCard: {

      backgroundColor: '#EAF5F2',

      borderRadius: 18,

      padding: 18,

      marginBottom: 18,

      borderWidth: 1,
      borderColor: '#CFE4DE',

    },


    welcomeTitle: {

      fontSize: 20,
      fontWeight: '700',
      color: '#164C40',

    },


    welcomeText: {

      fontSize: 13,
      color: '#5F6B76',

      lineHeight: 19,

      marginTop: 6,

    },


    primaryButton: {

      backgroundColor: '#1F6F5C',

      borderRadius: 12,

      paddingVertical: 12,
      paddingHorizontal: 16,

      alignSelf: 'flex-start',

      marginTop: 14,

    },


    primaryButtonText: {

      color: '#FFFFFF',

      fontWeight: '700',

      fontSize: 13,

    },


    mapSection: {

      backgroundColor: '#FFFFFF',

      borderRadius: 16,

      padding: 16,

      marginBottom: 20,

      borderWidth: 1,
      borderColor: '#DDE5E2',

    },


    sectionTitle: {

      fontSize: 18,
      fontWeight: '700',
      color: '#164C40',

      marginBottom: 4,

    },


    sectionSubtitle: {

      fontSize: 12,
      color: '#5F6B76',

      lineHeight: 17,

      marginBottom: 12,

    },


    loader: {

      marginVertical: 30,

    },


    mapLegend: {

      marginTop: 12,

      flexDirection: 'row',
      flexWrap: 'wrap',

      gap: 16,

    },


    legendItem: {

      flexDirection: 'row',

      alignItems: 'center',

      gap: 6,

    },


    opportunityMarker: {

      width: 12,
      height: 12,

      borderRadius: 6,

      backgroundColor: '#1F6F5C',

    },


    approximateMarker: {

      width: 12,
      height: 12,

      borderRadius: 6,

      backgroundColor: '#F59E0B',

    },


    legendText: {

      fontSize: 11,
      color: '#5F6B76',

    },


    recommendationSection: {

      marginBottom: 26,

    },


    recommendationHeader: {

      marginBottom: 4,

    },


    recommendationHeaderText: {

      flex: 1,

    },


    locationCard: {

      backgroundColor: '#F4F9F7',

      borderRadius: 14,

      padding: 14,

      marginBottom: 12,

      borderWidth: 1,
      borderColor: '#CFE4DE',

    },


    locationInfo: {

      flexDirection: 'row',

      alignItems: 'flex-start',

    },


    locationIcon: {

      fontSize: 22,

      marginRight: 10,

    },


    locationTextContainer: {

      flex: 1,

    },


    locationTitle: {

      fontSize: 14,
      fontWeight: '700',

      color: '#164C40',

    },


    locationDescription: {

      fontSize: 12,
      color: '#5F6B76',

      lineHeight: 17,

      marginTop: 3,

    },


    locationButton: {

      backgroundColor: '#1F6F5C',

      borderRadius: 10,

      paddingVertical: 10,
      paddingHorizontal: 14,

      alignItems: 'center',

      marginTop: 12,

    },


    locationButtonText: {

      color: '#FFFFFF',

      fontWeight: '700',

      fontSize: 12,

    },


    recommendationLoading: {

      backgroundColor: '#FFFFFF',

      borderRadius: 14,

      padding: 20,

      borderWidth: 1,
      borderColor: '#DDE5E2',

      alignItems: 'center',

    },


    loadingText: {

      color: '#5F6B76',

      fontSize: 12,

      marginTop: 8,

    },


    opportunityCard: {

      backgroundColor: '#FFFFFF',

      borderRadius: 16,

      padding: 16,

      marginBottom: 12,

      borderWidth: 1,
      borderColor: '#DDE5E2',

      elevation: 1,

      shadowColor: '#164C40',

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.06,

      shadowRadius: 4,

    },


    cardTopRow: {

      flexDirection: 'row',

      justifyContent: 'space-between',

      alignItems: 'center',

      marginBottom: 10,

    },


    cardPositionBadge: {

      backgroundColor: '#EAF5F2',

      borderRadius: 20,

      paddingHorizontal: 10,
      paddingVertical: 5,

    },


    cardPositionText: {

      fontSize: 12,

      fontWeight: '700',

      color: '#1F6F5C',

    },


    scoreBadge: {

      flexDirection: 'row',

      alignItems: 'baseline',

      gap: 4,

    },


    scoreText: {

      fontSize: 18,

      fontWeight: '800',

      color: '#1F6F5C',

    },


    scoreLabel: {

      fontSize: 10,

      color: '#5F6B76',

    },


    opportunityTitle: {

      fontSize: 17,
      fontWeight: '700',
      color: '#164C40',

    },


    organization: {

      fontSize: 13,
      fontWeight: '600',
      color: '#1F6F5C',

      marginTop: 4,

    },


    metaContainer: {

      flexDirection: 'row',

      flexWrap: 'wrap',

      gap: 6,

      marginTop: 10,

      marginBottom: 2,

    },


    metaChip: {

      backgroundColor: '#EAF5F2',

      borderRadius: 14,

      paddingHorizontal: 9,
      paddingVertical: 5,

    },


    metaChipText: {

      fontSize: 10,

      color: '#164C40',

      fontWeight: '600',

    },


    infoText: {

      fontSize: 12,
      color: '#5F6B76',

      marginTop: 6,

    },


    reasonsContainer: {

      backgroundColor: '#F7FAF9',

      borderRadius: 12,

      padding: 12,

      marginTop: 14,

    },


    reasonsTitle: {

      fontSize: 12,

      fontWeight: '700',

      color: '#164C40',

      marginBottom: 7,

    },


    reasonRow: {

      flexDirection: 'row',

      alignItems: 'flex-start',

      marginTop: 4,

    },


    reasonCheck: {

      color: '#1F6F5C',

      fontWeight: '700',

      marginRight: 7,

    },


    reasonText: {

      flex: 1,

      fontSize: 11,

      color: '#5F6B76',

      lineHeight: 16,

    },


    detailButton: {

      backgroundColor: '#1F6F5C',

      borderRadius: 10,

      paddingVertical: 10,
      paddingHorizontal: 12,

      alignItems: 'center',

      marginTop: 14,

    },


    detailButtonText: {

      color: '#FFFFFF',

      fontWeight: '700',

      fontSize: 12,

    },


    emptyCard: {

      paddingVertical: 30,

      alignItems: 'center',

    },


    emptyTitle: {

      fontSize: 15,
      fontWeight: '700',
      color: '#164C40',

      textAlign: 'center',

    },


    emptyText: {

      fontSize: 12,
      color: '#5F6B76',

      textAlign: 'center',

      lineHeight: 17,

      marginTop: 5,

    },


    emptyRecommendationCard: {

      backgroundColor: '#FFFFFF',

      borderRadius: 16,

      padding: 22,

      borderWidth: 1,
      borderColor: '#DDE5E2',

      alignItems: 'center',

    },


    emptyRecommendationIcon: {

      fontSize: 34,

      marginBottom: 10,

    },


    secondaryButton: {

      borderWidth: 1,
      borderColor: '#1F6F5C',

      borderRadius: 10,

      paddingVertical: 10,
      paddingHorizontal: 16,

      marginTop: 16,

    },


    secondaryButtonText: {

      color: '#1F6F5C',

      fontSize: 12,

      fontWeight: '700',

    },

  });