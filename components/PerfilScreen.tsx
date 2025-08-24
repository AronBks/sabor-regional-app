import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Componente del perfil (diseño basado en tu ejemplo)
const PerfilScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [language, setLanguage] = useState<'Español' | 'English'>('Español');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<Record<string, boolean>>({
    glutenFree: false,
    vegetarian: false,
    vegan: false,
    lactoseFree: false,
  });

  // Login demo simple
  const handleLogin = (email?: string) => {
    setUser({ email: email || 'demo@ejemplo.com', nombre: 'Usuario demo' });
  };

  // Cambiar la selección del idioma
  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'Español' ? 'English' : 'Español'));
  };

  // Cambiar las restricciones alimentarias
  const toggleDietaryRestriction = (restriction: string) => {
    setDietaryRestrictions(prev => ({ ...prev, [restriction]: !prev[restriction] }));
  };

  return (
    <SafeAreaView style={styles.perfilContainer}>
      <View style={styles.perfilCardV2}>
        {!user ? (
          <View style={{ width: '100%' }}>
            <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12, textAlign: 'center' }}>
              Accede o prueba como invitado
            </Text>
            <TouchableOpacity
              onPress={() => handleLogin()}
              style={[styles.perfilLogoutV2, { backgroundColor: '#ff8a65' }]}
            >
              <Text style={styles.perfilLogoutTextV2}>Entrar (demo)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.perfilTitleV2}>Bienvenido, {user.nombre || user.email}</Text>
            <Text style={styles.perfilEmailV2}>{user.email}</Text>

            {/* Preferencias */}
            <View style={styles.preferenceContainer}>
              <Text style={styles.preferenceTitle}>Preferencias</Text>
              <Text style={styles.preferenceSubtitle}>Ajusta tu experiencia</Text>

              {/* Botones para el idioma */}
              <Text style={{ fontWeight: '600', marginBottom: 8 }}>Lenguaje</Text>
              <View style={styles.languageContainer}>
                <TouchableOpacity
                  style={[styles.languageButton, language === 'Español' && styles.languageButtonActive]}
                  onPress={toggleLanguage}
                >
                  <Text style={styles.languageButtonText}>Español</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.languageButton, language === 'English' && styles.languageButtonActive]}
                  onPress={toggleLanguage}
                >
                  <Text style={styles.languageButtonText}>English</Text>
                </TouchableOpacity>
              </View>

              {/* Restricciones alimentarias */}
              <Text style={[styles.preferenceTitle, { marginTop: 6 }]}>Restricciones alimentarias</Text>
              <View style={styles.dietaryRestrictionsContainer}>
                {[
                  ['glutenFree', 'Sin gluten'],
                  ['vegetarian', 'Vegetariano'],
                  ['vegan', 'Vegano'],
                  ['lactoseFree', 'Sin lactosa'],
                ].map(([key, label]) => (
                  <TouchableOpacity
                    key={String(key)}
                    style={[
                      styles.dietaryButton,
                      dietaryRestrictions[key as string] && styles.dietaryButtonActive,
                    ]}
                    onPress={() => toggleDietaryRestriction(String(key))}
                  >
                    <Text style={styles.dietaryButtonText}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Cerrar sesión */}
            <TouchableOpacity style={styles.perfilLogoutV2} onPress={() => setUser(null)}>
              <Text style={styles.perfilLogoutTextV2}>Cerrar sesión</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

// Estilos del componente
const styles = StyleSheet.create({
  perfilContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    padding: 24,
  },
  perfilCardV2: {
    width: '100%',
    maxWidth: 370,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  perfilTitleV2: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#FF7F50',
    textAlign: 'center',
  },
  perfilEmailV2: {
    fontSize: 16,
    color: '#222',
    marginBottom: 18,
    textAlign: 'center',
  },
  preferenceContainer: {
    width: '100%',
    paddingVertical: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  preferenceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  preferenceSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  languageButton: {
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  languageButtonActive: {
    backgroundColor: '#FF7F50',
    borderColor: '#FF7F50',
  },
  languageButtonText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '600',
  },
  dietaryRestrictionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dietaryButton: {
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dietaryButtonActive: {
    backgroundColor: '#FF7F50',
    borderColor: '#FF7F50',
  },
  dietaryButtonText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '600',
  },
  perfilLogoutV2: {
    backgroundColor: '#FF7F50',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 24,
    width: '100%',
  },
  perfilLogoutTextV2: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PerfilScreen;
