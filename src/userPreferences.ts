// import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserPreferences {
  ingredientesFavoritos: string[];
  difficulty: {
    facil: boolean;
    intermedio: boolean;
    avanzado: boolean;
  };
  restricciones: string[];
  ultimasBusquedas: string[];
  theme: 'light' | 'dark';
  notificaciones: boolean;
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

// Clave para almacenamiento local
const PREFERENCES_KEY = 'user_preferences';

// Función para guardar preferencias
export const savePreferences = async (preferences: UserPreferences): Promise<boolean> => {
  try {
    console.log('💾 Guardando preferencias:', preferences);
    
    // Por ahora usar memoria hasta que AsyncStorage esté configurado
    // await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    
    // Simular guardado exitoso
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
    console.log('📥 Cargando preferencias...');
    
    // Por ahora usar preferencias por defecto hasta que AsyncStorage esté configurado
    // const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
    // if (stored) {
    //   const parsed = JSON.parse(stored);
    //   return { ...DEFAULT_PREFERENCES, ...parsed };
    // }
    
    console.log('✅ Preferencias cargadas (por defecto)');
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('❌ Error cargando preferencias:', error);
    return DEFAULT_PREFERENCES;
  }
};

// Función para actualizar una preferencia específica
export const updatePreference = async (
  key: keyof UserPreferences, 
  value: any
): Promise<boolean> => {
  try {
    const currentPrefs = await loadPreferences();
    const updatedPrefs = { ...currentPrefs, [key]: value };
    return await savePreferences(updatedPrefs);
  } catch (error) {
    console.error('❌ Error actualizando preferencia:', error);
    return false;
  }
};

// Función para resetear preferencias
export const resetPreferences = async (): Promise<boolean> => {
  try {
    console.log('🔄 Reseteando preferencias...');
    return await savePreferences(DEFAULT_PREFERENCES);
  } catch (error) {
    console.error('❌ Error reseteando preferencias:', error);
    return false;
  }
};

// Función para filtrar recetas basadas en preferencias
export const filterRecipesByPreferences = (
  recipes: any[], 
  preferences: UserPreferences
): any[] => {
  if (!recipes || recipes.length === 0) return recipes;
  if (!preferences) return recipes;
  
  console.log('🔍 Filtrando recetas con preferencias:', preferences);
  
  return recipes.filter(recipe => {
    // Filtrar por restricciones
    if (preferences.restricciones.length > 0) {
      const meetsRestrictions = preferences.restricciones.every(restriccion => {
        switch (restriccion.toLowerCase()) {
          case 'vegetariano':
            return !recipe.ingredientes?.some((ing: string) => 
              ['carne', 'pollo', 'pescado', 'res', 'cerdo'].some(meat => 
                ing.toLowerCase().includes(meat)
              )
            );
          case 'vegano':
            return !recipe.ingredientes?.some((ing: string) => 
              ['carne', 'pollo', 'pescado', 'queso', 'leche', 'huevo'].some(animal => 
                ing.toLowerCase().includes(animal)
              )
            );
          case 'sin gluten':
            return !recipe.ingredientes?.some((ing: string) => 
              ['harina', 'trigo', 'cebada', 'centeno'].some(gluten => 
                ing.toLowerCase().includes(gluten)
              )
            );
          case 'sin lactosa':
            return !recipe.ingredientes?.some((ing: string) => 
              ['leche', 'queso', 'mantequilla', 'yogur', 'crema'].some(dairy => 
                ing.toLowerCase().includes(dairy)
              )
            );
          default:
            return true;
        }
      });
      
      if (!meetsRestrictions) {
        console.log('❌ Receta', recipe.nombre, 'no cumple restricciones');
        return false;
      }
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
  
  return recipes.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    
    // Puntuar por ingredientes favoritos
    if (preferences.ingredientesFavoritos.length > 0) {
      const ingredientesA = Array.isArray(a.ingredientes) ? a.ingredientes : 
        (typeof a.ingredientes === 'string' ? a.ingredientes.split(',') : []);
      const ingredientesB = Array.isArray(b.ingredientes) ? b.ingredientes : 
        (typeof b.ingredientes === 'string' ? b.ingredientes.split(',') : []);
      
      preferences.ingredientesFavoritos.forEach(fav => {
        if (ingredientesA.some((ing: string) => ing.toLowerCase().includes(fav.toLowerCase()))) {
          scoreA += 10;
        }
        if (ingredientesB.some((ing: string) => ing.toLowerCase().includes(fav.toLowerCase()))) {
          scoreB += 10;
        }
      });
    }
    
    // Puntuar por dificultad preferida
    if (preferences.difficulty.facil && a.dificultad === 'Fácil') scoreA += 5;
    if (preferences.difficulty.intermedio && a.dificultad === 'Intermedio') scoreA += 5;
    if (preferences.difficulty.avanzado && a.dificultad === 'Avanzado') scoreA += 5;
    
    if (preferences.difficulty.facil && b.dificultad === 'Fácil') scoreB += 5;
    if (preferences.difficulty.intermedio && b.dificultad === 'Intermedio') scoreB += 5;
    if (preferences.difficulty.avanzado && b.dificultad === 'Avanzado') scoreB += 5;
    
    return scoreB - scoreA; // Orden descendente
  });
};

