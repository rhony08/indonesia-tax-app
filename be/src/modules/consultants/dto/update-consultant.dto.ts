import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  Min,
  IsIn,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConsultantDto {
  @ApiPropertyOptional({
    enum: ['A', 'B', 'C'],
    description: 'Certification level',
  })
  @IsOptional()
  @IsString()
  @IsIn(['A', 'B', 'C'])
  cert_level?: string;

  @ApiPropertyOptional({ description: 'Certification number' })
  @IsOptional()
  @IsString()
  cert_number?: string;

  @ApiPropertyOptional({
    description: 'Practice license number (izin praktik)',
  })
  @IsOptional()
  @IsString()
  izin_praktik?: string;

  @ApiPropertyOptional({
    description: 'List of specializations',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializations?: string[];

  @ApiPropertyOptional({ description: 'Consultant bio' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @ApiPropertyOptional({ description: 'Price per consultation session (IDR)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price_per_session?: number;

  @ApiPropertyOptional({ description: 'Online availability status' })
  @IsOptional()
  is_online?: boolean;
}
