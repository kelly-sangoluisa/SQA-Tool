# 🏗️ Módulos del Backend

Esta carpeta contiene todos los módulos organizados de la aplicación SQA-Tool, divididos por responsabilidades funcionales y equipos de desarrollo.

## 📁 Estructura de Módulos

```
modules/
├── auth/                    # 🔐 Autenticación y autorización
├── users/                   # 👥 Gestión de usuarios  
├── config-evaluation/       # ⚙️ Configuración y evaluación
├── entry-data/             # 📝 Ingreso de datos
├── parameterization/       # 🎛️ Parametrización
└── reports/                # 📊 Reportes y exportación
```

## 🔗 Módulos Transversales

- **`auth/`** - Sistema de autenticación con Supabase
- **`users/`** - Gestión de usuarios y roles
- **Shared/** - Utilidades compartidas entre módulos

## 🚀 Importación en App Module

```typescript
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigEvaluationModule } from './modules/config-evaluation/config-evaluation.module';
import { EntryDataModule } from './modules/entry-data/entry-data.module';
import { ParameterizationModule } from './modules/parameterization/parameterization.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    // ... otros imports
    AuthModule,
    UsersModule,
    ConfigEvaluationModule,
    EntryDataModule,
    ParameterizationModule,
    ReportsModule,
  ],
  // ...
})
export class AppModule {}
```

## 🛠️ Convenciones

- Cada módulo debe seguir la estructura estándar NestJS
- Usar nomenclatura clara y descriptiva
- Documentar funcionalidades en README.md de cada módulo
- Mantener responsabilidades bien definidas
- Seguir principios SOLID

## 📋 Próximos Pasos

1. ✅ Estructura base creada
2. ✅ Módulos auth y users migrados
3. 🔄 Implementar módulos específicos del dominio
4. 🔄 Crear shared utilities
5. 🔄 Actualizar importaciones en app.module.ts