import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from 'react-native';


// ======================================================
// PANTALLA DE NOTIFICACIONES DEL VOLUNTARIO
// ACTIVIDAD 3.3.1
// ======================================================

export default function NotificacionesVoluntarioScreen({

  notificaciones = [],

  loading = false,

  onVolver,

  onRecargar,

  onMarcarLeida,

  onVerOportunidad,
  onVerInscripciones,
  onVerDonaciones,
  modoOrganizacion=false,
  onVerDonacion,
  onGestionarInscripciones,

}) {


  // ====================================================
  // FORMATEAR FECHA
  // ====================================================

  const formatearFecha = (fecha) => {

    if (!fecha) {
      return '';
    }

    const valor = new Date(fecha);

    if (Number.isNaN(valor.getTime())) {
      return '';
    }

    return valor.toLocaleString('es-AR', {

      day: '2-digit',

      month: '2-digit',

      year: 'numeric',

      hour: '2-digit',

      minute: '2-digit'

    });

  };


  // ====================================================
  // OBTENER ESTADO DE DISPONIBILIDAD
  // ====================================================

  const obtenerEstado = (notificacion) => {

    if (
      notificacion.tipo !== 'NUEVA_OPORTUNIDAD'
    ) {

      return null;

    }

    if (
      notificacion.oportunidad_disponible === true
    ) {

      return 'Disponible';

    }

    switch (notificacion.oportunidad_estado) {

      case 'CANCELADA':
        return 'Cancelada';

      case 'CERRADA':
        return 'Cerrada';

      case 'FINALIZADA':
        return 'Finalizada';

      default:
        return 'No disponible';

    }

  };


  return (

    <View style={styles.container}>


      {/* =============================================== */}
      {/* ENCABEZADO */}
      {/* =============================================== */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={onVolver}
          style={styles.backButton}
        >

          <Text style={styles.backText}>
            ← Volver
          </Text>

        </TouchableOpacity>


        <Text style={styles.title}>
          Mis notificaciones
        </Text>


        <Text style={styles.subtitle}>
        {modoOrganizacion
          ? 'Consultá las novedades relacionadas con tus actividades y donaciones.'
          : 'Consultá las novedades relacionadas con tu participación como voluntario.'}
      </Text>


        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRecargar}
          disabled={loading}
        >

          <Text style={styles.refreshText}>
            Actualizar
          </Text>

        </TouchableOpacity>

      </View>


      {/* =============================================== */}
      {/* CARGANDO */}
      {/* =============================================== */}

      {loading ? (

        <ActivityIndicator
          size="large"
          color="#1F6F5C"
          style={styles.loader}
        />

      ) : notificaciones.length === 0 ? (

        <View style={styles.emptyCard}>

          <Text style={styles.emptyIcon}>
            🔔
          </Text>

          <Text style={styles.emptyTitle}>
            No tenés notificaciones
          </Text>

          <Text style={styles.emptyText}>
            {modoOrganizacion
              ? 'Cuando recibas novedades relacionadas con inscripciones o donaciones, aparecerán acá.'
              : 'Cuando tengas novedades relacionadas con tus actividades, aparecerán acá.'}
          </Text>

        </View>

      ) : (

        notificaciones.map((notificacion) => {

          const noLeida =
            !notificacion.leida_en;

          const esOportunidad =
          !modoOrganizacion &&
          notificacion.tipo ===
          'NUEVA_OPORTUNIDAD';
          
           const esInscripcion =
            !modoOrganizacion &&
            notificacion.tipo ===
              'INSCRIPCION_ACEPTADA';

          const esDonacion =
            !modoOrganizacion &&
            notificacion.tipo ===
              'DONACION_COORDINADA';

          const disponible =
            notificacion.oportunidad_disponible ===
            true;

          const estado =
            obtenerEstado(notificacion);
          
            const esNuevaDonacion =
            modoOrganizacion &&
            notificacion.tipo ===
              'NUEVA_DONACION_ORGANIZACION';

          const esInscripcionCancelada =
            modoOrganizacion &&
            notificacion.tipo ===
              'INSCRIPCION_CANCELADA_ORGANIZACION';

          return (

            <View

              key={notificacion.id_notificacion}

              style={[

                styles.card,

                noLeida && styles.cardUnread

              ]}

            >


              {/* ======================================= */}
              {/* ESTADO DE LECTURA */}
              {/* ======================================= */}

              <View style={styles.cardTop}>

                <Text style={styles.cardIcon}>
                  🔔
                </Text>


                {noLeida && (

                  <View style={styles.unreadBadge}>

                    <Text style={styles.unreadText}>
                      Nueva
                    </Text>

                  </View>

                )}

              </View>


              {/* ======================================= */}
              {/* CONTENIDO */}
              {/* ======================================= */}

              <Text style={styles.cardTitle}>

                {notificacion.titulo}

              </Text>


              <Text style={styles.cardMessage}>

                {notificacion.mensaje}

              </Text>


              <Text style={styles.cardDate}>

                {formatearFecha(
                  notificacion.creada_en
                )}

              </Text>


              {/* ======================================= */}
              {/* DISPONIBILIDAD */}
              {/* ======================================= */}

              {esOportunidad && (

                <View style={[

                  styles.statusBadge,

                  disponible
                    ? styles.statusAvailable
                    : styles.statusUnavailable

                ]}>

                  <Text style={[

                    styles.statusText,

                    disponible
                      ? styles.statusAvailableText
                      : styles.statusUnavailableText

                  ]}>

                    {estado}

                  </Text>

                </View>

              )}


              {/* ======================================= */}
              {/* ACCIONES */}
              {/* ======================================= */}

              <View style={styles.actions}>


                {noLeida && (

                  <TouchableOpacity

                    style={styles.readButton}

                    onPress={() =>
                      onMarcarLeida(notificacion)
                    }

                  >

                    <Text style={styles.readButtonText}>
                      Marcar como leída
                    </Text>

                  </TouchableOpacity>

                )}


                {esOportunidad && disponible && (

                  <TouchableOpacity

                    style={styles.detailButton}

                    onPress={() =>
                      onVerOportunidad(notificacion)
                    }

                  >

                    <Text style={styles.detailButtonText}>
                      Ver oportunidad
                    </Text>

                  </TouchableOpacity>
                )}

                {/* ======================================= */}
                {/* VER INSCRIPCIONES */}
                {/* ======================================= */}

                {esInscripcion && (

                  <TouchableOpacity

                    style={styles.detailButton}

                    onPress={() =>
                      onVerInscripciones(notificacion)
                    }

                  >

                    <Text style={styles.detailButtonText}>
                      Ver mis inscripciones
                    </Text>

                  </TouchableOpacity>

                )}


                {/* ======================================= */}
                {/* VER DONACIONES */}
                {/* ======================================= */}

                {esDonacion && (

                  <TouchableOpacity

                    style={styles.detailButton}

                    onPress={() =>
                      onVerDonaciones(notificacion)
                    }

                  >

                    <Text style={styles.detailButtonText}>
                      Ver mis donaciones
                    </Text>

                  </TouchableOpacity>

                )}

              {/* ==================================================
                    VER DONACIÓN RECIBIDA
                    ACTIVIDAD 3.3.2
                ================================================== */}

                {esNuevaDonacion &&
                  notificacion.id_donacion && (

                  <TouchableOpacity

                    style={styles.detailButton}

                   onPress={() =>
                      onVerDonacion(notificacion)
                    }

                    activeOpacity={0.8}

                  >

                    <Text style={styles.detailButtonText}>
                      Ver donación
                    </Text>

                  </TouchableOpacity>

                )}


                {/* ==================================================
                    GESTIONAR INSCRIPCIONES
                    ACTIVIDAD 3.3.2
                ================================================== */}

                {esInscripcionCancelada &&
                  notificacion.id_oportunidad && (

                  <TouchableOpacity

                    style={styles.detailButton}

                   onPress={() =>
                    onGestionarInscripciones(notificacion)
                  }

                    activeOpacity={0.8}

                  >

                    <Text style={styles.detailButtonText}>
                      Gestionar inscripciones
                    </Text>

                  </TouchableOpacity>

                )}

              </View>


            </View>

          );

        })

      )}

    </View>

  );

}


// ======================================================
// ESTILOS
// ======================================================

const styles = StyleSheet.create({

  container: {
    width: '100%',
    maxWidth: 500,
    paddingBottom: 24
  },

  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#DDE5E2'
  },

backButton: {
  alignSelf: 'flex-start',
  backgroundColor: '#1F6F5C',
  borderRadius: 9,
  paddingVertical: 10,
  paddingHorizontal: 16,
  marginBottom: 16
},

backText: {
  color: '#FFFFFF',
  fontWeight: '700',
  fontSize: 14
},

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#164C40'
  },

  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: '#5F6B76',
    lineHeight: 19
  },

  refreshButton: {
    marginTop: 14,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: '#EAF5F2'
  },

  refreshText: {
    color: '#1F6F5C',
    fontWeight: '700'
  },

  loader: {
    marginTop: 32
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 28,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDE5E2'
  },

  emptyIcon: {
    fontSize: 36,
    marginBottom: 12
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#164C40'
  },

  emptyText: {
    fontSize: 13,
    color: '#5F6B76',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE5E2',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12
  },

  cardUnread: {
    backgroundColor: '#F0F9F6',
    borderColor: '#9FD0C1',
    borderLeftWidth: 4,
    borderLeftColor: '#1F6F5C'
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },

  cardIcon: {
    fontSize: 20
  },

  unreadBadge: {
    marginLeft: 8,
    backgroundColor: '#1F6F5C',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10
  },

  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },

  cardTitle: {
    color: '#164C40',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8
  },

  cardMessage: {
    color: '#4B5563',
    fontSize: 13,
    lineHeight: 20
  },

  cardDate: {
    color: '#87929D',
    fontSize: 11,
    marginTop: 12
  },

  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 12
  },

  statusAvailable: {
    backgroundColor: '#E0F2E9'
  },

  statusUnavailable: {
    backgroundColor: '#F3F4F6'
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700'
  },

  statusAvailableText: {
    color: '#167349'
  },

  statusUnavailableText: {
    color: '#6B7280'
  },

  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14
  },

  readButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#1F6F5C'
  },

  readButtonText: {
    color: '#1F6F5C',
    fontWeight: '700',
    fontSize: 12
  },

  detailButton: {
    backgroundColor: '#1F6F5C',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 10
  },

  detailButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12
  }

});