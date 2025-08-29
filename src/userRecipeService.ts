import PocketBase from 'pocketbase';

const pb = new PocketBase('http://10.0.2.2:8090');

export const userRecipeService = {
  // Guardar receta como favorita
  async addToFavorites(userId: string, recipeId: number, recipeName: string, recipeRegion: string) {
    try {
      const favoriteData = {
        user: userId,
        recipe_id: recipeId,
        recipe_name: recipeName,
        recipe_region: recipeRegion,
        created_at: new Date().toISOString()
      };

      const record = await pb.collection('user_favorites').create(favoriteData);
      return { success: true, favorite: record };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Obtener recetas favoritas del usuario
  async getUserFavorites(userId: string) {
    try {
      const records = await pb.collection('user_favorites').getList(1, 50, {
        filter: `user = "${userId}"`,
        sort: '-created_at'
      });
      return { success: true, favorites: records.items };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Remover de favoritos
  async removeFromFavorites(userId: string, recipeId: number) {
    try {
      const records = await pb.collection('user_favorites').getList(1, 1, {
        filter: `user = "${userId}" && recipe_id = ${recipeId}`
      });

      if (records.items.length > 0) {
        await pb.collection('user_favorites').delete(records.items[0].id);
        return { success: true };
      }
      return { success: false, error: 'Favorito no encontrado' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Verificar si una receta es favorita
  async isFavorite(userId: string, recipeId: number) {
    try {
      const records = await pb.collection('user_favorites').getList(1, 1, {
        filter: `user = "${userId}" && recipe_id = ${recipeId}`
      });
      return { success: true, isFavorite: records.items.length > 0 };
    } catch (error: any) {
      return { success: false, error: error.message, isFavorite: false };
    }
  },

  // Guardar preferencias del usuario
  async updateUserPreferences(userId: string, preferences: any) {
    try {
      const updated = await pb.collection('users').update(userId, {
        preferences: JSON.stringify(preferences)
      });
      return { success: true, user: updated };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Obtener preferencias del usuario
  async getUserPreferences(userId: string) {
    try {
      const user = await pb.collection('users').getOne(userId);
      const preferences = user.preferences ? JSON.parse(user.preferences) : {};
      return { success: true, preferences };
    } catch (error: any) {
      return { success: false, error: error.message, preferences: {} };
    }
  },

  // Registrar actividad del usuario (qué recetas ha visto)
  async logRecipeView(userId: string, recipeId: number, recipeName: string) {
    try {
      const activityData = {
        user: userId,
        recipe_id: recipeId,
        recipe_name: recipeName,
        action: 'view',
        created_at: new Date().toISOString()
      };

      const record = await pb.collection('user_activity').create(activityData);
      return { success: true, activity: record };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Obtener historial de actividad del usuario
  async getUserActivity(userId: string, limit: number = 10) {
    try {
      const records = await pb.collection('user_activity').getList(1, limit, {
        filter: `user = "${userId}"`,
        sort: '-created_at'
      });
      return { success: true, activities: records.items };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};
