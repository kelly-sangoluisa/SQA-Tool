# HierarchicalNavigation - Componente Reutilizable

## Descripción

`HierarchicalNavigation` es un componente reutilizable y genérico que proporciona una interfaz de navegación jerárquica para elementos padre-hijo. Aunque fue diseñado originalmente para criterios y subcriterios, su naturaleza genérica permite usarlo con cualquier tipo de datos jerárquicos (criterios/subcriterios, categorías/subcategorías, secciones/subsecciones, etc.).

Este componente está diseñado para ser utilizado en diferentes módulos del sistema, como Parametrización, Ingreso de Datos, Reportes, etc.

## Ubicación

```
frontend/src/components/shared/HierarchicalNavigation.tsx
frontend/src/components/shared/HierarchicalNavigation.module.css
```

## Características

- **Genérico y Tipado**: Utiliza TypeScript generics para adaptarse a diferentes tipos de criterios
- **Expandible/Contraíble**: Los criterios pueden expandirse para mostrar sus subcriterios
- **Gestión de Estados**: Permite activar/desactivar criterios y subcriterios
- **Edición**: Soporta edición de criterios y subcriterios (opcional)
- **Personalizable**: Múltiples opciones de configuración para adaptar el componente a diferentes contextos

## Interfaces Base

### BaseCriterion

```typescript
interface BaseCriterion {
  id: number;
  name: string;
  state: 'active' | 'inactive';
}
```

### BaseSubCriterion

```typescript
interface BaseSubCriterion {
  id: number;
  name: string;
  state: 'active' | 'inactive';
  criterion_id: number;
}
```

## Props

### Requeridas

- `criteria: C[]` - Lista de criterios a mostrar
- `loadSubCriteria: (criterionId: number, forceRefresh?: boolean) => Promise<S[]>` - Función para cargar subcriterios
- `updateCriterionState: (criterionId: number, state: 'active' | 'inactive') => Promise<void>` - Función para actualizar estado del criterio
- `updateSubCriterionState: (subCriterionId: number, state: 'active' | 'inactive') => Promise<void>` - Función para actualizar estado del subcriterio

### Opcionales

- `onRefresh?: () => void` - Callback cuando se necesita refrescar
- `parentId?: number` - ID del elemento padre (ej: standardId, projectId)
- `onCriterionSelect?: (criterion: C) => void` - Callback cuando se selecciona un criterio
- `onSubCriterionSelect?: (criterion: C, subCriterion: S) => void` - Callback cuando se selecciona un subcriterio
- `onCriterionEdit?: (criterion: C) => void` - Callback cuando se edita un criterio
- `onCriterionCreate?: () => void` - Callback cuando se crea un criterio
- `onSubCriterionEdit?: (criterion: C, subCriterion: S) => void` - Callback cuando se edita un subcriterio
- `onSubCriterionCreate?: (criterion: C) => void` - Callback cuando se crea un subcriterio
- `onSubCriterionStateChange?: (subCriterion: S) => void` - Callback cuando cambia el estado de un subcriterio
- `onCriterionStateChange?: (criterion: C) => void` - Callback cuando cambia el estado de un criterio
- `loading?: boolean` - Estado de carga (default: false)
- `headerTitle?: string` - Título del header (default: "Estructura de Criterios")
- `createButtonLabel?: string` - Etiqueta del botón crear (default: "Nuevo Criterio")
- `showCreateButton?: boolean` - Mostrar botón de crear (default: true)
- `allowEdit?: boolean` - Permitir edición (default: true)
- `showStateToggles?: boolean` - Mostrar switches de estado (default: true)
- `emptyMessage?: string` - Mensaje cuando no hay criterios (default: "No hay criterios disponibles")
- `emptySubCriteriaMessage?: string` - Mensaje cuando no hay subcriterios (default: "No hay subcriterios disponibles")
- `subCriteriaTitle?: string` - Título de la lista de subcriterios (default: "Subcriterios")

## Ejemplo de Uso

### 1. Uso en Parametrización (Actual)

```typescript
import { HierarchicalNavigation } from '../shared';
import { Criterion, SubCriterion, parameterizationApi } from '../../api/parameterization/parameterization-api';

function MyComponent() {
  const { criteria, loading } = useCriteriaManagement(standardId);

  const loadSubCriteria = async (criterionId: number): Promise<SubCriterion[]> => {
    const data = await parameterizationApi.getSubCriteriaByCriterion(criterionId, { state: 'all' });
    return data;
  };

  const updateCriterionState = async (criterionId: number, state: 'active' | 'inactive'): Promise<void> => {
    await parameterizationApi.updateCriterionState(criterionId, { state });
  };

  const updateSubCriterionState = async (subCriterionId: number, state: 'active' | 'inactive'): Promise<void> => {
    await parameterizationApi.updateSubCriterionState(subCriterionId, { state });
  };

  return (
    <HierarchicalNavigation<Criterion, SubCriterion>
      criteria={criteria}
      loading={loading}
      parentId={standardId}
      loadSubCriteria={loadSubCriteria}
      updateCriterionState={updateCriterionState}
      updateSubCriterionState={updateSubCriterionState}
      onCriterionSelect={handleCriterionSelect}
      onSubCriterionSelect={handleSubCriterionSelect}
      // ... otros props
    />
  );
}
```

### 2. Uso en Data Entry (Ejemplo Futuro)

```typescript
import { HierarchicalNavigation } from '../shared';
import { EvaluationCriterion, EvaluationSubCriterion } from '../../api/data-entry/data-entry-api';

function DataEntryComponent() {
  // ... lógica del componente

  return (
    <HierarchicalNavigation<EvaluationCriterion, EvaluationSubCriterion>
      criteria={evaluationCriteria}
      loading={isLoading}
      parentId={projectId}
      loadSubCriteria={loadEvaluationSubCriteria}
      updateCriterionState={updateEvaluationCriterionState}
      updateSubCriterionState={updateEvaluationSubCriterionState}
      onCriterionSelect={handleCriterionSelect}
      onSubCriterionSelect={handleSubCriterionSelect}
      headerTitle="Criterios de Evaluación"
      createButtonLabel="Nuevo Criterio de Evaluación"
      showCreateButton={false}  // No permitir crear en data entry
      allowEdit={false}         // No permitir editar en data entry
      showStateToggles={false}  // No mostrar toggles en data entry
    />
  );
}
```

## Personalización de Estilos

El componente utiliza CSS Modules. Para personalizar los estilos, puedes:

1. Modificar `HierarchicalNavigation.module.css` directamente (afecta a todos los usos)
2. Envolver el componente y aplicar estilos adicionales desde el componente padre

## Notas Importantes

1. **Tipos Genéricos**: Tus tipos de Criterion y SubCriterion deben extender de `BaseCriterion` y `BaseSubCriterion` respectivamente
2. **Funciones Asíncronas**: Las funciones `loadSubCriteria`, `updateCriterionState`, y `updateSubCriterionState` son asíncronas y deben retornar Promises
3. **Gestión de Errores**: El componente maneja errores internamente, pero las funciones proporcionadas deben manejar sus propios errores
4. **Estado Optimista**: El componente utiliza actualizaciones optimistas para mejorar la UX
5. **Reglas de Negocio**: El componente implementa la lógica de que un subcriterio inactivo no puede activarse si su criterio padre está inactivo

## Estructura de Archivos

```
frontend/src/components/
├── shared/
│   ├── HierarchicalNavigation.tsx          # Componente reutilizable genérico
│   ├── HierarchicalNavigation.module.css   # Estilos del componente
│   ├── index.ts                             # Exports
│   └── HIERARCHICAL_NAVIGATION.md           # Esta documentación
└── parameterization/
    └── CriteriaNavigation.tsx               # Wrapper específico para parametrización
```

## Beneficios de la Reutilización

1. **Consistencia**: UI/UX consistente en todo el sistema
2. **Mantenibilidad**: Un solo lugar para corregir bugs y añadir features
3. **Productividad**: Menos código duplicado, desarrollo más rápido
4. **Testing**: Un solo componente para testear exhaustivamente
5. **Flexibilidad**: Fácilmente configurable para diferentes casos de uso

## Próximos Pasos

Para implementar este componente en un nuevo módulo:

1. Asegúrate de que tus tipos extiendan `BaseCriterion` y `BaseSubCriterion`
2. Implementa las funciones requeridas (`loadSubCriteria`, `updateCriterionState`, `updateSubCriterionState`)
3. Importa el componente desde `'../shared'`
4. Pasa los props necesarios según tu caso de uso
5. Maneja los callbacks según la lógica de tu módulo

## Soporte

Para preguntas o mejoras al componente, contacta al equipo de desarrollo frontend.
