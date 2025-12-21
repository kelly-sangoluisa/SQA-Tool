import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, Min, Max, IsPositive } from 'class-validator';

export class CreateEvaluationCriteriaResultDto {
  @ApiProperty({ description: 'ID del criterio de evaluación' })
  @IsNumber({}, { message: 'El ID del criterio debe ser un número' })
  @IsPositive({ message: 'El ID del criterio debe ser positivo' })
  @IsNotEmpty({ message: 'El ID del criterio es obligatorio' })
  eval_criterion_id: number;

  @ApiProperty({ 
    description: 'Puntuación final del criterio', 
    example: 92.3,
    minimum: 0,
    maximum: 100
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'La puntuación debe ser un número con máximo 2 decimales' })
  @Min(0, { message: 'La puntuación no puede ser negativa' })
  @Max(100, { message: 'La puntuación no puede ser mayor a 100' })
  @IsNotEmpty({ message: 'La puntuación final es obligatoria' })
  final_score: number;
}