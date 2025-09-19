import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: Partial<AuthService>;

  beforeEach(async () => {
    authServiceMock = {
      signUp: jest.fn(),
      signIn: jest.fn(),
      refresh: jest.fn(),
      signOut: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(''),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('signin', () => {
    it('debería llamar a auth.signIn y setear las cookies correctamente', async () => {
      const tokens = { access_token: 'at', refresh_token: 'rt' };
      (authServiceMock.signIn as jest.Mock).mockResolvedValue(tokens);

      const res = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.signin({ email: 'test@test.com', password: 'password' }, res);

      expect(authServiceMock.signIn).toHaveBeenCalledWith('test@test.com', 'password');
      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(res.cookie).toHaveBeenCalledWith('sb-access-token', 'at', expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('sb-refresh-token', 'rt', expect.any(Object));
      expect(result).toEqual({ message: 'Signed in' });
    });
  });

  describe('refresh', () => {
    it('debería lanzar un error si no hay refresh token', async () => {
      const req = { headers: {} } as any;
      const res = {} as any;
      
      await expect(controller.refresh({}, req, res)).rejects.toThrow(
        new UnauthorizedException('Missing refresh token'),
      );
    });

    it('debería refrescar los tokens usando el token de la cookie', async () => {
      const tokens = { access_token: 'new-at', refresh_token: 'new-rt' };
      (authServiceMock.refresh as jest.Mock).mockResolvedValue(tokens);

      const req = {
        headers: { cookie: 'sb-refresh-token=old-rt' },
      } as any;
      
      const res = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.refresh({}, req, res);

      expect(authServiceMock.refresh).toHaveBeenCalledWith('old-rt');
      expect(res.cookie).toHaveBeenCalledWith('sb-access-token', 'new-at', expect.any(Object));
      expect(result).toEqual({ message: 'Refreshed' });
    });
  });

  describe('signout', () => {
    it('debería llamar a auth.signOut y limpiar las cookies', async () => {
      (authServiceMock.signOut as jest.Mock).mockResolvedValue(undefined);
      
      const req = {
        headers: { cookie: 'sb-access-token=some-at' },
      } as any;

      const res = {
        clearCookie: jest.fn(),
        setHeader: jest.fn(),
      } as unknown as Response;

      const result = await controller.signout(req, res);
      
      expect(authServiceMock.signOut).toHaveBeenCalledWith('some-at');
      expect(res.clearCookie).toHaveBeenCalledTimes(2);
      expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
      expect(result).toEqual({ message: 'Signed out' });
    });
  });
});