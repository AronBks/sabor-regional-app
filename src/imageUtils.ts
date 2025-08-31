// Utilidad para manejar imágenes de recetas con respaldo
export const getRecipeImageUrl = (receta: any): string => {
  // Lista de imágenes de respaldo de alta calidad
  const defaultImages = [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1529059997568-3d847b1154f0?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop'
  ];

  // 🔥 PRIORIDAD 1: Si la imagen es de PocketBase, construir la URL completa
  if (receta.img && receta.img.includes('api/files')) {
    // Construir URL completa de PocketBase
    const pocketbaseUrl = 'http://127.0.0.1:8090'; // Tu URL de PocketBase
    const fullUrl = receta.img.startsWith('http') ? receta.img : `${pocketbaseUrl}/${receta.img}`;
    console.log(`📷 Usando imagen de PocketBase: ${fullUrl}`);
    return fullUrl;
  }

  // 🔥 PRIORIDAD 2: Si la receta tiene una imagen externa válida, usarla
  if (receta.img && 
      (receta.img.includes('unsplash.com') || 
       receta.img.includes('pixabay.com') || 
       receta.img.includes('images.') ||
       receta.img.startsWith('http'))) {
    console.log(`📷 Usando imagen externa: ${receta.img}`);
    return receta.img;
  }

  // 🔥 PRIORIDAD 3: Si no hay imagen válida, usar imagen de respaldo
  const randomIndex = Math.abs(receta.id || Math.random() * 1000) % defaultImages.length;
  const fallbackImage = defaultImages[randomIndex];
  console.log(`📷 Usando imagen de respaldo para ${receta.nombre}: ${fallbackImage}`);
  return fallbackImage;
};

// Función para procesar y normalizar recetas
export const processRecipeImages = (recetas: any[]): any[] => {
  return recetas.map(receta => ({
    ...receta,
    img: getRecipeImageUrl(receta)
  }));
};
