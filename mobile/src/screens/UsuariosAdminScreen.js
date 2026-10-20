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

import ConfirmModal
  from '../components/ConfirmModal';

export default function UsuariosAdminScreen({
  usuarios = [],
  loading,
  loadingAccion,
  onBloquear,
  onRehabilitar,
}) {

    const [
  usuarioSeleccionado,
  setUsuarioSeleccionado
] = React.useState(null);


const [
  modalBloqueoVisible,
  setModalBloqueoVisible
] = React.useState(false);


const [
  motivoBloqueo,
  setMotivoBloqueo
] = React.useState('');


const [
  confirmarRehabilitacion,
  setConfirmarRehabilitacion
] = React.useState(false);

// ======================================================
// CONFIRMAR BLOQUEO
// ======================================================

const confirmarBloqueo =
  async () => {

    if (
      !usuarioSeleccionado ||
      !motivoBloqueo.trim()
    ) {
      return;
    }


    const resultado =
      await onBloquear?.(
        usuarioSeleccionado.id_usuario,
        motivoBloqueo.trim()
      );


    if (!resultado) {
      return;
    }


    setModalBloqueoVisible(
      false
    );

    setMotivoBloqueo(
      ''
    );

    setUsuarioSeleccionado(
      null
    );

  };


// ======================================================
// CONFIRMAR REHABILITACIÓN
// ======================================================

const confirmarRehabilitar =
  async () => {

    if (!usuarioSeleccionado) {
      return;
    }


    const resultado =
      await onRehabilitar?.(
        usuarioSeleccionado.id_usuario
      );


    if (!resultado) {
      return;
    }


    setConfirmarRehabilitacion(
      false
    );

    setUsuarioSeleccionado(
      null
    );

  };

  const obtenerRolMostrado = (rol) => {

    switch (rol) {

      case 'VOLUNTARIO':
        return 'Voluntario';

      case 'ORGANIZACION':
        return 'Organización';

      default:
        return rol || 'Sin rol';

    }

  };


  return (

    <View style={styles.container}>

      {/* ================================================= */}
      {/* ENCABEZADO */}
      {/* ================================================= */}

      <View style={styles.header}>

        <Text style={styles.title}>
          Usuarios
        </Text>

        <Text style={styles.subtitle}>
          Administrá el estado de las cuentas registradas.
        </Text>

      </View>


      {/* ================================================= */}
      {/* CARGANDO */}
      {/* ================================================= */}

      {loading ? (

        <ActivityIndicator
          size="large"
          color="#1F6F5C"
          style={styles.loader}
        />

      ) : usuarios.length === 0 ? (

        <View style={styles.emptyCard}>

          <Text style={styles.emptyTitle}>
            No hay usuarios registrados
          </Text>

          <Text style={styles.emptyText}>
            No se encontraron cuentas para administrar.
          </Text>

        </View>

      ) : (

        usuarios.map(
          (usuario) => (

            <View
              key={usuario.id_usuario}
              style={styles.card}
            >

              <View style={styles.cardHeader}>

                <View style={styles.userIcon}>

                  <Text style={styles.userIconText}>
                    {usuario.rol === 'ORGANIZACION'
                      ? '🏢'
                      : '👤'}
                  </Text>

                </View>


                <View style={styles.cardHeaderText}>

                  <Text style={styles.email}>
                    {usuario.email}
                  </Text>

                  <Text style={styles.role}>
                    {obtenerRolMostrado(
                      usuario.rol
                    )}
                  </Text>

                </View>


                <View
                  style={[
                    styles.statusBadge,

                    usuario.estado_cuenta ===
                      'BLOQUEADA'
                      ? styles.statusBlocked
                      : styles.statusActive,
                  ]}
                >

                  <Text
                    style={[
                      styles.statusText,

                      usuario.estado_cuenta ===
                        'BLOQUEADA'
                        ? styles.statusBlockedText
                        : styles.statusActiveText,
                    ]}
                  >
                    {usuario.estado_cuenta ===
                      'BLOQUEADA'
                      ? 'Bloqueada'
                      : 'Activa'}
                  </Text>

                </View>

              </View>


              {usuario.estado_cuenta ===
                'BLOQUEADA' &&
                usuario.motivo_bloqueo ? (

                <View style={styles.reasonCard}>

                  <Text style={styles.reasonLabel}>
                    Motivo del bloqueo
                  </Text>

                  <Text style={styles.reasonText}>
                    {usuario.motivo_bloqueo}
                  </Text>

                </View>

              ) : null}


              {usuario.estado_cuenta === 'ACTIVA' ? (

                    <TouchableOpacity
                        style={[
                        styles.actionButton,
                        styles.blockButton,
                        ]}
                        disabled={loadingAccion}
                        onPress={() => {

                        setUsuarioSeleccionado(
                            usuario
                        );

                        setMotivoBloqueo(
                            ''
                        );

                        setModalBloqueoVisible(
                            true
                        );

                        }}
                    >

                        <Text style={styles.blockButtonText}>
                        Bloquear cuenta
                        </Text>

                    </TouchableOpacity>

                    ) : (

                    <TouchableOpacity
                        style={[
                        styles.actionButton,
                        styles.rehabilitateButton,
                        ]}
                        disabled={loadingAccion}
                        onPress={() => {

                        setUsuarioSeleccionado(
                            usuario
                        );

                        setConfirmarRehabilitacion(
                            true
                        );

                        }}
                    >

                        <Text style={styles.rehabilitateButtonText}>
                        Rehabilitar cuenta
                        </Text>

                    </TouchableOpacity>

                    )}

            </View>

          )
        )

      )}

      {/* ================================================= */}
{/* MODAL BLOQUEAR USUARIO */}
{/* ================================================= */}

<Modal
  visible={
    modalBloqueoVisible
  }
  transparent
  animationType="fade"
  onRequestClose={() => {

    if (loadingAccion) {
      return;
    }

    setModalBloqueoVisible(
      false
    );

    setMotivoBloqueo(
      ''
    );

    setUsuarioSeleccionado(
      null
    );

  }}
>

  <View style={styles.modalOverlay}>

    <View style={styles.modalCard}>

      <Text style={styles.modalTitle}>
        Bloquear cuenta
      </Text>


      <Text style={styles.modalText}>
        Ingresá el motivo por el cual se bloqueará la cuenta
        {usuarioSeleccionado?.email
          ? ` ${usuarioSeleccionado.email}.`
          : '.'}
      </Text>


      <Text style={styles.modalLabel}>
        Motivo del bloqueo *
      </Text>


      <TextInput
        style={styles.modalInput}
        placeholder="Ej. Incumplimiento de las normas de uso"
        value={
          motivoBloqueo
        }
        onChangeText={
          setMotivoBloqueo
        }
        multiline
        textAlignVertical="top"
        editable={
          !loadingAccion
        }
      />


      <View style={styles.modalActions}>

        <TouchableOpacity
          style={styles.modalCancelButton}
          disabled={
            loadingAccion
          }
          onPress={() => {

            setModalBloqueoVisible(
              false
            );

            setMotivoBloqueo(
              ''
            );

            setUsuarioSeleccionado(
              null
            );

          }}
        >

          <Text style={styles.modalCancelText}>
            Volver
          </Text>

        </TouchableOpacity>


        <TouchableOpacity
          style={[
            styles.modalBlockButton,

            (
              !motivoBloqueo.trim() ||
              loadingAccion
            ) &&
              styles.modalButtonDisabled
          ]}
          disabled={
            !motivoBloqueo.trim() ||
            loadingAccion
          }
          onPress={
            confirmarBloqueo
          }
        >

          <Text style={styles.modalBlockText}>
            {loadingAccion
              ? 'Procesando...'
              : 'Bloquear'}
          </Text>

        </TouchableOpacity>

      </View>

    </View>

  </View>

</Modal>


{/* ================================================= */}
{/* CONFIRMAR REHABILITACIÓN */}
{/* ================================================= */}

<ConfirmModal
  visible={
    confirmarRehabilitacion
  }

  title="Rehabilitar cuenta"

  message={
    usuarioSeleccionado?.email
      ? `¿Querés rehabilitar la cuenta ${usuarioSeleccionado.email}?`
      : '¿Querés rehabilitar esta cuenta?'
  }

  confirmText="Rehabilitar"

  cancelText="Volver"

  loading={
    loadingAccion
  }

  onCancel={() => {

    if (loadingAccion) {
      return;
    }

    setConfirmarRehabilitacion(
      false
    );

    setUsuarioSeleccionado(
      null
    );

  }}

  onConfirm={
    confirmarRehabilitar
  }
/>

    </View>

  );

}


const styles = StyleSheet.create({

  container: {
    width: '100%',
    maxWidth: 500,
  },


  header: {

    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    padding: 18,

    marginBottom: 20,

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


  loader: {
    marginTop: 40,
  },


  emptyCard: {

    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    padding: 26,

    borderWidth: 1,
    borderColor: '#DDE5E2',

    alignItems: 'center',

  },


  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#164C40',
  },


  emptyText: {
    fontSize: 13,
    color: '#5F6B76',
    marginTop: 6,
    textAlign: 'center',
  },


  card: {

    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    padding: 16,

    marginBottom: 14,

    borderWidth: 1,
    borderColor: '#DDE5E2',

  },


  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },


  userIcon: {

    width: 46,
    height: 46,

    borderRadius: 23,

    backgroundColor: '#EAF5F2',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,

  },


  userIconText: {
    fontSize: 22,
  },


  cardHeaderText: {
    flex: 1,
  },


  email: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },


  role: {
    fontSize: 12,
    color: '#5F6B76',
    marginTop: 4,
  },


  statusBadge: {
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },


  statusActive: {
    backgroundColor: '#DDF3E8',
  },


  statusBlocked: {
    backgroundColor: '#FDE8E8',
  },


  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },


  statusActiveText: {
    color: '#1F6F5C',
  },


  statusBlockedText: {
    color: '#C62828',
  },


  reasonCard: {

    marginTop: 14,

    backgroundColor: '#FFF7F7',

    borderRadius: 10,

    padding: 12,

    borderWidth: 1,
    borderColor: '#F3D5D5',

  },


  reasonLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A3030',
  },


  reasonText: {
    fontSize: 13,
    color: '#5F4040',
    marginTop: 4,
    lineHeight: 18,
  },
  actionButton: {

  height: 44,

  borderRadius: 10,

  alignItems: 'center',
  justifyContent: 'center',

  marginTop: 14,

},


blockButton: {

  borderWidth: 1,
  borderColor: '#C62828',

  backgroundColor: '#FFFFFF',

},


blockButtonText: {

  color: '#C62828',

  fontSize: 14,
  fontWeight: '700',

},


rehabilitateButton: {

  backgroundColor: '#1F6F5C',

},


rehabilitateButtonText: {

  color: '#FFFFFF',

  fontSize: 14,
  fontWeight: '700',

},
modalOverlay: {

  flex: 1,

  backgroundColor:
    'rgba(0, 0, 0, 0.45)',

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

  marginBottom: 10,

},


modalText: {

  fontSize: 14,

  color: '#4B5563',

  lineHeight: 21,

  marginBottom: 18,

},


modalLabel: {

  fontSize: 13,
  fontWeight: '700',

  color: '#374151',

  marginBottom: 7,

},


modalInput: {

  minHeight: 100,

  borderWidth: 1,
  borderColor: '#D7E0DD',

  borderRadius: 10,

  paddingHorizontal: 12,
  paddingVertical: 10,

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


modalBlockButton: {

  paddingVertical: 11,
  paddingHorizontal: 18,

  borderRadius: 10,

  backgroundColor: '#B91C1C',

},


modalBlockText: {

  color: '#FFFFFF',

  fontWeight: '600',

},


modalButtonDisabled: {

  opacity: 0.6,

},

});