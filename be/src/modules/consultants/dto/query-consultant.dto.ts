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

export class QueryConsultantDto {
  @ApiPropertyOptional({
    description: 'Filter by specialization',
    example: 'PPH',
  })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({
    enum: ['A', 'B', 'C'],
    description: 'Filter by certification level',
  })
  @IsOptional()
  @IsString()
  @IsIn(['A', 'B', 'C'])
  cert_level?: string;

  @ApiPropertyOptional({ description: 'Minimum rating filter', type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  min_rating?: number;

  @ApiPropertyOptional({ description: 'Maximum rating filter', type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  max_rating?: number;

  @ApiPropertyOptional({
    description: 'Minimum price per session (IDR)',
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_price?: number;

  @ApiPropertyOptional({
    description: 'Maximum price per session (IDR)',
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_price?: number;

  @ApiPropertyOptional({
    description: 'Filter by online status',
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  is_online?: boolean;

  @ApiPropertyOptional({ description: 'Search by consultant name' })
  @IsOptional()
  @IsString()
  search?: string;

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

  @ApiPropertyOptional({
    enum: ['rating', 'price', 'sessions'],
    description: 'Sort field',
    default: 'rating',
  })
  @IsOptional()
  @IsString()
  @IsIn(['rating', 'price', 'sessions'])
  sort_by?: string = 'rating';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    description: 'Sort order',
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sort_order?: string = 'desc';
}
