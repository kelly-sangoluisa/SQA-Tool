import { registerAs } from '@nestjs/config';

export default registerAs('supabase', () => ({
  // 🔗 Configuración básica de Supabase - desde tu .env
  url: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE, // ✅ Corregido para usar tu .env
  jwtSecret: process.env.SUPABASE_JWT_SECRET,
  resetRedirectTo: process.env.SUPABASE_RESET_REDIRECT_TO,
}));

// 🎯 NOTA: Este archivo es solo para compatibilidad
// La configuración principal de auth está en auth.config.ts
// Solo mantén este archivo si tienes código que lo use directamente