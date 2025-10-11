import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ example: 'user@mail.com' })
  @IsEmail() 
  email!: string;

  @ApiProperty({ minLength: 6, example: 'Secret123' })
  @IsString() 
  @MinLength(6) 
  password!: string;
}

export class SignUpDto {
  @ApiProperty({ example: 'user@mail.com' })
  @IsEmail() 
  email!: string;

  @ApiProperty({ minLength: 6, example: 'Secret123' })
  @IsString() 
  @MinLength(6) 
  password!: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString() 
  name!: string;

  @ApiPropertyOptional({ example: 'http://localhost:3000/auth/callback' })
  @IsOptional() 
  @IsString() 
  redirectTo?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@mail.com' })
  @IsEmail() 
  email!: string;

  @ApiPropertyOptional({ example: 'http://localhost:3000/auth/reset' })
  @IsOptional() 
  @IsString() 
  redirectTo?: string;
}

export class RefreshDto {
  @ApiPropertyOptional({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsOptional() 
  @IsString() 
  refresh_token?: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString() 
  access_token!: string;

  @ApiProperty({ minLength: 6, example: 'NewSecret123' })
  @IsString() 
  @MinLength(6) 
  new_password!: string;
}