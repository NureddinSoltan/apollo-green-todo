import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for JWT cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth headers if needed
apiClient.interceptors.request.use(
  (config) => {
    // You can add any request logic here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      // You can redirect to login or refresh token here
      console.log('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/api/auth/register/',
    LOGIN: '/api/auth/login/',
    LOGOUT: '/api/auth/logout/',
    USER_INFO: '/api/auth/user-info/',
    REFRESH: '/api/auth/refresh/',
  },
  // Categories
  CATEGORIES: '/api/categories/',
  // Projects
  PROJECTS: '/api/projects/',
  PROJECT_DASHBOARD: '/api/projects/dashboard/',
  // Tasks
  TASKS: '/api/tasks/',
} as const;

export default apiClient;
