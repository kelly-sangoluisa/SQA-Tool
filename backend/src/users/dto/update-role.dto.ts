import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsIn, IsString } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Nuevo rol del usuario',
    enum: ['admin', 'evaluator'],
    example: 'evaluator',
  })
  @IsString()
  @IsIn(['admin', 'evaluator'])
  roleName!: 'admin' | 'evaluator';
}
