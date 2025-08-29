// Script para configurar automáticamente las colecciones de PocketBase
// Ejecutar este archivo después de iniciar PocketBase por primera vez

const PocketBase = require('pocketbase');
const pb = new PocketBase('http://127.0.0.1:8090');

async function setupCollections() {
  try {
    console.log('🚀 Configurando colecciones de PocketBase...');
    
    // 1. Configurar colección de favoritos de usuario
    console.log('📚 Creando colección user_favorites...');
    try {
      await pb.collections.create({
        name: 'user_favorites',
        type: 'base',
        schema: [
          {
            name: 'user',
            type: 'relation',
            required: true,
            options: {
              collectionId: '_pb_users_auth_',
              cascadeDelete: true,
              maxSelect: 1
            }
          },
          {
            name: 'recipe_id',
            type: 'number',
            required: true,
            options: {
              min: 1
            }
          },
          {
            name: 'recipe_name',
            type: 'text',
            required: true,
            options: {
              min: 1,
              max: 200
            }
          },
          {
            name: 'recipe_region',
            type: 'text',
            required: true,
            options: {
              min: 1,
              max: 100
            }
          },
          {
            name: 'created_at',
            type: 'date',
            required: true
          }
        ],
        indexes: [
          'CREATE INDEX user_recipe_idx ON user_favorites (user, recipe_id)'
        ]
      });
      console.log('✅ Colección user_favorites creada');
    } catch (error) {
      console.log('ℹ️  Colección user_favorites ya existe');
    }

    // 2. Configurar colección de actividad de usuario
    console.log('📊 Creando colección user_activity...');
    try {
      await pb.collections.create({
        name: 'user_activity',
        type: 'base',
        schema: [
          {
            name: 'user',
            type: 'relation',
            required: true,
            options: {
              collectionId: '_pb_users_auth_',
              cascadeDelete: true,
              maxSelect: 1
            }
          },
          {
            name: 'recipe_id',
            type: 'number',
            required: true,
            options: {
              min: 1
            }
          },
          {
            name: 'recipe_name',
            type: 'text',
            required: true,
            options: {
              min: 1,
              max: 200
            }
          },
          {
            name: 'action',
            type: 'select',
            required: true,
            options: {
              values: ['view', 'favorite', 'unfavorite', 'share']
            }
          },
          {
            name: 'created_at',
            type: 'date',
            required: true
          }
        ],
        indexes: [
          'CREATE INDEX user_activity_idx ON user_activity (user, created_at DESC)'
        ]
      });
      console.log('✅ Colección user_activity creada');
    } catch (error) {
      console.log('ℹ️  Colección user_activity ya existe');
    }

    // 3. Configurar colección de recetas del sistema (opcional para futuro)
    console.log('🍽️  Creando colección recipes...');
    try {
      await pb.collections.create({
        name: 'recipes',
        type: 'base',
        schema: [
          {
            name: 'name',
            type: 'text',
            required: true,
            options: {
              min: 1,
              max: 200
            }
          },
          {
            name: 'description',
            type: 'editor',
            required: false
          },
          {
            name: 'region',
            type: 'select',
            required: true,
            options: {
              values: ['Andina', 'Costa', 'Amazónica', 'Pampa', 'Altiplano', 'Sierra']
            }
          },
          {
            name: 'difficulty',
            type: 'select',
            required: true,
            options: {
              values: ['Fácil', 'Medio', 'Difícil']
            }
          },
          {
            name: 'prep_time',
            type: 'number',
            required: false,
            options: {
              min: 1
            }
          },
          {
            name: 'cook_time',
            type: 'number',
            required: false,
            options: {
              min: 1
            }
          },
          {
            name: 'servings',
            type: 'number',
            required: false,
            options: {
              min: 1
            }
          },
          {
            name: 'ingredients',
            type: 'json',
            required: false
          },
          {
            name: 'instructions',
            type: 'json',
            required: false
          },
          {
            name: 'nutrition',
            type: 'json',
            required: false
          },
          {
            name: 'image_url',
            type: 'url',
            required: false
          },
          {
            name: 'video_url',
            type: 'url',
            required: false
          },
          {
            name: 'created_by',
            type: 'relation',
            required: false,
            options: {
              collectionId: '_pb_users_auth_',
              maxSelect: 1
            }
          },
          {
            name: 'is_featured',
            type: 'bool',
            required: false
          }
        ]
      });
      console.log('✅ Colección recipes creada');
    } catch (error) {
      console.log('ℹ️  Colección recipes ya existe');
    }

    // 4. Actualizar colección de usuarios para incluir preferencias
    console.log('👤 Actualizando colección de usuarios...');
    try {
      const usersCollection = await pb.collections.getOne('_pb_users_auth_');
      
      // Verificar si el campo preferences ya existe
      const hasPreferences = usersCollection.schema.some(field => field.name === 'preferences');
      
      if (!hasPreferences) {
        usersCollection.schema.push({
          name: 'preferences',
          type: 'json',
          required: false,
          options: {}
        });
        
        await pb.collections.update(usersCollection.id, usersCollection);
        console.log('✅ Campo preferences agregado a usuarios');
      } else {
        console.log('ℹ️  Campo preferences ya existe en usuarios');
      }
    } catch (error) {
      console.log('⚠️  Error actualizando usuarios:', error.message);
    }

    console.log('\n🎉 ¡Configuración de PocketBase completada!');
    console.log('\n📋 Resumen de colecciones:');
    console.log('  ✅ users (auth) - Usuarios del sistema');
    console.log('  ✅ user_favorites - Recetas favoritas de usuarios');
    console.log('  ✅ user_activity - Actividad de usuarios');
    console.log('  ✅ recipes - Recetas del sistema (opcional)');
    console.log('  ✅ ingredient_analysis - Análisis de ingredientes');
    
    console.log('\n🔧 Próximos pasos:');
    console.log('  1. Accede al panel admin: http://127.0.0.1:8090/_/');
    console.log('  2. Crea un usuario admin si no lo has hecho');
    console.log('  3. Configura las reglas de acceso en las colecciones');
    console.log('  4. ¡Tu app está lista para funcionar!');

  } catch (error) {
    console.error('❌ Error configurando PocketBase:', error);
  }
}

// Ejecutar configuración
setupCollections().catch(console.error);

module.exports = { setupCollections };
