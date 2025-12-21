# Data Entry Components

Este directorio contiene los componentes específicos del módulo de **Ingreso de Datos**.

## Componentes Actuales

### `DataEntryHierarchy`
- **Archivo**: `DataEntryHierarchy.tsx`
- **Descripción**: Componente wrapper que utiliza `MultiLevelHierarchy` (componente compartido) para mostrar la navegación jerárquica de evaluaciones, criterios, subcriterios y métricas.
- **Uso**: Sidebar de navegación en la página de ingreso de datos
- **Características**:
  - Muestra todas las evaluaciones de un proyecto
  - Navegación expandible/colapsable en 4 niveles
  - Indicadores de progreso (métricas completadas/total)
  - Colores diferenciados por nivel (Morado → Azul → Verde → Ámbar)
  - Integración con el estado de valores de variables

### `MetricCard`
- **Archivos**: `MetricCard.tsx`, `MetricCard.module.css`
- **Descripción**: Tarjeta para mostrar y editar los valores de las variables de una métrica
- **Características**:
  - Muestra fórmula de la métrica
  - Lista de variables con inputs
  - Navegación entre métricas (anterior/siguiente)
  - Diseño responsive en dos columnas

## Componentes Compartidos Utilizados

- **`MultiLevelHierarchy`**: Componente genérico de navegación jerárquica de 4 niveles
  - Ubicación: `@/components/shared/MultiLevelHierarchy`
  - Documentación: Ver `MULTI_LEVEL_HIERARCHY.md` en shared

## Estructura de Datos

```typescript
Evaluation
  └── EvaluationCriteria[]
      └── Criterion
          └── Subcriteria[]
              └── Metrics[]
                  └── Variables[]
```

## Flujo de Trabajo

1. Usuario selecciona una evaluación en el sidebar
2. Expande criterios y subcriterios
3. Selecciona una métrica
4. `MetricCard` muestra la métrica con sus variables
5. Usuario ingresa valores para cada variable
6. Sistema marca la métrica como completada cuando todas las variables tienen valor

## Archivos Eliminados (Migrados a Shared)

- ~~`EvaluationSidebar.tsx`~~ → Reemplazado por `DataEntryHierarchy` + `MultiLevelHierarchy`
- ~~`EvaluationSidebar.module.css`~~ → Estilos ahora en `MultiLevelHierarchy.module.css`
- ~~`EvaluationHierarchicalNav.tsx`~~ → Funcionalidad integrada en `DataEntryHierarchy`
- ~~`StandardSection.tsx`~~ → Ya no se usa

## Notas de Migración

Este módulo ha sido refactorizado para usar componentes compartidos reutilizables. La navegación jerárquica ahora se basa en `MultiLevelHierarchy`, lo que permite:

- ✅ Consistencia visual en toda la aplicación
- ✅ Mantenimiento centralizado
- ✅ Reutilización en otros módulos (Reportes, etc.)
- ✅ Menor código duplicado
