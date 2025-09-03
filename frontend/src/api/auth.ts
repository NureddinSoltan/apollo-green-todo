import apiClient, { API_ENDPOINTS } from './client';
import type { LoginForm, RegisterForm, User } from '../types';

export const authAPI = {
  // Register new user
  register: async (data: RegisterForm): Promise<User> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  // Login user
  login: async (data: LoginForm): Promise<{ user: User }> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },

  // Get current user info
  getUserInfo: async (): Promise<User> => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.USER_INFO);
    return response.data;
  },

  // Refresh token
  refreshToken: async (): Promise<{ access: string }> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
    return response.data;
  },
};
