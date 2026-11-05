import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from 'react-native';


export default function OrganizacionesPublicasScreen({
  organizaciones = [],
  loading,
  tiposActividad = [],
  filtrosGuardados = {},
  onFiltrar,
  onSeleccionarOrganizacion,
}) {

  const [
    nombreBusqueda,
    setNombreBusqueda
  ] = React.useState(
    filtrosGuardados.nombre ?? ''
  );


  const [
    ubicacionBusqueda,
    setUbicacionBusqueda
  ] = React.useState(
    filtrosGuardados.ubicacion ?? ''
  );


  const [
    tipoSeleccionado,
    setTipoSeleccionado
  ] = React.useState(
    filtrosGuardados.idTipoActividad ?? null
  );


  // ======================================================
  // RESTAURAR FILTROS
  // ======================================================

  React.useEffect(() => {

    setNombreBusqueda(
      filtrosGuardados.nombre ?? ''
    );


    setUbicacionBusqueda(
      filtrosGuardados.ubicacion ?? ''
    );


    setTipoSeleccionado(
      filtrosGuardados.idTipoActividad ?? null
    );

  }, [
    filtrosGuardados
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
        ubicacionBusqueda.trim()
      ) {

        filtros.ubicacion =
          ubicacionBusqueda.trim();

      }


      if (
        tipoSeleccionado != null
      ) {

        filtros.idTipoActividad =
          tipoSeleccionado;

      }


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


      setUbicacionBusqueda(
        ''
      );


      setTipoSeleccionado(
        null
      );


      await onFiltrar(
        {}
      );

    };


  return (

    <View style={styles.container}>

      {/* ================================================= */}
      {/* ENCABEZADO */}
      {/* ================================================= */}

      <View style={styles.header}>

        <Text style={styles.title}>
          Organizaciones
        </Text>


        <Text style={styles.subtitle}>
          Explorá organizaciones verificadas y conocé
          las oportunidades de voluntariado que ofrecen.
        </Text>

      </View>


      {/* ================================================= */}
      {/* FILTROS */}
      {/* ================================================= */}

      <View style={styles.filterCard}>

        <Text style={styles.sectionTitle}>
          Buscar organización
        </Text>


        <Text style={styles.filterLabel}>
          Nombre
        </Text>


        <TextInput
          style={styles.input}
          placeholder="Ej. Actitud Solidaria"
          placeholderTextColor="#6B7280"
          value={nombreBusqueda}
          onChangeText={
            setNombreBusqueda
          }
        />


        <Text style={styles.filterLabel}>
          Ubicación
        </Text>


        <TextInput
          style={styles.input}
          placeholder="Ej. Santa Fe"
          placeholderTextColor="#6B7280"
          value={ubicacionBusqueda}
          onChangeText={
            setUbicacionBusqueda
          }
        />


        {/* ================================================= */}
        {/* TIPOS DE ACTIVIDAD */}
        {/* ================================================= */}

        <Text style={styles.filterLabel}>
          Tipo de actividad
        </Text>


        <View style={styles.chipsContainer}>

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


          {tiposActividad.map(
            tipo => (

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
          )}

        </View>


        {/* ================================================= */}
        {/* ACCIONES */}
        {/* ================================================= */}

        <View style={styles.actions}>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={
              limpiarFiltros
            }
          >

            <Text style={styles.clearButtonText}>
              Limpiar
            </Text>

          </TouchableOpacity>


          <TouchableOpacity
            style={styles.searchButton}
            onPress={
              aplicarFiltros
            }
          >

            <Text style={styles.searchButtonText}>
              Buscar
            </Text>

          </TouchableOpacity>

        </View>

      </View>


      {/* ================================================= */}
      {/* RESULTADOS */}
      {/* ================================================= */}

      <Text style={styles.resultsTitle}>
        Organizaciones disponibles
      </Text>


      {loading ? (

        <ActivityIndicator
          size="large"
          color="#1F6F5C"
          style={styles.loader}
        />

      ) : organizaciones.length === 0 ? (

        <View style={styles.emptyCard}>

          <Text style={styles.emptyTitle}>
            No encontramos organizaciones
          </Text>


          <Text style={styles.emptyText}>
            Probá modificando los filtros
            de búsqueda.
          </Text>

        </View>

      ) : (

        organizaciones.map(
          organizacion => (

            <View
              key={
                organizacion.slug
              }
              style={
                styles.organizacionCard
              }
            >

              <View style={styles.cardHeader}>

                <Text
                  style={
                    styles.organizacionNombre
                  }
                >
                  {
                    organizacion
                      .nombre_visible
                  }
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


              {!!organizacion
                .descripcion_publica && (

                <Text
                  style={
                    styles.description
                  }
                  numberOfLines={3}
                >
                  {
                    organizacion
                      .descripcion_publica
                  }
                </Text>

              )}


              {organizacion
                .ubicacion_aproximada && (

                <Text style={styles.infoText}>

                  📍 {
                    [
                      organizacion
                        .ubicacion_aproximada
                        .localidad,

                      organizacion
                        .ubicacion_aproximada
                        .provincia,
                    ]
                      .filter(Boolean)
                      .join(', ')
                  }

                </Text>

              )}


              {organizacion
                .tipos_actividad
                ?.length > 0 && (

                <View
                  style={
                    styles.activityContainer
                  }
                >

                  {organizacion
                    .tipos_actividad
                    .map(
                      tipo => (

                        <View
                          key={
                            tipo
                              .id_tipo_actividad ||
                            tipo.nombre ||
                            tipo
                          }
                          style={
                            styles.activityChip
                          }
                        >

                          <Text
                            style={
                              styles.activityChipText
                            }
                          >
                            {
                              tipo.nombre ||
                              tipo
                            }
                          </Text>

                        </View>

                      )
                    )}

                </View>

              )}


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
                  Ver perfil
                </Text>

              </TouchableOpacity>

            </View>

          )
        )

      )}

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


    header: {

      backgroundColor: '#FFFFFF',

      borderRadius: 16,

      padding: 18,

      marginBottom: 18,

      borderWidth: 1,
      borderColor: '#DDE5E2',

      elevation: 2,

    },


    title: {

      fontSize: 26,

      fontWeight: 'bold',

      color: '#164C40',

    },


    subtitle: {

      fontSize: 14,

      color: '#5F6B76',

      lineHeight: 20,

      marginTop: 5,

    },


    filterCard: {

      backgroundColor: '#FFFFFF',

      borderRadius: 16,

      padding: 16,

      marginBottom: 24,

      borderWidth: 1,
      borderColor: '#DDE5E2',

      elevation: 1,

    },


    sectionTitle: {

      fontSize: 17,

      fontWeight: '700',

      color: '#164C40',

      marginBottom: 14,

    },


    filterLabel: {

      fontSize: 13,

      fontWeight: '600',

      color: '#48545D',

      marginBottom: 7,

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


    chipsContainer: {

      flexDirection: 'row',

      flexWrap: 'wrap',

      justifyContent: 'space-between',

      rowGap: 10,

      marginTop: 4,

      marginBottom: 18,

    },


    chip: {

      width: '48%',

      minHeight: 44,

      backgroundColor: '#FFFFFF',

      borderWidth: 1,
      borderColor: '#D7DEDA',

      borderRadius: 12,

      paddingHorizontal: 10,
      paddingVertical: 10,

      justifyContent: 'center',
      alignItems: 'center',

    },


    chipActive: {

      backgroundColor: '#1F6F5C',

      borderColor: '#1F6F5C',

    },


    chipText: {

      fontSize: 12,

      fontWeight: '600',

      color: '#5F6B76',

      textAlign: 'center',

    },


    chipTextActive: {

      color: '#FFFFFF',

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

      fontWeight: '700',

      color: '#1F2937',

      marginBottom: 12,

    },


    loader: {

      marginTop: 30,

    },


    organizacionCard: {

      backgroundColor: '#FFFFFF',

      borderRadius: 14,

      padding: 16,

      marginBottom: 12,

      borderWidth: 1,
      borderColor: '#DDE5E2',

      elevation: 1,

    },


    cardHeader: {

      flexDirection: 'row',

      justifyContent: 'space-between',

      alignItems: 'flex-start',

      gap: 8,

      marginBottom: 8,

    },


    organizacionNombre: {

      flex: 1,

      fontSize: 17,

      fontWeight: '700',

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


    description: {

      fontSize: 13,

      color: '#5F6B76',

      lineHeight: 19,

      marginBottom: 10,

    },


    infoText: {

      fontSize: 13,

      color: '#5F6B76',

      marginBottom: 8,

    },


    activityContainer: {

      flexDirection: 'row',

      flexWrap: 'wrap',

      gap: 6,

      marginTop: 4,

    },


    activityChip: {

      backgroundColor: '#EAF5F2',

      borderRadius: 14,

      paddingHorizontal: 9,

      paddingVertical: 5,

    },


    activityChipText: {

      fontSize: 11,

      color: '#164C40',

      fontWeight: '600',

    },


    detailButton: {

      height: 42,

      marginTop: 14,

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

      borderWidth: 1,
      borderColor: '#DDE5E2',

    },


    emptyTitle: {

      fontSize: 16,

      fontWeight: '700',

      color: '#1F2937',

      marginBottom: 6,

    },


    emptyText: {

      fontSize: 13,

      color: '#5F6B76',

      textAlign: 'center',

    },

  });