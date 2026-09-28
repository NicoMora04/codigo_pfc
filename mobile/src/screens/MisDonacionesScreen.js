import React from 'react';

import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BASE_URL from '../config/api';


export default function MisDonacionesScreen({
  donaciones = [],
  loading,
  estadoFiltro = null,
  onCambiarEstado,
  onVerDetalle,
  onVolver,
}) {

  const estados = [
    {
      valor: null,
      texto: 'Todas',
    },
    {
      valor: 'PENDIENTE',
      texto: 'Pendientes',
    },
    {
      valor: 'ACEPTADA',
      texto: 'Aceptadas',
    },
    {
      valor: 'RECHAZADA',
      texto: 'Rechazadas',
    },
    {
      valor: 'COORDINADA',
      texto: 'Coordinadas',
    },
    {
      valor: 'RECIBIDA',
      texto: 'Recibidas',
    },
  ];


  const obtenerEstadoMostrado = (estado) => {

    switch (estado) {

      case 'PENDIENTE':
        return 'Pendiente';

      case 'ACEPTADA':
        return 'Aceptada';

      case 'RECHAZADA':
        return 'Rechazada';

      case 'COORDINADA':
        return 'Coordinada';

      case 'RECIBIDA':
        return 'Recibida';

      default:
        return estado || 'Sin estado';

    }

  };


  const formatearFecha = (fecha) => {

    if (!fecha) {
      return 'Sin fecha';
    }


    const valor =
      new Date(fecha);


    if (
      Number.isNaN(
        valor.getTime()
      )
    ) {
      return fecha;
    }


    return valor.toLocaleDateString(
      'es-AR'
    );

  };


  const obtenerUrlImagen = (imagenUrl) => {

    if (!imagenUrl) {
      return null;
    }


    if (
      /^https?:\/\//i.test(
        imagenUrl
      )
    ) {
      return imagenUrl;
    }


    const origenBackend =
      BASE_URL.replace(
        /\/api\/?$/i,
        ''
      );


    return (
      `${origenBackend}${
        imagenUrl.startsWith('/')
          ? ''
          : '/'
      }${imagenUrl}`
    );

  };


  return (

    <View style={styles.container}>
        
        <TouchableOpacity
            style={
                styles.backButton
            }
            onPress={
                onVolver
            }
            activeOpacity={
                0.8
            }
            >

            <Text
                style={
                styles.backButtonText
                }
            >
                ← Volver a Donar
            </Text>

            </TouchableOpacity>

      <Text style={styles.title}>
        Mis donaciones
      </Text>


      <Text style={styles.subtitle}>
        Consultá los bienes y materiales que ofreciste y el estado actual de cada donación.
      </Text>


      <Text style={styles.filterTitle}>
        Filtrar por estado
      </Text>


      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={
          styles.filtersContainer
        }
      >

        {estados.map(
          (estado) => {

            const activo =
              estadoFiltro ===
              estado.valor;


            return (

              <TouchableOpacity
                key={
                  estado.valor ||
                  'TODAS'
                }
                style={[
                  styles.filterButton,
                  activo &&
                    styles.filterButtonActive,
                ]}
                onPress={() =>
                  onCambiarEstado(
                    estado.valor
                  )
                }
              >

                <Text
                  style={[
                    styles.filterButtonText,
                    activo &&
                      styles.filterButtonTextActive,
                  ]}
                >
                  {estado.texto}
                </Text>

              </TouchableOpacity>

            );

          }
        )}

      </ScrollView>


      {loading ? (

        <ActivityIndicator
          size="large"
          color="#1F6F5C"
          style={styles.loader}
        />

      ) : donaciones.length === 0 ? (

        <View style={styles.emptyCard}>

          <Text style={styles.emptyTitle}>
            No hay donaciones para mostrar
          </Text>


          <Text style={styles.emptyText}>
            {estadoFiltro
              ? 'No tenés donaciones con el estado seleccionado.'
              : 'Cuando registres una donación, aparecerá en esta sección.'}
          </Text>

        </View>

      ) : (

        donaciones.map(
          (donacion) => {

            const imagenUrl =
              obtenerUrlImagen(
                donacion.imagen_url
              );


            return (

              <View
                key={
                  donacion.id_donacion
                }
                style={styles.card}
              >

                {imagenUrl ? (

                  <Image
                    source={{
                      uri: imagenUrl,
                    }}
                    style={styles.image}
                    resizeMode="cover"
                  />

                ) : (

                  <View
                    style={
                      styles.noImageContainer
                    }
                  >

                    <Text
                      style={
                        styles.noImageText
                      }
                    >
                      Sin imagen adjunta
                    </Text>

                  </View>

                )}


                <View style={styles.cardContent}>

                  <View style={styles.cardHeader}>

                    <Text style={styles.cardTitle}>
                      {donacion.categoria}
                    </Text>


                    <View
                      style={
                        styles.statusBadge
                      }
                    >

                      <Text
                        style={
                          styles.statusText
                        }
                      >
                        {obtenerEstadoMostrado(
                          donacion.estado
                        )}
                      </Text>

                    </View>

                  </View>


                  <Text style={styles.organization}>
                    {donacion.organizacion}
                  </Text>


                  <Text style={styles.description}>
                    {donacion.descripcion}
                  </Text>


                  <View style={styles.infoBlock}>

                    <Text style={styles.infoText}>
                      Cantidad:{' '}
                      {donacion.cantidad}{' '}
                    </Text>


                    <Text style={styles.infoText}>
                      Condición:{' '}
                      {donacion.condicion_bien}
                    </Text>


                    <Text style={styles.infoText}>
                      Disponible desde:{' '}
                      {formatearFecha(
                        donacion.disponible_desde
                      )}
                    </Text>


                    {(
                      donacion.localidad ||
                      donacion.provincia
                    ) && (

                      <Text style={styles.infoText}>
                        Ubicación:{' '}
                        {[
                          donacion.localidad,
                          donacion.provincia,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </Text>

                    )}

                  </View>


                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() =>
                      onVerDetalle(
                        donacion.id_donacion
                      )
                    }
                  >

                    <Text
                      style={
                        styles.detailButtonText
                      }
                    >
                      Ver detalle
                    </Text>

                  </TouchableOpacity>

                </View>

              </View>

            );

          }
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

            backButton: {

        alignSelf:
            'flex-start',

        backgroundColor:
            '#FFFFFF',

        borderWidth:
            1,

        borderColor:
            '#1F6F5C',

        borderRadius:
            9,

        paddingVertical:
            9,

        paddingHorizontal:
            14,

        marginBottom:
            16,

        },


        backButtonText: {

        color:
            '#1F6F5C',

        fontSize:
            13,

        fontWeight:
            '600',

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
      marginBottom: 18,
      lineHeight: 18,
    },


    filterTitle: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#164C40',
      marginBottom: 8,
    },


    filtersContainer: {
      paddingBottom: 18,
      gap: 8,
    },


    filterButton: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#CFE2DD',
      backgroundColor: '#FFFFFF',
    },


    filterButtonActive: {
      backgroundColor: '#1F6F5C',
      borderColor: '#1F6F5C',
    },


    filterButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#1F6F5C',
    },


    filterButtonTextActive: {
      color: '#FFFFFF',
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
      marginBottom: 14,
      borderWidth: 1,
      borderColor: '#E6F2EF',
      overflow: 'hidden',
    },


    image: {
      width: '100%',
      height: 150,
      backgroundColor: '#EEF4F2',
    },


    noImageContainer: {
      height: 80,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F6F9F8',
      borderBottomWidth: 1,
      borderBottomColor: '#E6F2EF',
    },


    noImageText: {
      fontSize: 12,
      color: '#7A8782',
    },


    cardContent: {
      padding: 16,
    },


    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 10,
    },


    cardTitle: {
      flex: 1,
      fontSize: 17,
      fontWeight: 'bold',
      color: '#164C40',
    },


    statusBadge: {
      paddingVertical: 5,
      paddingHorizontal: 9,
      borderRadius: 12,
      backgroundColor: '#E6F2EF',
    },


    statusText: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#1F6F5C',
    },


    organization: {
      fontSize: 13,
      fontWeight: '600',
      color: '#344B45',
      marginTop: 5,
    },


    description: {
      fontSize: 13,
      color: '#5F6B76',
      lineHeight: 18,
      marginTop: 10,
    },


    infoBlock: {
      marginTop: 12,
      gap: 4,
    },


    infoText: {
      fontSize: 12,
      color: '#5F6B76',
    },


    detailButton: {
      marginTop: 14,
      backgroundColor: '#1F6F5C',
      borderRadius: 10,
      paddingVertical: 11,
      alignItems: 'center',
    },


    detailButtonText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: 'bold',
    },

  });