import React, {
  useState,
} from 'react';

import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import BASE_URL
  from '../config/api';


export default function DetalleDonacionRecibidaScreen({
  donacion,
  loading,
  loadingAccion,
  onVolver,
  onAceptar,
  onRechazar,
  onCoordinar,
  onMarcarRecibida,
}) {

  const [
    accionPendiente,
    setAccionPendiente
  ] = useState(null);


  const [
    observacionRechazo,
    setObservacionRechazo
  ] = useState('');


 const [
  detalleCoordinacion,
  setDetalleCoordinacion
] = useState('');


const [
  telefonoContacto,
  setTelefonoContacto
] = useState('');

  // ======================================================
  // ESTADO
  // ======================================================

  const obtenerEstadoMostrado =
    (estado) => {

      switch (estado) {

        case 'PENDIENTE':
          return 'Pendiente';

        case 'ACEPTADA':
          return 'Aceptada';

        case 'RECHAZADA':
          return 'Rechazada';

        case 'COORDINADA':
          return 'Coordinada';

        case 'RECIBIDA':
          return 'Recibida';

        default:
          return estado || 'Sin estado';

      }

    };


  // ======================================================
  // FECHA
  // ======================================================

  const formatearFecha =
    (fecha) => {

      if (!fecha) {

        return 'Sin fecha';

      }


      const valor =
        new Date(fecha);


      if (
        Number.isNaN(
          valor.getTime()
        )
      ) {

        return fecha;

      }


      return valor.toLocaleDateString(
        'es-AR'
      );

    };


  // ======================================================
  // IMAGEN
  // ======================================================

  const obtenerUrlImagen =
    (
      imagenUrl
    ) => {

      if (!imagenUrl) {

        return null;

      }


      if (
        /^https?:\/\//i.test(
          imagenUrl
        )
      ) {

        return imagenUrl;

      }


      const origenBackend =
        BASE_URL.replace(
          /\/api\/?$/i,
          ''
        );


      return (
        `${origenBackend}${
          imagenUrl.startsWith('/')
            ? ''
            : '/'
        }${imagenUrl}`
      );

    };


  // ======================================================
  // CONFIRMAR ACCIÓN
  // ======================================================

  const confirmarAccion =
    async () => {

      if (
        !accionPendiente ||
        !donacion
      ) {

        return;

      }


      const accion =
        accionPendiente;


      setAccionPendiente(
        null
      );


      if (
        accion === 'ACEPTAR'
      ) {

        await onAceptar?.(
          donacion
        );

        return;

      }


      if (
        accion === 'RECHAZAR'
      ) {

        await onRechazar?.(
          donacion,
          observacionRechazo
        );

        setObservacionRechazo(
          ''
        );

        return;

      }


      if (
        accion === 'COORDINAR'
      ) {

          await onCoordinar?.(
          donacion,
          detalleCoordinacion,
          telefonoContacto
        );

        setDetalleCoordinacion(
          ''
        );

        setTelefonoContacto(
          ''
        );

        return;

      }


      if (
        accion === 'RECIBIR'
      ) {

        await onMarcarRecibida?.(
          donacion
        );

      }

    };


  const obtenerTituloConfirmacion =
    () => {

      switch (
        accionPendiente
      ) {

        case 'ACEPTAR':
          return 'Aceptar donación';

        case 'RECHAZAR':
          return 'Rechazar donación';

        case 'COORDINAR':
          return 'Coordinar entrega';

        case 'RECIBIR':
          return 'Confirmar recepción';

        default:
          return 'Confirmar acción';

      }

    };


  const obtenerMensajeConfirmacion =
    () => {

      switch (
        accionPendiente
      ) {

        case 'ACEPTAR':
          return '¿Querés aceptar esta donación?';

        case 'RECHAZAR':
          return '¿Querés rechazar esta donación? Esta acción no podrá revertirse.';

        case 'COORDINAR':
          return '¿Confirmás que la entrega fue coordinada con el donante?';

        case 'RECIBIR':
          return '¿Confirmás que la organización recibió efectivamente estos bienes?';

        default:
          return '';

      }

    };


  // ======================================================
  // CARGANDO
  // ======================================================

  if (loading) {

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


        <ActivityIndicator
          size="large"
          color="#1F6F5C"
          style={styles.loader}
        />

      </View>

    );

  }


  // ======================================================
  // SIN DONACIÓN
  // ======================================================

  if (!donacion) {

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


        <View style={styles.emptyCard}>

          <Text style={styles.emptyTitle}>
            Donación no disponible
          </Text>

          <Text style={styles.emptyText}>
            No fue posible consultar la información de esta donación.
          </Text>

        </View>

      </View>

    );

  }


  const imagenUrl =
    obtenerUrlImagen(
      donacion.imagen_url
    );


  // ======================================================
  // VISTA
  // ======================================================

  return (

    <View style={styles.container}>

      <TouchableOpacity
        style={styles.backButton}
        onPress={onVolver}
        disabled={loadingAccion}
      >

        <Text style={styles.backButtonText}>
          ← Volver
        </Text>

      </TouchableOpacity>


      <Text style={styles.title}>
        Detalle de donación
      </Text>


      <Text style={styles.subtitle}>
        Consultá la información registrada y gestioná el estado del ofrecimiento.
      </Text>


      <View style={styles.card}>

        {imagenUrl ? (

          <Image
            source={{
              uri: imagenUrl,
            }}
            style={styles.image}
            resizeMode="cover"
          />

        ) : (

          <View
            style={
              styles.noImageContainer
            }
          >

            <Text
              style={
                styles.noImageText
              }
            >
              Sin imagen adjunta
            </Text>

          </View>

        )}


        <View style={styles.content}>

          <View style={styles.header}>

            <Text style={styles.category}>
              {donacion.categoria ||
                'Sin categoría'}
            </Text>


            <View style={styles.statusBadge}>

              <Text style={styles.statusText}>
                {obtenerEstadoMostrado(
                  donacion.estado
                )}
              </Text>

            </View>

          </View>


          <Text style={styles.label}>
            Descripción
          </Text>

          <Text style={styles.value}>
            {donacion.descripcion ||
              'Sin descripción'}
          </Text>


          <View style={styles.separator} />


          <Text style={styles.label}>
            Cantidad
          </Text>

          <Text style={styles.value}>
            {donacion.cantidad}
          </Text>


          <Text style={styles.label}>
            Unidad
          </Text>

          <Text style={styles.value}>
            {donacion.unidad ||
              'No especificada'}
          </Text>


          <Text style={styles.label}>
            Condición del bien
          </Text>

          <Text style={styles.value}>
            {donacion.condicion_bien ||
              'No especificada'}
          </Text>


          <Text style={styles.label}>
            Disponible desde
          </Text>

          <Text style={styles.value}>
            {formatearFecha(
              donacion.disponible_desde
            )}
          </Text>


          <View style={styles.separator} />


          <Text style={styles.label}>
            Ubicación aproximada
          </Text>

          {donacion.direccion ? (

              <Text style={styles.value}>
                {donacion.direccion}
              </Text>

            ) : (

              <Text style={styles.valueMuted}>
                No se indicó una ubicación.
              </Text>

            )}


          <View style={styles.separator} />


          <Text style={styles.label}>
            Fecha de registro
          </Text>

          <Text style={styles.value}>
            {formatearFecha(
              donacion.creada_en
            )}
          </Text>


          {/* ==================================================
              PENDIENTE
          ================================================== */}

          {donacion.estado ===
            'PENDIENTE' && (

            <View style={styles.actionsContainer}>

              <Text style={styles.actionsTitle}>
                Gestionar ofrecimiento
              </Text>


              <Text style={styles.actionsHelp}>
                Podés aceptar la donación o rechazarla.
              </Text>


              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.acceptButton,
                ]}
                disabled={loadingAccion}
                onPress={() =>
                  setAccionPendiente(
                    'ACEPTAR'
                  )
                }
              >

                <Text style={styles.actionButtonText}>
                  Aceptar donación
                </Text>

              </TouchableOpacity>


              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.rejectButton,
                ]}
                disabled={loadingAccion}
                onPress={() =>
                  setAccionPendiente(
                    'RECHAZAR'
                  )
                }
              >

                <Text style={styles.actionButtonText}>
                  Rechazar donación
                </Text>

              </TouchableOpacity>

            </View>

          )}


          {/* ==================================================
              ACEPTADA
          ================================================== */}

          {donacion.estado ===
            'ACEPTADA' && (

            <View style={styles.actionsContainer}>

              <Text style={styles.actionsTitle}>
                Coordinar entrega
              </Text>


              <Text style={styles.actionsHelp}>
                Indicá cómo se realizará la entrega y un teléfono de la organización para que el donante pueda comunicarse ante cualquier inconveniente.
              </Text>


              <Text style={styles.fieldLabel}>
                Detalle de coordinación *
              </Text>

              <TextInput
                style={styles.textArea}
                placeholder="Ej.: viernes de 16:00 a 18:00 en la sede de la organización"
                placeholderTextColor="#8A9692"
                multiline
                maxLength={500}
                value={
                  detalleCoordinacion
                }
                onChangeText={
                  setDetalleCoordinacion
                }
                editable={
                  !loadingAccion
                }
              />


              <Text style={styles.fieldLabel}>
                Teléfono de contacto *
              </Text>

              <TextInput
                style={styles.textInput}
                placeholder="+54 9 342 512-3456"
                placeholderTextColor="#8A9692"
                keyboardType="phone-pad"
                maxLength={30}
                value={
                  telefonoContacto
                }
                onChangeText={
                  setTelefonoContacto
                }
                editable={
                  !loadingAccion
                }
              />


              <Text style={styles.fieldHelp}>
                Este teléfono será visible para el donante únicamente para facilitar la coordinación de la entrega.
              </Text>


              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.acceptButton,

                  (
                    !detalleCoordinacion.trim() ||
                    !telefonoContacto.trim()
                  ) &&
                    styles.disabledButton,
                ]}
                disabled={
                  loadingAccion ||
                  !detalleCoordinacion.trim() ||
                  !telefonoContacto.trim()
                }
                onPress={() =>
                  setAccionPendiente(
                    'COORDINAR'
                  )
                }
              >

                <Text style={styles.actionButtonText}>
                  Coordinar entrega
                </Text>

              </TouchableOpacity>

            </View>

          )}

          {/* ==================================================
                DATOS DE COORDINACIÓN
            ================================================== */}

            {(
              donacion.estado === 'COORDINADA' ||
              donacion.estado === 'RECIBIDA'
            ) && (

              <View style={styles.coordinationCard}>

                <Text style={styles.coordinationTitle}>
                  Datos de coordinación
                </Text>


                <Text style={styles.label}>
                  Detalle acordado
                </Text>

                <Text style={styles.value}>
                  {donacion.detalle_coordinacion ||
                    'Sin información'}
                </Text>


                <Text style={styles.label}>
                  Teléfono de contacto
                </Text>

                <Text style={styles.value}>
                  {donacion.telefono_contacto ||
                    'Sin información'}
                </Text>

              </View>

            )}


          {/* ==================================================
              COORDINADA
          ================================================== */}

          {donacion.estado ===
            'COORDINADA' && (

            <View style={styles.actionsContainer}>

              <Text style={styles.actionsTitle}>
                Entrega coordinada
              </Text>


              <Text style={styles.actionsHelp}>
                Cuando recibas los bienes, confirmá la recepción.
              </Text>


              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.acceptButton,
                ]}
                disabled={loadingAccion}
                onPress={() =>
                  setAccionPendiente(
                    'RECIBIR'
                  )
                }
              >

                <Text style={styles.actionButtonText}>
                  Marcar como recibida
                </Text>

              </TouchableOpacity>

            </View>

          )}


          {/* ==================================================
              TERMINALES
          ================================================== */}

          {donacion.estado ===
            'RECHAZADA' && (

            <View style={styles.terminalCard}>

              <Text style={styles.terminalTitle}>
                Donación rechazada
              </Text>

              <Text style={styles.terminalText}>
                Esta oferta se encuentra cerrada y no admite nuevas acciones.
              </Text>

            </View>

          )}


          {donacion.estado ===
            'RECIBIDA' && (

            <View style={styles.terminalCard}>

              <Text style={styles.terminalTitle}>
                Donación recibida
              </Text>

              <Text style={styles.terminalText}>
                La entrega fue completada. Este estado es definitivo.
              </Text>

            </View>

          )}


          {loadingAccion && (

            <ActivityIndicator
              size="small"
              color="#1F6F5C"
              style={styles.actionLoader}
            />

          )}

        </View>

      </View>


      {/* ==================================================
          MODAL DE CONFIRMACIÓN
      ================================================== */}

      <Modal
        transparent
        animationType="fade"
        visible={
          accionPendiente !== null
        }
        onRequestClose={() =>
          setAccionPendiente(
            null
          )
        }
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalCard}>

            <Text style={styles.modalTitle}>
              {obtenerTituloConfirmacion()}
            </Text>


            <Text style={styles.modalText}>
              {obtenerMensajeConfirmacion()}
            </Text>


            {accionPendiente ===
              'RECHAZAR' && (

              <>

                <Text style={styles.modalLabel}>
                  Motivo del rechazo
                </Text>

                <TextInput
                  style={styles.textArea}
                  placeholder="Opcional"
                  placeholderTextColor="#8A9692"
                  multiline
                  value={
                    observacionRechazo
                  }
                  onChangeText={
                    setObservacionRechazo
                  }
                />

              </>

            )}


            <View style={styles.modalActions}>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() =>
                  setAccionPendiente(
                    null
                  )
                }
              >

                <Text style={styles.modalCancelText}>
                  Cancelar
                </Text>

              </TouchableOpacity>


              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={
                  confirmarAccion
                }
              >

                <Text style={styles.modalConfirmText}>
                  Confirmar
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        </View>

      </Modal>

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
      maxWidth: 500,
    },


    backButton: {
  alignSelf: 'flex-start',

  backgroundColor: '#FFFFFF',

  paddingHorizontal: 14,
  paddingVertical: 10,

  borderRadius: 10,

  borderWidth: 1,
  borderColor: '#DDE5E2',

  elevation: 2,

  marginBottom: 14,
},


backButtonText: {
  color: '#1F6F5C',

  fontWeight: '600',

  fontSize: 14,
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
      marginBottom: 18,
      lineHeight: 18,
    },


    loader: {
      marginTop: 40,
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
      marginTop: 6,
      fontSize: 13,
      color: '#5F6B76',
      textAlign: 'center',
      lineHeight: 18,
    },


    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#E6F2EF',
      overflow: 'hidden',
    },


    image: {
      width: '100%',
      height: 200,
      backgroundColor: '#EEF4F2',
    },


    noImageContainer: {
      height: 100,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F6F9F8',
      borderBottomWidth: 1,
      borderBottomColor: '#E6F2EF',
    },


    noImageText: {
      fontSize: 12,
      color: '#7A8782',
    },


    content: {
      padding: 18,
    },


    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 18,
    },


    category: {
      flex: 1,
      fontSize: 19,
      fontWeight: 'bold',
      color: '#164C40',
    },


    statusBadge: {
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 12,
      backgroundColor: '#E6F2EF',
    },


    statusText: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#1F6F5C',
    },


    label: {
      marginTop: 10,
      fontSize: 11,
      fontWeight: 'bold',
      color: '#7A8782',
      textTransform: 'uppercase',
    },


    value: {
      marginTop: 3,
      fontSize: 14,
      color: '#344B45',
      lineHeight: 20,
    },


    valueMuted: {
      marginTop: 3,
      fontSize: 13,
      color: '#7A8782',
    },


    separator: {
      marginTop: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#E6F2EF',
    },


    actionsContainer: {
      marginTop: 22,
      paddingTop: 18,
      borderTopWidth: 1,
      borderTopColor: '#E6F2EF',
    },


    actionsTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: '#164C40',
    },


    actionsHelp: {
      marginTop: 5,
      marginBottom: 10,
      fontSize: 13,
      lineHeight: 18,
      color: '#65736E',
    },


    textArea: {
      minHeight: 90,
      marginTop: 10,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#D8E3DF',
      backgroundColor: '#FAFCFB',
      color: '#344B45',
      textAlignVertical: 'top',
    },
    fieldLabel: {
  marginTop: 14,
  fontSize: 12,
  fontWeight: 'bold',
  color: '#5F6B76',
},


textInput: {
  minHeight: 46,
  marginTop: 7,
  paddingHorizontal: 12,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#D8E3DF',
  backgroundColor: '#FAFCFB',
  color: '#344B45',
},


fieldHelp: {
  marginTop: 7,
  fontSize: 11,
  lineHeight: 16,
  color: '#7A8782',
},


disabledButton: {
  opacity: 0.5,
},


coordinationCard: {
  marginTop: 22,
  padding: 15,
  borderRadius: 12,
  backgroundColor: '#F6FAF8',
  borderWidth: 1,
  borderColor: '#DCEAE5',
},


coordinationTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#164C40',
  marginBottom: 5,
},


    actionButton: {
      minHeight: 46,
      marginTop: 9,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },


    acceptButton: {
      backgroundColor: '#1F6F5C',
    },


    rejectButton: {
      backgroundColor: '#A94442',
    },


    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: 'bold',
    },


    terminalCard: {
      marginTop: 22,
      padding: 15,
      borderRadius: 12,
      backgroundColor: '#F3F6F5',
      borderWidth: 1,
      borderColor: '#E0E7E4',
    },


    terminalTitle: {
      fontSize: 15,
      fontWeight: 'bold',
      color: '#344B45',
    },


    terminalText: {
      marginTop: 5,
      fontSize: 13,
      lineHeight: 18,
      color: '#687570',
    },


    actionLoader: {
      marginTop: 18,
    },


    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 22,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },


    modalCard: {
      width: '100%',
      maxWidth: 380,
      padding: 20,
      borderRadius: 18,
      backgroundColor: '#FFFFFF',
    },


    modalTitle: {
      fontSize: 19,
      fontWeight: 'bold',
      color: '#164C40',
    },


    modalText: {
      marginTop: 9,
      fontSize: 14,
      lineHeight: 20,
      color: '#5F6B76',
    },


    modalLabel: {
      marginTop: 16,
      fontSize: 12,
      fontWeight: 'bold',
      color: '#5F6B76',
    },


    modalActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 20,
    },


    modalCancelButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      backgroundColor: '#EDF2F0',
    },


    modalCancelText: {
      fontWeight: 'bold',
      color: '#4D6059',
    },


    modalConfirmButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      backgroundColor: '#1F6F5C',
    },


    modalConfirmText: {
      fontWeight: 'bold',
      color: '#FFFFFF',
    },

  });