import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/users/entities/user.entity';
import { Role } from '../../src/users/entities/role.entity';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

const mockSupabaseClient = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    refreshSession: jest.fn(),
    updateUser: jest.fn(),
    signOut: jest.fn(),
  },
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepoMock: any;
  let roleRepoMock: any;

  const mockRepository = () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'SUPABASE_URL') return 'http://test-url.com';
              if (key === 'SUPABASE_ANON_KEY') return 'test-anon-key';
              if (key === 'SUPABASE_SERVICE_ROLE') return 'test-service-role';
              return null;
            }),
          },
        },
        { provide: getRepositoryToken(User), useValue: mockRepository() },
        { provide: getRepositoryToken(Role), useValue: mockRepository() },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepoMock = module.get(getRepositoryToken(User));
    roleRepoMock = module.get(getRepositoryToken(Role));
  });

  afterEach(() => {
    jest.clearAllMocks(); 
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('debería registrar un usuario y asegurar su existencia en la BD', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: { id: 'uuid', email: 'test@test.com' } },
        error: null,
      });
      const ensureUserSpy = jest.spyOn(service, 'ensureUser').mockResolvedValue(new User());

      const result = await service.signUp('test@test.com', 'password123', 'Test User');

      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
        options: undefined,
      });
      expect(ensureUserSpy).toHaveBeenCalledWith('test@test.com', 'Test User', 'evaluator');
      expect(result).toEqual({ id: 'uuid', email: 'test@test.com' });
    });

    it('debería lanzar un error si Supabase falla', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {},
        error: { message: 'Supabase error' },
      });
      await expect(service.signUp('test@test.com', 'password123', 'Test User')).rejects.toThrow(
        new BadRequestException('Supabase error'),
      );
    });
  });

  describe('signIn', () => {
    it('debería iniciar sesión y devolver tokens', async () => {
      const mockSession = {
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      };
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      const ensureUserSpy = jest.spyOn(service, 'ensureUser').mockResolvedValue(new User());

      const result = await service.signIn('test@test.com', 'password123');
      
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password123' });
      expect(ensureUserSpy).toHaveBeenCalledWith('test@test.com');
      expect(result).toEqual(mockSession);
    });

    it('debería lanzar UnauthorizedException si las credenciales son inválidas', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {},
        error: { message: 'Invalid credentials' },
      });

      await expect(service.signIn('test@test.com', 'wrongpassword')).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
    });
  });

  describe('ensureUser', () => {
    it('debería devolver el usuario si ya existe', async () => {
      const existingUser = { email: 'test@test.com' };
      userRepoMock.findOne.mockResolvedValue(existingUser);

      const result = await service.ensureUser('test@test.com');

      expect(userRepoMock.findOne).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
      expect(result).toBe(existingUser);
      expect(userRepoMock.save).not.toHaveBeenCalled();
    });

    it('debería crear y guardar un nuevo usuario si no existe', async () => {
      const mockRole = { id: 1, name: 'evaluator' };
      const newUser = { email: 'new@test.com', name: 'new', role: mockRole };
      
      userRepoMock.findOne.mockResolvedValue(null);
      roleRepoMock.findOne.mockResolvedValue(mockRole);
      userRepoMock.create.mockReturnValue(newUser);
      userRepoMock.save.mockResolvedValue(newUser);

      const result = await service.ensureUser('new@test.com', 'new', 'evaluator');

      expect(roleRepoMock.findOne).toHaveBeenCalledWith({ where: { name: 'evaluator' } });
      expect(userRepoMock.create).toHaveBeenCalledWith({
        email: 'new@test.com',
        name: 'new',
        role: mockRole,
      });
      expect(userRepoMock.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });
  });
});