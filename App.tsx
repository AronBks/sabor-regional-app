import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet, Linking, Alert, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Switch } from 'react-native';
import SimpleLogin from './components/SimpleLogin';
import { IngredientAnalysisService } from './src/services/ingredientAnalysis';
import { analysisService, initializePocketBase } from './src/pocketbase';
import { userRecipeService } from './src/userRecipeService';
import simpleAuthService from './src/simpleAuth';
import recetasService, { RecetaForApp } from './src/recetasFromDB';

// Helpers para YouTube
/** Extrae el ID de YouTube de de varios formatos: watch?v=, youtu.be, embed, shorts */
const getYouTubeId = (url?: string) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1);
    const v = u.searchParams.get('v');
    if (v) return v;
    const parts = u.pathname.split('/').filter(Boolean);
    const i = parts.findIndex(p => ['embed', 'shorts', 'v'].includes(p));
    if (i >= 0 && parts[i + 1]) return parts[i + 1];
  } catch {
    const m = url && url.match ? url.match(/[?&]v=([A-Za-z0-9_-]{11})/) : null;
    if (m) return m[1];
  }
  return null;
};

const getYouTubeThumb = (url?: string) => {
  const id = getYouTubeId(url as any);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : undefined;
};

const REGIONES = ['Todas', 'Andina', 'Costa', 'Selva', 'Sierra', 'Pampa', 'Altiplano'];

// Colores distintivos para cada región
const COLORES_REGIONES = {
  'Todas': '#6B7280',
  'Andina': '#8B5CF6', // Morado montañoso
  'Costa': '#06B6D4', // Azul celeste océano
  'Selva': '#10B981', // Verde selva
  'Sierra': '#F59E0B', // Dorado montaña
  'Pampa': '#84CC16', // Verde claro pradera
  'Altiplano': '#DC2626', // Rojo tierra alta
};

// NAV items for bottom navigation  
const NAV_ITEMS = [
  { key: 'inicio', label: 'Inicio', icon: 'home', emoji: '🏠' },
  { key: 'buscar', label: 'Buscar', icon: 'search', emoji: '🔍' },
  { key: 'camara', label: 'Cámara', icon: 'camera-alt', emoji: '📷' },
  { key: 'lista', label: 'Lista', icon: 'list', emoji: '📝' },
  { key: 'perfil', label: 'Perfil', icon: 'person', emoji: '👤' },
];

const RECETAS = [
  // REGIÓN ANDINA
  {
    id: 1,
    nombre: 'Arepas de Maíz Blanco',
    region: 'Andina',
    img: 'https://images.unsplash.com/photo-1529059997568-3d847b1154f0?w=400&h=300&fit=crop', // Imagen local
    destacado: true,
    ingredientes: ['Harina de maíz', 'Agua tibia', 'Sal', 'Queso fresco'],
    pasos: [
      'Mezcla la harina de maíz con agua tibia y sal hasta formar una masa suave',
      'Agrega el queso fresco desmenuzado y amasa bien',
      'Forma bolas y aplana para hacer las arepas',
      'Cocina en sartén caliente por ambos lados hasta dorar'
    ],
    descripcion: 'Deliciosas arepas tradicionales hechas con maíz blanco.',
    video: 'https://www.youtube.com/watch?v=kpZx53kkslw',
    videoThumbnail: 'https://img.youtube.com/vi/kpZx53kkslw/hqdefault.jpg',
    nutricion: {
      calorias: 320,
      proteinas: 14,
      carbohidratos: 45,
      grasas: 8,
      fibra: 3,
      energia: 75,
      perfilGrasas: 22,
      perfilFibra: 15
    },
    tiempo_preparacion: 30,
    dificultad: 'Fácil',
    porciones: 4,
    etiquetas: ['vegetariano', 'lácteos', 'gluten']
  },
  {
    id: 2,
    nombre: 'Papa Rellena',
    region: 'Andina',
    img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop', // Imagen local
    destacado: true,
    ingredientes: ['Papa amarilla', 'Carne molida', 'Cebolla', 'Huevo', 'Aceite'],
    pasos: [
      'Hierve las papas amarillas hasta que estén muy suaves',
      'Prepara un guiso con carne molida, cebolla y condimentos',
      'Forma las papas rellenas con el guiso en el centro',
      'Pasa por huevo batido y fríe hasta dorar por todos lados'
    ],
    descripcion: 'Deliciosa papa rellena de carne típica de los Andes.',
    nutricion: {
      calorias: 380,
      proteinas: 18,
      carbohidratos: 45,
      grasas: 14,
      fibra: 3,
      energia: 75,
      perfilGrasas: 33,
      perfilFibra: 15
    },
    tiempo_preparacion: 45,
    dificultad: 'Intermedio',
    porciones: 4,
    etiquetas: ['carne', 'huevo']
  },
  {
    id: 3,
    nombre: 'Quinua con Verduras',
    region: 'Andina',
    img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop', // Imagen local
    destacado: false,
    ingredientes: ['Quinua', 'Zanahoria', 'Apio', 'Cebolla', 'Aceite'],
    pasos: [
      'Lava la quinua hasta que el agua salga transparente',
      'Cocina en agua hirviendo por 15 minutos hasta que esté suave',
      'Saltea las verduras picadas en aceite hasta que estén tiernas',
      'Mezcla la quinua cocida con las verduras salteadas'
    ],
    descripcion: 'Nutritiva quinua con verduras andinas.',
    nutricion: {
      calorias: 280,
      proteinas: 12,
      carbohidratos: 48,
      grasas: 6,
      fibra: 5,
      energia: 65,
      perfilGrasas: 19,
      perfilFibra: 25
    }
  },
  
  // REGIÓN COSTA
  {
    id: 4,
    nombre: 'Ceviche de Pescado',
    region: 'Costa',
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', // Imagen local
    destacado: true,
    ingredientes: ['Pescado fresco', 'Limón', 'Cebolla', 'Ají', 'Sal'],
    pasos: [
      'Corta el pescado fresco en cubos de 2cm aproximadamente',
      'Exprime abundante jugo de limón sobre el pescado',
      'Añade cebolla cortada en juliana fina y ají al gusto',
      'Sazona con sal y deja marinar por 10-15 minutos hasta que el pescado esté "cocido"'
    ],
    descripcion: 'Ceviche peruano fresco y sabroso.',
    nutricion: {
      calorias: 180,
      proteinas: 28,
      carbohidratos: 8,
      grasas: 2,
      fibra: 1,
      energia: 65,
      perfilGrasas: 8,
      perfilFibra: 5
    }
  },
  {
    id: 5,
    nombre: 'Arroz con Mariscos',
    region: 'Costa',
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', // Imagen local
    destacado: true,
    ingredientes: ['Arroz', 'Mariscos mixtos', 'Pimientos rojos', 'Ají amarillo', 'Caldo de pescado', 'Culantro', 'Cebolla', 'Ajo'],
    pasos: [
      'Limpia bien todos los mariscos (camarones, mejillones, calamares)',
      'Prepara un sofrito con cebolla, ajo y ají amarillo licuado',
      'Agrega el arroz y sofríe hasta que esté dorado',
      'Incorpora el caldo de pescado caliente gradualmente',
      'Añade los mariscos y pimientos, cocina 15 minutos',
      'Decora con culantro fresco y sirve caliente'
    ],
    descripcion: 'Exquisito arroz con mariscos frescos del Pacífico, un clásico de la costa.',
    nutricion: {
      calorias: 450,
      proteinas: 28,
      carbohidratos: 48,
      grasas: 14,
      fibra: 2,
      energia: 85,
      perfilGrasas: 28,
      perfilFibra: 10
    }
  },
  {
    id: 6,
    nombre: 'Arroz con Mariscos',
    region: 'Costa',
    img: 'https://images.unsplash.com/photo-1574781330855-d0db3293032e?w=400&h=300&fit=crop', // Imagen local
    destacado: false,
    ingredientes: ['Arroz', 'Mariscos mixtos', 'Cebolla', 'Ají', 'Culantro'],
    pasos: [
      'Sofríe la cebolla y ají en aceite hasta que estén dorados',
      'Agrega el arroz y mezcla por 2 minutos',
      'Incorpora los mariscos y el caldo caliente',
      'Cocina a fuego medio hasta que el arroz esté en su punto'
    ],
    descripcion: 'Aromático arroz con mariscos frescos del mar.',
    nutricion: {
      calorias: 450,
      proteinas: 24,
      carbohidratos: 58,
      grasas: 12,
      fibra: 2,
      energia: 90,
      perfilGrasas: 24,
      perfilFibra: 8
    }
  },
  
  // REGIÓN SELVA
  {
    id: 7,
    nombre: 'Tacacho con Cecina',
    region: 'Selva',
    img: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop', // Imagen local
    destacado: true,
    ingredientes: ['Plátano verde', 'Cecina', 'Aceite', 'Sal'],
    pasos: [
      'Asa los plátanos verdes directamente al fuego hasta que estén suaves',
      'Retira la cáscara y machaca el plátano caliente',
      'Agrega aceite y sal, mezcla hasta formar una masa homogénea',
      'Fríe la cecina en trozos y sirve acompañando el tacacho'
    ],
    descripcion: 'Plato típico de la selva peruana.',
    nutricion: {
      calorias: 420,
      proteinas: 22,
      carbohidratos: 52,
      grasas: 12,
      fibra: 4,
      energia: 85,
      perfilGrasas: 28,
      perfilFibra: 20
    }
  },
  {
    id: 8,
    nombre: 'Juane de Gallina',
    region: 'Selva',
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop', // Imagen local
    destacado: true,
    ingredientes: ['Arroz', 'Gallina', 'Huevo', 'Hojas de bijao', 'Especias'],
    pasos: ['Cocina la gallina con especias', 'Prepara el arroz', 'Envuelve en hojas de bijao', 'Hierve por 45 minutos'],
    descripcion: 'Tradicional juane envuelto en hojas de bijao.',
  },
  {
    id: 9,
    nombre: 'Patarashca de Pescado',
    region: 'Selva',
    img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop', // Imagen local
    destacado: false,
    ingredientes: ['Pescado de río', 'Plátano', 'Tomate', 'Cebolla', 'Hojas de plátano'],
    pasos: ['Sazona el pescado', 'Envuelve con verduras en hoja de plátano', 'Asa a la parrilla', 'Sirve caliente'],
    descripcion: 'Pescado envuelto y asado con sabores amazónicos.',
  },
  
  // REGIÓN SIERRA
  {
    id: 10,
    nombre: 'Pachamanca',
    region: 'Sierra',
    img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop', // Imagen local
    destacado: true,
    ingredientes: ['Carne de res', 'Cerdo', 'Papa', 'Camote', 'Humitas'],
    pasos: ['Prepara el horno de tierra', 'Sazona las carnes', 'Coloca por capas', 'Cubre y cocina por horas'],
    descripcion: 'Ancestral técnica de cocción bajo tierra.',
  },
  {
    id: 11,
    nombre: 'Cuy Chactado',
    region: 'Sierra',
    img: 'https://cdn.pixabay.com/photo/2017/04/11/21/54/stuffed-peppers-2255998_640.jpg', // Imagen local
    destacado: false,
    ingredientes: ['Cuy', 'Papa', 'Maíz cancha', 'Ají', 'Chicha de jora'],
    pasos: ['Limpia y sazona el cuy', 'Fríe en aceite caliente', 'Sirve con papas', 'Acompaña con cancha'],
    descripcion: 'Tradicional cuy frito de la sierra peruana.',
  },
  {
    id: 11,
    nombre: 'Rocoto Relleno',
    region: 'Amazonica',
    img: 'https://cdn.pixabay.com/photo/2017/04/11/21/54/stuffed-peppers-2255998_640.jpg', // Imagen local
    destacado: true,
    ingredientes: ['Rocoto', 'Carne molida de res', 'Cebolla blanca', 'Queso fresco', 'Leche evaporada', 'Huevos', 'Aceitunas', 'Pasas'],
    pasos: [
      'Quita las semillas y venas de los rocotos con cuidado',
      'Hierve los rocotos en agua con sal y azúcar para reducir el picante',
      'Sofríe la cebolla y agrega la carne molida sazonada',
      'Mezcla la carne con huevo duro picado, aceitunas y pasas',
      'Rellena los rocotos con la mezcla y cubre con queso',
      'Baña con leche evaporada y hornea hasta gratinar'
    ],
    descripcion: 'Tradicional rocoto relleno de la región amazónica, picante y sabroso.',
    nutricion: {
      calorias: 380,
      proteinas: 22,
      carbohidratos: 18,
      grasas: 24,
      fibra: 4
    }
  },
  
  // REGIÓN PAMPA
  {
    id: 12,
    nombre: 'Asado de Tira',
    region: 'Pampa',
    img: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop', // Imagen local
    destacado: true,
    ingredientes: ['Costillas de res', 'Sal gruesa', 'Chimichurri', 'Carbón'],
    pasos: ['Sazona la carne con sal', 'Prepara el fuego', 'Asa lentamente', 'Sirve con chimichurri'],
    descripcion: 'Tradicional asado a la parrilla de las pampas.',
  },
  {
    id: 13,
    nombre: 'Empanadas de Carne',
    region: 'Pampa',
    img: 'https://cdn.pixabay.com/photo/2020/03/08/09/18/food-4840664_640.jpg', // Imagen local
    destacado: false,
    ingredientes: ['Masa de empanada', 'Carne cortada a cuchillo', 'Cebolla', 'Huevo', 'Aceitunas'],
    pasos: ['Prepara el relleno', 'Arma las empanadas', 'Pinta con huevo', 'Hornea hasta dorar'],
    descripcion: 'Clásicas empanadas de carne jugosas.',
  },
  {
    id: 14,
    nombre: 'Locro de Zapallo',
    region: 'Pampa',
    img: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop', // Imagen local
    destacado: false,
    ingredientes: ['Zapallo', 'Porotos', 'Chorizo', 'Cebolla', 'Pimentón'],
    pasos: ['Remoja los porotos', 'Cocina con zapallo', 'Agrega chorizo', 'Condimenta y sirve'],
    descripcion: 'Nutritivo locro con zapallo y porotos.',
  },
  
  // REGIÓN ALTIPLANO
  {
    id: 15,
    nombre: 'Chairo Paceño',
    region: 'Altiplano',
    img: 'https://cdn.pixabay.com/photo/2023/04/21/07/41/soup-8021570_640.jpg', // Imagen local
    destacado: true,
    ingredientes: ['Chuño negro', 'Carne de llama o res', 'Papa', 'Cebada perlada', 'Zanahoria', 'Apio', 'Perejil', 'Hierba buena', 'Sal'],
    pasos: [
      'Remoja el chuño desde la noche anterior hasta que esté suave',
      'Hierve la carne de llama con sal hasta que esté tierna',
      'Agrega la cebada perlada y cocina por 20 minutos',
      'Incorpora las papas peladas y cortadas en trozos grandes',
      'Añade el chuño escurrido y las verduras picadas',
      'Condimenta con hierbas frescas y cocina hasta que todo esté tierno',
      'Sirve bien caliente acompañado de llajua'
    ],
    descripcion: 'Sopa tradicional paceña con chuño, perfecta para el clima frío del altiplano.',
    nutricion: {
      calorias: 420,
      proteinas: 25,
      carbohidratos: 55,
      grasas: 8,
      fibra: 6
    }
  },
  {
    id: 16,
    nombre: 'Charquekan',
    region: 'Altiplano',
    img: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop', // Imagen local
    destacado: false,
    ingredientes: ['Charque de llama', 'Papa blanca', 'Chuño', 'Cebolla', 'Tomate', 'Ají colorado', 'Huevo', 'Queso fresco'],
    pasos: [
      'Desmenuza el charque después de hervirlo y quitarle la sal',
      'Cocina las papas y el chuño por separado hasta que estén tiernos',
      'Sofríe la cebolla con tomate y ají colorado molido',
      'Agrega el charque desmenuzado al sofrito',
      'Incorpora las papas y chuño cortados en trozos',
      'Corona con huevo frito y queso fresco desmenuzado',
      'Sirve acompañado de llajua picante'
    ],
    descripcion: 'Plato altiplánico con charque de llama, papa y chuño, muy nutritivo.',
    nutricion: {
      calorias: 380,
      proteinas: 28,
      carbohidratos: 45,
      grasas: 12,
      fibra: 4
    }
  },
  {
    id: 17,
    nombre: 'Jaka Lawa',
    region: 'Altiplano',
    img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop', // Imagen local
    destacado: false,
    ingredientes: ['Quinua', 'Carne de res', 'Papa amarilla', 'Cebolla', 'Zanahoria', 'Apio', 'Culantro', 'Hierba buena', 'Sal'],
    pasos: [
      'Lava muy bien la quinua hasta que el agua salga transparente',
      'Hierve la carne de res con sal hasta que esté suave',
      'En la misma olla, agrega la quinua y cocina por 15 minutos',
      'Incorpora las papas y verduras cortadas en trozos medianos',
      'Sofríe la cebolla aparte y agrégala a la sopa',
      'Condimenta con hierbas frescas picadas',
      'Cocina hasta que todos los ingredientes estén tiernos',
      'Sirve caliente con pan tostado'
    ],
    descripcion: 'Nutritiva sopa de quinua con carne y verduras, ideal para el altiplano.',
    nutricion: {
      calorias: 350,
      proteinas: 20,
      carbohidratos: 50,
      grasas: 6,
      fibra: 5
    }
  },
];

// Función para obtener el color de una región
const getColorRegion = (region: string): string => {
  return COLORES_REGIONES[region as keyof typeof COLORES_REGIONES] || COLORES_REGIONES['Todas'];
};

// Funciones auxiliares para la vista de detalles
const getIngredientAmount = () => {
  const amounts = ['1 taza', '2 cdas', '1 kg', '500g', '3 unidades', '1 pizca', 'c/s'];
  return amounts[Math.floor(Math.random() * amounts.length)];
};

const getStepTime = (stepIndex: number) => {
  const times = [5, 10, 15, 8, 12, 20, 3, 25];
  return times[stepIndex % times.length];
};

const getStepDifficulty = (stepIndex: number) => {
  const difficulties = ['🟢 Fácil', '🟡 Medio', '🔴 Difícil'];
  return difficulties[stepIndex % difficulties.length];
};

// Preferencias disponibles como etiquetas profesionales
const PREFERENCIAS: { key: string; label: string }[] = [
  { key: 'sin_gluten', label: 'Sin gluten' },
  { key: 'vegetariano', label: 'Vegetariano' },
  { key: 'vegano', label: 'Vegano' },
  { key: 'sin_lactosa', label: 'Sin lactosa' },
];

const App = () => {
  // Estados de autenticación simplificados
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userFavorites, setUserFavorites] = useState<any[]>([]);
  const [isRecipeFavorite, setIsRecipeFavorite] = useState(false);
  
  // Estados para recetas desde PocketBase
  const [recetasPB, setRecetasPB] = useState<any[]>([]);
  const [loadingRecetas, setLoadingRecetas] = useState(true);
  
  // Función para cargar recetas desde PocketBase
  const cargarRecetasDePocketBase = async () => {
    try {
      setLoadingRecetas(true);
      let recetasFromDB;
      
      // Si hay usuario autenticado, cargar recetas filtradas por preferencias
      if (currentUser && currentUser.preferences) {
        console.log('Cargando recetas con preferencias del usuario:', currentUser.preferences);
        recetasFromDB = await recetasService.obtenerRecetasPorPreferencias(currentUser.preferences);
      } else {
        // Si no hay usuario o preferencias, cargar todas las recetas
        recetasFromDB = await recetasService.obtenerTodasLasRecetas();
      }
      
      setRecetasPB(recetasFromDB);
      console.log('Recetas cargadas desde PocketBase:', recetasFromDB.length);
    } catch (error) {
      console.error('Error cargando recetas desde PocketBase:', error);
      // Si falla, usar las recetas hardcodeadas como fallback
      setRecetasPB([]);
    } finally {
      setLoadingRecetas(false);
    }
  };
  
  // Variable combinada para usar en la app
  const RECETAS_ACTIVAS = recetasPB.length > 0 ? recetasPB : RECETAS;
  
  // Función para obtener imagen de receta
  const getRecipeImage = (recipe: any) => {
    // Si la receta tiene un campo img (ya sea de PocketBase o hardcodeada)
    if (recipe.img) {
      return { uri: recipe.img };
    }
    // Fallback para recetas hardcodeadas que usan IMAGENES_RECETAS
    const hardcodedImages: Record<number, any> = {
      1: { uri: 'https://images.unsplash.com/photo-1529059997568-3d847b1154f0?w=400&h=300&fit=crop' },
      2: { uri: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop' },
      3: { uri: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop' },
      4: { uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop' },
      5: { uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop' },
      6: { uri: 'https://images.unsplash.com/photo-1574781330855-d0db3293032e?w=400&h=300&fit=crop' },
      7: { uri: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop' },
      8: { uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop' },
      9: { uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop' },
      10: { uri: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop' },
      11: { uri: 'https://cdn.pixabay.com/photo/2017/04/11/21/54/stuffed-peppers-2255998_640.jpg' },
      12: { uri: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop' },
      13: { uri: 'https://cdn.pixabay.com/photo/2020/03/08/09/18/food-4840664_640.jpg' },
      14: { uri: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop' },
      15: { uri: 'https://cdn.pixabay.com/photo/2023/04/21/07/41/soup-8021570_640.jpg' },
      16: { uri: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop' },
      17: { uri: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop' },
    };
    return hardcodedImages[recipe.id] || hardcodedImages[1];
  };
  
  // Estados de navegación y UI existentes
  const [region, setRegion] = useState<'Todas' | string>('Todas');
  const [nav, setNav] = useState<'inicio' | 'buscar' | 'camara' | 'lista' | 'perfil'>('inicio');
  const [selectedRecipe, setSelectedRecipe] = useState<
    | (typeof RECETAS_ACTIVAS)[number]
    | null
  >(null);
  const [activeTab, setActiveTab] = useState('ingredientes');
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  
  // Estados para búsqueda en tiempo real
  const [searchQuery, setSearchQuery] = useState('');
  const [recetasFiltradas, setRecetasFiltradas] = useState<any[]>([]);
  const [busquedaRecetas, setBusquedaRecetas] = useState(false);
  const [recetasDestacadas, setRecetasDestacadas] = useState<any[]>([]);
  const [ultimasBusquedas, setUltimasBusquedas] = useState<string[]>([]);
  
  // Lista de ingredientes populares para sugerencias
  const [ingredientesSugeridos] = useState([
    'Arroz', 'Pollo', 'Pescado', 'Carne', 'Cebolla', 'Ajo', 'Tomate', 'Papa', 
    'Limón', 'Sal', 'Pimienta', 'Aceite', 'Queso', 'Huevo', 'Leche', 'Harina',
    'Cilantro', 'Culantro', 'Ají', 'Cúrcuma', 'Comino', 'Orégano', 'Plátano',
    'Yuca', 'Camote', 'Maíz', 'Quinua', 'Zapallo', 'Zanahoria', 'Rocoto'
  ]);
  
  // Inicializar PocketBase al cargar la app
  useEffect(() => {
    const setupPocketBase = async () => {
      try {
        await initializePocketBase();
        console.log('PocketBase inicializado correctamente');
        
        // Verificar si hay una sesión activa
        const currentSession = await simpleAuthService.getCurrentUser();
        if (currentSession && currentSession.id) {
          setCurrentUser(currentSession);
          setIsLoggedIn(true);
          console.log('Usuario ya autenticado:', currentSession.name);
        }
      } catch (error) {
        console.error('Error inicializando PocketBase:', error);
      }
    };
    setupPocketBase();
  }, []);
  
  // Cargar recetas desde PocketBase
  useEffect(() => {
    cargarRecetasDePocketBase();
  }, [currentUser]); // Recargar cuando cambie el usuario

  // Cargar recetas cuando cambien las preferencias del usuario
  useEffect(() => {
    if (currentUser) {
      cargarRecetasDePocketBase();
    }
  }, [currentUser?.preferences]);
  
  // Filtrar recetas en tiempo real basado en búsqueda y región
  useEffect(() => {
    let filtered = RECETAS_ACTIVAS;
    
    // Filtrar por región
    if (region !== 'Todas') {
      filtered = filtered.filter(r => r.region === region);
    }
    
    // Filtrar por búsqueda en tiempo real
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      
      // Guardar búsqueda si tiene más de 2 caracteres
      if (query.length > 2 && !ultimasBusquedas.includes(query)) {
        setUltimasBusquedas(prev => [query, ...prev.slice(0, 4)]); // Mantener solo 5 búsquedas
      }
      
      filtered = filtered.filter(r => {
        // Buscar en nombre
        if (r.nombre?.toLowerCase().includes(query)) return true;
        
        // Buscar en descripción
        if (r.descripcion?.toLowerCase().includes(query)) return true;
        
        // Buscar en región
        if (r.region?.toLowerCase().includes(query)) return true;
        
        // Buscar en ingredientes (string separado por comas)
        if (r.ingredientes && typeof r.ingredientes === 'string') {
          const ingredientesArray = r.ingredientes.split(',').map(ing => ing.trim().toLowerCase());
          if (ingredientesArray.some(ing => ing.includes(query))) return true;
        }
        
        // Buscar en etiquetas si existen
        if (r.etiquetas && typeof r.etiquetas === 'string') {
          const etiquetasArray = r.etiquetas.split(',').map(tag => tag.trim().toLowerCase());
          if (etiquetasArray.some(tag => tag.includes(query))) return true;
        } else if (Array.isArray(r.etiquetas)) {
          if (r.etiquetas.some(tag => tag.toLowerCase().includes(query))) return true;
        }
        
        return false;
      });
      
      setBusquedaRecetas(true);
    } else {
      setBusquedaRecetas(false);
    }
    
    setRecetasFiltradas(filtered);
  }, [RECETAS_ACTIVAS, region, searchQuery, ultimasBusquedas]);
  
  // Generar recetas destacadas dinámicamente
  useEffect(() => {
    if (RECETAS_ACTIVAS.length > 0) {
      // Mezclar algoritmo de destacados:
      // 1. Recetas populares por región
      // 2. Recetas relacionadas con búsquedas recientes
      // 3. Recetas aleatorias para variedad
      
      let destacadas = [];
      
      // Obtener 2 recetas de cada región
      const regiones = ['Costa', 'Sierra', 'Amazónica', 'Andina'];
      regiones.forEach(reg => {
        const recetasRegion = RECETAS_ACTIVAS.filter(r => r.region === reg);
        if (recetasRegion.length > 0) {
          // Obtener recetas aleatorias de esta región
          const shuffled = [...recetasRegion].sort(() => 0.5 - Math.random());
          destacadas.push(...shuffled.slice(0, 2));
        }
      });
      
      // Agregar recetas basadas en búsquedas recientes
      if (ultimasBusquedas.length > 0) {
        ultimasBusquedas.forEach(busqueda => {
          const relacionadas = RECETAS_ACTIVAS.filter(r => 
            r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (r.ingredientes && typeof r.ingredientes === 'string' && r.ingredientes.toLowerCase().includes(busqueda.toLowerCase()))
          );
          destacadas.push(...relacionadas.slice(0, 1));
        });
      }
      
      // Remover duplicados y mezclar
      const destacadasUnicas = destacadas.filter((receta, index, arr) => 
        arr.findIndex(r => r.id === receta.id) === index
      );
      
      // Si no hay suficientes, agregar aleatorias
      if (destacadasUnicas.length < 8) {
        const faltantes = 8 - destacadasUnicas.length;
        const disponibles = RECETAS_ACTIVAS.filter(r => 
          !destacadasUnicas.some(d => d.id === r.id)
        );
        const aleatorias = [...disponibles].sort(() => 0.5 - Math.random()).slice(0, faltantes);
        destacadasUnicas.push(...aleatorias);
      }
      
      setRecetasDestacadas(destacadasUnicas.slice(0, 8));
    }
  }, [RECETAS_ACTIVAS, ultimasBusquedas]);
  
  // Cargar favoritos cuando cambie el usuario
  useEffect(() => {
    if (currentUser) {
      loadUserFavorites(currentUser.id);
    } else {
      setFavoritos([]);
    }
  }, [currentUser]);

  // Limpiar checkboxes cuando se selecciona una nueva receta
  useEffect(() => {
    setCheckedIngredients(new Set());
  }, [selectedRecipe]);
  
  // Estados para análisis de ingredientes con PocketBase
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState<any[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<any[]>([]);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  
  // Estados existentes
  const [includedIngredients, setIncludedIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [preferencias, setPreferencias] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState({ facil: true, intermedio: false, avanzado: false });
  const RESTRICCIONES = ['Sin gluten', 'Vegetariano', 'Vegano', 'Keto', 'Sin lactosa', 'Paleo'];
  const [selectedRestricciones, setSelectedRestricciones] = useState<string[]>([]);
  const INGREDIENTES_FAVORITOS = [
    'Carne de res', 'Pollo', 'Mariscos', 'Pavo',
    'Cerdo', 'Pescado', 'Cordero', 'Quesos'
  ];
  const [ingredientesFavoritos, setIngredientesFavoritos] = React.useState<string[]>([]);
  const [favoritos, setFavoritos] = React.useState<any[]>([]);

  // Estados para guardar preferencias del usuario
  const [savedRestricciones, setSavedRestricciones] = React.useState<string[]>([]);
  const [savedIngredientesFavoritos, setSavedIngredientesFavoritos] = React.useState<string[]>([]);

  // Función para cargar favoritos del usuario
  const loadUserFavorites = async (userId: string) => {
    try {
      console.log('🔄 Cargando favoritos para usuario:', userId);
      const result = await userRecipeService.getUserFavorites(userId);
      console.log('📥 Resultado favoritos:', result);
      
      if (result.success && result.favorites) {
        console.log('✅ Favoritos cargados:', result.favorites.length);
        setFavoritos(result.favorites);
        setUserFavorites(result.favorites);
        return result.favorites;
      } else {
        console.log('⚠️ No hay favoritos o error en carga');
        setFavoritos([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Error cargando favoritos:', error);
      setFavoritos([]);
      return [];
    }
  };

  // Función para guardar preferencias en PocketBase
  const saveUserPreferences = async () => {
    if (!currentUser) return;
    
    try {
      const preferences = {
        restricciones: selectedRestricciones,
        ingredientesFavoritos: ingredientesFavoritos,
        ultimasBusquedas: ultimasBusquedas
      };
      
      // Aquí podrías guardar en PocketBase si tienes una tabla de preferencias
      console.log('Guardando preferencias:', preferences);
      
      // Por ahora guardar en estados locales
      setSavedRestricciones(selectedRestricciones);
      setSavedIngredientesFavoritos(ingredientesFavoritos);
      
      Alert.alert('✅ Preferencias', 'Preferencias guardadas correctamente');
    } catch (error) {
      console.error('Error guardando preferencias:', error);
      Alert.alert('❌ Error', 'No se pudieron guardar las preferencias');
    }
  };

  // Función para cargar preferencias guardadas
  const loadUserPreferences = async () => {
    if (!currentUser) return;
    
    try {
      // Aquí cargarías desde PocketBase
      // Por ahora usar estados locales
      setSelectedRestricciones(savedRestricciones);
      setIngredientesFavoritos(savedIngredientesFavoritos);
    } catch (error) {
      console.error('Error cargando preferencias:', error);
    }
  };

  // Función para manejar favoritos con parámetro (versión simplificada)
  const toggleFavoriteWithRecipe = async (recipe: any) => {
    console.log('🔥 toggleFavoriteWithRecipe llamado con:', recipe.nombre);
    
    // Alert temporal para verificar que se llama la función
    Alert.alert('🔥 Debug', `Función llamada para: ${recipe.nombre}`);
    
    console.log('👤 Usuario actual:', currentUser?.name);
    console.log('❤️ Favoritos actuales:', favoritos.length);
    
    if (!currentUser) {
      Alert.alert('Error', 'Debes iniciar sesión para guardar favoritos');
      return;
    }

    // Actualizar inmediatamente la UI
    const isFavorite = favoritos.some(f => f.id === recipe.id);
    console.log('🤔 Es favorito?', isFavorite);
    
    if (isFavorite) {
      // Remover inmediatamente de la UI
      const newFavoritos = favoritos.filter(f => f.id !== recipe.id);
      setFavoritos(newFavoritos);
      console.log('🗑️ Removido de UI, nuevos favoritos:', newFavoritos.length);
      Alert.alert('❤️ Favoritos', 'Receta removida de favoritos');
    } else {
      // Agregar inmediatamente a la UI
      const newFavoritos = [...favoritos, recipe];
      setFavoritos(newFavoritos);
      console.log('❤️ Agregado a UI, nuevos favoritos:', newFavoritos.length);
      Alert.alert('❤️ Favoritos', 'Receta agregada a favoritos');
    }
  };

  // Función para manejar login exitoso
  const handleLogin = async (user: any) => {
    console.log('🚪 handleLogin llamado con usuario:', user);
    setCurrentUser(user);
    setIsLoggedIn(true);
    setNav('inicio');
    console.log('Login exitoso:', user.name);
    console.log('Preferencias del usuario:', user.preferences);
    
    // Cargar favoritos del usuario
    await loadUserFavorites(user.id);
    
    // Cargar preferencias guardadas
    await loadUserPreferences();
    
    console.log('✅ Login completado, usuario actual guardado');
    // Las recetas se cargarán automáticamente por el useEffect que detecta cambios en currentUser
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await simpleAuthService.logout();
      setCurrentUser(null);
      setIsLoggedIn(false);
      setUserFavorites([]);
      setNav('inicio');
      Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente');
      
      // Las recetas se recargarán automáticamente por el useEffect que detecta cambios en currentUser
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión');
    }
  };

  // Función para alternar ingredientes favoritos
  const toggleIngrediente = (ing: string) => {
    setIngredientesFavoritos(prev => prev.includes(ing)
      ? prev.filter(x => x !== ing)
      : [...prev, ing]
    );
  };

  // Cargar historial de análisis cuando el usuario se autentica
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      loadAnalysisHistory();
    }
  }, [isLoggedIn, currentUser]);

  const loadAnalysisHistory = async () => {
    if (!currentUser) return;
    
    try {
      const result = await analysisService.getUserAnalysisHistory(currentUser.id);
      if (result.success && result.data) {
        setAnalysisHistory(result.data);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  }; // <-- Add this closing brace

  // Cargar favoritos cuando se selecciona una receta
  useEffect(() => {
    if (currentUser && selectedRecipe) {
      checkIfFavorite(currentUser.id, selectedRecipe.id);
      // Registrar que el usuario vio esta receta
      userRecipeService.logRecipeView(currentUser.id, selectedRecipe.id, selectedRecipe.nombre);
    }
  }, [currentUser, selectedRecipe]);

  // Funciones para manejar favoritos
  const checkIfFavorite = async (userId: string, recipeId: number) => {
    try {
      const result = await userRecipeService.isFavorite(userId, recipeId);
      setIsRecipeFavorite(result.isFavorite);
    } catch (error) {
      console.error('Error verificando favorito:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!currentUser || !selectedRecipe) {
      Alert.alert('Error', 'Debes iniciar sesión para guardar favoritos');
      return;
    }

    try {
      if (isRecipeFavorite) {
        const result = await userRecipeService.removeFromFavorites(currentUser.id, selectedRecipe.id);
        if (result.success) {
          setIsRecipeFavorite(false);
          loadUserFavorites(currentUser.id);
          Alert.alert('❤️ Favoritos', 'Receta removida de favoritos');
        }
      } else {
        const result = await userRecipeService.addToFavorites(
          currentUser.id, 
          selectedRecipe.id, 
          selectedRecipe.nombre, 
          selectedRecipe.region
        );
        if (result.success) {
          setIsRecipeFavorite(true);
          loadUserFavorites(currentUser.id);
          Alert.alert('💖 Favoritos', '¡Receta agregada a favoritos!');
        }
      }
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
      Alert.alert('Error', 'No se pudo actualizar favoritos');
    }
  };

  // Función para simular análisis de imagen
  const handleImageAnalysis = async () => {
    if (!currentUser) return;
    
    setAnalysisLoading(true);
    
    try {
      // Simular URI de imagen (en producción vendría de la cámara/galería)
      const mockImageUri = 'data:image/jpeg;base64,mock_image_data';
      
      const result = await IngredientAnalysisService.analyzeImage(mockImageUri, currentUser.id);
      
      if (result.success && result.ingredients) {
        setDetectedIngredients(result.ingredients);
        setSuggestedRecipes(result.suggestedRecipes || []);
        await loadAnalysisHistory(); // Recargar historial
        Alert.alert('¡Análisis completado!', `Se detectaron ${result.ingredients.length} ingredientes`);
      } else {
        Alert.alert('Error', result.error || 'No se pudo analizar la imagen');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo analizar la imagen');
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Funciones para manejo de dificultad y restricciones
  const toggleDifficulty = (key: 'facil' | 'intermedio' | 'avanzado') => {
    setDifficulty(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleRestriccion = (r: string) => {
    setSelectedRestricciones(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  };

  const RECIPE_TABS = [
    { key: 'ingredientes', label: 'Ingredientes' },
    { key: 'pasos', label: 'Pasos' },
    { key: 'video', label: 'Video' },
    { key: 'nutricion', label: 'Nutrición' },
  ];

  const renderRecipeDetail = (recipe: any) => {
    const regionColor = getColorRegion(recipe.region);
    
    if (!recipe) {
      return (
        <View style={styles.recipeDetailContainer}>
          <Text>Error: No se encontró la receta</Text>
        </View>
      );
    }
    
    return (
      <ScrollView style={styles.recipeDetailContainer}>
        {/* Header profesional */}
        <View style={[styles.detailHeader, { borderBottomColor: regionColor, borderBottomWidth: 3 }]}>
          <TouchableOpacity 
            onPress={() => setSelectedRecipe(null)} 
            style={[styles.backButton, { backgroundColor: regionColor }]}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.detailTitle}>Recetas Típicas</Text>
            <Text style={[styles.detailRegion, { color: regionColor }]}>📍 {recipe.region}</Text>
          </View>
          <View style={{ width: 50 }} />
        </View>
        
        {/* Imagen de la receta */}
        <Image source={getRecipeImage(recipe)} style={styles.detailImage} />
        
        {/* Información rápida */}
        <View style={styles.detailInfoRow}>
          <View style={[styles.detailTag, { backgroundColor: regionColor }]}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>{recipe.region}</Text>
          </View>
          <Text style={styles.detailInfo}>⭐ 4.8</Text>
          <Text style={styles.detailInfo}>⏱ 35min</Text>
          <Text style={styles.detailInfo}>🍽 Fácil</Text>
        </View>
        
        {/* Título y descripción */}
        <View style={styles.titleContainer}>
          <View style={styles.titleSection}>
            <Text style={styles.detailRecipeTitle}>{recipe.nombre}</Text>
            <Text style={styles.detailDescription}>{recipe.descripcion}</Text>
          </View>
          
          {/* Botón de favoritos */}
          {currentUser && (
            <TouchableOpacity 
              style={[styles.favoriteButton, { 
                backgroundColor: isRecipeFavorite ? regionColor : '#fff',
                borderColor: regionColor,
                borderWidth: isRecipeFavorite ? 0 : 2,
                shadowColor: isRecipeFavorite ? regionColor : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isRecipeFavorite ? 0.3 : 0.1,
                shadowRadius: 4,
                elevation: isRecipeFavorite ? 6 : 2
              }]}
              onPress={toggleFavorite}
              activeOpacity={0.7}
            >
              <Text style={[styles.favoriteIcon, { 
                color: isRecipeFavorite ? '#fff' : regionColor,
                fontSize: 20
              }]}>
                {isRecipeFavorite ? '💖' : '🤍'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Tabs de navegación */}
        <View style={styles.tabsRow}>
          {RECIPE_TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                { backgroundColor: activeTab === tab.key ? '#fff' : '#f8f9fa' },
                activeTab === tab.key && { borderBottomColor: regionColor, borderBottomWidth: 3 }
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[
                styles.tabButtonText,
                { color: activeTab === tab.key ? regionColor : '#666' }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Contenido de tabs */}
        <View style={styles.tabContent}>
          {/* TAB INGREDIENTES */}
          {activeTab === 'ingredientes' && (
            <View style={[styles.ingredientsContainer, { backgroundColor: regionColor + '08' }]}>
              <View style={styles.sectionHeaderNew}>
                <Text style={[styles.sectionTitleNew, { color: regionColor }]}>
                  🛒 Lista de Ingredientes
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Marca lo que ya tienes y añade el resto a tu lista de compras
                </Text>
              </View>
              
              {!recipe.ingredientes || recipe.ingredientes.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No hay ingredientes disponibles para esta receta</Text>
                </View>
              ) : (
                recipe.ingredientes.map((ing: string, idx: number) => {
                const isChecked = checkedIngredients.has(idx);
                
                return (
                  <View key={ing} style={[styles.ingredientCheckRow, { backgroundColor: '#fff' }]}>
                    <TouchableOpacity 
                      style={[styles.checkboxButton, { 
                        borderColor: regionColor,
                        backgroundColor: isChecked ? regionColor : '#fff'
                      }]}
                      onPress={() => {
                        const newChecked = new Set(checkedIngredients);
                        if (isChecked) {
                          newChecked.delete(idx);
                        } else {
                          newChecked.add(idx);
                        }
                        setCheckedIngredients(newChecked);
                      }}
                    >
                      <Text style={[styles.checkboxText, { 
                        color: isChecked ? '#fff' : 'transparent'
                      }]}>
                        ✓
                      </Text>
                    </TouchableOpacity>
                    <Text style={[styles.ingredientCheckText, {
                      textDecorationLine: isChecked ? 'line-through' : 'none',
                      color: isChecked ? '#888' : '#333'
                    }]}>
                      {ing}
                    </Text>
                    <Text style={[styles.ingredientAmount, { color: regionColor }]}>
                      {getIngredientAmount()}
                    </Text>
                  </View>
                );
              })
              )}
              
              {/* Botones de acción */}
              <View style={styles.detailButtonRow}>
                <TouchableOpacity style={[styles.addListButton, { backgroundColor: regionColor }]}>
                  <Text style={styles.addListButtonText}>🛒 Agregar todos a la lista</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.pdfButton, { borderColor: regionColor }]}>
                  <Text style={[styles.pdfButtonText, { color: regionColor }]}>📄 Descargar PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* TAB PASOS */}
          {activeTab === 'pasos' && (
            <View style={[styles.stepsContainer, { backgroundColor: regionColor + '08' }]}>
              <View style={styles.sectionHeaderNew}>
                <Text style={[styles.sectionTitleNew, { color: regionColor }]}>
                  👨‍🍳 Instrucciones de Preparación
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Sigue estos pasos detallados para crear tu plato perfecto
                </Text>
              </View>
              
              {recipe.pasos?.map((paso: string, idx: number) => (
                <View key={idx} style={[styles.stepRow, { backgroundColor: '#fff' }]}>
                  <View style={[styles.stepNumber, { backgroundColor: regionColor }]}>
                    <Text style={styles.stepNumberText}>{idx + 1}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepText}>{paso}</Text>
                    <View style={styles.stepMeta}>
                      <Text style={[styles.stepTime, { color: regionColor }]}>
                        ⏱ {getStepTime(idx)} min
                      </Text>
                      <Text style={styles.stepDifficulty}>
                        {getStepDifficulty(idx)}
                      </Text>
                    </View>
                  </View>
                </View>
              )) || (
                <View style={styles.noStepsContainer}>
                  <Text style={styles.noStepsText}>Los pasos de preparación se agregarán pronto</Text>
                </View>
              )}
              
              {/* Tips adicionales */}
              <View style={[styles.tipsContainer, { borderColor: regionColor }]}>
                <Text style={[styles.tipsTitle, { color: regionColor }]}>💡 Tips del Chef</Text>
                <Text style={styles.tipsText}>
                  • Para mejores resultados, usa ingredientes frescos de temporada
                </Text>
                <Text style={styles.tipsText}>
                  • Prepara todos los ingredientes antes de comenzar
                </Text>
                <Text style={styles.tipsText}>
                  • Ajusta las especias según tu gusto personal
                </Text>
              </View>
            </View>
          )}
          
          {/* TAB VIDEO */}
          {activeTab === 'video' && (
            <View style={[styles.videoTabContainer, { backgroundColor: regionColor + '08' }]}>
              <View style={styles.sectionHeaderNew}>
                <Text style={[styles.sectionTitleNew, { color: regionColor }]}>
                  🎥 Video Tutorial
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Aprende a preparar {recipe.nombre} paso a paso
                </Text>
              </View>
              
              {/* Galería de Imágenes de Comida */}
              <View style={styles.foodGalleryContainer}>
                <Text style={[styles.sectionTitleNew, { color: regionColor }]}>
                  📸 Galería de Imágenes
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Explora visualmente cada detalle de {recipe.nombre}
                </Text>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScrollContainer}>
                  {/* Imagen del Plato Principal */}
                  <View style={[styles.galleryItem, { borderColor: regionColor }]}>
                    <Image 
                      source={getRecipeImage(recipe)}
                      style={styles.galleryMainImage}
                    />
                    <Text style={[styles.galleryLabel, { color: regionColor }]}>🍽️ Plato Principal</Text>
                  </View>
                  
                  {/* Imagen de Ingredientes */}
                  <View style={[styles.galleryItem, { borderColor: regionColor }]}>
                    <Image 
                      source={{ uri: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=300&h=200&fit=crop' }}
                      style={styles.galleryMainImage}
                    />
                    <Text style={[styles.galleryLabel, { color: regionColor }]}>🥕 Ingredientes</Text>
                  </View>
                  
                  {/* Imagen del Proceso */}
                  <View style={[styles.galleryItem, { borderColor: regionColor }]}>
                    <Image 
                      source={{ uri: 'https://images.unsplash.com/photo-1556909114-4f5c8cf8d05e?w=300&h=200&fit=crop' }}
                      style={styles.galleryMainImage}
                    />
                    <Text style={[styles.galleryLabel, { color: regionColor }]}>👨‍� Preparación</Text>
                  </View>
                  
                  {/* Imagen del Resultado */}
                  <View style={[styles.galleryItem, { borderColor: regionColor }]}>
                    <Image 
                      source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop' }}
                      style={styles.galleryMainImage}
                    />
                    <Text style={[styles.galleryLabel, { color: regionColor }]}>✨ Resultado Final</Text>
                  </View>
                </ScrollView>
              </View>

              {(() => {
                // Videos específicos por región y tipo de receta
                const videoLibrary = {
                  // Videos de Región Andina
                  1: { id: 'kpZx53kkslw', title: 'Arepas de Maíz Tradicionales', views: '15.2K', likes: '97%', duration: '8:45', chef: 'Chef María' },
                  2: { id: 'dQw4w9WgXcQ', title: 'Papa Rellena Peruana Auténtica', views: '28.5K', likes: '96%', duration: '12:30', chef: 'Chef Carlos' },
                  3: { id: 'jNQXAC9IVRw', title: 'Empanadas Andinas Caseras', views: '9.8K', likes: '94%', duration: '15:20', chef: 'Chef Ana' },
                  
                  // Videos de Región Costa
                  4: { id: 'ZZ5LpwO-An4', title: 'Ceviche Peruano Tradicional', views: '45.3K', likes: '98%', duration: '6:15', chef: 'Chef Ricardo' },
                  5: { id: 'tgbNymZ7vqY', title: 'Arroz con Mariscos Costeño', views: '32.7K', likes: '95%', duration: '18:40', chef: 'Chef Isabel' },
                  6: { id: 'hT_nvWreIhg', title: 'Pescado Frito Estilo Costa', views: '12.1K', likes: '93%', duration: '10:25', chef: 'Chef Miguel' },
                  
                  // Videos de Región Amazónica
                  7: { id: '8UVNT4wvIGY', title: 'Tacacho con Cecina Amazónico', views: '18.9K', likes: '96%', duration: '14:15', chef: 'Chef Rosa' },
                  8: { id: 'Gc2en3nHxA4', title: 'Juane de Pollo Tradicional', views: '21.4K', likes: '97%', duration: '16:30', chef: 'Chef Fernando' },
                  9: { id: '4fndeDfaWCg', title: 'Patarashca de Pescado', views: '8.7K', likes: '94%', duration: '11:50', chef: 'Chef Luisa' },
                  10: { id: 'Lrj2Hq7xqQ8', title: 'Inchicapi de Gallina', views: '13.6K', likes: '95%', duration: '19:20', chef: 'Chef Pedro' },
                  11: { id: 'M5V_IXMewls', title: 'Rocoto Relleno Arequipeño', views: '25.8K', likes: '98%', duration: '13:45', chef: 'Chef Carmen' },
                  
                  // Videos de Región Pampa
                  12: { id: 'BaW_jenozKc', title: 'Asado de Tira Argentino', views: '38.2K', likes: '97%', duration: '22:15', chef: 'Chef Eduardo' },
                  13: { id: 'fJ9rUzIMcZQ', title: 'Empanadas de Carne Jugosas', views: '29.3K', likes: '96%', duration: '17:30', chef: 'Chef Mónica' },
                  14: { id: 'dQw4w9WgXcQ', title: 'Locro de Zapallo Cremoso', views: '16.7K', likes: '94%', duration: '14:40', chef: 'Chef Alberto' },
                  
                  // Videos de Región Altiplano
                  15: { id: 'jNQXAC9IVRw', title: 'Chairo Paceño Tradicional', views: '11.9K', likes: '95%', duration: '20:10', chef: 'Chef Elena' },
                  16: { id: 'ZZ5LpwO-An4', title: 'Charquekan Potosino', views: '8.4K', likes: '93%', duration: '16:25', chef: 'Chef Raúl' },
                  17: { id: 'tgbNymZ7vqY', title: 'Jaka Lawa de Quinua', views: '7.2K', likes: '96%', duration: '12:55', chef: 'Chef Sandra' }
                };
                
                const videoData = videoLibrary[recipe.id] || videoLibrary[1];
                const thumbnail = `https://img.youtube.com/vi/${videoData.id}/maxresdefault.jpg`;
                
                return (
                  <View>
                    {/* Video Principal con Marco Atractivo */}
                    <View style={[styles.videoContainer, { backgroundColor: '#fff' }]}>
                      <View style={[styles.videoFrame, { borderColor: regionColor }]}>
                        <TouchableOpacity
                          style={styles.videoThumbnailContainer}
                          onPress={() => {
                            const url = `https://www.youtube.com/watch?v=${videoData.id}`;
                            Linking.openURL(url).catch(err => console.error('Error al abrir video:', err));
                          }}
                        >
                          <View style={styles.videoWrapper}>
                            <Image source={{ uri: thumbnail }} style={styles.videoThumbnail} />
                            <View style={styles.playButtonOverlay}>
                              <View style={[styles.playButtonCircle, { backgroundColor: regionColor }]}>
                                <Text style={styles.playButton}>▶️</Text>
                              </View>
                            </View>
                            <View style={styles.videoDurationBadge}>
                              <Text style={styles.videoDurationText}>{videoData.duration}</Text>
                            </View>
                            {/* Efecto de Brillo */}
                            <View style={styles.videoShineEffect}></View>
                          </View>
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.videoInfo}>
                        <Text style={styles.videoTitle}>
                          {videoData.title}
                        </Text>
                        <View style={styles.chefInfo}>
                          <Text style={[styles.chefName, { color: regionColor }]}>👨‍🍳 {videoData.chef}</Text>
                          <Text style={styles.uploadDate}>• Hace 2 días</Text>
                        </View>
                        <Text style={styles.videoDescription}>
                          Video paso a paso para preparar esta deliciosa receta tradicional de {recipe.region}. 
                          Aprende los secretos y técnicas tradicionales que han pasado de generación en generación.
                        </Text>
                        <View style={styles.videoStats}>
                          <Text style={[styles.videoStat, { color: regionColor }]}>👀 {videoData.views} vistas</Text>
                          <Text style={[styles.videoStat, { color: regionColor }]}>👍 {videoData.likes} likes</Text>
                          <Text style={[styles.videoStat, { color: regionColor }]}>⏱️ {videoData.duration}</Text>
                        </View>
                        
                        {/* Botones de Acción */}
                        <View style={styles.videoActions}>
                          <TouchableOpacity style={[styles.actionButton, { backgroundColor: regionColor + '15' }]}>
                            <Text style={[styles.actionButtonText, { color: regionColor }]}>👍 Me gusta</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.actionButton, { backgroundColor: regionColor + '15' }]}>
                            <Text style={[styles.actionButtonText, { color: regionColor }]}>💾 Guardar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.actionButton, { backgroundColor: regionColor + '15' }]}>
                            <Text style={[styles.actionButtonText, { color: regionColor }]}>📤 Compartir</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    
                    {/* Galería de Imágenes de Comida */}
                    <View style={styles.foodGallerySection}>
                      <Text style={[styles.sectionTitleNew, { color: regionColor }]}>
                        📸 Galería de Imágenes
                      </Text>
                      <Text style={styles.sectionSubtitle}>
                        Explora visualmente cada paso y resultado
                      </Text>
                      
                      <View style={styles.foodGalleryGrid}>
                        {/* Fila 1 */}
                        <View style={styles.galleryRow}>
                          <TouchableOpacity style={[styles.foodGalleryItem, { borderColor: regionColor + '40' }]}>
                            <Image 
                              source={getRecipeImage(recipe)}
                              style={styles.foodGalleryImage}
                            />
                            <View style={[styles.imageOverlay, { backgroundColor: regionColor + '90' }]}>
                              <Text style={styles.imageOverlayText}>Plato Terminado</Text>
                            </View>
                          </TouchableOpacity>
                          
                          <TouchableOpacity style={[styles.foodGalleryItem, { borderColor: regionColor + '40' }]}>
                            <Image 
                              source={{ uri: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=300&h=200&fit=crop' }}
                              style={styles.foodGalleryImage}
                            />
                            <View style={[styles.imageOverlay, { backgroundColor: regionColor + '90' }]}>
                              <Text style={styles.imageOverlayText}>Ingredientes Frescos</Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                        
                        {/* Fila 2 */}
                        <View style={styles.galleryRow}>
                          <TouchableOpacity style={[styles.foodGalleryItem, { borderColor: regionColor + '40' }]}>
                            <Image 
                              source={{ uri: 'https://images.unsplash.com/photo-1556909114-4f5c8cf8d05e?w=300&h=200&fit=crop' }}
                              style={styles.foodGalleryImage}
                            />
                            <View style={[styles.imageOverlay, { backgroundColor: regionColor + '90' }]}>
                              <Text style={styles.imageOverlayText}>Proceso de Cocción</Text>
                            </View>
                          </TouchableOpacity>
                          
                          <TouchableOpacity style={[styles.foodGalleryItem, { borderColor: regionColor + '40' }]}>
                            <Image 
                              source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop' }}
                              style={styles.foodGalleryImage}
                            />
                            <View style={[styles.imageOverlay, { backgroundColor: regionColor + '90' }]}>
                              <Text style={styles.imageOverlayText}>Presentación Final</Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                        
                        {/* Fila 3 - Panorámica */}
                        <TouchableOpacity style={[styles.foodGalleryItemWide, { borderColor: regionColor + '40' }]}>
                          <Image 
                            source={{ uri: 'https://images.unsplash.com/photo-1574781330855-d0db3293032e?w=600&h=250&fit=crop' }}
                            style={styles.foodGalleryImageWide}
                          />
                          <View style={[styles.imageOverlay, { backgroundColor: regionColor + '90' }]}>
                            <Text style={styles.imageOverlayText}>Vista Panorámica de la Mesa</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })()}
            </View>
          )}
          
          {/* TAB NUTRICIÓN */}
          {activeTab === 'nutricion' && (
            <View style={[styles.nutritionContainer, { backgroundColor: regionColor + '08' }]}>
              <View style={styles.sectionHeaderNew}>
                <Text style={[styles.sectionTitleNew, { color: regionColor }]}>
                  📊 Información Nutricional
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Valores nutricionales aproximados por porción
                </Text>
              </View>
              
              {/* Tarjetas principales de macronutrientes */}
              <View style={styles.nutritionGrid}>
                <View style={[styles.nutritionCardMain, { borderTopColor: regionColor }]}>
                  <View style={[styles.nutritionIconContainer, { backgroundColor: regionColor + '20' }]}>
                    <Text style={styles.nutritionEmoji}>🔥</Text>
                  </View>
                  <Text style={[styles.nutritionNumber, { color: regionColor }]}>
                    {recipe.nutricion?.calorias || 520}
                  </Text>
                  <Text style={styles.nutritionLabelNew}>Calorías</Text>
                  <Text style={styles.nutritionUnitNew}>kcal</Text>
                </View>
                
                <View style={[styles.nutritionCardMain, { borderTopColor: '#E11D48' }]}>
                  <View style={[styles.nutritionIconContainer, { backgroundColor: '#E11D4820' }]}>
                    <Text style={styles.nutritionEmoji}>🥩</Text>
                  </View>
                  <Text style={[styles.nutritionNumber, { color: '#E11D48' }]}>
                    {recipe.nutricion?.proteinas || 42}
                  </Text>
                  <Text style={styles.nutritionLabelNew}>Proteínas</Text>
                  <Text style={styles.nutritionUnitNew}>gramos</Text>
                </View>
                
                <View style={[styles.nutritionCardMain, { borderTopColor: '#F59E0B' }]}>
                  <View style={[styles.nutritionIconContainer, { backgroundColor: '#F59E0B20' }]}>
                    <Text style={styles.nutritionEmoji}>🍞</Text>
                  </View>
                  <Text style={[styles.nutritionNumber, { color: '#F59E0B' }]}>
                    {recipe.nutricion?.carbohidratos || 12}
                  </Text>
                  <Text style={styles.nutritionLabelNew}>Carbohidratos</Text>
                  <Text style={styles.nutritionUnitNew}>gramos</Text>
                </View>
                
                <View style={[styles.nutritionCardMain, { borderTopColor: '#10B981' }]}>
                  <View style={[styles.nutritionIconContainer, { backgroundColor: '#10B98120' }]}>
                    <Text style={styles.nutritionEmoji}>🥑</Text>
                  </View>
                  <Text style={[styles.nutritionNumber, { color: '#10B981' }]}>
                    {recipe.nutricion?.grasas || 38}
                  </Text>
                  <Text style={styles.nutritionLabelNew}>Grasas</Text>
                  <Text style={styles.nutritionUnitNew}>gramos</Text>
                </View>
              </View>

              {/* Información detallada */}
              <View style={[styles.nutritionDetailCard, { backgroundColor: '#fff', borderColor: regionColor }]}>
                <Text style={[styles.nutritionDetailTitleNew, { color: regionColor }]}>
                  Información Detallada
                </Text>
                
                <View style={styles.nutritionDetailGrid}>
                  <View style={styles.nutritionDetailItemNew}>
                    <Text style={styles.nutritionDetailLabelNew}>Fibra dietética</Text>
                    <Text style={[styles.nutritionDetailValueNew, { color: regionColor }]}>
                      {recipe.nutricion?.fibra || 2}g
                    </Text>
                  </View>
                  
                  <View style={styles.nutritionDetailItemNew}>
                    <Text style={styles.nutritionDetailLabelNew}>Sodio</Text>
                    <Text style={[styles.nutritionDetailValueNew, { color: regionColor }]}>
                      {Math.round((recipe.nutricion?.calorias || 520) * 1.3)}mg
                    </Text>
                  </View>
                  
                  <View style={styles.nutritionDetailItemNew}>
                    <Text style={styles.nutritionDetailLabelNew}>Azúcares</Text>
                    <Text style={[styles.nutritionDetailValueNew, { color: regionColor }]}>
                      {Math.round((recipe.nutricion?.carbohidratos || 12) * 0.25)}g
                    </Text>
                  </View>
                  
                  <View style={styles.nutritionDetailItemNew}>
                    <Text style={styles.nutritionDetailLabelNew}>Colesterol</Text>
                    <Text style={[styles.nutritionDetailValueNew, { color: regionColor }]}>
                      {Math.round((recipe.nutricion?.grasas || 38) * 1.8)}mg
                    </Text>
                  </View>
                </View>
              </View>

              {/* Vitaminas y minerales */}
              <View style={[styles.vitaminCard, { backgroundColor: '#fff', borderColor: regionColor }]}>
                <Text style={[styles.vitaminTitleNew, { color: regionColor }]}>
                  🌟 Vitaminas y Minerales Destacados
                </Text>
                
                <View style={styles.vitaminList}>
                  <View style={styles.vitaminItemNew}>
                    <Text style={styles.vitaminIcon}>🟠</Text>
                    <Text style={styles.vitaminName}>Vitamina A</Text>
                    <Text style={[styles.vitaminPercentage, { color: regionColor }]}>25%</Text>
                  </View>
                  
                  <View style={styles.vitaminItemNew}>
                    <Text style={styles.vitaminIcon}>🟡</Text>
                    <Text style={styles.vitaminName}>Vitamina C</Text>
                    <Text style={[styles.vitaminPercentage, { color: regionColor }]}>15%</Text>
                  </View>
                  
                  <View style={styles.vitaminItemNew}>
                    <Text style={styles.vitaminIcon}>🔴</Text>
                    <Text style={styles.vitaminName}>Hierro</Text>
                    <Text style={[styles.vitaminPercentage, { color: regionColor }]}>20%</Text>
                  </View>
                  
                  <View style={styles.vitaminItemNew}>
                    <Text style={styles.vitaminIcon}>⚪</Text>
                    <Text style={styles.vitaminName}>Calcio</Text>
                    <Text style={[styles.vitaminPercentage, { color: regionColor }]}>18%</Text>
                  </View>
                </View>
                
                <Text style={styles.vitaminNote}>
                  * Porcentajes basados en una dieta de 2000 calorías diarias
                </Text>
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.detailBottomSpace} />
      </ScrollView>
    );
  };

  const renderScreen = () => {
    switch (nav) {
      case 'inicio':
        // Si no está logueado, mostrar el componente de login
        if (!isLoggedIn) {
          return <SimpleLogin onLogin={handleLogin} />;
        }
        
        if (selectedRecipe) {
          return renderRecipeDetail(selectedRecipe);
        }
        return (
          <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Recetas Típicas</Text>
              <Text style={styles.subtitle}>{region === 'Todas' ? 'Todas las regiones' : region}</Text>
            </View>

            {/* Search Bar mejorado */}
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre, región o ingrediente"
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.filterButton}>
                <Text style={{ fontSize: 20 }}>⚲</Text>
              </TouchableOpacity>
            </View>

            {/* Búsquedas recientes */}
            {ultimasBusquedas.length > 0 && searchQuery.length === 0 && (
              <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 }}>
                  Búsquedas recientes:
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {ultimasBusquedas.map((busqueda, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={{
                        backgroundColor: '#e3f2fd',
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        marginRight: 8,
                        borderWidth: 1,
                        borderColor: '#1976d2'
                      }}
                      onPress={() => setSearchQuery(busqueda)}
                    >
                      <Text style={{ fontSize: 13, color: '#1976d2', fontWeight: '500' }}>🔍 {busqueda}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Resultados de búsqueda en tiempo real */}
            {busquedaRecetas && (
              <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 }}>
                  {recetasFiltradas.length} resultado{recetasFiltradas.length !== 1 ? 's' : ''} encontrado{recetasFiltradas.length !== 1 ? 's' : ''}
                </Text>
                {recetasFiltradas.length === 0 ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 8 }}>
                      🔍 No se encontraron recetas
                    </Text>
                    <Text style={{ fontSize: 14, color: '#888', textAlign: 'center' }}>
                      Intenta con otros términos
                    </Text>
                  </View>
                ) : (
                  recetasFiltradas.slice(0, 5).map(r => (
                    <TouchableOpacity 
                      key={r.id} 
                      onPress={() => { setSelectedRecipe(r); setActiveTab('ingredientes'); }}
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 8,
                        borderWidth: 1,
                        borderColor: '#e0e0e0',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: 2
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image source={getRecipeImage(r)} style={{ width: 50, height: 50, borderRadius: 8, marginRight: 12 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 2 }}>
                            {r.nombre}
                          </Text>
                          <Text style={{ fontSize: 12, color: '#666' }}>
                            📍 {r.region}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={{
                            padding: 6,
                            borderRadius: 12,
                            backgroundColor: favoritos.some(f => f.id === r.id) ? '#ffebee' : '#f5f5f5',
                          }}
                          onPress={() => toggleFavoriteWithRecipe(r)}
                        >
                          <Text style={{ 
                            fontSize: 16,
                            color: favoritos.some(f => f.id === r.id) ? '#e91e63' : '#bbb'
                          }}>
                            {favoritos.some(f => f.id === r.id) ? '❤️' : '🤍'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
                {recetasFiltradas.length > 5 && (
                  <TouchableOpacity 
                    style={{ 
                      backgroundColor: '#1976d2', 
                      borderRadius: 8, 
                      padding: 12, 
                      alignItems: 'center', 
                      marginTop: 8 
                    }}
                    onPress={() => setNav('buscar')}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>
                      Ver todos los {recetasFiltradas.length} resultados
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Solo mostrar ingredientes y filtros si no hay búsqueda activa */}
            {!busquedaRecetas && (
              <>
                {/* Ingredientes */}
                <Text style={styles.sectionLabel}>Ingredientes a incluir</Text>
                <View style={styles.ingredientRow}>
                  {includedIngredients.map((ing, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.ingredientTag}
                      onPress={() => {
                        setIncludedIngredients(includedIngredients.filter((_, i) => i !== index));
                      }}
                    >
                      <Text style={styles.ingredientText}>{ing} ✕</Text>
                    </TouchableOpacity>
                  ))}
                  <TextInput 
                    style={styles.ingredientInput} 
                    placeholder="Añadir ingrediente y Enter" 
                    placeholderTextColor="#888"
                    value={ingredientInput}
                    onChangeText={setIngredientInput}
                    onSubmitEditing={() => {
                      if (ingredientInput.trim()) {
                        setIncludedIngredients([...includedIngredients, ingredientInput.trim()]);
                        setIngredientInput('');
                      }
                    }}
                    returnKeyType="done"
                  />
                </View>

                {/* Filtros región con scroll horizontal */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionScroll} contentContainerStyle={{ paddingHorizontal: 10 }}>
                  <View style={styles.regionRow}>
                    {REGIONES.map(r => (
                      <TouchableOpacity
                        key={r}
                        style={[
                          region === r ? styles.regionButtonActive : styles.regionButton,
                          { borderColor: getColorRegion(r), borderWidth: 2 },
                          region === r && { backgroundColor: getColorRegion(r) }
                        ]}
                        onPress={() => setRegion(r)}
                      >
                        <Text style={[
                          styles.regionButtonText,
                          region === r && { color: '#fff' }
                        ]}>{r}{region === r ? ' ✓' : ''}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </>
            )}

            {/* Solo mostrar destacados si no hay búsqueda activa */}
            {!busquedaRecetas && (
              <>
                {/* Destacados dinámicos */}
                <Text style={styles.sectionTitle}>★ Destacados</Text>
            {recetasDestacadas.length > 0 ? (
              recetasDestacadas.map(r => (
                <TouchableOpacity key={r.id} onPress={() => { setSelectedRecipe(r); setActiveTab('ingredientes'); }}>
                  <View style={[styles.recipeCard, { borderLeftColor: getColorRegion(r.region), borderLeftWidth: 4 }]}>
                    <Image source={getRecipeImage(r)} style={styles.recipeImage} />
                    <View style={styles.recipeContent}>
                      <Text style={styles.recipeTitle}>{r.nombre}</Text>
                      <View style={styles.recipeInfoRow}>
                        <Text style={[styles.recipeTag, { backgroundColor: getColorRegion(r.region) }]}>{r.region}</Text>
                        <Text style={styles.recipeInfo}>★ 4.8</Text>
                        <Text style={styles.recipeInfo}>⏱ 35m</Text>
                        <Text style={styles.recipeInfo}>Fácil</Text>
                        {/* Botón de favoritos en destacados */}
                        <TouchableOpacity
                          style={{
                            padding: 4,
                            borderRadius: 12,
                            backgroundColor: favoritos.some(f => f.id === r.id) ? '#ffebee' : '#f5f5f5',
                            marginLeft: 'auto'
                          }}
                          onPress={() => toggleFavoriteWithRecipe(r)}
                        >
                          <Text style={{ 
                            fontSize: 16,
                            color: favoritos.some(f => f.id === r.id) ? '#e91e63' : '#bbb'
                          }}>
                            {favoritos.some(f => f.id === r.id) ? '❤️' : '🤍'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.recipeInfoRow}>
                        <Text style={styles.recipeInfo}>Desayuno</Text>
                        <Text style={styles.recipeInfo}>Sin gluten</Text>
                        <TouchableOpacity style={[styles.recipeButton, { backgroundColor: getColorRegion(r.region), borderRadius: 8 }]}>
                          <Text style={styles.recipeButtonText}>Ver receta</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
                  🔄 Generando recomendaciones...
                </Text>
              </View>
            )}

            {/* Todas las recetas */}
            <Text style={styles.sectionTitle}>🍳 Todas las recetas</Text>
            {recetasFiltradas.map(r => (
              <TouchableOpacity key={r.id} onPress={() => { setSelectedRecipe(r); setActiveTab('ingredientes'); }}>
                <View style={[styles.recipeCard, { borderLeftColor: getColorRegion(r.region), borderLeftWidth: 4 }]}>
                  <Image source={getRecipeImage(r)} style={styles.recipeImage} />
                  <View style={styles.recipeContent}>
                    <Text style={styles.recipeTitle}>{r.nombre}</Text>
                    <View style={styles.recipeInfoRow}>
                      <Text style={[styles.recipeTag, { backgroundColor: getColorRegion(r.region) }]}>{r.region}</Text>
                      <Text style={styles.recipeInfo}>★ 4.8</Text>
                      <Text style={styles.recipeInfo}>⏱ 35m</Text>
                      <Text style={styles.recipeInfo}>Fácil</Text>
                    </View>
                    <View style={styles.recipeInfoRow}>
                      <Text style={styles.recipeInfo}>Desayuno</Text>
                      <Text style={styles.recipeInfo}>Sin gluten</Text>
                      <TouchableOpacity style={[styles.recipeButton, { backgroundColor: getColorRegion(r.region) }]}><Text style={styles.recipeButtonText}>Ver receta</Text></TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
              </>
            )}
          </ScrollView>
        );
      case 'buscar':
        return (
          <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Recetas Típicas</Text>
              <Text style={styles.subtitle}>Todas las regiones</Text>
            </View>

            {/* Search Bar mejorado */}
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Busca recetas, ingredientes o técnicas"
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.filterButton}>
                <Text style={{ fontSize: 20 }}>⚲</Text>
              </TouchableOpacity>
            </View>

            {/* Ingredientes sugeridos */}
            {searchQuery.length > 0 && (
              <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Ingredientes sugeridos:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {ingredientesSugeridos
                    .filter(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()))
                    .slice(0, 8)
                    .map((ing, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={{
                        backgroundColor: '#e3f2fd',
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        marginRight: 8,
                        borderWidth: 1,
                        borderColor: '#2196f3'
                      }}
                      onPress={() => setSearchQuery(ing)}
                    >
                      <Text style={{ fontSize: 14, color: '#1976d2', fontWeight: '500' }}>{ing}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Resultados de búsqueda en tiempo real */}
            {searchQuery.length > 0 && (
              <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 }}>
                  {recetasFiltradas.length} resultado{recetasFiltradas.length !== 1 ? 's' : ''} encontrado{recetasFiltradas.length !== 1 ? 's' : ''}
                </Text>
                {recetasFiltradas.map(r => (
                  <TouchableOpacity 
                    key={r.id} 
                    onPress={() => { setSelectedRecipe(r); setActiveTab('ingredientes'); }}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: '#e0e0e0',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Image source={getRecipeImage(r)} style={{ width: 60, height: 60, borderRadius: 8, marginRight: 12 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 2 }}>
                          {r.nombre}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                          📍 {r.region}
                        </Text>
                        <Text 
                          style={{ fontSize: 12, color: '#888' }}
                          numberOfLines={2}
                        >
                          {r.descripcion}
                        </Text>
                      </View>
                      {/* Botón de favoritos en búsqueda - SIMPLIFICADO */}
                      <TouchableOpacity
                        style={{
                          padding: 12,
                          borderRadius: 20,
                          backgroundColor: favoritos.some(f => f.id === r.id) ? '#ffebee' : '#f5f5f5',
                          marginLeft: 8,
                          minWidth: 44,
                          minHeight: 44,
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onPress={() => {
                          console.log('🔥 BOTÓN PRESIONADO para:', r.nombre);
                          toggleFavoriteWithRecipe(r);
                        }}
                      >
                        <Text style={{ 
                          fontSize: 20,
                          color: favoritos.some(f => f.id === r.id) ? '#e91e63' : '#bbb'
                        }}>
                          {favoritos.some(f => f.id === r.id) ? '❤️' : '🤍'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Ingredientes a incluir mejorado */}
            <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
              <Text style={styles.sectionLabel}>Ingredientes a incluir</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                {includedIngredients.map((ing, idx) => (
                  <View key={idx} style={{ 
                    backgroundColor: '#e8f5e8', 
                    borderRadius: 16, 
                    paddingHorizontal: 12, 
                    paddingVertical: 6, 
                    marginRight: 8, 
                    marginBottom: 4, 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#4caf50'
                  }}>
                    <Text style={{ fontSize: 15, color: '#2e7d32', marginRight: 4, fontWeight: '500' }}>{ing}</Text>
                    <TouchableOpacity onPress={() => {
                      const newArr = [...includedIngredients];
                      newArr.splice(idx, 1);
                      setIncludedIngredients(newArr);
                    }}>
                      <Text style={{ fontSize: 16, color: '#2e7d32' }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              
              {/* Input con sugerencias */}
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={[styles.ingredientInput, { 
                    borderColor: '#4caf50',
                    borderWidth: 1,
                    backgroundColor: '#f9f9f9'
                  }]}
                  placeholder="Escribe para ver sugerencias..."
                  placeholderTextColor="#888"
                  value={ingredientInput}
                  onChangeText={setIngredientInput}
                  onSubmitEditing={() => {
                    if (ingredientInput.trim() && !includedIngredients.includes(ingredientInput.trim())) {
                      setIncludedIngredients([...includedIngredients, ingredientInput.trim()]);
                      setIngredientInput('');
                    }
                  }}
                  returnKeyType="done"
                />
                
                {/* Sugerencias de ingredientes */}
                {ingredientInput.length > 0 && (
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={{ marginTop: 8 }}
                  >
                    {ingredientesSugeridos
                      .filter(ing => 
                        ing.toLowerCase().includes(ingredientInput.toLowerCase()) && 
                        !includedIngredients.includes(ing)
                      )
                      .slice(0, 6)
                      .map((ing, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={{
                          backgroundColor: '#fff',
                          borderRadius: 12,
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          marginRight: 8,
                          borderWidth: 1,
                          borderColor: '#4caf50',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.1,
                          shadowRadius: 2,
                          elevation: 1
                        }}
                        onPress={() => {
                          if (!includedIngredients.includes(ing)) {
                            setIncludedIngredients([...includedIngredients, ing]);
                            setIngredientInput('');
                          }
                        }}
                      >
                        <Text style={{ fontSize: 14, color: '#2e7d32', fontWeight: '500' }}>+ {ing}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>

            {/* Ingredientes a excluir */}
            <Text style={styles.sectionLabel}>Excluir ingredientes</Text>
            <TextInput style={styles.ingredientInput} placeholder="Añadir ingrediente y Enter" placeholderTextColor="#888" />

            {/* Filtros región con scroll horizontal */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionScroll} contentContainerStyle={{ paddingHorizontal: 10 }}>
              <View style={styles.regionRow}>
                {REGIONES.map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      region === r ? styles.regionButtonActive : styles.regionButton,
                      { borderColor: getColorRegion(r), borderWidth: 2 },
                      region === r && { backgroundColor: getColorRegion(r) }
                    ]}
                    onPress={() => setRegion(r)}
                  >
                    <Text style={[
                      styles.regionButtonText,
                      region === r && { color: '#fff' }
                    ]}>{r}{region === r ? ' ✓' : ''}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Lista de recetas filtradas */}
            <Text style={styles.sectionTitle}>🍳 Todas las recetas</Text>
            {recetasFiltradas.map(r => (
              <TouchableOpacity key={r.id} onPress={() => { setSelectedRecipe(r); setActiveTab('ingredientes'); }}>
                <View style={[styles.recipeCard, { borderLeftColor: getColorRegion(r.region), borderLeftWidth: 4 }]}> 
                  <Image source={getRecipeImage(r)} style={styles.recipeImage} />
                  <View style={styles.recipeContent}>
                    <Text style={styles.recipeTitle}>{r.nombre}</Text>
                    <View style={styles.recipeInfoRow}>
                      <Text style={[styles.recipeTag, { backgroundColor: getColorRegion(r.region) }]}>{r.region}</Text>
                      <Text style={styles.recipeInfo}>★ 4.8</Text>
                      <Text style={styles.recipeInfo}>⏱ 35m</Text>
                      <Text style={styles.recipeInfo}>Fácil</Text>
                    </View>
                    <View style={styles.recipeInfoRow}>
                      <Text style={styles.recipeInfo}>Desayuno</Text>
                      <Text style={styles.recipeInfo}>Sin gluten</Text>
                      <TouchableOpacity style={[styles.recipeButton, { backgroundColor: getColorRegion(r.region), borderRadius: 8 }]}><Text style={styles.recipeButtonText}>Ver receta</Text></TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        );
      case 'camara':
        return (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
            <View style={styles.header}>
              <Text style={styles.title}>🔍 Reconocer Ingredientes</Text>
              <Text style={styles.subtitle}>Usa la cámara o sube una imagen</Text>
            </View>
            <View style={styles.cameraSection}>
              {/* Detector de Ingredientes AI */}
              <View style={{ margin: 16, backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#eee', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 }}>
                
                {/* Header con badge Beta */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>📷 Detector de Ingredientes</Text>
                  <View style={{ backgroundColor: '#ff6a00', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>AI BETA</Text>
                  </View>
                </View>

                {/* Área de imagen/cámara */}
                <TouchableOpacity
                  onPress={handleImageAnalysis}
                  disabled={analysisLoading}
                  style={{ 
                    backgroundColor: analysisLoading ? '#f0f0f0' : '#f8f9fa', 
                    borderRadius: 16, 
                    height: 200, 
                    marginBottom: 20,
                    borderWidth: 2,
                    borderColor: analysisLoading ? '#ddd' : '#e9ecef',
                    borderStyle: 'dashed',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {analysisLoading ? (
                    <>
                      <ActivityIndicator size="large" color="#ff6a00" />
                      <Text style={{ color: '#666', fontSize: 16, fontWeight: '500', marginTop: 8 }}>Analizando imagen...</Text>
                    </>
                  ) : (
                    <>
                      <Text style={{ fontSize: 48, marginBottom: 8 }}>📸</Text>
                      <Text style={{ color: '#666', fontSize: 16, fontWeight: '500', marginBottom: 4 }}>Toca para tomar foto</Text>
                      <Text style={{ color: '#999', fontSize: 14 }}>o arrastra una imagen aquí</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Botones de acción */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                  <TouchableOpacity 
                    onPress={handleImageAnalysis}
                    disabled={analysisLoading}
                    style={{
                      flex: 1,
                      backgroundColor: analysisLoading ? '#ccc' : '#ff6a00',
                      borderRadius: 12,
                      padding: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Text style={{ color: '#fff', marginRight: 8, fontSize: 20 }}>📷</Text>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                      {analysisLoading ? 'Analizando...' : 'Cámara'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={handleImageAnalysis}
                    disabled={analysisLoading}
                    style={{
                      flex: 1,
                      backgroundColor: analysisLoading ? '#ccc' : '#6c757d',
                      borderRadius: 12,
                      padding: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Text style={{ color: '#fff', marginRight: 8, fontSize: 20 }}>🖼️</Text>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Galería</Text>
                  </TouchableOpacity>
                </View>

                {/* Resultado del análisis */}
                {detectedIngredients.length > 0 && (
                  <View style={{ backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#28a745' }}>
                    <Text style={{ fontWeight: 'bold', color: '#333', fontSize: 16, marginBottom: 8 }}>✨ Ingredientes detectados:</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                      {detectedIngredients.map((ingrediente, idx) => (
                        <TouchableOpacity key={idx} style={{ 
                          backgroundColor: '#28a745', 
                          paddingHorizontal: 12, 
                          paddingVertical: 6, 
                          borderRadius: 20,
                          flexDirection: 'row',
                          alignItems: 'center'
                        }}>
                          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14, marginRight: 4 }}>
                            {ingrediente.name}
                          </Text>
                          <Text style={{ color: '#fff', fontSize: 12 }}>
                            {Math.round((ingrediente.confidence || 0.95) * 100)}%
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text style={{ color: '#666', fontSize: 13 }}>
                      Análisis completado • {detectedIngredients.length} ingredientes detectados
                    </Text>
                  </View>
                )}
              </View>
              {/* Sección de recetas sugeridas */}
              {suggestedRecipes.length > 0 && (
                <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 }}>
                    🍳 Recetas sugeridas ({suggestedRecipes.length}):
                  </Text>
                  
                  {suggestedRecipes.slice(0, 3).map((receta, idx) => (
                    <TouchableOpacity key={idx} style={{
                      backgroundColor: '#fff',
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: '#eee',
                      elevation: 2,
                      shadowColor: '#000',
                      shadowOpacity: 0.05,
                      shadowRadius: 4
                    }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 }}>
                          {receta.title || `Receta ${idx + 1}`}
                        </Text>
                        <View style={{ backgroundColor: '#e8f5e8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                          <Text style={{ color: '#28a745', fontSize: 12, fontWeight: 'bold' }}>
                            {receta.matchPercentage || '85'}%
                          </Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#666', fontSize: 14 }}>
                          📝 {receta.ingredients?.length || 4} ingredientes
                        </Text>
                        <Text style={{ color: '#666', fontSize: 14 }}>
                          ⏱️ {receta.prep_time || 15} min
                        </Text>
                        <Text style={{ color: '#666', fontSize: 14 }}>
                          🎯 {receta.difficulty || 'Fácil'}
                        </Text>
                      </View>
                      {receta.description && (
                        <Text style={{ color: '#888', fontSize: 13, marginTop: 8 }}>
                          {receta.description.substring(0, 100)}...
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Historial de análisis recientes */}
              <View style={{ marginHorizontal: 16, marginBottom: 40 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 }}>📋 Análisis recientes:</Text>
                <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#eee' }}>
                  {analysisHistory.length > 0 ? (
                    analysisHistory.map((analisis, idx) => (
                      <TouchableOpacity key={idx} style={{ 
                        flexDirection: 'row', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        paddingVertical: 12,
                        borderBottomWidth: idx < analysisHistory.length - 1 ? 1 : 0,
                        borderBottomColor: '#f0f0f0'
                      }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: '#666', fontSize: 12, marginBottom: 2 }}>
                            {new Date(analisis.created).toLocaleDateString('es-ES', { 
                              weekday: 'short', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Text>
                          <Text style={{ color: '#333', fontSize: 14, fontWeight: '500' }}>
                            {analisis.detected_ingredients?.join(', ') || 'Sin ingredientes'}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{ color: '#ff6a00', fontSize: 12, fontWeight: 'bold' }}>
                            {analisis.suggested_recipes?.length || 0} recetas
                          </Text>
                          <Text style={{ color: '#999', fontSize: 12 }}>→</Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                      <Text style={{ color: '#666', fontSize: 14 }}>No hay análisis previos</Text>
                      <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                        Analiza tu primera imagen para comenzar
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: 24 }}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 14, borderWidth: 1, borderColor: '#eee', marginRight: 8 }}>
                  <Text style={{ color: '#222', fontWeight: 'bold', textAlign: 'center' }}>� Compartir</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 14, borderWidth: 1, borderColor: '#eee' }}>
                  <Text style={{ color: '#222', fontWeight: 'bold', textAlign: 'center' }}>Limpiar marcados</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        );
      case 'lista':
        return (
          <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
            <View style={styles.header}>
              <Text style={styles.title}>Lista de Compras</Text>
              <Text style={styles.subtitle}>Ingredientes organizados</Text>
            </View>
            
            {/* Agregar nuevo artículo */}
            <View style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: 16, marginBottom: 20 }}>
              <TextInput 
                style={[styles.ingredientInput, { flex: 1, backgroundColor: '#f7f7f7', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#ddd' }]} 
                placeholder="Agregar artículo" 
                placeholderTextColor="#888" 
              />
              <TouchableOpacity style={{ backgroundColor: '#ff6a00', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12, marginLeft: 8 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Añadir</Text>
              </TouchableOpacity>
            </View>

            {/* Lista de compras por categorías */}
            {[
              {
                categoria: 'Frutas y verduras',
                items: [
                  { nombre: 'Tomate', cantidad: '2 kg', checked: false },
                  { nombre: 'Cebolla', cantidad: '1 kg', checked: false },
                  { nombre: 'Limón', cantidad: '6 unidades', checked: true },
                ],
              },
              {
                categoria: 'Carnes y pescados',
                items: [
                  { nombre: 'Pollo', cantidad: '500g', checked: false },
                  { nombre: 'Pescado', cantidad: '300g', checked: false },
                ],
              },
              {
                categoria: 'Lácteos',
                items: [
                  { nombre: 'Leche', cantidad: '1 litro', checked: true },
                  { nombre: 'Queso fresco', cantidad: '200g', checked: false },
                ],
              },
            ].map(cat => (
              <View key={cat.categoria} style={{ marginTop: 20, marginHorizontal: 16 }}>
                <Text style={{ fontWeight: 'bold', color: '#333', marginBottom: 12, fontSize: 18 }}>{cat.categoria}</Text>
                {cat.items.map((item, idx) => (
                  <View key={item.nombre} style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    backgroundColor: '#fff', 
                    borderRadius: 12, 
                    borderWidth: 1, 
                    borderColor: '#eee', 
                    marginBottom: 8, 
                    padding: 16,
                    shadowColor: '#000',
                    shadowOpacity: 0.02,
                    shadowRadius: 2,
                    elevation: 1,
                  }}>
                    {/* Checkbox circular */}
                    <TouchableOpacity style={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: 12, 
                      borderWidth: 2, 
                      borderColor: item.checked ? '#ff6a00' : '#ddd', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      marginRight: 16, 
                      backgroundColor: item.checked ? '#ff6a00' : 'transparent' 
                    }}>
                      {item.checked && (
                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>✓</Text>
                      )}
                    </TouchableOpacity>
                    
                    {/* Contenido del item */}
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        fontSize: 16, 
                        color: item.checked ? '#999' : '#333', 
                        textDecorationLine: item.checked ? 'line-through' : 'none',
                        fontWeight: item.checked ? '400' : '500',
                        marginBottom: 2
                      }}>{item.nombre}</Text>
                      <Text style={{ 
                        fontSize: 14, 
                        color: item.checked ? '#bbb' : '#666'
                      }}>{item.cantidad}</Text>
                    </View>
                    
                    {/* Botones de cantidad */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity style={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: 16, 
                        backgroundColor: '#f5f5f5', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        marginHorizontal: 4
                      }}>
                        <Text style={{ color: '#ff6a00', fontSize: 18, fontWeight: 'bold' }}>−</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: 16, 
                        backgroundColor: '#f5f5f5', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        marginHorizontal: 4
                      }}>
                        <Text style={{ color: '#ff6a00', fontSize: 18, fontWeight: 'bold' }}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ))}

            {/* Botones de acción */}
            <View style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: 24, marginBottom: 20 }}>
              <TouchableOpacity style={{ 
                flex: 1, 
                backgroundColor: '#ff6a00', 
                borderRadius: 12, 
                padding: 16, 
                marginRight: 8,
                alignItems: 'center'
              }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Compartir Lista</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ 
                flex: 1, 
                backgroundColor: '#fff', 
                borderRadius: 12, 
                padding: 16, 
                borderWidth: 1, 
                borderColor: '#ddd',
                alignItems: 'center'
              }}>
                <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 16 }}>Limpiar marcados</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );
      case 'perfil':
        // Si no está logueado, mostrar el componente de login
        if (!isLoggedIn) {
          return <SimpleLogin onLogin={handleLogin} />;
        }

        // Si está logueado, mostrar el perfil completo
        return (
          <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40, backgroundColor: '#fff' }}>
            {/* Header del usuario */}
            <View style={{ backgroundColor: '#FF7F50', borderRadius: 16, padding: 20, marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 4 }}>
                    ¡Hola {currentUser?.name}! 👋
                  </Text>
                  <Text style={{ fontSize: 16, color: '#fff', opacity: 0.9 }}>
                    {currentUser?.email}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#fff', opacity: 0.8, marginTop: 8 }}>
                    🍽️ {userFavorites.length} recetas favoritas
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleLogout}
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 8 }}
                >
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Cerrar sesión</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Recetas Favoritas */}
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 22, color: '#FF6B8A', marginRight: 8 }}>💖</Text>
                <Text style={{ fontWeight: '700', fontSize: 18 }}>Mis Recetas Favoritas</Text>
              </View>
              <Text style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
                {userFavorites.length === 0 ? 'Aún no tienes recetas favoritas' : `${userFavorites.length} recetas guardadas`}
              </Text>
              
              {userFavorites.length === 0 ? (
                <View style={{ alignItems: 'center', padding: 20 }}>
                  <Text style={{ fontSize: 40, marginBottom: 10 }}>🤍</Text>
                  <Text style={{ fontSize: 16, color: '#999', textAlign: 'center' }}>
                    Explora las recetas y toca el corazón para agregarlas a favoritos
                  </Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {userFavorites.map((favorite, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: 12,
                        padding: 12,
                        marginRight: 12,
                        width: 160,
                        borderWidth: 1,
                        borderColor: '#e9ecef'
                      }}
                      onPress={() => {
                        // Buscar la receta completa y mostrarla
                        const fullRecipe = RECETAS_ACTIVAS.find(r => r.id == favorite.recipe_id || r.nombre === favorite.recipe_name);
                        if (fullRecipe) {
                          setSelectedRecipe(fullRecipe);
                          setActiveTab('ingredientes');
                        }
                      }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 }}>
                        {favorite.recipe_name}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                        📍 {favorite.recipe_region}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 20, marginRight: 4 }}>💖</Text>
                        <Text style={{ fontSize: 12, color: '#FF6B8A', fontWeight: '500' }}>
                          Favorita
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Ingredientes favoritos */}
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Text style={{ fontSize: 22, color: '#218c4a', marginRight: 8 }}>🥘</Text>
                <Text style={{ fontWeight: '700', fontSize: 18 }}>Ingredientes favoritos</Text>
              </View>
              <Text style={{ color: '#666', fontSize: 14, marginBottom: 12 }}>
                Qué ingredientes te gusta que aparezcan en las recetas
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  {INGREDIENTES_FAVORITOS.slice(0, 4).map((ing) => (
                    <View key={ing} style={{ flexDirection: 'row', backgroundColor: '#f8f9fa', borderRadius: 12, alignItems: 'center', justifyContent: 'space-between', padding: 12, marginBottom: 10, marginHorizontal: 2 }}>
                      <Text style={{ fontSize: 17, color: '#222', fontWeight: '500' }}>{ing}</Text>
                      <Switch
                        value={ingredientesFavoritos.includes(ing)}
                        onValueChange={() => toggleIngrediente(ing)}
                      />
                    </View>
                  ))}
                </View>
                <View style={{ flex: 1 }}>
                  {INGREDIENTES_FAVORITOS.slice(4).map((ing) => (
                    <View key={ing} style={{ flexDirection: 'row', backgroundColor: '#f8f9fa', borderRadius: 12, alignItems: 'center', justifyContent: 'space-between', padding: 12, marginBottom: 10, marginHorizontal: 2 }}>
                      <Text style={{ fontSize: 17, color: '#222', fontWeight: '500' }}>{ing}</Text>
                      <Switch
                        value={ingredientesFavoritos.includes(ing)}
                        onValueChange={() => toggleIngrediente(ing)}
                      />
                    </View>
                  ))}
                </View>
              </View>
              <Text style={{ fontSize: 15, color: '#888', marginBottom: 6, marginTop: 10 }}>Ingredientes seleccionados:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {ingredientesFavoritos.map(ing => (
                  <View key={ing} style={{ backgroundColor: '#c8f7d8', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6, marginRight: 6, marginBottom: 6 }}>
                    <Text style={{ color: '#218c4a', fontWeight: 'bold', fontSize: 15 }}>{ing}</Text>
                  </View>
                ))}
              </View>

              {/* Botón para guardar ingredientes favoritos */}
              <TouchableOpacity 
                style={{
                  backgroundColor: '#218c4a',
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  marginTop: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3
                }}
                onPress={saveUserPreferences}
              >
                <Text style={{ fontSize: 18, marginRight: 8 }}>💾</Text>
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
                  Guardar Ingredientes Favoritos
                </Text>
              </TouchableOpacity>
            </View>

            {/* Nivel de dificultad */}
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 18 }}>
              <Text style={{ fontWeight: '700', marginBottom: 4, fontSize: 18, color: '#333' }}>Nivel de dificultad</Text>
              <Text style={{ color: '#999', fontSize: 14, marginBottom: 20 }}>Qué tan complejas te gustan las recetas</Text>
              
              {/* Switches de dificultad */}
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
                  <Text style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>Fácil</Text>
                  <Switch
                    value={difficulty.facil}
                    onValueChange={() => toggleDifficulty('facil')}
                    trackColor={{ false: '#e0e0e0', true: '#ff6a00' }}
                    thumbColor={difficulty.facil ? '#fff' : '#f4f3f4'}
                  />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
                  <Text style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>Intermedio</Text>
                  <Switch
                    value={difficulty.intermedio}
                    onValueChange={() => toggleDifficulty('intermedio')}
                    trackColor={{ false: '#e0e0e0', true: '#ff6a00' }}
                    thumbColor={difficulty.intermedio ? '#fff' : '#f4f3f4'}
                  />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
                  <Text style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>Avanzado</Text>
                  <Switch
                    value={difficulty.avanzado}
                    onValueChange={() => toggleDifficulty('avanzado')}
                    trackColor={{ false: '#e0e0e0', true: '#ff6a00' }}
                    thumbColor={difficulty.avanzado ? '#fff' : '#f4f3f4'}
                  />
                </View>
              </View>
              
              {/* Niveles preferidos */}
              <Text style={{ color: '#999', fontSize: 14, marginTop: 16, marginBottom: 8 }}>Niveles preferidos:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {difficulty.facil && (
                  <View style={{ backgroundColor: '#e8d5ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                    <Text style={{ color: '#8b5cf6', fontWeight: '600', fontSize: 14 }}>Fácil</Text>
                  </View>
                )}
                {difficulty.intermedio && (
                  <View style={{ backgroundColor: '#e8d5ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                    <Text style={{ color: '#8b5cf6', fontWeight: '600', fontSize: 14 }}>Intermedio</Text>
                  </View>
                )}
                {difficulty.avanzado && (
                  <View style={{ backgroundColor: '#e8d5ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                    <Text style={{ color: '#8b5cf6', fontWeight: '600', fontSize: 14 }}>Avanzado</Text>
                  </View>
                )}
                {!difficulty.facil && !difficulty.intermedio && !difficulty.avanzado && (
                  <Text style={{ color: '#999', fontSize: 14 }}>Ninguno seleccionado</Text>
                )}
              </View>
            </View>

            {/* Restricciones alimentarias */}
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 18 }}>
              <Text style={{ fontWeight: '700', marginBottom: 4, fontSize: 18, color: '#333' }}>Restricciones alimentarias</Text>
              <Text style={{ color: '#999', fontSize: 14, marginBottom: 20 }}>Ingredientes o tipos de comida que prefieres evitar</Text>
              
              {/* Switches de restricciones */}
              <View style={{ gap: 12 }}>
                {RESTRICCIONES.map(restriccion => (
                  <View key={restriccion} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
                    <Text style={{ fontSize: 16, color: '#333', fontWeight: '500' }}>{restriccion}</Text>
                    <Switch
                      value={selectedRestricciones.includes(restriccion)}
                      onValueChange={() => toggleRestriccion(restriccion)}
                      trackColor={{ false: '#e0e0e0', true: '#ff6a00' }}
                      thumbColor={selectedRestricciones.includes(restriccion) ? '#fff' : '#f4f3f4'}
                    />
                  </View>
                ))}
              </View>
              
              {/* Restricciones activas */}
              <Text style={{ color: '#999', fontSize: 14, marginTop: 16, marginBottom: 8 }}>Restricciones activas:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {selectedRestricciones.length === 0 ? (
                  <Text style={{ color: '#999', fontSize: 14 }}>Ninguna</Text>
                ) : (
                  selectedRestricciones.map(r => (
                    <View key={r} style={{ backgroundColor: '#ff5252', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>{r}</Text>
                    </View>
                  ))
                )}
              </View>

              {/* Botón para guardar preferencias */}
              <TouchableOpacity 
                style={{
                  backgroundColor: '#4caf50',
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  marginTop: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3
                }}
                onPress={saveUserPreferences}
              >
                <Text style={{ fontSize: 18, marginRight: 8 }}>💾</Text>
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
                  Guardar Preferencias
                </Text>
              </TouchableOpacity>

              {/* Botón para cargar preferencias guardadas */}
              {(savedRestricciones.length > 0 || savedIngredientesFavoritos.length > 0) && (
                <TouchableOpacity 
                  style={{
                    backgroundColor: '#2196f3',
                    borderRadius: 12,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    marginTop: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onPress={loadUserPreferences}
                >
                  <Text style={{ fontSize: 16, marginRight: 8 }}>📥</Text>
                  <Text style={{ color: '#fff', fontWeight: '500', fontSize: 14 }}>
                    Cargar Últimas Preferencias
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Historial y guardados */}
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 18 }}>
              <Text style={{ fontWeight: '700', marginBottom: 8 }}>Historial y guardados</Text>
              <Text style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>Acceso rápido</Text>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, marginRight: 12 }}>♡</Text>
                  <Text>Favoritos ({userFavorites.length})</Text>
                </View>
                <Text style={{ color: '#999' }}>›</Text>
              </TouchableOpacity>
              <View style={{ height: 12 }} />
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, marginRight: 12 }}>⏱</Text>
                  <Text>Recetas vistas</Text>
                </View>
                <Text style={{ color: '#999' }}>›</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {renderScreen()}
      {/* Bottom Navigation */}
      <View style={styles.bottomNavModern}>
        {NAV_ITEMS.map(item => (
          <TouchableOpacity
            key={item.key}
            style={[styles.navItemModern, nav === item.key && styles.navItemActiveModern]}
            onPress={() => setNav(item.key as typeof nav)}
            activeOpacity={0.85}
          >
            <View style={{
              backgroundColor: nav === item.key ? '#ffecd2' : 'transparent',
              borderRadius: 24,
              padding: nav === item.key ? 8 : 6,
              marginBottom: 2,
              elevation: nav === item.key ? 4 : 0,
              shadowColor: nav === item.key ? '#ff6a00' : 'transparent',
              shadowOpacity: nav === item.key ? 0.18 : 0,
              shadowRadius: nav === item.key ? 8 : 0,
              borderWidth: nav === item.key ? 2 : 0,
              borderColor: nav === item.key ? '#ff6a00' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
            }}>
              {/* Usar emoji como fallback si MaterialIcons falla */}
              <Text style={{ 
                fontSize: nav === item.key ? 24 : 20, 
                color: nav === item.key ? '#ff6a00' : '#bbb' 
              }}>
                {item.emoji}
              </Text>
            </View>
            <Text style={[styles.navLabelModern, nav === item.key && { color: '#ff6a00', fontWeight: 'bold' }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  screenCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  screenText: { fontSize: 28, color: '#222', fontWeight: 'bold', textAlign: 'center' },

  navItemActive: { borderTopWidth: 2, borderColor: '#ff5500' },

  navItem: { alignItems: 'center', justifyContent: 'center', width: 64 },
  navLabel: { fontSize: 12, color: '#999', marginTop: 2 },

  header: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#222' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 2 },

  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 16 },
  searchInput: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButton: { marginLeft: 8, backgroundColor: '#fff', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#ddd' },

  sectionLabel: { marginLeft: 20, marginTop: 18, fontSize: 15, color: '#222', fontWeight: 'bold' },

  ingredientRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 8, marginBottom: 8 },
  ingredientTag: { backgroundColor: '#f7f7f7', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  ingredientText: { fontSize: 15, color: '#333' },
  ingredientInput: { flex: 1, fontSize: 15, paddingHorizontal: 8, paddingVertical: 6, borderWidth: 0, color: '#888' },

  regionRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 8 },
  regionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 8,
  },
  regionButtonActive: {
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 8,
  },
  regionButtonText: { fontSize: 16, color: '#222' },

  sectionTitle: { marginLeft: 20, marginTop: 18, fontSize: 19, fontWeight: 'bold', color: '#222' },

  recipeCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 18,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    padding: 0,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  recipeImage: { width: '100%', height: 160, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  recipeContent: { padding: 16 },
  recipeTitle: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 6 },
  recipeInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  recipeTag: { backgroundColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginRight: 8, fontSize: 13, color: '#ffffff', fontWeight: '600' },
  recipeInfo: { fontSize: 15, color: '#555', marginRight: 10 },
  recipeButton: { backgroundColor: '#ff5500', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 6, marginLeft: 10 },
  recipeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cameraSection: { margin: 16, backgroundColor: '#fff', borderRadius: 18, padding: 8, borderWidth: 1, borderColor: '#ddd' },
  cameraHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cameraTitle: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  cameraBeta: { backgroundColor: '#eee', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  cameraBetaText: { color: '#888', fontSize: 13 },
  cameraImageBox: { borderRadius: 12, overflow: 'hidden', marginBottom: 8 },
  cameraImage: { width: '100%', height: 160, borderRadius: 12 },
  cameraButtonRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  cameraButton: { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 12, marginHorizontal: 4, borderWidth: 1, borderColor: '#ccc' },
  cameraButtonText: { color: '#222', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  detectedLabel: { marginTop: 12, marginBottom: 4, fontSize: 15, color: '#222', fontWeight: 'bold' },
  detectedRow: { flexDirection: 'row', marginBottom: 8 },
  detectedTag: { backgroundColor: '#f7f7f7', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  detectedTagText: { fontSize: 15, color: '#333' },
  detectedButtonRow: { flexDirection: 'row', marginBottom: 8 },
  detectedSearchButton: { flex: 2, backgroundColor: '#fff', borderRadius: 8, padding: 12, marginRight: 8, borderWidth: 1, borderColor: '#eee' },
  detectedSearchText: { color: '#222', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  detectedClearButton: { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#ccc' },
  detectedClearText: { color: '#222', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  cameraAdvice: { marginTop: 8, fontSize: 14, color: '#888', textAlign: 'left' },
  recipeDetailContainer: { flex: 1, backgroundColor: '#fff' },
  detailHeader: { 
    paddingTop: 24, 
    paddingHorizontal: 20, 
    paddingBottom: 16, 
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: { 
    position: 'absolute', 
    left: 16, 
    top: 30, 
    zIndex: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  
  backButtonText: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
  },
  detailTitle: { fontSize: 22, fontWeight: 'bold', color: '#222', textAlign: 'center' },
  detailRegion: { fontSize: 15, color: '#666', textAlign: 'center', marginTop: 2 },
  detailImage: { width: '100%', height: 180, borderTopLeftRadius: 0, borderTopRightRadius: 0 },
  detailInfoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginLeft: 20 },
  detailTag: { backgroundColor: '#ffe5b4', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginRight: 8, fontSize: 13, color: '#a85' },
  detailInfo: { fontSize: 15, color: '#555', marginRight: 10 },
  detailRecipeTitle: { fontSize: 20, fontWeight: 'bold', color: '#222', marginTop: 12, marginBottom: 8 },
  
  // Estilos para favoritos y título
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  titleSection: {
    flex: 1,
    marginRight: 10,
  },
  favoriteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  tabsRow: { 
    flexDirection: 'row', 
    marginHorizontal: 16, 
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: { 
    flex: 1, 
    paddingVertical: 12, 
    backgroundColor: 'transparent', 
    borderRadius: 8, 
    marginHorizontal: 2,
  },
  tabButtonActive: { 
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { 
    textAlign: 'center', 
    fontSize: 15, 
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: { 
    color: '#222', 
    fontWeight: '600',
  },
  tabContent: { paddingHorizontal: 20, paddingVertical: 8 },
  
  ingredientsContainer: {
    borderRadius: 12,
    padding: 16,
    margin: 8,
  },
  tabDesc: { fontSize: 15, color: '#222', marginBottom: 10 },
  ingredientCheckRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 8, 
    marginBottom: 10, 
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  
  checkboxButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  checkboxText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ingredientCheckText: { flex: 1, fontSize: 16, color: '#222' },
  ingredientCheckUnit: { fontSize: 15, color: '#a85', marginLeft: 10 },
  detailButtonRow: { flexDirection: 'row', marginTop: 10 },
  addListButton: { flex: 1, backgroundColor: '#ff5500', borderRadius: 8, padding: 12, marginRight: 8 },
  addListButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  pdfButton: { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#ccc' },
  pdfButtonText: { color: '#a85', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  detailBottomSpace: { height: 80 },

  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 8,
  },
  regionScroll: {
    marginVertical: 8,
    maxHeight: 54,
  },
  nutritionProfileBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginTop: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  nutritionProfileLabel: {
    fontSize: 15,
    color: '#444',
    width: 80,
  },
  nutritionProfileValue: {
    fontSize: 14,
    color: '#666',
    width: 40,
    textAlign: 'right',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    padding: 24,
  },
  authCardV2: {
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
  authTitleV2: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: '#FF7F50',
    textAlign: 'center',
  },
  authInputV2: {
    width: '100%',
    backgroundColor: '#FCEFE6',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#EAD6C2',
  },
  authButtonV2: {
    backgroundColor: '#FF7F50',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 12,
    width: '100%',
  },
  authButtonTextV2: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  authSwitchTextV2: {
    color: '#FF7F50',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
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
  perfilLogoutV2: {
    backgroundColor: '#FF7F50',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 12,
    width: '100%',
  },
  perfilLogoutTextV2: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  perfilLoginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 24,
  },
  perfilLoginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#222',
  },
  perfilHeader: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  perfilHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  perfilCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#222',
    marginHorizontal: 16,
    marginTop: 18,
    padding: 18,
  },
  perfilCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  perfilCardDesc: {
    color: '#666',
    marginBottom: 10,
  },
  perfilCardLabel: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    color: '#222',
  },
  perfilLangRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  perfilLangBtn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 8,
  },
  perfilLangBtnActive: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#222',
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 8,
  },
  etiquetasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 8,
  },
  etiquetaBtn: {
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  etiquetaBtnActive: {
    backgroundColor: '#FF7F50',
    borderColor: '#FF7F50',
  },
  etiquetaText: {
    color: '#222',
    fontSize: 15,
    fontWeight: '500',
  },
  etiquetaTextActive: {
    color: '#fff',
  },
  perfilFavBtn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  perfilFavText: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  perfilFavIcon: {
    fontSize: 22,
    color: '#888',
    marginLeft: 8,
  },
  perfilAdvice: {
    color: '#666',
    fontSize: 15,
    marginHorizontal: 18,
    marginTop: 18,
    marginBottom: 24,
  },

  // Nuevos estilos para la navegación inferior moderna
  bottomNavModern: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 8,
  },
  navItemModern: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
  },
  navLabelModern: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  navItemActiveModern: {
    borderTopWidth: 2,
    borderColor: '#ff5500',
  },
  
  // Nuevos estilos mejorados para detalle de recetas
  detailDescription: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 20,
    marginBottom: 16,
    lineHeight: 22,
  },
  
  stepsContainer: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 8,
  },
  
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  stepText: {
    fontSize: 16,
    color: '#222',
    flex: 1,
    lineHeight: 22,
  },
  
  videoContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  
  videoThumbnail: {
    width: '100%',
    height: 180,
  },
  
  videoPlaceholder: {
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
  },
  
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  playButton: {
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  
  playButtonText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 28,
  },
  
  videoDescription: {
    marginTop: 12,
    color: '#444',
    fontSize: 15,
  },
  
  nutritionContainer: {
    flex: 1,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  
  nutritionCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  
  nutritionDetailsBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  nutritionDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  vitaminsBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  vitaminTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  
  nutritionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  
  nutritionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  
  nutritionUnit: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  
  nutritionDetails: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  
  nutritionDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  nutritionDetailItem: {
    marginBottom: 16,
  },
  
  nutritionDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  nutritionDetailLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  
  nutritionDetailValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  
  vitaminsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  vitaminRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  
  vitaminItem: {
    flex: 1,
    paddingHorizontal: 8,
  },
  
  vitaminLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  
  vitaminValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  
  nutritionSource: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  
  // Nuevos estilos simplificados para nutrición
  nutritionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  nutritionCardSimple: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  nutritionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  
  nutritionNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  
  nutritionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  
  nutritionSubtext: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  
  nutritionExtraCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  nutritionExtraTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  nutritionRowLabel: {
    fontSize: 14,
    color: '#666',
  },
  
  nutritionRowValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Nuevos estilos para la vista detallada profesional
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  sectionHeaderNew: {
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  
  sectionTitleNew: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  ingredientAmount: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    minWidth: 40,
    textAlign: 'center',
  },
  
  stepContent: {
    flex: 1,
    marginLeft: 15,
  },
  
  stepMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  
  stepTime: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  stepDifficulty: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  noStepsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  
  noStepsText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  
  tipsContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  
  tipsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  
  videoTabContainer: {
    flex: 1,
    padding: 20,
  },
  
  videoThumbnailContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  
  videoWrapper: {
    position: 'relative',
  },
  
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  
  playButtonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
  },
  
  videoInfo: {
    padding: 15,
  },
  
  videoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  
  videoStat: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Nuevos estilos para video mejorado
  videoDurationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  
  videoDurationText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  
  chefInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  
  chefName: {
    fontSize: 13,
    fontWeight: '600',
  },
  
  uploadDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  
  videoActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  relatedVideosSection: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  
  relatedVideoItem: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  relatedVideoThumbnail: {
    position: 'relative',
  },
  
  relatedVideoImage: {
    width: 120,
    height: 70,
  },
  
  relatedVideoDuration: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  
  relatedVideoDurationText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
  },
  
  relatedVideoInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  
  relatedVideoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    lineHeight: 16,
  },
  
  relatedVideoChef: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  
  relatedVideoStats: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  
  // Estilos para galería de imágenes de comida
  foodGalleryContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  
  galleryScrollContainer: {
    marginTop: 15,
  },
  
  galleryMainImage: {
    width: 150,
    height: 100,
    borderRadius: 8,
  },
  
  foodGallerySection: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  
  foodGalleryGrid: {
    marginTop: 15,
  },
  
  galleryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  
  foodGalleryItem: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  foodGalleryImage: {
    width: '100%',
    height: 120,
  },
  
  foodGalleryItemWide: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  foodGalleryImageWide: {
    width: '100%',
    height: 150,
  },
  
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  
  imageOverlayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  nutritionCardMain: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    flex: 1,
    margin: 5,
    alignItems: 'center',
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  nutritionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  nutritionLabelNew: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  
  nutritionUnitNew: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  
  nutritionDetailCard: {
    borderRadius: 12,
    padding: 20,
    margin: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  nutritionDetailTitleNew: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  
  nutritionDetailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  nutritionDetailItemNew: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  
  nutritionDetailLabelNew: {
    fontSize: 13,
    color: '#666',
  },
  
  nutritionDetailValueNew: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  
  vitaminCard: {
    borderRadius: 12,
    padding: 20,
    margin: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  vitaminTitleNew: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  
  vitaminList: {
    marginBottom: 15,
  },
  
  vitaminItemNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  vitaminIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  
  vitaminName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  
  vitaminPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  vitaminNote: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Nuevos estilos para galería visual
  visualGallery: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  galleryScroll: {
    flexDirection: 'row',
  },

  galleryItem: {
    width: 120,
    height: 140,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  galleryGif: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  galleryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 8,
  },

  // Estilos para sección de inspiración
  inspirationSection: {
    borderRadius: 12,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  inspirationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },

  inspirationGrid: {
    gap: 10,
  },

  inspirationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  inspirationCard: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  inspirationImage: {
    width: '100%',
    height: 80,
  },

  inspirationCardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },

  inspirationCardDesc: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },

  // Mejorar el marco del video
  videoFrame: {
    borderRadius: 16,
    borderWidth: 3,
    padding: 4,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  videoShineEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
    margin: 10,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
    margin: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default App;