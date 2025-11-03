import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

/**
 * Base DTO para entidades con nombre y descripción
 */
export abstract class BaseNameDescriptionDto {
  @ApiProperty({ description: 'Nombre del elemento' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Descripción del elemento', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * Base DTO para entidades con relación parent-child
 */
export abstract class BaseChildDto extends BaseNameDescriptionDto {
  @ApiProperty({ description: 'ID del elemento padre' })
  @IsNotEmpty()
  abstract parent_id: number;
}