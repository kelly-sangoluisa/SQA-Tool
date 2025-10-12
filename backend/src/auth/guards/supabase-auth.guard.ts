import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { UsersService } from '../../users/services/users.service';
import { ISupabaseJwtPayload } from '../types/auth.types';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('No token provided');

    const secret = this.configService.get<string>('SUPABASE_JWT_SECRET');
    if (!secret) throw new UnauthorizedException('JWT secret not configured');

    try {
      const payload = jwt.verify(token, secret, { algorithms: ['HS256'] }) as ISupabaseJwtPayload;
      (request as any).user = payload;

      if (payload?.email) {
        (request as any).currentUser = await this.users.findByEmail(payload.email);
      }

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(req: Request): string | undefined {
    const h = req.header('authorization');
    if (h?.startsWith('Bearer ')) return h.slice(7).trim();

    const safe = req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS';
    if (safe) {
      const m = req.headers.cookie?.match(/(?:^|;\s*)sb-access-token=([^;]+)/);
      if (m) return decodeURIComponent(m[1]);
    }
    return undefined;
  }
}