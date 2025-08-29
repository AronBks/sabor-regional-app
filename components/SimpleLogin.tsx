import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import simpleAuthService from '../src/simpleAuth';

interface SimpleLoginProps {
  onLogin: (user: any) => void;
}

const SimpleLogin: React.FC<SimpleLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Completa email y contraseña');
      return;
    }

    setLoading(true);
    try {
      const result = await simpleAuthService.login(email, password);
      if (result.success) {
        onLogin(result.user);
        Alert.alert('¡Éxito!', `Bienvenido ${result.user.name}`);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Problema de conexión con PocketBase');
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      const result = await simpleAuthService.createUser(email, password, name);
      if (result.success) {
        onLogin(result.user);
        Alert.alert('¡Éxito!', `Cuenta creada para ${result.user.name}`);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Problema de conexión con PocketBase');
    }
    setLoading(false);
  };

  const useTestUser = async () => {
    setEmail('admin@gmail.com');
    setPassword('12345678');
    setTimeout(() => handleLogin(), 100);
  };

  const createTestUsers = async () => {
    setLoading(true);
    try {
      const results = await simpleAuthService.createTestUsers();
      console.log('Usuarios de prueba creados:', results);
      Alert.alert(
        'Usuarios creados',
        'Se crearon usuarios de prueba:\n• usuario1@recetas.com\n• usuario2@recetas.com\n• chef@recetas.com\n\nContraseña: 12345678'
      );
    } catch (error) {
      Alert.alert('Info', 'Los usuarios de prueba ya existen o hay un error');
    }
    setLoading(false);
  };

  const testDirectRegister = async () => {
    setLoading(true);
    try {
      const testEmail = 'test' + Date.now() + '@gmail.com';
      const result = await simpleAuthService.createUser(testEmail, '12345678', 'Usuario Test');
      if (result.success) {
        Alert.alert('¡Éxito!', `Usuario creado: ${testEmail}\nContraseña: 12345678\n\n¡El registro funciona correctamente!`);
        onLogin(result.user);
      } else {
        Alert.alert('Error de registro', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el usuario: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🍽️ Recetas App</Text>
        <Text style={styles.subtitle}>
          {isRegisterMode ? 'Crear nueva cuenta' : 'Iniciar sesión'}
        </Text>

        {/* Toggle Login/Register */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, !isRegisterMode && styles.toggleBtnActive]}
            onPress={() => setIsRegisterMode(false)}
          >
            <Text style={[styles.toggleText, !isRegisterMode && styles.toggleTextActive]}>
              Iniciar Sesión
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, isRegisterMode && styles.toggleBtnActive]}
            onPress={() => setIsRegisterMode(true)}
          >
            <Text style={[styles.toggleText, isRegisterMode && styles.toggleTextActive]}>
              Registrarse
            </Text>
          </TouchableOpacity>
        </View>

        {/* Formulario */}
        {isRegisterMode && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre completo"
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="ejemplo@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 8 caracteres"
            secureTextEntry
          />
        </View>

        {/* Botón principal */}
        <TouchableOpacity
          style={[styles.mainButton, loading && styles.buttonDisabled]}
          onPress={isRegisterMode ? handleRegister : handleLogin}
          disabled={loading}
        >
          <Text style={styles.mainButtonText}>
            {loading ? 'Cargando...' : (isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión')}
          </Text>
        </TouchableOpacity>

        {/* Botones de ayuda */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>🚀 Prueba rápida:</Text>
          
          <TouchableOpacity style={styles.helpButton} onPress={useTestUser}>
            <Text style={styles.helpButtonText}>
              📝 Usar usuario de prueba
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpButton} onPress={createTestUsers}>
            <Text style={styles.helpButtonText}>
              👥 Crear usuarios de prueba
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.helpButton, { backgroundColor: '#4CAF50' }]} onPress={testDirectRegister}>
            <Text style={[styles.helpButtonText, { color: '#fff' }]}>
              ✅ Probar registro directo
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
          ℹ️ Asegúrate de que PocketBase esté ejecutándose en el puerto 8090
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  card: {
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
    fontSize: 28,
    fontWeight: '700',
    color: '#FF7F50',
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
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleBtnActive: {
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
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
  mainButton: {
    backgroundColor: '#FF7F50',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
    marginBottom: 16,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  helpButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  helpButtonText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SimpleLogin;
