import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from 'react-native';

export default function BuscarOportunidadesScreen({
  oportunidades=[],
  loading,
  onLogout,
  tiposActividad=[],
  onFiltrar,
  onBuscarUbicacion,
  onVerDetalle,
}) {

  const [tipoSeleccionado, setTipoSeleccionado] = React.useState(null);
  const [urgenciaSeleccionada, setUrgenciaSeleccionada] = React.useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = React.useState(null);
  const [mostrarFecha, setMostrarFecha] = React.useState(false);
  const [ubicacionActual, setUbicacionActual] = React.useState(null);
  const [obteniendoUbicacion, setObteniendoUbicacion] = React.useState(false);
  const [radioBusquedaKm, setRadioBusquedaKm] = React.useState('10');
  const [direccionActual, setDireccionActual] = React.useState('');
  const [textoUbicacion, setTextoUbicacion] = React.useState('');
  const [resultadosUbicacion, setResultadosUbicacion] = React.useState([]);
  const [buscandoUbicacion, setBuscandoUbicacion] = React.useState(false);
  const [ubicacionManualSeleccionada, setUbicacionManualSeleccionada] = React.useState(null);
  const [modoUbicacion, setModoUbicacion] = React.useState(null);

  const obtenerUbicacionActual = async () => {

      try {

        setObteniendoUbicacion(true);

        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          alert(
            'Necesitamos permiso de ubicación para buscar oportunidades cercanas.'
          );
          return;
        }

        const ubicacion =
          await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

        const coordenadas = {
          latitud: ubicacion.coords.latitude,
          longitud: ubicacion.coords.longitude,
        };

        setUbicacionManualSeleccionada(null);
        setTextoUbicacion('');
        setResultadosUbicacion([]);
    


        setUbicacionActual(coordenadas);
        setModoUbicacion('GPS');

        const direcciones = await Location.reverseGeocodeAsync({
          latitude: ubicacion.coords.latitude,
          longitude: ubicacion.coords.longitude,
        });

        if (direcciones.length > 0) {

          const direccion = direcciones[0];

          const partes = [
            direccion.street,
            direccion.streetNumber,
            direccion.city,
            direccion.region
          ].filter(Boolean);

          setDireccionActual(partes.join(', '));

        }

        console.log(
          'Ubicación actual:',
          coordenadas
        );

      } catch (error) {

        console.log(
          'Error obteniendo ubicación:',
          error.message
        );

        alert(
          'No se pudo obtener tu ubicación actual.'
        );

      } finally {

        setObteniendoUbicacion(false);

      }

    };

  const construirFiltros = ({
        tipo = tipoSeleccionado,
        urgencia = urgenciaSeleccionada,
        fecha = fechaSeleccionada,
        ubicacion = ubicacionManualSeleccionada||ubicacionActual,
        radio = radioBusquedaKm,
      } = {}) => {

    const filtros = {};

      if (tipo !== null) {
        filtros.tipoActividad = tipo;
      }

      if (urgencia !== null) {
        filtros.urgencia = urgencia;
      }

      if (fecha !== null) {
        filtros.fecha =
          `${fecha.getFullYear()}-` +
          `${String(fecha.getMonth() + 1).padStart(2, '0')}-` +
          `${String(fecha.getDate()).padStart(2, '0')}`;
      }

      if (ubicacion !== null) {

        const radioNumerico = Number(radio);

        if (
          Number.isFinite(radioNumerico) &&
          radioNumerico > 0
        ) {
          filtros.latitud = ubicacion.latitud;
          filtros.longitud = ubicacion.longitud;
          filtros.radioBusquedaKm = radioNumerico;
        }
      }

      return filtros;
    };



React.useEffect(() => {

  if (textoUbicacion.trim().length < 3) {
    setResultadosUbicacion([]);
    return;
  }

  if (ubicacionManualSeleccionada) {
    return;
  }

  const timeout = setTimeout(async () => {

    try {

      setBuscandoUbicacion(true);

      const resultados =
        await onBuscarUbicacion(
          textoUbicacion.trim()
        );

      setResultadosUbicacion(resultados);

    } finally {

      setBuscandoUbicacion(false);

    }

  }, 600);

  return () => clearTimeout(timeout);

}, [
  textoUbicacion,
  ubicacionManualSeleccionada,
  onBuscarUbicacion
]);

const limpiarFiltros = async () => {

  setTipoSeleccionado(null);
  setUrgenciaSeleccionada(null);

  setFechaSeleccionada(null);
  setMostrarFecha(false);

  setUbicacionActual(null);
  setDireccionActual('');

  setUbicacionManualSeleccionada(null);
  setTextoUbicacion('');
  setResultadosUbicacion([]);

  setModoUbicacion(null);

  setRadioBusquedaKm('10');

  await onFiltrar({});

};

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Buscar oportunidades
          </Text>

          <Text style={styles.subtitle}>
            Encontrá actividades de voluntariado disponibles
          </Text>
        </View>

        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logoutText}>
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterSection}>

        <Text style={styles.filterTitle}>
          Tipo de actividad
        </Text>

        <View style={styles.typeContainer}>

          <TouchableOpacity
            style={[
              styles.typeButton,
              tipoSeleccionado === null &&
                styles.typeButtonActive
            ]}
            onPress={() => {
              setTipoSeleccionado(null);
              onFiltrar(construirFiltros({tipo: null}));
    
             }
            }
          >
            <Text
              style={[
                styles.typeButtonText,
                tipoSeleccionado === null &&
                  styles.typeButtonTextActive
              ]}
            >
              Todas
            </Text>
          </TouchableOpacity>

          {tiposActividad.map((tipo) => (

            <TouchableOpacity
              key={tipo.id_tipo_actividad}
              style={[
                styles.typeButton,
                tipoSeleccionado === tipo.id_tipo_actividad &&
                  styles.typeButtonActive
              ]}
              onPress={() => {
                setTipoSeleccionado(tipo.id_tipo_actividad);

                onFiltrar(
                  construirFiltros({tipo: tipo.id_tipo_actividad})
                );
              }}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  tipoSeleccionado === tipo.id_tipo_actividad &&
                    styles.typeButtonTextActive
                ]}
              >
                {tipo.nombre}
              </Text>
            </TouchableOpacity>

          ))}

        </View>

        <Text style={styles.filterTitleSecondary}>
        Urgencia
        </Text>

      <View style={styles.typeContainer}>

        <TouchableOpacity
          style={[
            styles.typeButton,
            urgenciaSeleccionada === null &&
              styles.typeButtonActive
          ]}
          onPress={() => {
            setUrgenciaSeleccionada(null);

            onFiltrar(construirFiltros({urgencia:null})
            );
          }}
        >
          <Text
            style={[
              styles.typeButtonText,
              urgenciaSeleccionada === null &&
                styles.typeButtonTextActive
            ]}
          >
            Todas
          </Text>
        </TouchableOpacity>

        {['BAJA', 'MEDIA', 'ALTA'].map((urgencia) => (

          <TouchableOpacity
            key={urgencia}
            style={[
              styles.typeButton,
              urgenciaSeleccionada === urgencia &&
                styles.typeButtonActive
            ]}
            onPress={() => {

              setUrgenciaSeleccionada(urgencia);

              onFiltrar(construirFiltros({urgencia:urgencia}));
            }}
          >
            <Text
              style={[
                styles.typeButtonText,
                urgenciaSeleccionada === urgencia &&
                  styles.typeButtonTextActive
              ]}
            >
              {urgencia}
            </Text>
          </TouchableOpacity>

        ))}

      </View>

      <Text style={styles.filterTitleSecondary}>
          Fecha
        </Text>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setMostrarFecha(true)}
        >
          <Text style={styles.dateButtonText}>
            {fechaSeleccionada
              ? fechaSeleccionada.toLocaleDateString('es-AR')
              : 'Todas las fechas'}
          </Text>
        </TouchableOpacity>

        {fechaSeleccionada && (
          <TouchableOpacity
            onPress={() => {
              setFechaSeleccionada(null);

              onFiltrar(construirFiltros({fecha:null}));
              
            }}
          >
            <Text style={styles.clearDateText}>
              Quitar fecha
            </Text>
          </TouchableOpacity>
        )}

        {mostrarFecha && (
          <DateTimePicker
            value={fechaSeleccionada || new Date()}
            mode="date"
            display="default"
            onChange={(event, fecha) => {

              setMostrarFecha(false);

              if (!fecha) {
                return;
              }

              setFechaSeleccionada(fecha);

              onFiltrar(construirFiltros({fecha:fecha}));
            }}
          />
        )}


       <Text style={styles.filterTitleSecondary}>
          Ubicación
        </Text>

        <View style={styles.locationModeContainer}>

          <TouchableOpacity
            style={[
              styles.locationModeButton,
              modoUbicacion === 'GPS' &&
                styles.locationModeButtonActive
            ]}
            onPress={obtenerUbicacionActual}
            disabled={obteniendoUbicacion}
          >
            <Text
              style={[
                styles.locationModeButtonText,
                modoUbicacion === 'GPS' &&
                  styles.locationModeButtonTextActive
              ]}
            >
              {obteniendoUbicacion
                ? 'Obteniendo...'
                : 'Ubicación actual'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.locationModeButton,
              modoUbicacion === 'MANUAL' &&
                styles.locationModeButtonActive
            ]}
            onPress={() => {

              setModoUbicacion('MANUAL');

              setUbicacionActual(null);
              setDireccionActual('');

              setUbicacionManualSeleccionada(null);
              setTextoUbicacion('');
              setResultadosUbicacion([]);

            }}
          >
            <Text
              style={[
                styles.locationModeButtonText,
                modoUbicacion === 'MANUAL' &&
                  styles.locationModeButtonTextActive
              ]}
            >
              Elegir manualmente
            </Text>
          </TouchableOpacity>

        </View>


        {modoUbicacion === 'MANUAL' && (

          <View>

            <Text style={styles.filterLabel}>
              Buscar dirección
            </Text>

            <TextInput
              style={styles.locationInput}
              placeholder="Ej. Güemes 1281, Santa Fe"
              value={textoUbicacion}
              onChangeText={(texto) => {
                setTextoUbicacion(texto);
                setUbicacionManualSeleccionada(null);
              }}
            />

            {buscandoUbicacion && (
              <ActivityIndicator
                size="small"
                style={styles.locationLoading}
              />
            )}

            {resultadosUbicacion.length > 0 &&
              !ubicacionManualSeleccionada && (

                <View style={styles.locationResults}>

                  {resultadosUbicacion.map((resultado) => (

                    <TouchableOpacity
                      key={resultado.placeId}
                      style={styles.locationResultItem}
                      onPress={() => {

                        const ubicacionSeleccionada = {
                          latitud: resultado.latitud,
                          longitud: resultado.longitud,
                            direccion:
                            resultado.detalle ||
                            resultado.nombre,
                        };

                        

                        setUbicacionManualSeleccionada(
                          ubicacionSeleccionada
                        );

                        setModoUbicacion('MANUAL');

                        setTextoUbicacion(
                          resultado.detalle ||
                          resultado.nombre
                        );

                        setResultadosUbicacion([]);

                        setUbicacionActual(null);
                        setDireccionActual('');

                      }}
                    >

                      <Text style={styles.locationResultName}>
                        {resultado.nombre}
                      </Text>

                      {!!resultado.detalle && (
                        <Text style={styles.locationResultDetail}>
                          {resultado.detalle}
                        </Text>
                      )}

                    </TouchableOpacity>

                  ))}

                </View>

            )}

          </View>

        )}


        {modoUbicacion === 'GPS' &&
          ubicacionActual &&
          direccionActual !== '' && (

            <Text style={styles.currentAddress}>
              {direccionActual}
            </Text>

        )}


  
        {(ubicacionActual ||
          ubicacionManualSeleccionada) && (

          <View style={styles.radiusContainer}>

            <Text style={styles.radiusLabel}>
              Radio de búsqueda (km)
            </Text>

            <TextInput
              style={styles.radiusInput}
              value={radioBusquedaKm}
              onChangeText={setRadioBusquedaKm}
              keyboardType="decimal-pad"
              placeholder="Ej: 10"
            />

            <TouchableOpacity
              style={styles.searchNearbyButton}
              onPress={() => {

                const radio = Number(radioBusquedaKm);

                if (
                  !Number.isFinite(radio) ||
                  radio <= 0
                ) {
                  alert(
                    'Ingresá un radio de búsqueda mayor a 0.'
                  );
                  return;
                }

                onFiltrar(
                  construirFiltros({
                    ubicacion:
                      ubicacionManualSeleccionada ||
                      ubicacionActual,
                    radio: radio
                  })
                );

              }}
            >

              <Text style={styles.searchNearbyButtonText}>
                {modoUbicacion === 'MANUAL'
                  ? 'Buscar en esta ubicación'
                  : 'Buscar cerca de mí'}
              </Text>

            </TouchableOpacity>

          </View>

        )}
      
       <TouchableOpacity
        style={styles.clearFiltersButton}
        onPress={limpiarFiltros}
      >
        <Text style={styles.clearFiltersButtonText}>
          Limpiar filtros
        </Text>
      </TouchableOpacity>

      </View>

      {loading ? (

        <ActivityIndicator
          size="large"
          color="#1F6F5C"
          style={styles.loader}
        />

      ) : oportunidades.length === 0 ? (

        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            No hay oportunidades disponibles
          </Text>

          <Text style={styles.emptyText}>
            Actualmente no hay oportunidades publicadas y vigentes.
          </Text>
        </View>

      ) : (

        oportunidades.map((oportunidad) => (

        <TouchableOpacity
            key={oportunidad.id_oportunidad}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() =>
              onVerDetalle(oportunidad.id_oportunidad)
            }
          >

            <Text style={styles.cardTitle}>
              {oportunidad.titulo}
            </Text>

            <Text style={styles.cardOrganization}>
              {oportunidad.organizacion}
            </Text>

            <Text style={styles.cardType}>
              {oportunidad.tipo_actividad}
            </Text>

            <Text style={styles.cardInfo}>
              Urgencia: {oportunidad.urgencia}
            </Text>

            <Text style={styles.cardInfo}>
              Cupo: {oportunidad.cupo_total}
            </Text>

            <Text style={styles.cardInfo}>
              Inicio:{' '}
              {new Date(
                oportunidad.fecha_inicio
              ).toLocaleString('es-AR')}
            </Text>

            <Text style={styles.cardInfo}>
              Fin previsto:{' '}
              {new Date(
                oportunidad.fecha_fin
              ).toLocaleString('es-AR')}
            </Text>

            {(oportunidad.direccion ||
              oportunidad.localidad) && (

              <Text style={styles.cardInfo}>
                Ubicación:{' '}
                {oportunidad.direccion
                  ? `${oportunidad.direccion}, `
                  : ''}

                {oportunidad.localidad}

                {oportunidad.provincia
                  ? `, ${oportunidad.provincia}`
                  : ''}
              </Text>

            )}

            {oportunidad.distancia_km != null && (

              <Text style={styles.distance}>
                A {oportunidad.distancia_km} km
              </Text>

            )}

          </TouchableOpacity>

        ))

      )}

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    width: '100%',
    maxWidth: 500,
  },

  header: {
    marginBottom: 20,
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
  },

  logoutText: {
    color: '#C62828',
    fontWeight: '600',
    marginTop: 10,
  },

  loader: {
    marginTop: 30,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
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
    marginTop: 5,
    textAlign: 'center',
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
  },

  cardOrganization: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F6F5C',
    marginTop: 4,
  },

  cardType: {
    fontSize: 13,
    color: '#5F6B76',
    marginTop: 4,
  },

  cardInfo: {
    fontSize: 12,
    color: '#5F6B76',
    marginTop: 5,
  },

  distance: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F6F5C',
    marginTop: 8,
  },
  filterSection: {
    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    padding: 16,

    marginBottom: 18,

    borderWidth: 1,
    borderColor: '#DDE5E2',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,

    elevation: 2,
},

filterTitle: {
  fontSize: 14,
  fontWeight: '700',
  color: '#1F2937',
  marginBottom: 8,
},

typeContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  alignItems:'center'
},

typeButton: {
  paddingHorizontal: 14,
  paddingVertical: 9,

  borderRadius: 20,

  backgroundColor: '#FFFFFF',

  borderWidth: 1,
  borderColor: '#D7DEDA',

  justifyContent: 'center',
  alignItems: 'center',
},

typeButtonActive: {
  backgroundColor: '#1F6F5C',
  borderColor: '#1F6F5C',
},

typeButtonText: {
  fontSize: 12,
  fontWeight: '600',
  color: '#5F6B76',
},

typeButtonTextActive: {
  color: '#FFFFFF',
},
filterTitleSecondary: {
  fontSize: 14,
  fontWeight: '700',
  color: '#1F2937',
  marginTop: 18,
  marginBottom: 8,
},
dateButton: {
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#D7DEDA',
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 11,
  alignSelf: 'flex-start',
},

dateButtonText: {
  fontSize: 13,
  fontWeight: '600',
  color: '#5F6B76',
},

clearDateText: {
  fontSize: 12,
  fontWeight: '600',
  color: '#C62828',
  marginTop: 8,
},


radiusContainer: {
  marginTop: 12,
},

radiusLabel: {
  fontSize: 13,
  fontWeight: '600',
  color: '#5F6B76',
  marginBottom: 6,
},

radiusInput: {
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#D7DEDA',
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 9,
  width: 120,
},

searchNearbyButton: {
  backgroundColor: '#1F6F5C',
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 11,
  alignSelf: 'flex-start',
  marginTop: 10,
},

searchNearbyButtonText: {
  color: '#FFFFFF',
  fontSize: 13,
  fontWeight: '700',
},
currentAddress: {
  fontSize: 12,
  color: '#5F6B76',
  marginTop: 6,
},
locationInput: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  backgroundColor: '#fff',
  marginTop: 6,
},

locationLoading: {
  marginVertical: 10,
},

locationResults: {
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  marginTop: 4,
  overflow: 'hidden',
},

locationResultItem: {
  paddingHorizontal: 12,
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},

locationResultName: {
  fontSize: 14,
  fontWeight: '600',
},

locationResultDetail: {
  fontSize: 12,
  marginTop: 2,
},
locationModeContainer: {
  flexDirection: 'row',
  gap: 8,
  marginBottom: 12,
},

locationModeButton: {
  flex: 1,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#D7DEDA',
  borderRadius: 12,
  paddingHorizontal: 10,
  paddingVertical: 11,
  alignItems: 'center',
},

locationModeButtonActive: {
  backgroundColor: '#1F6F5C',
  borderColor: '#1F6F5C',
},

locationModeButtonText: {
  fontSize: 12,
  fontWeight: '600',
  color: '#5F6B76',
  textAlign: 'center',
},

locationModeButtonTextActive: {
  color: '#FFFFFF',
},
clearFiltersButton: {
  marginTop: 18,
  alignSelf: 'flex-start',
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#C62828',
  backgroundColor: '#FFFFFF',
},

clearFiltersButtonText: {
  fontSize: 13,
  fontWeight: '700',
  color: '#C62828',
},

});