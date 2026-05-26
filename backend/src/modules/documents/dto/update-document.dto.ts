import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsUrl,
  IsEnum,
} from 'class-validator';
import { Subject, DocumentStatus } from '../../../generated/prisma';

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

  @IsUrl()
  @IsOptional()
  coverImageUrl?: string;

  @IsUrl()
  @IsOptional()
  fileUrl?: string;
}
