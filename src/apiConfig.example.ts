// 🔑 EJEMPLO DE CONFIGURACIÓN DE APIS
// Copia este contenido en src/apiConfig.ts después de obtener tus claves

export const API_CONFIG = {
  // ✅ CLARIFAI (Recomendado - 5000 gratis/mes)
  // 1. Ve a https://clarifai.com/
  // 2. Sign Up gratis (sin tarjeta)
  // 3. Dashboard > My Apps > Create App
  // 4. Copia tu API Key y pégala aquí:
  CLARIFAI_API_KEY: 'a123b456c789d012e345f678g901h234', // ← Tu clave aquí
  
  // ⚠️ GOOGLE VISION (1000 gratis/mes - requiere tarjeta)
  // 1. Ve a https://console.cloud.google.com/
  // 2. Crear proyecto > Habilitar Vision API
  // 3. Credentials > Create API Key
  // 4. Pega tu clave aquí:
  GOOGLE_VISION_API_KEY: 'AIzaSyDl2K3m4n5o6p7q8r9s0t1u2v3w4x5y6z7', // ← Tu clave aquí
  
  // 🍳 SPOONACULAR (150 gratis/día)
  // 1. Ve a https://spoonacular.com/food-api
  // 2. Sign Up gratis
  // 3. My Console > Copia API Key
  // 4. Pega tu clave aquí:
  SPOONACULAR_API_KEY: '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p', // ← Tu clave aquí
};

// 🎮 MODO DEMO (Sin APIs)
// Si dejas las claves como 'TU_X_API_KEY', funcionará en modo demo
// con ingredientes simulados pero realistas.

export default API_CONFIG;
