import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ItemStatus } from '../types/parameterization.types';

export class UpdateStateDto {
  @ApiProperty({
    description: "El nuevo estado para el ítem: 'active' o 'inactive'",
    example: ItemStatus.INACTIVE,
    enum: ItemStatus,
  })
  @IsNotEmpty()
  @IsEnum(ItemStatus)
  state: ItemStatus;
}