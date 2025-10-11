import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/users/services/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/users/entities/user.entity';
import { Role } from '../../src/users/entities/role.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: Repository<User>;
  let roleRepo: Repository<Role>;

  const mockUser: User = { id: 1, name: 'Test', email: 'test@test.com', role: { id: 2, name: 'evaluator' } } as User;
  const mockAdminRole: Role = { id: 1, name: 'admin' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository, 
        },
        {
          provide: getRepositoryToken(Role),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get(getRepositoryToken(User));
    roleRepo = module.get(getRepositoryToken(Role));
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('debería devolver un usuario si se encuentra', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser);
      expect(await service.findOne(1)).toEqual(mockUser);
    });

    it('debería lanzar NotFoundException si el usuario no se encuentra', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRole', () => {
    it('debería actualizar el rol de un usuario correctamente', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(roleRepo, 'findOne').mockResolvedValue(mockAdminRole);
      jest.spyOn(userRepo, 'save').mockResolvedValue({ ...mockUser, role: mockAdminRole });

      const result = await service.updateRole(1, 'admin');

      expect(roleRepo.findOne).toHaveBeenCalledWith({ where: { name: 'admin' } });
      expect(userRepo.save).toHaveBeenCalledWith(expect.objectContaining({ role: mockAdminRole }));
      expect(result.role.name).toEqual('admin');
    });

    it('debería lanzar BadRequestException si el rol no existe', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(roleRepo, 'findOne').mockResolvedValue(null);

      await expect(service.updateRole(1, 'admin')).rejects.toThrow(new BadRequestException('Role admin not found'));
    });
  });
});