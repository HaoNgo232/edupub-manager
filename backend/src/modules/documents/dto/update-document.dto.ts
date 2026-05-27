import { IsString, MinLength, MaxLength, IsOptional, IsInt, Min, Max, IsEnum, ValidateIf } from 'class-validator';
import { Subject, DocumentStatus } from '@prisma/client';

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsEnum(Subject)
  @IsOptional()
  subject?: Subject;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(12)
  gradeLevel?: number;

  @IsEnum(DocumentStatus)
  @IsOptional()
  status?: DocumentStatus;

  @ValidateIf((_, value) => value !== undefined && value !== null && value !== '')
  @IsString()
  @MaxLength(2048)
  coverImageUrl?: string;

  @ValidateIf((_, value) => value !== undefined && value !== null && value !== '')
  @IsString()
  @MaxLength(2048)
  fileUrl?: string;
}
