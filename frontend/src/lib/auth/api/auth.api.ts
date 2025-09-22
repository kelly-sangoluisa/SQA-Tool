import { AuthResponse, User } from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiError {
  message: string;
  error?: string;
  statusCode: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

// Función helper para hacer requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: {
          message: data.message || 'Ocurrió un error',
          error: data.error,
          statusCode: response.status,
        }
      };
    }

    return { data };
  } catch (error) {
    return {
      error: {
        message: 'Error de conexión. Verifica tu conexión a internet.',
        statusCode: 0,
      }
    };
  }
}

// Auth API calls 
export const authAPI = {
  // POST /auth/signin
  signIn: (email: string, password: string) =>
    apiRequest<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // POST /auth/signup  
  signUp: (email: string, password: string, name: string, redirectTo?: string) =>
    apiRequest<AuthResponse>('/auth/signup', {
      method: 'POST', 
      body: JSON.stringify({ email, password, name, redirectTo }),
    }),

  // POST /auth/forgot-password
  forgotPassword: (email: string, redirectTo?: string) =>
    apiRequest<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, redirectTo }),
    }),

  // POST /auth/reset-password
  resetPassword: (access_token: string, new_password: string) =>
    apiRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST', 
      body: JSON.stringify({ access_token, new_password }),
    }),

  // POST /auth/refresh
  refresh: (refresh_token: string) =>
    apiRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token }),
    }),

  // POST /auth/signout
  signOut: () =>
    apiRequest<{ message: string }>('/auth/signout', { method: 'POST' }),

  // GET /auth/me  
  me: () =>
    apiRequest<User>('/auth/me', { method: 'GET' }),
};