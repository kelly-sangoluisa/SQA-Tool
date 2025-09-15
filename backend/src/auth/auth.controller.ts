import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Response, Request } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto, ForgotPasswordDto, RefreshDto, ResetPasswordDto } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiBody, ApiCookieAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

function cookieOpts(config: ConfigService, maxAgeMs?: number) {
  const isProd = config.get('NODE_ENV') === 'production';
  const sameSite = (config.get('COOKIE_SAMESITE') as 'lax' | 'strict' | 'none') ?? (isProd ? 'none' : 'lax');
  const secure = (config.get('COOKIE_SECURE') === 'true') || (isProd && sameSite === 'none');
  const domain = config.get<string>('JWT_COOKIE_DOMAIN') || undefined;
  return {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
    domain,
    ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
  } as const;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly cfg: ConfigService) {}

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Registrar evaluador' })
  @ApiBody({ type: SignUpDto })
  @ApiCreatedResponse({ description: 'Evaluator account created' })
  async signup(@Body() dto: SignUpDto) {
    const user = await this.auth.signUp(dto.email, dto.password, dto.name, dto.redirectTo);
    return { message: 'Evaluator account created', user };
  }

  @Public()
  @Post('signin')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: SignInDto })
  @ApiOkResponse({ description: 'Signed in (cookies seteadas)' })
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
  @ApiOperation({ summary: 'Enviar enlace de reset' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({ description: 'If the email exists, a reset link was sent' })
  async forgot(@Body() dto: ForgotPasswordDto) {
    await this.auth.forgotPassword(dto.email, dto.redirectTo);
    return { message: 'If the email exists, a reset link was sent' };
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refrescar tokens' })
  @ApiBody({ type: RefreshDto })
  @ApiOkResponse({ description: 'Refreshed' })
  async refresh(@Body() dto: RefreshDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const fromCookie = req.headers.cookie?.match(/(?:^|;\s*)sb-refresh-token=([^;]+)/)?.[1];
    const refreshToken = dto.refresh_token ?? (fromCookie ? decodeURIComponent(fromCookie) : undefined);
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

    const tokens = await this.auth.refresh(refreshToken);
    const HOUR = 60 * 60 * 1000;
    const DAYS30 = 30 * 24 * HOUR;
    res.cookie('sb-access-token', tokens.access_token, cookieOpts(this.cfg, HOUR));
    res.cookie('sb-refresh-token', tokens.refresh_token, cookieOpts(this.cfg, DAYS30));
    return { message: 'Refreshed' };
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Aplicar nueva contraseña con access_token del link' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ description: 'Password reset' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.auth.resetPasswordWithAccessToken(dto.access_token, dto.new_password);
    return { message: 'Password reset' };
  }

  @Public()
  @Post('signout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiOkResponse({ schema: { example: { message: 'Signed out' } } })
  async signout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const access = req.headers.cookie?.match(/(?:^|;\s*)sb-access-token=([^;]+)/)?.[1];
    if (access) await this.auth.signOut(decodeURIComponent(access));

    res.clearCookie('sb-access-token', cookieOpts(this.cfg));
    res.clearCookie('sb-refresh-token', cookieOpts(this.cfg));
    res.setHeader('Cache-Control', 'no-store');
    return { message: 'Signed out' };
  }


  @Get('me')
  @ApiOperation({ summary: 'Usuario autenticado actual' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiBearerAuth('bearer')
  @ApiCookieAuth('sb-access-token')
  me(@CurrentUser() user: User) {
    return user;
  }
}
