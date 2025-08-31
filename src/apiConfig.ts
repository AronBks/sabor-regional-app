// Configuración de APIs para reconocimiento de ingredientes
// Instrucciones: Ver README_APIS.md para obtener las claves gratuitas

export const API_CONFIG = {
  // Clarifai - 5000 operaciones gratis/mes (Recomendado)
  // Obtén tu clave en: https://clarifai.com/
  CLARIFAI_API_KEY: 'c302db60b6d94872929499c415015868', // Reemplaza con tu API key real
  
  // Google Vision - 1000 requests gratis/mes
  // Obtén tu clave en: https://console.cloud.google.com/
  GOOGLE_VISION_API_KEY: 'TU_GOOGLE_API_KEY', // Reemplaza con tu API key real
  
  // Spoonacular - 150 requests gratis/día
  // Obtén tu clave en: https://spoonacular.com/food-api
  SPOONACULAR_API_KEY: 'TU_SPOONACULAR_API_KEY', // Reemplaza con tu API key real
};

// Estado de las APIs
export const getAPIStatus = () => {
  return {
    clarifai: API_CONFIG.CLARIFAI_API_KEY !== 'TU_CLARIFAI_API_KEY',
    googleVision: API_CONFIG.GOOGLE_VISION_API_KEY !== 'TU_GOOGLE_API_KEY',
    spoonacular: API_CONFIG.SPOONACULAR_API_KEY !== 'TU_SPOONACULAR_API_KEY',
    localAI: true // Siempre disponible como fallback
  };
};

// Instrucciones de configuración
export const SETUP_INSTRUCTIONS = {
  clarifai: {
    name: 'Clarifai',
    url: 'https://clarifai.com/',
    free_limit: '5,000 ops/mes',
    steps: [
      '1. Crear cuenta gratis en clarifai.com',
      '2. Ir a Dashboard > My Apps',
      '3. Crear nueva app con base workflow "Food"',
      '4. Copiar API Key desde la sección API Keys',
      '5. Reemplazar TU_CLARIFAI_API_KEY en este archivo'
    ]
  },
  google: {
    name: 'Google Vision',
    url: 'https://console.cloud.google.com/',
    free_limit: '1,000 requests/mes',
    steps: [
      '1. Crear proyecto en Google Cloud Console',
      '2. Habilitar Vision API',
      '3. Crear credenciales > API Key',
      '4. Reemplazar TU_GOOGLE_API_KEY en este archivo'
    ]
  },
  spoonacular: {
    name: 'Spoonacular',
    url: 'https://spoonacular.com/food-api',
    free_limit: '150 requests/día',
    steps: [
      '1. Registrarse en spoonacular.com/food-api',
      '2. Ir a My Console',
      '3. Copiar API Key',
      '4. Reemplazar TU_SPOONACULAR_API_KEY en este archivo'
    ]
  }
};

export default API_CONFIG;
