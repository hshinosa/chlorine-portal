import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types/api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setLoading(true);
      const { user: userData } = await authService.login(credentials);
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; password_confirmation: string }) => {
    try {
      setLoading(true);
      const { user: userData } = await authService.register(data);
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Profile update failed' 
      };
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    checkAuthStatus
  };
};
