import { IsNumber, IsString, IsOptional, IsIn, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CalculateTaxDto {
  @ApiProperty({
    description: 'Monthly income in IDR',
    example: 15000000,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  income: number;

  @ApiProperty({
    enum: ['employee', 'freelancer'],
    description: 'Taxpayer type',
    example: 'employee',
  })
  @IsString()
  @IsIn(['employee', 'freelancer'])
  type: string;

  @ApiPropertyOptional({
    description: 'Optional deductions (annual, IDR)',
    example: 6000000,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  deductions?: number;
}
