import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../users/entities/role.entity';
import { Tokens } from '../types/auth.types';

@Injectable()
export class AuthService {
  private readonly supabase: SupabaseClient;
  private readonly admin: SupabaseClient;

  private getSupabaseUrl(): string {
    return this.config.get<string>('SUPABASE_URL')!;
  }

  private getSupabaseAnonKey(): string {
    return this.config.get<string>('SUPABASE_ANON_KEY')!;
  }

  private getSupabaseServiceRole(): string {
    return this.config.get<string>('SUPABASE_SERVICE_ROLE')!;
  }

  private createSupabaseClientWithToken(token: string): SupabaseClient {
    return createClient(this.getSupabaseUrl(), this.getSupabaseAnonKey(), {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  private handleError(error: any, ExceptionType: any = BadRequestException) {
    if (error) throw new ExceptionType(error.message);
  }

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
  ) {
    const url = this.getSupabaseUrl();
    this.supabase = createClient(url, this.getSupabaseAnonKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    this.admin = createClient(url, this.getSupabaseServiceRole(), {
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
    this.handleError(error);
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
      this.handleError(error, UnauthorizedException);
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
    this.handleError(error);
    return { ok: true };
  }

  async refresh(refresh_token: string): Promise<Tokens> {
    const { data, error } = await this.supabase.auth.refreshSession({ refresh_token });
    this.handleError(error, UnauthorizedException);
    return {
      access_token: data.session!.access_token,
      refresh_token: data.session!.refresh_token!,
    };
  }

  async resetPasswordWithAccessToken(accessToken: string, newPassword: string) {
        
    // Verificar el token y extraer el user_id
    const secret = this.config.get<string>('SUPABASE_JWT_SECRET');
    if (!secret) {
      throw new BadRequestException('JWT secret not configured');
    }

    try {
      const jwt = require('jsonwebtoken');
      const payload = jwt.verify(accessToken, secret, { algorithms: ['HS256'] }) as any;
      
      console.log('[Reset Password] Token verificado, user_id:', payload.sub);
      
      // Verificar que sea un token de tipo recovery
      if (payload.aud !== 'authenticated') {
        throw new BadRequestException('Invalid token type');
      }

      // Usar el Admin client para actualizar la contraseña
      const { data, error } = await this.admin.auth.admin.updateUserById(
        payload.sub,
        { password: newPassword }
      );

      console.log('[Reset Password] Resultado de updateUserById:', {
        hasData: !!data,
        hasError: !!error,
        errorMessage: error?.message
      });

      if (error) {
        console.error('[Reset Password] Error en updateUserById:', error);
        throw new BadRequestException(error.message || 'Failed to update password');
      }

      console.log('[Reset Password] ✅ Contraseña actualizada exitosamente');
    } catch (err: any) {
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        throw new BadRequestException('Invalid or expired recovery token');
      }
      const errorMessage = err instanceof Error ? err.message : String(err);
      throw new Error(errorMessage);
    }
  }

  async signOut(accessToken: string) {
    const client = this.createSupabaseClientWithToken(accessToken);
    await client.auth.signOut();
  }
}