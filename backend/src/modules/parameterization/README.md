# ⚙️ Módulo de Parametrización

Este módulo manejará la configuración de parámetros y variables del sistema de evaluación.

## 📂 Estructura Propuesta

```
parameterization/
├── controllers/
│   └── parameterization.controller.ts
├── services/
│   └── parameterization.service.ts
├── dto/
│   ├── criterion.dto.ts
│   ├── formula-variable.dto.ts
│   ├── metric.dto.ts
│   ├── standard.dto.ts
│   └── sub-criterion.dto.ts
├── entities/
│   ├── criterion.entity.ts
│   ├── formula-variable.entity.ts
│   ├── metric.entity.ts
│   ├── standard.entity.ts
│   └── sub-criterion.entity.ts
└── parameterization.module.ts
```

## 🎯 Responsabilidades

- ✅ Gestión de Estándares: Operaciones CRUD (Create, Read, Update, Delete) para los estándares de calidad.
- ✅ Gestión de Criterios: CRUD para los criterios, siempre asociados a un estándar.
- ✅ Gestión de Sub-criterios: CRUD para los sub-criterios, asociados a un criterio.
- ✅ Gestión de Métricas: CRUD para las métricas, asociadas a un sub-criterio.
- ✅ Gestión de Variables: CRUD para las variables de fórmula, asociadas a una métrica.

## 🔗 API Endpoints Sugeridos

La base de la ruta para este módulo es `/api/parameterization`.

### Estándares (/standards)
- `GET /standards` - Lista todos los estándares.
- `POST /standards` - Crea un nuevo estándar.
- `GET /standards/:id` - Obtiene un estándar por ID.
- `PATCH /standards/:id` - Actualiza un estándar.
- `DELETE /standards/:id` - Elimina un estándar.

### Criterios (/criteria)
- `GET /standards/:standardId/criteria` - Lista los criterios de un estándar específico.
- `POST /criteria` - Crea un nuevo criterio para un estándar.
- `GET /criteria/:id` - Obtiene un criterio por ID.
- `PATCH /criteria/:id` - Actualiza un criterio.
- `DELETE /criteria/:id` - Elimina un criterio.

### Sub-criterios (/sub-criteria)
- `GET /criteria/:criterionId/sub-criteria` - Lista los sub-criterios de un criterio específico.
- `POST /sub-criteria` - Crea un nuevo sub-criterio.
- `GET /sub-criteria/:id` - Obtiene un sub-criterio por ID.
- `PATCH /sub-criteria/:id` - Actualiza un sub-criterio.
- `DELETE /sub-criteria/:id` - Elimina un sub-criterio.

### Métricas (/metrics)
- `GET /sub-criteria/:subCriterionId/metrics` - Lista las métricas de un sub-criterio.
- `POST /metrics` - Crea una nueva métrica.
- `GET /metrics/:id` - Obtiene una métrica por ID.
- `PATCH /metrics/:id` - Actualiza una métrica.
- `DELETE /metrics/:id` - Elimina una métrica.

### Variables de Fórmula (/variables)
- `GET /metrics/:metricId/variables` - Lista las variables de una métrica.
- `POST /variables` - Crea una nueva variable.
- `GET /variables/:id` - Obtiene una variable por ID.
- `PATCH /variables/:id` - Actualiza una variable.
- `DELETE /variables/:id` - Elimina una variable.

## 📋 TODO

- [x] La implementación de controladores, servicios, DTOs y entidades está completa.
- [x] Todos los endpoints para las operaciones CRUD de las cinco entidades están funcionales.
- [x] La validación de datos de entrada está garantizada mediante el uso de DTOs.
- [x] El manejo de relaciones y la eliminación en cascada entre entidades funcionan correctamente.
- [x] La seguridad del módulo está implementada, protegiendo todas las rutas para el rol de admin.