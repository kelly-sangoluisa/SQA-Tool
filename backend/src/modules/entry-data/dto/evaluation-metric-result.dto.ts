import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsPositive, Min } from 'class-validator';

export class CreateEvaluationMetricResultDto {
  @ApiProperty({ description: 'ID de la métrica de evaluación' })
  @IsNumber({}, { message: 'El ID de la métrica debe ser un número' })
  @IsPositive({ message: 'El ID de la métrica debe ser positivo' })
  @IsNotEmpty({ message: 'El ID de la métrica es obligatorio' })
  eval_metric_id: number;

  @ApiProperty({ 
    description: 'Valor calculado aplicando la fórmula de la métrica', 
    example: 85.7
  })
  @IsNumber({ maxDecimalPlaces: 4 }, { message: 'El valor calculado debe ser un número con máximo 4 decimales' })
  @Min(0, { message: 'El valor calculado no puede ser negativo' })
  @IsNotEmpty({ message: 'El valor calculado es obligatorio' })
  calculated_value: number;
}