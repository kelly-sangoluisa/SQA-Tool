import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  // 🚀 Configuración del servidor - usando tu .env
  port: parseInt(process.env.PORT || '3001', 10),
  environment: process.env.NODE_ENV || 'development',
  
  // 🔗 Configuración de API - usando tu .env
  apiPrefix: process.env.API_PREFIX || 'api',
  
  // 🌐 Configuración de CORS - usando tu .env
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000', 
    'http://localhost:4200'
  ],
  
  // 🍪 Configuración de cookies - usando tu .env
  cookies: {
    domain: process.env.JWT_COOKIE_DOMAIN || undefined,
    sameSite: (process.env.COOKIE_SAMESITE as 'lax' | 'strict' | 'none') || 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
  },
  
  // ⚡ Rate Limiting - usando tu .env
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
  },
}));