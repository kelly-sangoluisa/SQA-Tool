// Tipos que coinciden EXACTAMENTE con tu backend
export interface User {
  id: number;
  name: string;
  email: string;
  role: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  redirectTo?: string;
}

export interface ForgotPasswordData {
  email: string;
  redirectTo?: string;
}

export interface ResetPasswordData {
  access_token: string;
  new_password: string;
}

export interface RefreshData {
  refresh_token?: string;
}

export interface AuthResponse {
  message: string;
}

export interface ApiResponse {
  success?: boolean;
  error?: string;
  message?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  signIn: (data: SignInData) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}