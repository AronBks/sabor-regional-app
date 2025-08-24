// 🚀 SCRIPT CORREGIDO PARA CREAR COLECCIONES EN POCKETBASE
// 
// INSTRUCCIONES:
// 1. Ve a http://127.0.0.1:8090/_/ y logueate como admin
// 2. Abre la consola del navegador (F12)
// 3. Copia y pega este código completo
// 4. Presiona Enter

console.log('🚀 Script de configuración PocketBase v2.0');

// Obtener token de admin desde las cookies o localStorage
function getAdminToken() {
    // Intentar desde localStorage
    const lsToken = localStorage.getItem('pocketbase_admin_token');
    if (lsToken) return lsToken;
    
    // Intentar desde cookies
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'pb_admin_token') {
            return value;
        }
    }
    
    // Intentar desde el objeto global de PocketBase
    if (window.pb && window.pb.authStore && window.pb.authStore.token) {
        return window.pb.authStore.token;
    }
    
    return null;
}

// Función mejorada para crear colecciones
async function createCollectionSafe(collectionData) {
    const token = getAdminToken();
    
    if (!token) {
        console.error('❌ No se encontró token de admin. Asegúrate de estar logueado.');
        return null;
    }
    
    try {
        const response = await fetch('/api/collections', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(collectionData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Colección "${collectionData.name}" creada exitosamente`);
            return result;
        } else if (response.status === 400) {
            const error = await response.json();
            if (error.message && error.message.includes('already exists')) {
                console.log(`⚠️ Colección "${collectionData.name}" ya existe, saltando...`);
                return { name: collectionData.name, status: 'exists' };
            } else {
                console.error(`❌ Error 400 creando "${collectionData.name}":`, error);
                return null;
            }
        } else {
            const errorText = await response.text();
            console.error(`❌ Error ${response.status} creando "${collectionData.name}":`, errorText);
            return null;
        }
    } catch (error) {
        console.error(`❌ Error de red creando "${collectionData.name}":`, error);
        return null;
    }
}

// Configuraciones simplificadas de las colecciones
const collections = [
    {
        "name": "ingredients",
        "type": "base",
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
                    "maxSelect": 1
                }
            }
        ],
        "listRule": "@request.auth.id != \"\"",
        "viewRule": "@request.auth.id != \"\"",
        "createRule": "@request.auth.id != \"\"",
        "updateRule": "@request.auth.id != \"\"",
        "deleteRule": "@request.auth.id != \"\""
    },
    {
        "name": "recipes",
        "type": "base",
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
                "required": false
            },
            {
                "name": "cook_time",
                "type": "number",
                "required": false
            },
            {
                "name": "servings",
                "type": "number",
                "required": false
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
                    "maxSelect": 1
                }
            }
        ],
        "listRule": "@request.auth.id != \"\"",
        "viewRule": "@request.auth.id != \"\"",
        "createRule": "@request.auth.id != \"\"",
        "updateRule": "@request.auth.id != \"\"",
        "deleteRule": "@request.auth.id != \"\""
    },
    {
        "name": "ingredient_analysis",
        "type": "base",
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
                "required": true
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
                    "maxSelect": 1
                }
            }
        ],
        "listRule": "@request.auth.id != \"\"",
        "viewRule": "@request.auth.id != \"\"",
        "createRule": "@request.auth.id != \"\"",
        "updateRule": "@request.auth.id != \"\"",
        "deleteRule": "@request.auth.id != \"\""
    }
];

// Función principal mejorada
async function setupPocketBaseSafe() {
    console.log('🔍 Verificando autenticación...');
    
    const token = getAdminToken();
    if (!token) {
        console.error('❌ NO ESTÁS LOGUEADO COMO ADMIN');
        console.log('');
        console.log('🔧 SOLUCIÓN:');
        console.log('   1. Cierra esta consola');
        console.log('   2. Haz login en PocketBase admin');
        console.log('   3. Vuelve a ejecutar este script');
        return;
    }
    
    console.log('✅ Token de admin encontrado');
    console.log('');
    console.log('📋 Creando colecciones...');
    
    let successCount = 0;
    let existsCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < collections.length; i++) {
        const collection = collections[i];
        console.log(`📦 [${i + 1}/3] Creando: ${collection.name}...`);
        
        const result = await createCollectionSafe(collection);
        if (result) {
            if (result.status === 'exists') {
                existsCount++;
            } else {
                successCount++;
            }
        } else {
            errorCount++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('');
    console.log('📊 RESULTADOS:');
    console.log(`   ✅ Creadas: ${successCount}`);
    console.log(`   ⚠️ Ya existían: ${existsCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log('');
    
    if (successCount > 0 || existsCount > 0) {
        console.log('🎉 ¡CONFIGURACIÓN COMPLETADA!');
        console.log('');
        console.log('📱 Próximos pasos:');
        console.log('   1. Ve a tu app React Native');
        console.log('   2. Toca "Usar PocketBase (Base de Datos Real)"');
        console.log('   3. Regístrate con email y contraseña');
        console.log('   4. ¡Disfruta tu app!');
        
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    } else {
        console.log('❌ No se pudo completar la configuración');
        console.log('');
        console.log('🔧 SOLUCIÓN ALTERNATIVA:');
        console.log('   Crear las colecciones manualmente siguiendo las instrucciones');
    }
}

// Ejecutar setup
console.log('⚡ Iniciando configuración automática...');
setupPocketBaseSafe();
