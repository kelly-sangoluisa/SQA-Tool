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

type JwtPayload = { email?: string; sub?: string; [k: string]: any };

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
    const jwtPayload = req.user as JwtPayload | undefined;

    if (!jwtPayload?.email) {
      throw new UnauthorizedException('User email not found in token');
    }

    const user = await this.usersService.findByEmail(jwtPayload.email);
    if (!user) throw new ForbiddenException('User not registered');
    if (!user.role?.name) throw new ForbiddenException('User without role');

    if (!requiredRoles.includes(user.role.name as RoleName)) {
      throw new ForbiddenException('Insufficient role');
    }

    req.currentUser = user;
    return true;
  }
}
