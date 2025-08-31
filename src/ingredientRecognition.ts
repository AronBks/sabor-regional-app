// Servicio de reconocimiento de ingredientes usando APIs gratuitas
// Soporta múltiples proveedores para mayor precisión

import { API_CONFIG } from './apiConfig';

export interface DetectedIngredient {
  name: string;
  confidence: number;
  category?: string;
  spanish_name?: string;
}

export interface AnalysisResult {
  success: boolean;
  ingredients: DetectedIngredient[];
  suggestedRecipes?: any[];
  provider: string;
  analysisId: string;
  timestamp: string;
  error?: string;
}

class IngredientRecognitionService {
  // APIs configuradas desde archivo central
  private get CLARIFAI_API_KEY() { return API_CONFIG.CLARIFAI_API_KEY; }
  private get GOOGLE_VISION_API_KEY() { return API_CONFIG.GOOGLE_VISION_API_KEY; }
  private get SPOONACULAR_API_KEY() { return API_CONFIG.SPOONACULAR_API_KEY; }

  // Mapeo de ingredientes en inglés a español
  private ingredientTranslations: { [key: string]: string } = {
    'apple': 'manzana',
    'banana': 'plátano',
    'tomato': 'tomate',
    'onion': 'cebolla',
    'garlic': 'ajo',
    'potato': 'papa',
    'carrot': 'zanahoria',
    'chicken': 'pollo',
    'beef': 'carne de res',
    'fish': 'pescado',
    'rice': 'arroz',
    'egg': 'huevo',
    'milk': 'leche',
    'cheese': 'queso',
    'bread': 'pan',
    'lemon': 'limón',
    'lime': 'lima',
    'pepper': 'pimiento',
    'salt': 'sal',
    'oil': 'aceite',
    'flour': 'harina',
    'sugar': 'azúcar',
    'corn': 'maíz',
    'beans': 'frijoles',
    'avocado': 'aguacate',
    'cilantro': 'cilantro',
    'parsley': 'perejil',
    'spinach': 'espinaca',
    'lettuce': 'lechuga',
    'cucumber': 'pepino',
    'orange': 'naranja',
    'grape': 'uva',
    'strawberry': 'fresa',
    'pineapple': 'piña',
    'mango': 'mango',
    'papaya': 'papaya',
    'coconut': 'coco',
    'pork': 'cerdo',
    'turkey': 'pavo',
    'salmon': 'salmón',
    'tuna': 'atún',
    'shrimp': 'camarón',
    'pasta': 'pasta',
    'noodles': 'fideos',
    'quinoa': 'quinua',
    'broccoli': 'brócoli',
    'cauliflower': 'coliflor',
    'cabbage': 'repollo',
    'radish': 'rábano',
    'beet': 'remolacha',
    'sweet potato': 'camote',
    'yuca': 'yuca',
    'plantain': 'plátano verde'
  };

  // Categorías de ingredientes para mejor organización
  private ingredientCategories: { [key: string]: string[] } = {
    'frutas': ['manzana', 'plátano', 'limón', 'lima', 'naranja', 'uva', 'fresa', 'piña', 'mango', 'papaya', 'coco'],
    'verduras': ['tomate', 'cebolla', 'ajo', 'papa', 'zanahoria', 'pimiento', 'espinaca', 'lechuga', 'pepino', 'brócoli', 'coliflor'],
    'carnes': ['pollo', 'carne de res', 'cerdo', 'pavo'],
    'pescados': ['pescado', 'salmón', 'atún', 'camarón'],
    'lácteos': ['leche', 'queso', 'mantequilla', 'yogur'],
    'cereales': ['arroz', 'maíz', 'quinua', 'pasta', 'fideos', 'pan', 'harina'],
    'condimentos': ['sal', 'aceite', 'azúcar', 'cilantro', 'perejil']
  };

  // 1. Servicio principal usando Clarifai (Gratis)
  async analyzeWithClarifai(imageBase64: string): Promise<DetectedIngredient[]> {
    try {
      const response = await fetch('https://api.clarifai.com/v2/models/bd367be194cf45149e75f01d59f77ba7/outputs', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.CLARIFAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: [{
            data: {
              image: {
                base64: imageBase64
              }
            }
          }]
        })
      });

      const result = await response.json();
      
      if (result.outputs && result.outputs[0].data.concepts) {
        return result.outputs[0].data.concepts
          .filter((concept: any) => concept.value > 0.6) // Solo alta confianza
          .map((concept: any) => ({
            name: concept.name,
            confidence: concept.value,
            spanish_name: this.ingredientTranslations[concept.name.toLowerCase()] || concept.name,
            category: this.getIngredientCategory(concept.name)
          }))
          .slice(0, 8); // Máximo 8 ingredientes
      }
      return [];
    } catch (error) {
      console.error('Error con Clarifai:', error);
      return [];
    }
  }

  // 2. Servicio alternativo usando análisis local simulado (Fallback gratuito)
  async analyzeWithLocalAI(imageBase64: string): Promise<DetectedIngredient[]> {
    // Simulación de análisis local usando patrones comunes
    const commonIngredients = [
      { name: 'tomate', confidence: 0.85, category: 'verduras' },
      { name: 'cebolla', confidence: 0.78, category: 'verduras' },
      { name: 'ajo', confidence: 0.82, category: 'verduras' },
      { name: 'papa', confidence: 0.79, category: 'verduras' },
      { name: 'zanahoria', confidence: 0.76, category: 'verduras' },
      { name: 'pollo', confidence: 0.88, category: 'carnes' },
      { name: 'arroz', confidence: 0.83, category: 'cereales' },
      { name: 'limón', confidence: 0.81, category: 'frutas' }
    ];

    // Simular análisis con delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Retornar ingredientes aleatorios para simular detección
    const shuffled = commonIngredients.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * 5) + 2); // 2-6 ingredientes
  }

  // 3. Servicio usando Google Vision API (limitado pero gratuito)
  async analyzeWithGoogleVision(imageBase64: string): Promise<DetectedIngredient[]> {
    try {
      // Implementación básica de Google Vision
      // Nota: Requiere configuración de Google Cloud
      const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${this.GOOGLE_VISION_API_KEY}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            image: {
              content: imageBase64
            },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'OBJECT_LOCALIZATION', maxResults: 10 }
            ]
          }]
        })
      });

      const result = await response.json();
      const ingredients: DetectedIngredient[] = [];

      if (result.responses && result.responses[0].labelAnnotations) {
        result.responses[0].labelAnnotations.forEach((label: any) => {
          const spanishName = this.ingredientTranslations[label.description.toLowerCase()];
          if (spanishName && label.score > 0.7) {
            ingredients.push({
              name: label.description,
              confidence: label.score,
              spanish_name: spanishName,
              category: this.getIngredientCategory(spanishName)
            });
          }
        });
      }

      return ingredients.slice(0, 6);
    } catch (error) {
      console.error('Error con Google Vision:', error);
      return [];
    }
  }

  // Función principal que combina múltiples servicios
  async analyzeImage(imageBase64: string): Promise<AnalysisResult> {
    const analysisId = `analysis_${Date.now()}`;
    const timestamp = new Date().toISOString();

    try {
      // Intentar primero con el servicio local (siempre disponible)
      console.log('Iniciando análisis de ingredientes...');
      const localResults = await this.analyzeWithLocalAI(imageBase64);
      
      if (localResults.length > 0) {
        // Sugerir recetas basadas en ingredientes detectados
        const suggestedRecipes = await this.suggestRecipes(localResults);
        
        return {
          success: true,
          ingredients: localResults,
          suggestedRecipes,
          provider: 'Local AI Simulation',
          analysisId,
          timestamp
        };
      }

      // Si falla, intentar con Clarifai (requiere API key)
      if (this.CLARIFAI_API_KEY && this.CLARIFAI_API_KEY !== 'TU_CLARIFAI_API_KEY') {
        console.log('Intentando con Clarifai...');
        const clarifaiResults = await this.analyzeWithClarifai(imageBase64);
        
        if (clarifaiResults.length > 0) {
          const suggestedRecipes = await this.suggestRecipes(clarifaiResults);
          
          return {
            success: true,
            ingredients: clarifaiResults,
            suggestedRecipes,
            provider: 'Clarifai',
            analysisId,
            timestamp
          };
        }
      }

      // Fallback con ingredientes comunes
      const fallbackIngredients = [
        { name: 'ingrediente detectado', confidence: 0.75, category: 'otros' }
      ];

      return {
        success: false,
        ingredients: fallbackIngredients,
        provider: 'Fallback',
        analysisId,
        timestamp,
        error: 'No se pudieron detectar ingredientes específicos'
      };

    } catch (error) {
      console.error('Error en análisis de imagen:', error);
      return {
        success: false,
        ingredients: [],
        provider: 'Error',
        analysisId,
        timestamp,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Sugerir recetas basadas en ingredientes detectados
  private async suggestRecipes(ingredients: DetectedIngredient[]): Promise<any[]> {
    // Base de datos local de recetas sugeridas
    const recipeDatabase = [
      {
        title: 'Arroz con Pollo',
        ingredients: ['arroz', 'pollo', 'cebolla', 'ajo', 'zanahoria'],
        prep_time: 45,
        difficulty: 'Medio',
        matchPercentage: 0,
        description: 'Plato tradicional latinoamericano con sabores caseros'
      },
      {
        title: 'Ensalada Fresca',
        ingredients: ['tomate', 'lechuga', 'cebolla', 'pepino', 'limón'],
        prep_time: 15,
        difficulty: 'Fácil',
        matchPercentage: 0,
        description: 'Ensalada saludable y refrescante'
      },
      {
        title: 'Sopa de Verduras',
        ingredients: ['papa', 'zanahoria', 'cebolla', 'ajo', 'apio'],
        prep_time: 30,
        difficulty: 'Fácil',
        matchPercentage: 0,
        description: 'Sopa nutritiva con verduras frescas'
      },
      {
        title: 'Pollo a la Plancha',
        ingredients: ['pollo', 'limón', 'ajo', 'sal', 'aceite'],
        prep_time: 25,
        difficulty: 'Fácil',
        matchPercentage: 0,
        description: 'Pollo jugoso y saludable a la plancha'
      },
      {
        title: 'Guacamole',
        ingredients: ['aguacate', 'tomate', 'cebolla', 'limón', 'cilantro'],
        prep_time: 10,
        difficulty: 'Fácil',
        matchPercentage: 0,
        description: 'Dip cremoso y delicioso de aguacate'
      }
    ];

    const detectedNames = ingredients.map(ing => 
      ing.spanish_name || ing.name.toLowerCase()
    );

    // Calcular compatibilidad con cada receta
    const scoredRecipes = recipeDatabase.map(recipe => {
      const matches = recipe.ingredients.filter(ingredient => 
        detectedNames.some(detected => 
          detected.includes(ingredient) || ingredient.includes(detected)
        )
      );
      
      const matchPercentage = Math.round((matches.length / recipe.ingredients.length) * 100);
      
      return {
        ...recipe,
        matchPercentage,
        matchedIngredients: matches
      };
    });

    // Filtrar y ordenar por compatibilidad
    return scoredRecipes
      .filter(recipe => recipe.matchPercentage > 20) // Al menos 20% de compatibilidad
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 5); // Top 5 recetas
  }

  // Obtener categoría de un ingrediente
  private getIngredientCategory(ingredient: string): string {
    const ingredientLower = ingredient.toLowerCase();
    
    for (const [category, items] of Object.entries(this.ingredientCategories)) {
      if (items.some(item => ingredientLower.includes(item) || item.includes(ingredientLower))) {
        return category;
      }
    }
    
    return 'otros';
  }

  // Convertir imagen a base64 (helper function)
  convertToBase64(imageUri: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // En React Native, normalmente usarías react-native-fs o similar
        // Por ahora simulamos la conversión
        const mockBase64 = imageUri.replace('file://', '').split('/').pop() || '';
        resolve(mockBase64);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Validar imagen antes del análisis
  validateImage(imageUri: string): boolean {
    if (!imageUri) return false;
    
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const extension = imageUri.toLowerCase().split('.').pop();
    
    return validExtensions.includes(`.${extension}`);
  }

  // Obtener configuración de APIs
  getAPIStatus() {
    return {
      clarifai: this.CLARIFAI_API_KEY !== 'TU_CLARIFAI_API_KEY',
      localAI: true, // Siempre disponible
      googleVision: this.GOOGLE_VISION_API_KEY !== 'TU_GOOGLE_API_KEY',
      spoonacular: this.SPOONACULAR_API_KEY !== 'TU_SPOONACULAR_API_KEY'
    };
  }
}

export default new IngredientRecognitionService();
