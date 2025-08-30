import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { userPreferencesService, UserPreferences } from '../src/userPreferences';

interface UserPreferencesComponentProps {
  userId: string;
  userName: string;
}

const UserPreferencesComponent: React.FC<UserPreferencesComponentProps> = ({ userId, userName }) => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const result = await userPreferencesService.getUserPreferences(userId);
      if (result.success && result.preferences) {
        setPreferences(result.preferences);
      }
    } catch (error) {
      console.error('Error cargando preferencias:', error);
    }
    setLoading(false);
  };

  const updatePreference = async (key: keyof UserPreferences, value: any) => {
    if (!preferences) return;

    const updatedPreferences = { ...preferences, [key]: value };
    setPreferences(updatedPreferences);

    const result = await userPreferencesService.saveUserPreferences(userId, updatedPreferences);
    if (!result.success) {
      Alert.alert('Error', 'No se pudieron guardar las preferencias');
      // Revertir cambio
      setPreferences(preferences);
    }
  };

  const toggleDietaryRestriction = (restriction: keyof Pick<UserPreferences, 'glutenFree' | 'vegetarian' | 'vegan' | 'lactoseFree' | 'keto' | 'lowCarb'>) => {
    if (!preferences) return;
    updatePreference(restriction, !preferences[restriction]);
  };

  const toggleFavoriteRegion = async (region: string) => {
    const result = await userPreferencesService.toggleFavoriteRegion(userId, region);
    if (result.success) {
      loadPreferences(); // Recargar para mostrar cambios
    } else {
      Alert.alert('Error', 'No se pudo actualizar la región favorita');
    }
  };

  if (loading || !preferences) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando preferencias...</Text>
      </View>
    );
  }

  const regions = ['Andina', 'Costa', 'Selva', 'Sierra', 'Pampa', 'Altiplano'];
  const spicyLevels = [
    { key: 'none', label: '🚫 Sin picante' },
    { key: 'mild', label: '🌶️ Suave' },
    { key: 'medium', label: '🌶️🌶️ Medio' },
    { key: 'hot', label: '🌶️🌶️🌶️ Picante' },
    { key: 'very_hot', label: '🌶️🌶️🌶️🌶️ Muy picante' }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header de usuario */}
      <View style={styles.userHeader}>
        <Text style={styles.userName}>🍽️ Preferencias de {userName}</Text>
        <Text style={styles.subtitle}>Personaliza tu experiencia culinaria</Text>
      </View>

      {/* Restricciones dietéticas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🥗 Restricciones Dietéticas</Text>
        <View style={styles.optionsGrid}>
          {[
            { key: 'glutenFree', label: '🌾 Sin gluten', emoji: '🚫🌾' },
            { key: 'vegetarian', label: '🥬 Vegetariano', emoji: '🥬' },
            { key: 'vegan', label: '🌱 Vegano', emoji: '🌱' },
            { key: 'lactoseFree', label: '🥛 Sin lactosa', emoji: '🚫🥛' },
            { key: 'keto', label: '🥑 Keto', emoji: '🥑' },
            { key: 'lowCarb', label: '🍞 Bajo en carbos', emoji: '🚫🍞' }
          ].map(item => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.optionButton,
                preferences[item.key as keyof UserPreferences] && styles.optionButtonActive
              ]}
              onPress={() => toggleDietaryRestriction(item.key as any)}
            >
              <Text style={styles.optionEmoji}>{item.emoji}</Text>
              <Text style={[
                styles.optionText,
                preferences[item.key as keyof UserPreferences] && styles.optionTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Nivel de picante */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌶️ Nivel de Picante</Text>
        <View style={styles.spicyLevelContainer}>
          {spicyLevels.map(level => (
            <TouchableOpacity
              key={level.key}
              style={[
                styles.spicyButton,
                preferences.spicyLevel === level.key && styles.spicyButtonActive
              ]}
              onPress={() => updatePreference('spicyLevel', level.key)}
            >
              <Text style={[
                styles.spicyText,
                preferences.spicyLevel === level.key && styles.spicyTextActive
              ]}>
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Regiones favoritas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Regiones Favoritas</Text>
        <Text style={styles.sectionSubtitle}>Selecciona las regiones culinarias que más te gustan</Text>
        <View style={styles.regionsGrid}>
          {regions.map(region => (
            <TouchableOpacity
              key={region}
              style={[
                styles.regionButton,
                preferences.favoriteRegions?.includes(region) && styles.regionButtonActive
              ]}
              onPress={() => toggleFavoriteRegion(region)}
            >
              <Text style={[
                styles.regionText,
                preferences.favoriteRegions?.includes(region) && styles.regionTextActive
              ]}>
                📍 {region}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Configuraciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Configuraciones</Text>
        <View style={styles.configRow}>
          <Text style={styles.configLabel}>🌐 Idioma:</Text>
          <TouchableOpacity
            style={styles.configButton}
            onPress={() => updatePreference('language', preferences.language === 'español' ? 'english' : 'español')}
          >
            <Text style={styles.configButtonText}>
              {preferences.language === 'español' ? '🇪🇸 Español' : '🇺🇸 English'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.configRow}>
          <Text style={styles.configLabel}>🔔 Notificaciones:</Text>
          <TouchableOpacity
            style={[styles.toggleButton, preferences.notifications && styles.toggleButtonActive]}
            onPress={() => updatePreference('notifications', !preferences.notifications)}
          >
            <Text style={[styles.toggleText, preferences.notifications && styles.toggleTextActive]}>
              {preferences.notifications ? '✅ Activadas' : '❌ Desactivadas'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.configRow}>
          <Text style={styles.configLabel}>🎨 Tema:</Text>
          <TouchableOpacity
            style={styles.configButton}
            onPress={() => {
              const themes = ['light', 'dark', 'auto'];
              const currentIndex = themes.indexOf(preferences.theme);
              const nextTheme = themes[(currentIndex + 1) % themes.length];
              updatePreference('theme', nextTheme);
            }}
          >
            <Text style={styles.configButtonText}>
              {preferences.theme === 'light' ? '☀️ Claro' : 
               preferences.theme === 'dark' ? '🌙 Oscuro' : '🔄 Automático'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Estadísticas de preferencias */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>📊 Resumen de Preferencias</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{preferences.favoriteRegions?.length || 0}</Text>
            <Text style={styles.statLabel}>Regiones favoritas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {Object.values(preferences).filter(v => v === true).length}
            </Text>
            <Text style={styles.statLabel}>Restricciones activas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{preferences.spicyLevel}</Text>
            <Text style={styles.statLabel}>Nivel de picante</Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
  },
  userHeader: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6A00',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 8,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    minWidth: '45%',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonActive: {
    backgroundColor: '#FFF0E6',
    borderColor: '#FF6A00',
  },
  optionEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  optionTextActive: {
    color: '#FF6A00',
    fontWeight: 'bold',
  },
  spicyLevelContainer: {
    gap: 8,
  },
  spicyButton: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  spicyButtonActive: {
    backgroundColor: '#FFF0E6',
    borderColor: '#FF6A00',
  },
  spicyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  spicyTextActive: {
    color: '#FF6A00',
    fontWeight: 'bold',
  },
  regionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  regionButton: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: '30%',
  },
  regionButtonActive: {
    backgroundColor: '#FFF0E6',
    borderColor: '#FF6A00',
  },
  regionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  regionTextActive: {
    color: '#FF6A00',
    fontWeight: 'bold',
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  configLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  configButton: {
    backgroundColor: '#FF6A00',
    padding: 8,
    borderRadius: 6,
    minWidth: 100,
  },
  configButtonText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  toggleButton: {
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    minWidth: 100,
  },
  toggleButtonActive: {
    backgroundColor: '#FFF0E6',
    borderColor: '#FF6A00',
  },
  toggleText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  toggleTextActive: {
    color: '#FF6A00',
    fontWeight: 'bold',
  },
  statsSection: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 8,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    padding: 16,
    borderRadius: 8,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6A00',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default UserPreferencesComponent;
