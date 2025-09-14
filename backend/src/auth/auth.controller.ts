import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Response, Request } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto, ForgotPasswordDto, RefreshDto } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';

function cookieOpts(config: ConfigService, maxAgeMs?: number) {
  const isProd = config.get('NODE_ENV') === 'production';
  const domain = config.get<string>('JWT_COOKIE_DOMAIN') || undefined;
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'lax' : 'lax',
    path: '/',
    domain,
    ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
  } as const;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly cfg: ConfigService) {}

  @Public()
  @Post('signup')
  async signup(@Body() dto: SignUpDto) {
    const user = await this.auth.signUp(dto.email, dto.password, dto.name);
    return { message: 'Evaluator account created', user };
  }

  @Public()
  @Post('signin')
  async signin(@Body() dto: SignInDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.auth.signIn(dto.email, dto.password);
    const HOUR = 60 * 60 * 1000;
    const DAYS30 = 30 * 24 * HOUR;
    res.cookie('sb-access-token', tokens.access_token, cookieOpts(this.cfg, HOUR));
    res.cookie('sb-refresh-token', tokens.refresh_token, cookieOpts(this.cfg, DAYS30));
    return { message: 'Signed in' };
  }

  @Public()
  @Post('forgot-password')
  async forgot(@Body() dto: ForgotPasswordDto) {
    await this.auth.forgotPassword(dto.email, dto.redirectTo);
    return { message: 'Reset email sent' };
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const fromCookie = req.headers.cookie?.match(/(?:^|;\s*)sb-refresh-token=([^;]+)/)?.[1];
    const refreshToken = dto.refresh_token ?? (fromCookie ? decodeURIComponent(fromCookie) : undefined);
    if (!refreshToken) return { message: 'No refresh token' };

    const tokens = await this.auth.refresh(refreshToken);
    const HOUR = 60 * 60 * 1000;
    const DAYS30 = 30 * 24 * HOUR;
    res.cookie('sb-access-token', tokens.access_token, cookieOpts(this.cfg, HOUR));
    res.cookie('sb-refresh-token', tokens.refresh_token, cookieOpts(this.cfg, DAYS30));
    return { message: 'Refreshed' };
  }

  @Post('signout')
  async signout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('sb-access-token', cookieOpts(this.cfg));
    res.clearCookie('sb-refresh-token', cookieOpts(this.cfg));
    return { message: 'Signed out' };
  }

  @Get('me')
  me(@CurrentUser() user: User) {
    return user;
  }
}
