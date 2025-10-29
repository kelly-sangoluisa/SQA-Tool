import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ItemStatus } from '../types/parameterization.types';

export class FindAllQueryDto {
  @ApiPropertyOptional({
    description: "Filtrar por estado: 'active', 'inactive' o 'all'",
    example: 'active',
    default: 'active',
    enum: [ItemStatus.ACTIVE, ItemStatus.INACTIVE, 'all'],
  })
  @IsOptional()
  @IsString()
  @IsIn([ItemStatus.ACTIVE, ItemStatus.INACTIVE, 'all'])
  state?: ItemStatus | 'all' = ItemStatus.ACTIVE;

  @ApiPropertyOptional({
    description: 'Término de búsqueda para filtrar por nombre, descripción, etc.',
    example: 'ISO',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Número de página',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Elementos por página',
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}