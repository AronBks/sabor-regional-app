// Servicio para manejar las preferencias del usuario
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://10.0.2.2:8090');

export interface UserPreferences {
  // Restricciones dietéticas
  glutenFree: boolean;
  vegetarian: boolean;
  vegan: boolean;
  lactoseFree: boolean;
  keto: boolean;
  lowCarb: boolean;
  
  // Preferencias culinarias
  spicyLevel: 'none' | 'mild' | 'medium' | 'hot' | 'very_hot';
  cuisineTypes: string[]; // ['italiana', 'peruana', 'mexicana', etc.]
  ingredientLikes: string[]; // ingredientes favoritos
  ingredientDislikes: string[]; // ingredientes que no le gustan
  
  // Configuraciones de la app
  language: 'español' | 'english';
  notifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  
  // Información nutricional
  dailyCalorieGoal?: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  
  // Regiones favoritas
  favoriteRegions: string[]; // ['andina', 'costa', 'selva', etc.]
}

export const userPreferencesService = {
  // Obtener las preferencias del usuario
  async getUserPreferences(userId: string): Promise<{ success: boolean; preferences?: UserPreferences; error?: string }> {
    try {
      const record = await pb.collection('users').getOne(userId);
      
      // Si no tiene preferencias guardadas, devolver valores por defecto
      const defaultPreferences: UserPreferences = {
        glutenFree: false,
        vegetarian: false,
        vegan: false,
        lactoseFree: false,
        keto: false,
        lowCarb: false,
        spicyLevel: 'mild',
        cuisineTypes: [],
        ingredientLikes: [],
        ingredientDislikes: [],
        language: 'español',
        notifications: true,
        theme: 'light',
        activityLevel: 'moderate',
        favoriteRegions: []
      };

      const preferences = record.preferences || defaultPreferences;
      
      return { success: true, preferences };
    } catch (error) {
      console.error('Error obteniendo preferencias:', error);
      return { success: false, error: 'Error al cargar preferencias' };
    }
  },

  // Guardar las preferencias del usuario
  async saveUserPreferences(userId: string, preferences: UserPreferences): Promise<{ success: boolean; error?: string }> {
    try {
      await pb.collection('users').update(userId, {
        preferences: preferences
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error guardando preferencias:', error);
      return { success: false, error: 'Error al guardar preferencias' };
    }
  },

  // Actualizar una preferencia específica
  async updatePreference(userId: string, key: keyof UserPreferences, value: any): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.getUserPreferences(userId);
      if (!result.success || !result.preferences) {
        return { success: false, error: 'No se pudieron cargar las preferencias actuales' };
      }

      const updatedPreferences = {
        ...result.preferences,
        [key]: value
      };

      return await this.saveUserPreferences(userId, updatedPreferences);
    } catch (error) {
      console.error('Error actualizando preferencia:', error);
      return { success: false, error: 'Error al actualizar preferencia' };
    }
  },

  // Agregar/quitar región favorita
  async toggleFavoriteRegion(userId: string, region: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.getUserPreferences(userId);
      if (!result.success || !result.preferences) {
        return { success: false, error: 'No se pudieron cargar las preferencias' };
      }

      const currentRegions = result.preferences.favoriteRegions || [];
      const newRegions = currentRegions.includes(region)
        ? currentRegions.filter(r => r !== region)
        : [...currentRegions, region];

      return await this.updatePreference(userId, 'favoriteRegions', newRegions);
    } catch (error) {
      console.error('Error actualizando región favorita:', error);
      return { success: false, error: 'Error al actualizar región favorita' };
    }
  },

  // Agregar/quitar ingrediente favorito
  async toggleIngredientLike(userId: string, ingredient: string, isLike: boolean = true): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.getUserPreferences(userId);
      if (!result.success || !result.preferences) {
        return { success: false, error: 'No se pudieron cargar las preferencias' };
      }

      const field = isLike ? 'ingredientLikes' : 'ingredientDislikes';
      const currentList = result.preferences[field] || [];
      const newList = currentList.includes(ingredient)
        ? currentList.filter(i => i !== ingredient)
        : [...currentList, ingredient];

      return await this.updatePreference(userId, field, newList);
    } catch (error) {
      console.error('Error actualizando ingrediente:', error);
      return { success: false, error: 'Error al actualizar ingrediente' };
    }
  }
};
