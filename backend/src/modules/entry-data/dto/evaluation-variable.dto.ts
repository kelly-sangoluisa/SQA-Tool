import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, Min, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEvaluationVariableDto {
  @ApiProperty({ description: 'ID de la métrica de evaluación' })
  @IsNumber({}, { message: 'El ID de la métrica debe ser un número' })
  @IsPositive({ message: 'El ID de la métrica debe ser positivo' })
  @IsNotEmpty({ message: 'El ID de la métrica es obligatorio' })
  @Transform(({ value }) => Number(value))
  eval_metric_id: number;

  @ApiProperty({ description: 'ID de la variable de fórmula' })
  @IsNumber({}, { message: 'El ID de la variable debe ser un número' })
  @IsPositive({ message: 'El ID de la variable debe ser positivo' })
  @IsNotEmpty({ message: 'El ID de la variable es obligatorio' })
  @Transform(({ value }) => Number(value))
  variable_id: number;

  @ApiProperty({ 
    description: 'Valor numérico de la variable para el cálculo', 
    example: 85.5
  })
  @IsNumber({ maxDecimalPlaces: 4 }, { message: 'El valor debe ser un número con máximo 4 decimales' })
  @Min(0, { message: 'El valor no puede ser negativo' })
  @IsNotEmpty({ message: 'El valor de la variable es obligatorio' })
  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  value: number;
}