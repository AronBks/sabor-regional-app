// 🚀 SCRIPT AUTOMÁTICO PARA CREAR COLECCIONES EN POCKETBASE
// 
// INSTRUCCIONES:
// 1. Ve a http://127.0.0.1:8090/_/
// 2. Abre la consola del navegador (F12)
// 3. Copia y pega este código completo
// 4. Presiona Enter
// 5. ¡Listo! Las 3 colecciones se crearán automáticamente

console.log('🚀 Iniciando creación automática de colecciones...');

// Función para hacer requests a la API de PocketBase
async function createCollection(collectionData) {
    try {
        const response = await fetch('/api/collections', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('pocketbase_admin_token') || document.cookie.match(/pb_admin_token=([^;]+)/)?.[1] || ''}`
            },
            body: JSON.stringify(collectionData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Colección "${collectionData.name}" creada exitosamente`);
            return result;
        } else {
            const error = await response.text();
            console.error(`❌ Error creando "${collectionData.name}":`, error);
            return null;
        }
    } catch (error) {
        console.error(`❌ Error de red creando "${collectionData.name}":`, error);
        return null;
    }
}

// Esquemas de las colecciones
const collections = [
    // 1. Colección: ingredients
    {
        "name": "ingredients",
        "type": "base",
        "system": false,
        "schema": [
            {
                "name": "name",
                "type": "text",
                "required": true,
                "options": {
                    "min": 1,
                    "max": 255
                }
            },
            {
                "name": "category",
                "type": "select",
                "required": true,
                "options": {
                    "values": ["carnes", "verduras", "frutas", "lacteos", "granos", "especias", "otros"]
                }
            },
            {
                "name": "description",
                "type": "text",
                "required": false,
                "options": {
                    "max": 500
                }
            },
            {
                "name": "image_url",
                "type": "url",
                "required": false
            },
            {
                "name": "user_id",
                "type": "relation",
                "required": true,
                "options": {
                    "collectionId": "_pb_users_auth_",
                    "cascadeDelete": true,
                    "minSelect": null,
                    "maxSelect": 1,
                    "displayFields": ["email"]
                }
            }
        ],
        "indexes": [],
        "listRule": "@request.auth.id != \"\"",
        "viewRule": "@request.auth.id != \"\"",
        "createRule": "@request.auth.id != \"\" && @request.auth.id = user_id",
        "updateRule": "@request.auth.id != \"\" && @request.auth.id = user_id",
        "deleteRule": "@request.auth.id != \"\" && @request.auth.id = user_id"
    },
    
    // 2. Colección: recipes
    {
        "name": "recipes",
        "type": "base",
        "system": false,
        "schema": [
            {
                "name": "name",
                "type": "text",
                "required": true,
                "options": {
                    "min": 1,
                    "max": 255
                }
            },
            {
                "name": "description",
                "type": "text",
                "required": true,
                "options": {
                    "max": 1000
                }
            },
            {
                "name": "instructions",
                "type": "text",
                "required": true,
                "options": {
                    "max": 5000
                }
            },
            {
                "name": "prep_time",
                "type": "number",
                "required": false,
                "options": {
                    "min": 0
                }
            },
            {
                "name": "cook_time",
                "type": "number",
                "required": false,
                "options": {
                    "min": 0
                }
            },
            {
                "name": "servings",
                "type": "number",
                "required": false,
                "options": {
                    "min": 1
                }
            },
            {
                "name": "difficulty",
                "type": "select",
                "required": false,
                "options": {
                    "values": ["facil", "intermedio", "avanzado"]
                }
            },
            {
                "name": "region",
                "type": "select",
                "required": false,
                "options": {
                    "values": ["Andina", "Costa", "Selva", "Sierra", "Pampa", "Altiplano"]
                }
            },
            {
                "name": "image_url",
                "type": "url",
                "required": false
            },
            {
                "name": "video_url",
                "type": "url",
                "required": false
            },
            {
                "name": "user_id",
                "type": "relation",
                "required": true,
                "options": {
                    "collectionId": "_pb_users_auth_",
                    "cascadeDelete": true,
                    "minSelect": null,
                    "maxSelect": 1,
                    "displayFields": ["email"]
                }
            }
        ],
        "indexes": [],
        "listRule": "@request.auth.id != \"\"",
        "viewRule": "@request.auth.id != \"\"",
        "createRule": "@request.auth.id != \"\" && @request.auth.id = user_id",
        "updateRule": "@request.auth.id != \"\" && @request.auth.id = user_id",
        "deleteRule": "@request.auth.id != \"\" && @request.auth.id = user_id"
    },
    
    // 3. Colección: ingredient_analysis
    {
        "name": "ingredient_analysis",
        "type": "base",
        "system": false,
        "schema": [
            {
                "name": "image_url",
                "type": "text",
                "required": true,
                "options": {
                    "max": 2000
                }
            },
            {
                "name": "detected_ingredients",
                "type": "json",
                "required": true,
                "options": {}
            },
            {
                "name": "confidence_score",
                "type": "number",
                "required": true,
                "options": {
                    "min": 0,
                    "max": 1
                }
            },
            {
                "name": "analysis_time",
                "type": "number",
                "required": true,
                "options": {
                    "min": 0
                }
            },
            {
                "name": "user_id",
                "type": "relation",
                "required": true,
                "options": {
                    "collectionId": "_pb_users_auth_",
                    "cascadeDelete": true,
                    "minSelect": null,
                    "maxSelect": 1,
                    "displayFields": ["email"]
                }
            }
        ],
        "indexes": [],
        "listRule": "@request.auth.id != \"\" && @request.auth.id = user_id",
        "viewRule": "@request.auth.id != \"\" && @request.auth.id = user_id",
        "createRule": "@request.auth.id != \"\" && @request.auth.id = user_id",
        "updateRule": "@request.auth.id != \"\" && @request.auth.id = user_id",
        "deleteRule": "@request.auth.id != \"\" && @request.auth.id = user_id"
    }
];

// Función principal para crear todas las colecciones
async function setupPocketBase() {
    console.log('📋 Creando las siguientes colecciones:');
    console.log('   1. ingredients (ingredientes)');
    console.log('   2. recipes (recetas)');
    console.log('   3. ingredient_analysis (análisis de ingredientes)');
    console.log('');
    
    for (let i = 0; i < collections.length; i++) {
        const collection = collections[i];
        console.log(`📦 Creando colección ${i + 1}/3: ${collection.name}...`);
        
        const result = await createCollection(collection);
        if (result) {
            console.log(`   ✅ ${collection.name} creada con ID: ${result.id}`);
        } else {
            console.log(`   ❌ Error creando ${collection.name}`);
        }
        
        // Pequeña pausa entre creaciones
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('');
    console.log('🎉 ¡Proceso completado!');
    console.log('');
    console.log('📱 Ahora puedes:');
    console.log('   1. Ir a tu app React Native');
    console.log('   2. Tocar "Usar PocketBase (Base de Datos Real)"');
    console.log('   3. Registrarte/Logearte');
    console.log('   4. ¡Disfrutar de tu app con base de datos real!');
    
    // Recargar la página para ver las nuevas colecciones
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

// Ejecutar el setup
setupPocketBase().catch(error => {
    console.error('❌ Error general en el setup:', error);
    console.log('');
    console.log('🔧 Solución alternativa:');
    console.log('   1. Crea las colecciones manualmente');
    console.log('   2. Sigue el archivo SETUP_POCKETBASE.md');
});
