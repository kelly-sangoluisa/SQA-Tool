# 🎯 SQA-Tool - Sistema de Evaluación de Calidad de Software

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
</p>

<p align="center">
  Sistema modular para la evaluación de calidad de proyectos de software, desarrollado con arquitectura moderna y escalable.
</p>

## 📋 Tabla de Contenidos

- [🚀 Características Principales](#-características-principales)
- [🏗️ Arquitectura del Proyecto](#️-arquitectura-del-proyecto)
- [📦 Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [⚙️ Configuración del Entorno](#️-configuración-del-entorno)
- [🚀 Instalación y Ejecución](#-instalación-y-ejecución)
- [🧪 Testing](#-testing)
- [📚 Documentación de la API](#-documentación-de-la-api)
- [🔧 Configuración Avanzada](#-configuración-avanzada)
- [🚀 Despliegue](#-despliegue)
- [👥 Contribuir](#-contribuir)

## 🚀 Características Principales

### ✨ **Sistema Modular Completo**
- **Configuración de Evaluación**: Configurar criterios y parámetros
- **Entrada de Datos**: Gestión de datos de proyectos  
- **Parametrización**: Configuración avanzada del sistema
- **Reportes**: Generación y visualización de reportes

### 🔐 **Autenticación Robusta**
- Integración con **Supabase** para autenticación
- Sistema de roles (**Admin** / **Evaluator**)
- Protección de rutas y endpoints
- Gestión segura de cookies y tokens

### 🏗️ **Arquitectura Escalable**
- **Backend**: NestJS con TypeScript y arquitectura modular
- **Frontend**: Next.js 14 con App Router y Tailwind CSS
- **Base de Datos**: PostgreSQL con TypeORM
- **CI/CD**: GitHub Actions configurado

## 🏗️ Arquitectura del Proyecto

```
SQA-Tool/
├── backend/                    # 🚀 API NestJS
│   ├── src/
│   │   ├── auth/              # 🔐 Módulo de autenticación
│   │   ├── users/             # 👥 Gestión de usuarios
│   │   ├── modules/           # 📦 Módulos específicos del negocio
│   │   │   ├── config-evaluation/
│   │   │   ├── entry-data/
│   │   │   ├── parameterization/
│   │   │   └── reports/
│   │   ├── config/            # ⚙️ Configuraciones centralizadas
│   │   └── common/            # 🤝 Código compartido
│   └── test/                  # 🧪 Tests automatizados
├── frontend/                  # 🎨 Next.js Frontend
│   ├── src/
│   │   ├── app/               # 📄 App Router (Next.js 14)
│   │   ├── components/        # 🧩 Componentes reutilizables
│   │   ├── api/               # 🔗 Llamadas a la API
│   │   ├── hooks/             # 🎣 Custom hooks
│   │   └── utils/             # 🛠️ Utilidades
└── .github/workflows/         # 🔄 CI/CD con GitHub Actions
```

## 📦 Tecnologías Utilizadas

### **Backend (NestJS)**
- **NestJS 10+** - Framework Node.js progresivo
- **TypeScript** - Tipado estático
- **TypeORM** - ORM para bases de datos
- **PostgreSQL** - Base de datos principal
- **Supabase** - Backend-as-a-Service para auth y BD
- **Swagger/OpenAPI** - Documentación automática de API
- **Jest** - Framework de testing

### **Frontend (Next.js)**
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS utility-first
- **React Hook Form** - Gestión de formularios
- **Lucide React** - Iconos modernos

### **DevOps & Tools**
- **Docker** - Contenedorización
- **GitHub Actions** - CI/CD
- **ESLint + Prettier** - Linting y formateo
- **Husky** - Git hooks

## ⚙️ Configuración del Entorno

### **Requisitos Previos**

```bash
# Node.js (versión 18 o superior)
node --version  # v18.0.0+

# npm (incluido con Node.js)
npm --version   # 9.0.0+

# Git
git --version  # 2.30.0+
```

### **Variables de Entorno**

#### **Backend (`.env`)**

Crea un archivo `.env` en la carpeta `backend/` con la siguiente estructura:

```env
# =============================================================================
# CONFIGURACIÓN DE BASE DE DATOS
# =============================================================================
DB_TYPE=postgres
DATABASE_URL=postgresql://user:password@host:port/database
DB_SSL=true
DB_LOGGING=false

# =============================================================================
# CONFIGURACIÓN DE AUTENTICACIÓN
# =============================================================================
AUTH_PROVIDER=supabase

# ---- Configuración Supabase ----
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_RESET_REDIRECT_TO=http://localhost:3000/auth/reset-password

# =============================================================================
# CONFIGURACIÓN GENERAL
# =============================================================================
NODE_ENV=development
PORT=3001
API_PREFIX=api

# Rate limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:4200

# Cookies
COOKIE_SAMESITE=lax
COOKIE_SECURE=false
```

#### **Frontend (`.env.local`)**

Crea un archivo `.env.local` en la carpeta `frontend/` con:

```env
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Configuración de la app
NEXT_PUBLIC_APP_NAME=Sistema de Evaluación SQA
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### **🔧 Configuración de Supabase**

1. **Crear proyecto en Supabase**:
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto
   - Copia las credenciales (URL, anon key, service role key)

2. **Configurar la base de datos**:
   ```sql
   -- Crear tabla de roles
   CREATE TABLE roles (
     id SERIAL PRIMARY KEY,
     name VARCHAR(50) UNIQUE NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Insertar roles por defecto
   INSERT INTO roles (name) VALUES ('admin'), ('evaluator');

   -- Crear tabla de usuarios
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     name VARCHAR(255) NOT NULL,
     role_id INTEGER REFERENCES roles(id),
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

## 🚀 Instalación y Ejecución

### **🔧 Setup Completo (Recomendado)**

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/SQA-Tool.git
cd SQA-Tool

# 2. Instalar dependencias del backend
cd backend
npm install

# 3. Configurar variables de entorno del backend
cp .env.example .env
# Editar .env con tus configuraciones

# 4. Ejecutar migraciones/sincronizar BD
npm run start:dev  # TypeORM sincronizará automáticamente

# 5. Instalar dependencias del frontend (en otra terminal)
cd ../frontend
npm install

# 6. Configurar variables de entorno del frontend
cp .env.local.example .env.local
# Editar .env.local con tus configuraciones

# 7. Ejecutar frontend
npm run dev
```

### **🚀 Ejecución en Desarrollo**

#### **Backend (Puerto 3001)**
```bash
cd backend

# Modo desarrollo (con hot reload)
npm run start:dev

# Modo debug
npm run start:debug

# Verificar que funciona
curl http://localhost:3001/api
```

#### **Frontend (Puerto 3000)**
```bash
cd frontend

# Modo desarrollo (con hot reload y Turbopack)
npm run dev

# Abrir en navegador
open http://localhost:3000
```

### **📱 Acceso a la Aplicación**

Una vez ejecutado todo:

1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:3001/api
3. **Documentación Swagger**: http://localhost:3001/api/docs
4. **Dashboard de Supabase**: https://app.supabase.com

### **👤 Usuario de Prueba**

Puedes crear un usuario desde la aplicación o directamente en Supabase:

```json
{
  "email": "admin@example.com",
  "password": "123456789",
  "name": "Administrador"
}
```

## 🧪 Testing

### **Backend Tests**

```bash
cd backend

# Tests unitarios
npm run test

# Tests con coverage
npm run test:cov

# Tests e2e
npm run test:e2e

# Tests en modo watch
npm run test:watch

# Ejecutar tests específicos
npm run test auth.service.spec.ts
```

### **Frontend Tests**

```bash
cd frontend

# Tests con Jest
npm run test

# Tests en modo watch
npm run test:watch

# Tests de componentes específicos
npm run test LoginForm
```

### **🔍 Lint y Formato**

```bash
# Backend
cd backend
npm run lint
npm run format

# Frontend
cd frontend
npm run lint
npm run lint:fix
```

## 📚 Documentación de la API

### **🔗 Swagger/OpenAPI**

La documentación interactiva está disponible en:
- **Desarrollo**: http://localhost:3001/api/docs
- **Producción**: https://tu-api.railway.app/api/docs

### **📋 Endpoints Principales**

#### **Autenticación**
```bash
POST /api/auth/signin     # Iniciar sesión
POST /api/auth/signup     # Registrarse
POST /api/auth/signout    # Cerrar sesión
GET  /api/auth/me         # Usuario actual
POST /api/auth/forgot-password  # Recuperar contraseña
POST /api/auth/reset-password   # Resetear contraseña
```

#### **Usuarios**
```bash
GET    /api/users         # Listar usuarios
GET    /api/users/:id     # Obtener usuario específico
PUT    /api/users/:id     # Actualizar usuario
DELETE /api/users/:id     # Eliminar usuario
```

#### **Módulos de Evaluación**
```bash
GET    /api/config-evaluation     # Configuraciones
GET    /api/entry-data           # Datos de entrada
GET    /api/parameterization     # Parametrizaciones
GET    /api/reports              # Reportes
```

### **🔐 Autenticación de Requests**

```typescript
// Ejemplo de uso con fetch
const response = await fetch('http://localhost:3001/api/auth/me', {
  method: 'GET',
  credentials: 'include', // ¡IMPORTANTE! Para incluir cookies
  headers: {
    'Content-Type': 'application/json'
  }
});
```

## 🔧 Configuración Avanzada

### **🎛️ Configuración Modular**

El backend usa un sistema de configuración modular centralizado:

```typescript
// config/app.config.ts - Configuración general
// config/database.config.ts - Base de datos
// config/auth.config.ts - Autenticación
```

### **🔄 Migración de Supabase a otra BD**

Para cambiar de Supabase a PostgreSQL tradicional:

```env
# En backend/.env
AUTH_PROVIDER=custom
DATABASE_URL=postgresql://user:pass@localhost:5432/sqa_tool
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=1d
```

### **🚀 Performance y Optimización**

```bash
# Backend - Optimización de producción
npm run build
npm run start:prod

# Frontend - Build optimizado
npm run build
npm start
```

## 🚀 Despliegue

### **🚄 Railway (Recomendado)**

#### **Backend en Railway**

1. **Conectar repositorio**:
   ```bash
   # Instalar Railway CLI
   npm install -g @railway/cli
   
   # Login y deployar
   railway login
   railway link
   railway up
   ```

2. **Variables de entorno en Railway**:
   ```env
   NODE_ENV=production
   DATABASE_URL=${RAILWAY_POSTGRES_URL}
   SUPABASE_URL=https://your-project.supabase.co
   # ... resto de variables
   ```

#### **Frontend en Vercel**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deployar
cd frontend
vercel

# Variables de entorno en Vercel
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app/api
```

### **🔧 Variables de Producción**

#### **Backend (.env)**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=${RAILWAY_POSTGRES_URL}
CORS_ORIGINS=https://tu-frontend.vercel.app
COOKIE_SECURE=true
```

#### **Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app/api
```

## 👥 Contribuir

### **🔀 Workflow de Desarrollo**

```bash
# 1. Fork del repositorio
git clone https://github.com/tu-usuario/SQA-Tool.git

# 2. Crear rama para nueva feature
git checkout -b feature/nueva-funcionalidad

# 3. Desarrollar y commitear
git add .
git commit -m "feat: agregar nueva funcionalidad"

# 4. Push y crear PR
git push origin feature/nueva-funcionalidad
```

### **📝 Convenciones**

#### **Commits**
Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: nueva funcionalidad
fix: corrección de bug
docs: actualización de documentación
style: cambios de formato
refactor: refactorización de código
test: agregar/modificar tests
```

#### **Estructura de Módulos**

Al agregar nuevos módulos, seguir la estructura:

```
src/modules/nuevo-modulo/
├── controllers/     # Controladores REST
├── dto/            # Data Transfer Objects
├── entities/       # Entidades de BD
├── interfaces/     # Interfaces TypeScript
├── services/       # Lógica de negocio
└── README.md       # Documentación del módulo
```

### **🧪 Tests Requeridos**

```bash
# Antes de hacer PR, asegurar que pasan todos los tests
cd backend && npm run test
cd frontend && npm run test

# Verificar lint
npm run lint
```

### **📋 Checklist de PR**

- [ ] Tests pasan ✅
- [ ] Lint sin errores ✅
- [ ] Documentación actualizada ✅
- [ ] Variables de entorno documentadas ✅
- [ ] Migraciones de BD incluidas (si aplica) ✅

## 📞 Soporte y Contacto

### **🐛 Reportar Bugs**

1. **Buscar issues existentes** en GitHub
2. **Crear nuevo issue** con:
   - Descripción del problema
   - Pasos para reproducir
   - Logs relevantes
   - Versión de Node.js y npm

### **💡 Solicitar Features**

1. **Crear issue** con label `enhancement`
2. **Describir la funcionalidad** deseada
3. **Justificar el caso de uso**

### **📚 Recursos Adicionales**

- **[NestJS Documentation](https://docs.nestjs.com/)**
- **[Next.js Documentation](https://nextjs.org/docs)**
- **[Supabase Documentation](https://supabase.com/docs)**
- **[Railway Documentation](https://docs.railway.app/)**

---

<p align="center">
  Desarrollado con ❤️ para la evaluación de calidad de software
</p>

<p align="center">
  <a href="https://github.com/tu-usuario/SQA-Tool/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  </a>
  <a href="https://github.com/tu-usuario/SQA-Tool/releases">
    <img src="https://img.shields.io/github/v/release/tu-usuario/SQA-Tool" alt="Release">
  </a>
  <a href="https://github.com/tu-usuario/SQA-Tool/actions">
    <img src="https://img.shields.io/github/workflow/status/tu-usuario/SQA-Tool/CI" alt="CI Status">
  </a>
</p>
by Dev-Sentinels
