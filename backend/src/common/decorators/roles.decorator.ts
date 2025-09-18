import { SetMetadata } from '@nestjs/common';

export type RoleName = 'admin' | 'evaluator';
export const ROLES_KEY = 'roles';
export const ROLES = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
