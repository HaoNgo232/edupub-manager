import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsUrl,
  IsEnum,
} from 'class-validator';
import { Subject, DocumentStatus } from '@prisma/client';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsEnum(Subject)
  @IsNotEmpty()
  subject: Subject;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(12)
  gradeLevel: number;

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
