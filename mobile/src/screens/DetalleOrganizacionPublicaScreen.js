import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Linking,
  Image,
} from 'react-native';

import {
  WEB_URL,
  BACKEND_URL,
} from '../config/api';


export default function DetalleOrganizacionPublicaScreen({
  organizacion,
  loading,
  onVolver,
  onVerOportunidad,
}) {

  // =====================================================
  // CARGANDO
  // =====================================================

  if (loading) {

    return (

      <View style={styles.container}>

        <ActivityIndicator
          size="large"
          color="#1F6F5C"
          style={styles.loader}
        />

      </View>

    );

  }


  // =====================================================
  // SIN ORGANIZACIÓN
  // =====================================================

  if (!organizacion) {

    return (

      <View style={styles.container}>

        <Text style={styles.emptyTitle}>
          No se pudo cargar la organización
        </Text>


        <TouchableOpacity
          style={styles.backButton}
          onPress={onVolver}
        >

          <Text style={styles.backButtonText}>
            ← Volver
          </Text>

        </TouchableOpacity>

      </View>

    );

  }


  // =====================================================
  // DATOS
  // =====================================================

// =====================================================
// DESCRIPCIÓN INSTITUCIONAL
// ACTIVIDAD 3.5.1
// =====================================================

const descripcion =
  organizacion.descripcion_institucional?.trim() ||
  'Esta organización todavía no agregó una descripción institucional.';


// =====================================================
// UBICACIÓN INSTITUCIONAL
// =====================================================

const ubicacionInstitucional =
  organizacion.ubicacion_institucional || {};

const tieneDireccion =
  Boolean(ubicacionInstitucional.direccion);

const ubicacion =
  [
    ubicacionInstitucional.direccion,

    ubicacionInstitucional.localidad ||
      organizacion.ubicacion_aproximada?.localidad,

    ubicacionInstitucional.provincia ||
      organizacion.ubicacion_aproximada?.provincia,
  ]
    .filter(Boolean)
    .join(', ');


// =====================================================
// REPUTACIÓN
// =====================================================

const cantidadValoraciones =
  Number(organizacion.reputacion?.cantidad || 0);

const promedioReputacion =
  organizacion.reputacion?.promedio;

const textoReputacion =
  cantidadValoraciones > 0 &&
  promedioReputacion != null
    ? `⭐ ${Number(promedioReputacion)
        .toFixed(1)
        .replace('.', ',')}/5 · ${cantidadValoraciones} ${
          cantidadValoraciones === 1
            ? 'valoración'
            : 'valoraciones'
        }`
    : '⭐ Sin valoraciones todavía';


// =====================================================
// PERFIL WEB PUBLICADO
// =====================================================

const tienePerfilWeb =
  organizacion.tiene_perfil_publico === true &&
  Boolean(organizacion.slug);

  const oportunidades =
    Array.isArray(
      organizacion.oportunidades
    )
      ? organizacion.oportunidades
      : [];


  const imagenes =
    Array.isArray(
      organizacion.imagenes
    )
      ? organizacion.imagenes
      : [];


  const logo =
    imagenes.find(
      imagen =>
        imagen.tipo === 'LOGO'
    );


  const portada =
    imagenes.find(
      imagen =>
        imagen.tipo === 'PORTADA'
    );


  // =====================================================
  // URL DE IMAGEN
  // =====================================================

  const obtenerUrlImagen =
    url => {

      if (!url) {
        return null;
      }


      if (
        url.startsWith('http://') ||
        url.startsWith('https://')
      ) {

        return url;

      }


      return `${BACKEND_URL}${url}`;

    };


  // =====================================================
  // ABRIR PERFIL WEB
  // =====================================================

  const abrirPerfilWeb =
    async () => {

      if (!organizacion.slug) {
        return;
      }


      const url =
        `${WEB_URL}/organizaciones/${organizacion.slug}`;


      try {

        await Linking.openURL(
          url
        );

      }
      catch (error) {

        console.log(
          'No se pudo abrir el perfil web:',
          error.message
        );

      }

    };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <View style={styles.container}>

      {/* ================================================= */}
      {/* VOLVER */}
      {/* ================================================= */}

      <TouchableOpacity
        style={styles.backButton}
        onPress={onVolver}
      >

        <Text style={styles.backButtonText}>
          ← Volver a organizaciones
        </Text>

      </TouchableOpacity>


      {/* ================================================= */}
      {/* IDENTIDAD */}
      {/* ================================================= */}

      <View style={styles.identityCard}>

        {portada?.url ? (

          <Image
            source={{
              uri:
                obtenerUrlImagen(
                  portada.url
                ),
            }}
            style={styles.coverImage}
            resizeMode="cover"
          />

        ) : (

          <View style={styles.coverFallback} />

        )}


        <View style={styles.logoWrapper}>

          {logo?.url ? (

            <Image
              source={{
                uri:
                  obtenerUrlImagen(
                    logo.url
                  ),
              }}
              style={styles.logoImage}
              resizeMode="contain"
            />

          ) : (

            <View style={styles.logoFallback}>

              <Text style={styles.logoFallbackText}>
                🏢
              </Text>

            </View>

          )}

        </View>


        <View style={styles.identityContent}>

          <Text style={styles.organizationName}>
            {organizacion.nombre_visible}
          </Text>


          <View style={styles.verifiedBadge}>

            <Text style={styles.verifiedText}>
              ✓ Organización verificada
            </Text>

          </View>

        <Text style={styles.reputationText}>
          {textoReputacion}
        </Text>

        </View>

      </View>


      {/* ================================================= */}
      {/* INFORMACIÓN GENERAL */}
      {/* ================================================= */}

      <View style={styles.infoCard}>

        <Text style={styles.sectionTitle}>
          Sobre la organización
        </Text>

        {/* DESCRIPCIÓN */}

        <Text style={styles.description}>
          {descripcion}
        </Text>


        {/* UBICACIÓN INSTITUCIONAL */}

        {ubicacion !== '' && (

          <>

            <View style={styles.separator} />

            <Text style={styles.infoLabel}>
              Ubicación institucional
            </Text>

            <Text style={styles.infoValue}>
              📍 {ubicacion}
            </Text>

            {!tieneDireccion && (

              <Text style={styles.approximateText}>
                Ubicación aproximada
              </Text>

            )}

          </>

        )}

      </View>


      {/* ================================================= */}
      {/* TIPOS DE ACTIVIDAD */}
      {/* ================================================= */}

      <View style={styles.infoCard}>

        <Text style={styles.sectionTitle}>
          Áreas de actividad
        </Text>


        {organizacion
          .tipos_actividad
          ?.length > 0 ? (

          <View style={styles.activityContainer}>

            {organizacion
              .tipos_actividad
              .map(
                tipo => (

                  <View
                    key={
                      tipo.id_tipo_actividad ||
                      tipo.nombre ||
                      tipo
                    }
                    style={styles.activityChip}
                  >

                    <Text style={styles.activityChipText}>

                      {
                        tipo.nombre ||
                        tipo
                      }

                    </Text>

                  </View>

                )
              )}

          </View>

        ) : (

          <Text style={styles.description}>
            No se especificaron áreas de actividad.
          </Text>

        )}

      </View>


      {/* ================================================= */}
      {/* CONTACTO */}
      {/* ================================================= */}

      {(
        organizacion
          .email_contacto_publico ||

        organizacion
          .telefono_contacto_publico ||

        organizacion
          .sitio_web_url
      ) && (

        <View style={styles.infoCard}>

          <Text style={styles.sectionTitle}>
            Contacto
          </Text>


          {!!organizacion
            .email_contacto_publico && (

            <View style={styles.infoBlock}>

              <Text style={styles.infoLabel}>
                Correo electrónico
              </Text>

              <Text style={styles.infoValue}>
                {
                  organizacion
                    .email_contacto_publico
                }
              </Text>

            </View>

          )}


          {!!organizacion
            .telefono_contacto_publico && (

            <View style={styles.infoBlock}>

              <Text style={styles.infoLabel}>
                Teléfono
              </Text>

              <Text style={styles.infoValue}>
                {
                  organizacion
                    .telefono_contacto_publico
                }
              </Text>

            </View>

          )}


          {!!organizacion
            .sitio_web_url && (

            <View style={styles.infoBlock}>

              <Text style={styles.infoLabel}>
                Sitio web
              </Text>

              <Text style={styles.infoValue}>
                {
                  organizacion
                    .sitio_web_url
                }
              </Text>

            </View>

          )}

        </View>

      )}


      {/* ================================================= */}
{/* PERFIL PÚBLICO WEB */}
{/* ================================================= */}

{tienePerfilWeb && (

  <View style={styles.webCard}>

    <Text style={styles.webIcon}>
      🌐
    </Text>

    <Text style={styles.webTitle}>
      Perfil público
    </Text>

    <Text style={styles.webDescription}>
      Consultá el perfil completo de la organización,
      sus imágenes y contenido institucional en el
      portal web.
    </Text>

    <TouchableOpacity
      style={styles.webButton}
      onPress={abrirPerfilWeb}
    >

      <Text style={styles.webButtonText}>
        Ver perfil público en la web
      </Text>

    </TouchableOpacity>

  </View>

)}

      {/* ================================================= */}
      {/* OPORTUNIDADES */}
      {/* ================================================= */}

      <Text style={styles.opportunitiesTitle}>
        Oportunidades abiertas
      </Text>


      {oportunidades.length === 0 ? (

        <View style={styles.emptyCard}>

          <Text style={styles.emptyText}>
            Esta organización no tiene oportunidades
            abiertas en este momento.
          </Text>

        </View>

      ) : (

        oportunidades.map(
          oportunidad => (

            <View
              key={
                oportunidad.id_oportunidad
              }
              style={styles.opportunityCard}
            >

              <Text style={styles.opportunityTitle}>
                {oportunidad.titulo}
              </Text>


              {!!oportunidad.descripcion && (

                <Text
                  style={styles.opportunityDescription}
                  numberOfLines={3}
                >
                  {oportunidad.descripcion}
                </Text>

              )}


              {!!oportunidad.fecha_inicio && (

                <Text style={styles.opportunityInfo}>

                  Inicio:{' '}
                  {
                    new Date(
                      oportunidad.fecha_inicio
                    ).toLocaleDateString(
                      'es-AR'
                    )
                  }

                </Text>

              )}


              {!!oportunidad.urgencia && (

                <Text style={styles.opportunityInfo}>
                  Urgencia: {
                    oportunidad.urgencia
                  }
                </Text>

              )}


              <TouchableOpacity
                style={styles.detailButton}
                onPress={() =>
                  onVerOportunidad(
                    oportunidad.id_oportunidad
                  )
                }
              >

                <Text style={styles.detailButtonText}>
                  Ver detalle
                </Text>

              </TouchableOpacity>

            </View>

          )
        )

      )}

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

      alignSelf: 'center',

      paddingBottom: 30,

    },


    loader: {

      marginTop: 50,

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


    identityCard: {

      backgroundColor: '#FFFFFF',

      borderRadius: 18,

      overflow: 'hidden',

      borderWidth: 1,

      borderColor: '#DDE5E2',

      marginBottom: 18,

      elevation: 2,

    },


    coverImage: {

      width: '100%',

      height: 150,

    },


    coverFallback: {

      width: '100%',

      height: 120,

      backgroundColor: '#DCECE7',

    },


    logoWrapper: {

      width: 84,

      height: 84,

      borderRadius: 42,

      backgroundColor: '#FFFFFF',

      marginTop: -42,

      marginLeft: 20,

      borderWidth: 3,

      borderColor: '#FFFFFF',

      elevation: 3,

      overflow: 'hidden',

    },


    logoImage: {

      width: '100%',

      height: '100%',

    },


    logoFallback: {

      flex: 1,

      alignItems: 'center',

      justifyContent: 'center',

      backgroundColor: '#EAF5F2',

    },


    logoFallbackText: {

      fontSize: 34,

    },


    identityContent: {

      padding: 20,

      paddingTop: 12,

    },


    organizationName: {

      fontSize: 22,

      fontWeight: '700',

      color: '#164C40',

    },


    verifiedBadge: {

      alignSelf: 'flex-start',

      marginTop: 10,

      backgroundColor: '#D9F2E8',

      borderRadius: 20,

      paddingHorizontal: 10,

      paddingVertical: 6,

    },


    verifiedText: {

      fontSize: 11,

      fontWeight: '700',

      color: '#164C40',

    },
    reputationText: {

        fontSize: 14,

        fontWeight: '600',

        color: '#374151',

        marginTop: 12,

      },


    infoCard: {

      backgroundColor: '#FFFFFF',

      borderRadius: 16,

      padding: 18,

      borderWidth: 1,

      borderColor: '#DDE5E2',

      marginBottom: 18,

    },


    sectionTitle: {

      fontSize: 17,

      fontWeight: '700',

      color: '#164C40',

      marginBottom: 12,

    },


    description: {

      fontSize: 14,

      lineHeight: 21,

      color: '#5F6B76',

    },


    separator: {

      height: 1,

      backgroundColor: '#EEF1F0',

      marginVertical: 16,

    },


    infoBlock: {

      marginBottom: 14,

    },


    infoLabel: {

      fontSize: 12,

      color: '#5F6B76',

    },


    infoValue: {

      fontSize: 14,

      fontWeight: '600',

      color: '#1F2937',

      marginTop: 4,

    },


    approximateText: {

      fontSize: 11,

      color: '#7A858D',

      marginTop: 4,

    },


    activityContainer: {

      flexDirection: 'row',

      flexWrap: 'wrap',

      gap: 7,

    },


    activityChip: {

      backgroundColor: '#EAF5F2',

      borderRadius: 15,

      paddingHorizontal: 10,

      paddingVertical: 6,

    },


    activityChipText: {

      fontSize: 12,

      fontWeight: '600',

      color: '#164C40',

    },


    webCard: {

      backgroundColor: '#EAF5F2',

      borderRadius: 16,

      padding: 20,

      borderWidth: 1,

      borderColor: '#CFE4DE',

      alignItems: 'center',

      marginBottom: 24,

    },


    webIcon: {

      fontSize: 34,

      marginBottom: 8,

    },


    webTitle: {

      fontSize: 17,

      fontWeight: '700',

      color: '#164C40',

      marginBottom: 6,

    },


    webDescription: {

      fontSize: 13,

      color: '#5F6B76',

      lineHeight: 19,

      textAlign: 'center',

      marginBottom: 16,

    },


    webButton: {

      width: '100%',

      minHeight: 46,

      borderRadius: 10,

      backgroundColor: '#1F6F5C',

      alignItems: 'center',

      justifyContent: 'center',

    },


    webButtonText: {

      color: '#FFFFFF',

      fontSize: 14,

      fontWeight: '700',

    },


    opportunitiesTitle: {

      fontSize: 19,

      fontWeight: '700',

      color: '#1F2937',

      marginBottom: 12,

    },


    opportunityCard: {

      backgroundColor: '#FFFFFF',

      borderRadius: 14,

      padding: 16,

      marginBottom: 12,

      borderWidth: 1,

      borderColor: '#DDE5E2',

      elevation: 1,

    },


    opportunityTitle: {

      fontSize: 16,

      fontWeight: '700',

      color: '#164C40',

      marginBottom: 7,

    },


    opportunityDescription: {

      fontSize: 13,

      lineHeight: 19,

      color: '#5F6B76',

      marginBottom: 9,

    },


    opportunityInfo: {

      fontSize: 12,

      color: '#5F6B76',

      marginBottom: 4,

    },


    detailButton: {

      height: 42,

      backgroundColor: '#1F6F5C',

      borderRadius: 9,

      alignItems: 'center',

      justifyContent: 'center',

      marginTop: 12,

    },


    detailButtonText: {

      color: '#FFFFFF',

      fontWeight: '600',

    },


    emptyCard: {

      backgroundColor: '#FFFFFF',

      borderRadius: 14,

      padding: 20,

      borderWidth: 1,

      borderColor: '#DDE5E2',

    },


    emptyTitle: {

      fontSize: 17,

      fontWeight: '700',

      color: '#1F2937',

      marginBottom: 16,

    },


    emptyText: {

      fontSize: 13,

      color: '#5F6B76',

      textAlign: 'center',

      lineHeight: 19,

    },

  });