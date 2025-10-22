# 🏗️ Nueva Estructura del Backend - SQA Tool

## 📋 Resumen de la Reorganización

El backend ha sido completamente reorganizado para mejorar la colaboración del equipo, la mantenibilidad y la flexibilidad de la base de datos.

## 🗂️ Estructura Anterior vs Nueva

### ❌ Estructura Anterior
```
src/
├── auth/
├── users/
├── common/
├── types/
├── app.module.ts
└── main.ts
```

### ✅ Nueva Estructura Modular
```
src/
├── config/                    # 🔧 Configuración centralizada
│   ├── app.config.ts
│   ├── database.config.ts
│   └── supabase.config.ts
├── database/                  # 🗄️ Capa de abstracción de BD
│   ├── interfaces/
│   │   └── database-adapter.interface.ts
│   └── adapters/
│       ├── supabase.adapter.ts
│       └── typeorm.adapter.ts (futuro)
├── modules/                   # 📦 Módulos organizados por dominio
│   ├── auth/                  # 🔐 Autenticación
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── dto/
│   │   ├── guards/
│   │   ├── types/
│   │   └── auth.module.ts
│   ├── users/                 # 👥 Gestión de usuarios
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── dto/
│   │   ├── entities/
│   │   └── users.module.ts
│   ├── config-evaluation/     # ⚙️ Configuración y evaluación
│   ├── entry-data/           # 📝 Ingreso de datos
│   ├── parameterization/     # 🎛️ Parametrización
│   └── reports/              # 📊 Reportes
├── common/                   # 🔗 Utilidades compartidas
└── types/                    # 📝 Tipos globales
```

## 🎯 Beneficios de la Nueva Estructura

### 1. 👥 **Colaboración del Equipo**
- **Módulos separados** por funcionalidad
- **Responsabilidades claras** para cada desarrollador
- **Desarrollo paralelo** sin conflictos
- **README documentado** para cada módulo

### 2. 🔧 **Configuración Centralizada**
- **Variables de entorno** organizadas por categoría
- **Configuración tipada** con validación
- **Fácil cambio** entre ambientes (dev, prod)
- **Configuración flexible** de base de datos

### 3. 🗄️ **Flexibilidad de Base de Datos**
- **Patrón Adapter** para múltiples proveedores
- **Soporte Supabase** actual mantenido
- **Fácil migración** a PostgreSQL/MySQL tradicional
- **Abstracción de operaciones CRUD**

### 4. 📦 **Modularidad**
- **Estructura estándar** NestJS en cada módulo
- **Importaciones claras** y organizadas
- **Fácil testing** por módulo
- **Escalabilidad** mejorada

## 📚 Módulos de Dominio

### 🔐 **auth/** - Autenticación y Autorización
- **Responsable**: Desarrollador de seguridad
- **Funciones**: Login, registro, JWT, guards
- **Estado**: ✅ Migrado y funcional

### 👥 **users/** - Gestión de Usuarios
- **Responsable**: Desarrollador de backend
- **Funciones**: CRUD usuarios, roles, perfiles
- **Estado**: ✅ Migrado y funcional

### ⚙️ **config-evaluation/** - Configuración de Evaluaciones
- **Responsable**: Equipo de evaluación
- **Funciones**: Configurar criterios, métricas, evaluaciones
- **Estado**: 🔄 Estructura creada, pendiente implementación

### 📝 **entry-data/** - Ingreso de Datos
- **Responsable**: Equipo de frontend/UX
- **Funciones**: Formularios, validación, carga masiva
- **Estado**: 🔄 Estructura creada, pendiente implementación

### 🎛️ **parameterization/** - Parametrización
- **Responsable**: Equipo de configuración
- **Funciones**: Parámetros globales, configuraciones dinámicas
- **Estado**: 🔄 Estructura creada, pendiente implementación

### 📊 **reports/** - Reportes y Exportación
- **Responsable**: Equipo de análisis
- **Funciones**: Generación PDF, Excel, gráficos, dashboards
- **Estado**: 🔄 Estructura creada, pendiente implementación

## 🔧 Configuración del Sistema

### **config/app.config.ts** - Configuración general
```typescript
export const appConfig = () => ({
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
});
```

### **config/database.config.ts** - Configuración de BD
```typescript
export const databaseConfig = () => ({
  provider: process.env.DB_PROVIDER || 'supabase',
  url: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true',
  synchronize: process.env.NODE_ENV !== 'production',
});
```

### **config/supabase.config.ts** - Configuración Supabase
```typescript
export const supabaseConfig = () => ({
  url: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY,
  serviceRole: process.env.SUPABASE_SERVICE_ROLE,
  jwtSecret: process.env.SUPABASE_JWT_SECRET,
});
```

## 🗄️ Abstracción de Base de Datos

### **IDatabaseAdapter Interface**
```typescript
export interface IDatabaseAdapter {
  // CRUD Operations
  create<T>(table: string, data: Partial<T>): Promise<T>;
  findAll<T>(table: string, options?: QueryOptions): Promise<T[]>;
  findOne<T>(table: string, id: string | number): Promise<T | null>;
  update<T>(table: string, id: string | number, data: Partial<T>): Promise<T>;
  delete(table: string, id: string | number): Promise<boolean>;
  
  // Query Operations
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  count(table: string, conditions?: Record<string, any>): Promise<number>;
  
  // Transaction Support
  transaction<T>(callback: (trx: any) => Promise<T>): Promise<T>;
}
```

### **SupabaseAdapter Implementation**
- ✅ Implementación completa del interface
- ✅ Soporte para operaciones CRUD
- ✅ Manejo de transacciones
- ✅ Queries personalizadas

### **TypeORMAdapter (Futuro)**
- 🔄 Para migración a PostgreSQL/MySQL tradicional
- 🔄 Compatibilidad total con el interface
- 🔄 Soporte para migraciones automáticas

## 🚀 Próximos Pasos

### 1. **Implementación de Módulos** (Priority 1)
- [ ] Completar controllers y services para cada módulo
- [ ] Implementar DTOs y validaciones
- [ ] Crear entidades/interfaces para cada dominio
- [ ] Agregar documentación Swagger

### 2. **Database Flexibility** (Priority 2)
- [ ] Implementar TypeORMAdapter
- [ ] Crear sistema de migraciones
- [ ] Documentar proceso de cambio de BD
- [ ] Testing con múltiples proveedores

### 3. **Testing y Calidad** (Priority 3)
- [ ] Unit tests para cada módulo
- [ ] Integration tests
- [ ] E2E tests
- [ ] Code coverage > 80%

### 4. **Documentación** (Priority 4)
- [ ] API documentation completa
- [ ] Deployment guides
- [ ] Development setup guides
- [ ] Architecture decision records

## 🔗 Comandos Útiles

### Desarrollo
```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run start:dev

# Ejecutar tests
npm run test

# Build para producción
npm run build
```

### Database
```bash
# Generar migraciones (cuando use TypeORM)
npm run migration:generate

# Ejecutar migraciones
npm run migration:run

# Revertir migraciones
npm run migration:revert
```

---

Esta nueva estructura proporciona una base sólida para el desarrollo colaborativo y la evolución futura del sistema SQA-Tool.