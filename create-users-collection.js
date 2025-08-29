/**
 * Script simple para crear solo la colección de usuarios
 */

const PocketBase = require('pocketbase/cjs');

const pb = new PocketBase('http://127.0.0.1:8090');

async function createUsersCollection() {
  try {
    console.log('🚀 Creando colección de usuarios...');

    // Verificar si ya existe
    try {
      const existing = await pb.collections.getOne('users');
      console.log('ℹ️  La colección users ya existe');
      return;
    } catch (error) {
      // No existe, continuar con la creación
    }

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
        }
      ]
    };

    await pb.collections.create(usersCollection);
    console.log('✅ Colección users creada exitosamente');
    
    console.log('📱 Ahora puedes usar el login en tu aplicación');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('📝 Para crear manualmente desde el panel admin:');
    console.log('1. Ve a http://127.0.0.1:8090/_/');
    console.log('2. Haz clic en "New collection"');
    console.log('3. Selecciona "Auth collection"');
    console.log('4. Nombre: users');
    console.log('5. Agrega campo "name" (text, required)');
    console.log('6. Agrega campo "avatar" (file, optional)');
  }
}

createUsersCollection();
