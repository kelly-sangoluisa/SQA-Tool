import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

type JwtPayload = {
  sub: string;
  email?: string;
  exp?: number;
  [k: string]: any;
};

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // 1) Permitir rutas públicas con @Public()
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
      const payload = jwt.verify(token, secret, { algorithms: ['HS256'] }) as JwtPayload;
      (request as any).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(req: Request): string | undefined {
    const auth = req.header('authorization');
    if (auth?.startsWith('Bearer ')) return auth.slice(7).trim();

    const cookieHeader = req.headers.cookie ?? '';
    const match = cookieHeader.match(/(?:^|;\s*)sb-access-token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);

    return undefined;
  }
}
