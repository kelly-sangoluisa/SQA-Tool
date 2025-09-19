// Authentication Request DTOs
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  redirectTo?: string;
}

export interface ForgotPasswordRequest {
  email: string;
  redirectTo?: string;
}

export interface ResetPasswordRequest {
  access_token: string;
  new_password: string;
}

export interface RefreshTokenRequest {
  refresh_token?: string;
}

// Authentication Response Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: {
    id: string;
    name: string;
    description?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface AuthResponse {
  user: User;
  session: AuthTokens;
}

export interface SignInResponse {
  user: User;
  session: AuthTokens;
}

export interface SignUpResponse {
  user: User;
  session: AuthTokens;
}

export interface RefreshResponse {
  user: User;
  session: AuthTokens;
}

// Error Response Type
export interface ApiError {
  message: string;
  error?: string;
  statusCode: number;
}

// Form State Types
export interface AuthFormState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

// Auth Context Types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  signIn: (data: SignInRequest) => Promise<void>;
  signUp: (data: SignUpRequest) => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordRequest) => Promise<void>;
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;
  clearError: () => void;
}

export interface AuthContextType extends AuthState, AuthActions {}

// API Response Wrapper
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  message?: string;
}