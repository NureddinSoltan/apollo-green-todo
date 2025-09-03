import apiClient from './client';
import type { LoginForm, RegisterForm, User } from '../types';

export const authAPI = {
  // Register new user
  register: async (data: RegisterForm): Promise<User> => {
    const response = await apiClient.post('/auth/register/', data);
    return response.data;
  },

  // Login user
  login: async (data: LoginForm): Promise<{ user: User }> => {
    const response = await apiClient.post('/auth/login/', data);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/logout/');
    return response.data;
  },

  // Get current user info
  getUserInfo: async (): Promise<User> => {
    const response = await apiClient.get('/auth/user-info/');
    return response.data;
  },

  // Refresh token
  refreshToken: async (): Promise<{ access: string }> => {
    const response = await apiClient.post('/auth/refresh/');
    return response.data;
  },
};
