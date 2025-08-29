import PocketBase from 'pocketbase';

// Configuración de PocketBase
const pb = new PocketBase('http://127.0.0.1:8090');

// Inicializar PocketBase
export const initializePocketBase = async () => {
  try {
    console.log('Inicializando PocketBase...');
    return true;
  } catch (error) {
    console.error('Error al inicializar PocketBase:', error);
    return false;
  }
};

// Tipos para TypeScript
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'chef';
  dietary_restrictions?: string[];
  preferred_difficulty?: string[];
  favorite_regions?: string[];
}

export interface Region {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  image?: string;
  characteristics?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  category: 'meat' | 'poultry' | 'seafood' | 'vegetables' | 'fruits' | 'grains' | 'dairy' | 'spices' | 'herbs' | 'oils' | 'others';
  nutritional_info?: any;
  common_units?: any;
  season?: string[];
  regions?: string[];
}

export interface Recipe {
  id: string;
  name: string;
  slug: string;
  description: string;
  region: string;
  ingredients: any[];
  steps: any[];
  difficulty: 'easy' | 'medium' | 'hard';
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  images?: string[];
  video_url?: string;
  nutritional_info?: any;
  tags?: string[];
  is_featured?: boolean;
  created_by?: string;
  rating_average?: number;
  rating_count?: number;
}

// Servicios de autenticación
export const authService = {
  // Registrar nuevo usuario
  async register(email: string, password: string, passwordConfirm: string, name: string, additionalData?: Partial<User>) {
    try {
      const userData = {
        email,
        password,
        passwordConfirm,
        name,
        level: additionalData?.level || 'beginner',
        dietary_restrictions: additionalData?.dietary_restrictions || [],
        preferred_difficulty: additionalData?.preferred_difficulty || ['easy'],
        ...additionalData
      };

      const record = await pb.collection('users').create(userData);
      
      // Autenticar automáticamente después del registro
      await pb.collection('users').authWithPassword(email, password);
      
      return {
        success: true,
        user: pb.authStore.model,
        message: 'Usuario registrado exitosamente'
      };
    } catch (error: any) {
      console.error('Error en registro:', error);
      return {
        success: false,
        user: null,
        message: error.message || 'Error al registrar usuario'
      };
    }
  },

  // Iniciar sesión
  async login(email: string, password: string) {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      
      return {
        success: true,
        user: authData.record,
        message: 'Sesión iniciada exitosamente'
      };
    } catch (error: any) {
      console.error('Error en login:', error);
      return {
        success: false,
        user: null,
        message: error.message || 'Credenciales incorrectas'
      };
    }
  },

  // Cerrar sesión
  async logout() {
    try {
      pb.authStore.clear();
      return {
        success: true,
        message: 'Sesión cerrada exitosamente'
      };
    } catch (error: any) {
      console.error('Error en logout:', error);
      return {
        success: false,
        message: error.message || 'Error al cerrar sesión'
      };
    }
  },

  // Obtener usuario actual
  getCurrentUser() {
    return pb.authStore.model;
  },

  // Verificar si está autenticado
  isAuthenticated() {
    return pb.authStore.isValid;
  },

  // Actualizar perfil de usuario
  async updateProfile(userId: string, data: Partial<User>) {
    try {
      const record = await pb.collection('users').update(userId, data);
      return {
        success: true,
        user: record,
        message: 'Perfil actualizado exitosamente'
      };
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      return {
        success: false,
        user: null,
        message: error.message || 'Error al actualizar perfil'
      };
    }
  }
};

// Servicios de regiones
export const regionService = {
  async getAll() {
    try {
      const regions = await pb.collection('regions').getFullList<Region>();
      return {
        success: true,
        data: regions,
        message: 'Regiones obtenidas exitosamente'
      };
    } catch (error: any) {
      console.error('Error obteniendo regiones:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Error al obtener regiones'
      };
    }
  },

  async getById(id: string) {
    try {
      const region = await pb.collection('regions').getOne<Region>(id);
      return {
        success: true,
        data: region,
        message: 'Región obtenida exitosamente'
      };
    } catch (error: any) {
      console.error('Error obteniendo región:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Error al obtener región'
      };
    }
  }
};

// Servicios de ingredientes
export const ingredientService = {
  async getAll() {
    try {
      const ingredients = await pb.collection('ingredients').getFullList<Ingredient>();
      return {
        success: true,
        data: ingredients,
        message: 'Ingredientes obtenidos exitosamente'
      };
    } catch (error: any) {
      console.error('Error obteniendo ingredientes:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Error al obtener ingredientes'
      };
    }
  },

  async getByCategory(category: string) {
    try {
      const ingredients = await pb.collection('ingredients').getFullList<Ingredient>({
        filter: `category = "${category}"`
      });
      return {
        success: true,
        data: ingredients,
        message: 'Ingredientes obtenidos exitosamente'
      };
    } catch (error: any) {
      console.error('Error obteniendo ingredientes por categoría:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Error al obtener ingredientes'
      };
    }
  },

  async search(query: string) {
    try {
      const ingredients = await pb.collection('ingredients').getFullList<Ingredient>({
        filter: `name ~ "${query}"`
      });
      return {
        success: true,
        data: ingredients,
        message: 'Búsqueda completada exitosamente'
      };
    } catch (error: any) {
      console.error('Error en búsqueda de ingredientes:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Error en la búsqueda'
      };
    }
  }
};

// Servicios de recetas
export const recipeService = {
  async getAll(options?: { region?: string; difficulty?: string; featured?: boolean }) {
    try {
      let filter = '';
      const filters: string[] = [];

      if (options?.region && options.region !== 'Todas') {
        // Buscar región por nombre
        const regions = await pb.collection('regions').getFullList({ filter: `name = "${options.region}"` });
        if (regions.length > 0) {
          filters.push(`region = "${regions[0].id}"`);
        }
      }

      if (options?.difficulty) {
        filters.push(`difficulty = "${options.difficulty}"`);
      }

      if (options?.featured) {
        filters.push('is_featured = true');
      }

      if (filters.length > 0) {
        filter = filters.join(' && ');
      }

      const recipes = await pb.collection('recipes').getFullList<Recipe>({
        filter,
        expand: 'region'
      });

      return {
        success: true,
        data: recipes,
        message: 'Recetas obtenidas exitosamente'
      };
    } catch (error: any) {
      console.error('Error obteniendo recetas:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Error al obtener recetas'
      };
    }
  },

  async getById(id: string) {
    try {
      const recipe = await pb.collection('recipes').getOne<Recipe>(id, {
        expand: 'region,created_by'
      });
      return {
        success: true,
        data: recipe,
        message: 'Receta obtenida exitosamente'
      };
    } catch (error: any) {
      console.error('Error obteniendo receta:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Error al obtener receta'
      };
    }
  },

  async search(query: string) {
    try {
      const recipes = await pb.collection('recipes').getFullList<Recipe>({
        filter: `name ~ "${query}" || description ~ "${query}"`,
        expand: 'region'
      });
      return {
        success: true,
        data: recipes,
        message: 'Búsqueda completada exitosamente'
      };
    } catch (error: any) {
      console.error('Error en búsqueda de recetas:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Error en la búsqueda'
      };
    }
  },

  async create(recipeData: Partial<Recipe>) {
    try {
      const recipe = await pb.collection('recipes').create(recipeData);
      return {
        success: true,
        data: recipe,
        message: 'Receta creada exitosamente'
      };
    } catch (error: any) {
      console.error('Error creando receta:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Error al crear receta'
      };
    }
  }
};

// Servicios de favoritos
export const favoriteService = {
  async getUserFavorites(userId: string) {
    try {
      const favorites = await pb.collection('user_favorites').getFullList({
        filter: `user = "${userId}"`,
        expand: 'recipe,recipe.region'
      });
      return {
        success: true,
        data: favorites,
        message: 'Favoritos obtenidos exitosamente'
      };
    } catch (error: any) {
      console.error('Error obteniendo favoritos:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Error al obtener favoritos'
      };
    }
  },

  async addToFavorites(userId: string, recipeId: string, notes?: string) {
    try {
      const favorite = await pb.collection('user_favorites').create({
        user: userId,
        recipe: recipeId,
        notes: notes || ''
      });
      return {
        success: true,
        data: favorite,
        message: 'Receta agregada a favoritos'
      };
    } catch (error: any) {
      console.error('Error agregando a favoritos:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Error al agregar a favoritos'
      };
    }
  },

  async removeFromFavorites(userId: string, recipeId: string) {
    try {
      const favorites = await pb.collection('user_favorites').getFullList({
        filter: `user = "${userId}" && recipe = "${recipeId}"`
      });

      if (favorites.length > 0) {
        await pb.collection('user_favorites').delete(favorites[0].id);
      }

      return {
        success: true,
        message: 'Receta removida de favoritos'
      };
    } catch (error: any) {
      console.error('Error removiendo de favoritos:', error);
      return {
        success: false,
        message: error.message || 'Error al remover de favoritos'
      };
    }
  },

  async isFavorite(userId: string, recipeId: string) {
    try {
      const favorites = await pb.collection('user_favorites').getFullList({
        filter: `user = "${userId}" && recipe = "${recipeId}"`
      });
      return favorites.length > 0;
    } catch (error: any) {
      console.error('Error verificando favorito:', error);
      return false;
    }
  }
};

// Servicio de análisis de ingredientes
export const analysisService = {
  async createAnalysis(userId: string, imageFile: File, detectedIngredients?: any[], suggestedRecipes?: any[]) {
    try {
      const formData = new FormData();
      formData.append('user', userId);
      formData.append('image', imageFile);
      
      if (detectedIngredients) {
        formData.append('detected_ingredients', JSON.stringify(detectedIngredients));
      }
      
      if (suggestedRecipes) {
        formData.append('suggested_recipes', JSON.stringify(suggestedRecipes));
      }

      const analysis = await pb.collection('ingredient_analysis').create(formData);
      return {
        success: true,
        data: analysis,
        message: 'Análisis creado exitosamente'
      };
    } catch (error: any) {
      console.error('Error creando análisis:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Error al crear análisis'
      };
    }
  },

  async getUserAnalysisHistory(userId: string) {
    try {
      const analyses = await pb.collection('ingredient_analysis').getFullList({
        filter: `user = "${userId}"`,
        sort: '-created'
      });
      return {
        success: true,
        data: analyses,
        message: 'Historial obtenido exitosamente'
      };
    } catch (error: any) {
      console.error('Error obteniendo historial:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Error al obtener historial'
      };
    }
  }
};

// Servicio de preferencias de ingredientes
export const ingredientPreferenceService = {
  async getUserPreferences(userId: string) {
    try {
      const preferences = await pb.collection('user_ingredient_preferences').getFullList({
        filter: `user = "${userId}"`,
        expand: 'ingredient'
      });
      return {
        success: true,
        data: preferences,
        message: 'Preferencias obtenidas exitosamente'
      };
    } catch (error: any) {
      console.error('Error obteniendo preferencias:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Error al obtener preferencias'
      };
    }
  },

  async setPreference(userId: string, ingredientId: string, preferenceType: 'favorite' | 'dislike' | 'allergic' | 'avoid') {
    try {
      // Verificar si ya existe una preferencia
      const existing = await pb.collection('user_ingredient_preferences').getFullList({
        filter: `user = "${userId}" && ingredient = "${ingredientId}"`
      });

      let preference;
      if (existing.length > 0) {
        // Actualizar existente
        preference = await pb.collection('user_ingredient_preferences').update(existing[0].id, {
          preference_type: preferenceType
        });
      } else {
        // Crear nueva
        preference = await pb.collection('user_ingredient_preferences').create({
          user: userId,
          ingredient: ingredientId,
          preference_type: preferenceType
        });
      }

      return {
        success: true,
        data: preference,
        message: 'Preferencia guardada exitosamente'
      };
    } catch (error: any) {
      console.error('Error guardando preferencia:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Error al guardar preferencia'
      };
    }
  },

  async removePreference(userId: string, ingredientId: string) {
    try {
      const preferences = await pb.collection('user_ingredient_preferences').getFullList({
        filter: `user = "${userId}" && ingredient = "${ingredientId}"`
      });

      for (const preference of preferences) {
        await pb.collection('user_ingredient_preferences').delete(preference.id);
      }

      return {
        success: true,
        message: 'Preferencia removida exitosamente'
      };
    } catch (error: any) {
      console.error('Error removiendo preferencia:', error);
      return {
        success: false,
        message: error.message || 'Error al remover preferencia'
      };
    }
  }
};

export default pb;
