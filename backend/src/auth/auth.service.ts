import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { Tokens } from './types/auth.types';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;
  private admin: SupabaseClient;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
  ) {
    const url = this.config.get<string>('SUPABASE_URL')!;
    this.supabase = createClient(url, this.config.get<string>('SUPABASE_ANON_KEY')!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    this.admin = createClient(url, this.config.get<string>('SUPABASE_SERVICE_ROLE')!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async ensureUser(email: string, name?: string, roleName: 'admin' | 'evaluator' = 'evaluator') {
    let user = await this.users.findOne({ where: { email } });
    if (user) return user;

    const role = await this.roles.findOne({ where: { name: roleName } });
    if (!role) {
      throw new BadRequestException(`Role ${roleName} not found in database`);
    }

    user = this.users.create({
      email,
      name: name ?? email.split('@')[0],
      role,
    });
    return this.users.save(user);
  }

  async signUp(email: string, password: string, name: string, redirectTo?: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
    });
    if (error) throw new BadRequestException(error.message);

    await this.ensureUser(email, name, 'evaluator');
    return { id: data.user?.id, email: data.user?.email };
  }

  async signIn(email: string, password: string): Promise<Tokens> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('email not confirmed')) {
        throw new UnauthorizedException('Email not confirmed');
      }
      throw new UnauthorizedException(error.message);
    }
    await this.ensureUser(email);
    return {
      access_token: data.session!.access_token,
      refresh_token: data.session!.refresh_token!,
    };
  }

  async forgotPassword(email: string, redirectTo?: string) {
    const fallback = this.config.get<string>('SUPABASE_RESET_REDIRECT_TO');
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo ?? fallback,
    });
    if (error) throw new BadRequestException(error.message);
    return { ok: true };
  }

  async refresh(refresh_token: string): Promise<Tokens> {
    const { data, error } = await this.supabase.auth.refreshSession({ refresh_token });
    if (error) throw new UnauthorizedException(error.message);
    return {
      access_token: data.session!.access_token,
      refresh_token: data.session!.refresh_token!,
    };
  }

  async updatePasswordByUserId(userId: string, newPassword: string) {
    const { error } = await this.admin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });
    if (error) throw new BadRequestException(error.message);
    return { ok: true };
  }
}
