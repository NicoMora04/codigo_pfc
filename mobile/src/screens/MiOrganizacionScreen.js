import React from 'react';

import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from 'react-native';

import {
  WEB_URL,
  BACKEND_URL
} from '../config/api';

import {
  obtenerTiposActividad
} from '../services/oportunidadService';

import {
  buscarUbicacionesPorTexto
} from '../services/ubicacionService';

export default function MiOrganizacionScreen({
  organizacion,
  loading,
  perfilPublico,
  loadingPerfilPublico,
  onLogout,
  onVerReputacion,
  onGuardarDescripcion,
  guardandoDescripcion = false,
  onGuardarTiposActividad,
  guardandoTiposActividad = false,
  onGuardarUbicacion,
  guardandoUbicacion = false,

}) {

  // ====================================================
  // EDICIÓN DE DESCRIPCIÓN INSTITUCIONAL
  // ACTIVIDAD 3.5.1
  // ====================================================

  const [
    editandoDescripcion,
    setEditandoDescripcion
  ] = React.useState(false);

  const [
    descripcionEditable,
    setDescripcionEditable
  ] = React.useState('');

  // ======================================================
// EDICIÓN DE TIPOS DE ACTIVIDAD
// ACTIVIDAD 3.5.1
// ======================================================

const [
  editandoTiposActividad,
  setEditandoTiposActividad
] = React.useState(false);

const [
  tiposDisponibles,
  setTiposDisponibles
] = React.useState([]);

const [
  tiposSeleccionados,
  setTiposSeleccionados
] = React.useState([]);

const [
  cargandoTiposActividad,
  setCargandoTiposActividad
] = React.useState(false);

const [
  errorTiposActividad,
  setErrorTiposActividad
] = React.useState('');


// ======================================================
// INICIAR EDICIÓN DE TIPOS DE ACTIVIDAD
// ======================================================

const iniciarEdicionTiposActividad = async () => {

  if (cargandoTiposActividad) {
    return;
  }

  // Recuperar los tipos actuales de la organización.

  const idsActuales =
    Array.isArray(organizacion?.tipos_actividad)
      ? organizacion.tipos_actividad
          .map(tipo =>
            Number(tipo.id_tipo_actividad)
          )
          .filter(id =>
            Number.isInteger(id) && id > 0
          )
      : [];

  setTiposSeleccionados(idsActuales);

  setErrorTiposActividad('');

  setCargandoTiposActividad(true);

  try {

    // Consultar el catálogo general.

    const data =
      await obtenerTiposActividad();

    if (
      !Array.isArray(data?.tiposActividad) ||
      data.tiposActividad.length === 0
    ) {

      throw new Error(
        'No hay tipos de actividad disponibles.'
      );

    }

    setTiposDisponibles(
      data.tiposActividad
    );

    setEditandoTiposActividad(true);

  }
  catch (error) {

    console.log(
      'ERROR AL CARGAR TIPOS DE ACTIVIDAD:',
      error
    );

    setErrorTiposActividad(
      error.response?.data?.error ||
      error.message ||
      'No se pudieron cargar los tipos de actividad.'
    );

  }
  finally {

    setCargandoTiposActividad(false);

  }

};


// ======================================================
// SELECCIONAR O DESELECCIONAR UNA ACTIVIDAD
// ======================================================

const alternarTipoActividad = (idTipoActividad) => {

  const id = Number(idTipoActividad);

  setTiposSeleccionados(actuales => {

    if (actuales.includes(id)) {

      return actuales.filter(
        tipo => tipo !== id
      );

    }

    return [
      ...actuales,
      id
    ];

  });

  setErrorTiposActividad('');

};


// ======================================================
// CANCELAR EDICIÓN
// ======================================================

const cancelarEdicionTiposActividad = () => {

  setEditandoTiposActividad(false);

  setTiposSeleccionados([]);

  setErrorTiposActividad('');

};


// ======================================================
// GUARDAR TIPOS DE ACTIVIDAD
// ======================================================

const guardarTiposActividad = async () => {

  if (
    guardandoTiposActividad ||
    !onGuardarTiposActividad
  ) {
    return;
  }

  // Mantener al menos una actividad seleccionada.

  if (tiposSeleccionados.length === 0) {

    setErrorTiposActividad(
      'Debés seleccionar al menos un tipo de actividad.'
    );

    return;

  }

  setErrorTiposActividad('');

  const guardadoCorrectamente =
    await onGuardarTiposActividad(
      tiposSeleccionados
    );

  if (guardadoCorrectamente) {

    setEditandoTiposActividad(false);

    setTiposSeleccionados([]);

  }

};
// ======================================================
// EDICIÓN DE UBICACIÓN INSTITUCIONAL
// ACTIVIDAD 3.5.1
// ======================================================

const [
  editandoUbicacion,
  setEditandoUbicacion
] = React.useState(false);

const [
  busquedaUbicacion,
  setBusquedaUbicacion
] = React.useState('');

const [
  resultadosUbicacion,
  setResultadosUbicacion
] = React.useState([]);

const [
  ubicacionSeleccionada,
  setUbicacionSeleccionada
] = React.useState(null);

const [
  buscandoUbicacion,
  setBuscandoUbicacion
] = React.useState(false);

const [
  errorUbicacion,
  setErrorUbicacion
] = React.useState('');


// ======================================================
// BUSCAR UBICACIONES CON GEOAPIFY
// ======================================================

React.useEffect(() => {

  if (
    !editandoUbicacion ||
    ubicacionSeleccionada ||
    busquedaUbicacion.trim().length < 3
  ) {

    setResultadosUbicacion([]);
    setBuscandoUbicacion(false);

    return;

  }

  let solicitudVigente = true;

  const timeout = setTimeout(

    async () => {

      try {

        setBuscandoUbicacion(true);

        const data =
          await buscarUbicacionesPorTexto(
            null,
            busquedaUbicacion.trim()
          );

        if (!solicitudVigente) {
          return;
        }

        setResultadosUbicacion(
          Array.isArray(data?.resultados)
            ? data.resultados
            : []
        );

      }
      catch (error) {

        if (!solicitudVigente) {
          return;
        }

        console.log(
          'ERROR AL BUSCAR UBICACIÓN:',
          error
        );

        setResultadosUbicacion([]);

        setErrorUbicacion(
          'No se pudieron consultar las ubicaciones.'
        );

      }
      finally {

        if (solicitudVigente) {

          setBuscandoUbicacion(false);

        }

      }

    },

    600

  );

  return () => {

    solicitudVigente = false;

    clearTimeout(timeout);

  };

}, [
  busquedaUbicacion,
  ubicacionSeleccionada,
  editandoUbicacion
]);


// ======================================================
// INICIAR EDICIÓN
// ======================================================

const iniciarEdicionUbicacion = () => {

  setBusquedaUbicacion('');

  setUbicacionSeleccionada(null);

  setResultadosUbicacion([]);

  setErrorUbicacion('');

  setEditandoUbicacion(true);

};


// ======================================================
// MODIFICAR TEXTO DE BÚSQUEDA
// ======================================================

const cambiarBusquedaUbicacion = (texto) => {

  setBusquedaUbicacion(texto);

  // Si modifica el texto, debe seleccionar
  // nuevamente una ubicación del catálogo.

  setUbicacionSeleccionada(null);

  setResultadosUbicacion([]);

  setErrorUbicacion('');

};


// ======================================================
// SELECCIONAR RESULTADO DE GEOAPIFY
// ======================================================

const seleccionarNuevaUbicacion = (ubicacion) => {

  setUbicacionSeleccionada(ubicacion);

  setBusquedaUbicacion(
    ubicacion.detalle ||
    ubicacion.nombre ||
    ''
  );

  setResultadosUbicacion([]);

  setErrorUbicacion('');

};


// ======================================================
// CANCELAR EDICIÓN
// ======================================================

const cancelarEdicionUbicacion = () => {

  setEditandoUbicacion(false);

  setBusquedaUbicacion('');

  setUbicacionSeleccionada(null);

  setResultadosUbicacion([]);

  setErrorUbicacion('');

};


// ======================================================
// GUARDAR UBICACIÓN INSTITUCIONAL
// ======================================================

const guardarNuevaUbicacion = async () => {

  if (
    guardandoUbicacion ||
    !onGuardarUbicacion
  ) {
    return;
  }

  if (!ubicacionSeleccionada) {

    setErrorUbicacion(
      'Debés seleccionar una ubicación de los resultados.'
    );

    return;

  }

  const ubicacion = {

    direccion:
      ubicacionSeleccionada.detalle ||
      ubicacionSeleccionada.nombre,

    localidad:
      ubicacionSeleccionada.localidad,

    provincia:
      ubicacionSeleccionada.provincia,

    latitud:
      Number(ubicacionSeleccionada.latitud),

    longitud:
      Number(ubicacionSeleccionada.longitud)

  };


  // Validar información necesaria para el guardado.

  if (
    !ubicacion.direccion ||
    !ubicacion.localidad ||
    !ubicacion.provincia ||
    !Number.isFinite(ubicacion.latitud) ||
    !Number.isFinite(ubicacion.longitud)
  ) {

    setErrorUbicacion(
      'La ubicación seleccionada no contiene todos los datos necesarios. Elegí otra dirección.'
    );

    return;

  }


  setErrorUbicacion('');


  const guardadoCorrectamente =
    await onGuardarUbicacion(
      ubicacion
    );


  if (guardadoCorrectamente) {

    cancelarEdicionUbicacion();

  }

};


  // ====================================================
  // INICIAR EDICIÓN
  // ====================================================

  const iniciarEdicionDescripcion = () => {

    setDescripcionEditable(
      organizacion?.descripcion_institucional || ''
    );

    setEditandoDescripcion(true);

  };


  // ====================================================
  // CANCELAR EDICIÓN
  // ====================================================

  const cancelarEdicionDescripcion = () => {

    setEditandoDescripcion(false);

    setDescripcionEditable('');

  };


  // ====================================================
  // GUARDAR DESCRIPCIÓN
  // ====================================================

  const guardarDescripcion = async () => {

    if (
      guardandoDescripcion ||
      !onGuardarDescripcion
    ) {
      return;
    }

    const guardadoCorrectamente =
      await onGuardarDescripcion(
        descripcionEditable
      );

    if (guardadoCorrectamente) {

      setEditandoDescripcion(false);

    }

  };

// ======================================================
// LOGO INSTITUCIONAL
// ACTIVIDAD 3.5.1
// ======================================================

const imagenes =
  Array.isArray(perfilPublico?.imagenes)
    ? perfilPublico.imagenes
    : [];

const logo = imagenes.find(
  imagen =>
    imagen.tipo === 'LOGO' &&
    imagen.url &&
    imagen.visible !== false
);

const obtenerUrlImagen = (url) => {

  if (!url) {
    return null;
  }

  if (
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    return url;
  }

  return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;

};

const logoUrl = obtenerUrlImagen(logo?.url);

  return (

    <View style={styles.container}>


      {/* ================================================= */}
      {/* ENCABEZADO */}
      {/* ================================================= */}

      <View style={styles.header}>

        <View>

          <Text style={styles.title}>
            Mi organización
          </Text>


          <Text style={styles.subtitle}>
            Información de la cuenta institucional.
          </Text>

        </View>


        <TouchableOpacity
          onPress={
            onLogout
          }
        >

          <Text style={styles.logoutText}>
            Cerrar sesión
          </Text>

        </TouchableOpacity>

      </View>


      {/* ================================================= */}
      {/* IDENTIDAD */}
      {/* ================================================= */}

      <View style={styles.identityCard}>

        <View style={styles.iconCircle}>

          {logoUrl ? (

            <Image
              source={{
                uri: logoUrl
              }}
              style={styles.logoImage}
              resizeMode="cover"
            />

          ) : (

            <Text style={styles.icon}>
              🏢
            </Text>

          )}

        </View>


        <Text style={styles.organizationName}>

          {organizacion
            ?.razon_social ||
            'Organización'}

        </Text>


        <View
          style={[
            styles.statusBadge,

            organizacion
              ?.estado_verificacion ===
              'VERIFICADA'

              ? styles.statusVerified

              : organizacion
                  ?.estado_verificacion ===
                  'RECHAZADA'

                ? styles.statusRejected

                : styles.statusPending
          ]}
        >

          <Text style={styles.statusText}>

            {organizacion
              ?.estado_verificacion ||
              'PENDIENTE'}

          </Text>

        </View>

      </View>


      {/* ================================================= */}
      {/* INFORMACIÓN */}
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
            {organizacion
              ?.razon_social ||
              'No disponible'}
          </Text>

        </View>


        <View style={styles.separator} />


        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            CUIT
          </Text>

          <Text style={styles.infoValue}>
            {organizacion
              ?.cuit ||
              'No disponible'}
          </Text>

        </View>


        <View style={styles.separator} />


        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            Correo electrónico
          </Text>

          <Text style={styles.infoValue}>
            {organizacion
              ?.email ||
              'No disponible'}
          </Text>

        </View>


        <View style={styles.separator} />


        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            Estado de verificación
          </Text>

          <Text style={styles.infoValue}>
            {organizacion
              ?.estado_verificacion ||
              'No disponible'}
          </Text>

        </View>


        <View style={styles.separator} />


        <View style={styles.infoRow}>

          <Text style={styles.infoLabel}>
            Estado de cuenta
          </Text>

          <Text style={styles.infoValue}>
            {organizacion
              ?.estado_cuenta ||
              'No disponible'}
          </Text>

          {/* ================================================= */}
{/* TIPOS DE ACTIVIDAD INSTITUCIONALES */}
{/* ACTIVIDAD 3.5.1 */}
{/* ================================================= */}

<View style={styles.separator} />

<View style={styles.infoRow}>

  <Text style={styles.infoLabel}>
    Áreas de actividad
  </Text>


  {!editandoTiposActividad ? (

    // ================================================
    // MODO VISUALIZACIÓN
    // ================================================

    <View>

      <View style={styles.tiposContainer}>

        {organizacion?.tipos_actividad?.length > 0 ? (

          organizacion.tipos_actividad.map(tipo => (

            <View

              key={String(tipo.id_tipo_actividad)}

              style={styles.tipoActualChip}

            >

              <Text style={styles.tipoActualText}>
                {tipo.nombre}
              </Text>

            </View>

          ))

        ) : (

          <Text style={styles.descripcionInstitucional}>
            No se especificaron áreas de actividad.
          </Text>

        )}

      </View>


      {/* MENSAJE DE ERROR */}

      {!!errorTiposActividad && (

        <Text style={styles.tiposError}>
          {errorTiposActividad}
        </Text>

      )}


      {/* BOTÓN EDITAR */}

      <TouchableOpacity

        style={[
          styles.editarDescripcionButton,

          cargandoTiposActividad && {
            opacity: 0.6
          }
        ]}

        onPress={iniciarEdicionTiposActividad}

        disabled={cargandoTiposActividad}

      >

        {cargandoTiposActividad ? (

          <ActivityIndicator
            size="small"
            color="#1F6F5C"
          />

        ) : (

          <Text style={styles.editarDescripcionText}>
            ✏️ Editar áreas de actividad
          </Text>

        )}

      </TouchableOpacity>

    </View>

  ) : (

    // ================================================
    // MODO EDICIÓN
    // ================================================

    <View>

      <Text style={styles.tiposAyuda}>
        Seleccioná las actividades que realiza tu
        organización. Debés mantener al menos una.
      </Text>


      {/* CATÁLOGO DE ACTIVIDADES */}

      <View style={styles.tiposContainer}>

        {tiposDisponibles.map(tipo => {

          const seleccionado =
            tiposSeleccionados.includes(
              Number(tipo.id_tipo_actividad)
            );

          return (

            <TouchableOpacity

              key={String(tipo.id_tipo_actividad)}

              style={[
                styles.tipoSeleccionable,

                seleccionado &&
                  styles.tipoSeleccionableActivo
              ]}

              onPress={() =>
                alternarTipoActividad(
                  tipo.id_tipo_actividad
                )
              }

              disabled={guardandoTiposActividad}

            >

              <Text
                style={[
                  styles.tipoSeleccionableText,

                  seleccionado &&
                    styles.tipoSeleccionableTextActivo
                ]}
              >

                {seleccionado ? '✓ ' : ''}
                {tipo.nombre}

              </Text>

            </TouchableOpacity>

          );

        })}

      </View>


      {/* CONTADOR */}

      <Text style={styles.tiposContador}>

        {tiposSeleccionados.length}
        {' '}
        {tiposSeleccionados.length === 1
          ? 'actividad seleccionada'
          : 'actividades seleccionadas'}

      </Text>


      {/* ERRORES */}

      {!!errorTiposActividad && (

        <Text style={styles.tiposError}>
          {errorTiposActividad}
        </Text>

      )}


      {/* BOTONES */}

      <View style={styles.descripcionActions}>

        <TouchableOpacity

          style={styles.cancelarDescripcionButton}

          onPress={cancelarEdicionTiposActividad}

          disabled={guardandoTiposActividad}

        >

          <Text style={styles.cancelarDescripcionText}>
            Cancelar
          </Text>

        </TouchableOpacity>


        <TouchableOpacity

          style={[
            styles.guardarDescripcionButton,

            guardandoTiposActividad && {
              opacity: 0.6
            }
          ]}

          onPress={guardarTiposActividad}

          disabled={guardandoTiposActividad}

        >

          <Text style={styles.guardarDescripcionText}>

            {guardandoTiposActividad
              ? 'Guardando...'
              : 'Guardar cambios'}

          </Text>

        </TouchableOpacity>

      </View>

    </View>

  )}

</View>
{/* ================================================= */}
{/* UBICACIÓN INSTITUCIONAL */}
{/* ACTIVIDAD 3.5.1 */}
{/* ================================================= */}

<View style={styles.separator} />

<View style={styles.infoRow}>

  <Text style={styles.infoLabel}>
    Ubicación institucional
  </Text>


  {!editandoUbicacion ? (

    // ================================================
    // MODO VISUALIZACIÓN
    // ================================================

    <View>

      <Text style={styles.ubicacionActual}>

        📍 {
          organizacion
            ?.ubicacion_institucional
            ?.direccion ||

          'No se especificó una dirección institucional.'
        }

      </Text>


      {!!organizacion
        ?.ubicacion_institucional
        ?.localidad && (

        <Text style={styles.ubicacionDetalle}>

          {[
            organizacion
              .ubicacion_institucional
              .localidad,

            organizacion
              .ubicacion_institucional
              .provincia
          ]
            .filter(Boolean)
            .join(', ')}

        </Text>

      )}


      {/* BOTÓN EDITAR */}

      <TouchableOpacity

        style={styles.editarDescripcionButton}

        onPress={iniciarEdicionUbicacion}

      >

        <Text style={styles.editarDescripcionText}>
          ✏️ Editar ubicación
        </Text>

      </TouchableOpacity>

    </View>

  ) : (

    // ================================================
    // MODO EDICIÓN
    // ================================================

    <View>

      <Text style={styles.ubicacionAyuda}>
        Buscá y seleccioná la nueva ubicación
        institucional de tu organización.
      </Text>


      {/* DIRECCIÓN ACTUAL */}

      <Text style={styles.ubicacionActualLabel}>
        Ubicación actual
      </Text>

      <Text style={styles.ubicacionDetalle}>

        {organizacion
          ?.ubicacion_institucional
          ?.direccion ||
          'No disponible'}

      </Text>


      {/* CAMPO DE BÚSQUEDA */}

      <TextInput

        style={styles.ubicacionInput}

        placeholder="Buscá una dirección o localidad..."

        placeholderTextColor="#9CA3AF"

        value={busquedaUbicacion}

        onChangeText={cambiarBusquedaUbicacion}

        editable={!guardandoUbicacion}

        autoCorrect={false}

      />


      {/* INDICADOR DE BÚSQUEDA */}

      {buscandoUbicacion && (

        <ActivityIndicator

          size="small"

          color="#1F6F5C"

          style={styles.ubicacionLoader}

        />

      )}


      {/* RESULTADOS DE GEOAPIFY */}

      {!ubicacionSeleccionada &&
        resultadosUbicacion.length > 0 && (

        <View style={styles.resultadosUbicacion}>

          {resultadosUbicacion.map(
            (resultado, index) => (

              <TouchableOpacity

                key={
                  resultado.placeId ||
                  `ubicacion-${index}`
                }

                style={styles.resultadoUbicacion}

                onPress={() =>
                  seleccionarNuevaUbicacion(
                    resultado
                  )
                }

                disabled={guardandoUbicacion}

              >

                <Text style={styles.resultadoUbicacionNombre}>

                  📍 {resultado.nombre}

                </Text>


                {!!resultado.detalle && (

                  <Text style={styles.resultadoUbicacionDetalle}>

                    {resultado.detalle}

                  </Text>

                )}

              </TouchableOpacity>

            )
          )}

        </View>

      )}


      {/* UBICACIÓN SELECCIONADA */}

      {!!ubicacionSeleccionada && (

        <View style={styles.ubicacionSeleccionadaCard}>

          <Text style={styles.ubicacionSeleccionadaTitulo}>

            ✓ Ubicación seleccionada

          </Text>


          <Text style={styles.ubicacionSeleccionadaTexto}>

            {ubicacionSeleccionada.detalle ||
              ubicacionSeleccionada.nombre}

          </Text>


          <Text style={styles.ubicacionSeleccionadaDetalle}>

            {[
              ubicacionSeleccionada.localidad,
              ubicacionSeleccionada.provincia
            ]
              .filter(Boolean)
              .join(', ')}

          </Text>

        </View>

      )}


      {/* ERRORES */}

      {!!errorUbicacion && (

        <Text style={styles.tiposError}>
          {errorUbicacion}
        </Text>

      )}


      {/* BOTONES */}

      <View style={styles.descripcionActions}>

        <TouchableOpacity

          style={styles.cancelarDescripcionButton}

          onPress={cancelarEdicionUbicacion}

          disabled={guardandoUbicacion}

        >

          <Text style={styles.cancelarDescripcionText}>
            Cancelar
          </Text>

        </TouchableOpacity>


        <TouchableOpacity

          style={[
            styles.guardarDescripcionButton,

            (
              guardandoUbicacion ||
              !ubicacionSeleccionada
            ) && {
              opacity: 0.6
            }
          ]}

          onPress={guardarNuevaUbicacion}

          disabled={
            guardandoUbicacion ||
            !ubicacionSeleccionada
          }

        >

          <Text style={styles.guardarDescripcionText}>

            {guardandoUbicacion
              ? 'Guardando...'
              : 'Guardar cambios'}

          </Text>

        </TouchableOpacity>

      </View>

    </View>

  )}

</View>

        </View>

        {/* ================================================= */}
{/* DESCRIPCIÓN INSTITUCIONAL */}
{/* ACTIVIDAD 3.5.1 */}
{/* ================================================= */}

<View style={styles.separator} />

<View style={styles.infoRow}>

  <Text style={styles.infoLabel}>
    Descripción institucional
  </Text>


  {!editandoDescripcion ? (

    // ================================================
    // MODO VISUALIZACIÓN
    // ================================================

    <View>

      <Text style={styles.descripcionInstitucional}>

        {organizacion
          ?.descripcion_institucional?.trim() ||
          'No se especificó una descripción institucional.'}

      </Text>


      <TouchableOpacity

        style={styles.editarDescripcionButton}

        onPress={iniciarEdicionDescripcion}

      >

        <Text style={styles.editarDescripcionText}>
          ✏️ Editar descripción
        </Text>

      </TouchableOpacity>

    </View>

  ) : (

    // ================================================
    // MODO EDICIÓN
    // ================================================

    <View>

      <TextInput

        style={styles.descripcionInput}

        value={descripcionEditable}

        onChangeText={setDescripcionEditable}

        placeholder="Describí las actividades que realiza tu organización..."

        placeholderTextColor="#9CA3AF"

        multiline

        numberOfLines={5}

        maxLength={500}

        textAlignVertical="top"

        editable={!guardandoDescripcion}

      />


      {/* CONTADOR DE CARACTERES */}

      <Text style={styles.contadorCaracteres}>

        {descripcionEditable.length}/500 caracteres

      </Text>


      {/* BOTONES */}

      <View style={styles.descripcionActions}>

        {/* CANCELAR */}

        <TouchableOpacity

          style={styles.cancelarDescripcionButton}

          onPress={cancelarEdicionDescripcion}

          disabled={guardandoDescripcion}

        >

          <Text style={styles.cancelarDescripcionText}>
            Cancelar
          </Text>

        </TouchableOpacity>


        {/* GUARDAR */}

        <TouchableOpacity

          style={[
            styles.guardarDescripcionButton,

            guardandoDescripcion && {
              opacity: 0.6
            }
          ]}

          onPress={guardarDescripcion}

          disabled={guardandoDescripcion}

        >

          <Text style={styles.guardarDescripcionText}>

            {guardandoDescripcion
              ? 'Guardando...'
              : 'Guardar cambios'}

          </Text>

        </TouchableOpacity>

      </View>

    </View>

  )}

</View>

      </View>
      
      {/* ================================================= */}
      {/* MI REPUTACIÓN - ACTIVIDAD 3.2.2 */}
      {/* ================================================= */}

      <View style={styles.reputationCard}>

        <Text style={styles.sectionTitle}>
          Mi reputación
        </Text>

        <Text style={styles.reputationIcon}>
          ⭐
        </Text>

        <Text style={styles.reputationDescription}>
          Consultá las calificaciones y comentarios
          que recibiste de los voluntarios por las
          actividades realizadas.
        </Text>

        <TouchableOpacity
          style={[
            styles.reputationButton,
            !onVerReputacion && {
              opacity: 0.5
            }
          ]}
          onPress={onVerReputacion}
          disabled={!onVerReputacion}
        >

          <Text style={styles.reputationButtonText}>
            Ver mi reputación
          </Text>

        </TouchableOpacity>

      </View>

      {/* ================================================= */}
      {/* PERFIL PÚBLICO - ACTIVIDAD 3.6.1 */}
      {/* ================================================= */}

      <View style={styles.publicProfileCard}>

        <Text style={styles.sectionTitle}>
          Perfil público
        </Text>


        {loadingPerfilPublico ? (

          <ActivityIndicator
            size="small"
            color="#1F6F5C"
            style={styles.publicProfileLoader}
          />

        ) : (

          <>

            <View
              style={[
                styles.publicProfileStatusBadge,

                !perfilPublico
                  ? styles.publicProfileStatusMissing

                  : perfilPublico.estado_publicacion ===
                      'PUBLICADO'
                    ? styles.publicProfileStatusPublished

                    : perfilPublico.estado_publicacion ===
                        'OCULTO'
                      ? styles.publicProfileStatusHidden

                      : styles.publicProfileStatusDraft
              ]}
            >

              <Text
                style={
                  styles.publicProfileStatusText
                }
              >

                {!perfilPublico
                  ? 'SIN CREAR'

                  : perfilPublico
                      .estado_publicacion}

              </Text>

            </View>

            {perfilPublico?.estado_publicacion ===
                'PUBLICADO' &&
              perfilPublico?.slug && (

                <TouchableOpacity
                  style={
                    styles.publicProfileWebButton
                  }
                  onPress={() =>
                    Linking.openURL(
                      `${WEB_URL}/organizaciones/${perfilPublico.slug}`
                    )
                  }
                >

                  <Text
                    style={
                      styles.publicProfileWebButtonText
                    }
                  >
                    Ver mi perfil público en la web
                  </Text>

                </TouchableOpacity>
              )}
            
            <TouchableOpacity
              style={
                styles.managePublicProfileButton
              }
              onPress={() =>
                Linking.openURL(
                  `${WEB_URL}/mi-perfil`
                )
              }
            >

              <Text
                style={
                  styles.managePublicProfileButtonText
                }
              >
                Administrar perfil en la web
              </Text>

            </TouchableOpacity>

            <Text
              style={
                styles.publicProfileDescription
              }
            >

              {!perfilPublico

                ? 'Tu organización todavía no tiene un perfil público. Podrás crearlo y completar la información institucional visible para los visitantes.'

                : perfilPublico
                    .estado_publicacion ===
                    'PUBLICADO'

                  ? 'Tu perfil se encuentra publicado y visible para los visitantes del portal web.'

                  : perfilPublico
                      .estado_publicacion ===
                      'BORRADOR'

                    ? 'Tu perfil está guardado como borrador. Podrás seguir completándolo antes de publicarlo.'

                    : perfilPublico
                        .estado_publicacion ===
                        'NO_PUBLICADO'

                      ? 'Tu perfil existe, pero actualmente no está disponible en el portal público.'

                      : perfilPublico
                          .estado_publicacion ===
                          'OCULTO'

                        ? 'El perfil fue ocultado administrativamente y no se encuentra visible para los visitantes.'

                        : 'El perfil público existe y puede gestionarse desde el portal web.'}

            </Text>

            <View style={styles.publicProfileGuide}>

              <Text style={styles.publicProfileGuideTitle}>
                Gestión del perfil
              </Text>

              <Text style={styles.publicProfileGuideText}>

                {perfilPublico
                  ? 'La edición, selección de plantilla, previsualización y publicación del perfil se realizará desde el portal web.'
                  : 'Para comenzar, ingresá al portal web con la misma cuenta de tu organización y completá tu perfil institucional.'}

              </Text>

            </View>

          </>

        )}

      </View>

    </View>

  );

}


const styles =
  StyleSheet.create({

    container: {

      width: '100%',
      maxWidth: 500,

    },


    loader: {

      marginTop: 50,

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

    },


    logoutText: {

      color: '#C62828',

      fontWeight: '600',

      marginTop: 10,

    },


    identityCard: {

      backgroundColor: '#EAF5F2',

      borderRadius: 18,

      padding: 22,

      alignItems: 'center',

      marginBottom: 18,

      borderWidth: 1,
      borderColor: '#CFE4DE',

    },


    iconCircle: {
  width: 90,
  height: 90,
  borderRadius: 45,
  backgroundColor: '#FFFFFF',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  borderWidth: 2,
  borderColor: '#CFE4DE',
},


    icon: {

      fontSize: 34,

    },


    organizationName: {

      fontSize: 20,
      fontWeight: '700',
      color: '#164C40',

      marginTop: 12,

      textAlign: 'center',

    },


    statusBadge: {

      borderRadius: 20,

      paddingHorizontal: 12,
      paddingVertical: 6,

      marginTop: 10,

    },


    statusVerified: {

      backgroundColor: '#D9F2E8',

    },


    statusPending: {

      backgroundColor: '#FFF3CD',

    },


    statusRejected: {

      backgroundColor: '#F8D7DA',

    },


    statusText: {

      fontSize: 11,
      fontWeight: '700',
      color: '#164C40',

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

      marginBottom: 14,

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


    noteCard: {

      backgroundColor: '#FFF8E7',

      borderRadius: 14,

      padding: 16,

      borderWidth: 1,
      borderColor: '#F3E4B4',

      marginBottom: 20,

    },


    noteTitle: {

      fontSize: 14,
      fontWeight: '700',
      color: '#7A5A00',

    },


    noteText: {

      fontSize: 12,
      color: '#5F6B76',

      lineHeight: 18,

      marginTop: 5,

    },

 // ======================================================
// REPUTACIÓN DE ORGANIZACIÓN - ACTIVIDAD 3.2.2
// ======================================================

reputationCard: {
  backgroundColor: '#FFFFFF',

  borderRadius: 16,

  padding: 20,

  marginBottom: 18,

  borderWidth: 1,
  borderColor: '#DDE5E2',

  alignItems: 'center',
},

reputationIcon: {
  fontSize: 42,

  marginBottom: 10,
},

reputationDescription: {
  fontSize: 14,

  color: '#5F6B76',

  textAlign: 'center',

  lineHeight: 21,

  marginBottom: 20,
},

reputationButton: {
  width: '100%',

  minHeight: 46,

  borderRadius: 10,

  backgroundColor: '#1F6F5C',

  alignItems: 'center',
  justifyContent: 'center',
},

reputationButtonText: {
  color: '#FFFFFF',

  fontWeight: '700',

  fontSize: 14,
},

publicProfileCard: {

  backgroundColor: '#FFFFFF',

  borderRadius: 16,

  padding: 18,

  borderWidth: 1,
  borderColor: '#DDE5E2',

  marginBottom: 18,

},


publicProfileLoader: {

  marginVertical: 18,

},


publicProfileStatusBadge: {

  alignSelf: 'flex-start',

  paddingHorizontal: 11,
  paddingVertical: 6,

  borderRadius: 20,

  marginBottom: 12,

},


publicProfileStatusPublished: {

  backgroundColor: '#D9F2E8',

},


publicProfileStatusDraft: {

  backgroundColor: '#FFF3CD',

},


publicProfileStatusMissing: {

  backgroundColor: '#EEF1F0',

},


publicProfileStatusHidden: {

  backgroundColor: '#F8D7DA',

},


publicProfileStatusText: {

  fontSize: 11,

  fontWeight: '700',

  color: '#164C40',

},


publicProfileDescription: {

  fontSize: 14,

  color: '#5F6B76',

  lineHeight: 21,

  marginBottom: 16,

},


publicProfileGuide: {

  marginTop: 14,

  padding: 14,

  borderRadius: 12,

  backgroundColor: '#EAF5F2',

  borderWidth: 1,

  borderColor: '#CFE4DE',

},


publicProfileGuideTitle: {

  fontSize: 13,

  fontWeight: '700',

  color: '#164C40',

  marginBottom: 5,

},


publicProfileGuideText: {

  fontSize: 12,

  color: '#5F6B76',

  lineHeight: 18,

},

publicProfileWebButton: {

  minHeight: 46,

  marginTop: 14,

  borderRadius: 10,

  backgroundColor: '#1F6F5C',

  alignItems: 'center',
  justifyContent: 'center',

  paddingHorizontal: 14,

},


publicProfileWebButtonText: {

  color: '#FFFFFF',

  fontSize: 14,
  fontWeight: '700',

  textAlign: 'center',

},

managePublicProfileButton: {

  minHeight: 46,

  marginTop: 10,

  borderRadius: 10,

  borderWidth: 1,
  borderColor: '#1F6F5C',

  backgroundColor: '#FFFFFF',

  alignItems: 'center',
  justifyContent: 'center',

  paddingHorizontal: 14,

},


managePublicProfileButtonText: {

  color: '#1F6F5C',

  fontSize: 14,
  fontWeight: '700',

  textAlign: 'center',

},
logoImage: {
  width: 90,
  height: 90,
  borderRadius: 45,
},

// ======================================================
// DESCRIPCIÓN INSTITUCIONAL
// ACTIVIDAD 3.5.1
// ======================================================

descripcionInstitucional: {

  fontSize: 14,

  color: '#374151',

  lineHeight: 21,

  marginTop: 8,

  marginBottom: 12,

},


// ======================================================
// BOTÓN EDITAR
// ======================================================

editarDescripcionButton: {

  alignSelf: 'flex-start',

  backgroundColor: '#EAF5F2',

  borderRadius: 9,

  paddingHorizontal: 14,

  paddingVertical: 10,

  marginTop: 4,

},

editarDescripcionText: {

  color: '#1F6F5C',

  fontSize: 13,

  fontWeight: '600',

},


// ======================================================
// CAMPO DE EDICIÓN
// ======================================================

descripcionInput: {

  minHeight: 120,

  borderWidth: 1,

  borderColor: '#D7E0DD',

  borderRadius: 10,

  backgroundColor: '#FFFFFF',

  padding: 12,

  fontSize: 14,

  color: '#1F2937',

  marginTop: 10,

},


// ======================================================
// CONTADOR DE CARACTERES
// ======================================================

contadorCaracteres: {

  fontSize: 12,

  color: '#6B7280',

  textAlign: 'right',

  marginTop: 6,

},


// ======================================================
// CONTENEDOR DE BOTONES
// ======================================================

descripcionActions: {

  flexDirection: 'row',

  gap: 10,

  marginTop: 16,

},


// ======================================================
// BOTÓN CANCELAR
// ======================================================

cancelarDescripcionButton: {

  flex: 1,

  minHeight: 44,

  borderWidth: 1,

  borderColor: '#1F6F5C',

  borderRadius: 9,

  backgroundColor: '#FFFFFF',

  alignItems: 'center',

  justifyContent: 'center',

},

cancelarDescripcionText: {

  color: '#1F6F5C',

  fontSize: 13,

  fontWeight: '600',

},


// ======================================================
// BOTÓN GUARDAR
// ======================================================

guardarDescripcionButton: {

  flex: 1,

  minHeight: 44,

  backgroundColor: '#1F6F5C',

  borderRadius: 9,

  alignItems: 'center',

  justifyContent: 'center',

},

guardarDescripcionText: {

  color: '#FFFFFF',

  fontSize: 13,

  fontWeight: '700',

},
// ======================================================
// TIPOS DE ACTIVIDAD
// ACTIVIDAD 3.5.1
// ======================================================

tiposContainer: {

  flexDirection: 'row',

  flexWrap: 'wrap',

  gap: 8,

  marginTop: 10,

  marginBottom: 12,

},


// ======================================================
// ACTIVIDAD ACTUAL
// ======================================================

tipoActualChip: {

  backgroundColor: '#EAF5F2',

  borderRadius: 16,

  paddingHorizontal: 12,

  paddingVertical: 8,

},

tipoActualText: {

  color: '#164C40',

  fontSize: 12,

  fontWeight: '600',

},


// ======================================================
// ACTIVIDADES SELECCIONABLES
// ======================================================

tipoSeleccionable: {

  borderWidth: 1,

  borderColor: '#D7E0DD',

  borderRadius: 12,

  paddingHorizontal: 12,

  paddingVertical: 10,

  backgroundColor: '#FFFFFF',

},

tipoSeleccionableActivo: {

  backgroundColor: '#1F6F5C',

  borderColor: '#1F6F5C',

},

tipoSeleccionableText: {

  color: '#374151',

  fontSize: 12,

  fontWeight: '600',

},

tipoSeleccionableTextActivo: {

  color: '#FFFFFF',

},


// ======================================================
// TEXTOS AUXILIARES
// ======================================================

tiposAyuda: {

  fontSize: 13,

  color: '#6B7280',

  lineHeight: 19,

  marginTop: 10,

},

tiposContador: {

  fontSize: 12,

  color: '#6B7280',

  marginTop: 4,

  marginBottom: 8,

},

tiposError: {

  fontSize: 12,

  color: '#C62828',

  marginTop: 8,

  marginBottom: 8,

},
// ======================================================
// UBICACIÓN INSTITUCIONAL
// ACTIVIDAD 3.5.1
// ======================================================

ubicacionActual: {

  fontSize: 14,

  color: '#374151',

  lineHeight: 21,

  marginTop: 8,

  marginBottom: 5,

},

ubicacionDetalle: {

  fontSize: 13,

  color: '#6B7280',

  lineHeight: 19,

  marginBottom: 12,

},

ubicacionAyuda: {

  fontSize: 13,

  color: '#6B7280',

  lineHeight: 20,

  marginTop: 10,

  marginBottom: 14,

},

ubicacionActualLabel: {

  fontSize: 12,

  fontWeight: '700',

  color: '#164C40',

  marginBottom: 5,

},

// ======================================================
// CAMPO DE BÚSQUEDA
// ======================================================

ubicacionInput: {

  minHeight: 46,

  borderWidth: 1,

  borderColor: '#D7E0DD',

  borderRadius: 10,

  backgroundColor: '#FFFFFF',

  paddingHorizontal: 12,

  fontSize: 14,

  color: '#1F2937',

  marginTop: 8,

},

ubicacionLoader: {

  marginVertical: 14,

},

// ======================================================
// RESULTADOS DE GEOAPIFY
// ======================================================

resultadosUbicacion: {

  marginTop: 8,

  borderWidth: 1,

  borderColor: '#DDE5E2',

  borderRadius: 10,

  overflow: 'hidden',

  backgroundColor: '#FFFFFF',

},

resultadoUbicacion: {

  padding: 13,

  borderBottomWidth: 1,

  borderBottomColor: '#EEF1F0',

},

resultadoUbicacionNombre: {

  fontSize: 13,

  fontWeight: '600',

  color: '#164C40',

},

resultadoUbicacionDetalle: {

  fontSize: 12,

  color: '#6B7280',

  marginTop: 4,

},

// ======================================================
// UBICACIÓN SELECCIONADA
// ======================================================

ubicacionSeleccionadaCard: {

  backgroundColor: '#EAF5F2',

  borderWidth: 1,

  borderColor: '#CFE4DE',

  borderRadius: 12,

  padding: 14,

  marginTop: 12,

},

ubicacionSeleccionadaTitulo: {

  fontSize: 13,

  fontWeight: '700',

  color: '#1F6F5C',

  marginBottom: 6,

},

ubicacionSeleccionadaTexto: {

  fontSize: 13,

  color: '#374151',

  fontWeight: '600',

},

ubicacionSeleccionadaDetalle: {

  fontSize: 12,

  color: '#6B7280',

  marginTop: 4,

},

  });