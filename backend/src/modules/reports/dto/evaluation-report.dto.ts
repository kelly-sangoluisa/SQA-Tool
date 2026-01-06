import { ApiProperty } from '@nestjs/swagger';
import { ImportanceLevel } from '../../config-evaluation/entities/evaluation-criterion.entity';

/**
 * DTO para el resultado completo de una evaluación
 * Estructura optimizada para visualización en el frontend
 */
export class EvaluationReportDto {
  @ApiProperty({ description: 'ID de la evaluación' })
  evaluation_id: number;

  @ApiProperty({ description: 'ID del proyecto' })
  project_id: number;

  @ApiProperty({ description: 'Nombre del proyecto' })
  project_name: string;

  @ApiProperty({ description: 'Nombre del usuario que creó la evaluación' })
  created_by_name: string;

  @ApiProperty({ description: 'Umbral mínimo del proyecto' })
  project_threshold: number | null;

  @ApiProperty({ description: 'Nombre del estándar aplicado' })
  standard_name: string;

  @ApiProperty({ description: 'Fecha de creación de la evaluación' })
  created_at: Date;

  @ApiProperty({ description: 'Puntuación final de la evaluación (0-100)' })
  final_score: number;

  @ApiProperty({ description: 'Indica si cumple con el umbral del proyecto' })
  meets_threshold: boolean;

  @ApiProperty({ description: 'Conclusión de la evaluación' })
  conclusion: string;

  @ApiProperty({ 
    description: 'Resultados por criterio',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        criterion_name: { type: 'string' },
        importance_level: { type: 'string' },
        importance_percentage: { type: 'number' },
        final_score: { type: 'number' },
        metrics: { type: 'array' }
      }
    }
  })
  criteria_results: CriterionResultDto[];
}

export class CriterionResultDto {
  @ApiProperty({ description: 'Nombre del criterio' })
  criterion_name: string;

  @ApiProperty({ description: 'Descripción del criterio' })
  criterion_description: string;

  @ApiProperty({ description: 'Nivel de importancia', enum: ImportanceLevel })
  importance_level: ImportanceLevel;

  @ApiProperty({ description: 'Porcentaje de importancia' })
  importance_percentage: number;

  @ApiProperty({ description: 'Puntuación final del criterio' })
  final_score: number;

  @ApiProperty({ description: 'Métricas asociadas' })
  metrics: MetricResultDto[];
}

export class MetricResultDto {
  @ApiProperty({ description: 'Código de la métrica' })
  metric_code: string;

  @ApiProperty({ description: 'Nombre de la métrica' })
  metric_name: string;

  @ApiProperty({ description: 'Descripción de la métrica' })
  metric_description: string;

  @ApiProperty({ description: 'Fórmula de la métrica' })
  formula: string;

  @ApiProperty({ description: 'Umbral deseado', required: false })
  desired_threshold: string | null;

  @ApiProperty({ description: 'Valor calculado' })
  calculated_value: number;

  @ApiProperty({ description: 'Valor ponderado' })
  weighted_value: number;

  @ApiProperty({ description: 'Cumple con el umbral deseado (null si no hay umbral)', required: false })
  meets_threshold: boolean | null;

  @ApiProperty({ description: 'Variables utilizadas en el cálculo' })
  variables: VariableResultDto[];
}

export class VariableResultDto {
  @ApiProperty({ description: 'Símbolo de la variable' })
  symbol: string;

  @ApiProperty({ description: 'Descripción de la variable' })
  description: string;

  @ApiProperty({ description: 'Valor de la variable' })
  value: number;
}

/**
 * DTO para listar evaluaciones con sus resultados
 */
export class EvaluationListItemDto {
  @ApiProperty({ description: 'ID de la evaluación' })
  evaluation_id: number;

  @ApiProperty({ description: 'ID del proyecto' })
  project_id: number;

  @ApiProperty({ description: 'Nombre del proyecto' })
  project_name: string;

  @ApiProperty({ description: 'Nombre del estándar' })
  standard_name: string;

  @ApiProperty({ description: 'Fecha de creación' })
  created_at: Date;

  @ApiProperty({ description: 'Puntuación final (si existe)' })
  final_score: number | null;

  @ApiProperty({ description: 'Estado de la evaluación' })
  has_results: boolean;

  @ApiProperty({ description: 'Estado del proceso de evaluación' })
  status: string;
}

/**
 * DTO para estadísticas de evaluación
 */
export class EvaluationStatsDto {
  @ApiProperty({ description: 'Total de criterios evaluados' })
  total_criteria: number;

  @ApiProperty({ description: 'Total de métricas evaluadas' })
  total_metrics: number;

  @ApiProperty({ description: 'Promedio de criterios' })
  average_criteria_score: number;

  @ApiProperty({ description: 'Criterio con mayor puntuación' })
  best_criterion: {
    name: string;
    score: number;
  };

  @ApiProperty({ description: 'Criterio con menor puntuación' })
  worst_criterion: {
    name: string;
    score: number;
  };

  @ApiProperty({ description: 'Distribución de puntuaciones por nivel de importancia' })
  score_by_importance: {
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * DTO para el resumen de una evaluación dentro de un proyecto
 */
export class ProjectEvaluationSummaryDto {
  @ApiProperty({ description: 'ID de la evaluación' })
  evaluation_id: number;

  @ApiProperty({ description: 'Nombre del estándar' })
  standard_name: string;

  @ApiProperty({ description: 'Fecha de creación' })
  created_at: Date;

  @ApiProperty({ description: 'Puntuación final de la evaluación' })
  final_score: number;

  @ApiProperty({ description: 'Estado de la evaluación' })
  status: string;

  @ApiProperty({ description: 'Indica si cumple con el umbral de la evaluación' })
  meets_evaluation_threshold: boolean;
}

/**
 * DTO para el reporte completo de un proyecto
 */
export class ProjectReportDto {
  @ApiProperty({ description: 'ID del proyecto' })
  project_id: number;

  @ApiProperty({ description: 'Nombre del proyecto' })
  project_name: string;

  @ApiProperty({ description: 'Descripción del proyecto', required: false })
  project_description: string | null;

  @ApiProperty({ description: 'Nombre del creador' })
  created_by_name: string;

  @ApiProperty({ description: 'Fecha de creación' })
  created_at: Date;

  @ApiProperty({ description: 'Puntuación final del proyecto' })
  final_project_score: number;

  @ApiProperty({ description: 'Umbral mínimo del proyecto' })
  minimum_threshold: number;

  @ApiProperty({ description: 'Indica si cumple con el umbral del proyecto' })
  meets_threshold: boolean;

  @ApiProperty({ description: 'Grado de satisfacción del proyecto', required: false })
  satisfaction_grade: string | null;

  @ApiProperty({ description: 'Nivel de puntuación del proyecto', required: false })
  score_level: string | null;

  @ApiProperty({ description: 'Estado del proyecto' })
  status: string;

  @ApiProperty({ description: 'Evaluaciones del proyecto', type: [ProjectEvaluationSummaryDto] })
  evaluations: ProjectEvaluationSummaryDto[];
}

/**
 * DTO para estadísticas de un proyecto
 */
export class ProjectStatsDto {
  @ApiProperty({ description: 'Total de evaluaciones' })
  total_evaluations: number;

  @ApiProperty({ description: 'Evaluaciones completadas' })
  completed_evaluations: number;

  @ApiProperty({ description: 'Promedio de evaluaciones' })
  average_evaluation_score: number;

  @ApiProperty({ description: 'Evaluación con mayor puntuación' })
  highest_evaluation: {
    standard_name: string;
    score: number;
  };

  @ApiProperty({ description: 'Evaluación con menor puntuación' })
  lowest_evaluation: {
    standard_name: string;
    score: number;
  };
}
