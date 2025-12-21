# Entry Data Module 📊

## Descripción General

El **Entry Data Module** es responsable del procesamiento, cálculo y gestión de datos de evaluación en el sistema SQA-Tool. Este módulo implementa la lógica de negocio para capturar datos del frontend, ejecutar cálculos matemáticos complejos y generar resultados finales de evaluaciones y proyectos.

## 🏗️ Arquitectura 

### Principios Implementados

- **Single Responsibility Principle (SRP)**: Cada servicio tiene una responsabilidad específica
- **Open/Closed Principle (OCP)**: Servicios extensibles sin modificar código existente  
- **Dependency Inversion Principle (DIP)**: Inyección de dependencias con TypeORM
- **Separation of Concerns**: Servicios especializados y controlador coordinador

### Estructura de Servicios Especializados

```
services/
├── formula-evaluation.service.ts     # Evaluación matemática pura
├── threshold-parser.service.ts       # Parseo y clasificación de thresholds
├── metric-scoring.service.ts         # Cálculo de scores según casos de negocio
├── score-classification.service.ts   # Clasificación de niveles y satisfacción
├── evaluation-variable.service.ts    # CRUD de variables
├── evaluation-calculation.service.ts # Orquestación de cálculos
└── entry-data.service.ts            # Servicio coordinador principal
```

## 📁 Estructura del Módulo

```
entry-data/
├── controllers/
│   └── entry-data.controller.ts    # 18 endpoints REST API
├── services/                       # 7 servicios especializados
│   ├── formula-evaluation.service.ts
│   ├── threshold-parser.service.ts
│   ├── metric-scoring.service.ts
│   ├── score-classification.service.ts
│   ├── evaluation-variable.service.ts
│   ├── evaluation-calculation.service.ts
│   └── entry-data.service.ts
├── entities/                      # 5 entidades TypeORM
│   ├── evaluation_variable.entity.ts
│   ├── evaluation_metric_result.entity.ts
│   ├── evaluation_criteria_result.entity.ts
│   ├── evaluation_result.entity.ts
│   └── project_result.entity.ts
├── enums/                        # Enumeraciones
│   └── score-classification.enum.ts
├── dto/                          # DTOs para validación
│   ├── evaluation-variable.dto.ts
│   ├── evaluation-metric-result.dto.ts
│   ├── evaluation-criteria-result.dto.ts
│   ├── evaluation-result.dto.ts
│   └── project-result.dto.ts
├── entry-data.module.ts         # Configuración del módulo
└── README.md                    # Documentación
```

## 🛠️ Servicios Especializados

### 1. FormulaEvaluationService
**Responsabilidad**: Evaluación matemática pura (sin dependencias DB)
```typescript
- evaluateFormula(formula: string, variables: Variable[])
- validateRequiredVariables()
- prepareExpression()
```

### 2. ThresholdParserService
**Responsabilidad**: Parseo y clasificación de thresholds
```typescript
- parseThreshold(threshold: string): ParsedThreshold
- classifyCase(desired: string, worst: string): ThresholdCase
```
**Maneja 8 casos de negocio**:
- SIMPLE_BINARY: `desired=1/0, worst=null`
- RATIO_WITH_MIN_THRESHOLD: `desired=">=10/20min", worst="0/20min"`
- INVERSE_RATIO_WITH_MAX: `desired="0/1min", worst=">=10/1min"`
- TIME_THRESHOLD: `desired="20min", worst=">20 min"`
- ZERO_WITH_MAX_THRESHOLD: `desired="0seg", worst=">=15 seg"`
- PERCENTAGE_WITH_MAX: `desired="0 %", worst=">=10%"`
- NUMERIC_WITH_MAX: `desired="1", worst=">=4"`
- NUMERIC_WITH_MIN: `desired="4", worst="0"`

### 3. MetricScoringService
**Responsabilidad**: Cálculo de scores según casos de negocio
```typescript
- calculateScore(formula, variables, desired, worst): MetricScore
```
**Retorna**: `{ calculated_value, weighted_value }`

### 4. ScoreClassificationService
**Responsabilidad**: Clasificación adaptativa de puntuaciones
```typescript
- calculateScoreLevel(score: number, minimumThreshold: number): ScoreLevel
- calculateSatisfactionGrade(score: number, minimumThreshold: number): SatisfactionGrade
- classifyScore(score: number, minimumThreshold: number): { score_level, satisfaction_grade }
```
**Lógica adaptativa**:
- Convierte `minimum_threshold` (porcentaje 0-100) a escala 0-10
- Calcula rangos dinámicamente basados en el threshold del proyecto
- **Niveles de Puntuación**:
  - `Inaceptable`: score < threshold × 0.34375
  - `Mínimamente Aceptable`: score < threshold × 0.625
  - `Rango Objetivo`: score < threshold × 1.09375
  - `Excede los Requisitos`: score ≥ threshold × 1.09375
- **Grados de Satisfacción**:
  - `Insatisfactorio`: score < threshold × 0.625
  - `Satisfactorio`: score < threshold × 1.09375
  - `Muy Satisfactorio`: score ≥ threshold × 1.09375

### 5. EvaluationVariableService  
**Responsabilidad**: CRUD de variables de evaluación
```typescript
- createOrUpdate(data: CreateEvaluationVariableDto)
- findByEvaluationMetric(metricId: number)
- remove(evalMetricId: number, variableId: number)
```

### 6. EvaluationCalculationService
**Responsabilidad**: Orquestación de cálculos complejos
```typescript
- processEvaluationData()
- calculateMetricResult()
- calculateCriteriaResults()
- calculateEvaluationResult()
- calculateProjectResult()
```

### 7. EntryDataService
**Responsabilidad**: Coordinación principal y gestión de flujo
```typescript
- receiveEvaluationData()
- finalizeEvaluation()
- finalizeProject()
- getEvaluationSummary()
- getProjectCompleteResults()
```

## 🗃️ Entidades TypeORM

### Timestamps Automáticos
Todas las entidades incluyen campos `created_at` y `updated_at` con actualización automática:

```typescript
@CreateDateColumn({ type: 'timestamp' })
created_at: Date;

@UpdateDateColumn({ type: 'timestamp' })
updated_at: Date;
```

### Entidades del Módulo

| Entidad | Propósito | Campos Principales |
|---------|-----------|-------------------|
| `EvaluationVariable` | Variables capturadas del frontend | `eval_metric_id`, `variable_id`, `value` |
| `EvaluationMetricResult` | Resultados calculados de métricas | `calculated_value`, `weighted_value` |
| `EvaluationCriteriaResult` | Resultados de criterios agregados | `final_score`, `eval_criterion_id` |
| `EvaluationResult` | Resultado final de evaluación | `evaluation_score`, `conclusion`, `score_level`, `satisfaction_grade` |
| `ProjectResult` | Resultado final del proyecto | `final_project_score`, `score_level`, `satisfaction_grade` |

### Clasificación Automática de Resultados

Tanto `EvaluationResult` como `ProjectResult` incluyen clasificación automática:

**Campos de Clasificación**:
- `score_level`: Nivel de puntuación (enum `ScoreLevel`)
  - `Inaceptable`
  - `Mínimamente Aceptable`
  - `Rango Objetivo`
  - `Excede los Requisitos`

- `satisfaction_grade`: Grado de satisfacción (enum `SatisfactionGrade`)
  - `Insatisfactorio`
  - `Satisfactorio`
  - `Muy Satisfactorio`

**Cálculo Adaptativo**:
Los rangos se calculan dinámicamente basados en el `minimum_threshold` del proyecto:
- `minimum_threshold` viene en porcentaje (ej: 80 = 80%)
- Se convierte a escala 0-10 para los cálculos
- Los límites se ajustan proporcionalmente al threshold configurado

**Ejemplo**: Para `minimum_threshold = 80%` (8.0 en escala 0-10):
```
Score | Nivel                    | Grado
------|--------------------------|------------------
< 2.75 | Inaceptable             | Insatisfactorio
< 5.0  | Mínimamente Aceptable   | Insatisfactorio  
< 8.75 | Rango Objetivo          | Satisfactorio
≥ 8.75 | Excede los Requisitos   | Muy Satisfactorio
```

## 🌐 API Endpoints (18 endpoints)

### POST Endpoints - Flujo Principal

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/entry-data/evaluations/:id/submit-data` | POST | 📤 Guardar datos de evaluación |
| `/entry-data/evaluations/:id/finalize` | POST | ✅ Finalizar evaluación individual |
| `/entry-data/projects/:id/finalize` | POST | 🚀 Finalizar proyecto completo |

### GET Endpoints - Consulta de Resultados

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/entry-data/evaluations/:id/complete-results` | GET | 📊 Resumen completo de evaluación |
| `/entry-data/projects/:id/complete-results` | GET | 📊 Resultados completos del proyecto |
| `/entry-data/evaluations/:id/evaluation-variables` | GET | 📋 Variables de evaluación |
| `/entry-data/evaluations/:id/metric-results` | GET | 📋 Resultados de métricas |
| `/entry-data/evaluations/:id/criteria-results` | GET | 📋 Resultados de criterios |
| `/entry-data/evaluations/:id/evaluation-results` | GET | 📋 Resultado final de evaluación |
| `/entry-data/projects/:id/project-results` | GET | 📋 Resultado final del proyecto |
| `/entry-data/projects/:id/evaluation-results` | GET | 📋 Todos los resultados de evaluaciones |
| `/entry-data/projects/:id/criteria-results` | GET | 📋 Todos los resultados de criterios |
| `/entry-data/projects/:id/metric-results` | GET | 📋 Todos los resultados de métricas |
| `/entry-data/projects/:id/evaluation-variables` | GET | 📋 Todas las variables del proyecto |

### DELETE Endpoints - Utilidades Administrativas

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/entry-data/evaluations/:id/reset` | DELETE | 🔧 Reiniciar evaluación |
| `/entry-data/variables/:metricId/:variableId` | DELETE | 🔧 Eliminar variable específica |

### Status Endpoints - Información de Progreso

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/entry-data/evaluations/:id/status` | GET | 📊 Estado de la evaluación |
| `/entry-data/projects/:id/progress` | GET | 📊 Progreso del proyecto |

## 🚀 Comandos de Desarrollo

### Construir el Proyecto
```bash
npm run build
```

### Ejecutar Tests
```bash
# Ejecutar todos los tests del módulo
npm test -- --testPathPatterns="entry-data"

# Tests específicos por servicio
npm test -- --testPathPatterns="entry-data.service.spec.ts"
npm test -- --testPathPatterns="evaluation-calculation.service.spec.ts"
npm test -- --testPathPatterns="evaluation-variable.service.spec.ts"
npm test -- --testPathPatterns="formula-evaluation.service.spec.ts"
npm test -- --testPathPatterns="threshold-parser.service.spec.ts"
npm test -- --testPathPatterns="metric-scoring.service.spec.ts"
npm test -- --testPathPatterns="entry-data.controller.spec.ts"

# Tests con coverage
npm run test:cov -- --testPathPatterns="entry-data"
```

### Iniciar Servidor de Desarrollo
```bash
npm run start:dev
```

### Linting y Formateo
```bash
npm run lint
npm run format
```

## 🧪 Cobertura de Tests

### Estadísticas Actuales
- **Total Tests**: 100+ tests ✅
- **Servicios**: 6/6 cubiertos (80+ tests)
- **Controlador**: 1/1 cubierto (19 tests)  
- **Coverage**: 100% endpoints y servicios
- **Ejecución**: ~4.5 segundos

### Tests por Componente

| Componente | Tests | Estado |
|------------|-------|---------|
| `FormulaEvaluationService` | 15 | ✅ PASS |
| `ThresholdParserService` | 18 | ✅ PASS |
| `MetricScoringService` | 16 | ✅ PASS |
| `EvaluationVariableService` | 8 | ✅ PASS |
| `EvaluationCalculationService` | 13 | ✅ PASS |
| `EntryDataService` | 16 | ✅ PASS |
| `EntryDataController` | 19 | ✅ PASS |

## 🔄 Flujo de Procesamiento

### Flujo Completo de Cálculo de Evaluación

```
1. Frontend envía variables
   ↓
2. EntryDataService.receiveEvaluationData()
   ↓
3. EvaluationVariableService.createOrUpdate()
   ↓ (guardar variables en DB)
   
4. EntryDataService.finalizeEvaluation()
   ↓
5. EvaluationCalculationService.calculateMetricResult()
   ├─> ThresholdParserService.classifyCase() (clasifica caso de negocio)
   ├─> MetricScoringService.calculateScore() (calcula según caso)
   │   ├─> FormulaEvaluationService.evaluateFormula()
   │   └─> Retorna { calculated_value, weighted_value }
   └─> Guarda en evaluation_metric_results
   
6. EvaluationCalculationService.calculateCriteriaResults()
   ├─> Promedio de weighted_values por criterio
   ├─> Multiplica por importance_percentage
   └─> Guarda final_score en evaluation_criteria_results
   
7. EvaluationCalculationService.calculateEvaluationResult()
   ├─> SUMA de todos los final_score
   └─> Guarda evaluation_score en evaluation_results
   
8. EntryDataService.finalizeProject()
   ↓
9. EvaluationCalculationService.calculateProjectResult()
   ├─> Promedio de evaluation_scores
   └─> Guarda final_project_score en project_results
```

### Cálculo de Scores Según Casos de Negocio

El sistema maneja **8 casos diferentes** según `desired_threshold` y `worst_case`:

#### Caso 1: SIMPLE_BINARY (`desired="1"`, `worst=null`)
```typescript
calculated_value = evaluar fórmula (ej: 1-(A/B))
weighted_value = calculated_value * 10
```

#### Caso 2: RATIO_WITH_MIN_THRESHOLD (`desired=">=10/20min"`, `worst="0/20min"`)
```typescript
calculated_value = A (informativo)
weighted_value = A >= D ? 10 : (A/D) * 10
```

#### Caso 3: INVERSE_RATIO_WITH_MAX (`desired="0/1min"`, `worst=">=10/1min"`)
```typescript
calculated_value = A (informativo)
weighted_value = A > W ? 0 : (1 - A/W) * 10
```

#### Caso 4: TIME_THRESHOLD (`desired="20min"`, `worst=">20 min"`)
```typescript
calculated_value = evaluar fórmula (ej: B-A)
weighted_value = calculated > W ? 0 : (calculated/D) * 10
```

#### Caso 5: ZERO_WITH_MAX_THRESHOLD (`desired="0seg"`, `worst=">=15 seg"`)
```typescript
calculated_value = evaluar fórmula
weighted_value = calculated > W ? 0 : (1 - calculated/W) * 10
```

#### Caso 6: PERCENTAGE_WITH_MAX (`desired="0 %"`, `worst=">=10%"`)
```typescript
calculated_value = A o evaluar fórmula
weighted_value = {
  calculated >= W → 0
  calculated == 1 → 10
  else → (1 - calculated/W) * 10
}
```

#### Caso 7: NUMERIC_WITH_MAX (`desired="1"`, `worst=">=4"`)
```typescript
calculated_value = A o evaluar fórmula
weighted_value = {
  calculated >= W → 0
  calculated == D → 10
  else → (1 - calculated/W) * 10
}
```

#### Caso 8: NUMERIC_WITH_MIN (`desired="4"`, `worst="0"`)
```typescript
calculated_value = A o evaluar fórmula
weighted_value = {
  calculated == W → 0
  calculated >= D → 10
  else → (calculated/D) * 10
}
```

### Fórmulas de Agregación

```typescript
// final_score (por criterio)
final_score = AVG(weighted_values) × (importance_percentage / 100)

// evaluation_score (por evaluación)
evaluation_score = SUM(final_scores)

// final_project_score (por proyecto)
final_project_score = AVG(evaluation_scores)
```

### 1. Captura de Datos (Frontend → Backend)
```
POST /entry-data/evaluations/:id/submit-data
├── Validación DTO
├── EvaluationVariableService.createOrUpdate()
└── Respuesta: { variables_saved: N }
```

### 2. Finalización de Evaluación
```
POST /entry-data/evaluations/:id/finalize
├── EvaluationCalculationService.calculateMetricResult()
├── EvaluationCalculationService.calculateCriteriaResults() 
├── EvaluationCalculationService.calculateEvaluationResult()
└── Respuesta: { final_score, metric_results, criteria_results }
```

### 3. Finalización de Proyecto
```
POST /entry-data/projects/:id/finalize
├── EvaluationCalculationService.calculateProjectResult()
└── Respuesta: { final_project_score }
```

## 🔐 Seguridad y Autenticación

### Guards Implementados
- **SupabaseAuthGuard**: Autenticación JWT con Supabase
- **RolesGuard**: Autorización basada en roles (`admin`, `evaluator`)

### Decoradores de Seguridad
```typescript
@ApiBearerAuth()              # Swagger auth
@ROLES('admin', 'evaluator')  # Control de acceso
```

## 📝 DTOs y Validación

### Validaciones Implementadas
```typescript
@IsNumber() @IsPositive() @IsNotEmpty()  // Validaciones numéricas
@Min(0) @Max(100)                        // Rangos de valores  
@ApiProperty()                           // Documentación Swagger
```

### DTOs Principales
- `CreateEvaluationVariableDto`: Captura de variables
- `EvaluationResultDto`: Respuestas de resultados
- Validación automática con `class-validator`

## 🚀 Características Destacadas

### ✅ Clean Architecture
- Servicios con responsabilidades únicas
- Inyección de dependencias
- Separación de concerns

### ✅ TypeORM Integration
- Entidades con timestamps automáticos
- Relaciones definidas
- Query builders optimizados

### ✅ Comprehensive Testing
- Unit tests para todos los servicios
- Integration tests para el controlador
- Mocks y spies configurados

### ✅ API Documentation
- Swagger/OpenAPI completa
- Ejemplos de request/response
- Documentación de errores

### ✅ Error Handling
- Excepciones tipadas
- Manejo de casos edge
- Respuestas consistentes

## 🔧 Configuración del Módulo

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([...entities])],
  controllers: [EntryDataController],
  providers: [
    FormulaEvaluationService,     // Evaluación matemática
    EvaluationVariableService,    // CRUD variables
    EvaluationCalculationService, // Orquestación cálculos
    EntryDataService,            // Coordinador principal
  ],
  exports: [...services]
})
export class EntryDataModule {}
```

## 🚀 Para Empezar

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar base de datos**:
   - Verificar entidades en TypeORM
   - Ejecutar migraciones si es necesario

3. **Ejecutar tests**:
   ```bash
   npm test -- --testPathPatterns="entry-data"
   ```

4. **Iniciar desarrollo**:
   ```bash
   npm run start:dev
   ```

5. **Documentación API**:
   - Acceder a `http://localhost:3001/api` para Swagger UI
   - Probar endpoints con datos de ejemplo

---

## 📞 Soporte

Para dudas o problemas con este módulo, revisar:
- Tests unitarios para ejemplos de uso
- Swagger documentation en `/api`
- Logs de la aplicación para debugging