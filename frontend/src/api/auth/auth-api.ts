import { apiClient } from '../shared/api-client';
import { SignInData, SignUpData, ForgotPasswordData, ResetPasswordData, RefreshData, User, AuthResponse } from '../../types/auth.types';

export const authApi = {
  // 🔑 POST /api/auth/signin - Iniciar sesión
  async signIn(data: SignInData): Promise<AuthResponse> {
    return apiClient.post('/auth/signin', data);
  },

  // 📝 POST /api/auth/signup - Registrar evaluador
  async signUp(data: SignUpData): Promise<AuthResponse> {
    return apiClient.post('/auth/signup', data);
  },

  // 👤 GET /api/auth/me - Usuario autenticado actual
  async getMe(): Promise<User> {
    return apiClient.get('/auth/me');
  },

  // 🚪 POST /api/auth/signout - Cerrar sesión
  async signOut(): Promise<AuthResponse> {
    return apiClient.post('/auth/signout');
  },

  // 🔄 POST /api/auth/forgot-password - Enviar enlace de reset
  async forgotPassword(data: ForgotPasswordData): Promise<AuthResponse> {
    return apiClient.post('/auth/forgot-password', data);
  },

  // 🆕 POST /api/auth/reset-password - Aplicar nueva contraseña
  async resetPassword(data: ResetPasswordData): Promise<AuthResponse> {
    return apiClient.post('/auth/reset-password', data);
  },

  // 🔄 POST /api/auth/refresh - Refrescar tokens
  async refresh(data: RefreshData): Promise<AuthResponse> {
    return apiClient.post('/auth/refresh', data);
  }
};