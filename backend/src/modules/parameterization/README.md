# ⚙️ Módulo de Parametrización

Este módulo manejará la configuración de parámetros y variables del sistema de evaluación.

## 📂 Estructura Propuesta

```
parameterization/
├── controllers/
│   └── parameterization.controller.ts
├── services/
│   ├── parameterization.service.ts
│   └── parameter-validation.service.ts
├── dto/
│   ├── create-parameter.dto.ts
│   ├── update-parameter.dto.ts
│   ├── parameter-group.dto.ts
│   └── parameter-response.dto.ts
├── entities/
│   ├── parameter.entity.ts
│   ├── parameter-group.entity.ts
│   └── parameter-value.entity.ts
├── interfaces/
│   └── parameterization.interface.ts
├── enums/
│   └── parameter-type.enum.ts
└── parameterization.module.ts
```

## 🎯 Responsabilidades

- ✅ Gestión de parámetros del sistema
- ✅ Configuración de valores por defecto
- ✅ Agrupación de parámetros relacionados
- ✅ Validación de rangos y tipos
- ✅ Historial de cambios de parámetros

## 🔗 API Endpoints Sugeridos

- `GET /api/parameterization` - Listar parámetros
- `POST /api/parameterization` - Crear nuevo parámetro
- `GET /api/parameterization/groups` - Listar grupos de parámetros
- `GET /api/parameterization/:id` - Obtener parámetro específico
- `PUT /api/parameterization/:id` - Actualizar parámetro
- `DELETE /api/parameterization/:id` - Eliminar parámetro

## 📋 TODO

- [ ] Implementar controladores
- [ ] Crear servicios de gestión
- [ ] Definir tipos de parámetros
- [ ] Crear entidades y relaciones
- [ ] Implementar validaciones de tipos
- [ ] Agregar historial de cambios