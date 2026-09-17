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
  estadoUbicacion,
}) {

  // =====================================================
  // ESTADOS DE RUTEO
  // =====================================================

  const [ruta, setRuta] =
    React.useState(null);

  const [calculandoRuta, setCalculandoRuta] =
    React.useState(false);

  const [errorRuta, setErrorRuta] =
    React.useState('');

  const [perfilRuta, setPerfilRuta] =
    React.useState('driving-car');


  // =====================================================
  // CARGANDO
  // =====================================================

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


  // =====================================================
  // OPORTUNIDAD NO DISPONIBLE
  // =====================================================

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


  // =====================================================
  // UBICACIÓN DE LA OPORTUNIDAD
  // =====================================================

  const ubicacion = [

    oportunidad.direccion,
    oportunidad.localidad,
    oportunidad.provincia,

  ]
    .filter(Boolean)
    .join(', ');


  // =====================================================
  // UBICACIÓN DE REFERENCIA DEL USUARIO
  // =====================================================

  const modoUbicacion =
    estadoUbicacion?.modoUbicacion ??
    null;


  let ubicacionUsuario = null;


  if (
    modoUbicacion === 'GPS' &&
    estadoUbicacion?.ubicacionActual
  ) {

    ubicacionUsuario =
      estadoUbicacion.ubicacionActual;

  }


  if (
    modoUbicacion === 'MANUAL' &&
    estadoUbicacion?.ubicacionManualSeleccionada
  ) {

    ubicacionUsuario =
      estadoUbicacion
        .ubicacionManualSeleccionada;

  }


  // =====================================================
  // CALCULAR DISTANCIA EN LÍNEA RECTA
  // =====================================================

  const calcularDistanciaKm = (
    latitud1,
    longitud1,
    latitud2,
    longitud2
  ) => {

    const radioTierraKm = 6371;

    const convertirARadianes =
      (grados) =>
        grados * Math.PI / 180;


    const diferenciaLatitud =
      convertirARadianes(
        latitud2 - latitud1
      );


    const diferenciaLongitud =
      convertirARadianes(
        longitud2 - longitud1
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
        diferenciaLatitud / 2
      ) ** 2 +

      Math.cos(
        latitud1Rad
      ) *

      Math.cos(
        latitud2Rad
      ) *

      Math.sin(
        diferenciaLongitud / 2
      ) ** 2;


    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );


    return radioTierraKm * c;
  };


  // =====================================================
  // DISTANCIA A LA OPORTUNIDAD
  // =====================================================

  let distanciaKm = null;


  if (
    ubicacionUsuario &&
    oportunidad.latitud != null &&
    oportunidad.longitud != null
  ) {

    distanciaKm =
      calcularDistanciaKm(
        Number(
          ubicacionUsuario.latitud
        ),
        Number(
          ubicacionUsuario.longitud
        ),
        Number(
          oportunidad.latitud
        ),
        Number(
          oportunidad.longitud
        )
      );

  }


  // =====================================================
  // CAMBIAR PERFIL DE RUTA
  // =====================================================

  const cambiarPerfilRuta = (
    nuevoPerfil
  ) => {

    setPerfilRuta(
      nuevoPerfil
    );

    // Si cambia el medio de transporte,
    // descartamos la ruta anterior.
    setRuta(null);
    setErrorRuta('');

  };


  // =====================================================
  // NOMBRE DEL MEDIO DE TRANSPORTE
  // =====================================================

  const obtenerNombrePerfil = () => {

    if (
      perfilRuta === 'foot-walking'
    ) {
      return 'Caminando';
    }

    if (
      perfilRuta === 'cycling-regular'
    ) {
      return 'Bicicleta';
    }

    return 'Auto';

  };


  // =====================================================
  // CALCULAR RUTA CON OPENROUTESERVICE
  // =====================================================

  const calcularRuta = async () => {

    if (!ubicacionUsuario) {

      setErrorRuta(
        'Seleccioná primero una ubicación de referencia.'
      );

      return;
    }


    if (
      oportunidad.latitud == null ||
      oportunidad.longitud == null
    ) {

      setErrorRuta(
        'La oportunidad no posee una ubicación válida.'
      );

      return;
    }


    try {

      setCalculandoRuta(true);
      setErrorRuta('');
      setRuta(null);


      const resultado =
        await obtenerRuta(
          ubicacionUsuario,
          {
            latitud:
              oportunidad.latitud,

            longitud:
              oportunidad.longitud,
          },
          perfilRuta
        );


      console.log(
        'RUTA ORS:',
        resultado
      );


      setRuta(
        resultado
      );

    } catch (error) {

      console.log(
        'ERROR ORS:',
        error.message
      );


      setErrorRuta(
        error.message ||
        'No se pudo calcular la ruta.'
      );

    } finally {

      setCalculandoRuta(false);

    }

  };


  // =====================================================
  // RENDER
  // =====================================================

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


        {/* ================================================= */}
        {/* DESCRIPCIÓN */}
        {/* ================================================= */}

        <Text style={styles.sectionTitle}>
          Descripción
        </Text>

        <Text style={styles.text}>
          {oportunidad.descripcion ||
            'Sin descripción.'}
        </Text>


        {/* ================================================= */}
        {/* URGENCIA */}
        {/* ================================================= */}

        <Text style={styles.sectionTitle}>
          Urgencia
        </Text>

        <Text style={styles.text}>
          {oportunidad.urgencia}
        </Text>


        {/* ================================================= */}
        {/* REQUISITOS */}
        {/* ================================================= */}

        <Text style={styles.sectionTitle}>
          Requisitos
        </Text>

        <Text style={styles.text}>
          {oportunidad.requisitos ||
            'No se especificaron requisitos.'}
        </Text>


        {/* ================================================= */}
        {/* CUPO */}
        {/* ================================================= */}

        <Text style={styles.sectionTitle}>
          Cupo
        </Text>

        <Text style={styles.text}>
          {oportunidad.cupo_total}
        </Text>


        {/* ================================================= */}
        {/* FECHAS */}
        {/* ================================================= */}

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


        {/* ================================================= */}
        {/* UBICACIÓN */}
        {/* ================================================= */}

        <Text style={styles.sectionTitle}>
          Ubicación
        </Text>

        <Text style={styles.text}>

          {ubicacion ||
            'Ubicación no especificada.'}

        </Text>


        {/* ================================================= */}
        {/* DISTANCIA EN LÍNEA RECTA */}
        {/* ================================================= */}

        {distanciaKm != null && (

          <View style={styles.distanceCard}>

            <Text style={styles.distanceLabel}>
              Distancia desde tu referencia
            </Text>


            <Text style={styles.distanceValue}>

              {distanciaKm < 1
                ? `${Math.round(
                    distanciaKm * 1000
                  )} m`
                : `${distanciaKm.toFixed(1)} km`}

            </Text>


            {Number(
              oportunidad.radio_km
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


            {/* ============================================= */}
            {/* MEDIO DE TRANSPORTE */}
            {/* ============================================= */}

            <View style={styles.routeModes}>


              {/* AUTO */}

              <TouchableOpacity
                style={[
                  styles.routeModeButton,

                  perfilRuta ===
                    'driving-car' &&
                    styles.routeModeButtonActive
                ]}
                onPress={() =>
                  cambiarPerfilRuta(
                    'driving-car'
                  )
                }
                disabled={calculandoRuta}
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


              {/* CAMINANDO */}

              <TouchableOpacity
                style={[
                  styles.routeModeButton,

                  perfilRuta ===
                    'foot-walking' &&
                    styles.routeModeButtonActive
                ]}
                onPress={() =>
                  cambiarPerfilRuta(
                    'foot-walking'
                  )
                }
                disabled={calculandoRuta}
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


              {/* BICICLETA */}

              <TouchableOpacity
                style={[
                  styles.routeModeButton,

                  perfilRuta ===
                    'cycling-regular' &&
                    styles.routeModeButtonActive
                ]}
                onPress={() =>
                  cambiarPerfilRuta(
                    'cycling-regular'
                  )
                }
                disabled={calculandoRuta}
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


            {/* ============================================= */}
            {/* CALCULAR */}
            {/* ============================================= */}

            <TouchableOpacity
              style={[
                styles.routeButton,

                calculandoRuta &&
                  styles.routeButtonDisabled
              ]}
              onPress={
                calcularRuta
              }
              disabled={
                calculandoRuta
              }
            >

              <Text
                style={styles.routeButtonText}
              >

                {calculandoRuta
                  ? 'Calculando ruta...'
                  : 'Calcular mejor camino'}

              </Text>

            </TouchableOpacity>


            {calculandoRuta && (

              <ActivityIndicator
                size="small"
                color="#1F6F5C"
                style={
                  styles.routeLoading
                }
              />

            )}


            {/* ============================================= */}
            {/* ERROR */}
            {/* ============================================= */}

            {errorRuta !== '' && (

              <Text
                style={styles.routeError}
              >
                {errorRuta}
              </Text>

            )}


            {/* ============================================= */}
            {/* RESULTADO */}
            {/* ============================================= */}

            {ruta && (

              <View style={styles.routeResult}>


                <Text
                  style={
                    styles.routeResultTitle
                  }
                >
                  Ruta encontrada
                </Text>


                <Text style={styles.routeInfo}>

                  Medio:{' '}

                  <Text
                    style={
                      styles.routeInfoStrong
                    }
                  >
                    {obtenerNombrePerfil()}
                  </Text>

                </Text>


                <Text style={styles.routeInfo}>

                  Distancia por ruta:{' '}

                  <Text
                    style={
                      styles.routeInfoStrong
                    }
                  >
                    {ruta.distanciaKm.toFixed(1)} km
                  </Text>

                </Text>


                <Text style={styles.routeInfo}>

                  Tiempo estimado:{' '}

                  <Text
                    style={
                      styles.routeInfoStrong
                    }
                  >

                    {ruta.duracionMin < 60
                      ? `${Math.round(
                          ruta.duracionMin
                        )} min`

                      : `${Math.floor(
                          ruta.duracionMin / 60
                        )} h ${Math.round(
                          ruta.duracionMin % 60
                        )} min`}

                  </Text>

                </Text>


              </View>

            )}


          </View>

        )}


        {/* ================================================= */}
        {/* MAPA */}
        {/* ================================================= */}

        {(
          oportunidad.latitud != null &&
          oportunidad.longitud != null
        ) && (

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

              mostrarBotonDetalle={false}

              zoom={15}

              ubicacionUsuario={
                ubicacionUsuario
              }

              tipoUbicacionUsuario={
                modoUbicacion
              }

              rutaCoordenadas={
                ruta?.coordenadas || []
              }

            />


            {ubicacionUsuario && (

              <View style={styles.mapLegend}>


                <View style={styles.legendItem}>

                  <View
                    style={styles.userMarker}
                  />

                  <Text
                    style={styles.legendText}
                  >

                    {modoUbicacion === 'MANUAL'
                      ? 'Ubicación seleccionada'
                      : 'Tu ubicación actual'}

                  </Text>

                </View>


                <View style={styles.legendItem}>

                  <View
                    style={
                      styles.opportunityMarker
                    }
                  />

                  <Text
                    style={styles.legendText}
                  >
                    Oportunidad
                  </Text>

                </View>

              </View>

            )}


          </View>

        )}


      </View>

    </View>

  );

}


// =======================================================
// ESTILOS
// =======================================================

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


  // =====================================================
  // DISTANCIA EN LÍNEA RECTA
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


  // =====================================================
  // MODOS DE TRANSPORTE
  // =====================================================

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


  legendText: {

    fontSize: 11,
    color: '#5F6B76',

  },

});