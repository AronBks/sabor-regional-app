import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { authService } from '../src/pocketbase';

interface AuthComponentProps {
  onAuthSuccess: (user: any) => void;
}

const AuthComponent: React.FC<AuthComponentProps> = ({ onAuthSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        onAuthSuccess(result.user);
        Alert.alert('Éxito', '¡Bienvenido de vuelta!');
      } else {
        Alert.alert('Error', result.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión. Verifica que PocketBase esté ejecutándose.');
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!email || !password || !passwordConfirm || !name) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.register(email, password, passwordConfirm, name);
      if (result.success) {
        onAuthSuccess(result.user);
        Alert.alert('Éxito', '¡Cuenta creada exitosamente!');
      } else {
        Alert.alert('Error', result.error || 'Error al crear cuenta');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión. Verifica que PocketBase esté ejecutándose.');
    }
    setLoading(false);
  };

  const handleGuestMode = () => {
    // Crear usuario temporal para modo invitado
    const guestUser = {
      id: 'guest_' + Date.now(),
      email: 'invitado@demo.com',
      name: 'Usuario Invitado',
      isGuest: true
    };
    onAuthSuccess(guestUser);
    Alert.alert('Modo Invitado', 'Explorando como invitado (sin guardar datos)');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.authCard}>
        <Text style={styles.title}>
          {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </Text>
        <Text style={styles.subtitle}>
          {isLoginMode ? 'Bienvenido de vuelta' : 'Únete a nuestra comunidad culinaria'}
        </Text>

        {/* Toggle entre Login y Registro */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, isLoginMode && styles.toggleButtonActive]}
            onPress={() => setIsLoginMode(true)}
          >
            <Text style={[styles.toggleText, isLoginMode && styles.toggleTextActive]}>
              Iniciar Sesión
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, !isLoginMode && styles.toggleButtonActive]}
            onPress={() => setIsLoginMode(false)}
          >
            <Text style={[styles.toggleText, !isLoginMode && styles.toggleTextActive]}>
              Registrarse
            </Text>
          </TouchableOpacity>
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          {!isLoginMode && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu nombre completo"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="ejemplo@correo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {!isLoginMode && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirmar contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Repite tu contraseña"
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                secureTextEntry
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.authButton, loading && styles.authButtonDisabled]}
            onPress={isLoginMode ? handleLogin : handleRegister}
            disabled={loading}
          >
            <Text style={styles.authButtonText}>
              {loading ? 'Cargando...' : (isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta')}
            </Text>
          </TouchableOpacity>

          {/* Botón de modo invitado */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleGuestMode}
          >
            <Text style={styles.guestButtonText}>
              🚀 Continuar como Invitado
            </Text>
          </TouchableOpacity>

          <Text style={styles.guestNote}>
            * En modo invitado no se guardarán tus favoritos ni actividad
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  authCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 24,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#FF7F50',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  authButton: {
    backgroundColor: '#FF7F50',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  authButtonDisabled: {
    backgroundColor: '#ccc',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  guestButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  guestButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  guestNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AuthComponent;
