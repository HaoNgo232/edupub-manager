import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminStatsQueryDto {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(20)
  recentLimit?: number = 5;
}
