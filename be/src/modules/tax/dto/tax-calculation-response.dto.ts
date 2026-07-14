import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaxCalculationResponseDto {
  @ApiProperty({ description: 'Annual income in IDR', example: 180000000 })
  annual_income: number;

  @ApiProperty({
    description: 'Non-taxable income (PTKP) in IDR',
    example: 54000000,
  })
  ptkp: number;

  @ApiProperty({ description: 'Annual deductions in IDR', example: 6000000 })
  deductions: number;

  @ApiProperty({ description: 'Taxable income in IDR', example: 120000000 })
  taxable_income: number;

  @ApiProperty({
    description: 'Estimated annual tax in IDR',
    example: 10500000,
  })
  annual_tax: number;

  @ApiProperty({ description: 'Estimated monthly tax in IDR', example: 875000 })
  monthly_tax: number;

  @ApiProperty({
    description: 'Effective tax rate (percentage)',
    example: 5.83,
  })
  effective_rate: number;

  @ApiPropertyOptional({
    description: 'Progressive bracket breakdown',
    example: [
      { bracket: '0 - 60,000,000', rate: 5, taxable: 60000000, tax: 3000000 },
    ],
  })
  brackets: TaxBracketBreakdown[];

  @ApiProperty({
    description: 'Taxpayer type used for calculation',
    example: 'employee',
  })
  type: string;
}

export class TaxBracketBreakdown {
  @ApiProperty({ description: 'Bracket description' })
  bracket: string;

  @ApiProperty({ description: 'Tax rate in percent' })
  rate: number;

  @ApiProperty({ description: 'Taxable amount in this bracket' })
  taxable: number;

  @ApiProperty({ description: 'Tax amount for this bracket' })
  tax: number;
}
