// Script para insertar datos de prueba en PocketBase
// Ejecutar después de setup-pocketbase-collections.js

const PocketBase = require('pocketbase');
const pb = new PocketBase('http://127.0.0.1:8090');

// Datos de recetas de ejemplo para insertar en la base de datos
const sampleRecipes = [
  {
    name: 'Arepas de Maíz Andinas',
    description: 'Deliciosas arepas tradicionales de la región andina, preparadas con maíz molido y cocinadas a la perfección.',
    region: 'Andina',
    difficulty: 'Fácil',
    prep_time: 20,
    cook_time: 15,
    servings: 4,
    ingredients: [
      { name: 'Harina de maíz', quantity: '2 tazas', type: 'cereal' },
      { name: 'Agua tibia', quantity: '2 tazas', type: 'líquido' },
      { name: 'Sal', quantity: '1 cucharadita', type: 'condimento' },
      { name: 'Aceite', quantity: '2 cucharadas', type: 'grasa' }
    ],
    instructions: [
      'Mezclar la harina de maíz con la sal',
      'Añadir agua tibia gradualmente hasta formar una masa',
      'Amasar hasta que esté suave y homogénea',
      'Formar bolas y aplastarlas en forma de disco',
      'Cocinar en sartén con aceite hasta dorar'
    ],
    nutrition: {
      calories: 180,
      protein: 4,
      carbs: 35,
      fat: 3,
      fiber: 2
    },
    is_featured: true
  },
  {
    name: 'Ceviche Peruano de la Costa',
    description: 'Fresco ceviche preparado con pescado del día, limón ácido y ají amarillo, típico de la región costera.',
    region: 'Costa',
    difficulty: 'Medio',
    prep_time: 30,
    cook_time: 0,
    servings: 6,
    ingredients: [
      { name: 'Pescado blanco fresco', quantity: '1 kg', type: 'proteína' },
      { name: 'Limones', quantity: '15 unidades', type: 'cítrico' },
      { name: 'Cebolla morada', quantity: '1 unidad', type: 'vegetal' },
      { name: 'Ají amarillo', quantity: '2 unidades', type: 'condimento' },
      { name: 'Cilantro', quantity: '1 manojo', type: 'hierba' },
      { name: 'Camote', quantity: '2 unidades', type: 'tubérculo' }
    ],
    instructions: [
      'Cortar el pescado en cubos pequeños',
      'Exprimir los limones y reservar el jugo',
      'Cortar la cebolla en juliana fina',
      'Mezclar pescado con jugo de limón',
      'Agregar sal, ají y dejar reposar 10 minutos',
      'Servir con camote y cancha'
    ],
    nutrition: {
      calories: 220,
      protein: 35,
      carbs: 12,
      fat: 2,
      fiber: 1
    },
    is_featured: true
  },
  {
    name: 'Tacacho con Cecina Amazónico',
    description: 'Plato tradicional de la selva amazónica, combinando plátano verde majado con cecina ahumada.',
    region: 'Amazónica',
    difficulty: 'Medio',
    prep_time: 25,
    cook_time: 20,
    servings: 4,
    ingredients: [
      { name: 'Plátano verde', quantity: '6 unidades', type: 'fruta' },
      { name: 'Cecina ahumada', quantity: '300g', type: 'proteína' },
      { name: 'Manteca de cerdo', quantity: '3 cucharadas', type: 'grasa' },
      { name: 'Ajo', quantity: '4 dientes', type: 'condimento' },
      { name: 'Cebolla', quantity: '1 unidad', type: 'vegetal' },
      { name: 'Comino', quantity: '1 cucharadita', type: 'especia' }
    ],
    instructions: [
      'Hervir los plátanos hasta que estén tiernos',
      'Freír la cecina cortada en tiras',
      'Majar los plátanos con manteca y ajo',
      'Sofreír cebolla hasta dorar',
      'Mezclar todo y formar bolas',
      'Servir caliente acompañado de ensalada'
    ],
    nutrition: {
      calories: 380,
      protein: 25,
      carbs: 45,
      fat: 12,
      fiber: 4
    },
    is_featured: false
  }
];

async function insertSampleData() {
  try {
    console.log('🌱 Insertando datos de prueba en PocketBase...');

    // Insertar recetas de ejemplo
    console.log('🍽️  Insertando recetas de ejemplo...');
    for (const recipe of sampleRecipes) {
      try {
        await pb.collection('recipes').create(recipe);
        console.log(`✅ Receta "${recipe.name}" insertada`);
      } catch (error) {
        console.log(`ℹ️  Receta "${recipe.name}" ya existe o error: ${error.message}`);
      }
    }

    console.log('\n🎉 ¡Datos de prueba insertados exitosamente!');
    console.log('\n📊 Datos disponibles:');
    console.log(`  ✅ ${sampleRecipes.length} recetas de ejemplo`);
    console.log('  📱 Ahora puedes probar la app con datos reales');
    
    console.log('\n🔧 Para probar la funcionalidad:');
    console.log('  1. Crea una cuenta de usuario en la app');
    console.log('  2. Explora las recetas y márcalas como favoritas');
    console.log('  3. Ve tu actividad en la sección de perfil');
    console.log('  4. Usa el análisis de ingredientes con PocketBase');

  } catch (error) {
    console.error('❌ Error insertando datos de prueba:', error);
  }
}

// Ejecutar inserción de datos
insertSampleData().catch(console.error);

module.exports = { insertSampleData };
