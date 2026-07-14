import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentCallbackDto {
  @ApiProperty({
    description: 'Order ID from Midtrans',
    example: 'abc-123',
  })
  @IsString()
  order_id: string;

  @ApiProperty({
    description: 'Transaction status from Midtrans',
    enum: [
      'pending',
      'settlement',
      'capture',
      'deny',
      'cancel',
      'expire',
      'refund',
    ],
    example: 'settlement',
  })
  @IsString()
  @IsIn([
    'pending',
    'settlement',
    'capture',
    'deny',
    'cancel',
    'expire',
    'refund',
  ])
  transaction_status: string;

  @ApiProperty({
    description: 'Fraud status from Midtrans',
    enum: ['accept', 'deny', 'challenge'],
    example: 'accept',
  })
  @IsString()
  @IsIn(['accept', 'deny', 'challenge'])
  fraud_status: string;

  @ApiPropertyOptional({
    description: 'Payment method used',
    example: 'bank_transfer',
  })
  @IsOptional()
  @IsString()
  payment_type?: string;

  @ApiProperty({
    description: 'Gross amount from Midtrans',
    example: '150000.00',
  })
  @IsString()
  gross_amount: string;
}
