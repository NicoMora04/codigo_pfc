import React, { useState } from 'react';
import { StyleSheet, View, ImageBackground, ScrollView, Modal, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';

import LoginScreen from './src/screens/LoginScreen';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import RegisterVoluntario from './src/screens/RegisterVoluntario';
import RegisterOrganizacion from './src/screens/RegisterOrganizacion';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('A01');
  const [loading, setLoading] = useState(false);

  // IP local para la API del Backend
  const API_URL = 'http://192.168.0.93:3000/api/auth';

  // Modal de Alerta Flotante
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showAlert = (type, title, message) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  // 1. Iniciar Sesión (A01)
  const handleLogin = async (email, password) => {
    if (!email || !password) {
      showAlert('error', 'Campos Incompletos', 'Por favor ingresa tu correo electrónico y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      setLoading(false);
      showAlert('success', '¡Bienvenido/a!', `Inicio de sesión exitoso.\nRol: ${response.data.user.rol}`);
    } catch (error) {
      setLoading(false);
      const errorMsg = error.response?.data?.error || 'No se pudo conectar con el servidor backend';
      showAlert('error', 'Error de Acceso', errorMsg);
    }
  };

  // 2. Registro Voluntario (A05)
  const handleRegisterVoluntario = async (data) => {
    if (!data.nombre || !data.apellido || !data.email || !data.password) {
      showAlert('error', 'Campos Incompletos', 'Nombre, Apellido, Correo y Contraseña son obligatorios.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/register`, data);
      setLoading(false);
      showAlert('success', '¡Cuenta Creada!', 'Tu registro como voluntario se completó con éxito. Ya podés iniciar sesión.');
      setCurrentScreen('A01');
    } catch (error) {
      setLoading(false);
      const errorMsg = error.response?.data?.error || 'No se pudo crear la cuenta de voluntario';
      showAlert('error', 'Error de Registro', errorMsg);
    }
  };

  // 3. Registro Organización (A06)
  const handleRegisterOrganizacion = async (data) => {

  console.log('DATOS RECIBIDOS DE LA ORGANIZACION:');
  console.log(data);

  console.log('razon_social:', data.razon_social);
  console.log('cuit:', data.cuit);
  console.log('email:', data.email);
  console.log('password:', data.password);
  console.log('rol:', data.rol);

  const camposFaltantes = [];

  if (!data.razon_social) camposFaltantes.push('Razón Social');
  if (!data.cuit) camposFaltantes.push('CUIT');
  if (!data.email) camposFaltantes.push('Correo');
  if (!data.password) camposFaltantes.push('Contraseña');

  if (camposFaltantes.length > 0) {
    showAlert(
      'error',
      'Campos Incompletos',
      `Faltan los siguientes campos: ${camposFaltantes.join(', ')}.`
    );
    return;
  }

  if (data.cuit.length !== 11) {
    showAlert(
      'error',
      'CUIT Inválido',
      'El CUIT debe contener exactamente 11 dígitos numéricos.'
    );
    return;
  }

  setLoading(true);

  try {

    const response = await axios.post(
      `${API_URL}/register`,
      data
    );

    console.log('RESPUESTA DEL BACKEND:', response.data);

    setLoading(false);

    showAlert(
      'success',
      '¡Organización Registrada!',
      'Tu cuenta fue creada con éxito. Su estado de verificación es PENDIENTE hasta ser revisada.'
    );

    setCurrentScreen('A01');

  } catch (error) {

    setLoading(false);

    console.error('ERROR DEL BACKEND:');
    console.error(error.response?.data || error.message);

    const errorMsg =
      error.response?.data?.details ||
      error.response?.data?.error ||
      'No se pudo registrar la organización';

    showAlert(
      'error',
      'Error de Registro',
      errorMsg
    );
  }
};

  return (
    <View style={styles.mainContainer}>
      <ImageBackground
        source={require('./assets/fondo.png')}
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.22 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {currentScreen === 'A01' && (
            <LoginScreen 
              onLogin={handleLogin} 
              onNavigateRegister={() => setCurrentScreen('A04')} 
              loading={loading}
            />
          )}

          {currentScreen === 'A04' && (
            <RoleSelectionScreen 
              onSelectRole={(screen) => setCurrentScreen(screen)} 
              onBack={() => setCurrentScreen('A01')}
            />
          )}

              {currentScreen === 'A05' && (
        <RegisterVoluntario 
          onRegister={handleRegisterVoluntario} 
          onBack={() => setCurrentScreen('A04')}
          loading={loading}
          showAlert={showAlert} // <--- Pasamos la función del modal flotante
        />
      )}

          {currentScreen === 'A06' && (
  <RegisterOrganizacion 
    onRegister={handleRegisterOrganizacion} 
    onBack={() => setCurrentScreen('A04')}
    loading={loading}
    showAlert={showAlert} // <--- Pasamos la función del modal flotante
  />
)}
        </ScrollView>
      </ImageBackground>

      {/* Modal Personalizado */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalHeader, modalType === 'success' ? styles.headerSuccess : styles.headerError]}>
              <Text style={styles.modalHeaderIcon}>{modalType === 'success' ? '✓' : '✕'}</Text>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalTitleText}>{modalTitle}</Text>
              <Text style={styles.modalMessageText}>{modalMessage}</Text>
              <TouchableOpacity style={[styles.modalButton, modalType === 'success' ? styles.btnSuccess : styles.btnError]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Entendido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F6F8F7' },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  modalCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 18, overflow: 'hidden', elevation: 10 },
  modalHeader: { height: 60, justifyContent: 'center', alignItems: 'center' },
  headerSuccess: { backgroundColor: '#1F6F5C' },
  headerError: { backgroundColor: '#C62828' },
  modalHeaderIcon: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
  modalBody: { padding: 20, alignItems: 'center' },
  modalTitleText: { fontSize: 17, fontWeight: 'bold', color: '#1F2937', marginBottom: 6 },
  modalMessageText: { fontSize: 13, color: '#5F6B76', textAlign: 'center', marginBottom: 18, lineHeight: 18 },
  modalButton: { width: '100%', height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  btnSuccess: { backgroundColor: '#1F6F5C' },
  btnError: { backgroundColor: '#C62828' },
  modalButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }
});