import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';

export default function LoginScreen({
  onLogin,
  onNavigateRegister,
  onNavigateForgotPassword,
  loading
}) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    onLogin(email, password);
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.formCard}>

        <View style={styles.brandMark}>
          <Text style={styles.brandIcon}>♥</Text>
        </View>

        <Text style={styles.title}>
          Voluntariado
        </Text>

        <Text style={styles.subtitle}>
          Encontrá oportunidades para ayudar
        </Text>

        <View style={styles.form}>

          {/* CORREO */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Correo electrónico
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Ingresá tu correo electrónico"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* CONTRASEÑA */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Contraseña
            </Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Ingresá tu contraseña"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />

              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <View
                  style={
                    showPassword
                      ? styles.googleEyeOpen
                      : styles.googleEyeClosed
                  }
                >
                  <View style={styles.googlePupil} />

                  {!showPassword && (
                    <View style={styles.googleStrike} />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* INICIAR SESIÓN */}
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnPrimaryText}>
                Iniciar sesión
              </Text>
            )}
          </TouchableOpacity>

          {/* RECUPERAR CONTRASEÑA */}
          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={onNavigateForgotPassword}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPasswordText}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          {/* DIVISOR */}
          <View style={styles.divider}>
            <View style={styles.line} />

            <Text style={styles.dividerText}>
              o
            </Text>

            <View style={styles.line} />
          </View>

          {/* CREAR CUENTA */}
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={onNavigateRegister}
          >
            <Text style={styles.btnSecondaryText}>
              Crear una cuenta
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({

  cardContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center'
  },

  formCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#164C40',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#E6F2EF'
  },

  brandMark: {
    width: 64,
    height: 64,
    backgroundColor: '#1F6F5C',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 4
  },

  brandIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold'
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#164C40',
    textAlign: 'center'
  },

  subtitle: {
    fontSize: 13,
    color: '#5F6B76',
    marginBottom: 20,
    textAlign: 'center'
  },

  form: {
    width: '100%'
  },

  field: {
    marginBottom: 14
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 5
  },

  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D7DEDA',
    fontSize: 14,
    color: '#1F2937'
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D7DEDA'
  },

  passwordInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#1F2937'
  },

  eyeButton: {
    paddingHorizontal: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center'
  },

  googleEyeOpen: {
    width: 20,
    height: 12,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: '#5F6B76',
    justifyContent: 'center',
    alignItems: 'center'
  },

  googleEyeClosed: {
    width: 20,
    height: 12,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },

  googlePupil: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#5F6B76'
  },

  googleStrike: {
    position: 'absolute',
    width: 22,
    height: 1.8,
    backgroundColor: '#5F6B76',
    transform: [
      {
        rotate: '-45deg'
      }
    ]
  },

  btnPrimary: {
    width: '100%',
    height: 48,
    backgroundColor: '#1F6F5C',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },

  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold'
  },

  forgotPasswordButton: {
    marginTop: 14,
    alignItems: 'center'
  },

  forgotPasswordText: {
    color: '#1F6F5C',
    fontSize: 13,
    fontWeight: '600'
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#D7DEDA'
  },

  dividerText: {
    marginHorizontal: 10,
    color: '#5F6B76',
    fontSize: 12
  },

  btnSecondary: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F6F5C',
    alignItems: 'center',
    justifyContent: 'center'
  },

  btnSecondaryText: {
    color: '#164C40',
    fontSize: 15,
    fontWeight: 'bold'
  }

});