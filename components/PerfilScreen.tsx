import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { authService } from '../src/pocketbase';
import { userRecipeService } from '../src/userRecipeService';
import AuthComponent from './AuthComponent';
import UserPreferencesComponent from './UserPreferencesComponent';

// Componente del perfil con autenticación simplificada
const PerfilScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [language, setLanguage] = useState<'Español' | 'English'>('Español');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<Record<string, boolean>>({
    glutenFree: false,
    vegetarian: false,
    vegan: false,
    lactoseFree: false,
  });

  // Estados para favoritos y actividad
  const [userFavorites, setUserFavorites] = useState<any[]>([]);
  const [userActivity, setUserActivity] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<'profile' | 'preferences' | 'favorites' | 'activity'>('profile');

  // Verificar usuario autenticado al iniciar
  useEffect(() => {
    const checkCurrentUser = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser && authService.isAuthenticated()) {
        setUser(currentUser);
        if (!currentUser.isGuest) {
          loadUserData(currentUser.id);
        }
      }
    };
    checkCurrentUser();
  }, []);

  // Cargar datos del usuario (favoritos y actividad)
  const loadUserData = async (userId: string) => {
    try {
      // Cargar favoritos
      const favoritesResult = await userRecipeService.getUserFavorites(userId);
      if (favoritesResult.success) {
        setUserFavorites(favoritesResult.favorites || []);
      }

      // Cargar actividad reciente
      const activityResult = await userRecipeService.getUserActivity(userId, 10);
      if (activityResult.success) {
        setUserActivity(activityResult.activities || []);
      }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    }
  };

  // Manejar autenticación exitosa
  const handleAuthSuccess = (authenticatedUser: any) => {
    setUser(authenticatedUser);
    if (!authenticatedUser.isGuest) {
      loadUserData(authenticatedUser.id);
    }
  };

  // Función de logout
  const handleLogout = async () => {
    try {
      if (!user?.isGuest) {
        await authService.logout();
      }
      setUser(null);
      setUserFavorites([]);
      setUserActivity([]);
      setActiveSection('profile');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
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
      {!user ? (
        <AuthComponent onAuthSuccess={handleAuthSuccess} />
      ) : (
        <ScrollView style={styles.perfilCardV2}>
          <Text style={styles.perfilTitleV2}>
            Bienvenido, {user.name || user.email}
            {user.isGuest && ' (Invitado)'}
          </Text>
          <Text style={styles.perfilEmailV2}>{user.email}</Text>

          {/* Navegación de secciones */}
          <View style={styles.sectionNavigation}>
            <TouchableOpacity 
              style={[styles.navButton, activeSection === 'profile' && styles.navButtonActive]}
              onPress={() => setActiveSection('profile')}
            >
              <Text style={[styles.navButtonText, activeSection === 'profile' && styles.navButtonTextActive]}>
                👤 Perfil
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.navButton, activeSection === 'preferences' && styles.navButtonActive]}
              onPress={() => setActiveSection('preferences')}
            >
              <Text style={[styles.navButtonText, activeSection === 'preferences' && styles.navButtonTextActive]}>
                ⚙️ Preferencias
              </Text>
            </TouchableOpacity>
            
            {!user.isGuest && (
              <>
                <TouchableOpacity 
                  style={[styles.navButton, activeSection === 'favorites' && styles.navButtonActive]}
                  onPress={() => setActiveSection('favorites')}
                >
                  <Text style={[styles.navButtonText, activeSection === 'favorites' && styles.navButtonTextActive]}>
                    ❤️ Favoritos
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.navButton, activeSection === 'activity' && styles.navButtonActive]}
                  onPress={() => setActiveSection('activity')}
                >
                  <Text style={[styles.navButtonText, activeSection === 'activity' && styles.navButtonTextActive]}>
                    📊 Actividad
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Contenido según sección activa */}
          {activeSection === 'profile' && (
            <View style={styles.sectionContent}>
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
              </View>
            )}

            {activeSection === 'preferences' && (
              <UserPreferencesComponent 
                userId={user.id} 
                userName={user.name || user.email} 
              />
            )}

            {activeSection === 'favorites' && (
              <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>Mis Recetas Favoritas</Text>
                {userFavorites.length > 0 ? (
                  <FlatList
                    data={userFavorites}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.favoriteItem}>
                        <Text style={styles.favoriteRecipeName}>{item.recipe_name}</Text>
                        <Text style={styles.favoriteRecipeRegion}>📍 {item.recipe_region}</Text>
                        <Text style={styles.favoriteDate}>
                          Guardado: {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                    showsVerticalScrollIndicator={false}
                  />
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>🤍</Text>
                    <Text style={styles.emptyStateTitle}>Sin favoritos aún</Text>
                    <Text style={styles.emptyStateSubtitle}>
                      Explora recetas y guarda tus favoritas usando el botón ❤️
                    </Text>
                  </View>
                )}
              </View>
            )}

            {activeSection === 'activity' && (
              <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>Actividad Reciente</Text>
                {userActivity.length > 0 ? (
                  <FlatList
                    data={userActivity}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.activityItem}>
                        <Text style={styles.activityAction}>👀 Viste</Text>
                        <Text style={styles.activityRecipeName}>{item.recipe_name}</Text>
                        <Text style={styles.activityDate}>
                          {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                    showsVerticalScrollIndicator={false}
                  />
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>📊</Text>
                    <Text style={styles.emptyStateTitle}>Sin actividad aún</Text>
                    <Text style={styles.emptyStateSubtitle}>
                      Tu actividad aparecerá aquí cuando explores recetas
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Cerrar sesión */}
            <TouchableOpacity style={styles.perfilLogoutV2} onPress={handleLogout}>
              <Text style={styles.perfilLogoutTextV2}>
                {user.isGuest ? 'Salir del modo invitado' : 'Cerrar sesión'}
              </Text>
            </TouchableOpacity>
        </ScrollView>
      )}
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
  
  // Estilos para navegación de secciones
  sectionNavigation: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 20,
    padding: 4,
  },
  navButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  navButtonActive: {
    backgroundColor: '#FF7F50',
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  navButtonTextActive: {
    color: '#fff',
  },
  
  // Estilos para contenido de secciones
  sectionContent: {
    width: '100%',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  // Estilos para favoritos
  favoriteItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF7F50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteRecipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  favoriteRecipeRegion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  favoriteDate: {
    fontSize: 12,
    color: '#999',
  },
  
  // Estilos para actividad
  activityItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityAction: {
    fontSize: 14,
    color: '#FF7F50',
    fontWeight: '600',
  },
  activityRecipeName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginHorizontal: 8,
  },
  activityDate: {
    fontSize: 12,
    color: '#999',
  },
  
  // Estilos para estados vacíos
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PerfilScreen;
