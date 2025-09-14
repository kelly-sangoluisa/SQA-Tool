import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    @InjectRepository(Role) private readonly rolesRepo: Repository<Role>,
  ) {}

  findAll() {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async updateRole(userId: number, roleName: 'admin' | 'evaluator') {
    const user = await this.findOne(userId);
    const role = await this.rolesRepo.findOne({ where: { name: roleName } });

    if (!role) throw new BadRequestException(`Role ${roleName} not found`);

    user.role = role;
    return this.repo.save(user);
  }
}
