# MultiLevelHierarchy - Componente Compartido Reutilizable

## Descripción

`MultiLevelHierarchy` es un componente genérico y reutilizable que proporciona una navegación jerárquica de 4 niveles con colores diferenciados para cada nivel. Es perfecto para mostrar estructuras complejas como:

- Evaluaciones → Criterios → Subcriterios → Métricas
- Categorías → Subcategorías → Productos → Variantes
- Proyectos → Módulos → Componentes → Elementos

## Ubicación

```
frontend/src/components/shared/MultiLevelHierarchy.tsx
frontend/src/components/shared/MultiLevelHierarchy.module.css
```

## Características

✨ **4 Niveles Jerárquicos**: Navegación expandible/colapsable en 4 niveles  
🎨 **Colores Diferenciados**: Cada nivel tiene su propio esquema de colores minimalista  
📊 **Indicadores de Progreso**: Muestra progreso completado/total en cada grupo  
✅ **Estados Visuales**: Indica items completados, activos y pendientes  
🔧 **Totalmente Genérico**: Funciona con cualquier tipo de datos mediante TypeScript generics  
📱 **Responsive**: Se adapta a diferentes tamaños de pantalla

## Esquema de Colores

- **Nivel 1** (Grupos/Evaluaciones): 🟣 Morado (#d1c4e9, #b39ddb, #9575cd)
- **Nivel 2** (Criterios): 🔵 Azul (#e8eaf6, #c5cae9, #7986cb)
- **Nivel 3** (Subcriterios): 🟢 Verde (#e8f5e9, #c5e1a5, #81c784)
- **Nivel 4** (Items finales): 🟠 Ámbar (#fff8e1, #ffe082, #ffb74d)

## Interfaces Base

### BaseGroup (Nivel 1)
```typescript
interface BaseGroup {
  id: number;
  name: string;
  version?: string;
  metadata?: Record<string, any>;
}
```

### BaseLevel2Item (Nivel 2)
```typescript
interface BaseLevel2Item {
  id: number;
  name: string;
  description?: string;
}
```

### BaseLevel3Item (Nivel 3)
```typescript
interface BaseLevel3Item {
  id: number;
  name: string;
  description?: string;
  parent_id: number;
}
```

### BaseLevel4Item (Nivel 4)
```typescript
interface BaseLevel4Item {
  id: number;
  name: string;
  description?: string;
  parent_id: number;
}
```

## Props

### Requeridas

- `groups: TGroup[]` - Lista de grupos de nivel superior
- `getLevel2Items: (group: TGroup) => TLevel2[]` - Función para obtener items de nivel 2
- `getLevel3Items: (level2Item: TLevel2) => TLevel3[]` - Función para obtener items de nivel 3

### Opcionales

- `getLevel4Items?: (level3Item: TLevel3) => TLevel4[]` - Función para obtener items de nivel 4
- `onLevel4Select?: (groupIndex: number, level4Item: TLevel4) => void` - Callback cuando se selecciona un item de nivel 4
- `activeLevel4ItemId?: number` - ID del item de nivel 4 actualmente activo
- `isItemCompleted?: (item: TLevel4) => boolean` - Función para determinar si un item está completado
- `getGroupProgress?: (group: TGroup) => { completed: number; total: number }` - Función para calcular progreso
- `labels?: { ... }` - Etiquetas personalizadas para cada nivel
- `showLevel4?: boolean` - Mostrar o no el nivel 4 (default: true)

### Labels Personalizables

```typescript
labels?: {
  header?: string;        // Título del header (default: "Navegación")
  level1?: string;        // Nombre del nivel 1 (default: "Grupo")
  level2?: string;        // Nombre del nivel 2 (default: "Item")
  level3?: string;        // Nombre del nivel 3 (default: "Subitem")
  level4?: string;        // Nombre del nivel 4 (default: "Elemento")
  emptyGroups?: string;   // Mensaje cuando no hay grupos
  emptyLevel2?: string;   // Mensaje cuando no hay items nivel 2
  emptyLevel3?: string;   // Mensaje cuando no hay items nivel 3
  emptyLevel4?: string;   // Mensaje cuando no hay items nivel 4
}
```

## Ejemplo de Uso: Data Entry

### 1. Definir interfaces específicas

```typescript
import { MultiLevelHierarchy, BaseGroup, BaseLevel2Item, BaseLevel3Item, BaseLevel4Item } from '@/components/shared';

interface EvaluationGroup extends BaseGroup {
  standard_id: number;
  project_id: number;
  status: 'in_progress' | 'completed' | 'cancelled';
}

interface EvaluationCriterion extends BaseLevel2Item {
  importance_level: string;
  importance_percentage: number;
}

interface EvaluationSubcriterion extends BaseLevel3Item {
  state: string;
}

interface EvaluationMetric extends BaseLevel4Item {
  formula: string;
  variables?: Variable[];
}
```

### 2. Crear componente wrapper

```typescript
export function DataEntryHierarchy({ evaluations, currentMetricIndex, allMetrics, variableValues, onMetricSelect }) {
  
  // Convertir datos al formato requerido
  const groups: EvaluationGroup[] = evaluations.map(evaluation => ({
    id: evaluation.id,
    name: evaluation.standard.name,
    version: evaluation.standard.version,
    standard_id: evaluation.standard_id,
    project_id: evaluation.project_id,
    status: evaluation.status
  }));

  // Implementar funciones de acceso
  const getLevel2Items = (group: EvaluationGroup) => {
    const evaluation = evaluations.find(e => e.id === group.id);
    return evaluation?.evaluation_criteria.map(ec => ({
      id: ec.criterion.id,
      name: ec.criterion.name,
      description: ec.criterion.description,
      importance_level: ec.importance_level,
      importance_percentage: ec.importance_percentage
    })) || [];
  };

  const getLevel3Items = (criterion: EvaluationCriterion) => {
    // ... lógica para obtener subcriterios
  };

  const getLevel4Items = (subcriterion: EvaluationSubcriterion) => {
    // ... lógica para obtener métricas
  };

  const isMetricCompleted = (metric: EvaluationMetric) => {
    return metric.variables?.every(v => variableValues[`metric-${metric.id}-${v.symbol}`]) || false;
  };

  const getGroupProgress = (group: EvaluationGroup) => {
    // ... calcular progreso
    return { completed: 5, total: 10 };
  };

  return (
    <MultiLevelHierarchy<EvaluationGroup, EvaluationCriterion, EvaluationSubcriterion, EvaluationMetric>
      groups={groups}
      getLevel2Items={getLevel2Items}
      getLevel3Items={getLevel3Items}
      getLevel4Items={getLevel4Items}
      onLevel4Select={(groupIndex, metric) => onMetricSelect(groupIndex, metric.id)}
      activeLevel4ItemId={allMetrics[currentMetricIndex]?.id}
      isItemCompleted={isMetricCompleted}
      getGroupProgress={getGroupProgress}
      labels={{
        header: 'Evaluaciones',
        level1: 'Evaluación',
        level2: 'Criterio',
        level3: 'Subcriterio',
        level4: 'Métrica',
        emptyGroups: 'No hay evaluaciones disponibles',
        emptyLevel2: 'No hay criterios configurados',
        emptyLevel3: 'No hay subcriterios configurados',
        emptyLevel4: 'No hay métricas configuradas'
      }}
      showLevel4={true}
    />
  );
}
```

### 3. Usar en la página

```typescript
import { DataEntryHierarchy } from '@/components/data-entry/DataEntryHierarchy';

export default function DataEntryPage() {
  return (
    <div className="sidebarWrapper">
      <DataEntryHierarchy
        evaluations={evaluations}
        currentMetricIndex={currentMetricIndex}
        allMetrics={allMetrics}
        variableValues={variableValues}
        onMetricSelect={handleMetricSelect}
      />
    </div>
  );
}
```

## Personalización de Estilos

Los estilos están en `MultiLevelHierarchy.module.css`. Puedes:

1. **Modificar colores globales**: Editar las clases `.level1Button`, `.level2Button`, etc.
2. **Añadir estilos adicionales**: Envolver el componente y aplicar CSS desde el padre
3. **Responsive**: Los breakpoints están en `@media (max-width: 768px)`

## Estructura de Archivos

```
frontend/src/components/
├── shared/
│   ├── MultiLevelHierarchy.tsx          # Componente genérico reutilizable
│   ├── MultiLevelHierarchy.module.css   # Estilos con colores diferenciados
│   ├── index.ts                          # Exports
│   └── MULTI_LEVEL_HIERARCHY.md         # Esta documentación
└── data-entry/
    └── DataEntryHierarchy.tsx            # Wrapper específico para data-entry
```

## Beneficios

✅ **Reutilizable**: Un solo componente para múltiples módulos  
✅ **Mantenible**: Cambios en un solo lugar afectan a todo el sistema  
✅ **Consistente**: UI/UX uniforme en toda la aplicación  
✅ **Tipado Seguro**: TypeScript garantiza uso correcto  
✅ **Visual**: Colores diferenciados ayudan a la navegación  
✅ **Flexible**: Configurable para diferentes casos de uso

## Casos de Uso

1. **Data Entry**: Evaluaciones → Criterios → Subcriterios → Métricas
2. **Reportes**: Proyectos → Módulos → Secciones → Items
3. **Catálogo**: Categorías → Subcategorías → Productos → Variantes
4. **Organización**: Departamentos → Equipos → Roles → Tareas

## Migración desde EvaluationSidebar

Si tienes un componente custom como `EvaluationSidebar`:

1. ✅ Crear interfaces que extiendan las base
2. ✅ Implementar funciones `getLevelXItems`
3. ✅ Crear wrapper específico del módulo
4. ✅ Reemplazar componente antiguo con el nuevo
5. ✅ Eliminar código duplicado

## Notas Importantes

- Los tipos genéricos deben extender las interfaces base
- Las funciones `getLevelXItems` deben retornar arrays (pueden ser vacíos)
- El nivel 4 es opcional (`showLevel4={false}` para ocultarlo)
- Los IDs deben ser únicos dentro de cada nivel
- El progreso se calcula bajo demanda para eficiencia

## Próximos Pasos

Para usar este componente en un nuevo módulo:

1. Crear interfaces específicas que extiendan las base
2. Implementar funciones de acceso a datos
3. Crear componente wrapper en tu módulo
4. Personalizar labels según tu contexto
5. Integrar en tu página o layout
