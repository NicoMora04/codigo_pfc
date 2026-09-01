import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator 
} from 'react-native';

export default function RegisterOrganizacion({ onRegister, onBack, loading, showAlert }) {
  const [razonSocial, setRazonSocial] = useState('');
  const [cuit, setCuit] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // RegEx de formato de correo y CUIT numérico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cuitRegex = /^[0-9]{11}$/;

  const handleSubmit = () => {
    // 1. Validar Campos Obligatorios Vacíos
    if (!razonSocial.trim() || !cuit.trim() || !email.trim() || !password) {
      showAlert('error', 'Campos Incompletos', 'Por favor completá la Razón Social, CUIT, Correo y Contraseña.');
      return;
    }

    // 2. Validar Razón Social
    if (razonSocial.trim().length < 3) {
      showAlert('error', 'Razón Social Inválida', 'La Razón Social debe tener al menos 3 caracteres.');
      return;
    }

    // 3. Validar CUIT (Exactamente 11 dígitos sin guiones)
    if (!cuitRegex.test(cuit.trim())) {
      showAlert('error', 'CUIT Inválido', 'El CUIT debe contener exactamente 11 dígitos numéricos sin guiones ni puntos.');
      return;
    }

    // 4. Validar Correo Institucional
    if (!emailRegex.test(email.trim())) {
      showAlert('error', 'Correo Inválido', 'Ingresá un correo institucional válido (ej. contacto@organizacion.org).');
      return;
    }

    // 5. Validar Longitud de la Contraseña
    if (password.length < 6) {
      showAlert('error', 'Contraseña Débil', 'La contraseña institucional debe tener al menos 6 caracteres.');
      return;
    }

    // Envío de datos corregidos y limpios
    onRegister({
  razon_social: razonSocial.trim(),
  cuit: cuit.trim(),
  email: email.trim(),
  password: password,
  descripcion: descripcion.trim(),
  rol: 'ORGANIZACION'
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
        <Text style={styles.title}>Registrar organización</Text>
        <Text style={styles.subtitle}>Ingresá los datos institucionales</Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Razón Social *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresá la Razón Social o Nombre Oficial"
              placeholderTextColor="#9CA3AF"
              value={razonSocial}
              onChangeText={setRazonSocial}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>CUIT (11 dígitos) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 30712345678 (sin guiones)"
              placeholderTextColor="#9CA3AF"
              value={cuit}
              onChangeText={setCuit}
              keyboardType="numeric"
              maxLength={11}
            />
            <Text style={styles.helperText}>Se utilizará para verificar la cuenta institucional.</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Correo Institucional *</Text>
            <TextInput
              style={styles.input}
              placeholder="contacto@organizacion.org"
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
            <Text style={styles.label}>Descripción institucional</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Contanos brevemente las actividades que realizan..."
              placeholderTextColor="#9CA3AF"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={3}
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
              <Text style={styles.btnPrimaryText}>Registrar Organización</Text>
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
  helperText: { fontSize: 11, color: '#5F6B76', marginTop: 3 },
  input: { width: '100%', height: 48, backgroundColor: '#F9FAFB', borderRadius: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#D7DEDA', fontSize: 14, color: '#1F2937' },
  textArea: { height: 80, paddingVertical: 10, textAlignVertical: 'top' },
  btnPrimary: { width: '100%', height: 48, backgroundColor: '#1F6F5C', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' }
});