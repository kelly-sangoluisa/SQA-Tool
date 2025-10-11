import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UsersModule } from '../users/users.module'; // ✅ Importar UsersModule para UsersService

@Module({
  imports: [
    ConfigModule, 
    TypeOrmModule.forFeature([User, Role]),
    UsersModule, // ✅ Necesario para que SupabaseAuthGuard pueda usar UsersService
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}