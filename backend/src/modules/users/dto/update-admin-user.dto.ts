import { IsEmail, IsString, MinLength, MaxLength, IsUrl, IsOptional } from 'class-validator';

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
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;
}
