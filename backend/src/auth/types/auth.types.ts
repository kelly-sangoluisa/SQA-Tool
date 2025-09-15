export type Tokens = {
  access_token: string;
  refresh_token: string;
};

export interface SupabaseJwtPayload {
  sub: string;   
  email?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  iss?: string;
  role?: string;      
  phone?: string;
  amr?: unknown[];
  aal?: string;
  session_id?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  [k: string]: unknown;
}