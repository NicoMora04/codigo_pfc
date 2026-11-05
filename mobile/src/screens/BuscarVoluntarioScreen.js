import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import BuscarOportunidadesScreen
  from './BuscarOportunidadesScreen';

import OrganizacionesPublicasScreen
  from './OrganizacionesPublicasScreen';


export default function BuscarVoluntarioScreen({
  modoBusqueda,
  onCambiarModo,

  // Oportunidades
  oportunidades,
  tiposActividad,
  loading,
  inscripciones,
  onInscribirse,
  onFiltrarOportunidades,
  onBuscarUbicacion,
  onLogout,
  onVerDetalleOportunidad,
  filtrosOportunidades,
  estadoUbicacionGuardado,
  onGuardarEstadoUbicacion,
  showAlert,

  // Organizaciones
  organizaciones,
  loadingOrganizaciones,
  filtrosOrganizaciones,
  onFiltrarOrganizaciones,
  onSeleccionarOrganizacion,
}) {

  return (

    <View style={styles.container}>

      {/* ================================================= */}
      {/* SELECTOR */}
      {/* ================================================= */}

      <View style={styles.tabsContainer}>

        <TouchableOpacity
          style={[
            styles.tab,

            modoBusqueda ===
              'OPORTUNIDADES' &&
              styles.tabActive
          ]}
          onPress={() =>
            onCambiarModo(
              'OPORTUNIDADES'
            )
          }
        >

          <Text
            style={[
              styles.tabText,

              modoBusqueda ===
                'OPORTUNIDADES' &&
                styles.tabTextActive
            ]}
          >
            Oportunidades
          </Text>

        </TouchableOpacity>


        <TouchableOpacity
          style={[
            styles.tab,

            modoBusqueda ===
              'ORGANIZACIONES' &&
              styles.tabActive
          ]}
          onPress={() =>
            onCambiarModo(
              'ORGANIZACIONES'
            )
          }
        >

          <Text
            style={[
              styles.tabText,

              modoBusqueda ===
                'ORGANIZACIONES' &&
                styles.tabTextActive
            ]}
          >
            Organizaciones
          </Text>

        </TouchableOpacity>

      </View>


      {/* ================================================= */}
      {/* OPORTUNIDADES */}
      {/* ================================================= */}

      {modoBusqueda ===
        'OPORTUNIDADES' && (

        <BuscarOportunidadesScreen

          oportunidades={
            oportunidades
          }

          tiposActividad={
            tiposActividad
          }

          loading={
            loading
          }

          inscripciones={
            inscripciones
          }

          onInscribirse={
            onInscribirse
          }

          onFiltrar={
            onFiltrarOportunidades
          }

          onBuscarUbicacion={
            onBuscarUbicacion
          }

          onLogout={
            onLogout
          }

          onVerDetalle={
            onVerDetalleOportunidad
          }

          filtrosGuardados={
            filtrosOportunidades
          }

          estadoUbicacionGuardado={
            estadoUbicacionGuardado
          }

          onGuardarEstadoUbicacion={
            onGuardarEstadoUbicacion
          }

          showAlert={
            showAlert
          }

        />

      )}


      {/* ================================================= */}
      {/* ORGANIZACIONES */}
      {/* ================================================= */}

      {modoBusqueda ===
        'ORGANIZACIONES' && (

        <OrganizacionesPublicasScreen

          organizaciones={
            organizaciones
          }

          loading={
            loadingOrganizaciones
          }

          tiposActividad={
            tiposActividad
          }

          filtrosGuardados={
            filtrosOrganizaciones
          }

          onFiltrar={
            onFiltrarOrganizaciones
          }

          onSeleccionarOrganizacion={
            onSeleccionarOrganizacion
          }

        />

      )}

    </View>

  );

}


const styles =
  StyleSheet.create({

    container: {

      width: '100%',

    },


    tabsContainer: {

      width: '100%',

      maxWidth: 700,

      alignSelf: 'center',

      flexDirection: 'row',

      backgroundColor: '#FFFFFF',

      borderRadius: 12,

      padding: 4,

      marginBottom: 18,

      borderWidth: 1,

      borderColor: '#DDE5E2',

    },


    tab: {

      flex: 1,

      minHeight: 44,

      alignItems: 'center',

      justifyContent: 'center',

      borderRadius: 9,

    },


    tabActive: {

      backgroundColor: '#1F6F5C',

    },


    tabText: {

      fontSize: 13,

      fontWeight: '600',

      color: '#5F6B76',

    },


    tabTextActive: {

      color: '#FFFFFF',

    },

  });