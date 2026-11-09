import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput
} from 'react-native';


// ======================================================
// MI PERFIL - VOLUNTARIO
// ACTIVIDAD 3.2.1
// ======================================================

export default function MiPerfilVoluntarioScreen({
  voluntario,
  loading,
  onVerReputacion,
  onLogout,
  tiposActividad = [],
  intereses,
  loadingIntereses = false,
  onGuardarIntereses,
  onGuardarDatosPersonales,
  guardandoDatosPersonales = false
}) {

  const [interesesSeleccionados, setInteresesSeleccionados] = useState([]);
  // ======================================================
// EDICIÓN DE DATOS PERSONALES
// ACTIVIDAD 3.5.1
// ======================================================

const [editandoDatos, setEditandoDatos] = useState(false);

const [datosEditables, setDatosEditables] = useState({
  nombre: '',
  apellido: '',
  telefono: ''
});

const [errorEdicion, setErrorEdicion] = useState('');


// ======================================================
// INICIAR EDICIÓN
// ======================================================

const iniciarEdicion = () => {

  if (!voluntario) return;

  setDatosEditables({
    nombre: voluntario.nombre || '',
    apellido: voluntario.apellido || '',
    telefono: voluntario.telefono || ''
  });

  setErrorEdicion('');
  setEditandoDatos(true);

};


// ======================================================
// CANCELAR EDICIÓN
// ======================================================

const cancelarEdicion = () => {

  if (guardandoDatosPersonales) return;

  setEditandoDatos(false);
  setErrorEdicion('');

};


// ======================================================
// GUARDAR DATOS PERSONALES
// ======================================================

const guardarDatosPersonales = async () => {

  if (
    !onGuardarDatosPersonales ||
    guardandoDatosPersonales
  ) {
    return;
  }

  const nombre = datosEditables.nombre.trim();
  const apellido = datosEditables.apellido.trim();
  const telefono = datosEditables.telefono.trim();

  // ==================================================
  // VALIDACIONES
  // ==================================================

  if (!nombre || nombre.length > 100) {

    setErrorEdicion(
      'El nombre es obligatorio y no puede superar los 100 caracteres.'
    );

    return;
  }

  if (!apellido || apellido.length > 100) {

    setErrorEdicion(
      'El apellido es obligatorio y no puede superar los 100 caracteres.'
    );

    return;
  }

  if (
    telefono &&
    !/^\d{7,15}$/.test(telefono)
  ) {

    setErrorEdicion(
      'El teléfono debe contener entre 7 y 15 dígitos numéricos.'
    );

    return;
  }

  setErrorEdicion('');

  // ==================================================
  // ACTUALIZAR PERFIL
  // ==================================================

  try {

    const actualizado = await onGuardarDatosPersonales({
      nombre,
      apellido,
      telefono: telefono || null
    });

    // Cerrar el formulario únicamente si
    // la actualización fue satisfactoria.

    if (actualizado === true) {

      setEditandoDatos(false);
      setErrorEdicion('');

    }

  }
  catch (error) {

    setErrorEdicion(
      error.response?.data?.error ||
      'No se pudieron guardar los cambios.'
    );

  }

};

  // ======================================================
// DETECTAR MODIFICACIONES EN LOS INTERESES
// MEJORA UX - ACTIVIDAD 3.3.2
// ======================================================

const interesesGuardados =
  (Array.isArray(intereses) ? intereses : [])
    .map((interes) => {

      if (
        typeof interes === 'object' &&
        interes !== null
      ) {
        return Number(interes.id_tipo_actividad);
      }

      return Number(interes);

    })
    .filter(Number.isFinite);


// Ordenar los identificadores para comparar
// independientemente del orden de selección.

const normalizarIds = (ids) =>
  [...new Set(ids)].sort((a, b) => a - b);


const seleccionActual =
  normalizarIds(interesesSeleccionados);

const seleccionGuardada =
  normalizarIds(interesesGuardados);


// Determinar si existen cambios sin guardar.

const hayCambios =
  seleccionActual.length !== seleccionGuardada.length ||
  seleccionActual.some(
    (id, index) => id !== seleccionGuardada[index]
  );


const botonActualizarDeshabilitado =
  loadingIntereses ||
  !hayCambios ||
  tiposActividad.length === 0;

  useEffect(() => {

  const listaIntereses =
    Array.isArray(intereses)
      ? intereses
      : [];

  const ids = listaIntereses.map((interes) => {

    if (
      typeof interes === 'object' &&
      interes !== null
    ) {
      return Number(interes.id_tipo_actividad);
    }

    return Number(interes);

  });

  setInteresesSeleccionados(ids);

}, [intereses]);


  const alternarInteres = (idTipoActividad) => {
    const id = Number(idTipoActividad);

    setInteresesSeleccionados((actuales) => {
      if (actuales.includes(id)) {
        return actuales.filter((item) => item !== id);
      }

      return [...actuales, id];
    });
  };


// ======================================================
// ACTUALIZAR INTERESES
// MEJORA UX - ACTIVIDAD 3.3.2
// ======================================================

const guardarIntereses = async () => {

  if (
    !onGuardarIntereses ||
    botonActualizarDeshabilitado
  ) {
    return;
  }

  await onGuardarIntereses(
    interesesSeleccionados
  );

};
  // ======================================================
  // ESTADO DE CARGA
  // ======================================================

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


  if (!voluntario) {

    return (
      <View style={styles.container}>

        <Text style={styles.emptyText}>
          No se pudo cargar la información
          del perfil.
        </Text>

      </View>
    );

  }


  const nombreCompleto = [
    voluntario.nombre,
    voluntario.apellido
  ]
    .filter(Boolean)
    .join(' ');


  return (

    <View style={styles.container}>

      {/* ============================================ */}
      {/* ENCABEZADO */}
      {/* ============================================ */}

      <View style={styles.header}>

        <View>

          <Text style={styles.title}>
            Mi perfil
          </Text>

          <Text style={styles.subtitle}>
            Información de tu cuenta de voluntariado.
          </Text>

        </View>

        <TouchableOpacity
          onPress={onLogout}
        >

          <Text style={styles.logoutText}>
            Cerrar sesión
          </Text>

        </TouchableOpacity>

      </View>


      {/* ============================================ */}
      {/* IDENTIDAD DEL VOLUNTARIO */}
      {/* ============================================ */}

      <View style={styles.identityCard}>

        <View style={styles.iconCircle}>

          <Text style={styles.icon}>
            👤
          </Text>

        </View>

        <Text style={styles.volunteerName}>
          {nombreCompleto || 'Voluntario'}
        </Text>

        <View style={styles.roleBadge}>

          <Text style={styles.roleText}>
            Voluntario
          </Text>

        </View>

      </View>


      {/* ============================================ */}
      {/* INFORMACIÓN PERSONAL */}
      {/* ============================================ */}

      <View style={styles.infoCard}>

        <Text style={styles.sectionTitle}>
          Información personal
        </Text>

        {!editandoDatos ? (

          <>
            {/* ======================================== */}
            {/* MODO CONSULTA */}
            {/* ======================================== */}

            <View style={styles.infoRow}>

              <Text style={styles.infoLabel}>
                Nombre
              </Text>

              <Text style={styles.infoValue}>
                {voluntario.nombre || 'No disponible'}
              </Text>

            </View>

            <View style={styles.separator} />

            <View style={styles.infoRow}>

              <Text style={styles.infoLabel}>
                Apellido
              </Text>

              <Text style={styles.infoValue}>
                {voluntario.apellido || 'No disponible'}
              </Text>

            </View>

            <View style={styles.separator} />

            <View style={styles.infoRow}>

              <Text style={styles.infoLabel}>
                Correo electrónico
              </Text>

              <Text style={styles.infoValue}>
                {voluntario.email || 'No disponible'}
              </Text>

            </View>

            <View style={styles.separator} />

            <View style={styles.infoRow}>

              <Text style={styles.infoLabel}>
                Teléfono
              </Text>

              <Text style={styles.infoValue}>
                {voluntario.telefono || 'No registrado'}
              </Text>

            </View>

            {/* ======================================== */}
            {/* BOTÓN EDITAR */}
            {/* ======================================== */}

            <TouchableOpacity
              style={styles.editButton}
              onPress={iniciarEdicion}
            >

              <Text style={styles.editButtonText}>
                ✏️ Editar datos personales
              </Text>

            </TouchableOpacity>

          </>

        ) : (

          <>
            {/* ======================================== */}
            {/* MODO EDICIÓN */}
            {/* ======================================== */}

            <View style={styles.infoRow}>

              <Text style={styles.infoLabel}>
                Nombre
              </Text>

              <TextInput
                style={styles.input}
                value={datosEditables.nombre}
                onChangeText={(texto) =>
                  setDatosEditables((actual) => ({
                    ...actual,
                    nombre: texto
                  }))
                }
                placeholder="Ingresá tu nombre"
                autoCapitalize="words"
                maxLength={100}
                editable={!guardandoDatosPersonales}
              />

            </View>

            <View style={styles.infoRow}>

              <Text style={styles.infoLabel}>
                Apellido
              </Text>

              <TextInput
                style={styles.input}
                value={datosEditables.apellido}
                onChangeText={(texto) =>
                  setDatosEditables((actual) => ({
                    ...actual,
                    apellido: texto
                  }))
                }
                placeholder="Ingresá tu apellido"
                autoCapitalize="words"
                maxLength={100}
                editable={!guardandoDatosPersonales}
              />

            </View>

            <View style={styles.infoRow}>

              <Text style={styles.infoLabel}>
                Correo electrónico
              </Text>

              <Text style={styles.infoValue}>
                {voluntario.email || 'No disponible'}
              </Text>

              <Text style={styles.readOnlyText}>
                El correo electrónico no puede modificarse.
              </Text>

            </View>

            <View style={styles.infoRow}>

              <Text style={styles.infoLabel}>
                Teléfono
              </Text>

              <TextInput
                style={styles.input}
                value={datosEditables.telefono}
                onChangeText={(texto) =>
                  setDatosEditables((actual) => ({
                    ...actual,
                    telefono: texto
                  }))
                }
                placeholder="Ingresá tu teléfono"
                keyboardType="phone-pad"
                maxLength={15}
                editable={!guardandoDatosPersonales}
              />

            </View>

            {/* ======================================== */}
            {/* ERRORES DE VALIDACIÓN */}
            {/* ======================================== */}

            {errorEdicion ? (

              <Text style={styles.errorEdicion}>
                {errorEdicion}
              </Text>

            ) : null}

            {/* ======================================== */}
            {/* ACCIONES */}
            {/* ======================================== */}

            <View style={styles.editActions}>

              <TouchableOpacity
                style={[
                  styles.cancelEditButton,
                  guardandoDatosPersonales && styles.disabledButton
                ]}
                onPress={cancelarEdicion}
                disabled={guardandoDatosPersonales}
              >

                <Text style={styles.cancelEditButtonText}>
                  Cancelar
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveEditButton,
                  guardandoDatosPersonales && styles.disabledButton
                ]}
                onPress={guardarDatosPersonales}
                disabled={guardandoDatosPersonales}
              >

                <Text style={styles.saveEditButtonText}>
                  {guardandoDatosPersonales
                    ? 'Guardando...'
                    : 'Guardar cambios'}
                </Text>

              </TouchableOpacity>

            </View>

          </>

        )}

      </View>

      {/* ============================================ */}
      {/* INTERESES DEL VOLUNTARIO */}
      {/* ============================================ */}

      <View style={styles.interestsCard}>

        <Text style={styles.sectionTitle}>
          Mis intereses
        </Text>

        <Text style={styles.interestsDescription}>
          Seleccioná los tipos de actividades que más te interesan.
          Esta información se utiliza para mejorar tus recomendaciones.
        </Text>

        {loadingIntereses ? (

          <ActivityIndicator
            size="small"
            color="#1F6F5C"
            style={styles.interestsLoader}
          />

        ) : tiposActividad.length === 0 ? (

          <Text style={styles.emptyInterestsText}>
            No hay tipos de actividad disponibles.
          </Text>

        ) : (

          <View style={styles.interestsList}>

            {tiposActividad.map((tipo) => {

              const id = Number(tipo.id_tipo_actividad);

              const seleccionado =
                interesesSeleccionados.includes(id);

              return (

                <TouchableOpacity
                  key={id}
                  style={[
                    styles.interestOption,
                    seleccionado && styles.interestOptionSelected
                  ]}
                  onPress={() => alternarInteres(id)}
                >

                  <View
                    style={[
                      styles.checkbox,
                      seleccionado && styles.checkboxSelected
                    ]}
                  >

                    {seleccionado && (

                      <Text style={styles.checkboxText}>
                        ✓
                      </Text>

                    )}

                  </View>

                  <Text
                    style={[
                      styles.interestText,
                      seleccionado && styles.interestTextSelected
                    ]}
                  >
                    {tipo.nombre}
                  </Text>

                </TouchableOpacity>

              );

            })}

          </View>

        )}

        <TouchableOpacity
        style={[
          styles.saveInterestsButton,
          botonActualizarDeshabilitado &&
            styles.disabledButton
        ]}
        onPress={guardarIntereses}
        disabled={botonActualizarDeshabilitado}
      >

        <Text style={styles.saveInterestsButtonText}>
          {loadingIntereses
            ? 'Actualizando...'
            : 'Actualizar intereses'}
        </Text>

      </TouchableOpacity>
      </View>


      {/* ============================================ */}
      {/* REPUTACIÓN DEL VOLUNTARIO */}
      {/* ============================================ */}

      <View style={styles.reputationCard}>

        <Text style={styles.sectionTitle}>
          Mi reputación
        </Text>

        <Text style={styles.reputationIcon}>
          ⭐
        </Text>

        <Text style={styles.reputationDescription}>
          Consultá las calificaciones que recibiste
          de las organizaciones por tu participación
          en actividades de voluntariado.
        </Text>

        <TouchableOpacity
          style={styles.reputationButton}
          onPress={onVerReputacion}
        >

          <Text style={styles.reputationButtonText}>
            Ver mi reputación
          </Text>

        </TouchableOpacity>

      </View>

    </View>

  );

}


// ======================================================
// ESTILOS
// ======================================================

const styles = StyleSheet.create({

  container: {
    width: '100%',
    maxWidth: 500
  },

  loader: {
    marginTop: 50
  },

  emptyText: {
    color: '#5F6B76',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40
  },

  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDE5E2',
    elevation: 2
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#164C40'
  },

  subtitle: {
    fontSize: 14,
    color: '#5F6B76',
    marginTop: 5
  },

  logoutText: {
    color: '#C62828',
    fontWeight: '600',
    marginTop: 12
  },

  identityCard: {
    backgroundColor: '#EAF5F2',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#CFE4DE'
  },

  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center'
  },

  icon: {
    fontSize: 34
  },

  volunteerName: {
    fontSize: 21,
    fontWeight: '700',
    color: '#164C40',
    marginTop: 12
  },

  roleBadge: {
    backgroundColor: '#D1EAE1',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 10
  },

  roleText: {
    color: '#1F6F5C',
    fontWeight: '700',
    fontSize: 13
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#DDE5E2'
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#164C40',
    marginBottom: 16
  },

  infoRow: {
    marginVertical: 8
  },

  infoLabel: {
    fontSize: 13,
    color: '#5F6B76',
    marginBottom: 4
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937'
  },

  separator: {
    height: 1,
    backgroundColor: '#E6F2EF',
    marginVertical: 6
  },

  interestsCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: 18,
  marginBottom: 18,
  borderWidth: 1,
  borderColor: '#DDE5E2'
},

  interestsDescription: {
    fontSize: 14,
    color: '#5F6B76',
    lineHeight: 20,
    marginBottom: 16
  },

  interestsLoader: {
    marginVertical: 18
  },

  emptyInterestsText: {
    fontSize: 14,
    color: '#5F6B76',
    marginBottom: 14
  },

  interestsList: {
    marginBottom: 18
  },

  interestOption: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDE5E2',
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: '#FFFFFF'
  },

  interestOptionSelected: {
    borderColor: '#1F6F5C',
    backgroundColor: '#EAF5F2'
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A9B7B3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#FFFFFF'
  },

  checkboxSelected: {
    backgroundColor: '#1F6F5C',
    borderColor: '#1F6F5C'
  },

  checkboxText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },

  interestText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937'
  },

  interestTextSelected: {
    color: '#164C40',
    fontWeight: '600'
  },

  saveInterestsButton: {
    width: '100%',
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: '#1F6F5C',
    alignItems: 'center',
    justifyContent: 'center'
  },

  saveInterestsButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14
  },

  disabledButton: {
    opacity: 0.6
  },

  reputationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#DDE5E2',
    alignItems: 'center'
  },

  reputationIcon: {
    fontSize: 42,
    marginBottom: 10
  },

  reputationDescription: {
    fontSize: 14,
    color: '#5F6B76',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20
  },

  reputationButton: {
    width: '100%',
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: '#1F6F5C',
    alignItems: 'center',
    justifyContent: 'center'
  },

  reputationButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14
  },
  // ======================================================
// EDICIÓN DE DATOS PERSONALES
// ACTIVIDAD 3.5.1
// ======================================================

editButton: {
  backgroundColor: '#EAF5F2',
  borderWidth: 1,
  borderColor: '#1F6F5C',
  borderRadius: 10,
  minHeight: 46,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 20,
  paddingHorizontal: 12
},

editButtonText: {
  color: '#1F6F5C',
  fontSize: 14,
  fontWeight: '700'
},

input: {
  width: '100%',
  minHeight: 46,
  borderWidth: 1,
  borderColor: '#C9D6D1',
  backgroundColor: '#FFFFFF',
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 15,
  color: '#1F2937'
},

readOnlyText: {
  fontSize: 12,
  color: '#6B7280',
  marginTop: 6
},

errorEdicion: {
  color: '#C62828',
  fontSize: 13,
  marginTop: 10,
  marginBottom: 6
},

editActions: {
  flexDirection: 'row',
  gap: 10,
  marginTop: 20
},

cancelEditButton: {
  flex: 1,
  minHeight: 46,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#CBD5D1',
  backgroundColor: '#FFFFFF',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 8
},

cancelEditButtonText: {
  color: '#374151',
  fontSize: 14,
  fontWeight: '700'
},

saveEditButton: {
  flex: 1,
  minHeight: 46,
  borderRadius: 10,
  backgroundColor: '#1F6F5C',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 8
},

saveEditButtonText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '700',
  textAlign: 'center'
},

});