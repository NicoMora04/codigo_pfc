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
  onBuscar,
  onMisInscripciones,
  onVerDetalle,
  onLogout,
}) {

  const oportunidadesDestacadas =
    oportunidades.slice(
      0,
      3
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
      {/* ACCESOS RÁPIDOS */}
      {/* ================================================= */}

      <Text style={styles.sectionTitle}>
        Accesos rápidos
      </Text>


      <View style={styles.quickActions}>


        <TouchableOpacity
          style={styles.quickCard}
          onPress={
            onBuscar
          }
        >

          <Text style={styles.quickIcon}>
            🔍
          </Text>

          <Text style={styles.quickTitle}>
            Buscar
          </Text>

          <Text style={styles.quickText}>
            Usá filtros, ubicación y radio de búsqueda.
          </Text>

        </TouchableOpacity>


        <TouchableOpacity
          style={styles.quickCard}
          onPress={
            onMisInscripciones
          }
        >

          <Text style={styles.quickIcon}>
            📋
          </Text>

          <Text style={styles.quickTitle}>
            Mis inscripciones
          </Text>

          <Text style={styles.quickText}>
            Consultá las actividades en las que te inscribiste.
          </Text>

        </TouchableOpacity>

      </View>


      {/* ================================================= */}
      {/* DESTACADAS */}
      {/* ================================================= */}

      {oportunidadesDestacadas.length > 0 && (

        <View style={styles.featuredSection}>

          <Text style={styles.sectionTitle}>
            Algunas oportunidades
          </Text>


          <Text style={styles.sectionSubtitle}>
            Explorá algunas de las actividades disponibles.
          </Text>


          {oportunidadesDestacadas.map(
            (
              oportunidad
            ) => (

              <View
                key={
                  oportunidad.id_oportunidad
                }
                style={styles.opportunityCard}
              >

                <Text style={styles.opportunityTitle}>
                  {oportunidad.titulo}
                </Text>


                {!!oportunidad.organizacion && (

                  <Text style={styles.organization}>
                    {oportunidad.organizacion}
                  </Text>

                )}


                {!!oportunidad.tipo_actividad && (

                  <Text style={styles.infoText}>
                    {oportunidad.tipo_actividad}
                  </Text>

                )}


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

                    Inicio:{' '}

                    {new Date(
                      oportunidad.fecha_inicio
                    ).toLocaleDateString(
                      'es-AR'
                    )}

                  </Text>

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
          )}

        </View>

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


    header: {

      marginBottom: 18,

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


    quickActions: {

      flexDirection: 'row',

      gap: 10,

      marginTop: 8,
      marginBottom: 22,

    },


    quickCard: {

      flex: 1,

      backgroundColor: '#FFFFFF',

      borderRadius: 14,

      padding: 14,

      borderWidth: 1,
      borderColor: '#DDE5E2',

    },


    quickIcon: {

      fontSize: 24,

      marginBottom: 8,

    },


    quickTitle: {

      fontSize: 14,
      fontWeight: '700',
      color: '#164C40',

    },


    quickText: {

      fontSize: 11,
      color: '#5F6B76',

      lineHeight: 16,

      marginTop: 4,

    },


    featuredSection: {

      marginBottom: 20,

    },


    opportunityCard: {

      backgroundColor: '#FFFFFF',

      borderRadius: 14,

      padding: 15,

      marginTop: 10,

      borderWidth: 1,
      borderColor: '#DDE5E2',

    },


    opportunityTitle: {

      fontSize: 16,
      fontWeight: '700',
      color: '#164C40',

    },


    organization: {

      fontSize: 13,
      fontWeight: '600',
      color: '#1F6F5C',

      marginTop: 4,

    },


    infoText: {

      fontSize: 12,
      color: '#5F6B76',

      marginTop: 5,

    },


    detailButton: {

      backgroundColor: '#1F6F5C',

      borderRadius: 10,

      paddingVertical: 9,
      paddingHorizontal: 12,

      alignItems: 'center',

      marginTop: 12,

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

    },


    emptyText: {

      fontSize: 12,
      color: '#5F6B76',

      textAlign: 'center',

      lineHeight: 17,

      marginTop: 5,

    },

  });