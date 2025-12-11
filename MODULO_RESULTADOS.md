# 📊 Módulo de Resultados - Documentación Completa

## 🎯 Descripción General
Módulo 4 del proyecto SQA Tool desarrollado por **Mateo Espinoza**. Este módulo proporciona una interfaz analítica e intuitiva para visualizar los resultados de las evaluaciones de calidad de software.

## ✨ Características Implementadas

### Backend (/backend/src/modules/reports/)
- ✅ `reports.module.ts` - Módulo NestJS configurado
- ✅ `controllers/reports.controller.ts` - 4 endpoints REST
- ✅ `services/reports.service.ts` - Lógica de consultas
- ✅ `dto/evaluation-report.dto.ts` - DTOs tipados

### Frontend
- ✅ `/src/api/reports/` - Cliente API y tipos
- ✅ `/src/components/reports/` - 4 componentes visuales
- ✅ `/src/app/results/` - 2 páginas (lista y detalle)

## 🔌 Endpoints Disponibles

### 1. GET `/reports/evaluations`
**Descripción**: Lista todas las evaluaciones con información básica  
**Auth**: Requiere Bearer token  
**Roles**: admin, evaluator

**Response**:
```typescript
[
  {
    evaluation_id: 1,
    project_id: 1,
    project_name: "Proyecto X",
    standard_name: "ISO 25010",
    created_at: "2025-12-11T...",
    final_score: 85.5,
    has_results: true
  }
]
```

### 2. GET `/reports/projects/:projectId/evaluations`
**Descripción**: Lista evaluaciones de un proyecto específico  
**Params**: `projectId` (number)  
**Auth**: Requiere Bearer token  
**Roles**: admin, evaluator

### 3. GET `/reports/evaluations/:evaluationId`
**Descripción**: Obtiene reporte completo de una evaluación  
**Params**: `evaluationId` (number)  
**Auth**: Requiere Bearer token  
**Roles**: admin, evaluator

**Response**:
```typescript
{
  evaluation_id: 1,
  project_name: "Proyecto X",
  standard_name: "ISO 25010",
  created_at: "2025-12-11T...",
  final_score: 85.5,
  conclusion: "La evaluación muestra...",
  criteria_results: [
    {
      criterion_name: "Funcionalidad",
      importance_level: "high",
      importance_percentage: 40,
      final_score: 88.3,
      metrics: [
        {
          metric_name: "Completitud",
          calculated_value: 90,
          weighted_value: 36,
          weight: 40
        }
      ]
    }
  ]
}
```

### 4. GET `/reports/evaluations/:evaluationId/stats`
**Descripción**: Obtiene estadísticas analíticas  
**Params**: `evaluationId` (number)  
**Auth**: Requiere Bearer token  
**Roles**: admin, evaluator

**Response**:
```typescript
{
  total_criteria: 8,
  total_metrics: 24,
  average_criteria_score: 83.5,
  best_criterion: {
    name: "Funcionalidad",
    score: 92.1
  },
  worst_criterion: {
    name: "Eficiencia",
    score: 68.5
  },
  score_by_importance: {
    high: 85.2,
    medium: 82.1,
    low: 79.8
  }
}
```

## 🎨 Componentes Frontend

### 1. `EvaluationCard`
**Ubicación**: `/components/reports/EvaluationCard.tsx`  
**Props**:
```typescript
{
  evaluation: EvaluationListItem
}
```
**Características**:
- Muestra información de la evaluación
- Score visual con código de colores
- Botón "Ver Resultados" (si tiene resultados)
- Efecto hover con elevación
- Responsive

### 2. `ScoreGauge`
**Ubicación**: `/components/reports/ScoreGauge.tsx`  
**Props**:
```typescript
{
  score: number;           // 0-100
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}
```
**Características**:
- Medidor circular animado
- Código de colores automático (verde/amarillo/rojo)
- 3 tamaños disponibles
- Etiqueta descriptiva opcional

### 3. `CriterionCard`
**Ubicación**: `/components/reports/CriterionCard.tsx`  
**Props**:
```typescript
{
  criterion: CriterionResult
}
```
**Características**:
- Muestra criterio con sus métricas
- Badge de importancia con color
- Lista expandible de métricas
- Valores calculados y ponderados

### 4. `StatsOverview`
**Ubicación**: `/components/reports/StatsOverview.tsx`  
**Props**:
```typescript
{
  stats: EvaluationStats
}
```
**Características**:
- 3 tarjetas de estadísticas principales
- Comparación mejor/peor criterio
- Barras de progreso por importancia
- Iconos SVG personalizados

## 📱 Páginas

### Página de Listado: `/results`
**Archivo**: `/app/results/page.tsx`

**Funcionalidades**:
- Lista todas las evaluaciones del usuario
- Filtros: Todas / Completadas / Pendientes
- Contador de evaluaciones por estado
- Loading state con spinner
- Error state con retry
- Empty state por filtro
- Grid responsive
- Animaciones de entrada

**Estados**:
- Loading: Muestra spinner
- Error: Muestra mensaje + botón retry
- Empty: Mensaje según filtro activo
- Success: Grid de tarjetas

### Página de Detalle: `/results/[id]`
**Archivo**: `/app/results/[id]/page.tsx`

**Funcionalidades**:
- Vista detallada de una evaluación
- 3 pestañas:
  1. **Resumen**: Conclusión + quick stats + criterios
  2. **Detalles**: Info general + desglose completo
  3. **Estadísticas**: Panel analítico completo
- Medidor de score grande en header
- Botón "Volver"
- Responsive con adaptaciones móviles

## 🎨 Diseño y Estilos

### Paleta de Colores
```css
--color-primary: #4E5EA3
--color-primary-dark: #59469A
--color-primary-light: #7462AA
--color-accent-1: #3D6BA6
--color-accent-5: #1B72A5
```

### Código de Colores para Scores
- **Verde (#10b981)**: Score ≥ 80 - "Excelente"
- **Amarillo (#f59e0b)**: Score 60-79 - "Bueno"
- **Rojo (#ef4444)**: Score < 60 - "Necesita mejora"

### Efectos y Animaciones
- Transiciones suaves (0.3s ease)
- Hover con elevación (-8px translateY)
- Fade in/up/down para entradas
- Spin para loaders
- Barras de progreso animadas (1s cubic-bezier)

## 🔧 Cómo Usar

### 1. Iniciar el Backend
```bash
cd backend
npm run start:dev
```
Servidor en: `http://localhost:3001`

### 2. Iniciar el Frontend
```bash
cd frontend
npm run dev
```
App en: `http://localhost:3000`

### 3. Navegar
1. Login en la aplicación
2. Ir a `/results`
3. Ver lista de evaluaciones
4. Click en "Ver Resultados" de una evaluación completada
5. Explorar las 3 pestañas de análisis

## 🚀 Integración con Otros Módulos

### Relación con otros módulos:
- **Módulo 1 (Parametrización)**: Usa `Standard`, `Criterion`, `Metric`
- **Módulo 2 (Config Evaluación)**: Usa `Project`, `Evaluation`, `EvaluationCriterion`
- **Módulo 3 (Entry Data)**: Usa resultados calculados (`EvaluationResult`, etc.)

### ⚠️ IMPORTANTE:
Este módulo **SOLO CONSULTA** datos. NO calcula nada. Los cálculos son responsabilidad del módulo `entry-data`.

## 🐛 Solución de Problemas

### Error: "No results found"
**Causa**: La evaluación no tiene resultados calculados  
**Solución**: 
1. Verificar que la evaluación esté finalizada
2. Ejecutar endpoint: `POST /entry-data/evaluations/:id/finalize`

### Error de autenticación
**Causa**: Token expirado o inválido  
**Solución**: Hacer login nuevamente

### Estilos no se cargan
**Causa**: Variables CSS no definidas  
**Solución**: 
1. Verificar que `globals.css` tenga las variables
2. Reiniciar el servidor de desarrollo

### Componentes no renderizan
**Causa**: Modo no client  
**Solución**: Verificar que tengan `'use client'` al inicio

## 📊 Datos de Prueba

Para probar el módulo, necesitas:
1. Un proyecto creado
2. Una evaluación configurada
3. Datos de variables ingresados
4. Evaluación finalizada (calcula resultados)

Ejemplo de flujo completo en otro módulo:
```bash
# 1. Crear proyecto
POST /config-evaluation/projects

# 2. Crear evaluación
POST /config-evaluation/evaluations

# 3. Configurar criterios
POST /config-evaluation/evaluation-criteria

# 4. Ingresar datos
POST /entry-data/evaluations/:id/submit-data

# 5. Finalizar (calcula resultados)
POST /entry-data/evaluations/:id/finalize

# 6. Ver resultados (TU MÓDULO)
GET /reports/evaluations/:id
```

## 📈 Mejoras Futuras (Sugerencias)

- [ ] Exportar reporte a PDF
- [ ] Comparar múltiples evaluaciones
- [ ] Gráficos más avanzados (Chart.js, Recharts)
- [ ] Filtros avanzados (por fecha, estándar, score)
- [ ] Búsqueda de evaluaciones
- [ ] Vista de tabla además de cards
- [ ] Modo oscuro
- [ ] Compartir reporte por link

## 👤 Información del Desarrollador

**Desarrollador**: Mateo Espinoza  
**Módulo**: 4 - Resultados  
**Proyecto**: Herramienta de Evaluación de Calidad de Software (SQA Tool)  
**Universidad**: [Tu Universidad]  
**Fecha**: Diciembre 2025  
**Versión**: 1.0.0

## 📞 Soporte

Si tienes dudas sobre este módulo:
1. Revisa esta documentación
2. Revisa el código fuente (está bien comentado)
3. Consulta con el equipo del proyecto

---

**Nota**: Este módulo fue desarrollado siguiendo las mejores prácticas de NestJS, Next.js y TypeScript. El código es limpio, mantenible y escalable.
