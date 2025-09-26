import { AuthResponse, User } from '../types/auth';
import { apiClient } from '@/lib/api/client';

export const authAPI = {
  signIn: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/signin', { email, password }),

  signUp: (email: string, password: string, name: string, redirectTo?: string) =>
    apiClient.post<AuthResponse>('/auth/signup', { 
      email, 
      password, 
      name, 
      redirectTo 
    }),

  forgotPassword: (email: string, redirectTo?: string) =>
    apiClient.post<{ message: string }>('/auth/forgot-password', { 
      email, 
      redirectTo 
    }),

  resetPassword: (access_token: string, new_password: string) =>
    apiClient.post<{ message: string }>('/auth/reset-password', { 
      access_token, 
      new_password 
    }),

  refresh: (refresh_token: string) =>
    apiClient.post<AuthResponse>('/auth/refresh', { refresh_token }),

  signOut: () =>
    apiClient.post<{ message: string }>('/auth/signout'),

  me: () =>
    apiClient.get<User>('/auth/me'),

  healthCheck: () =>
    apiClient.get<{ status: string, message: string }>('/'),
};