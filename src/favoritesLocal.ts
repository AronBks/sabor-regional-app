// Sistema de favoritos local
export interface FavoriteRecipe {
  id: string;
  nombre: string;
  region: string;
  img: string;
  dateAdded: string;
}

// Almacenamiento simulado de favoritos (en una app real usarías AsyncStorage)
let localFavorites: FavoriteRecipe[] = [];

// Guardar favoritos localmente
export const saveFavorites = async (favorites: FavoriteRecipe[]): Promise<boolean> => {
  try {
    localFavorites = [...favorites];
    console.log('💾 Favoritos guardados localmente:', favorites.length);
    return true;
  } catch (error) {
    console.error('❌ Error guardando favoritos:', error);
    return false;
  }
};

// Cargar favoritos locales
export const loadFavorites = async (): Promise<FavoriteRecipe[]> => {
  try {
    console.log('📂 Cargando favoritos locales:', localFavorites.length);
    return [...localFavorites];
  } catch (error) {
    console.error('❌ Error cargando favoritos:', error);
    return [];
  }
};

// Agregar receta a favoritos
export const addToFavorites = async (receta: any): Promise<boolean> => {
  try {
    const newFavorite: FavoriteRecipe = {
      id: receta.id.toString(),
      nombre: receta.nombre,
      region: receta.region,
      img: receta.img,
      dateAdded: new Date().toISOString()
    };

    // Verificar si ya existe
    const exists = localFavorites.some(fav => fav.id === newFavorite.id);
    if (exists) {
      console.log('⚠️ La receta ya está en favoritos');
      return false;
    }

    localFavorites.push(newFavorite);
    console.log('💖 Receta agregada a favoritos:', newFavorite.nombre);
    return true;
  } catch (error) {
    console.error('❌ Error agregando a favoritos:', error);
    return false;
  }
};

// Remover receta de favoritos
export const removeFromFavorites = async (recetaId: string): Promise<boolean> => {
  try {
    const initialLength = localFavorites.length;
    localFavorites = localFavorites.filter(fav => fav.id !== recetaId);
    
    if (localFavorites.length < initialLength) {
      console.log('💔 Receta removida de favoritos:', recetaId);
      return true;
    } else {
      console.log('⚠️ La receta no estaba en favoritos');
      return false;
    }
  } catch (error) {
    console.error('❌ Error removiendo de favoritos:', error);
    return false;
  }
};

// Verificar si una receta está en favoritos
export const isRecipeFavorite = async (recetaId: string): Promise<boolean> => {
  try {
    const isFavorite = localFavorites.some(fav => fav.id === recetaId);
    console.log(`🔍 ¿Receta ${recetaId} es favorita?`, isFavorite);
    return isFavorite;
  } catch (error) {
    console.error('❌ Error verificando favorito:', error);
    return false;
  }
};

// Obtener todas las recetas favoritas
export const getAllFavorites = async (): Promise<FavoriteRecipe[]> => {
  return loadFavorites();
};

// Limpiar todos los favoritos
export const clearAllFavorites = async (): Promise<boolean> => {
  try {
    localFavorites = [];
    console.log('🗑️ Todos los favoritos han sido eliminados');
    return true;
  } catch (error) {
    console.error('❌ Error limpiando favoritos:', error);
    return false;
  }
};
