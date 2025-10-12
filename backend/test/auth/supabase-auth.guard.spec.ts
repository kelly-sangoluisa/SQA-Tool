import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseAuthGuard } from '../../src/auth/guards/supabase-auth.guard';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../src/users/services/users.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { User } from '../../src/users/entities/user.entity';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

describe('SupabaseAuthGuard', () => {
  let guard: SupabaseAuthGuard;
  let reflector: Reflector;
  let usersService: Partial<UsersService>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseAuthGuard,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-secret') },
        },
        {
          provide: Reflector,
          useValue: { getAllAndOverride: jest.fn() },
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    guard = module.get<SupabaseAuthGuard>(SupabaseAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const createMockContext = (headers: Record<string, string>): ExecutionContext => {
    const request = {
      header: (key: string) => headers[key],
      headers,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  };

  it('debería permitir el acceso a rutas públicas', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const context = createMockContext({});
    
    expect(await guard.canActivate(context)).toBe(true);
  });

  it('debería lanzar UnauthorizedException si no hay token', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const context = createMockContext({});

    await expect(guard.canActivate(context)).rejects.toThrow(new UnauthorizedException('No token provided'));
  });

  it('debería lanzar UnauthorizedException si el token es inválido', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const context = createMockContext({ authorization: 'Bearer invalidtoken' });
    (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('Invalid token'); });

    await expect(guard.canActivate(context)).rejects.toThrow(new UnauthorizedException('Invalid or expired token'));
  });

  it('debería permitir el acceso si el token es válido y adjuntar el usuario a la request', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const context = createMockContext({ authorization: 'Bearer validtoken' });
    const mockPayload = { email: 'user@test.com' };
    const mockUser = new User();
    
    (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
    (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

    const canActivate = await guard.canActivate(context);

    expect(canActivate).toBe(true);
    const request = context.switchToHttp().getRequest();
    expect(request.user).toEqual(mockPayload);
    expect(request.currentUser).toEqual(mockUser);
  });
});