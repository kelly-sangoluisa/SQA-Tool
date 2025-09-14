import { IsIn, IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  @IsIn(['admin', 'evaluator'])
  roleName!: 'admin' | 'evaluator';
}
