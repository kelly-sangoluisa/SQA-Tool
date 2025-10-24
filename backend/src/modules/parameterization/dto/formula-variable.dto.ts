import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsInt } from 'class-validator';

export class CreateFormulaVariableDto {
  @ApiProperty({ description: 'Símbolo de la variable', example: 'N_EXITO' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  symbol: string;

  @ApiProperty({ description: 'Descripción de la variable', example: 'Número de instalaciones exitosas' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'ID de la métrica a la que pertenece' })
  @IsInt()
  @IsNotEmpty()
  metric_id: number;
}

export class UpdateFormulaVariableDto extends PartialType(CreateFormulaVariableDto) {}