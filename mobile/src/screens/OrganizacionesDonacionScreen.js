import React from 'react';
import * as Location from 'expo-location';

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from 'react-native';


export default function OrganizacionesDonacionScreen({
  organizaciones = [],
  loading,
  tiposActividad = [],
  onFiltrar,
  filtrosGuardados = {},
  onSeleccionarOrganizacion,
  onBuscarUbicacion,
  estadoUbicacionGuardado,
  onGuardarEstadoUbicacion,
  showAlert,
  onMisDonaciones,
}) {

  const [
    nombreBusqueda,
    setNombreBusqueda
  ] = React.useState(
    filtrosGuardados.nombre ?? ''
  );


  const [
    tipoSeleccionado,
    setTipoSeleccionado
  ] = React.useState(
    filtrosGuardados.id_tipo_actividad ?? null
  );

  const [
  obteniendoUbicacion,
  setObteniendoUbicacion
] = React.useState(false);


const [
  buscandoUbicacion,
  setBuscandoUbicacion
] = React.useState(false);


const [
  resultadosUbicacion,
  setResultadosUbicacion
] = React.useState([]);


const [
  ubicacionActual,
  setUbicacionActual
] = React.useState(
  estadoUbicacionGuardado
    ?.ubicacionActual ?? null
);


const [
  ubicacionManualSeleccionada,
  setUbicacionManualSeleccionada
] = React.useState(
  estadoUbicacionGuardado
    ?.ubicacionManualSeleccionada ?? null
);


const [
  modoUbicacion,
  setModoUbicacion
] = React.useState(
  estadoUbicacionGuardado
    ?.modoUbicacion ?? null
);


const [
  direccionActual,
  setDireccionActual
] = React.useState(
  estadoUbicacionGuardado
    ?.direccionActual ?? ''
);


const [
  textoUbicacion,
  setTextoUbicacion
] = React.useState(
  estadoUbicacionGuardado
    ?.textoUbicacion ?? ''
);


const [
  radioBusquedaKm,
  setRadioBusquedaKm
] = React.useState(
  estadoUbicacionGuardado
    ?.radioBusquedaKm ?? '10'
);



const obtenerUbicacionActual =
  async () => {

    try {

      setObteniendoUbicacion(
        true
      );


      const {
        status
      } =
        await Location
          .requestForegroundPermissionsAsync();


      if (
        status !== 'granted'
      ) {

        showAlert(
          'error',
          'Permiso de ubicación',
          'No fue posible acceder a tu ubicación actual. Verificá el permiso de ubicación de la aplicación en la configuración del dispositivo. También podés buscar una ubicación manualmente.'
  );
      

        return;

      }


      const ubicacion =
        await Location
          .getCurrentPositionAsync({
            accuracy:
              Location.Accuracy.Balanced,
          });


      const coordenadas = {

        latitud:
          ubicacion.coords.latitude,

        longitud:
          ubicacion.coords.longitude,

      };


      setUbicacionActual(
        coordenadas
      );


      setModoUbicacion(
        'GPS'
      );


      setUbicacionManualSeleccionada(
        null
      );


      setTextoUbicacion(
        ''
      );


      setResultadosUbicacion(
        []
      );


      const direcciones =
        await Location
          .reverseGeocodeAsync({

            latitude:
              ubicacion.coords.latitude,

            longitude:
              ubicacion.coords.longitude,

          });


      if (
        direcciones.length > 0
      ) {

        const direccion =
          direcciones[0];


        const partes = [

          direccion.street,

          direccion.streetNumber,

          direccion.city,

          direccion.region,

        ].filter(Boolean);


        setDireccionActual(
          partes.join(', ')
        );

      }

    }
    catch (error) {

      console.log(
        'Error obteniendo ubicación:',
        error.message
      );


      showAlert(
        'error',
        'Ubicación no disponible',
        'No se pudo obtener tu ubicación actual.'
      );

    }
    finally {

      setObteniendoUbicacion(
        false
      );

    }

  };


  React.useEffect(() => {

  if (
    textoUbicacion
      .trim()
      .length < 3
  ) {

    setResultadosUbicacion(
      []
    );

    return;

  }


  if (
    ubicacionManualSeleccionada
  ) {

    return;

  }


  const timeout =
    setTimeout(
      async () => {

        try {

          setBuscandoUbicacion(
            true
          );


          const resultados =
            await onBuscarUbicacion(
              textoUbicacion.trim()
            );


          setResultadosUbicacion(
            resultados
          );

        }
        finally {

          setBuscandoUbicacion(
            false
          );

        }

      },
      600
    );


  return () =>
    clearTimeout(
      timeout
    );

}, [
  textoUbicacion,
  ubicacionManualSeleccionada
]);

  // ======================================================
  // APLICAR FILTROS
  // ======================================================

  const aplicarFiltros =
  async () => {

    const filtros = {};


    if (
      nombreBusqueda.trim()
    ) {

      filtros.nombre =
        nombreBusqueda.trim();

    }


    if (
      tipoSeleccionado != null
    ) {

      filtros.id_tipo_actividad =
        tipoSeleccionado;

    }


    const ubicacion =
      ubicacionManualSeleccionada ||
      ubicacionActual;


    if (
      ubicacion
    ) {

      const radio =
        Number(
          radioBusquedaKm
        );


      if (
        !Number.isFinite(
          radio
        ) ||
        radio <= 0
      ) {

        showAlert(
          'error',
          'Radio inválido',
          'Ingresá un radio de búsqueda mayor a 0.'
        );

        return;

      }


      filtros.latitud =
        ubicacion.latitud;

      filtros.longitud =
        ubicacion.longitud;

      filtros.radio_km =
        radio;

    }


    onGuardarEstadoUbicacion?.({

      modoUbicacion,

      ubicacionActual,

      ubicacionManualSeleccionada,

      direccionActual,

      textoUbicacion,

      radioBusquedaKm,

    });


    await onFiltrar(
      filtros
    );

  };


  // ======================================================
  // LIMPIAR FILTROS
  // ======================================================

 const limpiarFiltros =
  async () => {

    setNombreBusqueda(
      ''
    );

    setTipoSeleccionado(
      null
    );


    setUbicacionActual(
      null
    );

    setUbicacionManualSeleccionada(
      null
    );

    setModoUbicacion(
      null
    );

    setDireccionActual(
      ''
    );

    setTextoUbicacion(
      ''
    );

    setResultadosUbicacion(
      []
    );

    setRadioBusquedaKm(
      '10'
    );


    onGuardarEstadoUbicacion?.({

      modoUbicacion:
        null,

      ubicacionActual:
        null,

      ubicacionManualSeleccionada:
        null,

      direccionActual:
        '',

      textoUbicacion:
        '',

      radioBusquedaKm:
        '10',

    });


    await onFiltrar(
      {}
    );

  };


  return (

    <View
      style={
        styles.container
      }
    >

      <Text
        style={
          styles.title
        }
      >
        Donar
      </Text>


      <Text
        style={
          styles.subtitle
        }
      >
        Elegí una organización para ofrecer una donación material.
      </Text>
      
      {/* ==================================================
            ACCESO A MIS DONACIONES
        ================================================== */}

        <TouchableOpacity
          style={
            styles.myDonationsCard
          }
          onPress={
            onMisDonaciones
          }
          activeOpacity={
            0.8
          }
        >

          <View
            style={
              styles.myDonationsIcon
            }
          >
            <Text
              style={
                styles.myDonationsIconText
              }
            >
              📦
            </Text>
          </View>


          <View
            style={
              styles.myDonationsContent
            }
          >

            <Text
              style={
                styles.myDonationsTitle
              }
            >
              Mis donaciones
            </Text>

            <Text
              style={
                styles.myDonationsSubtitle
              }
            >
              Consultá tus ofrecimientos y su estado
            </Text>

          </View>


          <Text
            style={
              styles.myDonationsArrow
            }
          >
            ›
          </Text>

        </TouchableOpacity>

      {/* ==================================================
          BUSCADOR
      ================================================== */}

      <View
        style={
          styles.filterCard
        }
      >

        <Text
          style={
            styles.sectionTitle
          }
        >
          Buscar organización
        </Text>


        <TextInput

          style={
            styles.input
          }

          placeholder="Nombre de la organización"

          value={
            nombreBusqueda
          }

          onChangeText={
            setNombreBusqueda
          }

        />


        {/* ==================================================
            TIPOS DE ACTIVIDAD
        ================================================== */}

        <Text
          style={
            styles.filterLabel
          }
        >
          Tipo de actividad
        </Text>


        <View
          style={
            styles.chipsContainer
          }
        >

          <TouchableOpacity

            style={[

              styles.chip,

              tipoSeleccionado == null &&
                styles.chipActive

            ]}

            onPress={() =>
              setTipoSeleccionado(
                null
              )
            }

          >

            <Text
              style={[

                styles.chipText,

                tipoSeleccionado == null &&
                  styles.chipTextActive

              ]}
            >
              Todas
            </Text>

          </TouchableOpacity>


          {
            tiposActividad.map(
              (tipo) => (

                <TouchableOpacity

                  key={
                    tipo.id_tipo_actividad
                  }

                  style={[

                    styles.chip,

                    String(
                      tipoSeleccionado
                    ) ===
                      String(
                        tipo.id_tipo_actividad
                      ) &&
                      styles.chipActive

                  ]}

                  onPress={() =>
                    setTipoSeleccionado(
                      tipo.id_tipo_actividad
                    )
                  }

                >

                  <Text
                    style={[

                      styles.chipText,

                      String(
                        tipoSeleccionado
                      ) ===
                        String(
                          tipo.id_tipo_actividad
                        ) &&
                        styles.chipTextActive

                    ]}
                  >
                    {tipo.nombre}
                  </Text>

                </TouchableOpacity>

              )
            )
          }

        </View>


        <Text
        style={
            styles.filterLabel
        }
        >
        Ubicación
        </Text>


        <View
        style={
            styles.locationModeContainer
        }
        >

        <TouchableOpacity

            style={[
            styles.locationModeButton,

            modoUbicacion === 'GPS' &&
                styles.locationModeButtonActive
            ]}

            onPress={
            obtenerUbicacionActual
            }

            disabled={
            obteniendoUbicacion
            }

        >

            <Text
            style={[
                styles.locationModeButtonText,

                modoUbicacion === 'GPS' &&
                styles.locationModeButtonTextActive
            ]}
            >

            {
                obteniendoUbicacion
                ? 'Obteniendo...'
                : 'Ubicación actual'
            }

            </Text>

        </TouchableOpacity>


        <TouchableOpacity

            style={[
            styles.locationModeButton,

            modoUbicacion === 'MANUAL' &&
                styles.locationModeButtonActive
            ]}

            onPress={() => {

            setModoUbicacion(
                'MANUAL'
            );

            setUbicacionActual(
                null
            );

            setDireccionActual(
                ''
            );

            setUbicacionManualSeleccionada(
                null
            );

            setTextoUbicacion(
                ''
            );

            setResultadosUbicacion(
                []
            );

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

        {/* ==================================================
                BÚSQUEDA MANUAL DE UBICACIÓN
            ================================================== */}

            {modoUbicacion ===
            'MANUAL' && (

            <View>

                <TextInput

                style={
                    styles.input
                }

                placeholder="Ej. Güemes 1281, Santa Fe"

                value={
                    textoUbicacion
                }

                onChangeText={
                    (texto) => {

                    setTextoUbicacion(
                        texto
                    );

                    setUbicacionManualSeleccionada(
                        null
                    );

                    }
                }

                />


                {buscandoUbicacion && (

                <ActivityIndicator
                    size="small"
                />

                )}


                {resultadosUbicacion.length > 0 &&
                !ubicacionManualSeleccionada && (

                <View
                    style={
                    styles.locationResults
                    }
                >

                    {resultadosUbicacion.map(
                    (resultado) => (

                        <TouchableOpacity

                        key={
                            resultado.placeId
                        }

                        style={
                            styles.locationResultItem
                        }

                        onPress={() => {

                            setUbicacionManualSeleccionada({

                            latitud:
                                resultado.latitud,

                            longitud:
                                resultado.longitud,

                            direccion:
                                resultado.detalle ||
                                resultado.nombre,

                            });


                            setTextoUbicacion(
                            resultado.detalle ||
                            resultado.nombre
                            );


                            setResultadosUbicacion(
                            []
                            );


                            setModoUbicacion(
                            'MANUAL'
                            );


                            setUbicacionActual(
                            null
                            );


                            setDireccionActual(
                            ''
                            );

                        }}

                        >

                        <Text
                            style={
                            styles.locationResultName
                            }
                        >
                            {resultado.nombre}
                        </Text>


                        {!!resultado.detalle && (

                            <Text
                            style={
                                styles.locationResultDetail
                            }
                            >
                            {resultado.detalle}
                            </Text>

                        )}

                        </TouchableOpacity>

                    )
                    )}

                </View>

                )}

            </View>

            )}

            {/* ==================================================
                DIRECCIÓN OBTENIDA POR GPS
            ================================================== */}

            {modoUbicacion === 'GPS' &&
            ubicacionActual &&
            direccionActual !== '' && (

            <Text
                style={
                styles.currentAddress
                }
            >
                {direccionActual}
            </Text>

            )}
    {/* ==================================================
    RADIO DE BÚSQUEDA
================================================== */}

            {(
            ubicacionActual ||
            ubicacionManualSeleccionada
            ) && (

            <View
                style={
                styles.radiusContainer
                }
            >

                <Text
                style={
                    styles.filterLabel
                }
                >
                Radio de búsqueda (km)
                </Text>


                <TextInput

                style={
                    styles.input
                }

                value={
                    radioBusquedaKm
                }

                onChangeText={
                    setRadioBusquedaKm
                }

                keyboardType="decimal-pad"

                placeholder="Ej. 10"

                />

            </View>

            )}

        <View
          style={
            styles.actions
          }
        >

          <TouchableOpacity

            style={
              styles.clearButton
            }

            onPress={
              limpiarFiltros
            }

          >

            <Text
              style={
                styles.clearButtonText
              }
            >
              Limpiar
            </Text>

          </TouchableOpacity>


          <TouchableOpacity

            style={
              styles.searchButton
            }

            onPress={
              aplicarFiltros
            }

          >

            <Text
              style={
                styles.searchButtonText
              }
            >
              Buscar
            </Text>

          </TouchableOpacity>

        </View>

      </View>


      {/* ==================================================
          RESULTADOS
      ================================================== */}

      <Text
        style={
          styles.resultsTitle
        }
      >
        Organizaciones
      </Text>


      {
        loading ? (

          <ActivityIndicator
            size="large"
            color="#1F6F5C"
            style={{
              marginTop: 30
            }}
          />

        ) : organizaciones.length === 0 ? (

          <View
            style={
              styles.emptyCard
            }
          >

            <Text
              style={
                styles.emptyTitle
              }
            >
              No encontramos organizaciones
            </Text>


            <Text
              style={
                styles.emptyText
              }
            >
              Probá modificando los filtros o ampliando la búsqueda.
            </Text>

          </View>

        ) : (

          organizaciones.map(
            (organizacion) => (

              <View

                key={
                  organizacion.id_organizacion
                }

                style={
                  styles.organizacionCard
                }

              >

                <View
                  style={
                    styles.cardHeader
                  }
                >

                  <Text
                    style={
                      styles.organizacionNombre
                    }
                  >
                    {organizacion.razon_social}
                  </Text>


                  <View
                    style={
                      styles.verifiedBadge
                    }
                  >

                    <Text
                      style={
                        styles.verifiedText
                      }
                    >
                      ✓ Verificada
                    </Text>

                  </View>

                </View>


                {
                  organizacion
                    .tipos_actividad
                    ?.length > 0 && (

                    <Text
                      style={
                        styles.infoText
                      }
                    >
                      Actividad: {
                        organizacion
                          .tipos_actividad
                          .map(
                            (tipo) =>
                              tipo.nombre
                          )
                          .join(', ')
                      }
                    </Text>

                  )
                }


                {
                  (
                    organizacion.localidad ||
                    organizacion.provincia
                  ) && (

                    <Text
                      style={
                        styles.infoText
                      }
                    >
                      Ubicación: {
                        [
                          organizacion.localidad,
                          organizacion.provincia
                        ]
                          .filter(Boolean)
                          .join(', ')
                      }
                    </Text>

                  )
                }


                {
                  organizacion.distancia_km != null && (

                    <Text
                      style={
                        styles.infoText
                      }
                    >
                      Distancia aproximada: {
                        organizacion.distancia_km
                      } km
                    </Text>

                  )
                }


                <TouchableOpacity

                  style={
                    styles.detailButton
                  }

                  onPress={() =>
                    onSeleccionarOrganizacion(
                      organizacion
                    )
                  }

                >

                  <Text
                    style={
                      styles.detailButtonText
                    }
                  >
                    Ver organización
                  </Text>

                </TouchableOpacity>

              </View>

            )
          )

        )
      }

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

      maxWidth: 700,

      alignSelf: 'center',

      paddingBottom: 30,

    },


    title: {

      fontSize: 28,

      fontWeight: 'bold',

      color: '#164C40',

      marginBottom: 6,

    },


    subtitle: {

      fontSize: 14,

      color: '#5F6B76',

      lineHeight: 20,

      marginBottom: 20,

    },


    filterCard: {

      backgroundColor: '#FFFFFF',

      borderRadius: 16,

      padding: 16,

      marginBottom: 24,

      elevation: 2,

    },


    sectionTitle: {

      fontSize: 17,

      fontWeight: 'bold',

      color: '#1F2937',

      marginBottom: 12,

    },


    input: {

      height: 46,

      borderWidth: 1,

      borderColor: '#D7E0DD',

      borderRadius: 10,

      paddingHorizontal: 12,

      fontSize: 14,

      color: '#1F2937',

      backgroundColor: '#FFFFFF',

      marginBottom: 16,

    },


    filterLabel: {

      fontSize: 13,

      fontWeight: '600',

      color: '#48545D',

      marginBottom: 8,

    },


    chipsContainer: {

      flexDirection: 'row',

      flexWrap: 'wrap',

      gap: 8,

      marginBottom: 18,

    },


    chip: {

      paddingVertical: 8,

      paddingHorizontal: 12,

      borderRadius: 20,

      borderWidth: 1,

      borderColor: '#C9D5D1',

      backgroundColor: '#FFFFFF',

    },


    chipActive: {

      backgroundColor: '#1F6F5C',

      borderColor: '#1F6F5C',

    },


    chipText: {

      fontSize: 12,

      color: '#48545D',

    },


    chipTextActive: {

      color: '#FFFFFF',

      fontWeight: '600',

    },


    actions: {

      flexDirection: 'row',

      gap: 10,

    },


    clearButton: {

      flex: 1,

      height: 44,

      borderWidth: 1,

      borderColor: '#1F6F5C',

      borderRadius: 9,

      alignItems: 'center',

      justifyContent: 'center',

    },


    clearButtonText: {

      color: '#1F6F5C',

      fontWeight: '600',

    },


    searchButton: {

      flex: 1,

      height: 44,

      backgroundColor: '#1F6F5C',

      borderRadius: 9,

      alignItems: 'center',

      justifyContent: 'center',

    },


    searchButtonText: {

      color: '#FFFFFF',

      fontWeight: '600',

    },


    resultsTitle: {

      fontSize: 18,

      fontWeight: 'bold',

      color: '#1F2937',

      marginBottom: 12,

    },


    organizacionCard: {

      backgroundColor: '#FFFFFF',

      borderRadius: 14,

      padding: 16,

      marginBottom: 12,

      elevation: 2,

    },


    cardHeader: {

      flexDirection: 'row',

      justifyContent: 'space-between',

      alignItems: 'flex-start',

      gap: 8,

      marginBottom: 10,

    },


    organizacionNombre: {

      flex: 1,

      fontSize: 17,

      fontWeight: 'bold',

      color: '#1F2937',

    },


    verifiedBadge: {

      backgroundColor: '#E8F5F0',

      borderRadius: 12,

      paddingHorizontal: 8,

      paddingVertical: 4,

    },


    verifiedText: {

      color: '#1F6F5C',

      fontSize: 11,

      fontWeight: '600',

    },


    infoText: {

      fontSize: 13,

      color: '#5F6B76',

      marginBottom: 5,

    },


    detailButton: {

      height: 42,

      marginTop: 12,

      backgroundColor: '#1F6F5C',

      borderRadius: 9,

      alignItems: 'center',

      justifyContent: 'center',

    },


    detailButtonText: {

      color: '#FFFFFF',

      fontWeight: '600',

    },


    emptyCard: {

      backgroundColor: '#FFFFFF',

      borderRadius: 14,

      padding: 22,

      alignItems: 'center',

    },


    emptyTitle: {

      fontSize: 16,

      fontWeight: 'bold',

      color: '#1F2937',

      marginBottom: 6,

    },


    emptyText: {

      fontSize: 13,

      color: '#5F6B76',

      textAlign: 'center',

    },

    locationModeContainer: {

  flexDirection: 'row',

  gap: 8,

  marginBottom: 12,

},


locationModeButton: {

  flex: 1,

  minHeight: 42,

  borderWidth: 1,

  borderColor: '#C9D5D1',

  borderRadius: 9,

  alignItems: 'center',

  justifyContent: 'center',

  paddingHorizontal: 8,

},


locationModeButtonActive: {

  backgroundColor: '#1F6F5C',

  borderColor: '#1F6F5C',

},


locationModeButtonText: {

  fontSize: 12,

  color: '#48545D',

  textAlign: 'center',

},


locationModeButtonTextActive: {

  color: '#FFFFFF',

  fontWeight: '600',

},


locationResults: {

  backgroundColor: '#FFFFFF',

  borderWidth: 1,

  borderColor: '#D7E0DD',

  borderRadius: 10,

  marginTop: -8,

  marginBottom: 14,

  overflow: 'hidden',

},


locationResultItem: {

  padding: 12,

  borderBottomWidth: 1,

  borderBottomColor: '#EEF2F0',

},


locationResultName: {

  fontSize: 13,

  fontWeight: '600',

  color: '#1F2937',

},


locationResultDetail: {

  fontSize: 11,

  color: '#5F6B76',

  marginTop: 3,

},


currentAddress: {

  fontSize: 12,

  color: '#5F6B76',

  marginBottom: 12,

},


radiusContainer: {

  marginBottom: 10,

},

myDonationsCard: {

  backgroundColor:
    '#FFFFFF',

  borderRadius:
    14,

  borderWidth:
    1,

  borderColor:
    '#D7E8E3',

  paddingVertical:
    14,

  paddingHorizontal:
    14,

  marginBottom:
    18,

  flexDirection:
    'row',

  alignItems:
    'center',

  elevation:
    1,

},


myDonationsIcon: {

  width:
    42,

  height:
    42,

  borderRadius:
    12,

  backgroundColor:
    '#E8F5F0',

  alignItems:
    'center',

  justifyContent:
    'center',

  marginRight:
    12,

},


myDonationsIconText: {

  fontSize:
    20,

},


myDonationsContent: {

  flex:
    1,

},


myDonationsTitle: {

  fontSize:
    15,

  fontWeight:
    'bold',

  color:
    '#164C40',

},


myDonationsSubtitle: {

  fontSize:
    12,

  color:
    '#5F6B76',

  marginTop:
    2,

  lineHeight:
    17,

},


myDonationsArrow: {

  fontSize:
    28,

  color:
    '#1F6F5C',

  marginLeft:
    8,

  marginTop:
    -2,

},

  });