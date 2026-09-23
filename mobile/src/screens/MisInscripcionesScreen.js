import React from 'react';
import ConfirmModal from '../components/ConfirmModal';

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';


export default function MisInscripcionesScreen({
  inscripciones = [],
  loading,
  onVerDetalle,
  onOcultar,
  onCancelar,
  filtroEstado,
  onCambiarFiltroEstado,
}) {

 const obtenerEstadoMostrado = (inscripcion) => {

  if (
    inscripcion.oportunidad_estado ===
    'CANCELADA'
  ) {
    return 'Actividad cancelada';
  }

  if (
    inscripcion.estado ===
    'COMPLETADA'
  ) {
    return 'Actividad completada';
  }

  if (
    inscripcion.estado ===
    'AUSENTE'
  ) {
    return 'Ausente';
  }

  if (
    inscripcion.oportunidad_estado ===
    'FINALIZADA'
  ) {
    return 'Actividad finalizada';
  }

  switch (inscripcion.estado) {

    case 'PENDIENTE':
      return 'Solicitud pendiente';

    case 'ACEPTADA':
      return 'Inscripción aceptada';

    case 'RECHAZADA':
      return 'Inscripción rechazada';

    case 'CANCELADA':
      return 'Inscripción cancelada';

    default:
      return inscripcion.estado;

  }

};

const [
  confirmacion,
  setConfirmacion
] = React.useState(null);



const cerrarConfirmacion = () => {
  setConfirmacion(null);
};

const confirmarAccion = () => {

  if (!confirmacion) {
    return;
  }

  const accion =
    confirmacion.onConfirm;

  setConfirmacion(null);

  accion();

};

const inscripcionesFiltradas =
  filtroEstado === 'TODAS'
    ? inscripciones

    : filtroEstado === 'ACTIVIDAD_CANCELADA'
      ? inscripciones.filter(
          (inscripcion) =>
            inscripcion.oportunidad_estado === 'CANCELADA'
        )

      : filtroEstado === 'CANCELADA'
        ? inscripciones.filter(
            (inscripcion) =>
              inscripcion.estado === 'CANCELADA' &&
              inscripcion.oportunidad_estado !== 'CANCELADA'
          )

        : inscripciones.filter(
            (inscripcion) =>
              inscripcion.estado === filtroEstado
          );

const puedeCancelarInscripcion = (
  inscripcion
) => {

  if (
    ![
      'PENDIENTE',
      'ACEPTADA'
    ].includes(inscripcion.estado)
  ) {
    return false;
  }

  if (
    [
      'CANCELADA',
      'FINALIZADA'
    ].includes(
      inscripcion.oportunidad_estado
    )
  ) {
    return false;
  }

  const fechaInicio =
    new Date(
      inscripcion.fecha_inicio
    );

  const fechaLimite =
    new Date(
      fechaInicio.getTime() -
      3 * 24 * 60 * 60 * 1000
    );

  return new Date() <= fechaLimite;

};

  
  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Mis inscripciones
      </Text>


      <Text style={styles.subtitle}>
        Consultá las actividades en las que te inscribiste y el estado de cada solicitud.
      </Text>

      <View style={styles.filtersContainer}>

        {[
          { key: 'TODAS', label: 'Todas' },
          { key: 'PENDIENTE', label: 'Pendientes' },
          { key: 'ACEPTADA', label: 'Aceptadas' },
          { key: 'RECHAZADA', label: 'Rechazadas' },

          {
            key: 'CANCELADA',
            label: 'Inscripciones canceladas'
          },

          {
            key: 'ACTIVIDAD_CANCELADA',
            label: 'Actividades canceladas'
          },

          { key: 'COMPLETADA', label: 'Completadas' },
          { key: 'AUSENTE', label: 'Ausentes' },
        ].map((filtro) => (

          <TouchableOpacity
            key={filtro.key}
            style={[
              styles.filterButton,
              filtroEstado === filtro.key &&
                styles.filterButtonActive,
            ]}
            onPress={() =>
              onCambiarFiltroEstado(filtro.key)
            }
          >

            <Text
              style={[
                styles.filterButtonText,
                filtroEstado === filtro.key &&
                  styles.filterButtonTextActive,
              ]}
            >
              {filtro.label}
            </Text>

          </TouchableOpacity>

        ))}

      </View>


      {loading ? (

        <ActivityIndicator
          size="large"
          color="#1F6F5C"
          style={styles.loader}
        />

      ) : inscripcionesFiltradas.length === 0 ? (

        <View style={styles.emptyCard}>

          <Text style={styles.emptyTitle}>
              {filtroEstado === 'TODAS'
                ? 'Todavía no tenés inscripciones'
                : 'No hay inscripciones en este estado'}
            </Text>

            <Text style={styles.emptyText}>
              {filtroEstado === 'TODAS'
                ? 'Cuando te inscribas a una oportunidad, aparecerá en esta sección.'
                : 'Probá seleccionando otro estado para consultar tus inscripciones.'}
            </Text>

        </View>

      ) : (

        inscripcionesFiltradas.map(
          (inscripcion) => (

            <View
              key={inscripcion.id_inscripcion}
              style={styles.card}
            >

              <Text style={styles.cardTitle}>
                {inscripcion.oportunidad_titulo}
              </Text>


              <Text style={styles.cardInfo}>
                Inicio:{' '}
                {new Date(
                  inscripcion.fecha_inicio
                ).toLocaleString('es-AR')}
              </Text>


              <Text style={styles.cardInfo}>
                Fin:{' '}
                {new Date(
                  inscripcion.fecha_fin
                ).toLocaleString('es-AR')}
              </Text>


              <View style={styles.statusContainer}>

                <Text style={styles.statusLabel}>
                  Estado
                </Text>

                <Text style={styles.statusText}>
                  {obtenerEstadoMostrado(
                    inscripcion
                  )}
                </Text>

              </View>


              <TouchableOpacity
                style={styles.detailButton}
                onPress={() =>
                    onVerDetalle(
                    inscripcion.id_oportunidad,
                    inscripcion.estado
                    )
                }
                >

                <Text style={styles.detailButtonText}>
                  Ver detalle
                </Text>

              </TouchableOpacity>

              {puedeCancelarInscripcion(
                  inscripcion
                ) && (

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {

                      setConfirmacion({
                        title:
                          'Cancelar inscripción',
                        message:
                          '¿Deseás cancelar tu inscripción a esta actividad? Si tu inscripción estaba aceptada, el cupo quedará disponible nuevamente.',
                        confirmText:
                          'Cancelar inscripción',
                        destructive:
                          true,
                        onConfirm: () =>
                          onCancelar(
                            inscripcion.id_inscripcion
                          ),
                      });

                    }}
                  >

                    <Text style={styles.cancelButtonText}>
                      Cancelar inscripción
                    </Text>

                  </TouchableOpacity>

                )}

              {(
                  inscripcion.estado === 'RECHAZADA' ||
                  inscripcion.estado === 'CANCELADA' ||
                  inscripcion.oportunidad_estado === 'CANCELADA'
                ) && (

                  <TouchableOpacity
                    style={styles.hideButton}
                    onPress={() => {

                      setConfirmacion({
                        title:
                          'Quitar inscripción',
                        message:
                          'La inscripción dejará de aparecer en tu listado, pero se conservará en el historial. ¿Deseás continuar?',
                        confirmText:
                          'Quitar',
                        destructive:
                          true,
                        onConfirm: () =>
                          onOcultar(
                            inscripcion.id_inscripcion
                          ),
                      });

                    }}
                  >

                    <Text style={styles.hideButtonText}>
                      Quitar de Mis inscripciones
                    </Text>

                  </TouchableOpacity>

                )}

            </View>

          )
        )

      )}

  <ConfirmModal
  visible={confirmacion !== null}
  title={confirmacion?.title}
  message={confirmacion?.message}
  confirmText={confirmacion?.confirmText}
  cancelText="Volver"
  destructive={confirmacion?.destructive}
  onCancel={cerrarConfirmacion}
  onConfirm={confirmarAccion}
  loading={loading}
  />

    </View>

  );

}




const styles =
  StyleSheet.create({

    container: {
      width: '100%',
      maxWidth: 500,
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
      marginBottom: 20,
      lineHeight: 18,
    },


    loader: {
      marginTop: 30,
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
      fontSize: 13,
      color: '#5F6B76',

      marginTop: 6,

      textAlign: 'center',
      lineHeight: 18,
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

      marginBottom: 8,
    },


    cardInfo: {
      fontSize: 12,
      color: '#5F6B76',

      marginTop: 4,
    },


    statusContainer: {
      flexDirection: 'row',

      alignItems: 'center',

      marginTop: 12,

      gap: 8,
    },


    statusLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: '#5F6B76',
    },


    statusText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#1F6F5C',
    },


    detailButton: {
      borderWidth: 1,
      borderColor: '#1F6F5C',

      backgroundColor: '#FFFFFF',

      borderRadius: 10,

      paddingVertical: 10,
      paddingHorizontal: 14,

      alignItems: 'center',

      marginTop: 14,
    },


    detailButtonText: {
      color: '#1F6F5C',

      fontSize: 13,
      fontWeight: '700',
    },
    hideButton: {
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 14,
      alignItems: 'center',
      marginTop: 8,
      backgroundColor: '#FDECEC',
      borderWidth: 1,
      borderColor: '#C62828',
    },

    hideButtonText: {
      color: '#C62828',
      fontSize: 13,
      fontWeight: '700',
    },

 filtersContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  rowGap: 8,
  marginBottom: 16,
},

filterButton: {
  width: '48%',
  minHeight: 44,

  borderWidth: 1,
  borderColor: '#1F6F5C',
  borderRadius: 20,

  paddingVertical: 7,
  paddingHorizontal: 10,

  backgroundColor: '#FFFFFF',

  justifyContent: 'center',
  alignItems: 'center',
},

filterButtonActive: {
  backgroundColor: '#1F6F5C',
},

filterButtonText: {
  fontSize: 12,
  fontWeight: '600',
  color: '#1F6F5C',
  textAlign: 'center',
},

filterButtonTextActive: {
  color: '#FFFFFF',
},

cancelButton: {
  borderRadius: 10,
  paddingVertical: 10,
  paddingHorizontal: 14,
  alignItems: 'center',
  marginTop: 8,
  backgroundColor: '#C62828',
},

cancelButtonText: {
  color: '#FFFFFF',
  fontSize: 13,
  fontWeight: '700',
},

  });