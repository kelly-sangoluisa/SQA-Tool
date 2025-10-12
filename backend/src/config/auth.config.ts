import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  // 🔐 Proveedor de autenticación - desde tu .env
  provider: process.env.AUTH_PROVIDER || 'supabase', // 'supabase' | 'custom' | 'firebase' | 'auth0'
  
  // 🔑 Configuración para Supabase (solo se usa si AUTH_PROVIDER=supabase)
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRole: process.env.SUPABASE_SERVICE_ROLE,
    jwtSecret: process.env.SUPABASE_JWT_SECRET,
    resetRedirectTo: process.env.SUPABASE_RESET_REDIRECT_TO,
  },
  
  // 🔑 Configuración para JWT Custom (solo se usa si AUTH_PROVIDER=custom)
  custom: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  // 🍪 Configuración de cookies - desde tu .env
  cookies: {
    domain: process.env.JWT_COOKIE_DOMAIN || undefined,
    sameSite: (process.env.COOKIE_SAMESITE as 'lax' | 'strict' | 'none') || 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
  },
}));

// 🎯 CÓMO FUNCIONA:
// 
// Si AUTH_PROVIDER=supabase:
// ✅ Usa las variables SUPABASE_*
// ✅ Ignora las variables JWT_*
//
// Si AUTH_PROVIDER=custom:
// ✅ Usa las variables JWT_*  
// ✅ Ignora las variables SUPABASE_*
//
// Para cambiar de proveedor:
// 1. Cambias AUTH_PROVIDER en .env
// 2. El código automáticamente usa la configuración correcta
// 3. No necesitas tocar código!