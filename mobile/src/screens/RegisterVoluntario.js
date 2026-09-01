import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator 
} from 'react-native';

export default function RegisterVoluntario({ onRegister, onBack, loading, showAlert }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');

  // Expresiones Regulares para validación
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{7,15}$/;

  const handleSubmit = () => {
    // 1. Validar Campos Obligatorios Vacíos
    if (!nombre.trim() || !apellido.trim() || !email.trim() || !password) {
      showAlert('error', 'Campos Incompletos', 'Por favor completá todos los campos obligatorios (*).');
      return;
    }

    // 2. Validar Nombre y Apellido
    if (nombre.trim().length < 2 || apellido.trim().length < 2) {
      showAlert('error', 'Nombre Inválido', 'El nombre y apellido deben tener al menos 2 caracteres.');
      return;
    }

    // 3. Validar Formato de Correo Electrónico
    if (!emailRegex.test(email.trim())) {
      showAlert('error', 'Correo Inválido', 'Ingresá un correo electrónico válido que incluya "@" y un dominio (ej. usuario@correo.com).');
      return;
    }

    // 4. Validar Longitud de la Contraseña
    if (password.length < 6) {
      showAlert('error', 'Contraseña Débil', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // 5. Validar Teléfono (Solo si fue ingresado ya que es opcional)
    if (telefono.trim() !== '' && !phoneRegex.test(telefono.trim())) {
      showAlert('error', 'Teléfono Inválido', 'El teléfono debe contener entre 7 y 15 dígitos numéricos sin espacios ni guiones.');
      return;
    }

    // Si pasa todas las validaciones, se envía al Backend
    onRegister({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim(),
      password,
      telefono: telefono.trim(),
      rol: 'VOLUNTARIO'
    });
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.backCardContainer}>
        <TouchableOpacity style={styles.btnBack} onPress={onBack} activeOpacity={0.8}>
          <View style={styles.btnBackCircle}>
            <Text style={styles.btnBackArrow}>←</Text>
          </View>
          <Text style={styles.btnBackText}>Cambiar tipo de cuenta</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.title}>Registro de voluntario</Text>
        <Text style={styles.subtitle}>Completá tus datos para comenzar</Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresá tu nombre"
              placeholderTextColor="#9CA3AF"
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Apellido *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresá tu apellido"
              placeholderTextColor="#9CA3AF"
              value={apellido}
              onChangeText={setApellido}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Correo electrónico *</Text>
            <TextInput
              style={styles.input}
              placeholder="ejemplo@correo.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Contraseña *</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Teléfono (Opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 3425550182 (sólo números)"
              placeholderTextColor="#9CA3AF"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity 
            style={styles.btnPrimary} 
            onPress={handleSubmit} 
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnPrimaryText}>Crear cuenta de Voluntario</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: { width: '100%', maxWidth: 400, alignItems: 'center' },
  backCardContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#164C40',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#E6F2EF',
  },
  btnBack: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  btnBackCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E6F2EF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  btnBackArrow: { color: '#1F6F5C', fontSize: 16, fontWeight: 'bold' },
  btnBackText: { color: '#1F6F5C', fontSize: 14, fontWeight: '700' },

  formCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#164C40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#E6F2EF',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#164C40', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#5F6B76', marginBottom: 18, textAlign: 'center' },
  form: { width: '100%' },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '700', color: '#1F2937', marginBottom: 5 },
  input: { width: '100%', height: 48, backgroundColor: '#F9FAFB', borderRadius: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#D7DEDA', fontSize: 14, color: '#1F2937' },
  btnPrimary: { width: '100%', height: 48, backgroundColor: '#1F6F5C', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' }
});