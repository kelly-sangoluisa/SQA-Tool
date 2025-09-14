import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class SignInDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(6) password!: string;
}

export class SignUpDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(6) password!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() redirectTo?: string;
}

export class ForgotPasswordDto {
  @IsEmail() email!: string;
  @IsOptional() @IsString() redirectTo?: string;
}

export class RefreshDto {
  @IsOptional() @IsString() refresh_token?: string;
}

