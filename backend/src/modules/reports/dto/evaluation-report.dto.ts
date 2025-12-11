import { ApiProperty } from '@nestjs/swagger';
import { ImportanceLevel } from '../../config-evaluation/entities/evaluation-criterion.entity';

/**
 * DTO para el resultado completo de una evaluación
 * Estructura optimizada para visualización en el frontend
 */
export class EvaluationReportDto {
  @ApiProperty({ description: 'ID de la evaluación' })
  evaluation_id: number;

  @ApiProperty({ description: 'Nombre del proyecto' })
  project_name: string;

  @ApiProperty({ description: 'Nombre del estándar aplicado' })
  standard_name: string;

  @ApiProperty({ description: 'Fecha de creación de la evaluación' })
  created_at: Date;

  @ApiProperty({ description: 'Puntuación final de la evaluación (0-100)' })
  final_score: number;

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
  @ApiProperty({ description: 'Nombre de la métrica' })
  metric_name: string;

  @ApiProperty({ description: 'Valor calculado' })
  calculated_value: number;

  @ApiProperty({ description: 'Valor ponderado' })
  weighted_value: number;

  @ApiProperty({ description: 'Peso de la métrica' })
  weight: number;
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
