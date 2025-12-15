import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEvaluationMetricDto {
  @ApiProperty({ description: 'ID del criterio de evaluación (evaluation_criteria)' })
  @IsNumber()
  @IsNotEmpty()
  eval_criterion_id: number;

  @ApiProperty({ description: 'ID de la métrica' })
  @IsNumber()
  @IsNotEmpty()
  metric_id: number;
}

export class BulkCreateEvaluationMetricsDto {
  @ApiProperty({
    description: 'Lista de métricas de evaluación a crear',
    type: [CreateEvaluationMetricDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateEvaluationMetricDto)
  metrics: CreateEvaluationMetricDto[];
}
