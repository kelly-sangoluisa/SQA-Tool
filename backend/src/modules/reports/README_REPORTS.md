# 📈 Módulo de Reportes

Módulo encargado de la generación, visualización y análisis de reportes de evaluación de calidad de software basado en la norma ISO/IEC 25000. Incluye integración con IA (Google Gemini 2.5 Flash) para análisis automatizado de calidad y generación de reportes PDF.

---

## 📂 Estructura Completa del Módulo

### Backend (NestJS)

```
backend/src/modules/reports/
├── reports.module.ts                    # Módulo NestJS (registra controller, services, entities)
├── controllers/
│   └── reports.controller.ts            # Controlador REST con 8 endpoints
├── services/
│   ├── reports.service.ts               # Lógica principal de reportes (493 líneas)
│   └── ai-analysis.service.ts           # Servicio de análisis con IA Gemini (298 líneas)
└── dto/
    ├── evaluation-report.dto.ts         # DTOs: EvaluationReportDto, CriterionResultDto, MetricResultDto, etc. (266 líneas)
    ├── project-summary.dto.ts           # DTO: ProjectSummaryDto (42 líneas)
    └── ai-analysis.dto.ts               # Interfaces: AIAnalysisRequest, AIAnalysisResponse, AIRecommendation (29 líneas)
```

### Frontend (Next.js)

```
frontend/src/
├── api/reports/                         # Capa de comunicación con la API
│   ├── reports.api.ts                   # Funciones de llamada a la API de reportes (62 líneas)
│   ├── reports.types.ts                 # Tipos TypeScript para reportes (127 líneas)
│   ├── ai-analysis.api.ts               # Función para generar análisis con IA (8 líneas)
│   └── ai-analysis.types.ts             # Tipos para análisis con IA (25 líneas)
├── components/reports/                  # Componentes React de visualización
│   ├── AIAnalysisDisplay.tsx            # Visualización de análisis IA con secciones colapsables (340 líneas)
│   ├── ChartsSection.tsx                # Gráficos de barras, dona y gauge de puntuación (293 líneas)
│   ├── CriterionAccordion.tsx           # Acordeón expandible con detalles de métricas y variables (167 líneas)
│   ├── CriterionCard.tsx                # Tarjeta resumen de criterio con métricas (86 líneas)
│   ├── EvaluationCard.tsx               # Tarjeta de evaluación con link a resultados (69 líneas)
│   ├── ProjectCard.tsx                  # Tarjeta de proyecto con estado y botones de acción (104 líneas)
│   ├── RadarChart.tsx                   # Gráfico radar interactivo con selector de criterios (232 líneas)
│   ├── ScoreGauge.tsx                   # Indicador gauge circular con marcador de umbral (113 líneas)
│   └── StatsOverview.tsx                # Dashboard de estadísticas con tarjetas y barras (138 líneas)
├── app/results/                         # Páginas de visualización de resultados (App Router)
│   ├── page.tsx                         # Página principal: lista de proyectos y evaluaciones
│   ├── [id]/page.tsx                    # Página dinámica: reporte detallado de una evaluación
│   └── project/
│       ├── [projectId]/page.tsx         # Página dinámica: evaluaciones de un proyecto
│       └── [projectId]/report/page.tsx  # Página dinámica: reporte completo del proyecto
├── hooks/shared/
│   └── useAIAnalysis.ts                 # Hook React para gestionar análisis con IA (43 líneas)
├── utils/
│   ├── pdfGenerator.ts                  # Generador de reportes PDF con jsPDF + html2canvas (721 líneas)
│   └── projectPDFGenerator.ts           # Generador de reportes PDF a nivel de proyecto
└── styles/reports/                      # Archivos CSS específicos para componentes de reportes
    ├── ai-analysis-display.css
    ├── charts-section.css
    ├── criterion-accordion.css
    ├── criterion-card.css
    ├── evaluation-card.css
    ├── project-card.css
    ├── radar-chart.css
    ├── score-gauge.css
    └── stats-overview.css
```

---

## 🎯 Responsabilidades

- ✅ Generación de reportes de evaluación individuales y de proyecto
- ✅ Cálculo de estadísticas analíticas (promedios, mejores/peores criterios, puntuación por nivel de importancia)
- ✅ Comparación con umbrales configurables (soporta operadores: `>=`, `>`, `<=`, `<`, `=`)
- ✅ Análisis de calidad automatizado con IA (Google Gemini 2.5 Flash)
- ✅ Visualización de resultados con 9 componentes React reutilizables
- ✅ Generación de reportes PDF profesionales (portada, índice, resumen, detalles, gráficos, conclusión)
- ✅ Gráficos interactivos: barras horizontales, dona, gauge circular, radar
- ✅ Integración completa con módulos de configuración de evaluación y entrada de datos

---

## 🔗 API Endpoints (Backend)

Todos los endpoints requieren autenticación y roles `admin` o `evaluator`.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/reports/my-projects` | Lista todos los proyectos del usuario actual con estado de aprobación |
| `GET` | `/api/reports/my-evaluations` | Lista evaluaciones de los proyectos del usuario actual |
| `GET` | `/api/reports/projects/:projectId/evaluations` | Lista todas las evaluaciones de un proyecto específico |
| `GET` | `/api/reports/evaluations/:evaluationId` | Reporte detallado de una evaluación (criterios, métricas, resultados) |
| `GET` | `/api/reports/evaluations/:evaluationId/stats` | Estadísticas analíticas de una evaluación |
| `GET` | `/api/reports/projects/:projectId/report` | Reporte completo de un proyecto con todas sus evaluaciones |
| `GET` | `/api/reports/projects/:projectId/stats` | Estadísticas analíticas de un proyecto |
| `POST` | `/api/reports/projects/:projectId/ai-analysis` | Genera análisis de calidad con IA para un proyecto |

### Documentación Swagger

Accede a la documentación interactiva en: `http://localhost:3001/api/docs` (desarrollo) o `https://sqa-tool-production.up.railway.app/api/docs` (producción).

---

## 📋 DTOs y Tipos

### Backend DTOs

#### `EvaluationReportDto` - Reporte de Evaluación Individual

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `evaluation_id` | `number` | ID de la evaluación |
| `project_id` | `number` | ID del proyecto |
| `project_name` | `string` | Nombre del proyecto |
| `created_by_name` | `string` | Nombre del creador |
| `project_threshold` | `number \| null` | Umbral mínimo del proyecto |
| `standard_name` | `string` | Nombre del estándar aplicado |
| `created_at` | `Date` | Fecha de creación |
| `final_score` | `number` | Puntuación final (0-10) |
| `meets_threshold` | `boolean` | Indica si cumple con el umbral |
| `conclusion` | `string` | Conclusión de la evaluación |
| `criteria_results` | `CriterionResultDto[]` | Resultados por criterio |

#### `CriterionResultDto` - Resultado por Criterio

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `criterion_name` | `string` | Nombre del criterio |
| `criterion_description` | `string` | Descripción del criterio |
| `importance_level` | `ImportanceLevel` | Nivel: HIGH, MEDIUM, LOW |
| `importance_percentage` | `number` | Porcentaje de importancia |
| `final_score` | `number` | Puntuación final del criterio |
| `metrics` | `MetricResultDto[]` | Métricas asociadas |

#### `MetricResultDto` - Resultado por Métrica

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `metric_code` | `string` | Código de la métrica |
| `metric_name` | `string` | Nombre de la métrica |
| `metric_description` | `string` | Descripción de la métrica |
| `formula` | `string` | Fórmula de cálculo |
| `desired_threshold` | `string \| null` | Umbral deseado |
| `calculated_value` | `number` | Valor calculado |
| `weighted_value` | `number` | Valor ponderado |
| `meets_threshold` | `boolean \| null` | Cumple con el umbral |
| `variables` | `VariableResultDto[]` | Variables utilizadas |

#### `ProjectReportDto` - Reporte de Proyecto Completo

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `project_id` | `number` | ID del proyecto |
| `project_name` | `string` | Nombre del proyecto |
| `project_description` | `string \| null` | Descripción del proyecto |
| `created_by_name` | `string` | Nombre del creador |
| `created_at` | `Date` | Fecha de creación |
| `final_project_score` | `number` | Puntuación final del proyecto |
| `minimum_threshold` | `number` | Umbral mínimo requerido |
| `meets_threshold` | `boolean` | Indica si cumple con el umbral |
| `satisfaction_grade` | `string \| null` | Grado de satisfacción |
| `score_level` | `string \| null` | Nivel de puntuación |
| `status` | `string` | Estado del proyecto |
| `evaluations` | `ProjectEvaluationSummaryDto[]` | Resumen de evaluaciones |

#### `EvaluationStatsDto` - Estadísticas de Evaluación

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `total_criteria` | `number` | Total de criterios evaluados |
| `total_metrics` | `number` | Total de métricas evaluadas |
| `average_criteria_score` | `number` | Promedio de puntuación de criterios |
| `best_criterion` | `{ name: string; score: number }` | Criterio con mayor puntuación |
| `worst_criterion` | `{ name: string; score: number }` | Criterio con menor puntuación |
| `score_by_importance` | `{ high: number; medium: number; low: number }` | Puntuación por nivel de importancia |

#### `ProjectStatsDto` - Estadísticas de Proyecto

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `total_evaluations` | `number` | Total de evaluaciones |
| `completed_evaluations` | `number` | Evaluaciones completadas |
| `average_evaluation_score` | `number` | Promedio de puntuación |
| `highest_evaluation` | `{ standard_name: string; score: number }` | Evaluación con mayor puntuación |
| `lowest_evaluation` | `{ standard_name: string; score: number }` | Evaluación con menor puntuación |

#### `AIAnalysisResponse` - Respuesta del Análisis con IA

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `projectId` | `number` | ID del proyecto analizado |
| `projectName` | `string` | Nombre del proyecto |
| `analisis_general` | `string` | Análisis general de calidad |
| `fortalezas` | `string[]` | Lista de fortalezas identificadas |
| `debilidades` | `string[]` | Lista de debilidades identificadas |
| `recomendaciones` | `AIRecommendation[]` | Recomendaciones priorizadas |
| `riesgos` | `string[]` | Riesgos identificados |
| `proximos_pasos` | `string[]` | Plan de acción con pasos |
| `generatedAt` | `Date` | Fecha de generación |
| `metadata` | `{ score, threshold, meetsThreshold, totalEvaluations }` | Metadata del análisis |

#### `AIRecommendation` - Recomendación Individual

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `prioridad` | `'Alta' \| 'Media' \| 'Baja'` | Prioridad de la recomendación |
| `titulo` | `string` | Título corto y accionable |
| `descripcion` | `string` | Descripción detallada |
| `impacto` | `string` | Impacto estimado |
| `categoria` | `string?` | Categoría (Seguridad, Rendimiento, etc.) |

---

## 🤖 Análisis con IA

El módulo integra **Google Gemini 2.5 Flash** para generar análisis automatizado de calidad de software.

### Configuración

Agregar la variable de entorno en el backend:

```env
GEMINI_API_KEY=tu-api-key-aqui
```

### Funcionamiento

1. El servicio obtiene el reporte y estadísticas del proyecto
2. Construye un prompt contextual con los datos de evaluación
3. Envía la solicitud a Gemini 2.5 Flash con configuración específica (temperature: 0.7, topP: 0.95, maxOutputTokens: 8192)
4. Parsea la respuesta JSON (maneja bloques markdown ```json)
5. Enriquece con metadata del proyecto
6. Maneja errores gracefully (rate limiting, service overload)

### Respuesta de IA

La IA genera:
- **Análisis general**: Evaluación comprensiva del estado de calidad (3-4 párrafos)
- **Fortalezas**: Aspectos positivos con evidencia numérica
- **Debilidades**: Áreas de mejora con impacto medible
- **Recomendaciones**: Acciones priorizadas (Alta/Media/Baja) con categoría e impacto
- **Riesgos**: Riesgos identificados si no se atienden las debilidades
- **Próximos pasos**: Plan de acción a corto, mediano y largo plazo

### Manejo de Errores

| Error | Código | Comportamiento |
|-------|--------|----------------|
| Rate limiting | 429 | Devuelve mensaje amigable sugiriendo reintentar |
| Service overload | 503 | Devuelve análisis de fallback con instrucciones |
| Parse errors | - | Retorna estructura básica con indicación de error |
| API key no configurada | - | Lanza error descriptivo |

### Hook Frontend: `useAIAnalysis`

```typescript
import { useAIAnalysis } from '@/hooks/shared/useAIAnalysis';

const { analysis, loading, error, analyzeProject, clearAnalysis } = useAIAnalysis();

// Ejecutar análisis
await analyzeProject(projectId);

// Limpiar estado
clearAnalysis();
```

---

## 🎨 Componentes Frontend

### Tabla de Componentes

| Componente | Archivo | Props | Descripción |
|------------|---------|-------|-------------|
| **AIAnalysisDisplay** | `AIAnalysisDisplay.tsx` | `analysis: AIAnalysisResponse`, `onClose?: () => void` | Muestra el análisis de IA con secciones colapsables (análisis general, fortalezas, debilidades, recomendaciones con tarjetas por prioridad, riesgos, plan de acción). Incluye badge de metadata con puntuación y estado. |
| **ChartsSection** | `ChartsSection.tsx` | `report: EvaluationReport` | Contiene 3 gráficos: barras horizontales de criterios (con botón "ver más"), gráfico de dona de distribución de importancia, y gauge semicircular de puntuación final. |
| **CriterionAccordion** | `CriterionAccordion.tsx` | `criterion: CriterionResult`, `index: number` | Acordeón expandible que muestra nombre, descripción, importancia, puntuación del criterio y al expandir: grid de métricas con fórmula, variables, valores calculados/ponderados y badge de cumplimiento de umbral. |
| **CriterionCard** | `CriterionCard.tsx` | `criterion: CriterionResult` | Tarjeta resumen de criterio con nombre, badge de importancia, puntuación con gradiente de color, y lista de métricas con valores calculados y ponderados. |
| **EvaluationCard** | `EvaluationCard.tsx` | `evaluation: EvaluationListItem` | Tarjeta de evaluación con nombre del estándar, proyecto, fecha, puntuación con color según score, y botón "Ver Resultados" (link a `/results/:id`) o "Evaluación incompleta" si no tiene resultados. |
| **ProjectCard** | `ProjectCard.tsx` | `project: ProjectSummary` | Tarjeta de proyecto con nombre, descripción, estado (badge con color), fecha, cantidad de evaluaciones, puntuación final, umbral mínimo, y botones "Ver Evaluaciones" y "Ver Resultados". |
| **RadarChart** | `RadarChart.tsx` | `report: EvaluationReport` | Gráfico radar SVG interactivo. Requiere mínimo 3 criterios. Permite seleccionar entre 3 y 6 criterios con chips. Muestra polígono de puntuaciones con grid circular y ejes. |
| **ScoreGauge** | `ScoreGauge.tsx` | `score: number`, `size?: 'small' \| 'medium' \| 'large'`, `showLabel?: boolean`, `threshold?: number \| null` | Gauge circular SVG con progreso animado, marcador de umbral (línea roja), color dinámico (verde/amarillo/rojo) y label (Excelente/Bueno/Necesita mejora). |
| **StatsOverview** | `StatsOverview.tsx` | `stats: EvaluationStats`, `report: EvaluationReport` | Dashboard con 3 tarjetas estadísticas (criterios evaluados, métricas analizadas, promedio general), tarjetas de mejor/peor criterio, barras de puntuación por importancia, y RadarChart integrado. |

### Páginas de Resultados

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/results` | `app/results/page.tsx` | Página principal: lista proyectos y evaluaciones del usuario usando `ProjectCard` y `EvaluationCard`. |
| `/results/[id]` | `app/results/[id]/page.tsx` | Reporte detallado de una evaluación individual. Usa `StatsOverview`, `ChartsSection`, `CriterionAccordion`, y genera PDF con `pdfGenerator.ts`. |
| `/results/project/[projectId]` | `app/results/project/[projectId]/page.tsx` | Lista todas las evaluaciones de un proyecto específico. |
| `/results/project/[projectId]/report` | `app/results/project/[projectId]/report/page.tsx` | Reporte completo del proyecto con todas sus evaluaciones, estadísticas y análisis con IA. |

---

## 📄 Generación de PDF

### `PDFGenerator` Class (`pdfGenerator.ts`)

Genera reportes PDF profesionales con formato A4 usando **jsPDF** y **html2canvas**.

#### Estructura del PDF

| Página | Contenido |
|--------|-----------|
| 1 | **Portada**: Título "INFORME DE EVALUACIÓN", nombre del proyecto, estándar, fecha, puntuación con color |
| 2 | **Índice**: Lista de secciones con números de página |
| 3 | **Resumen Ejecutivo**: 3 tarjetas de métricas (criterios, métricas, promedio), mejor/peor criterio |
| 4+ | **Detalles de Criterios**: Cada criterio con nombre, importancia, descripción, métricas, fórmulas, variables, valores |
| 5+ | **Análisis Gráfico**: Captura de DOM de `.charts-section` y gráfico radar (si existe) |
| 6+ | **Conclusión**: Texto de conclusión y línea de firma del evaluador |

#### Características

- **Paginación automática**: Crea nuevas páginas cuando el contenido excede el espacio
- **Colores dinámicos**: Verde (≥8), Amarillo (≥6), Rojo (<6)
- **Captura de gráficos**: Usa html2canvas para capturar gráficos del DOM
- **Numeración de páginas**: Pie de página en todas las páginas
- **Nombre de archivo**: `Evaluacion_{nombre_proyecto}_{fecha}.pdf`

#### Uso

```typescript
import { generateEvaluationPDF } from '@/utils/pdfGenerator';

await generateEvaluationPDF({
  report: evaluationReport,
  stats: evaluationStats,
  radarImageData: radarCanvas.toDataURL(), // opcional
  includeCertificate: false, // reservado para proyectos
});
```

---

## 📊 Funciones de API Frontend

### `reports.api.ts`

| Función | Parámetros | Retorna | Endpoint |
|---------|------------|---------|----------|
| `getMyProjects()` | - | `Promise<ProjectSummary[]>` | `GET /reports/my-projects` |
| `getMyEvaluations()` | - | `Promise<EvaluationListItem[]>` | `GET /reports/my-evaluations` |
| `getEvaluationsByProject(projectId)` | `number` | `Promise<EvaluationListItem[]>` | `GET /reports/projects/:id/evaluations` |
| `getEvaluationReport(evaluationId)` | `number` | `Promise<EvaluationReport>` | `GET /reports/evaluations/:id` |
| `getEvaluationStats(evaluationId)` | `number` | `Promise<EvaluationStats>` | `GET /reports/evaluations/:id/stats` |
| `getProjectReport(projectId)` | `number` | `Promise<ProjectReport>` | `GET /reports/projects/:id/report` |
| `getProjectStats(projectId)` | `number` | `Promise<ProjectStats>` | `GET /reports/projects/:id/stats` |

### `ai-analysis.api.ts`

| Función | Parámetros | Retorna | Endpoint |
|---------|------------|---------|----------|
| `generateAIAnalysis(projectId)` | `number` | `Promise<AIAnalysisResponse>` | `POST /reports/projects/:id/ai-analysis` |

---

## 🧮 Lógica de Negocio (Backend)

### Comparación con Umbrales

El método `compareWithThreshold()` en `reports.service.ts` soporta múltiples formatos:

| Formato | Ejemplo | Comportamiento |
|---------|---------|----------------|
| Número simple | `0.9` | Compara con `>=` por defecto |
| Operador + número | `>=0.8` | Usa el operador especificado |
| Operadores soportados | `>=`, `>`, `<=`, `<`, `=` | Comparación según operador |

```typescript
private compareWithThreshold(calculatedValue: number, threshold: string): boolean {
  const trimmedThreshold = threshold.trim();
  
  // Número simple: comparar con >=
  if (!isNaN(Number(trimmedThreshold))) {
    return calculatedValue >= Number(trimmedThreshold);
  }
  
  // Parsear expresiones como ">=0.9", ">0.8", etc.
  const match = trimmedThreshold.match(/^(>=|>|<=|<|=)?\s*([0-9.]+)$/);
  if (!match) return false;
  
  const operator = match[1] || '>=';
  const thresholdValue = Number(match[2]);
  
  switch (operator) {
    case '>=': return calculatedValue >= thresholdValue;
    case '>': return calculatedValue > thresholdValue;
    case '<=': return calculatedValue <= thresholdValue;
    case '<': return calculatedValue < thresholdValue;
    case '=': return calculatedValue === thresholdValue;
    default: return false;
  }
}
```

### Cálculo de Estadísticas

- **Promedio de criterios**: `suma(scores) / total_criterios`
- **Mejor/peor criterio**: `reduce()` comparando puntuaciones
- **Puntuación por importancia**: Agrupa por nivel (high/medium/low) y calcula promedio
- **Promedio de evaluaciones**: `suma(scores) / evaluaciones_completadas`

### Conversión de Escalas

Los umbrales se almacenan en escala de 0-100 en la base de datos pero se muestran en escala de 0-10 en el frontend:

```typescript
const threshold = project.minimum_threshold ? Number(project.minimum_threshold) / 10 : null;
```

### Filtro de Evaluaciones

`getEvaluationsByUserId()` filtra solo evaluaciones con estado `IN_PROGRESS`:

```typescript
where: {
  project_id: In(projectIds),
  status: EvaluationStatus.IN_PROGRESS, // Filtro clave
}
```

---

## 🔌 Dependencias del Módulo

### Entidades Utilizadas (Backend)

| Entidad | Origen | Uso |
|---------|--------|-----|
| `Evaluation` | `config-evaluation` | Evaluaciones configuradas |
| `Project` | `config-evaluation` | Proyectos de software |
| `EvaluationResult` | `entry-data` | Resultados de evaluaciones |
| `ProjectResult` | `entry-data` | Resultados de proyectos |
| `EvaluationCriteriaResult` | `entry-data` | Resultados por criterio |
| `EvaluationMetricResult` | `entry-data` | Resultados por métrica |
| `EvaluationCriterion` | `config-evaluation` | Criterios de evaluación |
| `EvaluationMetric` | `config-evaluation` | Métricas de evaluación |
| `EvaluationVariable` | `entry-data` | Variables de evaluación |
| `Standard` | `parameterization` | Estándares ISO/IEC 25000 |
| `Criterion` | `parameterization` | Criterios base |
| `Metric` | `parameterization` | Métricas base |
| `FormulaVariable` | `parameterization` | Variables de fórmulas |
| `User` | `users` | Usuarios del sistema |

### Servicios Externos

| Servicio | Paquete | Uso |
|----------|---------|-----|
| Google Generative AI | `@google/generative-ai` | Análisis con Gemini 2.5 Flash |
| NestJS Config | `@nestjs/config` | Variables de entorno |

### Librerías Frontend

| Librería | Uso |
|----------|-----|
| `jsPDF` | Generación de documentos PDF |
| `html2canvas` | Captura de elementos DOM como imagen |
| `react-icons` | Iconos (FaClipboardList, FaChartBar, FaStar, etc.) |
| `react-icons/hi` | Iconos Heroicons (HiCheckCircle, HiExclamationCircle) |

---

## 🧪 Testing

### Backend

```bash
cd backend
npm run test reports           # Tests del módulo de reportes
npm run test -- --watch        # Modo watch
npm run test:debug             # Con debug
```

### Frontend

```bash
cd frontend
npm run test                   # Ejecutar todos los tests
npm run test -- --watch        # Modo watch
```

---

## 📊 Flujo de Datos Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│                            FRONTEND                                  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Páginas (App Router)                                         │   │
│  │  /results → /results/[id] → /results/project/[id] → report   │   │
│  └────────────────────────┬─────────────────────────────────────┘   │
│                           │                                          │
│  ┌────────────────────────▼─────────────────────────────────────┐   │
│  │  Componentes React                                            │   │
│  │  ┌─────────────┐ ┌──────────────┐ ┌──────────────────────┐   │   │
│  │  │ ProjectCard │ │ EvalCard     │ │ StatsOverview        │   │   │
│  │  └─────────────┘ └──────────────┘ │  └─ RadarChart       │   │   │
│  │  ┌─────────────┐ ┌──────────────┐ │  └─ Barras/Dona/Gauge│   │   │
│  │  │ Criterion   │ │ Criterion    │ │                      │   │   │
│  │  │ Accordion   │ │ Card         │ └──────────────────────┘   │   │
│  │  └─────────────┘ └──────────────┘ ┌──────────────────────┐   │   │
│  │  ┌─────────────┐ ┌──────────────┐ │ ChartsSection        │   │   │
│  │  │ AIAnalysis  │ │ ScoreGauge   │ │ AIAnalysisDisplay    │   │   │
│  │  │ Display     │ │              │ └──────────────────────┘   │   │
│  │  └─────────────┘ └──────────────┘                            │   │
│  └────────────────────────┬─────────────────────────────────────┘   │
│                           │                                          │
│  ┌────────────────────────▼─────────────────────────────────────┐   │
│  │  API Client + Hooks                                           │   │
│  │  reports.api.ts  │  ai-analysis.api.ts  │  useAIAnalysis     │   │
│  └────────────────────────┬─────────────────────────────────────┘   │
│                           │                                          │
│  ┌────────────────────────▼─────────────────────────────────────┐   │
│  │  Utilidades                                                   │   │
│  │  pdfGenerator.ts  │  projectPDFGenerator.ts  │  formatters   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP REST API (fetch)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            BACKEND                                   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ReportsController (8 endpoints)                              │   │
│  │  GET  /my-projects           GET  /projects/:id/evaluations   │   │
│  │  GET  /my-evaluations        GET  /evaluations/:id            │   │
│  │  GET  /projects/:id/report   GET  /evaluations/:id/stats      │   │
│  │  POST /projects/:id/ai-analysis  GET  /projects/:id/stats     │   │
│  └──────────────┬──────────────────────────┬────────────────────┘   │
│                 │                          │                         │
│  ┌──────────────▼──────────┐  ┌───────────▼────────────────────┐   │
│  │  ReportsService          │  │  AIAnalysisService            │   │
│  │  - getProjectsByUserId   │  │  - analyzeProjectQuality()    │   │
│  │  - getEvaluationsByUserId│  │  - buildAnalysisPrompt()      │   │
│  │  - getEvaluationReport   │  │  - parseGeminiResponse()      │   │
│  │  - getProjectReport      │  │  - Manejo de errores          │   │
│  │  - getEvaluationStats    │  │    (429, 503, parse)          │   │
│  │  - getProjectStats       │  │  - Gemini 2.5 Flash API       │   │
│  │  - compareWithThreshold  │  │                               │   │
│  └──────────┬───────────────┘  └───────────────────────────────┘   │
│             │                                                        │
│  ┌──────────▼───────────────────────────────────────────────────┐   │
│  │  TypeORM Repositories (14 entities)                           │   │
│  │  Evaluation, Project, EvaluationResult, ProjectResult,        │   │
│  │  EvaluationCriteriaResult, EvaluationMetricResult,            │   │
│  │  EvaluationCriterion, EvaluationMetric, EvaluationVariable,   │   │
│  │  Standard, Criterion, Metric, FormulaVariable, User           │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Supabase PostgreSQL                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Ejemplos de Uso

### Backend - cURL

```bash
# Obtener reporte de evaluación
curl -X GET http://localhost:3001/api/reports/evaluations/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"

# Generar análisis con IA
curl -X POST http://localhost:3001/api/reports/projects/1/ai-analysis \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### Frontend - TypeScript

```typescript
// Obtener proyectos del usuario
import { getMyProjects, getEvaluationReport } from '@/api/reports/reports.api';
import { generateAIAnalysis } from '@/api/reports/ai-analysis.api';
import { useAIAnalysis } from '@/hooks/shared/useAIAnalysis';
import { generateEvaluationPDF } from '@/utils/pdfGenerator';

// Usar hook de IA
const { analysis, loading, error, analyzeProject } = useAIAnalysis();

// Generar análisis
const result = await analyzeProject(projectId);

// Generar PDF
await generateEvaluationPDF({
  report: await getEvaluationReport(evaluationId),
  stats: evaluationStats,
  radarImageData: radarCanvas.toDataURL(),
});
```

---

## 📝 Notas de Implementación

### Escalas de Puntuación

| Contexto | Escala | Notas |
|----------|--------|-------|
| Base de datos | 0-100 | Almacenamiento |
| Backend DTOs | 0-10 | Conversión automática (`/ 10`) |
| Frontend | 0-10 | Visualización |

### Estados de Evaluación

| Estado | Descripción |
|--------|-------------|
| `IN_PROGRESS` | Evaluación en curso |
| `COMPLETED` | Evaluación completada |
| `CANCELLED` | Evaluación cancelada |

### Niveles de Importancia

| Código | Valor | Color |
|--------|-------|-------|
| `A` | Alta | Rojo (#dc2626) |
| `M` | Media | Amarillo (#f59e0b) |
| `B` | Baja | Azul (#3b82f6) |
| `NA` | No Aplicable | Gris (#6b7280) |

### Colores de Puntuación

| Rango | Color | Label |
|-------|-------|-------|
| ≥ 8 | Verde (#10b981) | Excelente |
| 6 - 7.9 | Amarillo (#f59e0b) | Bueno |
| < 6 | Rojo (#ef4444) | Necesita mejora |

### Prioridades de Recomendaciones IA

| Prioridad | Color | Icono |
|-----------|-------|-------|
| Alta | Rojo (#ef4444) | Warning triangle |
| Media | Amarillo (#f59e0b) | Info circle |
| Baja | Verde (#10b981) | Check circle |

---

## 🔧 Mejoras Futuras

- [ ] Exportación a Excel/CSV
- [ ] Plantillas de reportes personalizables
- [ ] Programación de reportes automáticos
- [ ] Gráficos interactivos con más opciones de visualización
- [ ] Comparación histórica entre evaluaciones
- [ ] Notificaciones de cambios en resultados
- [ ] Dashboard de métricas en tiempo real
- [ ] Certificado de cumplimiento para proyectos aprobados (código preparado, comentado)
- [ ] Soporte para múltiples idiomas en reportes PDF

---

## 📚 Referencias

- [Documentación principal del proyecto](../../../../README.md)
- [Módulo de Configuración de Evaluación](../config-evaluation/README.md)
- [Módulo de Entrada de Datos](../entry-data/README.md)
- [Módulo de Parametrización](../parameterization/README.md)
- [ISO/IEC 25000 - Modelo de Calidad](https://iso25000.com/index.php/en/iso-25000-standards/iso-25010)
- [Google Gemini API](https://ai.google.dev/docs)
- [jsPDF Documentation](https://raw.githack.com/MrRio/jsPDF/master/docs/)
- [html2canvas Documentation](https://html2canvas.hertzen.com/)
