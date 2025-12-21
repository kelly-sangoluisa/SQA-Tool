import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsEnum, Max, Min, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ImportanceLevel } from '../entities/evaluation-criterion.entity';

export class CreateEvaluationCriterionDto {
  @ApiProperty({ description: 'ID de la evaluación' })
  @IsNumber()
  @IsNotEmpty()
  evaluation_id: number;

  @ApiProperty({ description: 'ID del criterio' })
  @IsNumber()
  @IsNotEmpty()
  criterion_id: number;

  @ApiProperty({
    description: 'Nivel de importancia del criterio',
    enum: ImportanceLevel,
    example: ImportanceLevel.HIGH
  })
  @IsEnum(ImportanceLevel)
  @IsNotEmpty()
  importance_level: ImportanceLevel;

  @ApiProperty({
    description: 'Porcentaje de importancia (0-100)',
    example: 30.5,
    minimum: 0,
    maximum: 100
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(100)
  @IsNotEmpty()
  importance_percentage: number;
}

export class BulkCreateEvaluationCriteriaDto {
  @ApiProperty({
    description: 'Lista de criterios de evaluación a crear',
    type: [CreateEvaluationCriterionDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateEvaluationCriterionDto)
  criteria: CreateEvaluationCriterionDto[];
}
