import { ingredientService, recipeService, analysisService } from '../pocketbase';

// Servicio para análisis de ingredientes con IA
export class IngredientAnalysisService {
  
  // Simular análisis de IA (aquí puedes integrar una API real)
  static async analyzeImage(imageUri: string, userId: string) {
    try {
      // Simulación de análisis de IA
      const simulatedIngredients = [
        { name: 'Tomate', confidence: 0.95 },
        { name: 'Cebolla', confidence: 0.87 },
        { name: 'Zanahoria', confidence: 0.92 },
        { name: 'Cilantro', confidence: 0.78 }
      ];

      const analysisStartTime = Date.now();
      
      // Simular tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const analysisTime = Date.now() - analysisStartTime;
      const averageConfidence = simulatedIngredients.reduce((sum, ing) => sum + ing.confidence, 0) / simulatedIngredients.length;

      // Guardar ingredientes detectados en la base de datos
      const savedIngredients = [];
      for (const ingredient of simulatedIngredients) {
        const existingResult = await ingredientService.searchIngredients(ingredient.name, userId);
        
        let ingredientRecord;
        if (existingResult.success && existingResult.ingredients && existingResult.ingredients.length > 0) {
          ingredientRecord = existingResult.ingredients[0];
        } else {
          // Crear nuevo ingrediente si no existe
          const createResult = await ingredientService.createIngredient({
            name: ingredient.name,
            category: this.getCategoryForIngredient(ingredient.name),
            description: `Detectado automáticamente con ${Math.round(ingredient.confidence * 100)}% de confianza`,
            user_id: userId
          });
          
          if (createResult.success) {
            ingredientRecord = createResult.ingredient;
          }
        }
        
        if (ingredientRecord) {
          savedIngredients.push({
            ...ingredientRecord,
            confidence: ingredient.confidence
          });
        }
      }

      // Buscar recetas relacionadas
      const ingredientIds = savedIngredients.map(ing => ing.id);
      const recipesResult = await recipeService.findRecipesByIngredients(ingredientIds, userId);
      
      // Guardar el análisis
      const analysisData = {
        image_url: imageUri,
        detected_ingredients: simulatedIngredients.map(ing => ing.name),
        confidence_score: averageConfidence,
        analysis_time: analysisTime,
        user_id: userId,
        suggested_recipes: recipesResult.success && recipesResult.recipes ? recipesResult.recipes.map(r => r.id) : []
      };

      const saveResult = await analysisService.saveAnalysis(analysisData);

      return {
        success: true,
        ingredients: savedIngredients,
        suggestedRecipes: recipesResult.success && recipesResult.recipes ? recipesResult.recipes : [],
        analysisTime,
        confidence: averageConfidence,
        analysisId: saveResult.success && saveResult.analysis ? saveResult.analysis.id : null
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Categorizar ingrediente automáticamente
  static getCategoryForIngredient(ingredientName: string): string {
    const categories = {
      'Frutas': ['manzana', 'banana', 'naranja', 'limón', 'fresa'],
      'Verduras': ['tomate', 'cebolla', 'zanahoria', 'papa', 'lechuga'],
      'Hierbas': ['cilantro', 'perejil', 'albahaca', 'oregano'],
      'Carnes': ['pollo', 'res', 'cerdo', 'pescado'],
      'Lácteos': ['leche', 'queso', 'yogurt', 'mantequilla'],
      'Granos': ['arroz', 'avena', 'quinoa', 'trigo']
    };

    const lowerName = ingredientName.toLowerCase();
    
    for (const [category, items] of Object.entries(categories)) {
      if (items.some(item => lowerName.includes(item))) {
        return category;
      }
    }
    
    return 'Otros';
  }

  // Obtener sugerencias de recetas basadas en ingredientes
  static async getRecipeSuggestions(ingredientIds: string[], userId: string) {
    try {
      const result = await recipeService.findRecipesByIngredients(ingredientIds, userId);
      
      if (result.success && result.recipes) {
        // Calcular porcentaje de coincidencia para cada receta
        const recipesWithMatch = result.recipes.map(recipe => {
          const recipeIngredientIds = recipe.ingredients || [];
          const matchCount = ingredientIds.filter(id => recipeIngredientIds.includes(id)).length;
          const matchPercentage = Math.round((matchCount / recipeIngredientIds.length) * 100);
          
          return {
            ...recipe,
            matchPercentage,
            matchCount
          };
        });

        // Ordenar por porcentaje de coincidencia
        recipesWithMatch.sort((a, b) => b.matchPercentage - a.matchPercentage);
        
        return {
          success: true,
          recipes: recipesWithMatch
        };
      }
      
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Crear receta basada en ingredientes detectados
  static async createRecipeFromIngredients(
    ingredientIds: string[], 
    userId: string, 
    recipeData: {
      title: string;
      description: string;
      instructions: string;
      prep_time: number;
      cook_time: number;
      servings: number;
      difficulty: string;
      category: string;
    }
  ) {
    try {
      const result = await recipeService.createRecipe({
        ...recipeData,
        user_id: userId,
        ingredients: ingredientIds
      });
      
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Hook para usar el servicio de análisis
export const useIngredientAnalysis = () => {
  const analyzeImage = async (imageUri: string, userId: string) => {
    return await IngredientAnalysisService.analyzeImage(imageUri, userId);
  };

  const getRecipeSuggestions = async (ingredientIds: string[], userId: string) => {
    return await IngredientAnalysisService.getRecipeSuggestions(ingredientIds, userId);
  };

  const createRecipe = async (ingredientIds: string[], userId: string, recipeData: any) => {
    return await IngredientAnalysisService.createRecipeFromIngredients(ingredientIds, userId, recipeData);
  };

  return {
    analyzeImage,
    getRecipeSuggestions,
    createRecipe
  };
};
