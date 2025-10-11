import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  // 🗄️ Configuración UNIVERSAL de base de datos - funciona para Supabase Y PostgreSQL local
  
  // Opción 1: URL completa (recomendada) - desde tu .env
  url: process.env.DATABASE_URL,
  
  // Tipo de base de datos - desde tu .env
  type: (process.env.DB_TYPE as 'postgres' | 'mysql' | 'sqlite') || 'postgres',
  
  // 🔒 Configuración SSL - desde tu .env
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  
  // 🔄 Configuración de desarrollo - desde tu .env
  synchronize: process.env.NODE_ENV !== 'production', // Auto-sync solo en desarrollo
  logging: process.env.DB_LOGGING === 'true',
  
  // ✨ Configuración automática
  autoLoadEntities: true, // Encuentra automáticamente las entidades
  
  // 🏊 Pool de conexiones (opcional)
  poolSize: 10,
  connectionTimeoutMillis: 30000,
}));

// 🎯 ESTA configuración funciona para:
// ✅ Supabase (con DATABASE_URL)
// ✅ PostgreSQL local (con DATABASE_URL o variables separadas)  
// ✅ MySQL (cambiando DB_TYPE=mysql)
// ✅ SQLite (cambiando DB_TYPE=sqlite)