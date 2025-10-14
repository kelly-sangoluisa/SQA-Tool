import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsInt } from 'class-validator';

export class CreateCriterionDto {
  @ApiProperty({ description: 'Nombre del criterio', example: 'Portabilidad' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Descripción del criterio', required: false })
  @IsOptional()
  @IsString()
  description?: string;
  
  @ApiProperty({ description: 'ID del estándar al que pertenece' })
  @IsInt()
  @IsNotEmpty()
  standardId: number;
}

export class UpdateCriterionDto extends PartialType(CreateCriterionDto) {}