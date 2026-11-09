import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';


export default function InicioAdminScreen({
  onOrganizaciones,
  onUsuarios,
  onPerfiles,
  onTiposActividad,
  onEstadisticas,
  onLogout
}) {

  // ======================================================
  // ACCESOS DIRECTOS DEL ADMINISTRADOR
  // ACTIVIDAD 3.5.1
  // ======================================================

  const accesos = [

    {
      id: 'organizaciones',
      icono: '🏢',
      titulo: 'Organizaciones',
      descripcion:
        'Revisar solicitudes y gestionar verificaciones.',
      accion: onOrganizaciones
    },

    {
      id: 'usuarios',
      icono: '👥',
      titulo: 'Usuarios',
      descripcion:
        'Consultar cuentas y administrar su estado.',
      accion: onUsuarios
    },

    {
      id: 'perfiles',
      icono: '🪪',
      titulo: 'Perfiles públicos',
      descripcion:
        'Supervisar los perfiles institucionales.',
      accion: onPerfiles
    },

    {
      id: 'tipos',
      icono: '🏷️',
      titulo: 'Tipos de actividad',
      descripcion:
        'Administrar las categorías de voluntariado.',
      accion: onTiposActividad
    },

    {
      id: 'estadisticas',
      icono: '📊',
      titulo: 'Estadísticas',
      descripcion:
        'Consultar los indicadores generales.',
      accion: onEstadisticas
    }

  ];


  return (

    <View style={styles.container}>

      {/* ================================================ */}
      {/* ENCABEZADO */}
      {/* ================================================ */}

      <View style={styles.header}>

      <View style={styles.headerTop}>

            <Text style={styles.headerLabel}>
                PANEL DE ADMINISTRACIÓN
            </Text>

            <TouchableOpacity
                onPress={onLogout}
                style={styles.logoutHeaderButton}
                accessibilityRole="button"
                accessibilityLabel="Cerrar sesión"
            >
                <Text style={styles.logoutHeaderText}>
                Cerrar sesión
                </Text>
            </TouchableOpacity>

            </View>

        <Text style={styles.title}>
          Bienvenido
        </Text>

        <Text style={styles.subtitle}>
          Gestioná y supervisá las principales
          funcionalidades de la plataforma.
        </Text>

      </View>


      {/* ================================================ */}
      {/* ACCESOS RÁPIDOS */}
      {/* ================================================ */}

      <View style={styles.sectionHeader}>

        <Text style={styles.sectionTitle}>
          Gestión de la plataforma
        </Text>

        <Text style={styles.sectionSubtitle}>
          Seleccioná una sección para comenzar.
        </Text>

      </View>


      {/* ================================================ */}
      {/* TARJETAS DE NAVEGACIÓN */}
      {/* ================================================ */}

      <View style={styles.cardsContainer}>

        {accesos.map(acceso => (

          <TouchableOpacity
            key={acceso.id}
            style={styles.card}
            onPress={acceso.accion}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={acceso.titulo}
          >

            <View style={styles.cardIconContainer}>

              <Text style={styles.cardIcon}>
                {acceso.icono}
              </Text>

            </View>


            <View style={styles.cardContent}>

              <Text style={styles.cardTitle}>
                {acceso.titulo}
              </Text>

              <Text style={styles.cardDescription}>
                {acceso.descripcion}
              </Text>

            </View>


            <Text style={styles.cardArrow}>
              ›
            </Text>

          </TouchableOpacity>

        ))}

      </View>

    </View>

  );

}


// ======================================================
// ESTILOS
// ======================================================

const styles = StyleSheet.create({

  container: {
    width: '100%',
    maxWidth: 550,
    paddingBottom: 20
  },

  header: {
    backgroundColor: '#164C40',
    borderRadius: 20,
    padding: 24,
    marginBottom: 28
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18
  },

  headerLabel: {
    color: '#B8E4D5',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1
  },

  roleBadge: {
    backgroundColor: '#2D755F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },

  roleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },

  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10
  },

  subtitle: {
    color: '#E0F2EA',
    fontSize: 14,
    lineHeight: 21
  },

  sectionHeader: {
    marginBottom: 16
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#164C40',
    marginBottom: 5
  },

  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280'
  },

  cardsContainer: {
    gap: 12
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E8E4',
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 4
  },

  cardIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#EAF5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14
  },

  cardIcon: {
    fontSize: 25
  },

  cardContent: {
    flex: 1
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#164C40',
    marginBottom: 4
  },

  cardDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18
  },

  cardArrow: {
    fontSize: 28,
    color: '#1F6F5C',
    marginLeft: 8
  },

  logoutButton: {
    marginTop: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3B4B4',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },

  logoutText: {
    color: '#B42318',
    fontSize: 14,
    fontWeight: '700'
  },

  logoutHeaderButton: {
  paddingHorizontal: 12,
  paddingVertical: 8,
  backgroundColor: 'rgba(255,255,255,0.12)',
  borderRadius: 10,
},

logoutHeaderText: {
  color: '#FFFFFF',
  fontSize: 12,
  fontWeight: '600',
},

});