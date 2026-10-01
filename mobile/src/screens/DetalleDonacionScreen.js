import React from 'react';

import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BASE_URL from '../config/api';


export default function DetalleDonacionScreen({
  donacion,
  loading,
  onVolver,
}) {

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


  const obtenerUrlImagen = (
    imagenUrl
  ) => {

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


  if (loading) {

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


        <ActivityIndicator
          size="large"
          color="#1F6F5C"
          style={styles.loader}
        />

      </View>

    );

  }


  if (!donacion) {

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


        <View style={styles.emptyCard}>

          <Text style={styles.emptyTitle}>
            Donación no disponible
          </Text>

          <Text style={styles.emptyText}>
            No fue posible consultar la información de esta donación.
          </Text>

        </View>

      </View>

    );

  }


  const imagenUrl =
    obtenerUrlImagen(
      donacion.imagen_url
    );


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


      <Text style={styles.title}>
        Detalle de donación
      </Text>


      <Text style={styles.subtitle}>
        Consultá la información registrada y el estado actual de tu ofrecimiento.
      </Text>


      <View style={styles.card}>

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


        <View style={styles.content}>

          <View style={styles.header}>

            <Text style={styles.category}>
              {donacion.categoria}
            </Text>


            <View style={styles.statusBadge}>

              <Text style={styles.statusText}>
                {obtenerEstadoMostrado(
                  donacion.estado
                )}
              </Text>

            </View>

          </View>


          <Text style={styles.label}>
            Organización destinataria
          </Text>

          <Text style={styles.valueStrong}>
            {donacion.organizacion}
          </Text>


          <View style={styles.separator} />


          <Text style={styles.label}>
            Descripción
          </Text>

          <Text style={styles.value}>
            {donacion.descripcion}
          </Text>


          <View style={styles.separator} />


          <Text style={styles.label}>
            Cantidad
          </Text>

          <Text style={styles.value}>
            {donacion.cantidad}{' '}
          </Text>

          <Text style={styles.label}>
            Unidad
            </Text>

        <Text style={styles.value}>
            {donacion.unidad}{' '}
          </Text>

          <Text style={styles.label}>
            Condición del bien
          </Text>

          <Text style={styles.value}>
            {donacion.condicion_bien}
          </Text>


          <Text style={styles.label}>
            Disponible desde
          </Text>

          <Text style={styles.value}>
            {formatearFecha(
              donacion.disponible_desde
            )}
          </Text>


          <View style={styles.separator} />


          <Text style={styles.label}>
            Ubicación aproximada
          </Text>

         {donacion.direccion ? (

              <Text style={styles.value}>
                {donacion.direccion}
              </Text>

            ) : (

              <Text style={styles.valueMuted}>
                No se indicó una ubicación.
              </Text>

            )}


          <View style={styles.separator} />


          <Text style={styles.label}>
            Fecha de registro
          </Text>

          <Text style={styles.value}>
            {formatearFecha(
              donacion.creada_en
            )}
          </Text>

           {/* ==================================================
                  MOTIVO DE RECHAZO
            ================================================== */}

            {donacion.estado === 'RECHAZADA' && (

              <View style={styles.rejectionCard}>

                <Text style={styles.rejectionTitle}>
                  Donación rechazada
                </Text>


                <Text style={styles.label}>
                  Motivo del rechazo
                </Text>

                <Text style={styles.value}>
                  {donacion.motivo_rechazo ||
                    'La organización no indicó un motivo adicional.'}
                </Text>

              </View>

            )} 
          {/* ==================================================
                DATOS DE COORDINACIÓN
            ================================================== */}

            {(
              donacion.estado === 'COORDINADA' ||
              donacion.estado === 'RECIBIDA'
            ) && (

              <View style={styles.coordinationCard}>

                <Text style={styles.coordinationTitle}>
                  Datos de coordinación
                </Text>


                <Text style={styles.label}>
                  Detalle acordado
                </Text>

                <Text style={styles.value}>
                  {donacion.detalle_coordinacion ||
                    'Sin información'}
                </Text>


                <Text style={styles.label}>
                  Teléfono de la organización
                </Text>

                <Text style={styles.valueStrong}>
                  {donacion.telefono_contacto ||
                    'Sin información'}
                </Text>


                <Text style={styles.coordinationHelp}>
                  Utilizá este contacto si necesitás comunicarte con la organización por alguna dificultad relacionada con la entrega.
                </Text>

              </View>

            )}

          {/* ==================================================
                  ESTADO FINAL
            ================================================== */}

            {donacion.estado === 'RECIBIDA' && (

              <View style={styles.finalStateCard}>

                <Text style={styles.finalStateTitle}>
                  Donación recibida
                </Text>

                <Text style={styles.finalStateText}>
                  La organización confirmó la recepción de la donación.
                  Este es el estado final del ofrecimiento.
                </Text>

              </View>

            )}

        </View>

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


    loader: {
      marginTop: 40,
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
      marginTop: 6,
      fontSize: 13,
      color: '#5F6B76',
      textAlign: 'center',
      lineHeight: 18,
    },


    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#E6F2EF',
      overflow: 'hidden',
    },


    image: {
      width: '100%',
      height: 200,
      backgroundColor: '#EEF4F2',
    },


    noImageContainer: {
      height: 100,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F6F9F8',
      borderBottomWidth: 1,
      borderBottomColor: '#E6F2EF',
    },


    noImageText: {
      fontSize: 12,
      color: '#7A8782',
    },


    content: {
      padding: 18,
    },


    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 18,
    },


    category: {
      flex: 1,
      fontSize: 19,
      fontWeight: 'bold',
      color: '#164C40',
    },


    statusBadge: {
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 12,
      backgroundColor: '#E6F2EF',
    },


    statusText: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#1F6F5C',
    },


    label: {
      marginTop: 10,
      fontSize: 11,
      fontWeight: 'bold',
      color: '#7A8782',
      textTransform: 'uppercase',
    },


    value: {
      marginTop: 3,
      fontSize: 14,
      color: '#344B45',
      lineHeight: 20,
    },


    valueStrong: {
      marginTop: 3,
      fontSize: 15,
      fontWeight: '600',
      color: '#164C40',
    },


    valueMuted: {
      marginTop: 3,
      fontSize: 13,
      color: '#7A8782',
    },


    separator: {
      marginTop: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#E6F2EF',
    },
    coordinationCard: {
  marginTop: 22,
  padding: 15,
  borderRadius: 12,
  backgroundColor: '#F6FAF8',
  borderWidth: 1,
  borderColor: '#DCEAE5',
},


coordinationTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#164C40',
  marginBottom: 5,
},


coordinationHelp: {
  marginTop: 12,
  fontSize: 11,
  lineHeight: 16,
  color: '#7A8782',
},
rejectionCard: {
  marginTop: 22,
  padding: 15,
  borderRadius: 12,
  backgroundColor: '#FFF6F6',
  borderWidth: 1,
  borderColor: '#F1D4D4',
},


rejectionTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#8A3A3A',
  marginBottom: 5,
},
finalStateCard: {
  marginTop: 16,
  padding: 15,
  borderRadius: 12,
  backgroundColor: '#F1F8F5',
  borderWidth: 1,
  borderColor: '#CFE3DA',
},


finalStateTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#164C40',
},


finalStateText: {
  marginTop: 6,
  fontSize: 13,
  lineHeight: 19,
  color: '#5F6B76',
},

  });