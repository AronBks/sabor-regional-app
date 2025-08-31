// Tipos para las preferencias del usuario
export interface UserPreferences {
  ingredientesFavoritos: string[];
  difficulty: {
    facil: boolean;
    intermedio: boolean;
    avanzado: boolean;
  };
  restricciones: string[];
  ultimasBusquedas: string[];
  theme?: 'light' | 'dark';
  notificaciones?: boolean;
}

// Preferencias por defecto
const DEFAULT_PREFERENCES: UserPreferences = {
  ingredientesFavoritos: [],
  difficulty: {
    facil: true,
    intermedio: false,
    avanzado: false
  },
  restricciones: [],
  ultimasBusquedas: [],
  theme: 'light',
  notificaciones: true
};

// Clave para el almacenamiento local
const PREFERENCES_KEY = 'user_preferences';

// Función para guardar preferencias
export const savePreferences = async (preferences: UserPreferences): Promise<boolean> => {
  try {
    console.log('💾 Guardando preferencias:', preferences);
    
    // Para React Native sin AsyncStorage, usar almacenamiento en memoria simulado
    // En una app real usarías AsyncStorage.setItem
    const jsonValue = JSON.stringify(preferences);
    
    // Simulamos el almacenamiento local
    (global as any).userPreferences = jsonValue;
    
    console.log('✅ Preferencias guardadas correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error guardando preferencias:', error);
    return false;
  }
};

// Función para cargar preferencias
export const loadPreferences = async (): Promise<UserPreferences> => {
  try {
    console.log('📂 Cargando preferencias...');
    
    // Simulamos la carga desde almacenamiento local
    const jsonValue = (global as any).userPreferences;
    
    if (jsonValue != null) {
      const preferences = JSON.parse(jsonValue);
      console.log('✅ Preferencias cargadas:', preferences);
      
      // Combinar con valores por defecto para asegurar que no falten propiedades
      return { ...DEFAULT_PREFERENCES, ...preferences };
    }
    
    console.log('📋 Usando preferencias por defecto');
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('❌ Error cargando preferencias:', error);
    return DEFAULT_PREFERENCES;
  }
};

// Función para resetear preferencias
export const resetPreferences = async (): Promise<boolean> => {
  try {
    console.log('🔄 Reseteando preferencias...');
    
    // Eliminar del almacenamiento simulado
    (global as any).userPreferences = undefined;
    
    console.log('✅ Preferencias reseteadas');
    return true;
  } catch (error) {
    console.error('❌ Error reseteando preferencias:', error);
    return false;
  }
};

// Función para actualizar una preferencia específica
export const updatePreference = async <K extends keyof UserPreferences>(
  key: K, 
  value: UserPreferences[K]
): Promise<boolean> => {
  try {
    const currentPreferences = await loadPreferences();
    const updatedPreferences = {
      ...currentPreferences,
      [key]: value
    };
    
    return await savePreferences(updatedPreferences);
  } catch (error) {
    console.error(`❌ Error actualizando preferencia ${key}:`, error);
    return false;
  }
};

// Función para filtrar recetas basadas en preferencias
export const filterRecipesByPreferences = (
  recipes: any[], 
  preferences: UserPreferences
): any[] => {
  if (!recipes || recipes.length === 0) return recipes;
  
  console.log('🔍 Filtrando', recipes.length, 'recetas con preferencias:', preferences);
  
  return recipes.filter(recipe => {
    // Filtrar por dificultad
    const difficultyMatch = (
      (preferences.difficulty.facil && recipe.dificultad === 'Fácil') ||
      (preferences.difficulty.intermedio && recipe.dificultad === 'Intermedio') ||
      (preferences.difficulty.avanzado && recipe.dificultad === 'Avanzado')
    );
    
    if (!difficultyMatch) {
      console.log('❌ Receta', recipe.nombre, 'no coincide con dificultad preferida');
      return false;
    }
    
    // Filtrar por ingredientes favoritos (boost)
    const hasPreferredIngredients = preferences.ingredientesFavoritos.length === 0 || 
      preferences.ingredientesFavoritos.some(fav => 
        recipe.ingredientes?.some((ing: string) => 
          ing.toLowerCase().includes(fav.toLowerCase())
        )
      );
    
    // Filtrar por restricciones alimentarias
    const meetsRestrictions = preferences.restricciones.length === 0 || 
      preferences.restricciones.every(restriction => {
        // Lógica específica para restricciones
        switch (restriction) {
          case 'Vegetariano':
            return recipe.categoria !== 'Carnes y Aves';
          case 'Vegano':
            return !recipe.ingredientes?.some((ing: string) => 
              /carne|pollo|pescado|huevo|leche|queso|mantequilla/i.test(ing)
            );
          case 'Sin Gluten':
            return !recipe.ingredientes?.some((ing: string) => 
              /harina|pan|pasta|trigo/i.test(ing)
            );
          case 'Sin Lactosa':
            return !recipe.ingredientes?.some((ing: string) => 
              /leche|queso|mantequilla|crema/i.test(ing)
            );
          default:
            return true;
        }
      });
    
    if (!meetsRestrictions) {
      console.log('❌ Receta', recipe.nombre, 'no cumple restricciones');
      return false;
    }
    
    console.log('✅ Receta', recipe.nombre, 'pasa todos los filtros');
    return true;
  });
};

// Función para ordenar recetas por preferencias
export const sortRecipesByPreferences = (
  recipes: any[], 
  preferences: UserPreferences
): any[] => {
  if (!recipes || recipes.length === 0) return recipes;
  
  return [...recipes].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    
    // Puntos por ingredientes favoritos
    preferences.ingredientesFavoritos.forEach(fav => {
      if (a.ingredientes?.some((ing: string) => ing.toLowerCase().includes(fav.toLowerCase()))) {
        scoreA += 10;
      }
      if (b.ingredientes?.some((ing: string) => ing.toLowerCase().includes(fav.toLowerCase()))) {
        scoreB += 10;
      }
    });
    
    // Puntos por dificultad preferida
    if (preferences.difficulty.facil && a.dificultad === 'Fácil') scoreA += 5;
    if (preferences.difficulty.intermedio && a.dificultad === 'Intermedio') scoreA += 5;
    if (preferences.difficulty.avanzado && a.dificultad === 'Avanzado') scoreA += 5;
    
    if (preferences.difficulty.facil && b.dificultad === 'Fácil') scoreB += 5;
    if (preferences.difficulty.intermedio && b.dificultad === 'Intermedio') scoreB += 5;
    if (preferences.difficulty.avanzado && b.dificultad === 'Avanzado') scoreB += 5;
    
    return scoreB - scoreA; // Orden descendente
  });
};
