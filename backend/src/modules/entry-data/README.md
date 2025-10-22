# 📊 Módulo de Ingreso de Datos

Este módulo manejará la carga y gestión de datos de proyectos para ser evaluados.

## 📂 Estructura Propuesta

```
entry-data/
├── controllers/
│   └── entry-data.controller.ts
├── services/
│   ├── entry-data.service.ts
│   ├── file-upload.service.ts
│   └── data-validation.service.ts
├── dto/
│   ├── create-project.dto.ts
│   ├── update-project.dto.ts
│   ├── upload-file.dto.ts
│   └── project-response.dto.ts
├── entities/
│   ├── project.entity.ts
│   ├── project-file.entity.ts
│   └── project-metric.entity.ts
├── interfaces/
│   └── entry-data.interface.ts
├── pipes/
│   └── file-validation.pipe.ts
└── entry-data.module.ts
```

## 🎯 Responsabilidades

- ✅ Carga de archivos de proyectos
- ✅ Validación de datos ingresados
- ✅ Gestión de metadatos de proyectos
- ✅ Procesamiento de archivos (CSV, Excel, JSON)
- ✅ Almacenamiento y organización de datos

## 🔗 API Endpoints Sugeridos

- `GET /api/entry-data/projects` - Listar proyectos
- `POST /api/entry-data/projects` - Crear nuevo proyecto
- `POST /api/entry-data/upload` - Subir archivo de datos
- `GET /api/entry-data/projects/:id` - Obtener proyecto específico
- `PUT /api/entry-data/projects/:id` - Actualizar proyecto
- `DELETE /api/entry-data/projects/:id` - Eliminar proyecto

## 📋 TODO

- [ ] Implementar controladores
- [ ] Crear servicios de carga de archivos
- [ ] Definir DTOs y validaciones
- [ ] Crear entidades de proyecto
- [ ] Implementar pipes de validación
- [ ] Agregar soporte para múltiples formatos