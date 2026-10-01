import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';

import ConfirmModal
  from '../components/ConfirmModal';


export default function DetalleOrganizacionPendienteScreen({
  organizacion,
  loading,
  onVolver,
  onAprobar,
  onRechazar,
}) {

  const [
    confirmacionAprobar,
    setConfirmacionAprobar
  ] = React.useState(false);


  const [
    modalRechazoVisible,
    setModalRechazoVisible
  ] = React.useState(false);


  const [
    motivoRechazo,
    setMotivoRechazo
  ] = React.useState('');


  // =====================================================
  // FORMATEAR FECHA
  // =====================================================

  const formatearFecha =
    (fecha) => {

      if (!fecha) {
        return 'No disponible';
      }

      return new Date(
        fecha
      ).toLocaleString(
        'es-AR'
      );

    };


  // =====================================================
  // CONFIRMAR RECHAZO
  // =====================================================

  const confirmarRechazo =
    async () => {

      if (
        !motivoRechazo.trim()
      ) {

        return;

      }


      const resultado =
        await onRechazar(
            motivoRechazo.trim()
        );


        if (!resultado) {
        return;
        }


        setMotivoRechazo(
        ''
        );


        setModalRechazoVisible(
        false
        );

    };


  if (!organizacion) {

    return (

      <View style={styles.container}>

        <Text style={styles.emptyText}>
          No se pudo cargar la organización.
        </Text>


        <TouchableOpacity
          style={styles.backButton}
          onPress={
            onVolver
          }
        >

          <Text style={styles.backButtonText}>
            ← Volver
          </Text>

        </TouchableOpacity>

      </View>

    );

  }


  return (

    <View style={styles.container}>


      {/* ================================================= */}
      {/* VOLVER */}
      {/* ================================================= */}

      <View style={styles.backCardContainer}>

        <TouchableOpacity
            style={styles.backButton}
            onPress={onVolver}
            activeOpacity={0.8}
        >

            <Text style={styles.backButtonText}>
            ← Volver a organizaciones
            </Text>

        </TouchableOpacity>

        </View>

      {/* ================================================= */}
      {/* ENCABEZADO */}
      {/* ================================================= */}

      <View style={styles.headerCard}>

        <View style={styles.iconCircle}>

          <Text style={styles.icon}>
            🏢
          </Text>

        </View>


        <Text style={styles.organizationName}>

          {
            organizacion.razon_social ||
            'Organización'
          }

        </Text>


        <View style={styles.statusBadge}>

          <Text style={styles.statusText}>
            PENDIENTE
          </Text>

        </View>

      </View>


      {/* ================================================= */}
      {/* INFORMACIÓN INSTITUCIONAL */}
      {/* ================================================= */}

      <View style={styles.infoCard}>

        <Text style={styles.sectionTitle}>
          Información institucional
        </Text>


        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            Razón social
          </Text>

          <Text style={styles.infoValue}>
            {
              organizacion.razon_social ||
              'No disponible'
            }
          </Text>

        </View>


        <View style={styles.separator} />


        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            CUIT
          </Text>

          <Text style={styles.infoValue}>
            {
              organizacion.cuit ||
              'No disponible'
            }
          </Text>

        </View>


        <View style={styles.separator} />


        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            Correo electrónico
          </Text>

          <Text style={styles.infoValue}>
            {
              organizacion.email ||
              'No disponible'
            }
          </Text>

        </View>

      <View style={styles.separator} />


        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            Ubicación institucional
          </Text>


          <Text style={styles.infoValue}>

            {
              organizacion.direccion ||
              [
                organizacion.localidad,
                organizacion.provincia
              ]
                .filter(Boolean)
                .join(', ') ||
              'No disponible'
            }

          </Text>


          {
            organizacion.direccion &&
            (
              organizacion.localidad ||
              organizacion.provincia
            ) && (

              <Text style={styles.infoSecondary}>

                {
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

        </View>      
       


        <View style={styles.separator} />


        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            Fecha de registro
          </Text>

          <Text style={styles.infoValue}>

            {
              formatearFecha(
                organizacion.creado_en
              )
            }

          </Text>

        </View>

      </View>


      {/* ================================================= */}
      {/* DESCRIPCIÓN */}
      {/* ================================================= */}

      <View style={styles.descriptionCard}>

        <Text style={styles.sectionTitle}>
          Descripción institucional
        </Text>


        <Text style={styles.descriptionText}>

          {
            organizacion.descripcion ||
            'La organización no proporcionó una descripción institucional.'
          }

        </Text>

      </View>


      {/* ================================================= */}
      {/* ACCIONES */}
      {/* ================================================= */}

      <View style={styles.actionsCard}>

        <Text style={styles.sectionTitle}>
          Verificación
        </Text>


        <Text style={styles.actionsDescription}>
          Revisá la información institucional antes de aprobar o rechazar la solicitud.
        </Text>


        <TouchableOpacity

          style={[
            styles.approveButton,
            loading &&
              styles.disabledButton
          ]}

          disabled={
            loading
          }

          onPress={() =>
            setConfirmacionAprobar(
              true
            )
          }

        >

          <Text style={styles.approveButtonText}>
            Aprobar organización
          </Text>

        </TouchableOpacity>


        <TouchableOpacity

          style={[
            styles.rejectButton,
            loading &&
              styles.disabledButton
          ]}

          disabled={
            loading
          }

          onPress={() => {

            setMotivoRechazo(
              ''
            );

            setModalRechazoVisible(
              true
            );

          }}

        >

          <Text style={styles.rejectButtonText}>
            Rechazar organización
          </Text>

        </TouchableOpacity>

      </View>


      {/* ================================================= */}
      {/* CONFIRMACIÓN APROBAR */}
      {/* ================================================= */}

      <ConfirmModal

        visible={
          confirmacionAprobar
        }

        title="Aprobar organización"

        message={
          `¿Confirmás la verificación de ${
            organizacion.razon_social
          }? La organización podrá utilizar las funciones reservadas para cuentas verificadas.`
        }

        confirmText="Aprobar"

        cancelText="Volver"

        loading={
          loading
        }

        onCancel={() =>
          setConfirmacionAprobar(
            false
          )
        }

        onConfirm={async () => {

          setConfirmacionAprobar(
            false
          );

          await onAprobar();

        }}

      />


      {/* ================================================= */}
      {/* MODAL RECHAZO */}
      {/* ================================================= */}

      <Modal

        visible={
          modalRechazoVisible
        }

        transparent

        animationType="fade"

        onRequestClose={() =>
          setModalRechazoVisible(
            false
          )
        }

      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalCard}>

            <Text style={styles.modalTitle}>
              Rechazar organización
            </Text>


            <Text style={styles.modalText}>
              Indicá el motivo del rechazo. Esta información quedará registrada.
            </Text>


            <Text style={styles.inputLabel}>
              Motivo *
            </Text>


            <TextInput

              style={styles.textArea}

              value={
                motivoRechazo
              }

              onChangeText={
                setMotivoRechazo
              }

              placeholder="Ingresá el motivo del rechazo..."

              placeholderTextColor="#9CA3AF"

              multiline

              numberOfLines={4}

              maxLength={500}

              editable={
                !loading
              }

            />


            <Text style={styles.characterCounter}>

              {
                motivoRechazo.length
              }
              /500

            </Text>


            {
              motivoRechazo.trim()
                .length === 0 && (

                <Text style={styles.requiredText}>
                  El motivo es obligatorio.
                </Text>

              )
            }


            <View style={styles.modalActions}>


              <TouchableOpacity

                style={styles.cancelButton}

                disabled={
                  loading
                }

                onPress={() => {

                  setModalRechazoVisible(
                    false
                  );

                  setMotivoRechazo(
                    ''
                  );

                }}

              >

                <Text style={styles.cancelButtonText}>
                  Volver
                </Text>

              </TouchableOpacity>


              <TouchableOpacity

                style={[
                  styles.confirmRejectButton,

                  (
                    loading ||
                    !motivoRechazo.trim()
                  ) &&
                    styles.disabledButton
                ]}

                disabled={
                  loading ||
                  !motivoRechazo.trim()
                }

                onPress={
                  confirmarRechazo
                }

              >

                <Text style={styles.confirmRejectButtonText}>

                  {
                    loading
                      ? 'Procesando...'
                      : 'Confirmar rechazo'
                  }

                </Text>

              </TouchableOpacity>


            </View>

          </View>

        </View>

      </Modal>


    </View>

  );

}


const styles =
  StyleSheet.create({

    container: {

      width: '100%',
      maxWidth: 500,

    },


    // =====================================================
    // VOLVER
    // =====================================================
backCardContainer: {

  width: '100%',

  backgroundColor:
    'rgba(255, 255, 255, 0.96)',

  borderRadius: 14,

  paddingHorizontal: 14,
  paddingVertical: 12,

  marginBottom: 14,

  borderWidth: 1,
  borderColor: '#E6F2EF',

  elevation: 3,

  shadowColor: '#164C40',

  shadowOffset: {
    width: 0,
    height: 2,
  },

  shadowOpacity: 0.12,

  shadowRadius: 6,

},

backButton: {

  alignSelf: 'flex-start',

},

backButtonText: {

  color: '#1F6F5C',

  fontSize: 14,

  fontWeight: '700',

},


    backButtonText: {

      color: '#1F6F5C',

      fontSize: 14,

      fontWeight: '700',

    },


    // =====================================================
    // HEADER
    // =====================================================

    headerCard: {

      backgroundColor: '#EAF5F2',

      borderRadius: 18,

      padding: 22,

      alignItems: 'center',

      borderWidth: 1,
      borderColor: '#CFE4DE',

      marginBottom: 16,

    },


    iconCircle: {

      width: 70,
      height: 70,

      borderRadius: 35,

      backgroundColor: '#FFFFFF',

      alignItems: 'center',
      justifyContent: 'center',

    },


    icon: {

      fontSize: 34,

    },


    organizationName: {

      fontSize: 21,

      fontWeight: '700',

      color: '#164C40',

      marginTop: 12,

      textAlign: 'center',

    },


    statusBadge: {

      backgroundColor: '#FFF3CD',

      paddingHorizontal: 12,
      paddingVertical: 6,

      borderRadius: 18,

      marginTop: 10,

    },


    statusText: {

      fontSize: 11,

      fontWeight: '700',

      color: '#7A5A00',

    },


    // =====================================================
    // CARDS
    // =====================================================

    infoCard: {

      backgroundColor: '#FFFFFF',

      borderRadius: 16,

      padding: 18,

      borderWidth: 1,
      borderColor: '#DDE5E2',

      marginBottom: 16,

    },


    descriptionCard: {

      backgroundColor: '#FFFFFF',

      borderRadius: 16,

      padding: 18,

      borderWidth: 1,
      borderColor: '#DDE5E2',

      marginBottom: 16,

    },


    actionsCard: {

      backgroundColor: '#FFFFFF',

      borderRadius: 16,

      padding: 18,

      borderWidth: 1,
      borderColor: '#DDE5E2',

      marginBottom: 20,

    },


    sectionTitle: {

      fontSize: 17,

      fontWeight: '700',

      color: '#164C40',

      marginBottom: 12,

    },


    infoRow: {

      paddingVertical: 8,

    },


    infoLabel: {

      fontSize: 12,

      color: '#5F6B76',

    },


    infoValue: {

      fontSize: 14,

      fontWeight: '600',

      color: '#1F2937',

      marginTop: 3,

    },


    separator: {

      height: 1,

      backgroundColor: '#EEF1F0',

    },


    descriptionText: {

      fontSize: 14,

      color: '#374151',

      lineHeight: 21,

    },


    actionsDescription: {

      fontSize: 13,

      color: '#5F6B76',

      lineHeight: 19,

      marginBottom: 16,

    },


    // =====================================================
    // BUTTONS
    // =====================================================

    approveButton: {

      height: 46,

      borderRadius: 10,

      backgroundColor: '#1F6F5C',

      alignItems: 'center',
      justifyContent: 'center',

      marginBottom: 10,

    },


    approveButtonText: {

      color: '#FFFFFF',

      fontSize: 14,

      fontWeight: '700',

    },


    rejectButton: {

      height: 46,

      borderRadius: 10,

      backgroundColor: '#C62828',

      alignItems: 'center',
      justifyContent: 'center',

    },


    rejectButtonText: {

      color: '#FFFFFF',

      fontSize: 14,

      fontWeight: '700',

    },


    disabledButton: {

      opacity: 0.55,

    },


    // =====================================================
    // REJECTION MODAL
    // =====================================================

    modalOverlay: {

      flex: 1,

      backgroundColor:
        'rgba(0,0,0,0.5)',

      justifyContent: 'center',
      alignItems: 'center',

      padding: 24,

    },


    modalCard: {

      width: '100%',
      maxWidth: 390,

      backgroundColor: '#FFFFFF',

      borderRadius: 18,

      padding: 22,

    },


    modalTitle: {

      fontSize: 20,

      fontWeight: '700',

      color: '#164C40',

      marginBottom: 8,

    },


    modalText: {

      fontSize: 13,

      color: '#5F6B76',

      lineHeight: 19,

      marginBottom: 16,

    },


    inputLabel: {

      fontSize: 13,

      fontWeight: '700',

      color: '#1F2937',

      marginBottom: 6,

    },


    textArea: {

      minHeight: 100,

      borderWidth: 1,
      borderColor: '#D7DEDA',

      backgroundColor: '#F9FAFB',

      borderRadius: 10,

      paddingHorizontal: 12,
      paddingVertical: 10,

      fontSize: 14,

      color: '#1F2937',

      textAlignVertical: 'top',

    },


    characterCounter: {

      fontSize: 11,

      color: '#6B7280',

      textAlign: 'right',

      marginTop: 4,

    },


    requiredText: {

      fontSize: 11,

      color: '#C62828',

      marginTop: 4,

    },


    modalActions: {

      flexDirection: 'row',

      gap: 10,

      marginTop: 18,

    },


    cancelButton: {

      flex: 1,

      height: 44,

      borderRadius: 10,

      backgroundColor: '#E5E7EB',

      alignItems: 'center',
      justifyContent: 'center',

    },


    cancelButtonText: {

      color: '#374151',

      fontWeight: '600',

    },


    confirmRejectButton: {

      flex: 1,

      height: 44,

      borderRadius: 10,

      backgroundColor: '#C62828',

      alignItems: 'center',
      justifyContent: 'center',

    },


    confirmRejectButtonText: {

      color: '#FFFFFF',

      fontWeight: '700',

      fontSize: 13,

    },


    emptyText: {

      fontSize: 14,

      color: '#5F6B76',

      marginBottom: 15,

    },
    infoSecondary: {

      fontSize: 12,

      color: '#5F6B76',

      marginTop: 3,

    },

  });