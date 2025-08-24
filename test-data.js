// 🎯 SCRIPT PARA INSERTAR DATOS DE PRUEBA EN POCKETBASE
//
// INSTRUCCIONES:
// 1. Asegúrate de haber creado las colecciones primero (auto-setup-pocketbase.js)
// 2. Ve a http://127.0.0.1:8090/_/
// 3. Abre la consola del navegador (F12)
// 4. Copia y pega este código
// 5. ¡Tendrás ingredientes y recetas de prueba!

console.log('🍽️ Insertando datos de prueba...');

// Función para insertar datos
async function insertData(collection, data) {
    try {
        const response = await fetch(`/api/collections/${collection}/records`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('pocketbase_admin_token') || document.cookie.match(/pb_admin_token=([^;]+)/)?.[1] || ''}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Insertado en ${collection}:`, result.name || result.id);
            return result;
        } else {
            const error = await response.text();
            console.error(`❌ Error insertando en ${collection}:`, error);
            return null;
        }
    } catch (error) {
        console.error(`❌ Error de red en ${collection}:`, error);
        return null;
    }
}

// Obtener ID del primer usuario (admin)
async function getUserId() {
    try {
        const response = await fetch('/api/collections/users/records', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('pocketbase_admin_token') || document.cookie.match(/pb_admin_token=([^;]+)/)?.[1] || ''}`
            }
        });
        const data = await response.json();
        return data.items[0]?.id || 'demo-user-id';
    } catch {
        return 'demo-user-id';
    }
}

// Datos de ingredientes de prueba
const ingredientes = [
    { name: 'Pollo', category: 'carnes', description: 'Pechuga de pollo fresca' },
    { name: 'Arroz', category: 'granos', description: 'Arroz blanco de grano largo' },
    { name: 'Tomate', category: 'verduras', description: 'Tomate rojo maduro' },
    { name: 'Cebolla', category: 'verduras', description: 'Cebolla blanca mediana' },
    { name: 'Ajo', category: 'especias', description: 'Dientes de ajo frescos' },
    { name: 'Leche', category: 'lacteos', description: 'Leche entera' },
    { name: 'Queso', category: 'lacteos', description: 'Queso fresco' },
    { name: 'Papa', category: 'verduras', description: 'Papa amarilla peruana' },
    { name: 'Limón', category: 'frutas', description: 'Limón verde peruano' },
    { name: 'Cilantro', category: 'especias', description: 'Cilantro fresco' },
    { name: 'Pescado', category: 'carnes', description: 'Pescado fresco del día' },
    { name: 'Camote', category: 'verduras', description: 'Camote dulce' }
];

// Datos de recetas de prueba
const recetas = [
    {
        name: 'Arroz con Pollo',
        description: 'Delicioso arroz con pollo al estilo peruano, un clásico de la gastronomía nacional',
        instructions: '1. Cortar el pollo en presas\n2. Sofreír con ajo y cebolla\n3. Agregar arroz y caldo\n4. Cocinar por 20 minutos\n5. Servir caliente',
        prep_time: 15,
        cook_time: 30,
        servings: 4,
        difficulty: 'intermedio',
        region: 'Costa'
    },
    {
        name: 'Papa Rellena',
        description: 'Papa rellena tradicional peruana con relleno de carne',
        instructions: '1. Hervir papas hasta que estén suaves\n2. Hacer puré de papa\n3. Preparar relleno con carne\n4. Formar las papas rellenas\n5. Freír hasta dorar',
        prep_time: 20,
        cook_time: 25,
        servings: 6,
        difficulty: 'avanzado',
        region: 'Andina'
    },
    {
        name: 'Ceviche',
        description: 'Ceviche fresco peruano con pescado y limón',
        instructions: '1. Cortar pescado en cubos\n2. Marinar con limón por 10 minutos\n3. Agregar cebolla y cilantro\n4. Sazonar con sal y ají\n5. Servir inmediatamente',
        prep_time: 20,
        cook_time: 0,
        servings: 2,
        difficulty: 'facil',
        region: 'Costa'
    },
    {
        name: 'Pachamanca',
        description: 'Plato tradicional andino cocinado bajo tierra',
        instructions: '1. Preparar el horno de tierra\n2. Sazonar carnes y verduras\n3. Envolver en hojas\n4. Cocinar bajo tierra por 2 horas\n5. Servir con salsas',
        prep_time: 60,
        cook_time: 120,
        servings: 8,
        difficulty: 'avanzado',
        region: 'Andina'
    }
];

// Función principal
async function insertTestData() {
    const userId = await getUserId();
    console.log(`👤 Usando usuario ID: ${userId}`);
    
    console.log('📦 Insertando ingredientes...');
    const insertedIngredients = [];
    
    for (const ingrediente of ingredientes) {
        const data = { ...ingrediente, user_id: userId };
        const result = await insertData('ingredients', data);
        if (result) {
            insertedIngredients.push(result);
        }
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('🍽️ Insertando recetas...');
    for (const receta of recetas) {
        const data = { ...receta, user_id: userId };
        await insertData('recipes', data);
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('');
    console.log('🎉 ¡Datos de prueba insertados exitosamente!');
    console.log(`   ✅ ${ingredientes.length} ingredientes`);
    console.log(`   ✅ ${recetas.length} recetas`);
    console.log('');
    console.log('📱 Ahora tu app tendrá datos reales para probar');
    
    // Recargar para ver los datos
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

// Ejecutar inserción de datos
insertTestData().catch(error => {
    console.error('❌ Error insertando datos:', error);
});
