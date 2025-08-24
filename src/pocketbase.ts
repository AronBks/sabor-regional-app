import PocketBase from 'pocketbase';
// NOTA: AsyncStorage temporalmente deshabilitado para evitar errores
// import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de PocketBase
const pb = new PocketBase('http://127.0.0.1:8090'); // Cambia por tu URL de PocketBase

// Configuración temporal sin AsyncStorage
// TEMPORAL: Comentado para evitar errores de AsyncStorage
// pb.authStore.onChange((auth) => {
//   if (auth) {
//     AsyncStorage.setItem('pocketbase_auth', JSON.stringify(pb.authStore.model));
//   } else {
//     AsyncStorage.removeItem('pocketbase_auth');
//   }
// });

// Cargar sesión guardada al iniciar (temporalmente deshabilitado)
export const initializePocketBase = async () => {
  try {
    console.log('Inicializando PocketBase sin AsyncStorage...');
    // TEMPORAL: Sin persistencia de sesión
    // const savedAuth = await AsyncStorage.getItem('pocketbase_auth');
    // if (savedAuth) {
    //   const authData = JSON.parse(savedAuth);
    //   pb.authStore.save(authData.token, authData);
    //   
    //   // Verificar si el token sigue siendo válido
    //   try {
    //     await pb.collection('users').authRefresh();
    //   } catch (error) {
    //     // Token expirado, limpiar
    //     pb.authStore.clear();
    //     await AsyncStorage.removeItem('pocketbase_auth');
    //   }
    // }
    
    return true;
  } catch (error) {
    console.error('Error al inicializar PocketBase:', error);
    return false;
  }
};

// Funciones de autenticación
export const authService = {
  // Registrar nuevo usuario
  async register(email: string, password: string, passwordConfirm: string, name: string) {
    try {
      const userData = {
        email,
        password,
        passwordConfirm,
        name,
        emailVisibility: true,
      };
      
      const record = await pb.collection('users').create(userData);
      
      // Autenticar inmediatamente después del registro
      await pb.collection('users').authWithPassword(email, password);
      
      return { success: true, user: record };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Iniciar sesión
  async login(email: string, password: string) {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      return { success: true, user: authData.record };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Cerrar sesión
  async logout() {
    pb.authStore.clear();
    // TEMPORAL: AsyncStorage deshabilitado
    // await AsyncStorage.removeItem('pocketbase_auth');
  },

  // Obtener usuario actual
  getCurrentUser() {
    return pb.authStore.model;
  },

  // Verificar si está autenticado
  isAuthenticated() {
    return pb.authStore.isValid;
  },

  // Actualizar perfil
  async updateProfile(data: any) {
    try {
      if (!pb.authStore.model?.id) throw new Error('No hay usuario autenticado');
      
      const record = await pb.collection('users').update(pb.authStore.model.id, data);
      return { success: true, user: record };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// Funciones para ingredientes
export const ingredientService = {
  // Crear ingrediente
  async createIngredient(data: {
    name: string;
    category: string;
    description?: string;
    image_url?: string;
    user_id: string;
  }) {
    try {
      const record = await pb.collection('ingredients').create(data);
      return { success: true, ingredient: record };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Obtener ingredientes del usuario
  async getUserIngredients(userId: string) {
    try {
      const records = await pb.collection('ingredients').getFullList({
        filter: `user_id = "${userId}"`,
        sort: '-created',
      });
      return { success: true, ingredients: records };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Buscar ingredientes por nombre
  async searchIngredients(query: string, userId: string) {
    try {
      const records = await pb.collection('ingredients').getFullList({
        filter: `name ~ "${query}" && user_id = "${userId}"`,
        sort: '-created',
      });
      return { success: true, ingredients: records };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// Funciones para recetas
export const recipeService = {
  // Crear receta
  async createRecipe(data: {
    title: string;
    description: string;
    instructions: string;
    prep_time: number;
    cook_time: number;
    servings: number;
    difficulty: string;
    category: string;
    image_url?: string;
    user_id: string;
    ingredients: string[]; // Array de IDs de ingredientes
  }) {
    try {
      const record = await pb.collection('recipes').create(data);
      return { success: true, recipe: record };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Obtener recetas del usuario
  async getUserRecipes(userId: string) {
    try {
      const records = await pb.collection('recipes').getFullList({
        filter: `user_id = "${userId}"`,
        sort: '-created',
        expand: 'ingredients',
      });
      return { success: true, recipes: records };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Buscar recetas por ingredientes
  async findRecipesByIngredients(ingredientIds: string[], userId: string) {
    try {
      // Crear filtro para recetas que contengan alguno de los ingredientes
      const ingredientFilter = ingredientIds.map(id => `ingredients ~ "${id}"`).join(' || ');
      const filter = `user_id = "${userId}" && (${ingredientFilter})`;
      
      const records = await pb.collection('recipes').getFullList({
        filter,
        sort: '-created',
        expand: 'ingredients',
      });
      return { success: true, recipes: records };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// Funciones para análisis de ingredientes
export const analysisService = {
  // Guardar análisis de imagen
  async saveAnalysis(data: {
    image_url: string;
    detected_ingredients: string[];
    confidence_score: number;
    analysis_time: number;
    user_id: string;
    suggested_recipes?: string[];
  }) {
    try {
      const record = await pb.collection('ingredient_analysis').create(data);
      return { success: true, analysis: record };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Obtener historial de análisis
  async getAnalysisHistory(userId: string, limit: number = 10) {
    try {
      const records = await pb.collection('ingredient_analysis').getList(1, limit, {
        filter: `user_id = "${userId}"`,
        sort: '-created',
      });
      return { success: true, analyses: records.items };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

export default pb;
