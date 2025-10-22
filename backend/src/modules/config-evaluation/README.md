# 📋 Módulo de Configuración de Evaluación

Este módulo manejará toda la configuración relacionada con los criterios y parámetros de evaluación de proyectos de software.

## 📂 Estructura Propuesta

```
config-evaluation/
├── controllers/
│   └── config-evaluation.controller.ts
├── services/
│   └── config-evaluation.service.ts
├── dto/
│   ├── create-config.dto.ts
│   ├── update-config.dto.ts
│   └── config-response.dto.ts
├── entities/
│   ├── evaluation-config.entity.ts
│   └── evaluation-criteria.entity.ts
├── interfaces/
│   └── config-evaluation.interface.ts
└── config-evaluation.module.ts
```

## 🎯 Responsabilidades

- ✅ Gestión de criterios de evaluación
- ✅ Configuración de métricas y pesos
- ✅ Definición de escalas de calificación
- ✅ Plantillas de evaluación
- ✅ Validación de configuraciones

## 🔗 API Endpoints Sugeridos

- `GET /api/config-evaluation` - Listar configuraciones
- `POST /api/config-evaluation` - Crear nueva configuración
- `GET /api/config-evaluation/:id` - Obtener configuración específica
- `PUT /api/config-evaluation/:id` - Actualizar configuración
- `DELETE /api/config-evaluation/:id` - Eliminar configuración

## 📋 TODO

- [ ] Implementar controladores
- [ ] Crear servicios de negocio
- [ ] Definir DTOs de entrada y salida
- [ ] Crear entidades de base de datos
- [ ] Implementar validaciones
- [ ] Agregar tests unitarios