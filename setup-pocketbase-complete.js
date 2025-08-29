/**
 * Script completo para configurar PocketBase con todas las colecciones necesarias
 * para la aplicación de Recetas Regionales
 */

const PocketBase = require('pocketbase/cjs');

const pb = new PocketBase('http://127.0.0.1:8090');

// Configuración de administrador
const ADMIN_EMAIL = 'admin@recetas.com';
const ADMIN_PASSWORD = 'admin123456';

async function setupPocketBase() {
  try {
    console.log('🚀 Iniciando configuración completa de PocketBase...');

    // 1. Crear usuario administrador
    await createAdminUser();

    // 2. Crear todas las colecciones
    await createCollections();

    // 3. Insertar datos de ejemplo
    await insertSampleData();

    console.log('✅ Configuración de PocketBase completada exitosamente!');
    console.log('📝 Credenciales de administrador:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('🌐 Accede al panel admin en: http://127.0.0.1:8090/_/');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
  }
}

async function createAdminUser() {
  try {
    console.log('👤 Creando usuario administrador...');
    
    await pb.admins.create({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    
    console.log('✅ Usuario administrador creado');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Usuario administrador ya existe');
    } else {
      console.error('❌ Error creando admin:', error);
    }
  }
}

async function createCollections() {
  console.log('📚 Creando colecciones...');

  // Colección de usuarios (extendida)
  await createUsersCollection();
  
  // Colección de regiones
  await createRegionsCollection();
  
  // Colección de ingredientes
  await createIngredientsCollection();
  
  // Colección de recetas
  await createRecipesCollection();
  
  // Colección de favoritos de usuarios
  await createUserFavoritesCollection();
  
  // Colección de ingredientes favoritos de usuarios
  await createUserIngredientPreferencesCollection();
  
  // Colección de análisis de ingredientes (cámara)
  await createIngredientAnalysisCollection();
  
  // Colección de comentarios y valoraciones
  await createRecipeReviewsCollection();
  
  // Colección de listas personalizadas
  await createUserRecipeListsCollection();
}

async function createUsersCollection() {
  try {
    const usersCollection = {
      name: 'users',
      type: 'auth',
      schema: [
        {
          name: 'name',
          type: 'text',
          required: true,
          options: {}
        },
        {
          name: 'avatar',
          type: 'file',
          required: false,
          options: {
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp']
          }
        },
        {
          name: 'bio',
          type: 'text',
          required: false,
          options: {}
        },
        {
          name: 'level',
          type: 'select',
          required: true,
          options: {
            maxSelect: 1,
            values: ['beginner', 'intermediate', 'advanced', 'chef']
          }
        },
        {
          name: 'dietary_restrictions',
          type: 'select',
          required: false,
          options: {
            maxSelect: 10,
            values: ['gluten_free', 'vegetarian', 'vegan', 'lactose_free', 'keto', 'paleo', 'diabetic', 'low_sodium']
          }
        },
        {
          name: 'preferred_difficulty',
          type: 'select',
          required: false,
          options: {
            maxSelect: 3,
            values: ['easy', 'medium', 'hard']
          }
        },
        {
          name: 'favorite_regions',
          type: 'relation',
          required: false,
          options: {
            collectionId: '', // Se actualizará después de crear la colección de regiones
            cascadeDelete: false,
            minSelect: null,
            maxSelect: null,
            displayFields: []
          }
        }
      ]
    };

    await pb.collections.create(usersCollection);
    console.log('✅ Colección users creada');
  } catch (error) {
    console.log('ℹ️  Colección users ya existe o error:', error.message);
  }
}

async function createRegionsCollection() {
  try {
    const regionsCollection = {
      name: 'regions',
      type: 'base',
      schema: [
        {
          name: 'name',
          type: 'text',
          required: true,
          options: {}
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          options: {}
        },
        {
          name: 'description',
          type: 'text',
          required: false,
          options: {}
        },
        {
          name: 'color',
          type: 'text',
          required: true,
          options: {}
        },
        {
          name: 'image',
          type: 'file',
          required: false,
          options: {
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp']
          }
        },
        {
          name: 'characteristics',
          type: 'text',
          required: false,
          options: {}
        }
      ]
    };

    await pb.collections.create(regionsCollection);
    console.log('✅ Colección regions creada');
  } catch (error) {
    console.log('ℹ️  Colección regions ya existe o error:', error.message);
  }
}

async function createIngredientsCollection() {
  try {
    const ingredientsCollection = {
      name: 'ingredients',
      type: 'base',
      schema: [
        {
          name: 'name',
          type: 'text',
          required: true,
          options: {}
        },
        {
          name: 'category',
          type: 'select',
          required: true,
          options: {
            maxSelect: 1,
            values: ['meat', 'poultry', 'seafood', 'vegetables', 'fruits', 'grains', 'dairy', 'spices', 'herbs', 'oils', 'others']
          }
        },
        {
          name: 'nutritional_info',
          type: 'json',
          required: false,
          options: {}
        },
        {
          name: 'common_units',
          type: 'json',
          required: false,
          options: {}
        },
        {
          name: 'season',
          type: 'select',
          required: false,
          options: {
            maxSelect: 4,
            values: ['spring', 'summer', 'autumn', 'winter']
          }
        },
        {
          name: 'regions',
          type: 'relation',
          required: false,
          options: {
            collectionId: '', // Se actualizará después
            cascadeDelete: false,
            minSelect: null,
            maxSelect: null,
            displayFields: []
          }
        }
      ]
    };

    await pb.collections.create(ingredientsCollection);
    console.log('✅ Colección ingredients creada');
  } catch (error) {
    console.log('ℹ️  Colección ingredients ya existe o error:', error.message);
  }
}

async function createRecipesCollection() {
  try {
    const recipesCollection = {
      name: 'recipes',
      type: 'base',
      schema: [
        {
          name: 'name',
          type: 'text',
          required: true,
          options: {}
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          options: {}
        },
        {
          name: 'description',
          type: 'text',
          required: true,
          options: {}
        },
        {
          name: 'region',
          type: 'relation',
          required: true,
          options: {
            collectionId: '', // Se actualizará después
            cascadeDelete: false,
            minSelect: 1,
            maxSelect: 1,
            displayFields: []
          }
        },
        {
          name: 'ingredients',
          type: 'json',
          required: true,
          options: {}
        },
        {
          name: 'steps',
          type: 'json',
          required: true,
          options: {}
        },
        {
          name: 'difficulty',
          type: 'select',
          required: true,
          options: {
            maxSelect: 1,
            values: ['easy', 'medium', 'hard']
          }
        },
        {
          name: 'prep_time',
          type: 'number',
          required: false,
          options: {}
        },
        {
          name: 'cook_time',
          type: 'number',
          required: false,
          options: {}
        },
        {
          name: 'servings',
          type: 'number',
          required: false,
          options: {}
        },
        {
          name: 'images',
          type: 'file',
          required: false,
          options: {
            maxSelect: 5,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp']
          }
        },
        {
          name: 'video_url',
          type: 'url',
          required: false,
          options: {}
        },
        {
          name: 'nutritional_info',
          type: 'json',
          required: false,
          options: {}
        },
        {
          name: 'tags',
          type: 'json',
          required: false,
          options: {}
        },
        {
          name: 'is_featured',
          type: 'bool',
          required: false,
          options: {}
        },
        {
          name: 'created_by',
          type: 'relation',
          required: false,
          options: {
            collectionId: '', // Se actualizará después (users)
            cascadeDelete: false,
            minSelect: null,
            maxSelect: 1,
            displayFields: []
          }
        },
        {
          name: 'rating_average',
          type: 'number',
          required: false,
          options: {}
        },
        {
          name: 'rating_count',
          type: 'number',
          required: false,
          options: {}
        }
      ]
    };

    await pb.collections.create(recipesCollection);
    console.log('✅ Colección recipes creada');
  } catch (error) {
    console.log('ℹ️  Colección recipes ya existe o error:', error.message);
  }
}

async function createUserFavoritesCollection() {
  try {
    const favoritesCollection = {
      name: 'user_favorites',
      type: 'base',
      schema: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          options: {
            collectionId: '', // users collection
            cascadeDelete: true,
            minSelect: 1,
            maxSelect: 1,
            displayFields: []
          }
        },
        {
          name: 'recipe',
          type: 'relation',
          required: true,
          options: {
            collectionId: '', // recipes collection
            cascadeDelete: true,
            minSelect: 1,
            maxSelect: 1,
            displayFields: []
          }
        },
        {
          name: 'notes',
          type: 'text',
          required: false,
          options: {}
        }
      ]
    };

    await pb.collections.create(favoritesCollection);
    console.log('✅ Colección user_favorites creada');
  } catch (error) {
    console.log('ℹ️  Colección user_favorites ya existe o error:', error.message);
  }
}

async function createUserIngredientPreferencesCollection() {
  try {
    const preferencesCollection = {
      name: 'user_ingredient_preferences',
      type: 'base',
      schema: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          options: {
            collectionId: '', // users collection
            cascadeDelete: true,
            minSelect: 1,
            maxSelect: 1,
            displayFields: []
          }
        },
        {
          name: 'ingredient',
          type: 'relation',
          required: true,
          options: {
            collectionId: '', // ingredients collection
            cascadeDelete: true,
            minSelect: 1,
            maxSelect: 1,
            displayFields: []
          }
        },
        {
          name: 'preference_type',
          type: 'select',
          required: true,
          options: {
            maxSelect: 1,
            values: ['favorite', 'dislike', 'allergic', 'avoid']
          }
        }
      ]
    };

    await pb.collections.create(preferencesCollection);
    console.log('✅ Colección user_ingredient_preferences creada');
  } catch (error) {
    console.log('ℹ️  Colección user_ingredient_preferences ya existe o error:', error.message);
  }
}

async function createIngredientAnalysisCollection() {
  try {
    const analysisCollection = {
      name: 'ingredient_analysis',
      type: 'base',
      schema: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          options: {
            collectionId: '', // users collection
            cascadeDelete: true,
            minSelect: 1,
            maxSelect: 1,
            displayFields: []
          }
        },
        {
          name: 'image',
          type: 'file',
          required: true,
          options: {
            maxSelect: 1,
            maxSize: 10485760,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp']
          }
        },
        {
          name: 'detected_ingredients',
          type: 'json',
          required: false,
          options: {}
        },
        {
          name: 'suggested_recipes',
          type: 'json',
          required: false,
          options: {}
        },
        {
          name: 'analysis_result',
          type: 'json',
          required: false,
          options: {}
        },
        {
          name: 'confidence_score',
          type: 'number',
          required: false,
          options: {}
        }
      ]
    };

    await pb.collections.create(analysisCollection);
    console.log('✅ Colección ingredient_analysis creada');
  } catch (error) {
    console.log('ℹ️  Colección ingredient_analysis ya existe o error:', error.message);
  }
}

async function createRecipeReviewsCollection() {
  try {
    const reviewsCollection = {
      name: 'recipe_reviews',
      type: 'base',
      schema: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          options: {
            collectionId: '', // users collection
            cascadeDelete: true,
            minSelect: 1,
            maxSelect: 1,
            displayFields: []
          }
        },
        {
          name: 'recipe',
          type: 'relation',
          required: true,
          options: {
            collectionId: '', // recipes collection
            cascadeDelete: true,
            minSelect: 1,
            maxSelect: 1,
            displayFields: []
          }
        },
        {
          name: 'rating',
          type: 'number',
          required: true,
          options: {
            min: 1,
            max: 5
          }
        },
        {
          name: 'comment',
          type: 'text',
          required: false,
          options: {}
        },
        {
          name: 'images',
          type: 'file',
          required: false,
          options: {
            maxSelect: 3,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp']
          }
        }
      ]
    };

    await pb.collections.create(reviewsCollection);
    console.log('✅ Colección recipe_reviews creada');
  } catch (error) {
    console.log('ℹ️  Colección recipe_reviews ya existe o error:', error.message);
  }
}

async function createUserRecipeListsCollection() {
  try {
    const listsCollection = {
      name: 'user_recipe_lists',
      type: 'base',
      schema: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          options: {
            collectionId: '', // users collection
            cascadeDelete: true,
            minSelect: 1,
            maxSelect: 1,
            displayFields: []
          }
        },
        {
          name: 'name',
          type: 'text',
          required: true,
          options: {}
        },
        {
          name: 'description',
          type: 'text',
          required: false,
          options: {}
        },
        {
          name: 'recipes',
          type: 'relation',
          required: false,
          options: {
            collectionId: '', // recipes collection
            cascadeDelete: false,
            minSelect: null,
            maxSelect: null,
            displayFields: []
          }
        },
        {
          name: 'is_public',
          type: 'bool',
          required: false,
          options: {}
        },
        {
          name: 'color',
          type: 'text',
          required: false,
          options: {}
        }
      ]
    };

    await pb.collections.create(listsCollection);
    console.log('✅ Colección user_recipe_lists creada');
  } catch (error) {
    console.log('ℹ️  Colección user_recipe_lists ya existe o error:', error.message);
  }
}

async function insertSampleData() {
  console.log('📋 Insertando datos de ejemplo...');

  // Insertar regiones
  await insertRegions();
  
  // Insertar ingredientes
  await insertIngredients();
  
  // Insertar recetas
  await insertRecipes();
}

async function insertRegions() {
  try {
    const regions = [
      {
        name: 'Andina',
        slug: 'andina',
        description: 'Región montañosa con ingredientes únicos de altura',
        color: '#8B5CF6',
        characteristics: 'Papa, quinua, chuño, habas'
      },
      {
        name: 'Costa',
        slug: 'costa',
        description: 'Región costera rica en pescados y mariscos',
        color: '#06B6D4',
        characteristics: 'Pescado, mariscos, arroz, ají amarillo'
      },
      {
        name: 'Selva',
        slug: 'selva',
        description: 'Región amazónica con frutas tropicales',
        color: '#10B981',
        characteristics: 'Plátano, yuca, pescado de río, frutas tropicales'
      },
      {
        name: 'Sierra',
        slug: 'sierra',
        description: 'Región serrana con tradiciones ancestrales',
        color: '#F59E0B',
        characteristics: 'Maíz, papa, quinua, carne de alpaca'
      },
      {
        name: 'Pampa',
        slug: 'pampa',
        description: 'Región ganadera con carnes de calidad',
        color: '#84CC16',
        characteristics: 'Carne de res, cordero, trigo, verduras'
      },
      {
        name: 'Altiplano',
        slug: 'altiplano',
        description: 'Región de alta montaña con productos únicos',
        color: '#DC2626',
        characteristics: 'Quinua, chuño, llama, habas'
      }
    ];

    for (const region of regions) {
      try {
        await pb.collection('regions').create(region);
      } catch (error) {
        console.log(`ℹ️  Región ${region.name} ya existe`);
      }
    }
    
    console.log('✅ Regiones insertadas');
  } catch (error) {
    console.error('❌ Error insertando regiones:', error);
  }
}

async function insertIngredients() {
  try {
    const ingredients = [
      // Carnes
      { name: 'Carne de res', category: 'meat' },
      { name: 'Pollo', category: 'poultry' },
      { name: 'Cerdo', category: 'meat' },
      { name: 'Cordero', category: 'meat' },
      { name: 'Alpaca', category: 'meat' },
      
      // Pescados y mariscos
      { name: 'Pescado', category: 'seafood' },
      { name: 'Camarones', category: 'seafood' },
      { name: 'Pulpo', category: 'seafood' },
      { name: 'Mariscos', category: 'seafood' },
      
      // Vegetales
      { name: 'Papa', category: 'vegetables' },
      { name: 'Cebolla', category: 'vegetables' },
      { name: 'Ajo', category: 'vegetables' },
      { name: 'Tomate', category: 'vegetables' },
      { name: 'Yuca', category: 'vegetables' },
      { name: 'Plátano', category: 'vegetables' },
      
      // Granos y cereales
      { name: 'Arroz', category: 'grains' },
      { name: 'Quinua', category: 'grains' },
      { name: 'Maíz', category: 'grains' },
      { name: 'Harina de maíz', category: 'grains' },
      
      // Lácteos
      { name: 'Queso fresco', category: 'dairy' },
      { name: 'Leche', category: 'dairy' },
      { name: 'Mantequilla', category: 'dairy' },
      
      // Especias
      { name: 'Ají amarillo', category: 'spices' },
      { name: 'Comino', category: 'spices' },
      { name: 'Sal', category: 'spices' },
      { name: 'Pimienta', category: 'spices' }
    ];

    for (const ingredient of ingredients) {
      try {
        await pb.collection('ingredients').create(ingredient);
      } catch (error) {
        console.log(`ℹ️  Ingrediente ${ingredient.name} ya existe`);
      }
    }
    
    console.log('✅ Ingredientes insertados');
  } catch (error) {
    console.error('❌ Error insertando ingredientes:', error);
  }
}

async function insertRecipes() {
  try {
    // Obtener regiones para referencias
    const regions = await pb.collection('regions').getFullList();
    const andinaRegion = regions.find(r => r.slug === 'andina');
    const costaRegion = regions.find(r => r.slug === 'costa');

    if (!andinaRegion || !costaRegion) {
      console.log('⚠️  No se encontraron regiones, saltando inserción de recetas');
      return;
    }

    const recipes = [
      {
        name: 'Arepas de Maíz Blanco',
        slug: 'arepas-maiz-blanco',
        description: 'Deliciosas arepas tradicionales hechas con maíz blanco y queso fresco',
        region: andinaRegion.id,
        difficulty: 'easy',
        prep_time: 15,
        cook_time: 10,
        servings: 4,
        ingredients: [
          { name: 'Harina de maíz', amount: '2 tazas' },
          { name: 'Agua tibia', amount: '1.5 tazas' },
          { name: 'Sal', amount: '1 cucharadita' },
          { name: 'Queso fresco', amount: '200g' }
        ],
        steps: [
          'Mezcla la harina de maíz con agua tibia y sal hasta formar una masa suave',
          'Agrega el queso fresco desmenuzado y amasa bien',
          'Forma bolas y aplana para hacer las arepas',
          'Cocina en sartén caliente por ambos lados hasta dorar'
        ],
        nutritional_info: {
          calories: 320,
          protein: 14,
          carbs: 45,
          fat: 8
        },
        is_featured: true,
        tags: ['tradicional', 'desayuno', 'vegetariano']
      },
      {
        name: 'Ceviche de Pescado',
        slug: 'ceviche-pescado',
        description: 'Ceviche fresco de pescado con limón y especias',
        region: costaRegion.id,
        difficulty: 'medium',
        prep_time: 30,
        cook_time: 0,
        servings: 6,
        ingredients: [
          { name: 'Pescado fresco', amount: '500g' },
          { name: 'Limón', amount: '8 unidades' },
          { name: 'Cebolla roja', amount: '1 unidad' },
          { name: 'Ají amarillo', amount: '2 unidades' },
          { name: 'Sal', amount: 'al gusto' }
        ],
        steps: [
          'Corta el pescado en cubos pequeños',
          'Exprime los limones y marina el pescado por 20 minutos',
          'Corta la cebolla en juliana fina',
          'Mezcla todos los ingredientes y sazona con sal',
          'Sirve inmediatamente bien frío'
        ],
        nutritional_info: {
          calories: 180,
          protein: 25,
          carbs: 8,
          fat: 3
        },
        is_featured: true,
        tags: ['fresco', 'saludable', 'sin cocción']
      }
    ];

    for (const recipe of recipes) {
      try {
        await pb.collection('recipes').create(recipe);
      } catch (error) {
        console.log(`ℹ️  Receta ${recipe.name} ya existe`);
      }
    }
    
    console.log('✅ Recetas de ejemplo insertadas');
  } catch (error) {
    console.error('❌ Error insertando recetas:', error);
  }
}

// Ejecutar configuración
setupPocketBase();
