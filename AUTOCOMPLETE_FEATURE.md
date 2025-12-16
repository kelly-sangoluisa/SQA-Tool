# Funcionalidad de Autocompletado Inteligente para Reutilización

## 📋 Descripción General

Esta funcionalidad permite reutilizar datos existentes de Criterios, Subcriterios y Métricas de cualquier estándar al crear nuevos registros. El sistema implementa un autocompletado inteligente que facilita la búsqueda y selección de datos previos, pre-llenando automáticamente los formularios sin crear dependencias entre registros.

## 🎯 Objetivos Cumplidos

- ✅ **Independencia de Datos**: Los datos se clonan en lugar de crear relaciones muchos-a-muchos
- ✅ **Búsqueda Eficiente**: Búsqueda por nombre (ILIKE) con resultados limitados a 10
- ✅ **UX Intuitiva**: Autocompletado con teclado y mouse, con información contextual
- ✅ **Selección Inteligente**: Lógica diferenciada para casos simples y complejos

## 🏗️ Arquitectura

### Backend (NestJS + TypeORM)

#### 1. DTOs de Búsqueda
**Ubicación**: `backend/src/modules/parameterization/dto/search.dto.ts`

```typescript
// DTO de consulta
SearchQueryDto {
  search?: string;  // Mínimo 2 caracteres
}

// DTOs de respuesta
CriterionSearchResultDto
SubCriterionSearchResultDto  // Incluye métricas asociadas
MetricSearchResultDto
```

#### 2. Endpoints de Búsqueda
**Ubicación**: `backend/src/modules/parameterization/controllers/parameterization.controller.ts`

```typescript
GET /api/parameterization/search/criteria?search={term}
GET /api/parameterization/search/sub-criteria?search={term}
GET /api/parameterization/search/metrics?search={term}
```

**Características**:
- Búsqueda por nombre con `ILIKE` (insensible a mayúsculas)
- Solo devuelve registros con `state='active'`
- Verifica que los padres también estén activos
- Limita resultados a 10 para performance
- Los subcriterios incluyen sus métricas asociadas

#### 3. Servicios de Búsqueda
**Ubicación**: `backend/src/modules/parameterization/services/parameterization.service.ts`

```typescript
searchCriteria(query: SearchQueryDto): Promise<CriterionSearchResultDto[]>
searchSubCriteria(query: SearchQueryDto): Promise<SubCriterionSearchResultDto[]>
searchMetrics(query: SearchQueryDto): Promise<MetricSearchResultDto[]>
```

**Requerimiento Especial**: `searchSubCriteria` devuelve las métricas asociadas con:
```typescript
{
  sub_criterion_id: number,
  name: string,
  metrics: MetricSearchResultDto[],
  metrics_count: number,  // Para lógica de selección
  ...
}
```

### Frontend (Next.js + React)

#### 1. Tipos TypeScript
**Ubicación**: `frontend/src/types/parameterization-search.types.ts`

Define las interfaces para los resultados de búsqueda.

#### 2. API Client
**Ubicación**: `frontend/src/api/parameterization/parameterization-api.ts`

```typescript
searchCriteria(search: string): Promise<CriterionSearchResult[]>
searchSubCriteria(search: string): Promise<SubCriterionSearchResult[]>
searchMetrics(search: string): Promise<MetricSearchResult[]>
```

#### 3. Componente Autocomplete
**Ubicación**: `frontend/src/components/parameterization/Autocomplete.tsx`

Componente genérico reutilizable con:
- Búsqueda con debounce (300ms por defecto)
- Navegación por teclado (↑↓, Enter, Esc)
- Estados de carga y sin resultados
- Personalizable mediante props

**Uso**:
```tsx
<Autocomplete
  value={name}
  onChange={setName}
  onSelect={handleItemSelected}
  searchFunction={parameterizationApi.searchMetrics}
  getItemLabel={(item) => item.name}
  getItemDescription={(item) => item.description}
  getItemMeta={(item) => <Badge>{item.code}</Badge>}
  placeholder="Buscar métrica..."
  helperText="Puedes reutilizar métricas existentes"
/>
```

#### 4. Modal de Selección de Métricas
**Ubicación**: `frontend/src/components/parameterization/MetricSelectorModal.tsx`

Modal para el **Caso B - Escenario 2** (subcriterio con múltiples métricas):
- Lista todas las métricas asociadas
- Permite seleccionar una mediante radio buttons
- Muestra detalles (fórmula, umbral)
- Confirmación antes de aplicar

## 🔄 Flujos de Uso

### Caso A: Métrica Simple (Autocompletado Directo)

1. **Usuario** escribe en el campo "Nombre" del formulario de Métrica
2. **Sistema** ejecuta búsqueda después de 300ms (debounce)
3. **Usuario** ve lista de métricas coincidentes con descripción y código
4. **Usuario** selecciona una métrica
5. **Sistema** rellena automáticamente:
   - Nombre
   - Descripción
   - Código
   - Fórmula
   - Umbral deseado
6. **Usuario** puede ajustar valores y guardar como nuevo registro

### Caso B - Escenario 1: Subcriterio con 1 Métrica

1. **Usuario** escribe en el campo "Nombre" del formulario de Subcriterio
2. **Sistema** muestra resultados con badge indicando "1 métrica"
3. **Usuario** selecciona el subcriterio
4. **Sistema** automáticamente:
   - Rellena datos del subcriterio (nombre, descripción)
   - **Rellena datos de la única métrica asociada**
   - Muestra mensaje: "✅ Métrica seleccionada: {nombre}"
5. **Usuario** guarda y el sistema crea:
   - Nuevo subcriterio (con nuevo ID)
   - Nueva métrica asociada (con nuevo ID)

### Caso B - Escenario 2: Subcriterio con Múltiples Métricas

1. **Usuario** escribe en el campo "Nombre" del formulario de Subcriterio
2. **Sistema** muestra resultados con badge indicando "N métricas"
3. **Usuario** selecciona el subcriterio
4. **Sistema** rellena datos del subcriterio
5. **Sistema** abre modal: "Este subcriterio tiene las siguientes métricas:"
6. **Usuario** ve lista de métricas con:
   - Nombre y código
   - Descripción
   - Fórmula
   - Umbral
   - Radio button para selección
7. **Usuario** selecciona una métrica y confirma
8. **Sistema** rellena datos de la métrica seleccionada
9. **Usuario** guarda y el sistema crea nuevos registros independientes

### Caso C: Criterio (Simple)

Similar al Caso A, pero solo rellena nombre y descripción del criterio.

## 🗄️ Base de Datos

### Comportamiento al Guardar

```sql
-- INCORRECTO (No crear relaciones)
INSERT INTO metrics (metric_id, ...) VALUES (123, ...);  -- ❌ Reutilizar ID

-- CORRECTO (Crear nuevos registros)
INSERT INTO metrics (name, description, formula, sub_criterion_id, ...)
VALUES ('Nombre Copiado', 'Descripción', 'Formula', {nuevo_sub_id}, ...);
-- ✅ PostgreSQL genera nuevo metric_id
```

**Importante**: 
- No se mantienen los IDs originales
- Cada formulario crea un nuevo registro (INSERT)
- La independencia permite modificar copias sin afectar originales

## 🎨 Estilos y UX

### Autocomplete
- Input con borde que se adapta al estado
- Lista de resultados con sombra y scroll
- Hover y estados highlighted
- Badges para metadata
- Animaciones suaves (transitions)

### Modal de Métricas
- Overlay con backdrop blur
- Animación slide-up
- Cards seleccionables con efecto hover
- Info box con código de color
- Botones de acción con estados

### Variables CSS
```css
--primary-color: #3b82f6
--border-color: #d1d5db
--hover-bg: #f9fafb
--text-primary: #111827
--text-secondary: #6b7280
```

## 🔧 Configuración

### Parámetros Ajustables

**Autocomplete**:
- `minChars`: Mínimo de caracteres para buscar (default: 2)
- `debounceMs`: Tiempo de espera antes de buscar (default: 300ms)
- `maxResults`: En backend, limitar a 10 resultados

**Búsqueda**:
- Actualmente busca solo por `name`
- Podrías extender a buscar en `description` o `code`

## 📝 Ejemplos de Uso

### Integración en Formularios

```tsx
// En MetricFormDrawer.tsx
const [showAutocomplete, setShowAutocomplete] = useState(true);

const handleMetricSelected = (metric: MetricSearchResult) => {
  setFormData({
    name: metric.name,
    description: metric.description || '',
    code: metric.code || '',
    formula: metric.formula || '',
    desired_threshold: metric.desired_threshold || null,
  });
  setShowAutocomplete(false);
};

// En el render
{!metric && showAutocomplete ? (
  <Autocomplete
    value={formData.name}
    onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
    onSelect={handleMetricSelected}
    searchFunction={parameterizationApi.searchMetrics}
    getItemLabel={(item) => item.name}
    ...
  />
) : (
  <input ... />
)}
```

## 🧪 Testing

### Backend
```bash
# Probar endpoint de búsqueda
GET http://localhost:3000/api/parameterization/search/metrics?search=port
Authorization: Bearer {token}

# Respuesta esperada
[
  {
    "metric_id": 123,
    "name": "Portabilidad de Componentes",
    "description": "...",
    "formula": "...",
    ...
  }
]
```

### Frontend
1. Abrir formulario de Métrica
2. Escribir "port" en el campo Nombre
3. Esperar 300ms
4. Verificar que aparece lista de resultados
5. Seleccionar un resultado
6. Verificar que campos se rellenan
7. Guardar y verificar que se crea nuevo registro

## ⚠️ Consideraciones Importantes

1. **No actualizar originales**: Los endpoints de búsqueda son READ-ONLY
2. **Validar permisos**: Solo usuarios con rol 'admin' pueden buscar
3. **Performance**: Limitar resultados a 10 evita sobrecarga
4. **Estado activo**: Solo se buscan registros activos
5. **Jerarquía**: Verificar que padres estén activos también

## 🚀 Próximas Mejoras

- [ ] Búsqueda por código además de nombre
- [ ] Historial de búsquedas recientes
- [ ] Favoritos para reutilización frecuente
- [ ] Vista previa completa antes de aplicar
- [ ] Soporte para copiar múltiples métricas a la vez
- [ ] Analytics de qué registros se reutilizan más

## 📚 Recursos

- [TypeORM ILIKE Operator](https://typeorm.io/#/find-options)
- [React Autocomplete Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [Debouncing in React](https://www.developerway.com/posts/debouncing-in-react)

---

**Fecha de Implementación**: Diciembre 2025  
**Versión**: 1.0.0  
**Autor**: Sistema SQA-Tool
