import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';


export default function TiposActividadAdminScreen({
  tiposActividad = [],
  loading,
  onNuevo,
  onEditar,
}) {

    const [
  modalVisible,
  setModalVisible
] = React.useState(false);

const [
  tipoSeleccionado,
  setTipoSeleccionado
] = React.useState(null);

const [
  nombreTipo,
  setNombreTipo
] = React.useState('');

  return (

    <View style={styles.container}>

      {/* ================================================= */}
      {/* ENCABEZADO */}
      {/* ================================================= */}

      <View style={styles.header}>

        <Text style={styles.title}>
          Tipos de actividad
        </Text>

        <Text style={styles.subtitle}>
          Administrá las categorías disponibles para las oportunidades.
        </Text>

      </View>


      {/* ================================================= */}
      {/* NUEVO TIPO */}
      {/* ================================================= */}

      <TouchableOpacity
        style={styles.newButton}
        onPress={() => {
            setTipoSeleccionado(null);
            setNombreTipo('');
            setModalVisible(true);
            }}
      >

        <Text style={styles.newButtonText}>
          + Nuevo tipo de actividad
        </Text>

      </TouchableOpacity>


      {/* ================================================= */}
      {/* CONTENIDO */}
      {/* ================================================= */}

      {loading ? (

        <View style={styles.centerState}>

          <ActivityIndicator
            size="large"
            color="#1F6F5C"
          />

          <Text style={styles.stateText}>
            Cargando tipos de actividad...
          </Text>

        </View>

      ) : tiposActividad.length === 0 ? (

        <View style={styles.emptyCard}>

          <Text style={styles.emptyTitle}>
            No hay tipos de actividad
          </Text>

          <Text style={styles.emptyText}>
            Todavía no existen categorías registradas.
          </Text>

        </View>

      ) : (

        tiposActividad.map(
          (tipo) => (

            <View
              key={tipo.id_tipo_actividad}
              style={styles.card}
            >

              <View style={styles.cardInfo}>

                <Text style={styles.cardIcon}>
                  🏷️
                </Text>

                <View style={styles.cardTextContainer}>

                  <Text style={styles.cardTitle}>
                    {tipo.nombre}
                  </Text>

                  <Text style={styles.cardId}>
                    ID: {tipo.id_tipo_actividad}
                  </Text>

                </View>

              </View>


              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                setTipoSeleccionado(tipo);
                setNombreTipo(tipo.nombre);
                setModalVisible(true);
                }}
              >

                <Text style={styles.editButtonText}>
                  Editar
                </Text>

              </TouchableOpacity>

            </View>

          )
        )

      )}

      <Modal
  visible={modalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => {
    setModalVisible(false);
    setTipoSeleccionado(null);
    setNombreTipo('');
  }}
>

  <View style={styles.modalOverlay}>

    <View style={styles.modalCard}>

      <Text style={styles.modalTitle}>
        {tipoSeleccionado
          ? 'Editar tipo de actividad'
          : 'Nuevo tipo de actividad'}
      </Text>

      <Text style={styles.modalLabel}>
        Nombre *
      </Text>

      <TextInput
        style={styles.modalInput}
        value={nombreTipo}
        onChangeText={setNombreTipo}
        placeholder="Ej. Apoyo educativo"
      />

      <View style={styles.modalActions}>

        <TouchableOpacity
          style={styles.modalCancelButton}
          onPress={() => {
            setModalVisible(false);
            setTipoSeleccionado(null);
            setNombreTipo('');
          }}
        >

          <Text style={styles.modalCancelText}>
            Volver
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modalSaveButton,
            !nombreTipo.trim() &&
              styles.modalButtonDisabled,
          ]}
          disabled={!nombreTipo.trim()}
          onPress={async () => {

            const resultado =
              tipoSeleccionado
                ? await onEditar?.(
                    tipoSeleccionado.id_tipo_actividad,
                    nombreTipo.trim()
                  )
                : await onNuevo?.(
                    nombreTipo.trim()
                  );

            if (!resultado) {
              return;
            }

            setModalVisible(false);
            setTipoSeleccionado(null);
            setNombreTipo('');

          }}
        >

          <Text style={styles.modalSaveText}>
            {tipoSeleccionado
              ? 'Guardar'
              : 'Crear'}
          </Text>

        </TouchableOpacity>

      </View>

    </View>

  </View>

</Modal>

    </View>

  );

}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F6F8F7',
    padding: 18,
  },


  // ======================================================
  // HEADER
  // ======================================================

  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#DDE5E2',
    elevation: 2,
    shadowColor: '#164C40',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#164C40',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#5F6B76',
    lineHeight: 20,
  },


  // ======================================================
  // NUEVO TIPO
  // ======================================================

  newButton: {
    height: 48,
    backgroundColor: '#1F6F5C',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  newButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },


  // ======================================================
  // TARJETAS
  // ======================================================

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DDE5E2',
  },

  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cardIcon: {
    fontSize: 26,
    marginRight: 12,
  },

  cardTextContainer: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },

  cardId: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },


  // ======================================================
  // EDITAR
  // ======================================================

  editButton: {
    height: 42,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#1F6F5C',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  editButtonText: {
    color: '#1F6F5C',
    fontSize: 14,
    fontWeight: '700',
  },


  // ======================================================
  // ESTADOS
  // ======================================================

  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  stateText: {
    marginTop: 12,
    color: '#5F6B76',
    fontSize: 14,
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
  },

  emptyText: {
    marginTop: 6,
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },

  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 24,
},

modalCard: {
  width: '100%',
  maxWidth: 380,
  backgroundColor: '#FFFFFF',
  borderRadius: 18,
  padding: 22,
},

modalTitle: {
  fontSize: 19,
  fontWeight: '700',
  color: '#1F2937',
  marginBottom: 18,
},

modalLabel: {
  fontSize: 13,
  fontWeight: '700',
  color: '#374151',
  marginBottom: 7,
},

modalInput: {
  height: 46,
  borderWidth: 1,
  borderColor: '#D7E0DD',
  borderRadius: 10,
  paddingHorizontal: 12,
  fontSize: 14,
  color: '#1F2937',
  backgroundColor: '#FFFFFF',
},

modalActions: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  gap: 10,
  marginTop: 20,
},

modalCancelButton: {
  paddingVertical: 11,
  paddingHorizontal: 18,
  borderRadius: 10,
  backgroundColor: '#E5E7EB',
},

modalCancelText: {
  color: '#374151',
  fontWeight: '600',
},

modalSaveButton: {
  paddingVertical: 11,
  paddingHorizontal: 18,
  borderRadius: 10,
  backgroundColor: '#1F6F5C',
},

modalSaveText: {
  color: '#FFFFFF',
  fontWeight: '600',
},

modalButtonDisabled: {
  opacity: 0.6,
},

});