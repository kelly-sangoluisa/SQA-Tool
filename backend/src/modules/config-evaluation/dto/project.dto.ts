import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsNumber } from 'class-validator';

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

  @ApiProperty({ description: 'ID del usuario creador (obtenido del token)' })
  @IsNumber()
  @IsNotEmpty()
  creator_user_id: number;
}
