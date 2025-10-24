import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateStandardDto {
  @ApiProperty({ description: 'Nombre del estándar', example: 'ISO/IEC 9126' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Versión del estándar', example: '2001', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  version?: string;

  @ApiProperty({ description: 'Descripción del estándar', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateStandardDto extends PartialType(CreateStandardDto) {}