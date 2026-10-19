import React, {
  useEffect,
  useState
} from 'react';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// ======================================================
// COMPONENTE REUTILIZABLE DE CALIFICACIÓN
// ACTIVIDAD 3.2 - REPUTACIÓN BIDIRECCIONAL
// ======================================================

export default function CalificacionModal({
  visible,
  nombre,
  onCancelar,
  onEnviar,
  loading = false,
  pregunta='¿Cómo evaluarías su participación en la actividad?'
}) {

  const [
    puntuacion,
    setPuntuacion
  ] = useState(0);

  const [
    comentario,
    setComentario
  ] = useState('');

  // Reiniciar el formulario cada vez que se abre
  useEffect(() => {

    if (visible) {
      setPuntuacion(0);
      setComentario('');
    }

  }, [visible]);


  // ======================================================
  // ENVIAR CALIFICACIÓN
  // ======================================================

  const handleEnviar = () => {

    if (
      loading ||
      puntuacion < 1 ||
      puntuacion > 5
    ) {
      return;
    }

    onEnviar(
      puntuacion,
      comentario.trim()
    );

  };


  // ======================================================
  // CERRAR MODAL
  // ======================================================

  const handleCancelar = () => {

    if (!loading) {
      onCancelar();
    }

  };


  return (

    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancelar}
    >

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >

        <ScrollView
          contentContainerStyle={styles.overlay}
          keyboardShouldPersistTaps="handled"
        >

          <View style={styles.modalCard}>

            {/* ENCABEZADO */}

            <Text style={styles.title}>
              Calificar participación
            </Text>

            <Text style={styles.subtitle}>
              {nombre}
            </Text>

            <Text style={styles.description}>
              {pregunta}
            </Text>


            {/* ESTRELLAS */}

            <View style={styles.starsContainer}>

              {[1, 2, 3, 4, 5].map(
                (valor) => (

                  <TouchableOpacity
                    key={valor}
                    onPress={() =>
                      setPuntuacion(valor)
                    }
                    disabled={loading}
                    accessibilityRole="button"
                    accessibilityLabel={
                      `${valor} estrella${valor === 1 ? '' : 's'}`
                    }
                  >

                    <Text
                      style={[
                        styles.star,

                        valor <= puntuacion
                          ? styles.starSelected
                          : styles.starUnselected
                      ]}
                    >

                      {valor <= puntuacion
                        ? '★'
                        : '☆'}

                    </Text>

                  </TouchableOpacity>

                )
              )}

            </View>


            {/* VALORACIÓN SELECCIONADA */}

            <Text style={styles.ratingText}>

              {puntuacion === 0
                ? 'Seleccioná una puntuación'
                : `${puntuacion} de 5 estrellas`}

            </Text>


            {/* COMENTARIO */}

            <Text style={styles.label}>
              Comentario (opcional)
            </Text>

            <TextInput
              style={styles.commentInput}
              placeholder="Escribí tu valoración..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              maxLength={1000}
              value={comentario}
              onChangeText={setComentario}
              editable={!loading}
              textAlignVertical="top"
            />

            <Text style={styles.characterCount}>
              {comentario.length}/1000 caracteres
            </Text>


            {/* BOTONES */}

            <View style={styles.actions}>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelar}
                disabled={loading}
              >

                <Text style={styles.cancelButtonText}>
                  Cancelar
                </Text>

              </TouchableOpacity>


              <TouchableOpacity
                style={[
                  styles.submitButton,

                  (puntuacion === 0 || loading) &&
                    styles.disabledButton
                ]}
                onPress={handleEnviar}
                disabled={
                  puntuacion === 0 || loading
                }
              >

                {loading ? (

                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                ) : (

                  <Text style={styles.submitButtonText}>
                    Enviar calificación
                  </Text>

                )}

              </TouchableOpacity>

            </View>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </Modal>

  );

}


// ======================================================
// ESTILOS
// ======================================================

const styles = StyleSheet.create({

  keyboardContainer: {
    flex: 1
  },

  overlay: {
    flexGrow: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },

  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22
  },

  title: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#164C40',
    textAlign: 'center'
  },

  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F6F5C',
    textAlign: 'center',
    marginTop: 8
  },

  description: {
    fontSize: 14,
    color: '#5F6B76',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 21
  },

  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    gap: 8
  },

  star: {
    fontSize: 42
  },

  starSelected: {
    color: '#F5B301'
  },

  starUnselected: {
    color: '#B8C2CC'
  },

  ratingText: {
    fontSize: 14,
    color: '#5F6B76',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 22
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#164C40',
    marginBottom: 8
  },

  commentInput: {
    borderWidth: 1,
    borderColor: '#DDE5E2',
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#FAFCFB'
  },

  characterCount: {
    fontSize: 12,
    color: '#7B8794',
    textAlign: 'right',
    marginTop: 6
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22
  },

  cancelButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8
  },

  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14
  },

  submitButton: {
    flex: 1.5,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: '#1F6F5C',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center'
  },

  disabledButton: {
    opacity: 0.5
  }

});