import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, RoleName } from '../decorators/roles.decorator';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';
import { ISupabaseJwtPayload } from 'src/auth/types/auth.types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const requiredRoles =
      this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]) ?? [];

    if (requiredRoles.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    
    let user: User | null = (req.currentUser as User | undefined) ?? null;
    
    if (!user) {
      const jwtPayload = req.user as ISupabaseJwtPayload | undefined;
      const email = jwtPayload?.email;
      if (!email) throw new UnauthorizedException('User email not found in token');

      const dbUser = await this.usersService.findByEmail(email); 
      if (!dbUser) throw new ForbiddenException('User not registered');

      user = dbUser;
    }

    if (!user.role?.name) throw new ForbiddenException('User without role');

    if (!requiredRoles.includes(user.role.name as RoleName)) {
      throw new ForbiddenException('Insufficient role');
    }

    req.currentUser = user;
    return true;
  }
}
