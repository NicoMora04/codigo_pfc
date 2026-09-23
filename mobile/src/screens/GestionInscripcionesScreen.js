import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ConfirmModal from '../components/ConfirmModal';

export default function GestionInscripcionesScreen({
  oportunidad,
  inscripciones,
  loading,
  onAceptar,
  onRechazar,
  onVolver,
  onMarcarResultado,
}) {
  const [confirmacion, setConfirmacion] =
    React.useState(null);

  const pendientes = inscripciones.filter(
    (inscripcion) =>
      inscripcion.estado === 'PENDIENTE'
  );

  const aceptadas = inscripciones.filter(
    (inscripcion) =>
      inscripcion.estado === 'ACEPTADA'
  );

  const cerrarConfirmacion = () => {
    setConfirmacion(null);
  };

  const confirmarAccion = () => {
    if (!confirmacion) {
      return;
    }

    const accion = confirmacion.onConfirm;

    setConfirmacion(null);

    accion();
  };

  const obtenerNombre = (inscripcion) => {
    return [
      inscripcion.voluntario_nombre,
      inscripcion.voluntario_apellido,
    ]
      .filter(Boolean)
      .join(' ');
  };

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

      <Text style={styles.title}>
        Gestionar inscripciones
      </Text>

      {oportunidad && (
        <Text style={styles.subtitle}>
          {oportunidad.titulo}
        </Text>
      )}

      {oportunidad && (
        <View style={styles.summaryCard}>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {pendientes.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Pendientes
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {aceptadas.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Aceptadas
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {oportunidad.cupo_total}
            </Text>

            <Text style={styles.summaryLabel}>
              Cupo total
            </Text>
          </View>

        </View>
      )}

      {loading ? (

        <ActivityIndicator
          size="large"
          color="#1F6F5C"
          style={styles.loader}
        />

      ) : inscripciones.length === 0 ? (

        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            Todavía no hay inscripciones
          </Text>

          <Text style={styles.emptyText}>
            Cuando un voluntario se inscriba,
            aparecerá en esta sección.
          </Text>
        </View>

      ) : (

        inscripciones.map((inscripcion) => (

          <View
            key={inscripcion.id_inscripcion}
            style={styles.card}
          >

            <Text style={styles.volunteerName}>
              {obtenerNombre(inscripcion)}
            </Text>

            <Text style={styles.info}>
              Estado: {inscripcion.estado}
            </Text>

            <Text style={styles.info}>
              Inscripto:{' '}
              {new Date(
                inscripcion.inscrita_en
              ).toLocaleString('es-AR')}
            </Text>

            {inscripcion.respondida_en && (
              <Text style={styles.info}>
                Respondida:{' '}
                {new Date(
                  inscripcion.respondida_en
                ).toLocaleString('es-AR')}
              </Text>
            )}

            {inscripcion.estado ===
              'PENDIENTE' && (

              <View style={styles.actions}>

                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => {
                    setConfirmacion({
                      title:
                        'Aceptar inscripción',
                      message:
                        `¿Deseás aceptar la inscripción de ${obtenerNombre(
                          inscripcion
                        )}?`,
                      confirmText: 'Aceptar',
                      destructive: false,
                      onConfirm: () =>
                        onAceptar(
                          inscripcion.id_inscripcion
                        ),
                    });
                  }}
                >
                  <Text style={styles.actionText}>
                    Aceptar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => {
                    setConfirmacion({
                      title:
                        'Rechazar inscripción',
                      message:
                        `¿Deseás rechazar la inscripción de ${obtenerNombre(
                          inscripcion
                        )}?`,
                      confirmText: 'Rechazar',
                      destructive: true,
                      onConfirm: () =>
                        onRechazar(
                          inscripcion.id_inscripcion
                        ),
                    });
                  }}
                >
                  <Text style={styles.actionText}>
                    Rechazar
                  </Text>
                </TouchableOpacity>

   

              </View>
            )}

                         {(
  oportunidad?.estado === 'FINALIZADA' &&
        inscripcion.estado === 'ACEPTADA'
      ) && (

        <View style={styles.actions}>

          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => {
              setConfirmacion({
                title:
                  'Marcar participación',
                message:
                  `¿Deseás marcar a ${obtenerNombre(
                    inscripcion
                  )} como participante de la actividad?`,
                confirmText:
                  'Marcar completada',
                destructive: false,
                onConfirm: () =>
                  onMarcarResultado(
                    inscripcion.id_inscripcion,
                    'COMPLETADA'
                  ),
              });
            }}
          >
            <Text style={styles.actionText}>
              Marcar completada
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.absentButton}
            onPress={() => {
              setConfirmacion({
                title:
                  'Marcar ausencia',
                message:
                  `¿Deseás marcar a ${obtenerNombre(
                    inscripcion
                  )} como ausente?`,
                confirmText:
                  'Marcar ausente',
                destructive: true,
                onConfirm: () =>
                  onMarcarResultado(
                    inscripcion.id_inscripcion,
                    'AUSENTE'
                  ),
              });
            }}
          >
            <Text style={styles.actionText}>
              Marcar ausente
            </Text>
          </TouchableOpacity>

        </View>

      )}

          </View>

        ))

      )}

      <ConfirmModal
        visible={confirmacion !== null}
        title={confirmacion?.title}
        message={confirmacion?.message}
        confirmText={
          confirmacion?.confirmText
        }
        cancelText="Volver"
        destructive={
          confirmacion?.destructive
        }
        onCancel={cerrarConfirmacion}
        onConfirm={confirmarAccion}
        loading={loading}
      />

    </View>
  );
}

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

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#164C40',
  },

  subtitle: {
    fontSize: 15,
    color: '#5F6B76',
    marginTop: 4,
    marginBottom: 18,
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6F2EF',
    padding: 16,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },

  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#164C40',
  },

  summaryLabel: {
    fontSize: 12,
    color: '#5F6B76',
    marginTop: 4,
    textAlign: 'center',
  },

  loader: {
    marginTop: 30,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6F2EF',
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

  volunteerName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#164C40',
  },

  info: {
    fontSize: 13,
    color: '#5F6B76',
    marginTop: 6,
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },

  acceptButton: {
    flex: 1,
    height: 40,
    borderRadius: 9,
    backgroundColor: '#1F6F5C',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rejectButton: {
    flex: 1,
    height: 40,
    borderRadius: 9,
    backgroundColor: '#C62828',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  completeButton: {
  flex: 1,
  minHeight: 44,
  borderRadius: 9,
  backgroundColor: '#1F6F5C',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 8,
},

absentButton: {
  flex: 1,
  minHeight: 44,
  borderRadius: 9,
  backgroundColor: '#C62828',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 8,
},

});