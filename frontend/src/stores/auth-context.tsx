import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { authAPI } from '../api/auth';

// Auth state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Auth context interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('AuthContext: Checking authentication status...');
        const user = await authAPI.getUserInfo();
        console.log('AuthContext: User authenticated:', user);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } catch (error) {
        console.log('AuthContext: Authentication check failed:', error);
        // Don't immediately fail - the user might just need to log in
        dispatch({ type: 'AUTH_FAILURE', payload: 'Not authenticated' });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authAPI.login({ email, password });
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error: any) {
      let errorMessage = 'Login failed';

      if (error.response?.data) {
        const data = error.response.data;
        // Handle different error response formats
        if (data.detail) {
          errorMessage = data.detail;
        } else if (data.non_field_errors && data.non_field_errors.length > 0) {
          errorMessage = data.non_field_errors[0];
        } else if (data.email && data.email.length > 0) {
          errorMessage = `Email: ${data.email[0]}`;
        } else if (data.password && data.password.length > 0) {
          errorMessage = `Password: ${data.password[0]}`;
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else if (Object.keys(data).length > 0) {
          // Get the first error message from any field
          const firstField = Object.keys(data)[0];
          const firstError = data[firstField];
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = `${firstField}: ${firstError[0]}`;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.log('Login error details:', error.response?.data);
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Register function
  const register = async (email: string, username: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authAPI.register({ email, username, password });

      // Registration successful and user is automatically logged in
      // The backend now sets JWT cookies, so we can set the user as authenticated
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });

      return response.user; // Return user data for any additional handling
    } catch (error: any) {
      let errorMessage = 'Registration failed';

      if (error.response?.data) {
        const data = error.response.data;
        // Handle different error response formats
        if (data.detail) {
          errorMessage = data.detail;
        } else if (data.non_field_errors && data.non_field_errors.length > 0) {
          errorMessage = data.non_field_errors[0];
        } else if (data.email && data.email.length > 0) {
          errorMessage = `Email: ${data.email[0]}`;
        } else if (data.username && data.username.length > 0) {
          errorMessage = `Username: ${data.username[0]}`;
        } else if (data.password && data.password.length > 0) {
          errorMessage = `Password: ${data.password[0]}`;
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else if (Object.keys(data).length > 0) {
          // Get the first error message from any field
          const firstField = Object.keys(data)[0];
          const firstError = data[firstField];
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = `${firstField}: ${firstError[0]}`;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.log('Registration error details:', error.response?.data);
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
