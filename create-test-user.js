/**
 * Script para crear un usuario de prueba
 */

const PocketBase = require('pocketbase/cjs');

const pb = new PocketBase('http://127.0.0.1:8090');

async function createTestUser() {
  try {
    console.log('👤 Creando usuario de prueba...');

    const userData = {
      email: 'test@recetas.com',
      password: '12345678',
      passwordConfirm: '12345678',
      name: 'Usuario de Prueba',
      emailVisibility: true
    };

    const record = await pb.collection('users').create(userData);
    
    console.log('✅ Usuario de prueba creado exitosamente!');
    console.log('📧 Email: test@recetas.com');
    console.log('🔑 Password: 12345678');
    console.log('👤 Nombre: Usuario de Prueba');
    console.log('');
    console.log('🚀 Ahora puedes usar estos datos para hacer login en tu app');
    
  } catch (error) {
    if (error.message && error.message.includes('already exists')) {
      console.log('ℹ️  El usuario de prueba ya existe');
      console.log('📧 Email: test@recetas.com');
      console.log('🔑 Password: 12345678');
    } else {
      console.error('❌ Error creando usuario:', error.message);
      console.log('');
      console.log('💡 Asegúrate de que:');
      console.log('1. PocketBase esté ejecutándose en puerto 8090');
      console.log('2. La colección "users" exista en el panel admin');
    }
  }
}

createTestUser();
