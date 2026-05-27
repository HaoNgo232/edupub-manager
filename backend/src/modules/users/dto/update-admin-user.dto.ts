import { IsEmail, IsString, MinLength, MaxLength, IsOptional, ValidateIf } from 'class-validator';

export class UpdateAdminUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  fullName?: string;

  @IsString()
  @ValidateIf((_, value) => value !== undefined && value !== null && value !== '')
  @MaxLength(2048)
  avatarUrl?: string;
}
