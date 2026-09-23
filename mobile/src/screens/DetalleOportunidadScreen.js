import React from 'react';

import MapaLeaflet from '../components/MapaLeaflet';

import {
  obtenerRuta
} from '../services/rutaService';



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
  onInscribirse,
  estadoUbicacion,
  estadoInscripcion,

}) {

  // =====================================================
  // ESTADOS DE RUTEO
  // =====================================================

  const [
    ruta,
    setRuta
  ] =
    React.useState(
      null
    );


  const [
    calculandoRuta,
    setCalculandoRuta
  ] =
    React.useState(
      false
    );


  const [
    errorRuta,
    setErrorRuta
  ] =
    React.useState(
      ''
    );


  const [
    perfilRuta,
    setPerfilRuta
  ] =
    React.useState(
      'driving-car'
    );


  // =====================================================
  // BLOQUEOS DE RUTEO
  // =====================================================

  const calculoRutaEnCurso =
    React.useRef(
      false
    );


  const ultimaRutaCalculada =
    React.useRef(
      null
    );


  // =====================================================
  // UBICACIÓN DE REFERENCIA
  // =====================================================

  const modoUbicacion =
    estadoUbicacion
      ?.modoUbicacion ??
    null;


  let ubicacionUsuario =
    null;


  if (
    modoUbicacion ===
      'GPS' &&
    estadoUbicacion
      ?.ubicacionActual
  ) {

    ubicacionUsuario =
      estadoUbicacion
        .ubicacionActual;

  }


  if (
    modoUbicacion ===
      'MANUAL' &&
    estadoUbicacion
      ?.ubicacionManualSeleccionada
  ) {

    ubicacionUsuario =
      estadoUbicacion
        .ubicacionManualSeleccionada;

  }


  // =====================================================
  // INVALIDAR RUTA SI CAMBIA LA UBICACIÓN
  // =====================================================

  React.useEffect(() => {

    setRuta(
      null
    );

    setErrorRuta(
      ''
    );


    ultimaRutaCalculada.current =
      null;

  }, [

    modoUbicacion,

    ubicacionUsuario
      ?.latitud,

    ubicacionUsuario
      ?.longitud,

  ]);


  // =====================================================
  // CARGANDO
  // =====================================================

  if (
    loading
  ) {

    return (

      <View style={styles.container}>

        <ActivityIndicator
          size="large"
          color="#1F6F5C"
        />

      </View>

    );

  }


  // =====================================================
  // SIN OPORTUNIDAD
  // =====================================================

  if (
    !oportunidad
  ) {

    return (

      <View style={styles.container}>

        <Text style={styles.emptyTitle}>
          No se pudo cargar la oportunidad
        </Text>


        <TouchableOpacity
          style={styles.backButton}
          onPress={
            onVolver
          }
        >

          <Text style={styles.backButtonText}>
            Volver
          </Text>

        </TouchableOpacity>

      </View>

    );

  }


  // =====================================================
  // UBICACIÓN OPORTUNIDAD
  // =====================================================

  const ubicacion = [

    oportunidad.direccion,

    oportunidad.localidad,

    oportunidad.provincia,

  ]
    .filter(Boolean)
    .join(', ');


  // =====================================================
  // DISTANCIA HAVERSINE
  // =====================================================

  const calcularDistanciaKm = (
    latitud1,
    longitud1,
    latitud2,
    longitud2
  ) => {

    const radioTierraKm =
      6371;


    const convertirARadianes =
      (grados) =>
        grados *
        Math.PI /
        180;


    const diferenciaLatitud =
      convertirARadianes(
        latitud2 -
        latitud1
      );


    const diferenciaLongitud =
      convertirARadianes(
        longitud2 -
        longitud1
      );


    const latitud1Rad =
      convertirARadianes(
        latitud1
      );


    const latitud2Rad =
      convertirARadianes(
        latitud2
      );


    const a =

      Math.sin(
        diferenciaLatitud /
        2
      ) ** 2 +

      Math.cos(
        latitud1Rad
      ) *

      Math.cos(
        latitud2Rad
      ) *

      Math.sin(
        diferenciaLongitud /
        2
      ) ** 2;


    const c =

      2 *

      Math.atan2(

        Math.sqrt(
          a
        ),

        Math.sqrt(
          1 - a
        )

      );


    return (
      radioTierraKm *
      c
    );

  };


  // =====================================================
  // DISTANCIA
  // =====================================================

  let distanciaKm =
    null;


  if (
    ubicacionUsuario &&
    oportunidad.latitud !=
      null &&
    oportunidad.longitud !=
      null
  ) {

    distanciaKm =
      calcularDistanciaKm(

        Number(
          ubicacionUsuario
            .latitud
        ),

        Number(
          ubicacionUsuario
            .longitud
        ),

        Number(
          oportunidad
            .latitud
        ),

        Number(
          oportunidad
            .longitud
        )

      );

  }


  // =====================================================
  // CAMBIAR PERFIL
  // =====================================================

  const cambiarPerfilRuta = (
    nuevoPerfil
  ) => {

    if (
      calculoRutaEnCurso
        .current
    ) {

      return;

    }


    if (
      nuevoPerfil ===
      perfilRuta
    ) {

      return;

    }


    setPerfilRuta(
      nuevoPerfil
    );


    setRuta(
      null
    );


    setErrorRuta(
      ''
    );


    ultimaRutaCalculada.current =
      null;

  };


  // =====================================================
  // NOMBRE PERFIL
  // =====================================================

  const obtenerNombrePerfil =
    () => {

      if (
        perfilRuta ===
        'foot-walking'
      ) {

        return 'Caminando';

      }


      if (
        perfilRuta ===
        'cycling-regular'
      ) {

        return 'Bicicleta';

      }


      return 'Auto';

    };


  // =====================================================
  // CALCULAR RUTA
  // =====================================================

  const calcularRuta =
    async () => {

      if (
        !ubicacionUsuario ||
        oportunidad?.latitud ==
          null ||
        oportunidad?.longitud ==
          null
      ) {

        setErrorRuta(
          'No hay una ubicación válida para calcular la ruta.'
        );

        return;

      }


      const claveRuta = [

        Number(
          ubicacionUsuario
            .latitud
        ),

        Number(
          ubicacionUsuario
            .longitud
        ),

        Number(
          oportunidad
            .latitud
        ),

        Number(
          oportunidad
            .longitud
        ),

        perfilRuta,

      ].join('|');


      // =================================================
      // EVITAR RECALCULAR LA MISMA RUTA
      // =================================================

      if (
        ruta &&
        ultimaRutaCalculada
          .current ===
          claveRuta
      ) {

        console.log(
          'CALCULO IGNORADO: LA RUTA YA FUE CALCULADA'
        );

        return;

      }


      // =================================================
      // EVITAR SOLICITUDES SIMULTÁNEAS
      // =================================================

      if (
        calculoRutaEnCurso
          .current
      ) {

        console.log(
          'CALCULO IGNORADO: YA HAY UNO EN CURSO'
        );

        return;

      }


      try {

        calculoRutaEnCurso.current =
          true;


        setCalculandoRuta(
          true
        );


        setErrorRuta(
          ''
        );


        setRuta(
          null
        );


        console.log(
          'INICIANDO CALCULO DE RUTA'
        );


        const resultado =
          await obtenerRuta(

            ubicacionUsuario,

            {

              latitud:
                oportunidad
                  .latitud,

              longitud:
                oportunidad
                  .longitud,

            },

            perfilRuta

          );


        setRuta(
          resultado
        );


        ultimaRutaCalculada.current =
          claveRuta;

      }
      catch (
        error
      ) {

        console.log(
          'ERROR ORS:',
          error
        );


        setErrorRuta(

          error?.message ||

          'No se pudo calcular la ruta.'

        );

      }
      finally {

        calculoRutaEnCurso.current =
          false;


        setCalculandoRuta(
          false
        );

      }

    };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <View style={styles.container}>


      <TouchableOpacity
        style={styles.backButton}
        onPress={
          onVolver
        }
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
          Cupos
        </Text>

        <Text style={styles.text}>
          Ocupados:{' '}
          {oportunidad.cupos_ocupados ?? 0}
          {' / '}
          {oportunidad.cupo_total}
        </Text>

        <Text style={styles.text}>
          Disponibles:{' '}
          {oportunidad.cupos_disponibles ??
            oportunidad.cupo_total}
        </Text>


        <Text style={styles.sectionTitle}>
          Inicio
        </Text>


        <Text style={styles.text}>

          {new Date(
            oportunidad.fecha_inicio
          ).toLocaleString(
            'es-AR'
          )}

        </Text>


        <Text style={styles.sectionTitle}>
          Fin previsto
        </Text>


        <Text style={styles.text}>

          {new Date(
            oportunidad.fecha_fin
          ).toLocaleString(
            'es-AR'
          )}

        </Text>


        <Text style={styles.sectionTitle}>
          Ubicación
        </Text>


        <Text style={styles.text}>
          {ubicacion ||
            'Ubicación no especificada.'}
        </Text>


        {estadoInscripcion ? (

            <View style={styles.enrollmentStatusCard}>

              <Text style={styles.enrollmentStatusTitle}>
                Estado de mi inscripción
              </Text>

              <Text style={styles.enrollmentStatusValue}>
                {estadoInscripcion}
              </Text>

              <Text style={styles.enrollmentStatusDescription}>
                {estadoInscripcion === 'PENDIENTE'
                  ? 'Tu solicitud está esperando la respuesta de la organización.'
                  : estadoInscripcion === 'ACEPTADA'
                    ? 'Tu inscripción fue aceptada por la organización.'
                    : estadoInscripcion === 'RECHAZADA'
                      ? 'Tu solicitud de inscripción no fue aceptada.'
                      : estadoInscripcion === 'CANCELADA'
                        ? 'Esta inscripción fue cancelada.'
                        : estadoInscripcion === 'COMPLETADA'
                          ? 'Completaste esta actividad.'
                          : estadoInscripcion === 'AUSENTE'
                            ? 'La inscripción fue registrada como ausente.'
                            : 'Consultá el estado actual de tu inscripción.'}
              </Text>

            </View>

          ) : (

             oportunidad.cupos_disponibles === 0 ? (

              <View style={styles.noCapacityButton}>
                <Text style={styles.noCapacityButtonText}>
                  Sin cupos disponibles
                </Text>
              </View>

            ) : (

              <TouchableOpacity
                style={styles.inscriptionButton}
                onPress={() =>
                  onInscribirse(
                    oportunidad.id_oportunidad
                  )
                }
                activeOpacity={0.8}
              >
                <Text style={styles.inscriptionButtonText}>
                  Inscribirme
                </Text>
              </TouchableOpacity>

            )

          )}


        {/* ================================================= */}
        {/* DISTANCIA */}
        {/* ================================================= */}

        {distanciaKm !=
          null && (

          <View style={styles.distanceCard}>

            <Text style={styles.distanceLabel}>
              Distancia desde tu referencia
            </Text>


            <Text style={styles.distanceValue}>

              {distanciaKm <
                1

                ? `${Math.round(
                    distanciaKm *
                    1000
                  )} m`

                : `${distanciaKm.toFixed(
                    1
                  )} km`}

            </Text>


            {Number(
              oportunidad
                .radio_km
            ) > 0 && (

              <Text style={styles.distanceNote}>
                Distancia calculada hasta el centro de la zona aproximada.
              </Text>

            )}

          </View>

        )}


        {/* ================================================= */}
        {/* RUTA */}
        {/* ================================================= */}

        {ubicacionUsuario && (

          <View style={styles.routeCard}>

            <Text style={styles.routeTitle}>
              Ruta hasta la oportunidad
            </Text>


            <Text style={styles.routeDescription}>
              Elegí cómo querés llegar y calculá la distancia por ruta y el tiempo estimado.
            </Text>


            <View style={styles.routeModes}>


              <TouchableOpacity
                style={[

                  styles.routeModeButton,

                  perfilRuta ===
                    'driving-car' &&
                    styles.routeModeButtonActive,

                  calculandoRuta &&
                    styles.routeModeButtonDisabled,

                ]}
                onPress={() =>
                  cambiarPerfilRuta(
                    'driving-car'
                  )
                }
                disabled={
                  calculandoRuta
                }
              >

                <Text
                  style={[
                    styles.routeModeText,

                    perfilRuta ===
                      'driving-car' &&
                      styles.routeModeTextActive
                  ]}
                >
                  🚗 Auto
                </Text>

              </TouchableOpacity>


              <TouchableOpacity
                style={[

                  styles.routeModeButton,

                  perfilRuta ===
                    'foot-walking' &&
                    styles.routeModeButtonActive,

                  calculandoRuta &&
                    styles.routeModeButtonDisabled,

                ]}
                onPress={() =>
                  cambiarPerfilRuta(
                    'foot-walking'
                  )
                }
                disabled={
                  calculandoRuta
                }
              >

                <Text
                  style={[
                    styles.routeModeText,

                    perfilRuta ===
                      'foot-walking' &&
                      styles.routeModeTextActive
                  ]}
                >
                  🚶 Caminando
                </Text>

              </TouchableOpacity>


              <TouchableOpacity
                style={[

                  styles.routeModeButton,

                  perfilRuta ===
                    'cycling-regular' &&
                    styles.routeModeButtonActive,

                  calculandoRuta &&
                    styles.routeModeButtonDisabled,

                ]}
                onPress={() =>
                  cambiarPerfilRuta(
                    'cycling-regular'
                  )
                }
                disabled={
                  calculandoRuta
                }
              >

                <Text
                  style={[
                    styles.routeModeText,

                    perfilRuta ===
                      'cycling-regular' &&
                      styles.routeModeTextActive
                  ]}
                >
                  🚲 Bicicleta
                </Text>

              </TouchableOpacity>

            </View>


            <TouchableOpacity
              onPress={
                calcularRuta
              }
              disabled={
                calculandoRuta
              }
              style={[
                styles.routeButton,

                calculandoRuta &&
                  styles.routeButtonDisabled
              ]}
            >

              <Text style={styles.routeButtonText}>

                {calculandoRuta
                  ? 'Calculando ruta...'
                  : 'Calcular ruta'}

              </Text>

            </TouchableOpacity>


            {calculandoRuta && (

              <ActivityIndicator
                size="small"
                color="#1F6F5C"
                style={styles.routeLoading}
              />

            )}


            {errorRuta !==
              '' && (

              <Text style={styles.routeError}>
                {errorRuta}
              </Text>

            )}


            {ruta && (

              <View style={styles.routeResult}>

                <Text style={styles.routeResultTitle}>
                  Ruta encontrada
                </Text>


                <Text style={styles.routeInfo}>

                  Medio:{' '}

                  <Text style={styles.routeInfoStrong}>
                    {obtenerNombrePerfil()}
                  </Text>

                </Text>


                <Text style={styles.routeInfo}>

                  Distancia por ruta:{' '}

                  <Text style={styles.routeInfoStrong}>
                    {ruta.distanciaKm
                      .toFixed(
                        1
                      )} km
                  </Text>

                </Text>


                <Text style={styles.routeInfo}>

                  Tiempo estimado:{' '}

                  <Text style={styles.routeInfoStrong}>

                    {ruta.duracionMin <
                      60

                      ? `${Math.round(
                          ruta.duracionMin
                        )} min`

                      : `${Math.floor(
                          ruta.duracionMin /
                          60
                        )} h ${Math.round(
                          ruta.duracionMin %
                          60
                        )} min`}

                  </Text>

                </Text>


                {Number(
                  oportunidad
                    .radio_km
                ) > 0 && (

                  <Text style={styles.routeApproximateNote}>
                    La ruta finaliza en el centro de la zona aproximada de la oportunidad.
                  </Text>

                )}

              </View>

            )}

          </View>

        )}


        {/* ================================================= */}
        {/* MAPA */}
        {/* ================================================= */}

        {oportunidad.latitud !=
          null &&
          oportunidad.longitud !=
          null && (

          <View style={styles.mapSection}>

            <Text style={styles.mapTitle}>
              Ubicación de la oportunidad
            </Text>


            <Text style={styles.mapSubtitle}>

              {ubicacionUsuario
                ? 'Compará tu ubicación de referencia con la ubicación de la oportunidad.'
                : 'Consultá en el mapa dónde se realizará la actividad.'}

            </Text>


            <MapaLeaflet
              oportunidades={[
                oportunidad
              ]}
              mostrarBotonDetalle={
                false
              }
              zoom={
                15
              }
              ubicacionUsuario={
                ubicacionUsuario
              }
              tipoUbicacionUsuario={
                modoUbicacion
              }
              rutaCoordenadas={
                ruta?.coordenadas ||
                []
              }
            />


            {/* ================================================= */}
            {/* LEYENDA DEL MAPA */}
            {/* ================================================= */}

            <View style={styles.mapLegend}>


              {ubicacionUsuario && (

                <View style={styles.legendItem}>

                  <View style={styles.userMarker} />

                  <Text style={styles.legendText}>

                    {modoUbicacion ===
                      'MANUAL'
                      ? 'Ubicación seleccionada'
                      : 'Tu ubicación actual'}

                  </Text>

                </View>

              )}


              <View style={styles.legendItem}>

                <View style={styles.opportunityMarker} />

                <Text style={styles.legendText}>
                  Oportunidad
                </Text>

              </View>


              {Number(
                oportunidad.radio_km
              ) > 0 && (

                <View style={styles.legendItem}>

                  <View style={styles.approximateMarker} />

                  <Text style={styles.legendText}>
                    Zona aproximada
                  </Text>

                </View>

              )}


              {ruta && (

                <View style={styles.legendItem}>

                  <View style={styles.routeLine} />

                  <Text style={styles.legendText}>
                    Ruta calculada
                  </Text>

                </View>

              )}

            </View>

          </View>

        )}

      </View>

    </View>

  );

}


// =======================================================
// ESTILOS
// =======================================================

const styles =
  StyleSheet.create({

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

    enrollmentStatusCard: {
      backgroundColor: '#F2F8F6',

      borderWidth: 1,
      borderColor: '#CFE4DE',

      borderRadius: 12,

      padding: 16,
      marginTop: 16,
    },

    enrollmentStatusTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: '#5F6B76',
    },

    enrollmentStatusValue: {
      fontSize: 17,
      fontWeight: '700',
      color: '#1F6F5C',

      marginTop: 5,
    },

    enrollmentStatusDescription: {
      fontSize: 13,
      color: '#5F6B76',

      lineHeight: 18,
      marginTop: 6,
    },


    // =====================================================
    // DISTANCIA
    // =====================================================

    distanceCard: {

      backgroundColor: '#F2F8F6',

      borderRadius: 12,

      padding: 14,

      marginTop: 14,

      borderWidth: 1,
      borderColor: '#D7E8E3',

    },


    distanceLabel: {

      fontSize: 12,
      color: '#5F6B76',

    },


    distanceValue: {

      fontSize: 20,
      fontWeight: '700',
      color: '#1F6F5C',

      marginTop: 3,

    },


    distanceNote: {

      fontSize: 11,
      color: '#D97706',

      marginTop: 5,

      lineHeight: 16,

    },


    // =====================================================
    // RUTA
    // =====================================================

    routeCard: {

      backgroundColor: '#F8FAF9',

      borderRadius: 12,

      padding: 14,

      marginTop: 14,

      borderWidth: 1,
      borderColor: '#DDE5E2',

    },


    routeTitle: {

      fontSize: 15,
      fontWeight: '700',
      color: '#164C40',

    },


    routeDescription: {

      fontSize: 12,
      color: '#5F6B76',

      marginTop: 4,
      marginBottom: 12,

      lineHeight: 17,

    },


    routeModes: {

      flexDirection: 'row',
      flexWrap: 'wrap',

      gap: 8,

      marginBottom: 12,

    },


    routeModeButton: {

      paddingHorizontal: 12,
      paddingVertical: 8,

      borderRadius: 10,

      borderWidth: 1,
      borderColor: '#D7DEDA',

      backgroundColor: '#FFFFFF',

    },


    routeModeButtonActive: {

      backgroundColor: '#1F6F5C',
      borderColor: '#1F6F5C',

    },


    routeModeButtonDisabled: {

      opacity: 0.6,

    },


    routeModeText: {

      fontSize: 12,
      fontWeight: '600',
      color: '#5F6B76',

    },


    routeModeTextActive: {

      color: '#FFFFFF',

    },


    routeButton: {

      backgroundColor: '#1F6F5C',

      borderRadius: 10,

      paddingVertical: 10,
      paddingHorizontal: 14,

      alignItems: 'center',

    },


    routeButtonDisabled: {

      opacity: 0.6,

    },


    routeButtonText: {

      color: '#FFFFFF',

      fontSize: 13,
      fontWeight: '700',

    },


    routeLoading: {

      marginTop: 10,

    },


    routeError: {

      fontSize: 12,

      color: '#C62828',

      marginTop: 10,

      lineHeight: 17,

    },


    routeResult: {

      backgroundColor: '#F2F8F6',

      borderRadius: 10,

      padding: 12,

      marginTop: 12,

    },


    routeResultTitle: {

      fontSize: 13,
      fontWeight: '700',
      color: '#164C40',

      marginBottom: 6,

    },


    routeInfo: {

      fontSize: 13,
      color: '#5F6B76',

      marginTop: 3,

    },


    routeInfoStrong: {

      fontWeight: '700',
      color: '#164C40',

    },


    routeApproximateNote: {

      fontSize: 11,

      color: '#D97706',

      marginTop: 8,

      lineHeight: 16,

    },


    // =====================================================
    // MAPA
    // =====================================================

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

      lineHeight: 17,

    },


    // =====================================================
    // LEYENDA
    // =====================================================

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


    userMarker: {

      width: 12,
      height: 12,

      borderRadius: 6,

      backgroundColor: '#2563EB',

      borderWidth: 2,
      borderColor: '#FFFFFF',

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


    routeLine: {

      width: 20,
      height: 4,

      borderRadius: 2,

      backgroundColor: '#3388FF',

    },


    legendText: {

      fontSize: 11,
      color: '#5F6B76',

    },


    inscriptionButton: {
      backgroundColor: '#1F6F5C',

      borderRadius: 10,

      paddingVertical: 12,
      paddingHorizontal: 14,

      alignItems: 'center',

      marginTop: 20,
    },

    inscriptionButtonText: {
      color: '#FFFFFF',

      fontSize: 14,
      fontWeight: '700',
    },
    noCapacityButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginTop: 20,
  },

  noCapacityButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '700',
  },

  });