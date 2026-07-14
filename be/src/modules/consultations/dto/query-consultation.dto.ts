import {
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryConsultationDto {
  @ApiPropertyOptional({
    enum: ['pending', 'active', 'completed', 'cancelled'],
    description: 'Filter by consultation status',
  })
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'active', 'completed', 'cancelled'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    default: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 10,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
