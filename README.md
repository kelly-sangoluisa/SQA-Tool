# 🎯 SQA-Tool

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS 11">
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5.7">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind 4">
  <img src="https://img.shields.io/badge/Supabase-2.0-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
</p>

<p align="center">
  HERRAMIENTA PARA APOYO A LA EVALUACIÓN DE CALIDAD DE PRODUCTOS SOFTWARE BASADA EN LA SERIE DE NORMAS ISO/IEC 25000 
</p>

## 📋 Tabla de Contenidos

- [⚡ Inicio Rápido](#-inicio-rápido)
- [🌎 Aplicación en Producción](#-aplicación-en-producción)
- [🚀 Características Principales](#-características-principales)
- [🏭️ Arquitectura del Proyecto](#️-arquitectura-del-proyecto)
- [📦 Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [🚀 Instalación y Ejecución Local](#-instalación-y-ejecución-local)
- [🧪 Testing](#-testing)
- [👥 Contribuir](#-contribuir)

## ⚡ Inicio Rápido

La forma más rápida de empezar es usar la aplicación desplegada:

1. **Accede a la aplicación**: [https://sqa-tool.vercel.app](https://sqa-tool.vercel.app)
2. **Crea una cuenta** o inicia sesión
3. **Empieza a evaluar** proyectos de software

## 🌐 Aplicación en Producción

| Servicio | URL | Descripción |
|----------|-----|-------------|
| 🎨 **Frontend** | [sqa-tool.vercel.app](https://sqa-tool.vercel.app) | Aplicación Next.js desplegada en Vercel |
| 🚀 **Backend API** | [sqa-tool-production.up.railway.app/api](https://sqa-tool-production.up.railway.app/api) | API NestJS desplegada en Railway |
| 📚 **API Docs** | [sqa-tool-production.up.railway.app/api/docs](https://sqa-tool-production.up.railway.app/api/docs) | Documentación Swagger interactiva |
| 🗄️ **Base de Datos** | Supabase PostgreSQL | Base de datos gestionada |


## 🚀 Características Principales

### ✨ **Sistema Modular Completo**
- **Configuración de Evaluación**: Configurar criterios y parámetros
- **Entrada de Datos**: Gestión de datos de proyectos  
- **Parametrización**: Configuración avanzada del sistema
- **Reportes**: Generación y visualización de reportes con análisis IA
  - 📈 **Documentación detallada del módulo**: [backend/src/modules/reports/README.md](./backend/src/modules/reports/README.md)
  - Endpoints REST para reportes de evaluación y proyecto
  - Estadísticas analíticas (promedios, mejores/peores criterios)
  - Análisis automatizado con Google Gemini 2.5 Flash
  - Componentes React para visualización (gráficos, gauges, acordeones)

### 🔐 **Autenticación Robusta**
- Integración con **Supabase** para autenticación
- Sistema de roles (**Admin** / **Evaluator**)
- Protección de rutas y endpoints
- Gestión segura de cookies y tokens

### 🏗️ **Arquitectura Escalable**
- **Backend**: NestJS 11 con TypeScript y arquitectura modular
- **Frontend**: Next.js 15 con App Router, Turbopack y Tailwind CSS 4
- **Base de Datos**: Supabase PostgreSQL con TypeORM
- **Autenticación**: Supabase Auth con sistema de roles
- **CI/CD**: GitHub Actions configurado
- **API**: REST con documentación Swagger/OpenAPI

## 🏗️ Arquitectura del Proyecto

```
SQA-Tool/
├── backend/                    # 🚀 API NestJS
│   ├── src/
│   │   ├── auth/              # 🔐 Módulo de autenticación (Supabase)
│   │   ├── users/             # 👥 Gestión de usuarios y roles
│   │   ├── modules/           # 📦 Módulos específicos del negocio
│   │   │   ├── config-evaluation/  # Configuración de evaluaciones
│   │   │   ├── entry-data/         # Entrada de datos y cálculos
│   │   │   ├── parameterization/   # Parametrización del sistema
│   │   │   └── reports/            # Generación de reportes
│   │   ├── config/            # ⚙️ Configuraciones centralizadas
│   │   ├── common/            # 🤝 Código compartido (guards, decorators)
│   │   └── types/             # 📝 Definiciones de tipos TypeScript
│   └── test/                  # 🧪 Tests automatizados (Jest)
├── frontend/                  # 🎨 Next.js Frontend
│   ├── src/
│   │   ├── app/               # 📄 App Router (Next.js 15)
│   │   │   ├── auth/          # Páginas de autenticación
│   │   │   ├── dashboard/     # Dashboard principal
│   │   │   ├── configuration-evaluation/
│   │   │   ├── data-entry/    # Entrada de datos
│   │   │   ├── parameterization/
│   │   │   └── results/       # Visualización de resultados
│   │   ├── components/        # 🧩 Componentes reutilizables
│   │   ├── api/               # 🔗 Servicios para llamadas a la API
│   │   ├── hooks/             # 🎣 Custom hooks
│   │   ├── utils/             # 🛠️ Utilidades (PDF, validaciones)
│   │   └── types/             # 📝 Tipos TypeScript
│   └── public/                # 🖼️ Recursos estáticos
├── .github/workflows/         # 🔄 CI/CD (workflows configurados)
├── CONTRIBUTING.md            # 📖 Guía de contribución
└── README.md                  # 📚 Este archivo
```

### **🎯 Características de Seguridad**

- **Helmet.js** - Headers de seguridad HTTP
- **CORS configurado** - Control de orígenes permitidos
- **Validación de datos** - Class-validator y Class-transformer
- **Rate limiting** - Throttler de NestJS
- **Autenticación JWT** - Tokens seguros con Supabase
- **Roles y permisos** - Sistema de autorización basado en roles

## 📦 Tecnologías Utilizadas

### **Backend (NestJS)**
- **NestJS 11** - Framework Node.js progresivo
- **TypeScript 5.7** - Tipado estático
- **TypeORM 0.3.26** - ORM para bases de datos

- **Supabase 2.57+** - Backend-as-a-Service para auth y BD
- **Swagger/OpenAPI** - Documentación automática de API
- **Jest 30** - Framework de testing
- **Helmet** - Seguridad HTTP
- **Google Generative AI** - Integración de IA

### **Frontend (Next.js)**
- **Next.js 15.5** - Framework React con App Router y Turbopack
- **React 19.1** - Biblioteca de UI
- **TypeScript 5** - Tipado estático
- **Tailwind CSS 4** - Framework de CSS utility-first
- **Lucide React** - Iconos modernos
- **jsPDF** - Generación de reportes PDF
- **html2canvas** - Captura de elementos DOM
- **js-cookie** - Gestión de cookies

### **DevOps & Tools**
- **ESLint 9** - Linting de código
- **Prettier 3.4** - Formateo de código
- **Stylelint 16** - Linting de estilos CSS
- **Jest 30** - Testing framework (backend)
- **Swagger UI Express** - Documentación interactiva de API




## 🚀 Instalación y Ejecución Local

> **💡 Información**: Esta sección es para configurar el proyecto en tu máquina local. 
> Si solo quieres usar la aplicación, accede directamente a: https://sqa-tool.vercel.app

### **Requisitos Previos**

  ```bash
  # Node.js (versión 20 o superior recomendada)
  node --version  # v20.0.0+

  # npm (versión 10 o superior)
  npm --version   # 10.0.0+

  # Git
  git --version  # 2.30.0+

  # PostgreSQL (si no usas Supabase)
  psql --version  # 14.0+
  ```
### **Clonar repositorio e instalar dependencias**
  ```bash
# 1. Clonar el repositorio
git clone https://github.com/kelly-sangoluisa/SQA-Tool.git
cd SQA-Tool

# 2. Instalar dependencias del backend
cd backend
npm install

# 3. En otra terminal, instalar dependencias del frontend
cd ../frontend
npm install
```

### **Configuracion de Variables de Entorno**

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
CORS_ORIGINS=http://localhost:3000

# Cookies
COOKIE_SAMESITE=lax
COOKIE_SECURE=false
```

#### **Frontend (`.env.local`)**

Crea un archivo `.env.local` en la carpeta `frontend/`con la siguiente estructura:

```env
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Configuración de la app
NEXT_PUBLIC_APP_NAME=Sistema de Evaluación SQA
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### **Ejecucion local**


#### **Backend (Puerto 3001)**
```bash
cd backend
npm run build

# Modo desarrollo
npm run start:dev

# Modo producción
npm run start:prod

# Verificar que funciona
curl http://localhost:3001/api
```
#### **Frontend (Puerto 3000)**
```bash
cd frontend
npm run build

# Modo desarrollo (con hot reload y Turbopack)
npm run dev

# Verificar que funciona, abre un navegador y ve a:
http://localhost:3000  
```

Una vez ejecutado todo localmente:

1. **Frontend**: http://localhost:3000
2. **Backend API**: http://localhost:3001/api
3. **Documentación Swagger**: http://localhost:3001/api/docs
4. **Dashboard de Supabase**: https://app.supabase.com

### **👤 Usuario de Prueba**

Puedes crear un usuario desde la aplicación (Sign Up) o directamente en Supabase:

```json
{
  "email": "admin@example.com",
  "password": "Admin123!",
  "role": "admin",
  "name": "Administrador"
}
```

**Roles disponibles:**
- `admin` - Acceso completo al sistema
- `evaluator` - Acceso a evaluaciones y reportes


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

## 🧪 Testing

### **Backend Tests**

```bash
cd backend

# Tests unitarios
npm run test

# Tests con debug
npm run test:debug

# Ejecutar tests específicos
npm run test auth.service.spec.ts
```

### **Frontend Tests**

```bash
cd frontend

# Lint de código JavaScript/TypeScript
npm run lint

# Lint de estilos CSS
npm run lint:css

```



## 👥 Contribuir
> **📍 Nota**: Si quieres contribuir, en esta sección se describe las conveciones y estandares para realizarlo, la configuración para **desarrollo local** se encuentra en la parte de arriba. 
> La aplicación ya está desplegada en producción en:
> - Frontend: https://sqa-tool.vercel.app
> - Backend: https://sqa-tool-production.up.railway.app/api
> 

### 📚 Documentación de Módulos

Cada módulo del backend tiene su propia documentación detallada:

| Módulo | Ubicación | Descripción |
|--------|-----------|-------------|
| **Reportes** | [backend/src/modules/reports/README.md](./backend/src/modules/reports/README.md) | API de reportes, estadísticas, análisis con IA Gemini, componentes frontend |
| **Configuración de Evaluación** | [backend/src/modules/config-evaluation/README.md](./backend/src/modules/config-evaluation/README.md) | Configuración de criterios, métricas y evaluaciones |
| **Entrada de Datos** | [backend/src/modules/entry-data/README.md](./backend/src/modules/entry-data/README.md) | Gestión de datos de evaluación y cálculos |
| **Parametrización** | [backend/src/modules/parameterization/README.md](./backend/src/modules/parameterization/README.md) | Parametrización de estándares y variables del sistema |

Documentación adicional del frontend:
- [Sistema de Validación](./frontend/VALIDATION_SYSTEM.md) - Guía de validación de formularios
- [Sistema de Diseño](./frontend/DESIGN_SYSTEM.md) - Guía de estilos y componentes

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

### 🔍 Áreas de Mejora del Proyecto

El proyecto está bien estructurado y en producción, pero hay algunas áreas identificadas para mejorar:

- **Variables de entorno**: No hay archivos `.env.example` en el repositorio para backend/frontend
- **Migraciones de base de datos**: No hay sistema de migraciones documentado (TypeORM con `synchronize: false`)
- **Test coverage**: No hay métricas de cobertura de tests documentadas
- **Frontend README**: El README del frontend es el default de Next.js, necesita documentación específica del proyecto
- **Backend package.json**: Faltan campos de descripción, autor y licencia
- **Exportación de reportes**: Pendiente implementar exportación a Excel/CSV (ver [README de Reportes](./backend/src/modules/reports/README.md#-mejoras-futuras))

### **📚 Recursos Adicionales**

- **[NestJS Documentation](https://docs.nestjs.com/)**
- **[Next.js Documentation](https://nextjs.org/docs)**
- **[Supabase Documentation](https://supabase.com/docs)**
- **[Railway Documentation](https://docs.railway.app/)**
---

## 👨‍💻 Desarrolladores

<p align="center">
  <strong>Desarrollado con ❤️ por Dev-Sentinels</strong>
</p>

<p align="center">
  <a href="https://github.com/kelly-sangoluisa">
    <img src="https://img.shields.io/badge/Kelly_Sangoluisa-181717?style=for-the-badge&logo=github&logoColor=white" alt="Kelly Sangoluisa">
  </a>
  <a href="https://github.com/Theo-17">
    <img src="https://img.shields.io/badge/Theo--17-181717?style=for-the-badge&logo=github&logoColor=white" alt="Theo-17">
  </a>
  <a href="https://github.com/ShanderGonzalez">
    <img src="https://img.shields.io/badge/Shander17-181717?style=for-the-badge&logo=github&logoColor=white" alt="Shander Gonzalez">
  </a>
  <a href="https://github.com/pasanteIt-sime">
    <img src="https://img.shields.io/badge/pasanteIt--sime-181717?style=for-the-badge&logo=github&logoColor=white" alt="pasanteIt-sime">
  </a>
</p>

---

<p align="center">
  <a href="https://github.com/kelly-sangoluisa/SQA-Tool/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  </a>
  <img src="https://img.shields.io/badge/Made%20with-TypeScript-3178C6?style=flat-square&logo=typescript" alt="Made with TypeScript">
  <img src="https://img.shields.io/badge/Built%20with-NestJS%20%26%20Next.js-E0234E?style=flat-square" alt="Built with NestJS & Next.js">
</p>
