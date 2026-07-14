import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderResponseDto {
  @ApiProperty({ description: 'Order ID' })
  id: string;

  @ApiProperty({ description: 'User ID who placed the order' })
  user_id: string;

  @ApiProperty({ description: 'Consultant ID' })
  consultant_id: string;

  @ApiPropertyOptional({ description: 'Linked consultation ID' })
  consultation_id?: string | null;

  @ApiProperty({ description: 'Service type' })
  service_type: string;

  @ApiProperty({ description: 'Order amount in IDR' })
  amount: number;

  @ApiProperty({ description: 'Platform fee in IDR' })
  platform_fee: number;

  @ApiProperty({ description: 'Commission rate (0-1)' })
  commission_rate: number;

  @ApiProperty({
    description: 'Order status',
    enum: ['pending', 'paid', 'completed', 'cancelled', 'refunded'],
  })
  status: string;

  @ApiPropertyOptional({ description: 'Associated payment' })
  payment?: PaymentSummaryDto | null;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: string;
}

export class PaymentSummaryDto {
  @ApiProperty({ description: 'Payment ID' })
  id: string;

  @ApiPropertyOptional({ description: 'Payment method' })
  method?: string | null;

  @ApiPropertyOptional({ description: 'External transaction ID' })
  external_id?: string | null;

  @ApiProperty({
    description: 'Payment status',
    enum: [
      'pending',
      'settlement',
      'capture',
      'deny',
      'cancel',
      'expire',
      'refund',
    ],
  })
  status: string;

  @ApiProperty({ description: 'Payment amount in IDR' })
  amount: number;

  @ApiPropertyOptional({ description: 'Timestamp when payment was made' })
  paid_at?: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: string;
}

export class InitiatePaymentResponseDto {
  @ApiProperty({ description: 'Payment ID' })
  id: string;

  @ApiProperty({ description: 'Order ID' })
  order_id: string;

  @ApiProperty({ description: 'Mock external transaction ID for Midtrans' })
  external_id: string;

  @ApiProperty({ description: 'Payment status' })
  status: string;

  @ApiProperty({ description: 'Payment amount in IDR' })
  amount: number;

  @ApiProperty({ description: 'Payment URL (mock)' })
  payment_url: string;
}
