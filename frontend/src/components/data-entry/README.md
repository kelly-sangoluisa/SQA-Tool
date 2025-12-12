# EvaluationHierarchicalNav - Componente de Navegación para Data Entry

## Descripción

`EvaluationHierarchicalNav` es un wrapper especializado del componente `HierarchicalNavigation` diseñado específicamente para el módulo de **Ingreso de Datos (Data Entry)**. 

Este componente adapta la navegación jerárquica genérica para mostrar la estructura de una evaluación: **Criterios → Subcriterios → Métricas**.

## Ubicación

```
frontend/src/components/data-entry/
├── EvaluationHierarchicalNav.tsx       # Componente wrapper
├── EvaluationSidebar.tsx               # Contenedor principal
└── EvaluationSidebar.module.css        # Estilos
```

## Características

- **Navegación Jerárquica**: Muestra criterios y subcriterios usando el componente `HierarchicalNavigation`
- **Panel de Métricas**: Muestra las métricas del subcriterio seleccionado
- **Indicador de Progreso**: Marca visualmente las métricas completadas
- **Solo Lectura**: No permite edición ni cambio de estados (configurado para data-entry)
- **Soporte Multi-evaluación**: El sidebar puede mostrar múltiples evaluaciones con tabs

## Uso

### En el EvaluationSidebar

```tsx
import { EvaluationSidebar } from '@/components/data-entry/EvaluationSidebar';

function DataEntryPage() {
  return (
    <EvaluationSidebar
      evaluations={evaluations}
      currentMetricIndex={currentMetricIndex}
      allMetrics={allMetrics}
      variableValues={variableValues}
      onMetricSelect={(evaluationIndex, metricIndex) => {
        // Manejar selección de métrica
      }}
    />
  );
}
```

## Props de EvaluationHierarchicalNav

- `evaluation: Evaluation` - La evaluación a mostrar
- `currentMetricIndex: number` - Índice de la métrica actualmente seleccionada
- `allMetrics: Metric[]` - Lista completa de todas las métricas
- `variableValues: Record<string, string>` - Valores de las variables ingresadas
- `onMetricSelect: (metricGlobalIndex: number) => void` - Callback al seleccionar una métrica

## Estructura de Datos

### Evaluation
```typescript
interface Evaluation {
  id: number;
  project_id: number;
  standard_id: number;
  status: 'in_progress' | 'completed' | 'cancelled';
  standard: {
    id: number;
    name: string;
    version: string;
  };
  evaluation_criteria: Array<{
    criterion: {
      id: number;
      name: string;
      state: 'active' | 'inactive';
      subcriteria?: SubCriterion[];
    };
  }>;
}
```

### Tipos Adaptados

El componente adapta los tipos de la evaluación para cumplir con las interfaces base de `HierarchicalNavigation`:

- `EvaluationCriterion extends BaseCriterion`
- `EvaluationSubCriterion extends BaseSubCriterion`

## Diferencias con Parametrización

| Característica | Parametrización | Data Entry |
|----------------|----------------|------------|
| Edición | ✅ Sí | ❌ No |
| Crear/Eliminar | ✅ Sí | ❌ No |
| Cambiar Estados | ✅ Sí | ❌ No |
| Ver Métricas | ✅ Opcional | ✅ Siempre |
| Completar Métricas | ❌ No | ✅ Sí |

## Flujo de Navegación

1. Usuario selecciona una **Evaluación** (si hay múltiples)
2. El componente muestra los **Criterios** de esa evaluación
3. Usuario expande un criterio para ver sus **Subcriterios**
4. Usuario selecciona un **Subcriterio**
5. Se muestra un panel inferior con las **Métricas** de ese subcriterio
6. Usuario hace clic en una métrica para completarla

## Personalización

El componente usa los estilos del componente base `HierarchicalNavigation` pero añade:

- Header personalizado con información del estándar y estado
- Tabs para múltiples evaluaciones
- Panel de métricas con indicadores de progreso
- Estilos visuales para métricas activas y completadas

## Relación con HierarchicalNavigation

Este componente demuestra cómo usar el componente genérico `HierarchicalNavigation` en un contexto específico:

```typescript
<HierarchicalNavigation<EvaluationCriterion, EvaluationSubCriterion>
  criteria={criteria}
  loadSubCriteria={loadSubCriteria}
  updateCriterionState={updateCriterionState}
  updateSubCriterionState={updateSubCriterionState}
  // Configuración específica para data-entry
  showCreateButton={false}
  allowEdit={false}
  showStateToggles={false}
  // ... otros props
/>
```

## Mejoras Futuras

- [ ] Añadir búsqueda de criterios/subcriterios
- [ ] Filtros por estado de completitud
- [ ] Indicador de progreso por criterio
- [ ] Exportar resultados de evaluación
- [ ] Modo de vista compacta/expandida

## Soporte

Para preguntas o mejoras, contacta al equipo de desarrollo frontend.
