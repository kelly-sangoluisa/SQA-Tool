import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, Min, Max, IsPositive } from 'class-validator';

export class CreateProjectResultDto {
  @ApiProperty({ description: 'ID del proyecto' })
  @IsNumber({}, { message: 'El ID del proyecto debe ser un número' })
  @IsPositive({ message: 'El ID del proyecto debe ser positivo' })
  @IsNotEmpty({ message: 'El ID del proyecto es obligatorio' })
  project_id: number;

  @ApiProperty({ 
    description: 'Puntuación final consolidada del proyecto', 
    example: 87.5,
    minimum: 0,
    maximum: 100
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'La puntuación debe ser un número con máximo 2 decimales' })
  @Min(0, { message: 'La puntuación no puede ser negativa' })
  @Max(100, { message: 'La puntuación no puede ser mayor a 100' })
  @IsNotEmpty({ message: 'La puntuación final del proyecto es obligatoria' })
  final_project_score: number;
}