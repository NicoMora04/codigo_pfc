import React, {
  useState
} from 'react';

import MapaLeaflet
  from '../components/MapaLeaflet';

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';


export default function InicioOrganizacionScreen({
  oportunidades = [],
  loading,
  onMisOportunidades,
  onNuevaOportunidad,
  onMiOrganizacion,
  onLogout,
}) {


  // =====================================================
  // FILTRO DEL MAPA
  // =====================================================

  const [
    filtroMapa,
    setFiltroMapa
  ] = useState(
    'PUBLICADA'
  );


  const estadosMapa = [

    {
      valor: 'TODAS',
      etiqueta: 'Todas',
    },

    {
      valor: 'BORRADOR',
      etiqueta: 'Borradores',
    },

    {
      valor: 'PUBLICADA',
      etiqueta: 'Publicadas',
    },

    {
      valor: 'CERRADA',
      etiqueta: 'Cerradas',
    },

    {
      valor: 'FINALIZADA',
      etiqueta: 'Finalizadas',
    },

    {
      valor: 'CANCELADA',
      etiqueta: 'Canceladas',
    },

  ];


  // =====================================================
  // CONTADORES
  // =====================================================

  const contarPorEstado =
    (estado) =>
      oportunidades.filter(
        (oportunidad) =>
          oportunidad.estado ===
          estado
      ).length;


  const publicadas =
    contarPorEstado(
      'PUBLICADA'
    );


  const borradores =
    contarPorEstado(
      'BORRADOR'
    );


  const cerradas =
    contarPorEstado(
      'CERRADA'
    );


  const finalizadas =
    contarPorEstado(
      'FINALIZADA'
    );


  // =====================================================
  // FILTRADO DEL MAPA
  // =====================================================

  const oportunidadesMapa =

    filtroMapa ===
      'TODAS'

      ? oportunidades

      : oportunidades.filter(
          (oportunidad) =>
            oportunidad.estado ===
            filtroMapa
        );


  // =====================================================
  // OPORTUNIDADES PUBLICADAS PARA RESUMEN
  // =====================================================

  const proximasOportunidades =
    oportunidades

      .filter(
        (oportunidad) =>
          oportunidad.estado ===
          'PUBLICADA'
      )

      .slice(
        0,
        3
      );


  // =====================================================
  // TEXTO DEL ESTADO ACTUAL
  // =====================================================

  const estadoSeleccionado =
    estadosMapa.find(
      (estado) =>
        estado.valor ===
        filtroMapa
    );


  const textoEstadoMapa =
    estadoSeleccionado
      ?.etiqueta ||
      'Oportunidades';


  return (

    <View style={styles.container}>


      {/* ================================================= */}
      {/* ENCABEZADO */}
      {/* ================================================= */}

      <View style={styles.header}>

        <View>

          <Text style={styles.title}>
            Inicio
          </Text>


          <Text style={styles.subtitle}>
            Administrá las oportunidades de voluntariado de tu organización.
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
          Gestioná tus actividades
        </Text>


        <Text style={styles.welcomeText}>
          Creá nuevas oportunidades, administrá las existentes y seguí el estado de tus publicaciones.
        </Text>


        <TouchableOpacity
          style={styles.primaryButton}
          onPress={
            onNuevaOportunidad
          }
        >

          <Text style={styles.primaryButtonText}>
            + Nueva oportunidad
          </Text>

        </TouchableOpacity>

      </View>


      {/* ================================================= */}
      {/* RESUMEN */}
      {/* ================================================= */}

      <Text style={styles.sectionTitle}>
        Resumen
      </Text>


      <Text style={styles.sectionSubtitle}>
        Estado actual de tus oportunidades.
      </Text>


      {loading ? (

        <ActivityIndicator
          size="large"
          color="#1F6F5C"
          style={styles.loader}
        />

      ) : (

        <View style={styles.statsContainer}>


          <View style={styles.statCard}>

            <Text style={styles.statNumber}>
              {publicadas}
            </Text>

            <Text style={styles.statLabel}>
              Publicadas
            </Text>

          </View>


          <View style={styles.statCard}>

            <Text style={styles.statNumber}>
              {borradores}
            </Text>

            <Text style={styles.statLabel}>
              Borradores
            </Text>

          </View>


          <View style={styles.statCard}>

            <Text style={styles.statNumber}>
              {cerradas}
            </Text>

            <Text style={styles.statLabel}>
              Cerradas
            </Text>

          </View>


          <View style={styles.statCard}>

            <Text style={styles.statNumber}>
              {finalizadas}
            </Text>

            <Text style={styles.statLabel}>
              Finalizadas
            </Text>

          </View>

        </View>

      )}


      {/* ================================================= */}
      {/* MAPA DE OPORTUNIDADES */}
      {/* ================================================= */}

      <View style={styles.mapSection}>

        <Text style={styles.sectionTitle}>
          Ubicación de tus oportunidades
        </Text>


        <Text style={styles.sectionSubtitle}>
          Seleccioná un estado para consultar las actividades correspondientes en el mapa.
        </Text>


        {/* =============================================== */}
        {/* FILTROS */}
        {/* =============================================== */}

        <View style={styles.mapFilters}>

          {estadosMapa.map(
            (estado) => (

              <TouchableOpacity

                key={
                  estado.valor
                }

                style={[

                  styles.mapFilterButton,

                  filtroMapa ===
                    estado.valor &&
                    styles.mapFilterButtonActive

                ]}

                onPress={() => {

                  setFiltroMapa(
                    estado.valor
                  );

                }}

                activeOpacity={
                  0.8
                }

              >

                <Text
                  style={[

                    styles.mapFilterText,

                    filtroMapa ===
                      estado.valor &&
                      styles.mapFilterTextActive

                  ]}
                >

                  {estado.etiqueta}

                </Text>

              </TouchableOpacity>

            )
          )}

        </View>


        {/* =============================================== */}
        {/* INFORMACIÓN DEL FILTRO */}
        {/* =============================================== */}

        <View style={styles.mapFilterInfo}>

          <Text style={styles.mapFilterInfoText}>

            {textoEstadoMapa}:{' '}

            <Text style={styles.mapFilterInfoStrong}>
              {oportunidadesMapa.length}
            </Text>

          </Text>

        </View>


        {/* =============================================== */}
        {/* MAPA */}
        {/* =============================================== */}

        {oportunidadesMapa.length > 0 ? (

          <>

            <MapaLeaflet

              /*
                Fuerza una reconstrucción al cambiar
                de estado.

                MapaLeaflet ya maneja internamente
                cambios de oportunidades, pero esto
                agrega una garantía extra en esta
                pantalla.
              */

              key={
                `mapa-organizacion-${filtroMapa}`
              }

              oportunidades={
                oportunidadesMapa
              }

              mostrarBotonDetalle={
                false
              }

            />


            <View style={styles.mapLegend}>

              <View style={styles.legendItem}>

                <View
                  style={
                    styles.opportunityMarker
                  }
                />

                <Text style={styles.legendText}>
                  Oportunidad
                </Text>

              </View>


              {oportunidadesMapa.some(
                (oportunidad) =>

                  Number(
                    oportunidad.radio_km
                  ) > 0

              ) && (

                <View style={styles.legendItem}>

                  <View
                    style={
                      styles.approximateMarker
                    }
                  />

                  <Text style={styles.legendText}>
                    Zona aproximada
                  </Text>

                </View>

              )}

            </View>

          </>

        ) : (

          <View style={styles.emptyMapCard}>

            <Text style={styles.emptyMapIcon}>
              🗺️
            </Text>


            <Text style={styles.emptyTitle}>
              No hay oportunidades
            </Text>


            <Text style={styles.emptyText}>

              No existen oportunidades con estado{' '}

              <Text style={styles.emptyStateText}>
                {textoEstadoMapa.toLowerCase()}
              </Text>

              .

            </Text>

          </View>

        )}

      </View>


      {/* ================================================= */}
      {/* PUBLICADAS RECIENTES */}
      {/* ================================================= */}

      <View style={styles.recentSection}>

        <Text style={styles.sectionTitle}>
          Oportunidades publicadas
        </Text>


        <Text style={styles.sectionSubtitle}>
          Algunas de tus actividades actualmente visibles para los voluntarios.
        </Text>


        {proximasOportunidades.length === 0 ? (

          <View style={styles.emptyCard}>

            <Text style={styles.emptyTitle}>
              No hay oportunidades publicadas
            </Text>


            <Text style={styles.emptyText}>
              Podés crear una nueva oportunidad o publicar un borrador existente.
            </Text>

          </View>

        ) : (

          proximasOportunidades.map(
            (oportunidad) => (

              <View
                key={
                  oportunidad.id_oportunidad
                }
                style={styles.opportunityCard}
              >

                <Text style={styles.opportunityTitle}>
                  {oportunidad.titulo}
                </Text>


                {!!oportunidad.tipo_actividad && (

                  <Text style={styles.infoText}>
                    {oportunidad.tipo_actividad}
                  </Text>

                )}


                <Text style={styles.infoText}>
                  Estado: {oportunidad.estado}
                </Text>


                <Text style={styles.infoText}>
                  Cupos ocupados:{' '}
                  {oportunidad.cupos_ocupados ?? 0}
                  {' / '}
                  {oportunidad.cupo_total}
                </Text>


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

              </View>

            )
          )

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


    header: {

      marginBottom: 18,

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

      marginTop: 10,

    },


    welcomeCard: {

      backgroundColor: '#EAF5F2',

      borderRadius: 18,

      padding: 18,

      marginBottom: 20,

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

      marginVertical: 25,

    },


    // =====================================================
    // RESUMEN
    // =====================================================

    statsContainer: {

      flexDirection: 'row',
      flexWrap: 'wrap',

      gap: 10,

      marginBottom: 22,

    },


    statCard: {

      width: '47%',

      backgroundColor: '#FFFFFF',

      borderRadius: 14,

      padding: 16,

      borderWidth: 1,
      borderColor: '#DDE5E2',

      alignItems: 'center',

    },


    statNumber: {

      fontSize: 24,
      fontWeight: '700',
      color: '#1F6F5C',

    },


    statLabel: {

      fontSize: 12,
      color: '#5F6B76',

      marginTop: 4,

    },


    // =====================================================
    // MAPA
    // =====================================================

    mapSection: {

      backgroundColor: '#FFFFFF',

      borderRadius: 16,

      padding: 16,

      marginBottom: 22,

      borderWidth: 1,
      borderColor: '#DDE5E2',

    },


    // =====================================================
    // FILTROS DEL MAPA
    // =====================================================

    mapFilters: {

      flexDirection: 'row',
      flexWrap: 'wrap',

      gap: 7,

      marginBottom: 12,

    },


    mapFilterButton: {

      backgroundColor: '#F2F5F4',

      borderRadius: 9,

      paddingVertical: 9,
      paddingHorizontal: 11,

      borderWidth: 1,
      borderColor: '#DDE5E2',

    },


    mapFilterButtonActive: {

      backgroundColor: '#1F6F5C',

      borderColor: '#1F6F5C',

    },


    mapFilterText: {

      fontSize: 11,
      fontWeight: '600',

      color: '#5F6B76',

    },


    mapFilterTextActive: {

      color: '#FFFFFF',

    },


    mapFilterInfo: {

      backgroundColor: '#F8FAF9',

      borderRadius: 9,

      paddingVertical: 8,
      paddingHorizontal: 10,

      marginBottom: 12,

    },


    mapFilterInfoText: {

      fontSize: 12,
      color: '#5F6B76',

    },


    mapFilterInfoStrong: {

      fontWeight: '700',
      color: '#164C40',

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


    emptyMapCard: {

      paddingVertical: 25,

      alignItems: 'center',

      backgroundColor: '#F8FAF9',

      borderRadius: 12,

    },


    emptyMapIcon: {

      fontSize: 28,

      marginBottom: 8,

    },


    emptyStateText: {

      fontWeight: '700',

    },


    // =====================================================
    // OPORTUNIDADES PUBLICADAS
    // =====================================================

    recentSection: {

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


    infoText: {

      fontSize: 12,
      color: '#5F6B76',

      marginTop: 5,

    },


    // =====================================================
    // VACÍOS
    // =====================================================

    emptyCard: {

      backgroundColor: '#FFFFFF',

      borderRadius: 14,

      padding: 20,

      borderWidth: 1,
      borderColor: '#DDE5E2',

    },


    emptyTitle: {

      fontSize: 15,
      fontWeight: '700',
      color: '#164C40',

    },


    emptyText: {

      fontSize: 12,
      color: '#5F6B76',

      lineHeight: 17,

      marginTop: 5,

      textAlign: 'center',

    },

  });