import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsNumber, Min, Max } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: 'Nombre del proyecto', example: 'Proyecto de Software A' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Descripción del proyecto', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Umbral mínimo de calidad (%)', example: 70, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minimum_threshold?: number;

  @ApiProperty({ description: 'ID del usuario creador (obtenido del token)' })
  @IsNumber()
  @IsNotEmpty()
  creator_user_id: number;
}
