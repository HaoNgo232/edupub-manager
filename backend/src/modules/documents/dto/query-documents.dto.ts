import { IsString, IsOptional, IsInt, Min, Max, IsEnum, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { Subject, DocumentStatus } from '../../../generated/prisma';

export class QueryDocumentsDto {
  @IsString()
  @IsOptional()
  q?: string;

  @IsEnum(Subject)
  @IsOptional()
  subject?: Subject;

  @IsEnum(DocumentStatus)
  @IsOptional()
  status?: DocumentStatus;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(12)
  gradeLevel?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsString()
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'title', 'gradeLevel'])
  sortBy?: string = 'createdAt';

  @IsString()
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
