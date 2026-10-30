import React, {
  useEffect,
  useState
} from 'react'

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput
} from 'react-native'

import {
  obtenerPerfilesPublicosAdmin,
  ocultarPerfilPublicoAdmin,
  rehabilitarPerfilPublicoAdmin
} from '../services/adminService'

import {
  obtenerToken
} from '../services/authStorage';

export default function PerfilesPublicosAdminScreen({
  onVolver
}) {

  const [
    estadoSeleccionado,
    setEstadoSeleccionado
  ] = useState(
    'PUBLICADO'
  )

  const [
    perfiles,
    setPerfiles
  ] = useState([])

  const [
    cargando,
    setCargando
  ] = useState(true)

  const [
    error,
    setError
  ] = useState('')

  const [
    perfilSeleccionado,
    setPerfilSeleccionado
  ] = useState(null)

  const [
    modalOcultarVisible,
    setModalOcultarVisible
  ] = useState(false)

  const [
    motivo,
    setMotivo
  ] = useState('')

  const [
    procesando,
    setProcesando
  ] = useState(false)


  const cargarPerfiles =
    async (
      estado = estadoSeleccionado
    ) => {

      try {

        setCargando(true)

        setError('')


        const token =
            await obtenerToken();


            if (!token) {

            throw new Error(
                'No se encontró una sesión válida.'
            );

            }


        const data =
            await obtenerPerfilesPublicosAdmin(
                token,
                estado
            );


        setPerfiles(
            Array.isArray(data?.perfiles)
                ? data.perfiles
                : []
            );

      }
      catch (err) {

        setError(
          err.message ||
          'No se pudieron cargar los perfiles'
        )

      }
      finally {

        setCargando(false)

      }

    }


  useEffect(
    () => {

      cargarPerfiles(
        estadoSeleccionado
      )

    },
    [
      estadoSeleccionado
    ]
  )


  const cambiarPestana =
    estado => {

      setEstadoSeleccionado(
        estado
      )

    }


  const abrirModalOcultar =
    perfil => {

      setPerfilSeleccionado(
        perfil
      )

      setMotivo('')

      setModalOcultarVisible(
        true
      )

    }


  const cerrarModalOcultar =
    () => {

      if (procesando) {
        return
      }


      setModalOcultarVisible(
        false
      )

      setPerfilSeleccionado(
        null
      )

      setMotivo('')

    }


  const confirmarOcultamiento =
    async () => {

      const motivoLimpio =
        motivo.trim()


      if (!motivoLimpio) {

        Alert.alert(
          'Motivo obligatorio',
          'Debés ingresar un motivo administrativo para ocultar el perfil.'
        )

        return

      }


      try {

        setProcesando(true)


        const token =
            await obtenerToken();


            if (!token) {

            throw new Error(
                'No se encontró una sesión válida.'
            );

            }


            await ocultarPerfilPublicoAdmin(
            token,
            perfilSeleccionado.id_perfil_publico,
            motivoLimpio
            );


        cerrarModalOcultar()


        Alert.alert(
          'Perfil ocultado',
          'El perfil dejó de estar disponible públicamente.'
        )


        await cargarPerfiles(
          estadoSeleccionado
        )

      }
      catch (err) {

        Alert.alert(
          'Error',
          err.message ||
          'No se pudo ocultar el perfil.'
        )

      }
      finally {

        setProcesando(false)

      }

    }


  const confirmarRehabilitacion =
    perfil => {

      Alert.alert(
        'Rehabilitar perfil',
        'El perfil recuperará el estado que tenía antes del ocultamiento.',
        [
          {
            text:
              'Cancelar',

            style:
              'cancel'
          },

          {
            text:
              'Rehabilitar',

            onPress:
              async () => {

                try {

                  setProcesando(
                    true
                  )


                  const token =
                    await obtenerToken();


                    if (!token) {

                    throw new Error(
                        'No se encontró una sesión válida.'
                    );

                    }


                    await rehabilitarPerfilPublicoAdmin(
                    token,
                    perfil.id_perfil_publico
                    );


                  Alert.alert(
                    'Perfil rehabilitado',
                    'El perfil fue rehabilitado correctamente.'
                  )


                  await cargarPerfiles(
                    estadoSeleccionado
                  )

                }
                catch (err) {

                  Alert.alert(
                    'Error',
                    err.message ||
                    'No se pudo rehabilitar el perfil.'
                  )

                }
                finally {

                  setProcesando(
                    false
                  )

                }

              }
          }
        ]
      )

    }


  const ubicacionPerfil =
    perfil => {

      const partes = [
        perfil.localidad,
        perfil.provincia
      ].filter(Boolean)


      return partes.length > 0
        ? partes.join(', ')
        : 'Ubicación no informada'

    }


  return (

    <View style={styles.container}>

      <View style={styles.header}>

        <Text style={styles.eyebrow}>
          Panel administrativo · Rol ADMIN
        </Text>

        <Text style={styles.title}>
          Perfiles públicos
        </Text>

        <Text style={styles.subtitle}>
          Moderá la visibilidad de los perfiles institucionales.
        </Text>

      </View>


      <View style={styles.notice}>

        <Text style={styles.noticeIcon}>
          🔒
        </Text>

        <Text style={styles.noticeText}>
          Ocultar un perfil no elimina la organización,
          las imágenes ni el contenido almacenado.
        </Text>

      </View>


      <View style={styles.tabs}>

        <TouchableOpacity
          style={[
            styles.tab,
            estadoSeleccionado ===
              'PUBLICADO' &&
              styles.tabActive
          ]}
          onPress={
            () =>
              cambiarPestana(
                'PUBLICADO'
              )
          }
        >

          <Text
            style={[
              styles.tabText,
              estadoSeleccionado ===
                'PUBLICADO' &&
                styles.tabTextActive
            ]}
          >
            Publicados
          </Text>

        </TouchableOpacity>


        <TouchableOpacity
          style={[
            styles.tab,
            estadoSeleccionado ===
              'OCULTO' &&
              styles.tabActive
          ]}
          onPress={
            () =>
              cambiarPestana(
                'OCULTO'
              )
          }
        >

          <Text
            style={[
              styles.tabText,
              estadoSeleccionado ===
                'OCULTO' &&
                styles.tabTextActive
            ]}
          >
            Ocultos
          </Text>

        </TouchableOpacity>

      </View>


      {cargando ? (

        <View style={styles.centerBox}>

          <ActivityIndicator
            size="large"
          />

          <Text style={styles.loadingText}>
            Cargando perfiles...
          </Text>

        </View>

      ) : error ? (

        <View style={styles.centerBox}>

          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={
              () =>
                cargarPerfiles(
                  estadoSeleccionado
                )
            }
          >

            <Text style={styles.primaryButtonText}>
              Reintentar
            </Text>

          </TouchableOpacity>

        </View>

      ) : (

        <ScrollView
          contentContainerStyle={
            styles.listContent
          }
        >

          {perfiles.length === 0 ? (

            <Text style={styles.emptyText}>
              No hay perfiles en este estado.
            </Text>

          ) : (

            perfiles.map(
              perfil => (

                <View
                  key={
                    perfil.id_perfil_publico
                  }
                  style={styles.card}
                >

                  <View style={styles.cardHeader}>

                    <View style={styles.avatar}>

                      <Text style={styles.avatarText}>
                        {
                          (
                            perfil.nombre_visible ||
                            perfil.razon_social ||
                            '?'
                          )
                            .slice(
                              0,
                              2
                            )
                            .toUpperCase()
                        }
                      </Text>

                    </View>


                    <View style={styles.cardInfo}>

                      <Text style={styles.cardTitle}>
                        {
                          perfil.nombre_visible ||
                          perfil.razon_social
                        }
                      </Text>

                      <Text style={styles.cardMeta}>
                        {
                          perfil.estado_verificacion
                        }
                        {' · '}
                        {
                          ubicacionPerfil(
                            perfil
                          )
                        }
                      </Text>

                    </View>


                    <View
                      style={[
                        styles.badge,
                        perfil.estado_publicacion ===
                          'OCULTO' &&
                          styles.badgeHidden
                      ]}
                    >

                      <Text
                        style={[
                          styles.badgeText,
                          perfil.estado_publicacion ===
                            'OCULTO' &&
                            styles.badgeHiddenText
                        ]}
                      >
                        {
                          perfil.estado_publicacion
                        }
                      </Text>

                    </View>

                  </View>


                  {perfil.estado_publicacion ===
                    'OCULTO' && (

                    <View style={styles.reasonBox}>

                      <Text style={styles.reasonLabel}>
                        Motivo
                      </Text>

                      <Text style={styles.reasonText}>
                        {
                          perfil.motivo_ocultamiento ||
                          'Sin motivo informado'
                        }
                      </Text>

                    </View>

                  )}


                  <View style={styles.actions}>

                    {perfil.estado_publicacion ===
                      'PUBLICADO' ? (

                      <TouchableOpacity
                        style={styles.dangerButton}
                        onPress={
                          () =>
                            abrirModalOcultar(
                              perfil
                            )
                        }
                        disabled={
                          procesando
                        }
                      >

                        <Text style={styles.dangerButtonText}>
                          Ocultar
                        </Text>

                      </TouchableOpacity>

                    ) : (

                      <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={
                          () =>
                            confirmarRehabilitacion(
                              perfil
                            )
                        }
                        disabled={
                          procesando
                        }
                      >

                        <Text style={styles.primaryButtonText}>
                          Rehabilitar
                        </Text>

                      </TouchableOpacity>

                    )}

                  </View>

                </View>

              )
            )

          )}

        </ScrollView>

      )}


      <Modal
        visible={
          modalOcultarVisible
        }
        transparent
        animationType="fade"
        onRequestClose={
          cerrarModalOcultar
        }
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalCard}>

            <Text style={styles.modalTitle}>
              Ocultar perfil público
            </Text>

            <Text style={styles.modalDescription}>
              El perfil dejará de estar disponible para visitantes.
              La cuenta y el contenido no serán eliminados.
            </Text>


            <Text style={styles.inputLabel}>
              Motivo administrativo *
            </Text>

            <TextInput
              style={styles.textarea}
              value={motivo}
              onChangeText={
                setMotivo
              }
              placeholder="Ingresá el motivo del ocultamiento"
              multiline
              numberOfLines={4}
              editable={
                !procesando
              }
            />


            <TouchableOpacity
              style={styles.dangerButtonFull}
              onPress={
                confirmarOcultamiento
              }
              disabled={
                procesando
              }
            >

              <Text style={styles.dangerButtonText}>

                {procesando
                  ? 'Procesando...'
                  : 'Confirmar ocultamiento'}

              </Text>

            </TouchableOpacity>


            <TouchableOpacity
              style={styles.cancelButton}
              onPress={
                cerrarModalOcultar
              }
              disabled={
                procesando
              }
            >

              <Text style={styles.cancelButtonText}>
                Cancelar
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </View>

  )

}


const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        '#F5F7F6'
    },

    header: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 14,
      backgroundColor:
        '#184E3B'
    },

    eyebrow: {
      color:
        '#DDEBE4',
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 4
    },

    title: {
      color:
        '#FFFFFF',
      fontSize: 25,
      fontWeight: '800'
    },

    subtitle: {
      color:
        '#DDEBE4',
      fontSize: 13,
      marginTop: 4,
      lineHeight: 18
    },

    notice: {
      flexDirection:
        'row',
      alignItems:
        'flex-start',
      marginHorizontal: 16,
      marginTop: 16,
      padding: 13,
      borderRadius: 12,
      backgroundColor:
        '#EAF3EE'
    },

    noticeIcon: {
      marginRight: 9,
      fontSize: 16
    },

    noticeText: {
      flex: 1,
      color:
        '#335C4D',
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '600'
    },

    tabs: {
      flexDirection:
        'row',
      marginHorizontal: 16,
      marginTop: 16,
      padding: 4,
      borderRadius: 12,
      backgroundColor:
        '#E6EBE8'
    },

    tab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 9,
      alignItems:
        'center'
    },

    tabActive: {
      backgroundColor:
        '#FFFFFF'
    },

    tabText: {
      color:
        '#66756E',
      fontWeight: '700',
      fontSize: 13
    },

    tabTextActive: {
      color:
        '#184E3B'
    },

    listContent: {
      padding: 16,
      paddingBottom: 40
    },

    card: {
      backgroundColor:
        '#FFFFFF',
      borderRadius: 15,
      padding: 15,
      marginBottom: 12,
      borderWidth: 1,
      borderColor:
        '#E0E6E3'
    },

    cardHeader: {
      flexDirection:
        'row',
      alignItems:
        'center'
    },

    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor:
        '#DCEBE4',
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight: 11
    },

    avatarText: {
      color:
        '#184E3B',
      fontWeight: '800',
      fontSize: 14
    },

    cardInfo: {
      flex: 1,
      minWidth: 0
    },

    cardTitle: {
      color:
        '#1F332B',
      fontSize: 15,
      fontWeight: '800'
    },

    cardMeta: {
      color:
        '#718078',
      marginTop: 3,
      fontSize: 11
    },

    badge: {
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor:
        '#E7F4EC',
      marginLeft: 8
    },

    badgeHidden: {
      backgroundColor:
        '#F5E7E7'
    },

    badgeText: {
      color:
        '#28704E',
      fontSize: 9,
      fontWeight: '800'
    },

    badgeHiddenText: {
      color:
        '#9B3F3F'
    },

    reasonBox: {
      marginTop: 12,
      padding: 11,
      borderRadius: 10,
      backgroundColor:
        '#FFF5E9'
    },

    reasonLabel: {
      color:
        '#8A5B25',
      fontSize: 10,
      fontWeight: '800',
      marginBottom: 3
    },

    reasonText: {
      color:
        '#6D563A',
      fontSize: 12,
      lineHeight: 17
    },

    actions: {
      marginTop: 13,
      flexDirection:
        'row',
      justifyContent:
        'flex-end'
    },

    primaryButton: {
      backgroundColor:
        '#206C50',
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems:
        'center'
    },

    primaryButtonText: {
      color:
        '#FFFFFF',
      fontWeight: '800',
      fontSize: 12
    },

    dangerButton: {
      backgroundColor:
        '#FFF0F0',
      borderWidth: 1,
      borderColor:
        '#D46A6A',
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 10
    },

    dangerButtonFull: {
      backgroundColor:
        '#FFF0F0',
      borderWidth: 1,
      borderColor:
        '#D46A6A',
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems:
        'center'
    },

    dangerButtonText: {
      color:
        '#A43F3F',
      fontWeight: '800',
      fontSize: 12
    },

    centerBox: {
      flex: 1,
      alignItems:
        'center',
      justifyContent:
        'center',
      padding: 24
    },

    loadingText: {
      marginTop: 10,
      color:
        '#65736D'
    },

    errorText: {
      color:
        '#A43F3F',
      textAlign:
        'center',
      marginBottom: 12
    },

    emptyText: {
      color:
        '#74817B',
      textAlign:
        'center',
      marginTop: 30
    },

    modalOverlay: {
      flex: 1,
      backgroundColor:
        'rgba(0,0,0,0.45)',
      justifyContent:
        'center',
      padding: 20
    },

    modalCard: {
      backgroundColor:
        '#FFFFFF',
      borderRadius: 16,
      padding: 18
    },

    modalTitle: {
      color:
        '#1D382E',
      fontSize: 19,
      fontWeight: '800'
    },

    modalDescription: {
      color:
        '#66756E',
      fontSize: 12,
      lineHeight: 18,
      marginTop: 7,
      marginBottom: 15
    },

    inputLabel: {
      color:
        '#334A40',
      fontSize: 11,
      fontWeight: '800',
      marginBottom: 6
    },

    textarea: {
      minHeight: 100,
      borderWidth: 1,
      borderColor:
        '#CDD7D2',
      borderRadius: 10,
      padding: 11,
      textAlignVertical:
        'top',
      marginBottom: 14,
      color:
        '#23372F'
    },

    cancelButton: {
      marginTop: 9,
      paddingVertical: 11,
      alignItems:
        'center'
    },

    cancelButtonText: {
      color:
        '#65736D',
      fontWeight: '700'
    }

  })