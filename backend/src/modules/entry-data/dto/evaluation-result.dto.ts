import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsString, MaxLength, Min, Max, IsPositive } from 'class-validator';

export class CreateEvaluationResultDto {
  @ApiProperty({ description: 'ID de la evaluación relacionada' })
  @IsNumber({}, { message: 'El ID de la evaluación debe ser un número' })
  @IsPositive({ message: 'El ID de la evaluación debe ser positivo' })
  @IsNotEmpty({ message: 'El ID de la evaluación es obligatorio' })
  evaluation_id: number;

  @ApiProperty({ 
    description: 'Puntuación final de la evaluación', 
    example: 87.3,
    minimum: 0,
    maximum: 100
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'La puntuación debe ser un número con máximo 2 decimales' })
  @Min(0, { message: 'La puntuación no puede ser negativa' })
  @Max(100, { message: 'La puntuación no puede ser mayor a 100' })
  @IsNotEmpty({ message: 'La puntuación de la evaluación es obligatoria' })
  evaluation_score: number;

  @ApiProperty({ 
    description: 'Conclusiones y observaciones de la evaluación',
    example: 'La evaluación muestra un buen nivel de calidad del software...'
  })
  @IsString({ message: 'La conclusión debe ser una cadena de texto' })
  @MaxLength(2000, { message: 'La conclusión no puede exceder 2000 caracteres' })
  @IsNotEmpty({ message: 'La conclusión es obligatoria' })
  conclusion: string;
}