import { useState, useEffect } from 'react';
import { authService, initializePocketBase } from '../pocketbase';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      await initializePocketBase();
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error al inicializar autenticación:', error);
      // No hacer nada más, solo establecer loading en false
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const register = async (email: string, password: string, passwordConfirm: string, name: string) => {
    const result = await authService.register(email, password, passwordConfirm, name);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateProfile = async (data: any) => {
    const result = await authService.updateProfile(data);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
  };
};
