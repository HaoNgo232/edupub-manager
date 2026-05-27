import { IsString, IsOptional, MinLength, MaxLength, ValidateIf } from 'class-validator';

export class UpdateUserDto {
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
