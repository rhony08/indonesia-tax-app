import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Consultant ID to create the order for',
    example: 'abc-123',
  })
  @IsString()
  @MinLength(1)
  consultant_id: string;

  @ApiProperty({
    description: 'Type of service',
    example: 'tax_consultation',
  })
  @IsString()
  @MinLength(1)
  service_type: string;

  @ApiProperty({
    description: 'Order amount in IDR',
    example: 150000,
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({
    description: 'Optional consultation ID to link',
  })
  @IsOptional()
  @IsString()
  consultation_id?: string;
}
