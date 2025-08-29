// Sistema de autenticación simplificado para la app de recetas
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://10.0.2.2:8090');

export const simpleAuthService = {
  // Crear usuario básico para la app
  async createUser(email: string, password: string, name: string) {
    try {
      const userData = {
        email: email,
        password: password,
        passwordConfirm: password,
        name: name,
        emailVisibility: true
      };

      const record = await pb.collection('users').create(userData);
      
      // Autenticar inmediatamente
      const authData = await pb.collection('users').authWithPassword(email, password);
      
      return { 
        success: true, 
        user: {
          id: authData.record.id,
          email: authData.record.email,
          name: authData.record.name,
          created: authData.record.created
        }
      };
    } catch (error: any) {
      console.error('Error creando usuario:', error);
      return { 
        success: false, 
        error: error.message || 'Error al crear usuario'
      };
    }
  },

  // Login simple
  async login(email: string, password: string) {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      
      return { 
        success: true, 
        user: {
          id: authData.record.id,
          email: authData.record.email,
          name: authData.record.name,
          created: authData.record.created
        }
      };
    } catch (error: any) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: 'Email o contraseña incorrectos'
      };
    }
  },

  // Logout
  async logout() {
    pb.authStore.clear();
    return { success: true };
  },

  // Verificar si está autenticado
  isAuthenticated() {
    return pb.authStore.isValid;
  },

  // Obtener usuario actual
  getCurrentUser() {
    if (pb.authStore.model) {
      return {
        id: pb.authStore.model.id,
        email: pb.authStore.model.email,
        name: pb.authStore.model.name,
        created: pb.authStore.model.created
      };
    }
    return null;
  },

  // Crear usuarios de prueba
  async createTestUsers() {
    const testUsers = [
      {
        email: 'usuario1@recetas.com',
        password: '12345678',
        name: 'Ana García'
      },
      {
        email: 'usuario2@recetas.com', 
        password: '12345678',
        name: 'Carlos López'
      },
      {
        email: 'chef@recetas.com',
        password: '12345678',
        name: 'Chef María'
      }
    ];

    const results = [];
    for (const user of testUsers) {
      const result = await this.createUser(user.email, user.password, user.name);
      results.push({ ...user, result });
    }
    
    return results;
  }
};

export default simpleAuthService;
