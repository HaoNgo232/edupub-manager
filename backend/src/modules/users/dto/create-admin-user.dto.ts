import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsEnum, IsUrl, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateAdminUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  fullName: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @IsString()
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;
}
