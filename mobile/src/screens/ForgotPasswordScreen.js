import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';

export default function ForgotPasswordScreen({ onSendResetLink, onBack, loading, showAlert }) {
  const [email, setEmail] = useState('');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = () => {
    if (!email.trim() || !emailRegex.test(email.trim())) {
      showAlert('error', 'Correo Inválido', 'Ingresá un e-mail válido para enviar el enlace de recuperación.');
      return;
    }
    onSendResetLink(email.trim());
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.backCardContainer}>
        <TouchableOpacity style={styles.btnBack} onPress={onBack} activeOpacity={0.8}>
          <Text style={styles.btnBackText}>← Volver al Inicio de Sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.title}>Recuperar contraseña</Text>
        <Text style={styles.subtitle}>Ingresá tu correo electrónico para recibir las instrucciones de restablecimiento.</Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Correo electrónico</Text>
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

          <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Enviar enlace de recuperación</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: { width: '100%', maxWidth: 400, alignItems: 'center' },
  backCardContainer: { width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.96)', borderRadius: 14, padding: 12, marginBottom: 12 },
  btnBackText: { color: '#1F6F5C', fontSize: 14, fontWeight: '700' },
  formCard: { width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.96)', borderRadius: 20, padding: 22, elevation: 4 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#164C40', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#5F6B76', marginBottom: 18, textAlign: 'center' },
  form: { width: '100%' },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '700', color: '#1F2937', marginBottom: 5 },
  input: { width: '100%', height: 48, backgroundColor: '#F9FAFB', borderRadius: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: '#D7DEDA', fontSize: 14 },
  btnPrimary: { width: '100%', height: 48, backgroundColor: '#1F6F5C', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' }
});