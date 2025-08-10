import api from '../lib/api';
import type { 
  AuthResponse, 
  LoginCredentials, 
  RegisterData, 
  User,
  ApiResponse 
} from '../types/api';

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/v1/login', credentials);
    const { token, user } = response.data.data;
    
    // Store token in localStorage
    localStorage.setItem('auth_token', token);
    
    return response.data.data;
  },

  // Register user
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/v1/register', data);
    const { token, user } = response.data.data;
    
    // Store token in localStorage
    localStorage.setItem('auth_token', token);
    
    return response.data.data;
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post('/api/v1/logout');
    } finally {
      localStorage.removeItem('auth_token');
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/api/v1/user');
    return response.data.data;
  },

  // Update profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<ApiResponse<User>>('/api/v1/profile', data);
    return response.data.data;
  },

  // Change password
  async changePassword(data: { current_password: string; password: string; password_confirmation: string }): Promise<void> {
    await api.put('/api/v1/change-password', data);
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
};
