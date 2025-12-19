import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

/**
 * DTO para búsqueda de entidades por nombre
 * Usado para el autocompletado inteligente
 */
export class SearchQueryDto {
  @ApiProperty({ 
    description: 'Término de búsqueda (mínimo 2 caracteres)', 
    example: 'portabilidad',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El término de búsqueda debe tener al menos 2 caracteres' })
  search?: string;
}

/**
 * DTO de respuesta para variables de fórmula
 */
export class FormulaVariableSearchResultDto {
  @ApiProperty({ description: 'ID de la variable' })
  variable_id: number;

  @ApiProperty({ description: 'Símbolo de la variable' })
  symbol: string;

  @ApiProperty({ description: 'Descripción de la variable' })
  description: string;
}

/**
 * DTO de respuesta para búsqueda de criterios
 */
export class CriterionSearchResultDto {
  @ApiProperty({ description: 'ID del criterio' })
  criterion_id: number;

  @ApiProperty({ description: 'Nombre del criterio' })
  name: string;

  @ApiProperty({ description: 'Descripción del criterio', required: false })
  description?: string;

  @ApiProperty({ description: 'ID del estándar al que pertenece' })
  standard_id: number;

  @ApiProperty({ description: 'Nombre del estándar' })
  standard_name: string;
}

/**
 * DTO de respuesta para métricas (usado en búsqueda de subcriterios)
 */
export class MetricSearchResultDto {
  @ApiProperty({ description: 'ID de la métrica' })
  metric_id: number;

  @ApiProperty({ description: 'Código de la métrica', required: false })
  code?: string;

  @ApiProperty({ description: 'Nombre de la métrica' })
  name: string;

  @ApiProperty({ description: 'Descripción de la métrica', required: false })
  description?: string;

  @ApiProperty({ description: 'Fórmula de cálculo', required: false })
  formula?: string;

  @ApiProperty({ description: 'Umbral deseado', required: false })
  desired_threshold?: string;

  @ApiProperty({ description: 'Peor caso', required: false })
  worst_case?: string;

  @ApiProperty({ 
    description: 'Variables de fórmula asociadas',
    type: [FormulaVariableSearchResultDto],
    required: false 
  })
  variables?: FormulaVariableSearchResultDto[];
}

/**
 * DTO de respuesta para búsqueda de subcriterios
 * INCLUYE las métricas asociadas para el caso complejo de selección
 */
export class SubCriterionSearchResultDto {
  @ApiProperty({ description: 'ID del subcriterio' })
  sub_criterion_id: number;

  @ApiProperty({ description: 'Nombre del subcriterio' })
  name: string;

  @ApiProperty({ description: 'Descripción del subcriterio', required: false })
  description?: string;

  @ApiProperty({ description: 'ID del criterio al que pertenece' })
  criterion_id: number;

  @ApiProperty({ description: 'Nombre del criterio' })
  criterion_name: string;

  @ApiProperty({ description: 'ID del estándar' })
  standard_id: number;

  @ApiProperty({ description: 'Nombre del estándar' })
  standard_name: string;

  @ApiProperty({ 
    description: 'Métricas asociadas a este subcriterio',
    type: [MetricSearchResultDto]
  })
  metrics: MetricSearchResultDto[];

  @ApiProperty({ description: 'Cantidad de métricas asociadas' })
  metrics_count: number;
}
