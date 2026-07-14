import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  Min,
  IsIn,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConsultantDto {
  @ApiProperty({ enum: ['A', 'B', 'C'], description: 'Certification level' })
  @IsString()
  @IsIn(['A', 'B', 'C'])
  cert_level: string;

  @ApiProperty({ description: 'Certification number' })
  @IsString()
  @MinLength(1)
  cert_number: string;

  @ApiPropertyOptional({
    description: 'Practice license number (izin praktik)',
  })
  @IsOptional()
  @IsString()
  izin_praktik?: string;

  @ApiProperty({
    description: 'List of specializations',
    type: [String],
    example: ['PPH', 'PPN'],
  })
  @IsArray()
  @IsString({ each: true })
  specializations: string[];

  @ApiPropertyOptional({ description: 'Consultant bio' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @ApiPropertyOptional({
    description: 'Price per consultation session (IDR)',
    default: 100000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price_per_session?: number;
}
